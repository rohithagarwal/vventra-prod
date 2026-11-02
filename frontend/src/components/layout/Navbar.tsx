"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
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
  const [userName, setUserName] = useState<string>("Account");
  const [fullName, setFullName] = useState<string>("");
  const [activeHash, setActiveHash] = useState<string>("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const syncState = () => {
      const savedTheme = (localStorage.getItem("vve-theme") as "light" | "dark") || "light";
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);

      const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || currentRole;
      setRole(savedRole);
      document.documentElement.setAttribute("data-role", savedRole);
      document.documentElement.classList.toggle("vve-investor", savedRole === "investor");

      const savedStage = localStorage.getItem("vve-stage") || "guest";
      setStage(savedStage);

      try {
        const rawUser = localStorage.getItem("vve-user") || localStorage.getItem("vve-profile");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          const name = parsed.name || parsed.fullName || parsed.first_name || "";
          if (name) {
            setFullName(name);
            setUserName(name.split(" ")[0]);
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
    };

    syncState();
    window.addEventListener("storage", syncState);

    const handleHash = () => {
      setActiveHash(window.location.hash);
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);

    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("hashchange", handleHash);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currentRole]);

  const handleLogout = () => {
    localStorage.removeItem("vve-stage");
    localStorage.removeItem("vve-access-token");
    localStorage.removeItem("vve-user");
    localStorage.removeItem("vve-registration-data");
    localStorage.removeItem("vve-profile");
    localStorage.removeItem("vve-vlinkedin");
    localStorage.removeItem("vve-vbank");
    localStorage.removeItem("vve-vvideo");
    setStage("guest");
    setAccountMenuOpen(false);
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

  const handleSetRole = (nextRole: "investor" | "architect") => {
    setRole(nextRole);
    localStorage.setItem("vve-role", nextRole);
    document.documentElement.setAttribute("data-role", nextRole);
    document.documentElement.classList.toggle("vve-investor", nextRole === "investor");
    if (onRoleChange) {
      onRoleChange(nextRole);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
  };

  const toggleRole = () => {
    const nextRole = role === "investor" ? "architect" : "investor";
    handleSetRole(nextRole);
  };

  const isAccountActuallyVerified = stage === "verified" && pathname !== "/verify";
  const isApplied = stage === "applied" || pathname === "/onboarding" || pathname === "/verify" || (!isAccountActuallyVerified && stage !== "guest");
  const isVerified = isAccountActuallyVerified;
  const isLoggedIn = stage === "applied" || stage === "verified";

  return (
    <>
      <nav className="top" aria-label="Primary navigation">
        <div className="nav-inner">
          <Link href="/" className="brand" data-route="home" aria-label="vvEntra">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="brand-logo-img brand-logo-light"
              src="/brand-logo-light.png"
              alt="vvEntra"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="brand-logo-img brand-logo-dark"
              src="/brand-logo-dark.png"
              alt="vvEntra"
            />
          </Link>

          <div className="nav-links">
            <Link
              href="/dashboard"
              data-route="dashboard"
              className={pathname === "/dashboard" ? "active" : ""}
            >
              Dashboard
            </Link>
            <Link
              href="/trust"
              data-route="trust"
              className={pathname === "/trust" ? "active" : ""}
            >
              Trust
            </Link>
            <Link
              href="/playbook"
              data-route="playbook"
              className={pathname === "/playbook" ? "active" : ""}
            >
              Playbook
            </Link>
            <Link
              href="/faq"
              data-route="faq"
              className={pathname === "/faq" ? "active" : ""}
            >
              FAQ
            </Link>
            <Link
              href="/pricing"
              data-route="pricing"
              className={pathname === "/pricing" ? "active" : ""}
            >
              Pricing
            </Link>
            <Link
              href="/browse"
              data-route="browse"
              className={pathname === "/browse" || (pathname === "/" && activeHash === "#opportunities") ? "active" : ""}
            >
              Opportunities
            </Link>
            {role === "architect" && (
              <Link
                href="/list"
                data-route="list"
                className={pathname === "/list" ? "active" : ""}
              >
                List an opportunity
              </Link>
            )}
            <Link
              href="/terms"
              data-route="terms"
              className={pathname === "/terms" ? "active" : ""}
            >
              Terms
            </Link>
          </div>

          <div className="nav-cta" ref={accountMenuRef}>
            <div
              className="nav-role-toggle nav-role-pill"
              id="nav-role-toggle"
              role="group"
              aria-label="Toggle role between Investor and Architect"
              onClick={toggleRole}
              title="Switch Workspace Mode"
            >
              <div className="nav-role-indicator" aria-hidden="true" />
              <button
                type="button"
                className={`nav-role-btn ${role === "investor" ? "active" : ""}`}
                data-role="investor"
                onClick={(e) => {
                  e.stopPropagation();
                  if (role === "investor") {
                    handleSetRole("architect");
                  } else {
                    handleSetRole("investor");
                  }
                }}
                aria-pressed={role === "investor"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
                </svg>
                <span>Investor</span>
              </button>
              <button
                type="button"
                className={`nav-role-btn ${role === "architect" ? "active" : ""}`}
                data-role="architect"
                onClick={(e) => {
                  e.stopPropagation();
                  if (role === "architect") {
                    handleSetRole("investor");
                  } else {
                    handleSetRole("architect");
                  }
                }}
                aria-pressed={role === "architect"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M3 3h18M5 3v10a7 7 0 0 0 14 0V3" />
                  <circle cx="12" cy="20" r="1.5" />
                </svg>
                <span>Architect</span>
              </button>
            </div>

            <button
              type="button"
              className="theme-toggle"
              id="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
              <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            </button>

            <button
              type="button"
              className="mobile-nav-toggle"
              id="mobileNavToggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

            {isVerified ? (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  className="nav-account-pill verified"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  data-menu="1"
                >
                  {userName} · Verified
                </button>

                {accountMenuOpen && (
                  <div id="vveAccountMenu" className="vve-account-menu open">
                    <div className="vam-head">
                      <span className="vam-name">{fullName || "Your account"}</span>
                      <span className="vam-tier tier-pioneer">Pioneer tier</span>
                    </div>
                    <Link href="/dashboard" className="vam-item" onClick={() => setAccountMenuOpen(false)}>My workspace</Link>
                    <Link href="/dashboard" className="vam-item" onClick={() => setAccountMenuOpen(false)}>Market dashboard</Link>
                    <Link href="/verify" className="vam-item" onClick={() => setAccountMenuOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
                      My profile
                    </Link>
                    <Link href="/pricing" className="vam-item" onClick={() => setAccountMenuOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      Earnings &amp; payments
                    </Link>
                    <Link href="/verify" className="vam-item" onClick={() => setAccountMenuOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Account settings
                    </Link>
                    <div className="vam-divider"></div>
                    <button type="button" className="vam-item vam-logout" onClick={handleLogout}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : isApplied ? (
              <>
                <Link href="/verify" data-route="verify" className="nav-account-pill applied">
                  Verify identity
                </Link>
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
              </>
            ) : (
              <Link
                href="/login"
                data-route="login"
                id="navLoginBtn"
                className={`nav-account-pill guest ${pathname === "/login" || pathname === "/signup" ? "active" : ""}`}
                title="Log in to vvEntra"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* B08: RESPONSIVE MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}
        aria-label="Mobile navigation"
        id="mobileNavDrawer"
      >
        <div className="mnd-header">
          <Link href="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="brand-logo-img brand-logo-light"
              src="/brand-logo-light.png"
              alt="vvEntra"
              style={{ height: "32px" }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="brand-logo-img brand-logo-dark"
              src="/brand-logo-dark.png"
              alt="vvEntra"
              style={{ height: "32px" }}
            />
          </Link>
          <button
            type="button"
            className="mnd-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="mnd-role-section">
          <span className="mnd-role-label">Platform Role</span>
          <div className="mnd-role-pill-group">
            <button
              type="button"
              className={`mnd-role-option ${role === "investor" ? "active" : ""}`}
              onClick={() => {
                handleSetRole("investor");
              }}
              id="mnd-role-investor"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
              </svg>
              <span>Investor</span>
            </button>
            <button
              type="button"
              className={`mnd-role-option ${role === "architect" ? "active" : ""}`}
              onClick={() => {
                handleSetRole("architect");
              }}
              id="mnd-role-architect"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
                <path d="M3 3h18M5 3v10a7 7 0 0 0 14 0V3" />
                <circle cx="12" cy="20" r="1.5" />
              </svg>
              <span>Architect</span>
            </button>
          </div>
        </div>

        <nav className="mnd-nav-links">
          <Link
            href="/dashboard"
            className={`mnd-link ${pathname === "/dashboard" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            id="mnd-link-dashboard"
          >
            <span>Dashboard</span>
            <span className="arrow">→</span>
          </Link>
          <Link
            href="/browse"
            className={`mnd-link ${pathname === "/browse" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            id="mnd-link-browse"
          >
            <span>Opportunities</span>
            <span className="arrow">→</span>
          </Link>
          {role === "architect" && (
            <Link
              href="/list"
              className={`mnd-link ${pathname === "/list" ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
              id="mnd-link-list"
            >
              <span>List an opportunity</span>
              <span className="arrow">→</span>
            </Link>
          )}
          <Link
            href="/trust"
            className={`mnd-link ${pathname === "/trust" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            id="mnd-link-trust"
          >
            <span>Trust Policy</span>
            <span className="arrow">→</span>
          </Link>
          <Link
            href="/playbook"
            className={`mnd-link ${pathname === "/playbook" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            id="mnd-link-playbook"
          >
            <span>Playbook</span>
            <span className="arrow">→</span>
          </Link>
          <Link
            href="/faq"
            className={`mnd-link ${pathname === "/faq" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            id="mnd-link-faq"
          >
            <span>FAQ</span>
            <span className="arrow">→</span>
          </Link>
          <Link
            href="/pricing"
            className={`mnd-link ${pathname === "/pricing" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            id="mnd-link-pricing"
          >
            <span>Pricing</span>
            <span className="arrow">→</span>
          </Link>
          <Link
            href="/about"
            className={`mnd-link ${pathname === "/about" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            id="mnd-link-about"
          >
            <span>About vvEntra</span>
            <span className="arrow">→</span>
          </Link>
          <Link
            href="/terms"
            className={`mnd-link ${pathname === "/terms" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            id="mnd-link-terms"
          >
            <span>Terms</span>
            <span className="arrow">→</span>
          </Link>
        </nav>

        <div className="mnd-account-section">
          {isVerified ? (
            <>
              <div className="mnd-user-info">
                <span className="mnd-user-name">{fullName || userName}</span>
                <span className="nav-account-pill verified" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                  Verified
                </span>
              </div>
              <Link
                href="/verify"
                className="mnd-link"
                onClick={() => setMobileMenuOpen(false)}
                id="mnd-link-profile"
              >
                <span>My Profile &amp; Verification</span>
                <span className="arrow">→</span>
              </Link>
              <button
                type="button"
                className="mnd-btn-logout"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                id="mndLogoutBtn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Log out</span>
              </button>
            </>
          ) : isApplied ? (
            <>
              <Link
                href="/verify"
                className="btn btn-orange btn-block"
                onClick={() => setMobileMenuOpen(false)}
                id="mnd-btn-verify"
                style={{ textDecoration: "none" }}
              >
                Verify identity
              </Link>
              <button
                type="button"
                className="mnd-btn-logout"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                id="mndLogoutBtn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-outline btn-block"
                onClick={() => setMobileMenuOpen(false)}
                id="mnd-btn-login"
                style={{ textDecoration: "none" }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn btn-orange btn-block"
                onClick={() => setMobileMenuOpen(false)}
                id="mnd-btn-signup"
                style={{ textDecoration: "none" }}
              >
                Apply for access
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
