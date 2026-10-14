export interface RegisterPayload {
  role: "investor" | "architect";
  email: string;
  password: string;
  remember_me: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: "investor" | "architect";
  remember_me: boolean;
}

export interface UserInfo {
  id: string;
  email: string;
  role: "investor" | "architect" | string;
  status: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  user?: UserInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  isOffline?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Stores the user registration dictionary in browser storage
 */
export function saveRegistrationData(payload: RegisterPayload): void {
  if (typeof window === "undefined") return;

  // Store the complete dictionary exactly as specified
  localStorage.setItem("vve-registration-data", JSON.stringify(payload));
  localStorage.setItem("vve-role", payload.role);
  localStorage.setItem("vve-email", payload.email);
  localStorage.setItem("vve-stage", "applied");
  localStorage.setItem("vve-remember-me", String(payload.remember_me));
}

/**
 * Retrieves the stored registration dictionary from browser storage
 */
export function getStoredRegistrationData(): RegisterPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("vve-registration-data");
    if (!raw) return null;
    return JSON.parse(raw) as RegisterPayload;
  } catch {
    return null;
  }
}

/**
 * Sends registration dictionary payload to backend API (POST /api/v1/auth/register)
 */
export async function registerUser(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
  // Always persist the payload locally in frontend
  saveRegistrationData(payload);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const responseData = await response.json().catch(() => null);

    if (response.ok) {
      if (typeof window !== "undefined" && responseData?.access_token) {
        localStorage.setItem("vve-access-token", responseData.access_token);
        if (responseData.user) {
          localStorage.setItem("vve-user", JSON.stringify(responseData.user));
        }
      }
      return {
        success: true,
        data: responseData as AuthResponse,
        error: null,
      };
    } else {
      // Extract detailed error message from FastAPI validation response
      let errorMsg = "Registration failed. Please check your details.";
      if (responseData) {
        if (typeof responseData.detail === "string") {
          errorMsg = responseData.detail;
        } else if (Array.isArray(responseData.detail) && responseData.detail[0]?.msg) {
          errorMsg = responseData.detail[0].msg;
        }
      }

      return {
        success: false,
        data: null,
        error: errorMsg,
      };
    }
  } catch (err) {
    // Backend server might be offline during development testing
    console.warn("[vvEntra API] Backend unreachable at " + API_BASE_URL + ". Falling back to local state.", err);
    return {
      success: false,
      data: null,
      error: "Backend server is currently offline. Local registration saved.",
      isOffline: true,
    };
  }
}
