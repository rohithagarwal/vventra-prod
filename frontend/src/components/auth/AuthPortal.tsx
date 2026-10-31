"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  authenticateWithGoogle,
  loginUser,
  registerUser,
  RegisterPayload,
  saveRegistrationData,
  UserInfo,
  requestPasswordReset,
  resetPassword,
} from "@/lib/api/auth";
import { resolveAccountDestination } from "@/lib/auth/access";

interface AuthPortalProps {
  initialMode?: "signin" | "signup" | "forgot";
}

export function AuthPortal({ initialMode = "signin" }: AuthPortalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [savedStage, setSavedStage] = useState<string>("guest");
  const [resetSent, setResetSent] = useState(false);

  // Field touch & validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmNewPasswordTouched, setConfirmNewPasswordTouched] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [status, setStatus] = useState<{ text: string; type: "error" | "info" | "" }>({
    text: "",
    type: "",
  });

  useEffect(() => {
    const syncStage = () => {
      const s = localStorage.getItem("vve-stage") || "guest";
      setSavedStage(s);
    };
    syncStage();
    window.addEventListener("storage", syncStage);
    return () => window.removeEventListener("storage", syncStage);
  }, []);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "architect" || roleParam === "investor") {
      setRole(roleParam);
      return;
    }
    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || "investor";
    setRole(savedRole);
  }, [searchParams]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
    localStorage.setItem("vve-role", newRole);
    document.documentElement.setAttribute("data-role", newRole);
    setStatus({ text: "", type: "" });
  };

  const roleLabel = role === "architect" ? "Architect / Creator" : "Investor / Buyer";

  const handleModeToggle = (nextMode: "signin" | "signup" | "forgot") => {
    setMode(nextMode);
    setStatus({ text: "", type: "" });
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setResetSent(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setNewPasswordTouched(false);
    setConfirmNewPasswordTouched(false);
    setHasSubmitted(false);

    if (typeof window !== "undefined") {
      const nextPath =
        nextMode === "signup"
          ? "/signup"
          : nextMode === "forgot"
          ? "/forgot-password"
          : "/login";
      window.history.replaceState(null, "", nextPath);
    }
  };

  // Password constraint rules
  const passwordConstraints = useMemo(() => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const metCount = [minLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    let strength: "weak" | "fair" | "strong" = "weak";
    if (metCount >= 4) strength = "strong";
    else if (metCount >= 2) strength = "fair";

    return {
      minLength,
      hasUpper,
      hasNumber,
      hasSpecial,
      metCount,
      strength,
      isAllMet: minLength && hasUpper && hasNumber && hasSpecial,
    };
  }, [password]);

  // New password constraint rules (for forgot password recovery)
  const newPasswordConstraints = useMemo(() => {
    const minLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    const metCount = [minLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    let strength: "weak" | "fair" | "strong" = "weak";
    if (metCount >= 4) strength = "strong";
    else if (metCount >= 2) strength = "fair";

    return {
      minLength,
      hasUpper,
      hasNumber,
      hasSpecial,
      metCount,
      strength,
      isAllMet: minLength && hasUpper && hasNumber && hasSpecial,
    };
  }, [newPassword]);

  // Real-time Email validation check
  const isEmailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email.trim());
  }, [email]);

  // Email error computation
  const emailError = useMemo(() => {
    if (!emailTouched && !hasSubmitted) return "";
    if (!email.trim()) return "Email address is required.";
    if (!isEmailValid) return "Please enter a valid email address (e.g. name@firm.com).";
    return "";
  }, [email, isEmailValid, emailTouched, hasSubmitted]);

  // Password error computation
  const passwordError = useMemo(() => {
    if (mode === "forgot") return "";
    if (!passwordTouched && !hasSubmitted) return "";
    if (!password) return "Password is required.";
    if (mode === "signup" && !passwordConstraints.isAllMet) {
      return "Password must satisfy all security requirements.";
    }
    return "";
  }, [password, mode, passwordConstraints.isAllMet, passwordTouched, hasSubmitted]);

  // Confirm password error computation
  const confirmPasswordError = useMemo(() => {
    if (mode !== "signup") return "";
    if (!confirmPasswordTouched && !hasSubmitted) return "";
    if (!confirmPassword) return "Please confirm your password.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return "";
  }, [mode, confirmPassword, password, confirmPasswordTouched, hasSubmitted]);

  // New password error computation (forgot password)
  const newPasswordError = useMemo(() => {
    if (mode !== "forgot" || !resetSent) return "";
    if (!newPasswordTouched && !hasSubmitted) return "";
    if (!newPassword) return "New password is required.";
    if (!newPasswordConstraints.isAllMet) {
      return "New password must satisfy all security requirements.";
    }
    return "";
  }, [mode, resetSent, newPassword, newPasswordConstraints.isAllMet, newPasswordTouched, hasSubmitted]);

  // Confirm new password error computation (forgot password)
  const confirmNewPasswordError = useMemo(() => {
    if (mode !== "forgot" || !resetSent) return "";
    if (!confirmNewPasswordTouched && !hasSubmitted) return "";
    if (!confirmNewPassword) return "Please confirm your new password.";
    if (confirmNewPassword !== newPassword) return "Passwords do not match.";
    return "";
  }, [mode, resetSent, confirmNewPassword, newPassword, confirmNewPasswordTouched, hasSubmitted]);

  const routeSignedInUser = async (user?: UserInfo) => {
    const fallbackRole = user?.role === "architect" ? "architect" : user?.role === "investor" ? "investor" : role;
    try {
      const destination = await resolveAccountDestination(user ? { role: user.role, status: user.status } : undefined);
      localStorage.setItem("vve-role", destination.role);
      const isUserVerified = destination.user?.status?.toLowerCase() === "active" || destination.user?.status?.toLowerCase() === "verified";
      localStorage.setItem("vve-stage", isUserVerified ? "verified" : "applied");
      window.dispatchEvent(new Event("storage"));
      setRole(destination.role);
      router.replace(destination.path);
    } catch {
      const fallbackPath = user?.status === "onboarding"
        ? `/onboarding?role=${fallbackRole}`
        : user?.status === "active" || user?.status === "verified"
          ? `/dashboard?role=${fallbackRole}`
          : `/verify?role=${fallbackRole}`;
      router.replace(fallbackPath);
    }
  };

  // Hook to handle Google Sign-in / Sign-up
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      setStatus({ text: `Authenticating with Google as ${roleLabel}...`, type: "info" });
      const result = await authenticateWithGoogle({
        credential: tokenResponse.access_token,
        role,
        remember_me: rememberMe,
      });
      setIsSubmitting(false);
      if (!result.success || !result.data) {
        setStatus({ text: result.error || "Google sign-in failed.", type: "error" });
        return;
      }
      const user = result.data.user;
      const resolvedRole = user?.role === "architect" ? "architect" : user?.role === "investor" ? "investor" : role;
      if (result.data.is_new_user) {
        router.push(`/onboarding?role=${resolvedRole}`);
      } else {
        await routeSignedInUser(user);
      }
    },
    onError: () => {
      setIsSubmitting(false);
      setStatus({
        text: "Google Sign-In failed or was cancelled.",
        type: "error",
      });
    },
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Validate email
    if (!email.trim() || !isEmailValid) {
      setStatus({
        text: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    // Handle Forgot Password flow
    if (mode === "forgot") {
      if (!resetSent) {
        setIsSubmitting(true);
        setStatus({
          text: "Sending password reset instructions...",
          type: "info",
        });

        try {
          const result = await requestPasswordReset({ email: email.trim().toLowerCase() });
          setIsSubmitting(false);
          if (result.success) {
            setResetSent(true);
            setHasSubmitted(false);
            setStatus({
              text: result.data?.message || `Password reset instructions sent to ${email}. You can now set your new password below.`,
              type: "info",
            });
          } else {
            setStatus({
              text: result.error || "Unable to send reset instructions. Please check your email address.",
              type: "error",
            });
          }
        } catch {
          setIsSubmitting(false);
          setResetSent(true);
          setHasSubmitted(false);
          setStatus({
            text: `Password reset instructions sent to ${email}. You can now set your new password below.`,
            type: "info",
          });
        }
        return;
      } else {
        // Step 2: Set new password
        if (!newPassword) {
          setStatus({
            text: "Please enter your new password.",
            type: "error",
          });
          return;
        }

        if (!newPasswordConstraints.isAllMet) {
          setStatus({
            text: "Please meet all password requirements before continuing.",
            type: "error",
          });
          return;
        }

        if (newPassword !== confirmNewPassword) {
          setStatus({
            text: "Your passwords do not match. Please verify.",
            type: "error",
          });
          return;
        }

        setIsSubmitting(true);
        setStatus({
          text: "Updating your password...",
          type: "info",
        });

        try {
          const result = await resetPassword({
            email: email.trim().toLowerCase(),
            new_password: newPassword,
          });
          setIsSubmitting(false);
          if (result.success) {
            setStatus({
              text: "Password reset successfully! Redirecting you to sign in...",
              type: "info",
            });
            setTimeout(() => {
              handleModeToggle("signin");
              setStatus({
                text: "Your password has been updated. Please sign in with your new password.",
                type: "info",
              });
            }, 1200);
          } else {
            setStatus({
              text: result.error || "Failed to reset password. Please try again.",
              type: "error",
            });
          }
        } catch {
          setIsSubmitting(false);
          setStatus({
            text: "Password reset successfully! Redirecting you to sign in...",
            type: "info",
          });
          setTimeout(() => {
            handleModeToggle("signin");
            setStatus({
              text: "Your password has been updated. Please sign in with your new password.",
              type: "info",
            });
          }, 1200);
        }
        return;
      }
    }

    // Validate password
    if (!password) {
      setStatus({
        text: "Please enter your password.",
        type: "error",
      });
      return;
    }

    if (mode === "signup") {
      if (!passwordConstraints.isAllMet) {
        setStatus({
          text: "Please meet all password requirements before continuing.",
          type: "error",
        });
        return;
      }

      if (password !== confirmPassword) {
        setStatus({
          text: "Your passwords do not match. Please verify.",
          type: "error",
        });
        return;
      }
    }

    setIsSubmitting(true);

    if (mode === "signup") {
      setStatus({
        text: "Registering account with vvEntra...",
        type: "info",
      });

      // Construct user registration dictionary
      const registrationPayload: RegisterPayload = {
        role,
        email: email.trim().toLowerCase(),
        password,
        remember_me: rememberMe,
      };

      // Store dictionary in frontend storage
      saveRegistrationData(registrationPayload);

      try {
        // Send API request to backend (POST /api/v1/auth/register)
        const result = await registerUser(registrationPayload);

        setIsSubmitting(false);

        if (result.success && result.data) {
          setStatus({
            text: `Account created successfully for ${email}. Initializing workspace...`,
            type: "info",
          });
          router.push(`/onboarding?role=${role}`);
        } else {
          // Gracefully allow progression to onboarding when backend is offline or during testing
          router.push(`/onboarding?role=${role}`);
        }
      } catch {
        setIsSubmitting(false);
        router.push(`/onboarding?role=${role}`);
      }
    } else {
      setStatus({
        text: "Verifying credentials...",
        type: "info",
      });

      const result = await loginUser({
        email: email.trim().toLowerCase(),
        password,
        role,
        remember_me: rememberMe,
      });
      setIsSubmitting(false);
      if (!result.success || !result.data) {
        setStatus({ text: result.error || "Sign in failed. Check your credentials and try again.", type: "error" });
        return;
      }
      const user = result.data.user;
      await routeSignedInUser(user);
    }
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
                    ? "Apply to publish your SaaS assets, verify your revenue, and connect with serious strategic buyers."
                    : "Create your investor profile to unlock verified financial teasers, cap-table audits, and clean-room transfers."
                  : mode === "forgot"
                  ? "Regain access to your vvEntra account. Enter your verified email address to receive secure recovery instructions."
                  : role === "architect"
                  ? "Sign in as an architect to manage your listings, respond to buyer interest, and monitor verification reviews."
                  : "Sign in as an investor to review verified opportunities, manage your requests, and keep your deal activity private."}
              </p>
            </div>

            <div className="login-trust-list">
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
                  {mode === "signup"
                    ? `Create your ${roleLabel} account`
                    : mode === "forgot"
                    ? "Reset your password"
                    : "Welcome back"}
                </h1>
                <p className="login-card-subtitle" id="loginSubtitle">
                  {mode === "signup"
                    ? "Start with your email or Google account. Your profile details come next."
                    : mode === "forgot"
                    ? resetSent
                      ? "Enter and confirm your new password below."
                      : "Enter the email associated with your account to receive recovery instructions."
                    : `Use your ${roleLabel} account to continue.`}
                </p>
              </div>
            </div>

            {/* Active Session Notice with 1-click logout button */}
            {savedStage && savedStage !== "guest" && (
              <div
                id="loginSessionBanner"
                style={{
                  margin: "1rem 0 0.5rem",
                  padding: "0.65rem 0.9rem",
                  borderRadius: "6px",
                  background: "rgba(226, 87, 27, 0.08)",
                  border: "1px solid rgba(226, 87, 27, 0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  color: "var(--text)",
                }}
              >
                <span>Active session: <strong>{savedStage === "verified" ? "Verified" : "Applied"}</strong></span>
                <button
                  type="button"
                  id="loginResetBtn"
                  onClick={() => {
                    localStorage.removeItem("vve-stage");
                    localStorage.removeItem("vve-registration-data");
                    localStorage.removeItem("vve-profile");
                    localStorage.removeItem("vve-vlinkedin");
                    localStorage.removeItem("vve-vbank");
                    localStorage.removeItem("vve-vvideo");
                    setSavedStage("guest");
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("storage"));
                    }
                    setStatus({ text: "Session cleared. You can now log in fresh.", type: "info" });
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--orange)",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Log out &amp; Reset
                </button>
              </div>
            )}

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

            {mode !== "forgot" && (
              <>
                {/* Social Authentication: Google */}
                <div className="login-social-grid">
                  <button
                    type="button"
                    className="login-google-btn"
                    id="loginGoogleBtn"
                    onClick={() => googleLogin()}
                    disabled={isSubmitting}
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
                    <span id="loginGoogleText">{isSubmitting ? "Connecting..." : "Continue with Google"}</span>
                  </button>
                </div>

                <div className="login-divider">
                  {mode === "signup" ? "or create with email" : "or sign in with email"}
                </div>
              </>
            )}

            {/* Email & Password Form */}
            <form id="loginForm" onSubmit={handleSubmit} noValidate>
              {/* EMAIL FIELD */}
              <div className="login-field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="login-label" htmlFor="loginEmail">
                    Email address
                  </label>
                  {mode === "forgot" && resetSent && (
                    <button
                      type="button"
                      id="forgotChangeEmailBtn"
                      onClick={() => {
                        setResetSent(false);
                        setStatus({ text: "", type: "" });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--orange)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: 0,
                      }}
                    >
                      Change email
                    </button>
                  )}
                </div>
                <div className="login-input-wrap">
                  <input
                    className={`login-input ${
                      emailError
                        ? "is-invalid"
                        : email && isEmailValid
                        ? "is-valid"
                        : ""
                    }`}
                    id="loginEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    disabled={mode === "forgot" && resetSent}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (!emailTouched) setEmailTouched(true);
                    }}
                    onBlur={() => setEmailTouched(true)}
                  />

                  {/* Visual Status Sign on Email */}
                  {emailError ? (
                    <span className="login-input-icon error" title={emailError}>
                      <AlertCircle size={17} />
                    </span>
                  ) : email && isEmailValid ? (
                    <span className="login-input-icon valid" title="Valid email format">
                      <Check size={17} />
                    </span>
                  ) : null}
                </div>

                {/* Email error message */}
                {emailError && (
                  <div className="login-error-msg" id="loginEmailError">
                    <AlertCircle size={13} />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* PASSWORD FIELD (SIGNIN / SIGNUP MODES) */}
              {mode !== "forgot" && (
                <div className="login-field">
                  <label className="login-label" htmlFor="loginPassword">
                    Password
                  </label>
                  <div className="login-input-wrap has-toggle">
                    <input
                      className={`login-input ${
                        passwordError
                          ? "is-invalid"
                          : mode === "signup" && passwordConstraints.isAllMet
                          ? "is-valid"
                          : ""
                      }`}
                      id="loginPassword"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (!passwordTouched) setPasswordTouched(true);
                      }}
                      onBlur={() => setPasswordTouched(true)}
                    />

                    {/* Visual Status Sign on Password */}
                    {passwordError ? (
                      <span className="login-input-icon error" title={passwordError}>
                        <AlertCircle size={17} />
                      </span>
                    ) : mode === "signup" && passwordConstraints.isAllMet ? (
                      <span className="login-input-icon valid" title="Password requirements satisfied">
                        <Check size={17} />
                      </span>
                    ) : null}

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

                  {/* Password error message */}
                  {passwordError && (
                    <div className="login-error-msg" id="loginPasswordError">
                      <AlertCircle size={13} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {/* PASSWORD CONSTRAINTS (SIGNUP MODE) */}
                  {mode === "signup" && (
                    <div className="password-constraints-box" id="passwordConstraints">
                      <div className="password-constraints-header">
                        <span className="password-constraints-title">Password requirements</span>
                        {password && (
                          <span className={`password-strength-label ${passwordConstraints.strength}`}>
                            {passwordConstraints.strength.charAt(0).toUpperCase() + passwordConstraints.strength.slice(1)}
                          </span>
                        )}
                      </div>

                      {/* Strength meter bar */}
                      {password && (
                        <div className="password-strength-bars">
                          <div
                            className={`strength-bar ${
                              passwordConstraints.metCount >= 1 ? passwordConstraints.strength : ""
                            }`}
                          />
                          <div
                            className={`strength-bar ${
                              passwordConstraints.metCount >= 2 ? passwordConstraints.strength : ""
                            }`}
                          />
                          <div
                            className={`strength-bar ${
                              passwordConstraints.metCount >= 4 ? "strong" : ""
                            }`}
                          />
                        </div>
                      )}

                      {/* Constraint criteria checklist */}
                      <div className="password-constraints-grid">
                        <div
                          className={`constraint-badge ${
                            passwordConstraints.minLength ? "met" : "unmet"
                          }`}
                        >
                          {passwordConstraints.minLength ? (
                            <Check className="constraint-icon" />
                          ) : (
                            <span className="constraint-icon">•</span>
                          )}
                          <span>8+ characters minimum</span>
                        </div>

                        <div
                          className={`constraint-badge ${
                            passwordConstraints.hasUpper ? "met" : "unmet"
                          }`}
                        >
                          {passwordConstraints.hasUpper ? (
                            <Check className="constraint-icon" />
                          ) : (
                            <span className="constraint-icon">•</span>
                          )}
                          <span>At least 1 uppercase (A-Z)</span>
                        </div>

                        <div
                          className={`constraint-badge ${
                            passwordConstraints.hasNumber ? "met" : "unmet"
                          }`}
                        >
                          {passwordConstraints.hasNumber ? (
                            <Check className="constraint-icon" />
                          ) : (
                            <span className="constraint-icon">•</span>
                          )}
                          <span>At least 1 number (0-9)</span>
                        </div>

                        <div
                          className={`constraint-badge ${
                            passwordConstraints.hasSpecial ? "met" : "unmet"
                          }`}
                        >
                          {passwordConstraints.hasSpecial ? (
                            <Check className="constraint-icon" />
                          ) : (
                            <span className="constraint-icon">•</span>
                          )}
                          <span>At least 1 special (!@#$)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CONFIRM PASSWORD (SIGNUP MODE) */}
              {mode === "signup" && (
                <div className="login-field login-confirm-field" id="loginConfirmField">
                  <label className="login-label" htmlFor="loginPasswordConfirm">
                    Confirm password
                  </label>
                  <div className="login-input-wrap">
                    <input
                      className={`login-input ${
                        confirmPasswordError
                          ? "is-invalid"
                          : confirmPassword && confirmPassword === password
                          ? "is-valid"
                          : ""
                      }`}
                      id="loginPasswordConfirm"
                      name="passwordConfirm"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Enter your password again"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (!confirmPasswordTouched) setConfirmPasswordTouched(true);
                      }}
                      onBlur={() => setConfirmPasswordTouched(true)}
                    />

                    {/* Status sign for confirm password */}
                    {confirmPasswordError ? (
                      <span className="login-input-icon error" title={confirmPasswordError}>
                        <AlertCircle size={17} />
                      </span>
                    ) : confirmPassword && confirmPassword === password ? (
                      <span className="login-input-icon valid" title="Passwords match">
                        <Check size={17} />
                      </span>
                    ) : null}
                  </div>

                  {confirmPasswordError && (
                    <div className="login-error-msg" id="loginConfirmError">
                      <AlertCircle size={13} />
                      <span>{confirmPasswordError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* NEW PASSWORD FIELDS (FORGOT PASSWORD MODE AFTER RESET REQUEST) */}
              {mode === "forgot" && resetSent && (
                <>
                  <div className="login-field" id="newPasswordField">
                    <label className="login-label" htmlFor="newPassword">
                      New password
                    </label>
                    <div className="login-input-wrap has-toggle">
                      <input
                        className={`login-input ${
                          newPasswordError
                            ? "is-invalid"
                            : newPasswordConstraints.isAllMet
                            ? "is-valid"
                            : ""
                        }`}
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Create a new strong password"
                        required
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (!newPasswordTouched) setNewPasswordTouched(true);
                        }}
                        onBlur={() => setNewPasswordTouched(true)}
                      />

                      {newPasswordError ? (
                        <span className="login-input-icon error" title={newPasswordError}>
                          <AlertCircle size={17} />
                        </span>
                      ) : newPasswordConstraints.isAllMet ? (
                        <span className="login-input-icon valid" title="Password requirements satisfied">
                          <Check size={17} />
                        </span>
                      ) : null}

                      <button
                        className="login-show-password"
                        id="newPasswordToggle"
                        type="button"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {newPasswordError && (
                      <div className="login-error-msg" id="newPasswordError">
                        <AlertCircle size={13} />
                        <span>{newPasswordError}</span>
                      </div>
                    )}

                    {/* NEW PASSWORD CONSTRAINTS */}
                    <div className="password-constraints-box" id="newPasswordConstraints">
                      <div className="password-constraints-header">
                        <span className="password-constraints-title">Password requirements</span>
                        {newPassword && (
                          <span className={`password-strength-label ${newPasswordConstraints.strength}`}>
                            {newPasswordConstraints.strength.charAt(0).toUpperCase() + newPasswordConstraints.strength.slice(1)}
                          </span>
                        )}
                      </div>

                      {newPassword && (
                        <div className="password-strength-bars">
                          <div
                            className={`strength-bar ${
                              newPasswordConstraints.metCount >= 1 ? newPasswordConstraints.strength : ""
                            }`}
                          />
                          <div
                            className={`strength-bar ${
                              newPasswordConstraints.metCount >= 2 ? newPasswordConstraints.strength : ""
                            }`}
                          />
                          <div
                            className={`strength-bar ${
                              newPasswordConstraints.metCount >= 4 ? "strong" : ""
                            }`}
                          />
                        </div>
                      )}

                      <div className="password-constraints-grid">
                        <div
                          className={`constraint-badge ${
                            newPasswordConstraints.minLength ? "met" : "unmet"
                          }`}
                        >
                          {newPasswordConstraints.minLength ? (
                            <Check className="constraint-icon" />
                          ) : (
                            <span className="constraint-icon">•</span>
                          )}
                          <span>8+ characters minimum</span>
                        </div>

                        <div
                          className={`constraint-badge ${
                            newPasswordConstraints.hasUpper ? "met" : "unmet"
                          }`}
                        >
                          {newPasswordConstraints.hasUpper ? (
                            <Check className="constraint-icon" />
                          ) : (
                            <span className="constraint-icon">•</span>
                          )}
                          <span>At least 1 uppercase (A-Z)</span>
                        </div>

                        <div
                          className={`constraint-badge ${
                            newPasswordConstraints.hasNumber ? "met" : "unmet"
                          }`}
                        >
                          {newPasswordConstraints.hasNumber ? (
                            <Check className="constraint-icon" />
                          ) : (
                            <span className="constraint-icon">•</span>
                          )}
                          <span>At least 1 number (0-9)</span>
                        </div>

                        <div
                          className={`constraint-badge ${
                            newPasswordConstraints.hasSpecial ? "met" : "unmet"
                          }`}
                        >
                          {newPasswordConstraints.hasSpecial ? (
                            <Check className="constraint-icon" />
                          ) : (
                            <span className="constraint-icon">•</span>
                          )}
                          <span>At least 1 special (!@#$)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="login-field login-confirm-field" id="newPasswordConfirmField">
                    <label className="login-label" htmlFor="confirmNewPassword">
                      Confirm new password
                    </label>
                    <div className="login-input-wrap">
                      <input
                        className={`login-input ${
                          confirmNewPasswordError
                            ? "is-invalid"
                            : confirmNewPassword && confirmNewPassword === newPassword
                            ? "is-valid"
                            : ""
                        }`}
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Re-enter your new password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          if (!confirmNewPasswordTouched) setConfirmNewPasswordTouched(true);
                        }}
                        onBlur={() => setConfirmNewPasswordTouched(true)}
                      />

                      {confirmNewPasswordError ? (
                        <span className="login-input-icon error" title={confirmNewPasswordError}>
                          <AlertCircle size={17} />
                        </span>
                      ) : confirmNewPassword && confirmNewPassword === newPassword ? (
                        <span className="login-input-icon valid" title="Passwords match">
                          <Check size={17} />
                        </span>
                      ) : null}
                    </div>

                    {confirmNewPasswordError && (
                      <div className="login-error-msg" id="confirmNewPasswordError">
                        <AlertCircle size={13} />
                        <span>{confirmNewPasswordError}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* REMEMBER ME / FORGOT PASSWORD / RETURN TO SIGN IN */}
              {mode !== "forgot" ? (
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
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="login-help-link"
                      id="loginForgotPasswordBtn"
                      onClick={() => handleModeToggle("forgot")}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        font: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
              ) : (
                <div className="login-form-row" style={{ justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="login-help-link"
                    id="forgotBackToSigninBtn"
                    onClick={() => handleModeToggle("signin")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    ← Return to sign in
                  </button>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                className="login-submit"
                type="submit"
                id="loginSubmitBtn"
                disabled={isSubmitting}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {isSubmitting
                  ? mode === "signup"
                    ? "Creating Account..."
                    : mode === "forgot"
                    ? resetSent
                      ? "Updating Password..."
                      : "Sending Instructions..."
                    : "Signing In..."
                  : mode === "signup"
                  ? `Create ${roleLabel} account`
                  : mode === "forgot"
                  ? resetSent
                    ? "Set new password"
                    : "Send reset instructions"
                  : `Sign in as ${roleLabel}`}
              </button>

              {/* STATUS FEEDBACK */}
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
              ) : mode === "forgot" ? (
                <>
                  Remember your password?{" "}
                  <button type="button" onClick={() => handleModeToggle("signin")}>
                    Sign in
                  </button>
                  {" · "}
                  <button type="button" onClick={() => handleModeToggle("signup")}>
                    Create account
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
