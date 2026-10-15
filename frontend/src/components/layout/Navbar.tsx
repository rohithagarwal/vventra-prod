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
  const accountMenuRef = useRef<HTMLDivElement>(null);

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

  const isPricing = pathname === "/pricing";
  const tickerLabelText = isPricing ? "Pricing" : "Live";
  const tickerList = isPricing
    ? [
        { code: "▲", text: "Simple economics · Disciplined process", delta: "" },
        { code: "▲", text: "No subscriptions · No listing fees · No surprises", delta: "" },
        { code: "▲", text: "Three engagement paths · Buyer chooses how to proceed", delta: "" },
        { code: "▲", text: "Try the live calculator below", delta: "" },
        { code: "▲", text: "Simple economics · Disciplined process", delta: "" },
        { code: "▲", text: "No subscriptions · No listing fees · No surprises", delta: "" },
        { code: "▲", text: "Three engagement paths · Buyer chooses how to proceed", delta: "" },
        { code: "▲", text: "Try the live calculator below", delta: "" },
      ]
    : [
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
      ];

  const isApplied = stage === "applied" || pathname === "/onboarding" || pathname === "/verify";
  const isVerified = stage === "verified";

  return (
    <>
      <div className="ticker" tabIndex={0} aria-label="Market bulletin. Focus or hover to pause.">
        <div className="ticker-label" id="ticker-label">{tickerLabelText}</div>
        <div className="ticker-track" id="ticker-track">
          {tickerList.map((it, idx) => (
            <span key={idx} className="ticker-item">
              <span className="code">{it.code}</span>
              <span>{it.text}</span>
              {it.delta && <span className="up">{it.delta}</span>}
              <span className="sep" />
            </span>
          ))}
        </div>
      </div>

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
              href="/#trust"
              data-route="trust"
              className={pathname === "/" && activeHash === "#trust" ? "active" : ""}
            >
              Trust
            </Link>
            <Link
              href="/#playbook"
              data-route="playbook"
              className={pathname === "/" && activeHash === "#playbook" ? "active" : ""}
            >
              Playbook
            </Link>
            <Link
              href="/#faq"
              data-route="faq"
              className={pathname === "/" && activeHash === "#faq" ? "active" : ""}
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
              href="/#opportunities"
              data-route="browse"
              className={pathname === "/" && activeHash === "#opportunities" ? "active" : ""}
            >
              Opportunities
            </Link>
            <Link
              href="/signup?role=architect"
              data-route="list"
              className={pathname === "/signup" && role === "architect" ? "active" : ""}
            >
              List an opportunity
            </Link>
            <Link
              href="/terms"
              data-route="terms"
              className={pathname === "/terms" ? "active" : ""}
            >
              Terms
            </Link>
          </div>

          <div className="nav-cta" ref={accountMenuRef}>
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
                {pathname === "/login" && (
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
    </>
  );
}
