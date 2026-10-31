import { apiUrl, fetchWithAuth } from "@/lib/api/client";

export type UserRole = "investor" | "architect";

export interface RegisterPayload {
  role: UserRole;
  email: string;
  password: string;
  remember_me: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
  remember_me: boolean;
}

export interface GoogleAuthPayload {
  credential: string;
  role: UserRole;
  remember_me: boolean;
}

export interface UserInfo {
  id: string;
  email: string;
  role: UserRole | string;
  status: string;
}

export interface CurrentUserInfo {
  id?: string;
  email?: string;
  role: UserRole | string;
  status: string;
}

export interface AuthResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  is_new_user?: boolean;
  user?: UserInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const body = data as Record<string, unknown>;
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail) && body.detail[0] && typeof body.detail[0] === "object" && "msg" in body.detail[0]) {
    const message = (body.detail[0] as { msg?: unknown }).msg;
    if (typeof message === "string") return message;
  }
  if (typeof body.message === "string") return body.message;
  if (body.error && typeof body.error === "object" && "message" in body.error) {
    const message = (body.error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

function persistAuthSession(data: AuthResponse, role: UserRole, rememberMe: boolean) {
  if (typeof window === "undefined") return;
  // Prefer the backend's HttpOnly refresh cookie. Keep only the short-lived access token
  // when the API contract requires bearer authorization from the browser.
  if (data.access_token) localStorage.setItem("vve-access-token", data.access_token);
  if (data.user) localStorage.setItem("vve-user", JSON.stringify(data.user));
  const resolvedRole = data.user?.role === "architect" ? "architect" : data.user?.role === "investor" ? "investor" : role;
  localStorage.setItem("vve-role", resolvedRole);
  const userStatus = data.user?.status?.toLowerCase();
  localStorage.setItem("vve-stage", userStatus === "verified" || userStatus === "active" ? "verified" : "applied");
  localStorage.setItem("vve-remember-me", String(rememberMe));
  window.dispatchEvent(new Event("storage"));
}

async function postAuth<T>(path: string, payload: unknown, fallback: string): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { success: false, data: null, error: getErrorMessage(data, fallback) };
    return { success: true, data: data as T, error: null };
  } catch (error) {
    const message = error instanceof DOMException && error.name === "AbortError"
      ? "The request timed out. Please try again."
      : "Could not reach the authentication service. Please try again.";
    return { success: false, data: null, error: message };
  } finally {
    window.clearTimeout(timeout);
  }
}

export function saveRegistrationData(payload: RegisterPayload): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("vve-registration-data", JSON.stringify(payload));
  localStorage.setItem("vve-role", payload.role);
  localStorage.setItem("vve-email", payload.email);
  localStorage.setItem("vve-remember-me", String(payload.remember_me));
}

/** Reads the saved signup role for onboarding without restoring credentials to storage. */
export function getStoredRegistrationData(): Pick<RegisterPayload, "role"> | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("vve-role");
  return role === "investor" || role === "architect" ? { role } : null;
}

export async function registerUser(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
  const result = await postAuth<AuthResponse>("/api/v1/auth/register", payload, "Registration failed. Please check your details.");
  if (result.success && result.data) persistAuthSession(result.data, payload.role, payload.remember_me);
  return result;
}

export async function loginUser(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
  const result = await postAuth<AuthResponse>("/api/v1/auth/login", payload, "Sign in failed. Check your email and password.");
  if (result.success && result.data) persistAuthSession(result.data, payload.role, payload.remember_me);
  return result;
}

export async function authenticateWithGoogle(payload: GoogleAuthPayload): Promise<ApiResponse<AuthResponse>> {
  const result = await postAuth<AuthResponse>("/api/v1/auth/google", payload, "Google sign-in failed.");
  if (result.success && result.data) persistAuthSession(result.data, payload.role, payload.remember_me);
  return result;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  new_password: string;
  code?: string;
  token?: string;
}

export interface ForgotPasswordResponse {
  message: string;
  provider?: string;
  dev_link?: string;
}

export async function requestPasswordReset(payload: ForgotPasswordPayload): Promise<ApiResponse<ForgotPasswordResponse>> {
  return postAuth<ForgotPasswordResponse>(
    "/api/v1/auth/forgot-password",
    payload,
    "Could not send reset instructions. Please check your email."
  );
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<{ message: string }>> {
  return postAuth<{ message: string }>(
    "/api/v1/auth/reset-password",
    payload,
    "Could not reset password. Please check your details."
  );
}

/** Returns the authenticated user's backend-authoritative role and account status. */
export async function getCurrentUser(): Promise<CurrentUserInfo> {
  const response = await fetchWithAuth("/api/v1/users/me", { method: "GET", headers: { Accept: "application/json" } });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getErrorMessage(body, "Could not load your account."));

  if (!body || typeof body !== "object") throw new Error("The account service returned an unexpected response.");
  const root = body as Record<string, unknown>;
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : root;
  const candidate = data.user && typeof data.user === "object" ? data.user as Record<string, unknown> : data;
  const role = typeof candidate.role === "string" ? candidate.role : "";
  const status = typeof candidate.status === "string"
    ? candidate.status
    : typeof data.user_status === "string" ? data.user_status
      : typeof root.user_status === "string" ? root.user_status : "";
  if (!role || !status) throw new Error("The account service did not return a role and account status.");

  return {
    id: typeof candidate.id === "string" ? candidate.id : undefined,
    email: typeof candidate.email === "string" ? candidate.email : undefined,
    role,
    status,
  };
}
