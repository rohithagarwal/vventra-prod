import { CurrentUserInfo, getCurrentUser } from "@/lib/api/auth";
import { getVerificationStatus, isAccountActive, isAccountVerificationComplete } from "@/lib/api/verification";

export type AccountRole = "investor" | "architect";

export interface AccountDestination {
  role: AccountRole;
  path: string;
  user: CurrentUserInfo;
}

function normalizeRole(role: string): AccountRole {
  return role.toLowerCase().includes("architect") ? "architect" : "investor";
}

/** Resolve the next route from backend account and verification state. */
export async function resolveAccountDestination(fallbackUser?: CurrentUserInfo): Promise<AccountDestination> {
  let user = fallbackUser;
  try {
    user = await getCurrentUser();
  } catch (error) {
    if (!user) throw error;
  }
  if (!user) throw new Error("No authenticated account is available.");

  const role = normalizeRole(user.role);
  const status = (user.status || "").trim().toLowerCase();

  // Active, verified, or pending_review (completed onboarding) can access dashboard
  if (
    isAccountActive(status) ||
    status === "pending_review" ||
    status === "applied" ||
    status === "verified" ||
    status === "active"
  ) {
    return { role, path: `/dashboard?role=${role}`, user };
  }

  // If local storage has completed profile, allow landing on dashboard
  if (
    typeof window !== "undefined" &&
    (localStorage.getItem("vve-profile") || localStorage.getItem("vve-stage") === "applied" || localStorage.getItem("vve-stage") === "verified")
  ) {
    return { role, path: `/dashboard?role=${role}`, user };
  }

  if (role === "architect") {
    try {
      const verification = await getVerificationStatus();
      if (isAccountVerificationComplete(verification)) {
        return { role, path: "/dashboard?role=architect", user: { ...user, status: "active" } };
      }
      if (status === "onboarding") return { role, path: "/onboarding?role=architect", user };
      return { role, path: "/dashboard?role=architect", user };
    } catch {
      return {
        role,
        path: status === "onboarding" ? "/onboarding?role=architect" : "/dashboard?role=architect",
        user,
      };
    }
  }

  if (status === "onboarding") return { role, path: `/onboarding?role=investor`, user };
  return { role, path: `/dashboard?role=investor`, user };
}
