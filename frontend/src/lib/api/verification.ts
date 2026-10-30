import { api, fetchWithAuth } from "@/lib/api/client";

export interface LinkedInVerificationResponse {
  success: boolean;
  message: string;
  linkedin_url: string;
  is_verified: boolean;
  username: string;
}

export interface PayoutAccount {
  account_id: string;
  provider?: string;
  bank_name?: string;
  last4?: string;
  currency?: string;
  is_connected: boolean;
  connected_at?: string;
}

export interface VerificationStatusResponse {
  total_steps?: number;
  current_step?: number;
  verifying_as?: string;
  is_verified?: boolean;
  is_fully_verified?: boolean;
  user_status?: string;
  status?: string;
  linkedin?: { is_verified?: boolean; username?: string; linkedin_url?: string };
  linkedin_verification?: { is_verified?: boolean; username?: string; linkedin_url?: string };
  payout?: PayoutAccount | null;
  video_verification?: {
    is_verified?: boolean | string;
    is_locked?: boolean;
    is_submitted?: boolean;
    status?: string;
    message?: string;
  };
}

function normalizedStatus(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isVideoVerificationApproved(status: VerificationStatusResponse): boolean {
  const video = status.video_verification;
  return video?.is_verified === true
    || normalizedStatus(video?.is_verified) === "success"
    || normalizedStatus(video?.status) === "success";
}

export function isAccountVerificationComplete(status: VerificationStatusResponse): boolean {
  const accountStatus = normalizedStatus(status.user_status ?? status.status);
  return status.is_fully_verified === true
    || status.is_verified === true
    || accountStatus === "active"
    || accountStatus === "verified"
    || isVideoVerificationApproved(status);
}

export function isAccountActive(status: string): boolean {
  return ["active", "verified"].includes(normalizedStatus(status));
}

export interface PayoutConnectResponse {
  account_id: string;
  onboarding_url: string;
  is_connected: boolean;
}

export interface VideoVerificationUploadResponse {
  success: boolean;
  message: string;
  video_id: string;
  file_size_bytes: number;
  content_type: string;
  status: string;
}

export async function submitRecordedVideo(videoBlob: Blob): Promise<VideoVerificationUploadResponse> {
  const formData = new FormData();
  formData.append("video", videoBlob, "verification.webm");

  // Do not set Content-Type here; the browser must add the multipart boundary.
  const response = await fetchWithAuth("/api/v1/verification/video", {
    method: "POST",
    body: formData,
  });
  const result = await readApiResponse<VideoVerificationUploadResponse>(response, "Could not upload your verification video.");
  if (!result || result.success !== true) throw new Error(result?.message || "The video could not be queued for review.");
  return result;
}

export async function connectLinkedInOAuth(code: string, redirectUri: string): Promise<VerificationStatusResponse> {
  const response = await api.post("/api/v1/verification/linkedin/connect", {
    code,
    redirect_uri: redirectUri,
  });
  const data = await readApiResponse<VerificationStatusResponse>(response, "LinkedIn authentication could not be completed.");
  return data;
}

export async function verifyLinkedInProfile(linkedinUrl: string): Promise<LinkedInVerificationResponse> {
  const response = await api.post("/api/v1/verification/linkedin", { linkedin_url: linkedinUrl });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data && typeof data === "object" && "detail" in data
      ? (data as { detail?: unknown }).detail
      : null;
    throw new Error(typeof detail === "string" ? detail : "LinkedIn verification failed. Check the profile URL and try again.");
  }

  if (!data || typeof data !== "object" || !("is_verified" in data)) {
    throw new Error("The verification service returned an unexpected response.");
  }
  return data as LinkedInVerificationResponse;
}

async function readApiResponse<T>(response: Response, fallback: string): Promise<T> {
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data && typeof data === "object" && "detail" in data
      ? (data as { detail?: unknown }).detail
      : null;
    const message = data && typeof data === "object" && "message" in data
      ? (data as { message?: unknown }).message
      : null;
    throw new Error(typeof detail === "string" ? detail : typeof message === "string" ? message : fallback);
  }
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

export async function startPayoutOnboarding(returnUrl: string, refreshUrl: string): Promise<PayoutConnectResponse> {
  const response = await api.post("/api/v1/verification/payout/connect", {
    return_url: returnUrl,
    refresh_url: refreshUrl,
  });
  return readApiResponse<PayoutConnectResponse>(response, "Could not start payout account setup.");
}

export async function confirmPayoutOnboarding(): Promise<VerificationStatusResponse> {
  const response = await api.post("/api/v1/verification/payout/confirm");
  return readApiResponse<VerificationStatusResponse>(response, "Could not confirm your payout account.");
}

export async function getVerificationStatus(): Promise<VerificationStatusResponse> {
  const response = await api.get("/api/v1/verification/status");
  return readApiResponse<VerificationStatusResponse>(response, "Could not load verification status.");
}

