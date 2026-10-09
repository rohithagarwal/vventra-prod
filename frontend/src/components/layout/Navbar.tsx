"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function Navbar({
  currentRole = "investor",
  onRoleChange,
}: {
  currentRole?: "investor" | "architect";
  onRoleChange?: (role: "investor" | "architect") => void;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [role, setRole] = useState<"investor" | "architect">(currentRole);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("vve-theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || currentRole;
    setRole(savedRole);
    document.documentElement.setAttribute("data-role", savedRole);
  }, [currentRole]);

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
    <nav className="top" aria-label="Primary navigation">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="vvEntra Home">
          <Image
            src={theme === "dark" ? "/assets/logo-dark-mode.png" : "/assets/logo.png"}
            alt="vvEntra — We Enter Ventures Together"
            width={124}
            height={28}
            priority
            className="brand-logo-img"
          />
        </Link>

        <div className="nav-links">
          <Link href="/#dashboard" data-route="dashboard">Dashboard</Link>
          <Link href="/#trust" data-route="trust">Trust</Link>
          <Link href="/#playbook" data-route="playbook">Playbook</Link>
          <Link href="/#faq" data-route="faq">FAQ</Link>
          <Link href="/#pricing" data-route="pricing">Pricing</Link>
          <Link href="/#browse" data-route="browse">Opportunities</Link>
          <Link href="/#list" data-route="list">List an opportunity</Link>
          <Link href="/#terms" data-route="terms">Terms</Link>
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

          <Link href="/login" data-route="login" className="nav-account-pill guest">
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
