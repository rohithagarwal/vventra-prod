"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export function Navbar({
  currentRole = "investor",
  onRoleChange,
}: {
  currentRole?: "investor" | "architect";
  onRoleChange?: (role: "investor" | "architect") => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [role, setRole] = useState<"investor" | "architect">(currentRole);
  const [stage, setStage] = useState<string>("guest");

  useEffect(() => {
    const syncState = () => {
      const savedTheme = (localStorage.getItem("vve-theme") as "light" | "dark") || "light";
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);

      const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || currentRole;
      setRole(savedRole);
      document.documentElement.setAttribute("data-role", savedRole);

      const savedStage = localStorage.getItem("vve-stage") || "guest";
      setStage(savedStage);
    };

    syncState();
    window.addEventListener("storage", syncState);
    return () => window.removeEventListener("storage", syncState);
  }, [currentRole]);

  const handleLogout = () => {
    localStorage.removeItem("vve-access-token");
    localStorage.removeItem("vve-user");
    localStorage.removeItem("vve-stage");
    localStorage.removeItem("vve-registration-data");
    localStorage.removeItem("vve-profile");
    localStorage.removeItem("vve-vlinkedin");
    localStorage.removeItem("vve-vbank");
    localStorage.removeItem("vve-vvideo");
    setStage("guest");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
    router.push("/login");
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("vve-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const toggleRole = () => {
    const nextRole = role === "investor" ? "architect" : "investor";
    setRole(nextRole);
    localStorage.setItem("vve-role", nextRole);
    document.documentElement.setAttribute("data-role", nextRole);
    if (onRoleChange) {
      onRoleChange(nextRole);
    }
  };

  return (
    <>
      <div className="ticker" tabIndex={0} aria-label="Market bulletin. Focus or hover to pause.">
        <div className="ticker-label" id="ticker-label">Live</div>
        <div className="ticker-track" id="ticker-track">
          {[
            { code: "VVE-2440", text: "B2B media · subscription play, US", delta: "+12%" },
            { code: "VVE-2441", text: "Specialty logistics · SEA", delta: "+8%" },
            { code: "VVE-2442", text: "Vertical AI · legal ops, India", delta: "+24%" },
            { code: "VVE-2443", text: "Healthtech · diagnostics, India", delta: "+6%" },
            { code: "VVE-2438", text: "D2C ayurveda · UNLOCKED", delta: "Closed" },
            { code: "VVE-2429", text: "Creator marketplace · listed", delta: "+18%" },
            { code: "VVE-2436", text: "AI agent · 3 new buyer requests", delta: "+14%" },
            { code: "VVE-2425", text: "Climate · industrial monitoring", delta: "+9%" },
            { code: "VVE-2434", text: "SMB lending · validated", delta: "+22%" },
            { code: "VVE-2412", text: "Niche marketplace · DEAL CLOSED", delta: "$5.2k" },
            { code: "VVE-2440", text: "B2B media · subscription play, US", delta: "+12%" },
            { code: "VVE-2441", text: "Specialty logistics · SEA", delta: "+8%" },
            { code: "VVE-2442", text: "Vertical AI · legal ops, India", delta: "+24%" },
            { code: "VVE-2443", text: "Healthtech · diagnostics, India", delta: "+6%" },
            { code: "VVE-2438", text: "D2C ayurveda · UNLOCKED", delta: "Closed" },
            { code: "VVE-2429", text: "Creator marketplace · listed", delta: "+18%" },
            { code: "VVE-2436", text: "AI agent · 3 new buyer requests", delta: "+14%" },
            { code: "VVE-2425", text: "Climate · industrial monitoring", delta: "+9%" },
            { code: "VVE-2434", text: "SMB lending · validated", delta: "+22%" },
            { code: "VVE-2412", text: "Niche marketplace · DEAL CLOSED", delta: "$5.2k" },
          ].map((it, idx) => (
            <span key={idx} className="ticker-item">
              <span className="code">{it.code}</span>
              <span>{it.text}</span>
              <span className="up">{it.delta}</span>
              <span className="sep" />
            </span>
          ))}
        </div>
      </div>

      <nav className="top" aria-label="Primary navigation">
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label="vvEntra Home">
            <Image
              src={theme === "dark" ? "/assets/logo-dark-mode.png" : "/assets/logo.png"}
              alt="vvEntra — We Enter Ventures Together"
              width={121}
              height={42}
              priority
              className="brand-logo-img"
            />
          </Link>

          <div className="nav-links">
            <Link href="/dashboard" data-route="dashboard">Dashboard</Link>
            <Link href="/#trust" data-route="trust">Trust</Link>
            <Link href="/#playbook" data-route="playbook">Playbook</Link>
            <Link href="/#architecture" data-route="architecture">Architecture</Link>
            <Link href="/#faq" data-route="faq">FAQ</Link>
            <Link href="/#pricing" data-route="pricing">Pricing</Link>
            <Link href="/#opportunities" data-route="browse">Opportunities</Link>
            <Link href="/signup?role=architect" data-route="list">List an opportunity</Link>
            <Link href="/terms" data-route="terms">Terms</Link>
          </div>

          <div className="nav-cta">
            <button
              type="button"
              className="nav-role-pill"
              onClick={toggleRole}
              title="Switch Workspace Mode"
            >
              <span className="nav-role-dot" />
              <span>{role === "architect" ? "Architect Workspace" : "Investor Mode"}</span>
            </button>

            {/* Status Pill (when user is in applied/onboarding or verified stage) */}
            {(stage === "applied" || pathname === "/onboarding" || pathname === "/verify") && (
              <Link href="/verify" className="nav-account-pill applied">
                Verify identity
              </Link>
            )}

            {stage === "verified" && (
              <Link href="/dashboard" className="nav-account-pill verified">
                Verified
              </Link>
            )}

            {/* When NOT logged in (Guest): Show Log in button */}
            {stage !== "applied" && stage !== "verified" && pathname !== "/onboarding" && pathname !== "/verify" ? (
              <Link
                href="/login"
                data-route="login"
                id="navLoginBtn"
                className={`nav-account-pill guest ${pathname === "/login" || pathname === "/signup" ? "active" : ""}`}
                title="Log in to vvEntra"
              >
                Log in
              </Link>
            ) : (
              /* When logged in: Show ONLY Log out button */
              <button
                type="button"
                id="navLogoutBtn"
                onClick={handleLogout}
                className="nav-account-pill logout"
                title="Log out and reset session"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Log out</span>
              </button>
            )}

            <button
              type="button"
              className="theme-toggle"
              id="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
