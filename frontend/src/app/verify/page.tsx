"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"investor" | "architect">("investor");

  // Verification step states
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isCheckingLinkedin, setIsCheckingLinkedin] = useState(false);
  const [isLinkedinDone, setIsLinkedinDone] = useState(false);

  // Seller specific steps
  const [isCheckingBank, setIsCheckingBank] = useState(false);
  const [isBankDone, setIsBankDone] = useState(false);
  const [isVideoDone, setIsVideoDone] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoTimer, setVideoTimer] = useState("0:00");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [activePromptIdx, setActivePromptIdx] = useState(0);

  // Overall status
  const [isUnderReview, setIsUnderReview] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const isSeller = role === "architect";

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "architect" || roleParam === "investor") {
      setRole(roleParam);
      document.documentElement.setAttribute("data-role", roleParam);
      localStorage.setItem("vve-role", roleParam);
    } else {
      const savedRole = localStorage.getItem("vve-role") as "investor" | "architect";
      if (savedRole === "architect" || savedRole === "investor") {
        setRole(savedRole);
        document.documentElement.setAttribute("data-role", savedRole);
      }
    }

    const savedStage = localStorage.getItem("vve-stage");
    if (savedStage === "verified") {
      setIsVerified(true);
      setIsLinkedinDone(true);
      if (isSeller) {
        setIsBankDone(true);
        setIsVideoDone(true);
      }
    }
  }, [searchParams, isSeller]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleConnectLinkedin = () => {
    if (!linkedinUrl.trim() || !linkedinUrl.includes("linkedin.com")) {
      showToast("Enter your LinkedIn profile URL to continue.");
      return;
    }
    setIsCheckingLinkedin(true);
    setTimeout(() => {
      setIsCheckingLinkedin(false);
      setIsLinkedinDone(true);
      localStorage.setItem("vve-vlinkedin", "true");
    }, 1400);
  };

  const handleConnectBank = () => {
    setIsCheckingBank(true);
    setTimeout(() => {
      setIsCheckingBank(false);
      setIsBankDone(true);
      localStorage.setItem("vve-vbank", "true");
    }, 1500);
  };

  const handleStartVideo = () => {
    setIsVideoRecording(true);
    setActivePromptIdx(0);
    setVideoPrompt("Please state your full name");

    const prompts = [
      { text: "Please state your full name", time: 0 },
      { text: "Hold your government ID up to the camera", time: 2 },
      { text: 'Confirm: "I am 18 years or older"', time: 4 },
      { text: "Slowly turn your head left, then right", time: 6 },
    ];

    let sec = 0;
    const interval = setInterval(() => {
      sec++;
      const m = Math.floor(sec / 60);
      const s = String(sec % 60).padStart(2, "0");
      setVideoTimer(`${m}:${s}`);

      if (sec === 2) {
        setActivePromptIdx(1);
        setVideoPrompt(prompts[1].text);
      } else if (sec === 4) {
        setActivePromptIdx(2);
        setVideoPrompt(prompts[2].text);
      } else if (sec === 6) {
        setActivePromptIdx(3);
        setVideoPrompt(prompts[3].text);
      } else if (sec >= 8) {
        clearInterval(interval);
        setVideoPrompt("✓ Video verification complete");
        setTimeout(() => {
          setIsVideoRecording(false);
          setIsVideoDone(true);
          localStorage.setItem("vve-vvideo", "true");
        }, 1200);
      }
    }, 1000);
  };

  const totalSteps = isSeller ? 5 : 3;

  const completedCount = () => {
    let done = 1; // Step 1 Account created is always complete
    if (isLinkedinDone) done++;
    if (isSeller) {
      if (isBankDone) done++;
      if (isVideoDone) done++;
    }
    if (isVerified) done = totalSteps;
    return done;
  };

  const allChecksDone = isSeller
    ? isLinkedinDone && isBankDone && isVideoDone
    : isLinkedinDone;

  const progressPercent = isVerified
    ? 100
    : Math.round((completedCount() / totalSteps) * 100);

  const handleSubmitVerification = () => {
    if (!allChecksDone) return;
    setIsUnderReview(true);
    setTimeout(() => {
      setIsUnderReview(false);
      setIsVerified(true);
      localStorage.setItem("vve-stage", "verified");
      showToast("Identity verified. Your account is now active.");
    }, 1800);
  };

  return (
    <>
      <Navbar currentRole={role} onRoleChange={(r) => setRole(r)} />

      <main data-page="verify" className="page verify-page">
        <div className="container" style={{ maxWidth: "720px", paddingTop: "5rem", paddingBottom: "6rem", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          {/* Header */}
          <div className="section-head reveal" style={{ marginBottom: "2.5rem" }}>
            <div className="section-marker" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="num" style={{ font: "600 0.72rem 'JetBrains Mono', monospace", color: "var(--orange)" }}>02</span>
              <span className="line" style={{ width: "20px", height: "1px", background: "var(--line-strong)" }} />
              <span className="name" style={{ font: "500 0.75rem 'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                Identity verification
              </span>
            </div>
            <h1 className="display lg" style={{ fontFamily: "'Instrument Serif', serif", fontSize: " clamp(2.2rem, 5vw, 3rem)", fontWeight: 400, margin: "0 0 0.8rem", color: "var(--text)", lineHeight: 1.05 }}>
              Verify your <em style={{ color: "var(--orange)", fontStyle: "italic" }}>identity.</em>
            </h1>
            <p className="lead" style={{ maxWidth: "540px", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }} id="verifyIntro">
              {isSeller
                ? "Listers are the people whose work backs every opportunity. Your verification goes deepest: professional identity, a connected payout account, and a short live video check."
                : "Buyers confirm a real professional identity through LinkedIn. This protects every lister you engage with."}
            </p>
          </div>

          {/* Status Card */}
          <div className="verify-status-card" id="verifyStatusCard">
            <div className="verify-status-row">
              <div className={`verify-status-icon ${isVerified ? "verified" : "pending"}`} id="verifyStatusIcon">
                {isVerified ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
              </div>
              <div className="verify-status-text">
                <span className="verify-status-title" id="verifyStatusTitle">
                  {isVerified ? "Identity verified" : isUnderReview ? "Under review" : "Verification in progress"}
                </span>
                <span className="verify-status-sub" id="verifyStatusSub">
                  {isVerified
                    ? isSeller
                      ? "You can list opportunities, meet buyers, and receive payouts."
                      : "You can unlock opportunities and engage with listers."
                    : isUnderReview
                    ? "Your verification has been submitted. This completes shortly."
                    : "Complete each step below to activate your account."}
                </span>
              </div>
              <span className={`verify-status-badge ${isVerified ? "verified" : "pending"}`} id="verifyStatusBadge">
                {isVerified ? "Verified" : isUnderReview ? "Under review" : "Unverified"}
              </span>
            </div>
            <div className="verify-progress-track">
              <div className="verify-progress-bar" id="verifyProgressBar" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="verify-progress-label" id="verifyProgressLabel">
              {isVerified ? "Verification complete" : `Step ${completedCount()} of ${totalSteps}`}
            </span>
          </div>

          {/* Role Banner */}
          <div className="verify-role-banner" id="verifyRoleBanner">
            <span className="vrb-label">Verifying as</span>
            <span className="vrb-role" id="verifyRoleName">
              {isSeller ? "Lister / Architect" : "Buyer / Investor"}
            </span>
            <span className="vrb-note" id="verifyRoleNote">
              {isSeller
                ? "Listers complete the full check: LinkedIn, payout account, and a live video verification."
                : "Buyers confirm professional identity through LinkedIn."}
            </span>
          </div>

          {/* Steps List */}
          <div className="verify-steps" id="verifySteps">
            {/* STEP 1: Account Created */}
            <div className="verify-step" data-vstep="account">
              <div className="verify-step-head">
                <span className="vstep-num done">✓</span>
                <div className="vstep-info">
                  <span className="vstep-title">Account created</span>
                  <span className="vstep-sub">Email confirmed and account active.</span>
                </div>
                <span className="vstep-state done">Complete</span>
              </div>
            </div>

            {/* STEP 2: LinkedIn */}
            <div className={`verify-step ${isLinkedinDone ? "" : "active"}`} data-vstep="linkedin">
              <div className="verify-step-head">
                <span className={`vstep-num ${isLinkedinDone ? "done" : "active"}`}>
                  {isLinkedinDone ? "✓" : "2"}
                </span>
                <div className="vstep-info">
                  <span className="vstep-title">Professional identity · LinkedIn</span>
                  <span className="vstep-sub">
                    Connect your LinkedIn so we can confirm you are a real professional. We check your name, headline,
                    and account standing.
                  </span>
                </div>
                <span className={`vstep-state ${isLinkedinDone ? "done" : "active"}`} data-state-for="linkedin">
                  {isLinkedinDone ? "Complete" : "Required"}
                </span>
              </div>
              {!isLinkedinDone && (
                <div className="verify-step-body">
                  <div className="verify-linkedin-row" data-li-input>
                    <div className="verify-li-field">
                      <label className="apply-label">Your LinkedIn profile URL</label>
                      <input
                        className="apply-input"
                        id="verifyLinkedinUrl"
                        type="url"
                        placeholder="https://www.linkedin.com/in/your-profile"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                      />
                    </div>
                    <button
                      className="verify-li-btn"
                      id="verifyLinkedinBtn"
                      type="button"
                      onClick={handleConnectLinkedin}
                      disabled={isCheckingLinkedin}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17V10.5H6.17V17h2.17zM7.25 9.46a1.26 1.26 0 1 0 0-2.52 1.26 1.26 0 0 0 0 2.52zM18 17v-3.57c0-1.9-.4-3.36-2.63-3.36a2.3 2.3 0 0 0-2.07 1.14h-.03V10.5h-2.08V17h2.17v-3.21c0-.85.16-1.67 1.21-1.67s1.06.97 1.06 1.73V17H18z" />
                      </svg>
                      Connect LinkedIn
                    </button>
                  </div>
                  {isCheckingLinkedin && (
                    <div className="verify-li-checking" data-li-checking>
                      <span className="vli-spinner" />
                      <span>Checking profile…</span>
                    </div>
                  )}
                  <div className="verify-id-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    We never post to your LinkedIn or contact your connections. We read your public profile once to confirm
                    identity.
                  </div>
                </div>
              )}
              {isLinkedinDone && (
                <div className="verify-step-body">
                  <div className="verify-li-done" data-li-done>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div className="vli-done-info">
                      <span className="vli-done-name" data-li-name>
                        Profile verified
                      </span>
                      <span className="vli-done-meta" data-li-meta>
                        Real professional confirmed · account in good standing
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SELLER ONLY: Bank payout */}
            {isSeller && (
              <div className={`verify-step ${isBankDone ? "" : isLinkedinDone ? "active" : "locked"}`} data-vstep="bank">
                <div className="verify-step-head">
                  <span className={`vstep-num ${isBankDone ? "done" : isLinkedinDone ? "active" : "locked"}`}>
                    {isBankDone ? "✓" : "3"}
                  </span>
                  <div className="vstep-info">
                    <span className="vstep-title">Payout account</span>
                    <span className="vstep-sub">
                      Connect the bank account where your earnings are paid. Handled securely through our payments partner.
                      vvEntra never sees or stores your bank details.
                    </span>
                  </div>
                  <span
                    className={`vstep-state ${isBankDone ? "done" : isLinkedinDone ? "active" : "locked"}`}
                    data-state-for="bank"
                  >
                    {isBankDone ? "Complete" : isLinkedinDone ? "Required" : "Locked"}
                  </span>
                </div>
                {isLinkedinDone && !isBankDone && (
                  <div className="verify-step-body" data-body-for="bank">
                    <button
                      className="verify-bank-connect"
                      id="verifyBankBtn"
                      type="button"
                      onClick={handleConnectBank}
                      disabled={isCheckingBank}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                      Connect payout account securely
                    </button>
                    {isCheckingBank && (
                      <div className="verify-bank-checking" id="verifyBankChecking">
                        <span className="vli-spinner" />
                        <span>Opening secure connection…</span>
                      </div>
                    )}
                    <div className="verify-id-note">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Your payout account is connected through our regulated payments partner. vvEntra stores only a secure
                      reference, never your account number.
                    </div>
                  </div>
                )}
                {isBankDone && (
                  <div className="verify-step-body">
                    <div className="verify-bank-done" id="verifyBankDone">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div className="vli-done-info">
                        <span className="vli-done-name">Payout account connected</span>
                        <span className="vli-done-meta">Account ending ••4471 · linked under your verified identity</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SELLER ONLY: Video check */}
            {isSeller && (
              <div
                className={`verify-step ${isVideoDone ? "" : isBankDone ? "active" : "locked"}`}
                data-vstep="video"
              >
                <div className="verify-step-head">
                  <span className={`vstep-num ${isVideoDone ? "done" : isBankDone ? "active" : "locked"}`}>
                    {isVideoDone ? "✓" : "4"}
                  </span>
                  <div className="vstep-info">
                    <span className="vstep-title">Live video verification · 2 minutes</span>
                    <span className="vstep-sub">
                      A short recorded check. You state your name, show your government ID, and confirm your age. This proves
                      a real person stands behind every listing.
                    </span>
                  </div>
                  <span
                    className={`vstep-state ${isVideoDone ? "done" : isBankDone ? "active" : "locked"}`}
                    data-state-for="video"
                  >
                    {isVideoDone ? "Complete" : isBankDone ? "Required" : "Locked"}
                  </span>
                </div>
                {isBankDone && !isVideoDone && (
                  <div className="verify-step-body" data-body-for="video">
                    <div className="verify-video-stage" id="verifyVideoStage">
                      <div className={`vv-frame ${isVideoRecording ? "live" : ""}`} id="vvFrame">
                        {!isVideoRecording && (
                          <div className="vv-placeholder" id="vvPlaceholder">
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                              <path d="M23 7l-7 5 7 5V7z" />
                              <rect x="1" y="5" width="15" height="14" rx="2" />
                            </svg>
                            <span>Camera preview</span>
                          </div>
                        )}
                        {isVideoRecording && (
                          <div className="vv-rec" id="vvRec">
                            <span className="vv-rec-dot" />
                            REC <span id="vvRecTime">{videoTimer}</span>
                          </div>
                        )}
                        {isVideoRecording && (
                          <div className="vv-prompt" id="vvPrompt">
                            {videoPrompt}
                          </div>
                        )}
                      </div>
                      <div className="vv-checklist" id="vvChecklist">
                        <div className={`vv-chk ${activePromptIdx >= 0 && isVideoRecording ? (activePromptIdx > 0 ? "done" : "active") : ""}`}>
                          <span className="vv-chk-box">1</span>State your full name
                        </div>
                        <div className={`vv-chk ${activePromptIdx >= 1 && isVideoRecording ? (activePromptIdx > 1 ? "done" : "active") : ""}`}>
                          <span className="vv-chk-box">2</span>Hold your government ID to camera
                        </div>
                        <div className={`vv-chk ${activePromptIdx >= 2 && isVideoRecording ? (activePromptIdx > 2 ? "done" : "active") : ""}`}>
                          <span className="vv-chk-box">3</span>Confirm you are 18 or older
                        </div>
                        <div className={`vv-chk ${activePromptIdx >= 3 && isVideoRecording ? (activePromptIdx > 3 ? "done" : "active") : ""}`}>
                          <span className="vv-chk-box">4</span>Turn your head left, then right
                        </div>
                      </div>
                      <div className="vv-actions">
                        {!isVideoRecording && (
                          <button className="uj-btn-primary" id="vvStartBtn" type="button" onClick={handleStartVideo}>
                            Start 2-minute verification
                          </button>
                        )}
                      </div>
                      <div className="verify-id-note">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        The recording is reviewed by our verification team for liveness and ID match. It is never shown to
                        buyers or other users.
                      </div>
                    </div>
                  </div>
                )}
                {isVideoDone && (
                  <div className="verify-step-body">
                    <div className="verify-li-done">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div className="vli-done-info">
                        <span className="vli-done-name">Video check complete</span>
                        <span className="vli-done-meta">Liveness confirmed · ID verification recorded</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FINAL STEP: Verified */}
            <div className={`verify-step ${isVerified ? "" : "locked"}`} data-vstep="done">
              <div className="verify-step-head">
                <span className={`vstep-num ${isVerified ? "done" : "locked"}`}>
                  {isVerified ? "✓" : totalSteps}
                </span>
                <div className="vstep-info">
                  <span className="vstep-title">Verified</span>
                  <span className="vstep-sub" id="vstepDoneSub">
                    {isSeller
                      ? "Your account is activated. You can list opportunities, meet buyers, and receive payouts."
                      : "Your account is activated. You can unlock opportunities and engage with listers."}
                  </span>
                </div>
                <span className={`vstep-state ${isVerified ? "done" : "locked"}`} data-state-for="done">
                  {isVerified ? "Complete" : "Awaiting"}
                </span>
              </div>
            </div>
          </div>

          {/* Action area */}
          {!isVerified && !isUnderReview && (
            <div className="verify-actions" id="verifyActions">
              <button
                className="uj-btn-primary verify-submit-btn"
                id="verifySubmitBtn"
                type="button"
                disabled={!allChecksDone}
                onClick={handleSubmitVerification}
              >
                Submit for verification
              </button>
              <span className="apply-submit-note" id="verifySubmitNote" style={{ fontSize: "0.85rem", color: "var(--text-faint)" }}>
                {allChecksDone ? "All checks complete. Submit to finish verification." : "Complete the steps above to submit."}
              </span>
            </div>
          )}

          {/* Under Review Outcome */}
          {isUnderReview && (
            <div className="verify-review-state" id="verifyReviewState">
              <div className="vrs-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "1.6rem", margin: "0.75rem 0 0.5rem", color: "var(--text)" }}>
                Under review
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", maxWidth: "400px", margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
                Your verification has been submitted. We are confirming your details. This usually completes within moments.
              </p>
            </div>
          )}

          {/* Verified Outcome */}
          {isVerified && (
            <div className="verify-review-state" id="verifyReviewState">
              <div className="vrs-icon" style={{ background: "rgba(22,163,74,.1)", borderColor: "rgba(22,163,74,.25)", color: "var(--green)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "1.6rem", margin: "0.75rem 0 0.5rem", color: "var(--text)" }}>
                You are verified
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", maxWidth: "420px", margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
                Your account is fully active. Everything on vvEntra is now open to you.
              </p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
                {isSeller ? (
                  <>
                    <Link href="/#list" data-route="list" className="uj-btn-primary">
                      List an opportunity →
                    </Link>
                    <Link href="/#opportunities" data-route="browse" className="uj-btn-ghost">
                      Browse the market
                    </Link>
                  </>
                ) : (
                  <Link href="/#opportunities" data-route="browse" className="uj-btn-primary">
                    Browse opportunities →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Trust Context */}
          <div className="verify-trust-note" style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)" }}>
            <h4 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "1.35rem", margin: "0 0 0.75rem", color: "var(--text)" }}>
              Why verification matters
            </h4>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0 0 0.6rem", lineHeight: 1.6 }}>
              Every deal on vvEntra involves real capital, real IP, and real accountability. Buyers confirm professional
              identity through LinkedIn. Listers go further: bank-linked payouts and a live video check, so every
              opportunity is backed by a verified, real person.
            </p>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
              Architects cannot list. Buyers cannot unlock. Neither side can engage until verification is complete. This is
              the foundation.
            </p>
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="vve-gate-toast show" style={{ zIndex: 9999 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="page verify-page" />}>
      <VerifyContent />
    </Suspense>
  );
}
