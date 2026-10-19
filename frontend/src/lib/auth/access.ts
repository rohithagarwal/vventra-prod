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
  const status = user.status.trim().toLowerCase();
  if (isAccountActive(status)) return { role, path: `/dashboard?role=${role}`, user };

  if (role === "architect") {
    try {
      const verification = await getVerificationStatus();
      if (isAccountVerificationComplete(verification)) {
        return { role, path: "/dashboard?role=architect", user: { ...user, status: "active" } };
      }
      if (status === "onboarding") return { role, path: "/onboarding?role=architect", user };
      return { role, path: "/verify?role=architect", user };
    } catch {
      return {
        role,
        path: status === "onboarding" ? "/onboarding?role=architect" : "/verify?role=architect",
        user,
      };
    }
  }

  if (status === "onboarding") return { role, path: "/onboarding?role=investor", user };
  return { role, path: "/verify?role=investor", user };
}
