"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  confirmPayoutOnboarding,
  getVerificationStatus,
  isAccountVerificationComplete,
  isVideoVerificationApproved,
  PayoutAccount,
  startPayoutOnboarding,
  submitRecordedVideo,
  VerificationStatusResponse,
  verifyLinkedInProfile,
} from "@/lib/api/verification";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const payoutConfirmationStarted = useRef(false);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordedVideoBlobRef = useRef<Blob | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedVideoUrlRef = useRef<string | null>(null);
  const [role, setRole] = useState<"investor" | "architect">("investor");

  // Verification step states
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isCheckingLinkedin, setIsCheckingLinkedin] = useState(false);
  const [isLinkedinDone, setIsLinkedinDone] = useState(false);
  const [linkedinUsername, setLinkedinUsername] = useState("");
  const [linkedinFeedback, setLinkedinFeedback] = useState<{ type: "info" | "error" | "success"; text: string } | null>(null);

  // Seller specific steps
  const [isConnectingPayout, setIsConnectingPayout] = useState(false);
  const [isConfirmingPayout, setIsConfirmingPayout] = useState(false);
  const [payoutAccount, setPayoutAccount] = useState<PayoutAccount | null>(null);
  const [payoutFeedback, setPayoutFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isBankDone, setIsBankDone] = useState(false);
  const [isVideoDone, setIsVideoDone] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isVideoSubmitted, setIsVideoSubmitted] = useState(false);
  const [videoTimer, setVideoTimer] = useState("0:00");
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [videoFeedback, setVideoFeedback] = useState("");

  // Overall status
  const [isVerified, setIsVerified] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const isSeller = role === "architect";

  useEffect(() => {
    let cancelled = false;
    const roleParam = searchParams.get("role");
    const storedRole = localStorage.getItem("vve-role");
    const resolvedRole = roleParam === "architect" || roleParam === "investor"
      ? roleParam
      : storedRole === "architect" || storedRole === "investor"
        ? storedRole
        : "investor";
    const isArchitect = resolvedRole === "architect";
    // Browser storage is only available after hydration; reconcile the page role once here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(resolvedRole);
    document.documentElement.setAttribute("data-role", resolvedRole);
    localStorage.setItem("vve-role", resolvedRole);
    const linkedinVerified = localStorage.getItem("vve-vlinkedin") === "true";
    setIsLinkedinDone(linkedinVerified);
    setLinkedinUsername(localStorage.getItem("vve-linkedin-username") || "");
    setIsVerified(false);
    setIsBankDone(localStorage.getItem("vve-vbank") === "true");

    const applyStatus = (status: VerificationStatusResponse) => {
      const linkedin = status.linkedin ?? status.linkedin_verification;
      if (typeof linkedin?.is_verified === "boolean") {
        setIsLinkedinDone(linkedin.is_verified);
        localStorage.setItem("vve-vlinkedin", String(linkedin.is_verified));
      }
      if (linkedin?.username) {
        setLinkedinUsername(linkedin.username);
        localStorage.setItem("vve-linkedin-username", linkedin.username);
      }
      if ("payout" in status) {
        const payout = status.payout ?? null;
        setPayoutAccount(payout);
        setIsBankDone(Boolean(payout?.is_connected));
        localStorage.setItem("vve-vbank", String(Boolean(payout?.is_connected)));
      }
      const video = status.video_verification;
      if (isArchitect && video) {
        const videoState = typeof video.status === "string"
          ? video.status.trim().toLowerCase()
          : typeof video.is_verified === "string" ? video.is_verified.trim().toLowerCase() : "";
        const rejected = videoState === "invalid";
        const approved = isVideoVerificationApproved(status);
        const submitted = video.is_submitted === true && !rejected;
        setIsVideoSubmitted(submitted && !approved);
        setIsVideoDone(approved || submitted);
        if (rejected) {
          setVideoFeedback(video.message || "Your previous video did not meet the verification requirements. Please record and submit a new video.");
        } else if (submitted && !approved) {
          setVideoFeedback(video.message || "Your video is under review. Verification is usually completed within 24 hours.");
        }
      } else if (typeof video?.is_verified === "boolean") {
        setIsVideoDone(video.is_verified);
      }

      const accountVerified = isAccountVerificationComplete(status);
      if (accountVerified) {
        setIsVerified(true);
        localStorage.setItem("vve-stage", "verified");
        window.dispatchEvent(new Event("storage"));
        if (isArchitect) router.replace("/dashboard?role=architect");
      } else if (typeof status.is_verified === "boolean") {
        setIsVerified(status.is_verified);
        localStorage.setItem("vve-stage", status.is_verified ? "verified" : "applied");
        window.dispatchEvent(new Event("storage"));
      }
    };

    const loadStatus = async () => {
      try {
        const status = await getVerificationStatus();
        if (!cancelled) applyStatus(status);
      } catch (error) {
        if (!cancelled && (searchParams.get("payout_success") === "true" || searchParams.get("payout_connected") === "true")) {
          setPayoutFeedback({ type: "error", text: error instanceof Error ? error.message : "Could not confirm your payout account." });
        }
      }
    };

    const payoutReturned = searchParams.get("payout_success") === "true" || searchParams.get("payout_connected") === "true";
    if (payoutReturned && isArchitect && !payoutConfirmationStarted.current) {
      payoutConfirmationStarted.current = true;
      setIsConfirmingPayout(true);
      setPayoutFeedback(null);
      void (async () => {
        try {
          const confirmation = await confirmPayoutOnboarding();
          applyStatus(confirmation);
          const status = await getVerificationStatus();
          applyStatus(status);
          setPayoutFeedback({ type: "success", text: "Payout account connected securely." });
        } catch (error) {
          setPayoutFeedback({ type: "error", text: error instanceof Error ? error.message : "Could not confirm your payout account." });
        } finally {
          setIsConfirmingPayout(false);
          router.replace(`/verify?role=${resolvedRole}`);
        }
      })();
    } else if (payoutReturned && isArchitect) {
      // React Strict Mode can replay effects in development; the confirmation is already in flight.
    } else {
      void loadStatus();
    }

    return () => { cancelled = true; };
  }, [searchParams, router]);

  // Keep a submitted architect video in sync while this page remains open.
  useEffect(() => {
    if (!isSeller || !isVideoSubmitted || isVerified) return;
    let cancelled = false;
    const pollReviewStatus = async () => {
      try {
        const status = await getVerificationStatus();
        if (cancelled) return;
        const video = status.video_verification;
        const videoState = typeof video?.status === "string"
          ? video.status.trim().toLowerCase()
          : typeof video?.is_verified === "string" ? video.is_verified.trim().toLowerCase() : "";

        if (isAccountVerificationComplete(status)) {
          setIsVerified(true);
          setIsVideoDone(true);
          localStorage.setItem("vve-stage", "verified");
          window.dispatchEvent(new Event("storage"));
          router.replace("/dashboard?role=architect");
        } else if (videoState === "invalid") {
          setIsVideoSubmitted(false);
          setIsVideoDone(false);
          setVideoFeedback(video?.message || "Your previous video did not meet the verification requirements. Please record and submit a new video.");
        } else if (video?.is_submitted === true) {
          setVideoFeedback(video.message || "Your video is under review. Verification is usually completed within 24 hours.");
        }
      } catch {
        // A temporary status API failure should not discard the submitted video state.
      }
    };

    const timer = window.setInterval(() => { void pollReviewStatus(); }, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isSeller, isVideoSubmitted, isVerified, router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleConnectLinkedin = async () => {
    const normalizedUrl = linkedinUrl.trim();
    if (!/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9%_-]+\/?(?:\?.*)?$/.test(normalizedUrl)) {
      setLinkedinFeedback({ type: "error", text: "Enter a valid URL in the format https://www.linkedin.com/in/username." });
      return;
    }
    setVerificationFailed(false);
    setIsCheckingLinkedin(true);
    setLinkedinFeedback({ type: "info", text: "Connecting to LinkedIn verification…" });
    try {
      const result = await verifyLinkedInProfile(normalizedUrl);
      if (!result.success || !result.is_verified) {
        setVerificationFailed(true);
        setLinkedinFeedback({ type: "error", text: "LinkedIn profile verification failed. Please check your account and try again." });
        showToast(result.message || "LinkedIn profile could not be verified.");
        return;
      }
      setVerificationFailed(false);
      setLinkedinUrl(result.linkedin_url);
      setLinkedinUsername(result.username);
      setIsLinkedinDone(true);
      localStorage.setItem("vve-vlinkedin", "true");
      localStorage.setItem("vve-linkedin-url", result.linkedin_url);
      localStorage.setItem("vve-linkedin-username", result.username);
      if (!isSeller) {
        setIsVerified(true);
        localStorage.setItem("vve-stage", "verified");
        window.dispatchEvent(new Event("storage"));
      }
      setLinkedinFeedback({ type: "success", text: result.message || "LinkedIn profile verified successfully." });
      showToast(result.message || "LinkedIn profile verified successfully.");
    } catch (error) {
      setVerificationFailed(true);
      setLinkedinFeedback({ type: "error", text: error instanceof Error ? error.message : "LinkedIn verification failed. Please try again." });
      showToast(error instanceof Error ? error.message : "LinkedIn verification failed. Please try again.");
    } finally {
      setIsCheckingLinkedin(false);
    }
  };

  const handleConnectPayout = async () => {
    setIsConnectingPayout(true);
    setPayoutFeedback(null);
    const returnUrl = `${window.location.origin}/verify?role=architect&payout_success=true`;
    const refreshUrl = `${window.location.origin}/verify?role=architect`;
    try {
      const session = await startPayoutOnboarding(returnUrl, refreshUrl);
      if (!session.onboarding_url) throw new Error("The payout service did not return an onboarding link.");
      const onboardingUrl = new URL(session.onboarding_url);
      const isLocalDevelopmentUrl = onboardingUrl.protocol === "http:" && ["localhost", "127.0.0.1"].includes(onboardingUrl.hostname);
      if (onboardingUrl.protocol !== "https:" && !isLocalDevelopmentUrl) {
        throw new Error("The payout service returned an insecure onboarding link.");
      }
      window.location.assign(onboardingUrl.href);
    } catch (error) {
      setPayoutFeedback({ type: "error", text: error instanceof Error ? error.message : "Could not start payout account setup." });
      setIsConnectingPayout(false);
    }
  };

  const stopVideoRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    recordingIntervalRef.current = null;
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (videoElementRef.current) videoElementRef.current.srcObject = null;
  };

  const handleStartVideo = async () => {
    setVideoFeedback("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVideoFeedback("Camera recording is not supported by this browser. Please use a current version of Chrome, Edge, or Firefox.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      cameraStreamRef.current = stream;
      recordedChunksRef.current = [];
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        await videoElementRef.current.play();
      }
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (recordedChunksRef.current.length) {
          const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "video/webm" });
          recordedVideoBlobRef.current = blob;
          const url = URL.createObjectURL(blob);
          if (recordedVideoUrlRef.current) URL.revokeObjectURL(recordedVideoUrlRef.current);
          recordedVideoUrlRef.current = url;
          setRecordedVideoUrl(url);
          setIsVideoDone(true);
          setVideoFeedback("");
        }
        setIsVideoRecording(false);
      };
      recorder.start(1000);
      const startedAt = Date.now();
      setIsVideoRecording(true);
      setIsVideoDone(false);
      setVideoTimer("0:00");
      recordingIntervalRef.current = setInterval(() => {
        const elapsed = Math.min(120, Math.floor((Date.now() - startedAt) / 1000));
        setVideoTimer(`${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`);
        if (elapsed >= 120) stopVideoRecording();
      }, 1000);
    } catch (error) {
      stopVideoRecording();
      setVideoFeedback(error instanceof Error && error.name === "NotAllowedError"
        ? "Camera access was blocked. Allow camera and microphone access, then try again."
        : "Could not start your camera. Check that it is connected and not being used by another app.");
    }
  };

  const handleRetakeVideo = () => {
    if (isUploadingVideo || isVideoSubmitted) return;
    stopVideoRecording();
    if (recordedVideoUrlRef.current) URL.revokeObjectURL(recordedVideoUrlRef.current);
    recordedVideoUrlRef.current = null;
    recordedVideoBlobRef.current = null;
    setRecordedVideoUrl(null);
    setIsVideoDone(false);
    setVideoTimer("0:00");
    setVideoFeedback("");
  };

  const handleSubmitVideo = async () => {
    const videoBlob = recordedVideoBlobRef.current;
    if (!videoBlob) {
      setVideoFeedback("Your recording is not available. Please record the verification video again.");
      return;
    }
    setIsUploadingVideo(true);
    setVideoFeedback("");
    try {
      const result = await submitRecordedVideo(videoBlob);
      setIsVideoSubmitted(true);
      setVideoFeedback(result.message || "Your video was uploaded and queued for review.");
    } catch (error) {
      setVideoFeedback(error instanceof Error ? error.message : "Could not upload your verification video. Please try again.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  useEffect(() => () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (recordedVideoUrlRef.current) URL.revokeObjectURL(recordedVideoUrlRef.current);
  }, []);

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

  const progressPercent = isVerified
    ? 100
    : Math.round((completedCount() / totalSteps) * 100);

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
                  {isVerified ? "Identity verified" : "Verification in progress"}
                </span>
                <span className="verify-status-sub" id="verifyStatusSub">
                  {isVerified
                    ? isSeller
                      ? "You can list opportunities, meet buyers, and receive payouts."
                      : "You can unlock opportunities and engage with listers."
                    : "Complete each step below to activate your account."}
                </span>
              </div>
              <span className={`verify-status-badge ${isVerified ? "verified" : "pending"}`} id="verifyStatusBadge">
                {isVerified ? "Verified" : "Unverified"}
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
                        aria-invalid={linkedinFeedback?.type === "error"}
                        onChange={(e) => {
                          setLinkedinUrl(e.target.value);
                          setLinkedinFeedback(null);
                          setVerificationFailed(false);
                        }}
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
                      {isCheckingLinkedin ? "Checking…" : "Connect LinkedIn"}
                    </button>
                  </div>
                  {linkedinFeedback && (
                    <p
                      id="verifyLinkedinFeedback"
                      role={linkedinFeedback.type === "error" ? "alert" : "status"}
                      aria-live="polite"
                      style={{
                        margin: "0.65rem 0 0",
                        color: linkedinFeedback.type === "error" ? "var(--red)" : linkedinFeedback.type === "success" ? "var(--green)" : "var(--text-muted)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {linkedinFeedback.text}
                    </p>
                  )}
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
                        {linkedinUsername ? `Verified · ${linkedinUsername}` : "Profile verified"}
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
                      onClick={handleConnectPayout}
                      disabled={isConnectingPayout || isConfirmingPayout}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                      {isConnectingPayout ? "Opening secure setup…" : isConfirmingPayout ? "Confirming payout account…" : "Connect payout account securely"}
                    </button>
                    {(isConnectingPayout || isConfirmingPayout) && (
                      <div className="verify-bank-checking" id="verifyBankChecking">
                        <span className="vli-spinner" />
                        <span>{isConfirmingPayout ? "Confirming your connected account…" : "Preparing secure connection…"}</span>
                      </div>
                    )}
                    {payoutFeedback && (
                      <p
                        id="payoutFeedback"
                        role={payoutFeedback.type === "error" ? "alert" : "status"}
                        style={{
                          margin: "0.65rem 0 0",
                          color: payoutFeedback.type === "error" ? "var(--red)" : "var(--green)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {payoutFeedback.text}
                      </p>
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
                        <span className="vli-done-name">{payoutAccount?.bank_name || "Payout account connected"}</span>
                        <span className="vli-done-meta">
                          {payoutAccount?.last4 ? `Account ending ••${payoutAccount.last4}` : "Connected securely"}
                          {payoutAccount?.currency ? ` · ${payoutAccount.currency}` : ""}
                        </span>
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
                    {isVideoSubmitted ? "Pending review" : isVideoDone ? "Ready to submit" : isBankDone ? "Required" : "Locked"}
                  </span>
                </div>
                {isBankDone && (
                  <div className="verify-step-body" data-body-for="video">
                    <div className="verify-video-stage" id="verifyVideoStage">
                      <div className={`vv-frame ${isVideoRecording ? "live" : ""}`} id="vvFrame">
                        <video
                          ref={videoElementRef}
                          className="vv-camera-video"
                          autoPlay
                          muted
                          playsInline
                          controls={Boolean(recordedVideoUrl)}
                          src={recordedVideoUrl ?? undefined}
                          aria-label={recordedVideoUrl ? "Recorded verification video" : "Camera preview"}
                        />
                        {!isVideoRecording && !recordedVideoUrl && (
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
                      </div>
                      <div className="vv-checklist" id="vvChecklist">
                        <div className="vv-chk">
                          <span className="vv-chk-box">1</span>State your full name
                        </div>
                        <div className="vv-chk">
                          <span className="vv-chk-box">2</span>Hold your government ID to camera
                        </div>
                        <div className="vv-chk">
                          <span className="vv-chk-box">3</span>Confirm you are 18 or older
                        </div>
                        <div className="vv-chk">
                          <span className="vv-chk-box">4</span>Turn your head left, then right
                        </div>
                      </div>
                      <div className="vv-actions">
                        {isVideoDone ? (
                          <button className="vv-start-btn vv-submit-btn" id="vvSubmitBtn" type="button" onClick={handleSubmitVideo} disabled={isUploadingVideo || isVideoSubmitted} style={isVideoSubmitted ? { cursor: "not-allowed", backgroundColor: "#10a34a", color: "#fff" } : undefined}>
                            {isUploadingVideo ? "Uploading video…" : isVideoSubmitted ? "Submitted for review" : "Submit for verification"}
                          </button>
                        ) : (
                          <button
                            className="vv-start-btn"
                            id="vvStartBtn"
                            type="button"
                            onClick={isVideoRecording ? stopVideoRecording : handleStartVideo}
                            disabled={!isBankDone}
                          >
                            {isVideoRecording ? "Done" : "Start 2-minute verification"}
                          </button>
                        )}
                        {isVideoDone && !isVideoSubmitted && (
                          <button className="vv-retake-btn" id="vvRetakeBtn" type="button" onClick={handleRetakeVideo}>
                            Retake
                          </button>
                        )}
                      </div>
                      {videoFeedback && !isVideoSubmitted && (
                        <p className="vv-feedback error" role="alert">{videoFeedback}</p>
                      )}
                      <div
                        className={`verify-id-note ${isVideoSubmitted ? "submitted" : ""}`}
                        style={isVideoSubmitted ? { color: "#00a83b", fontWeight: 600 } : undefined}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        {isVideoSubmitted
                          ? videoFeedback
                          : "Your recording stays in this browser until you submit it securely for review. It is only used to confirm your identity and is never shown to buyers or other users."}
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

          {/* Verified Outcome */}
          {verificationFailed && !isVerified && (
            <div className="verify-review-state" id="verificationFailedState" role="alert">
              <div className="vrs-icon" style={{ background: "rgba(220,38,38,.1)", borderColor: "rgba(220,38,38,.25)", color: "var(--red)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "1.6rem", margin: "0.75rem 0 0.5rem", color: "var(--text)" }}>
                Verification Failed
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", maxWidth: "420px", margin: "0 auto", lineHeight: 1.6 }}>
                Failed to verify your LinkedIn Profile. Please ensure you have a valid and active LinkedIn account
              </p>
            </div>
          )}

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
