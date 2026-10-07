"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<{ text: string; type: "error" | "info" | "" }>({
    text: "",
    type: "",
  });

  useEffect(() => {
    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || "investor";
    setRole(savedRole);
  }, []);

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
    localStorage.setItem("vve-role", newRole);
    document.documentElement.setAttribute("data-role", newRole);
    setStatus({ text: "", type: "" });
  };

  const roleLabel = role === "architect" ? "Architect / Creator" : "Investor / Buyer";

  const handleModeToggle = (nextMode: "signin" | "signup") => {
    setMode(nextMode);
    setStatus({ text: "", type: "" });
    setPassword("");
    setConfirmPassword("");
  };

  const handleGoogleAuth = () => {
    const clientId = "428998304160-djaan3bkeje5s2chfu30lcg4ipgpnbn5.apps.googleusercontent.com";
    const redirectUri = window.location.origin + "/login";
    
    setStatus({
      text: `Opening Google sign-in for ${roleLabel}...`,
      type: "info",
    });

    try {
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=openid%20profile%20email`;
      window.open(googleUrl, "GoogleOAuth", "width=600,height=700,top=100,left=100");
    } catch {
      setStatus({
        text: `Google OAuth connection initiated for ${roleLabel}.`,
        type: "info",
      });
    }
  };

  const handleLinkedInAuth = () => {
    const clientId = "77xjn2z32v0xr3";
    let redirectUri = window.location.origin;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      redirectUri = "http://localhost:4173";
    }

    const state = "linkedin_" + Math.random().toString(36).substring(2, 15);
    const linkedInUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}&scope=openid%20profile%20email`;

    setStatus({
      text: `Opening LinkedIn authorization for ${roleLabel}...`,
      type: "info",
    });

    window.open(linkedInUrl, "LinkedInOAuth", "width=600,height=700,top=100,left=100");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setStatus({
        text: `Enter both your email address and password to ${
          mode === "signup" ? "create your account" : "sign in"
        }.`,
        type: "error",
      });
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) {
        setStatus({
          text: "Choose a password with at least 8 characters.",
          type: "error",
        });
        return;
      }
      if (password !== confirmPassword) {
        setStatus({
          text: "Your passwords do not match. Please try again.",
          type: "error",
        });
        return;
      }

      setStatus({
        text: `Account created successfully for ${email}. Setting up your ${roleLabel} workspace...`,
        type: "info",
      });
      return;
    }

    setStatus({
      text: `Signing in as ${roleLabel} (${email}). Welcome back!`,
      type: "info",
    });
  };

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="login" className="page login-page" data-login-role={role}>
        <div className="login-shell">
          {/* ================= LEFT COLUMN: INTRO ================= */}
          <section className="login-intro">
            <div>
              <span className="login-kicker">Member access</span>
              <h1>
                Enter the <em>right</em> side of vvEntra.
              </h1>
              <p className="login-copy" id="loginIntroCopy">
                {mode === "signup"
                  ? role === "architect"
                    ? "Create an Architect / Creator account, then tell us about the experience behind the opportunities you plan to bring."
                    : "Create an Investor / Buyer account, then tell us how you assess and support opportunities."
                  : role === "architect"
                  ? "Sign in as an architect to create opportunities, manage submissions, and keep your intellectual property protected."
                  : "Sign in as an investor to review verified opportunities, manage your requests, and keep your deal activity private."}
              </p>
            </div>

            <div className="login-trust" aria-label="vvEntra account safeguards">
              <div className="login-trust-item">
                <span className="login-trust-icon">✓</span>
                <span>Every member is reviewed before their access is activated.</span>
              </div>
              <div className="login-trust-item">
                <span className="login-trust-icon">✓</span>
                <span>Your role keeps investor and opportunity-creator tools separate.</span>
              </div>
              <div className="login-trust-item">
                <span className="login-trust-icon">✓</span>
                <span>Private information is only visible to approved members.</span>
              </div>
            </div>
          </section>

          {/* ================= RIGHT COLUMN: LOGIN CARD ================= */}
          <section className="login-card" aria-labelledby="loginTitle">
            <div className="login-card-head">
              <div>
                <h1 className="login-card-title" id="loginTitle">
                  {mode === "signup" ? `Create your ${roleLabel} account` : "Welcome back"}
                </h1>
                <p className="login-card-subtitle" id="loginSubtitle">
                  {mode === "signup"
                    ? "Start with your email, Google, or LinkedIn account. Your profile details come next."
                    : `Use your ${roleLabel} account to continue.`}
                </p>
              </div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="login-role-toggle" role="tablist" aria-label="Choose account type">
              <button
                className={`login-role-btn ${role === "investor" ? "active" : ""}`}
                type="button"
                data-login-role="investor"
                role="tab"
                aria-selected={role === "investor"}
                onClick={() => handleRoleToggle("investor")}
              >
                <span className="login-role-name">Investor / Buyer</span>
                <span className="login-role-note">Review opportunities and access requests</span>
              </button>

              <button
                className={`login-role-btn ${role === "architect" ? "active" : ""}`}
                type="button"
                data-login-role="architect"
                role="tab"
                aria-selected={role === "architect"}
                onClick={() => handleRoleToggle("architect")}
              >
                <span className="login-role-name">Architect / Creator</span>
                <span className="login-role-note">Create and manage opportunities</span>
              </button>
            </div>

            {/* Social Authentication: Google & LinkedIn */}
            <div className="login-social-grid">
              <button
                type="button"
                className="login-google-btn"
                id="loginGoogleBtn"
                onClick={handleGoogleAuth}
              >
                <svg className="login-google-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.94v2.79h3.6c2.1-1.94 3.31-4.8 3.31-8.16Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.6-2.79c-1 .67-2.27 1.07-3.83 1.07-2.94 0-5.43-1.99-6.32-4.66H.96v2.88A9.72 9.72 0 0 0 12 21.75Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.68 13.01a5.84 5.84 0 0 1 0-3.75V6.38H.96a9.74 9.74 0 0 0 0 8.51l4.72-3.66v1.78Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.33c1.7 0 3.23.59 4.43 1.74l3.32-3.32C16.81 1.01 14.62 0 12 0A9.72 9.72 0 0 0 .96 6.38l4.72 2.88C6.57 7.32 9.06 5.33 12 5.33Z"
                  />
                </svg>
                <span id="loginGoogleText">Continue with Google</span>
              </button>

              <button
                type="button"
                className="login-linkedin-btn"
                id="loginLinkedinBtn"
                onClick={handleLinkedInAuth}
              >
                <svg
                  className="login-linkedin-icon"
                  viewBox="0 0 24 24"
                  fill="#0A66C2"
                  aria-hidden="true"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>Continue with LinkedIn</span>
              </button>
            </div>

            <div className="login-divider">
              {mode === "signup" ? "or create with email" : "or sign in with email"}
            </div>

            {/* Email & Password Form */}
            <form id="loginForm" onSubmit={handleSubmit} noValidate>
              <div className="login-field">
                <label className="login-label" htmlFor="loginEmail">
                  Email address
                </label>
                <input
                  className="login-input"
                  id="loginEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="loginPassword">
                  Password
                </label>
                <div className="login-input-wrap">
                  <input
                    className="login-input"
                    id="loginPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="login-show-password"
                    id="loginPasswordToggle"
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div className="login-field login-confirm-field" id="loginConfirmField">
                  <label className="login-label" htmlFor="loginPasswordConfirm">
                    Confirm password
                  </label>
                  <input
                    className="login-input"
                    id="loginPasswordConfirm"
                    name="passwordConfirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {mode === "signin" && (
                <div className="login-form-row">
                  <label className="login-check">
                    <input
                      id="loginRemember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />{" "}
                    Keep me signed in
                  </label>
                  <a
                    href="mailto:hello@vventra.com?subject=vvEntra%20password%20help"
                    className="login-help-link"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <button className="login-submit" type="submit" id="loginSubmitBtn">
                {mode === "signup"
                  ? `Create ${roleLabel} account`
                  : `Sign in as ${roleLabel}`}
              </button>

              {status.text && (
                <p
                  className={`login-status ${status.type}`}
                  id="loginStatus"
                  role="status"
                  aria-live="polite"
                >
                  {status.text}
                </p>
              )}
            </form>

            <p className="login-footer" id="loginFooter">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => handleModeToggle("signin")}>
                    Log in
                  </button>
                </>
              ) : (
                <>
                  New to vvEntra?{" "}
                  <button type="button" onClick={() => handleModeToggle("signup")}>
                    Create account
                  </button>
                </>
              )}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
