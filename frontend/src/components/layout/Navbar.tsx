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
          <Link href="/#dashboard">Dashboard</Link>
          <Link href="/#trust">Trust</Link>
          <Link href="/#playbook">Playbook</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/#browse">Browse</Link>
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
            onClick={toggleTheme}
            aria-label="Toggle light / dark mode"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <Link href="/login" className="nav-auth-btn">
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
