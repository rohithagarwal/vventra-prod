"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// Routes accessible to unauthenticated visitors
const PUBLIC_AUTH_PATHS = ["/login", "/register", "/signup"];

// Routes accessible during registration/onboarding flow
const ONBOARDING_PATHS = ["/onboarding", "/verify"];

export function checkIsAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  // 1. Direct Bearer access token
  const token = localStorage.getItem("vve-access-token");
  if (token && token.trim().length > 0 && token !== "null" && token !== "undefined") {
    return true;
  }

  // 2. Active member stage (applied or verified)
  const stage = localStorage.getItem("vve-stage");
  if (stage && stage !== "guest" && stage !== "null" && stage !== "undefined") {
    return true;
  }

  // 3. Authenticated user profile stored in localStorage
  const user = localStorage.getItem("vve-user");
  if (user && user !== "null" && user !== "undefined") {
    return true;
  }

  // 4. In-flight registration payload
  const regData = localStorage.getItem("vve-registration-data");
  if (regData && regData !== "null" && regData !== "undefined") {
    return true;
  }

  return false;
}

export function checkHasOnboardingContext(): boolean {
  if (typeof window === "undefined") return false;
  const regData = localStorage.getItem("vve-registration-data");
  const stage = localStorage.getItem("vve-stage");
  const role = localStorage.getItem("vve-role");
  return Boolean(regData || (stage && stage !== "guest") || role);
}

function AuthGuardInternal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State: "checking" | "authenticated" | "unauthenticated"
  const [authState, setAuthState] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  useEffect(() => {
    const evaluateAuth = () => {
      // 1. Public authentication routes are always permitted
      if (PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p))) {
        setAuthState("authenticated");
        return;
      }

      // 2. Onboarding/verification flow is permitted if user has started registration, is authed, or has role param
      if (ONBOARDING_PATHS.some((p) => pathname.startsWith(p))) {
        if (checkIsAuthenticated() || checkHasOnboardingContext() || searchParams?.has("role")) {
          setAuthState("authenticated");
          return;
        }
      }

      // 3. For all other pages, strict authentication is required
      const authed = checkIsAuthenticated();
      if (authed) {
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
        const queryStr = searchParams?.toString();
        const target = pathname + (queryStr ? `?${queryStr}` : "");
        const redirectUrl = `/login?redirect=${target}`;
        router.replace(redirectUrl);
      }
    };

    evaluateAuth();

    // Listen to storage changes (e.g. login/logout in any tab or component)
    window.addEventListener("storage", evaluateAuth);
    return () => {
      window.removeEventListener("storage", evaluateAuth);
    };
  }, [pathname, searchParams, router]);

  // If on a public auth route, render immediately without blocking
  if (PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // If authenticated, render protected page content
  if (authState === "authenticated") {
    return <>{children}</>;
  }

  // While checking or redirecting unauthenticated visitor, block protected content
  return (
    <div
      id="authGateWall"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-bone, #0A0D12)",
        color: "var(--fg, #EAE6DF)",
        padding: "2rem",
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
      }}
    >
      <div
        style={{
          maxWidth: "460px",
          width: "100%",
          background: "var(--card-bg, #11151C)",
          border: "1px solid var(--line, rgba(255, 255, 255, 0.1))",
          borderRadius: "16px",
          padding: "2.5rem",
          textAlign: "center",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <span
            style={{
              display: "inline-block",
              padding: "0.35rem 0.85rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderRadius: "9999px",
              background: "rgba(226, 87, 27, 0.15)",
              color: "#E2571B",
              border: "1px solid rgba(226, 87, 27, 0.3)",
            }}
          >
            Authentication Required
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-serif, 'Instrument Serif', Georgia, serif)",
            fontSize: "2rem",
            fontWeight: 400,
            lineHeight: 1.2,
            marginBottom: "0.75rem",
            color: "var(--fg, #EAE6DF)",
          }}
        >
          Members-Only Access
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            lineHeight: 1.6,
            color: "var(--muted, #8F9BA8)",
            marginBottom: "1.75rem",
          }}
        >
          vvEntra requires authentication to access intelligence feeds, pricing models, and private opportunities.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            color: "#E2571B",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              border: "2px solid #E2571B",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span>Redirecting to member sign-in...</span>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <AuthGuardInternal>{children}</AuthGuardInternal>
    </React.Suspense>
  );
}
