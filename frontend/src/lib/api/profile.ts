export interface InvestorProfilePayload {
  full_name: string;
  focus: string;
  location: string;
  sectors: string[];
  additional_notes: string | null;
  looking_for: string;
  capital_range: string;
  deployment_timeline: string;
}

export interface ArchitectProfilePayload {
  full_name: string;
  headline: string;
  location: string;
  sectors: string[];
  additional_notes: string | null;
  opportunity_description: string;
  doc_depth: string;
  submission_timeline: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  isOffline?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Sector mapping to backend enum machine values
export const SECTOR_MAPPING: Record<string, string> = {
  "B2B SaaS": "b2b_saas",
  "AI & automation": "ai_automation",
  "Marketplaces": "marketplaces",
  "Fintech": "fintech",
  "Climate & industry": "climate_industry",
  "D2C & consumer": "d2c_consumer",
  "Operations": "operations",
  "Healthtech": "healthtech",
};

// Investor capital range mapping
export const CAPITAL_RANGE_MAPPING: Record<string, string> = {
  "Under $10,000": "under_10k",
  "$10,000 – $50,000": "10k_50k",
  "$50,000 – $250,000": "50k_250k",
  "$250,000 – $1M": "250k_1m",
  "Above $1M": "over_1m",
  "I am exploring": "exploring",
};

// Investor deployment timeline mapping
export const TIMELINE_MAPPING: Record<string, string> = {
  "Now": "now",
  "Within 3 months": "within_3_months",
  "Within 12 months": "within_12_months",
  "I am exploring": "exploring",
};

// Architect document depth mapping
export const ARCHITECT_DOC_DEPTH_MAPPING: Record<string, string> = {
  "90-120 pages": "90_120_pages",
  "120-150 pages": "120_150_pages",
  "150+ pages": "150_plus_pages",
  "I'm still planning it.": "still_planning",
  "I am still planning": "still_planning",
};

// Architect submission timeline mapping
export const ARCHITECT_TIMELINE_MAPPING: Record<string, string> = {
  "Within 30 days": "within_30_days",
  "Within 3 months": "within_3_months",
  "Later this year": "later_this_year",
  "I am exploring": "exploring",
};

/**
 * Stores the profile dictionary locally in browser storage
 */
export function saveProfileData(
  payload: InvestorProfilePayload | ArchitectProfilePayload
): void {
  if (typeof window === "undefined") return;

  // Save full profile dictionary as specified
  localStorage.setItem("vve-profile", JSON.stringify(payload));
  localStorage.setItem("vve-onboarding-payload", JSON.stringify(payload));
  localStorage.setItem("vve-stage", "applied");
}

/**
 * Retrieves the stored profile dictionary from browser storage
 */
export function getStoredProfileData(): InvestorProfilePayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("vve-profile");
    if (!raw) return null;
    return JSON.parse(raw) as InvestorProfilePayload;
  } catch {
    return null;
  }
}

/**
 * Submits the Investor profile dictionary to backend API (PUT /api/v1/profile/investor)
 */
export async function submitInvestorProfile(
  payload: InvestorProfilePayload
): Promise<ApiResponse<unknown>> {
  saveProfileData(payload);

  // Map to backend schema values if matching enum exists
  const backendBody = {
    full_name: payload.full_name,
    focus: payload.focus,
    location: payload.location,
    sectors: payload.sectors.map((s) => SECTOR_MAPPING[s] || s),
    additional_notes: payload.additional_notes || null,
    looking_for: payload.looking_for,
    capital_range: CAPITAL_RANGE_MAPPING[payload.capital_range] || payload.capital_range,
    deployment_timeline: TIMELINE_MAPPING[payload.deployment_timeline] || payload.deployment_timeline,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vve-access-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/profile/investor`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(backendBody),
        signal: controller.signal,
      });
    } catch {
      // If PUT fails or not supported, try POST endpoint as fallback
      response = await fetch(`${API_BASE_URL}/api/v1/profile/investor`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(backendBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const responseData = await response.json().catch(() => null);

    if (response.ok) {
      return {
        success: true,
        data: responseData,
        error: null,
      };
    } else {
      let errorMsg = "Profile submission failed. Please check your details.";
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
    console.warn(
      `[vvEntra Profile API] Backend unreachable at ${API_BASE_URL}. Saved locally.`,
      err
    );
    return {
      success: false,
      data: null,
      error: "Backend server is offline. Profile saved locally.",
      isOffline: true,
    };
  }
}

/**
 * Submits the Architect profile dictionary to backend API (PUT /api/v1/profile/architect)
 */
export async function submitArchitectProfile(
  payload: ArchitectProfilePayload
): Promise<ApiResponse<unknown>> {
  saveProfileData(payload);

  const backendBody = {
    full_name: payload.full_name,
    headline: payload.headline,
    location: payload.location,
    sectors: payload.sectors.map((s) => SECTOR_MAPPING[s] || s),
    additional_notes: payload.additional_notes || null,
    opportunity_description: payload.opportunity_description,
    doc_depth: ARCHITECT_DOC_DEPTH_MAPPING[payload.doc_depth] || payload.doc_depth,
    submission_timeline: ARCHITECT_TIMELINE_MAPPING[payload.submission_timeline] || payload.submission_timeline,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vve-access-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/v1/profile/architect`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(backendBody),
        signal: controller.signal,
      });
    } catch {
      response = await fetch(`${API_BASE_URL}/api/v1/profile/architect`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(backendBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const responseData = await response.json().catch(() => null);

    if (response.ok) {
      return {
        success: true,
        data: responseData,
        error: null,
      };
    } else {
      let errorMsg = "Profile submission failed.";
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
    console.warn(
      `[vvEntra Profile API] Backend unreachable at ${API_BASE_URL}. Saved locally.`,
      err
    );
    return {
      success: false,
      data: null,
      error: "Backend server is offline. Profile saved locally.",
      isOffline: true,
    };
  }
}
