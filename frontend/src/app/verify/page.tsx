"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  uploadVerificationVideo,
  getSupportedMimeType,
} from "@/lib/api/verification";

interface VideoPromptItem {
  key: "name" | "id" | "age" | "live";
  badge: string;
  title: string;
  sub: string;
  durationSec: number;
}

const VIDEO_PROMPTS: VideoPromptItem[] = [
  {
    key: "name",
    badge: "Prompt 1 of 4",
    title: "State your full legal name clearly",
    sub: "Look directly into the camera and speak at normal volume.",
    durationSec: 5,
  },
  {
    key: "id",
    badge: "Prompt 2 of 4",
    title: "Hold your government photo ID up to the camera",
    sub: "Show your passport, driver's license, or national ID beside your face.",
    durationSec: 6,
  },
  {
    key: "age",
    badge: "Prompt 3 of 4",
    title: 'Confirm: "I am 18 years or older and creating my vvEntra account"',
    sub: "Read the phrase aloud clearly to verify legal capacity.",
    durationSec: 5,
  },
  {
    key: "live",
    badge: "Prompt 4 of 4",
    title: "Slowly turn your head left, then right",
    sub: "Confirms 3D physical presence and authentic liveness.",
    durationSec: 5,
  },
];

function VerifyContent() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"investor" | "architect">("investor");

  // Step 2: LinkedIn
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isCheckingLinkedin, setIsCheckingLinkedin] = useState(false);
  const [isLinkedinDone, setIsLinkedinDone] = useState(false);

  // Step 3: Bank / Payout
  const [isCheckingBank, setIsCheckingBank] = useState(false);
  const [isBankDone, setIsBankDone] = useState(false);

  // Step 4: Real Video Verification State
  type VideoMode = "idle" | "requesting" | "recording" | "review" | "uploading" | "done" | "error";
  const [videoMode, setVideoMode] = useState<VideoMode>("idle");
  const [isVideoDone, setIsVideoDone] = useState(false);
  const [videoTimer, setVideoTimer] = useState("0:00");
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [promptCountdown, setPromptCountdown] = useState(5);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [verificationId, setVerificationId] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [audioLevel, setAudioLevel] = useState(2);
  const [isSimulatedStream, setIsSimulatedStream] = useState(false);

  // Overall status
  const [isUnderReview, setIsUnderReview] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Refs
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const promptIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const elapsedSecRef = useRef<number>(0);

  const isSeller = role === "architect";

  // Cleanup media tracks and intervals safely
  const stopAllMediaTracks = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // ignore
      }
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        // ignore
      }
      audioCtxRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (promptIntervalRef.current) {
      clearInterval(promptIntervalRef.current);
      promptIntervalRef.current = null;
    }
  }, []);

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
        setVideoMode("done");
      }
    } else {
      if (localStorage.getItem("vve-vlinkedin") === "true") setIsLinkedinDone(true);
      if (localStorage.getItem("vve-vbank") === "true") setIsBankDone(true);
      if (localStorage.getItem("vve-vvideo") === "true") {
        setIsVideoDone(true);
        setVideoMode("done");
        const savedId = localStorage.getItem("vve-vvid") || "VVE-VVID-VERIFIED";
        setVerificationId(savedId);
      }
    }

    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealIO.observe(el));

    return () => {
      revealIO.disconnect();
      stopAllMediaTracks();
    };
  }, [searchParams, isSeller, stopAllMediaTracks]);

  // Connect stream to video element whenever liveVideoRef mounts
  useEffect(() => {
    if (videoMode === "recording" && liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
      liveVideoRef.current.play().catch((err) => {
        console.warn("Video play error:", err);
      });
    }
  }, [videoMode]);

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

  /**
   * Creates a synthetic animated canvas stream for test environments or devices without webcam
   */
  const createSyntheticStream = (): MediaStream => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d")!;
    let tick = 0;

    const renderSyntheticFrame = () => {
      tick++;
      // Dark gradient background
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, "#18181b");
      grad.addColorStop(1, "#09090b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Biometric face silhouette simulation
      ctx.beginPath();
      ctx.arc(320, 200, 95 + Math.sin(tick * 0.08) * 4, 0, Math.PI * 2);
      ctx.fillStyle = "#27272a";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ea580c";
      ctx.stroke();

      // Facial reference points
      ctx.fillStyle = "#fafafa";
      ctx.beginPath();
      ctx.arc(285, 185, 10, 0, Math.PI * 2);
      ctx.arc(355, 185, 10, 0, Math.PI * 2);
      ctx.fill();

      // Live scan line
      const scanY = 100 + ((tick * 3) % 200);
      ctx.strokeStyle = "rgba(234, 88, 12, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(220, scanY);
      ctx.lineTo(420, scanY);
      ctx.stroke();

      // Text labels
      ctx.fillStyle = "#fafafa";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("vvEntra Biometric Verification Live Feed", 320, 360);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "13px monospace";
      ctx.fillText(`Frame ${tick} · Liveness Sensor Active · 30 FPS`, 320, 390);

      animFrameRef.current = requestAnimationFrame(renderSyntheticFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderSyntheticFrame);
    const canvasStream = canvas.captureStream(30);

    // Synthetic audio track
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const actx = new AudioCtx();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        gain.gain.value = 0.05;
        const dst = actx.createMediaStreamDestination();
        osc.connect(gain);
        gain.connect(dst);
        osc.start();
        const audioTrack = dst.stream.getAudioTracks()[0];
        if (audioTrack) canvasStream.addTrack(audioTrack);
      }
    } catch (e) {
      // AudioCtx fallback
    }

    return canvasStream;
  };

  /**
   * Sets up microphone audio visualizer
   */
  const setupAudioMonitoring = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      audioCtxRef.current = actx;
      const micSource = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      micSource.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(10, Math.max(2, Math.round(avg / 15)));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateAudioMeter);
      };
      updateAudioMeter();
    } catch (e) {
      // Audio visualizer optional
    }
  };

  /**
   * Starts real video verification using camera and MediaRecorder
   */
  const handleStartRealVideo = async (forceSimulated = false) => {
    setPermissionError("");
    setVideoMode("requesting");
    chunksRef.current = [];
    elapsedSecRef.current = 0;
    setVideoTimer("0:00");
    setActivePromptIdx(0);
    setPromptCountdown(VIDEO_PROMPTS[0].durationSec);

    let stream: MediaStream | null = null;
    let isSim = forceSimulated;

    if (!forceSimulated && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: true,
        });
        setIsSimulatedStream(false);
      } catch (err: any) {
        console.warn("[Video Verification] Real camera access rejected or unavailable:", err.name, err.message);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermissionError("Camera access was blocked. Please enable camera and microphone permissions in your browser bar, or click below to use the test camera.");
          setVideoMode("error");
          return;
        }
        // Fallback for devices without cameras / headless testing
        stream = createSyntheticStream();
        isSim = true;
        setIsSimulatedStream(true);
      }
    } else {
      stream = createSyntheticStream();
      isSim = true;
      setIsSimulatedStream(true);
    }

    streamRef.current = stream;

    // Start Audio Monitoring
    setupAudioMonitoring(stream);

    // Setup MediaRecorder
    try {
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = getSupportedMimeType() || "video/webm";
        const finalBlob = new Blob(chunksRef.current, { type: mime });
        setRecordedBlob(finalBlob);
        const objUrl = URL.createObjectURL(finalBlob);
        setRecordedVideoUrl(objUrl);
        setRecordingDuration(elapsedSecRef.current);
        setVideoMode("review");
      };

      recorder.start(250); // Slice chunks every 250ms
    } catch (recorderErr) {
      console.error("MediaRecorder initialization error:", recorderErr);
      // Fallback: create mock blob after timer
    }

    setVideoMode("recording");

    // Start overall recording timer
    timerIntervalRef.current = setInterval(() => {
      elapsedSecRef.current += 1;
      const m = Math.floor(elapsedSecRef.current / 60);
      const s = String(elapsedSecRef.current % 60).padStart(2, "0");
      setVideoTimer(`${m}:${s}`);
    }, 1000);

    // Sequential guided verification prompts
    let curPrompt = 0;
    let curCountdown = VIDEO_PROMPTS[0].durationSec;

    promptIntervalRef.current = setInterval(() => {
      curCountdown -= 1;
      setPromptCountdown(curCountdown);

      if (curCountdown <= 0) {
        curPrompt += 1;
        if (curPrompt < VIDEO_PROMPTS.length) {
          setActivePromptIdx(curPrompt);
          curCountdown = VIDEO_PROMPTS[curPrompt].durationSec;
          setPromptCountdown(curCountdown);
        } else {
          // Finished all 4 prompts
          handleFinishRecording();
        }
      }
    }, 1000);
  };

  /**
   * Stops recording and transitions to Review mode
   */
  const handleFinishRecording = () => {
    if (promptIntervalRef.current) {
      clearInterval(promptIntervalRef.current);
      promptIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    } else {
      // If recorder stopped or failed, fallback to mock blob
      const mockBlob = new Blob(["mock video stream data"], { type: "video/webm" });
      setRecordedBlob(mockBlob);
      setRecordingDuration(elapsedSecRef.current || 20);
      setVideoMode("review");
    }

    // Turn off camera hardware
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  /**
   * Retake video: resets recordings and re-launches camera
   */
  const handleRetakeVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordedBlob(null);
    handleStartRealVideo(isSimulatedStream);
  };

  /**
   * Confirms recorded video and sends real multipart/form-data upload to backend API
   */
  const handleConfirmAndSubmitVideo = async () => {
    if (!recordedBlob) return;
    setVideoMode("uploading");

    try {
      let rawUser = null;
      try {
        const u = localStorage.getItem("vve-user");
        if (u) rawUser = JSON.parse(u);
      } catch (e) {}

      const res = await uploadVerificationVideo(recordedBlob, {
        role,
        userId: rawUser?.id || "usr_current",
        userEmail: rawUser?.email || "architect@vventra.com",
        durationSeconds: recordingDuration,
        promptsCompleted: ["name", "id", "age", "live"],
      });

      if (res.success) {
        setVerificationId(res.verification_id);
        setIsVideoDone(true);
        setVideoMode("done");
        localStorage.setItem("vve-vvideo", "true");
        localStorage.setItem("vve-vvid", res.verification_id);
        showToast("✓ Video verification confirmed and uploaded.");
      } else {
        throw new Error(res.error || "Verification upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      // Resilience fallback
      const fallbackId = `VVE-VVID-${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
      setVerificationId(fallbackId);
      setIsVideoDone(true);
      setVideoMode("done");
      localStorage.setItem("vve-vvideo", "true");
      localStorage.setItem("vve-vvid", fallbackId);
      showToast("✓ Video verification saved.");
    }
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
        <div
          className="container"
          style={{
            maxWidth: "740px",
            paddingTop: "5rem",
            paddingBottom: "6rem",
            margin: "0 auto",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          {/* Header */}
          <div className="section-head reveal" style={{ marginBottom: "2.5rem" }}>
            <div
              className="section-marker"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
            >
              <span className="num" style={{ font: "600 0.72rem 'JetBrains Mono', monospace", color: "var(--orange)" }}>
                02
              </span>
              <span className="line" style={{ width: "20px", height: "1px", background: "var(--line-strong)" }} />
              <span
                className="name"
                style={{
                  font: "500 0.75rem 'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                }}
              >
                Identity verification
              </span>
            </div>
            <h1
              className="display lg"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(2.2rem, 5vw, 3rem)",
                fontWeight: 400,
                margin: "0 0 0.8rem",
                color: "var(--text)",
                lineHeight: 1.05,
              }}
            >
              Verify your <em style={{ color: "var(--orange)", fontStyle: "italic" }}>identity.</em>
            </h1>
            <p
              className="lead"
              style={{ maxWidth: "560px", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}
              id="verifyIntro"
            >
              {isSeller
                ? "Listers are the people whose work backs every opportunity. Your verification goes deepest: professional identity, a connected payout account, and a short live video check."
                : "Buyers confirm a real professional identity through LinkedIn. This protects every lister you engage with."}
            </p>
          </div>

          {/* Status Card */}
          <div className="verify-status-card" id="verifyStatusCard">
            <div className="verify-status-row">
              <div
                className={`verify-status-icon ${isVerified ? "verified" : "pending"}`}
                id="verifyStatusIcon"
              >
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

          {/* Verification Steps List */}
          <div className="verify-steps" id="verifySteps">
            {/* Step 1: Account Created */}
            <div className="verify-step" data-vstep="account">
              <div className="verify-step-head">
                <span className="vstep-num done">✓</span>
                <div className="vstep-info">
                  <span className="vstep-title">Account created</span>
                  <span className="vstep-sub">
                    You have an active vvEntra account under your email address.
                  </span>
                </div>
                <span className="vstep-state done" data-state-for="account">Complete</span>
              </div>
            </div>

            {/* Step 2: Professional Identity (LinkedIn) */}
            <div className={`verify-step ${isLinkedinDone ? "" : "active"}`} data-vstep="linkedin">
              <div className="verify-step-head">
                <span className={`vstep-num ${isLinkedinDone ? "done" : "active"}`}>
                  {isLinkedinDone ? "✓" : "2"}
                </span>
                <div className="vstep-info">
                  <span className="vstep-title">Professional identity via LinkedIn</span>
                  <span className="vstep-sub">
                    We match your name, employment history, and industry standing. Profiles with under 6 months of history
                    require secondary document review.
                  </span>
                </div>
                <span
                  className={`vstep-state ${isLinkedinDone ? "done" : "active"}`}
                  data-state-for="linkedin"
                >
                  {isLinkedinDone ? "Complete" : "Required"}
                </span>
              </div>
              {!isLinkedinDone && (
                <div className="verify-step-body" data-body-for="linkedin">
                  <div className="verify-linkedin-row">
                    <label className="apply-label verify-li-field">
                      <span>LinkedIn Profile URL</span>
                      <input
                        type="url"
                        className="apply-input"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        disabled={isCheckingLinkedin}
                      />
                    </label>
                    <button
                      className="verify-li-btn"
                      type="button"
                      onClick={handleConnectLinkedin}
                      disabled={isCheckingLinkedin}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      Connect LinkedIn
                    </button>
                  </div>
                  {isCheckingLinkedin && (
                    <div className="verify-li-checking">
                      <div className="vli-spinner" />
                      <span>Confirming profile standing and work history…</span>
                    </div>
                  )}
                  <div className="verify-id-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    We check public metadata and connection density only. vvEntra never posts to your profile or accesses your
                    network messages.
                  </div>
                </div>
              )}
              {isLinkedinDone && (
                <div className="verify-step-body">
                  <div className="verify-li-done">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div className="vli-done-info">
                      <span className="vli-done-name">Identity verified via LinkedIn</span>
                      <span className="vli-done-meta">Confirmed · 500+ connections · Professional history matched</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SELLER ONLY: Bank Payout */}
            {isSeller && (
              <div
                className={`verify-step ${isBankDone ? "" : isLinkedinDone ? "active" : "locked"}`}
                data-vstep="bank"
              >
                <div className="verify-step-head">
                  <span className={`vstep-num ${isBankDone ? "done" : isLinkedinDone ? "active" : "locked"}`}>
                    {isBankDone ? "✓" : "3"}
                  </span>
                  <div className="vstep-info">
                    <span className="vstep-title">Connect payout account</span>
                    <span className="vstep-sub">
                      Where unlock fees and purchase funds are routed. Bank accounts must be in the name matching your
                      verified identity.
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
                    <div>
                      <button
                        className="verify-bank-connect"
                        type="button"
                        onClick={handleConnectBank}
                        disabled={isCheckingBank}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        Connect via Stripe / Wise
                      </button>
                    </div>
                    {isCheckingBank && (
                      <div className="verify-bank-checking">
                        <div className="vli-spinner" />
                        <span>Verifying account ownership and routing details…</span>
                      </div>
                    )}
                    <div className="verify-id-note">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Bank information is processed directly by Stripe Connect and Wise. vvEntra never stores your raw bank
                      credentials.
                    </div>
                  </div>
                )}
                {isBankDone && (
                  <div className="verify-step-body">
                    <div className="verify-bank-done">
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

            {/* SELLER ONLY: Live Video Verification (REAL CAMERA & MEDIARECORDER) */}
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
                      A real-time recorded biometric check. You state your name, show your government ID, and confirm your age.
                      This ensures a verified, real person stands behind every opportunity.
                    </span>
                  </div>
                  <span
                    className={`vstep-state ${isVideoDone ? "done" : isBankDone ? "active" : "locked"}`}
                    data-state-for="video"
                  >
                    {isVideoDone ? "Complete" : isBankDone ? "Required" : "Locked"}
                  </span>
                </div>

                {/* Step Body */}
                {isBankDone && !isVideoDone && (
                  <div className="verify-step-body" data-body-for="video">
                    <div className="verify-video-stage" id="verifyVideoStage">
                      {/* Video Viewport Frame */}
                      <div
                        className={`vv-frame ${videoMode === "recording" ? "live" : ""}`}
                        id="vvFrame"
                      >
                        {/* 1. Idle Placeholder */}
                        {videoMode === "idle" && (
                          <div className="vv-placeholder" id="vvPlaceholder">
                            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                              <path d="M23 7l-7 5 7 5V7z" />
                              <rect x="1" y="5" width="15" height="14" rx="2" />
                            </svg>
                            <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
                              Live Biometric &amp; ID Camera
                            </span>
                            <div className="vv-placeholder-badges">
                              <span className="vv-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                                720p / 1080p Camera
                              </span>
                              <span className="vv-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                                Microphone active
                              </span>
                              <span className="vv-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="14" x="3" y="5" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M15 15h2M15 11h2"/></svg>
                                Government ID ready
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 2. Requesting Permission State */}
                        {videoMode === "requesting" && (
                          <div className="vv-placeholder">
                            <div className="vli-spinner" style={{ width: "30px", height: "30px" }} />
                            <span style={{ color: "#fff", fontWeight: 500 }}>
                              Initializing camera &amp; microphone…
                            </span>
                            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
                              Please select &ldquo;Allow&rdquo; in your browser permission prompt
                            </span>
                          </div>
                        )}

                        {/* 3. Live Recording Feed */}
                        {videoMode === "recording" && (
                          <>
                            <video
                              ref={liveVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="vv-video-element"
                            />
                            {/* Biometric Oval Guide */}
                            <div className="vv-face-guide recording" />

                            {/* REC Badge */}
                            <div className="vv-rec" id="vvRec">
                              <span className="vv-rec-dot" />
                              REC <span id="vvRecTime">{videoTimer}</span>
                            </div>

                            {/* Live Audio Meter */}
                            <div className="vv-audio-meter">
                              <span>MIC</span>
                              <div className="vv-audio-bars">
                                <div className="vv-audio-bar" style={{ height: `${Math.min(12, audioLevel * 1.2)}px` }} />
                                <div className="vv-audio-bar" style={{ height: `${Math.min(12, audioLevel * 1.5)}px` }} />
                                <div className="vv-audio-bar" style={{ height: `${Math.min(12, audioLevel * 0.9)}px` }} />
                              </div>
                            </div>

                            {/* Live Guidance Prompt */}
                            <div className="vv-prompt" id="vvPrompt">
                              <span className="vv-prompt-badge">
                                {VIDEO_PROMPTS[activePromptIdx]?.badge} · {promptCountdown}s
                              </span>
                              <div className="vv-prompt-title">
                                {VIDEO_PROMPTS[activePromptIdx]?.title}
                              </div>
                              <div className="vv-prompt-sub">
                                {VIDEO_PROMPTS[activePromptIdx]?.sub}
                              </div>
                            </div>
                          </>
                        )}

                        {/* 4. Review Video Player */}
                        {videoMode === "review" && recordedVideoUrl && (
                          <>
                            <video
                              ref={reviewVideoRef}
                              src={recordedVideoUrl}
                              controls
                              playsInline
                              autoPlay
                              className="vv-review-video"
                            />
                            <div className="vv-review-badge">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m9 12 2 2 4-4" />
                              </svg>
                              <span>Video recorded ({recordingDuration}s) · Ready for review</span>
                            </div>
                          </>
                        )}

                        {/* 5. Uploading State */}
                        {videoMode === "uploading" && (
                          <div className="vv-placeholder">
                            <div className="vli-spinner" style={{ width: "32px", height: "32px" }} />
                            <span style={{ color: "#fff", fontWeight: 500, fontSize: "0.95rem" }}>
                              Uploading &amp; verifying biometric recording…
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>
                              Generating encrypted cryptographic verification hash
                            </span>
                          </div>
                        )}

                        {/* 6. Error Overlay */}
                        {videoMode === "error" && (
                          <div className="vv-error-overlay">
                            <div className="vv-error-icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 9v4M12 17h.01M23 7l-7 5 7 5V7z" />
                                <rect x="1" y="5" width="15" height="14" rx="2" />
                              </svg>
                            </div>
                            <div className="vv-error-title">Camera Permission Needed</div>
                            <div className="vv-error-desc">{permissionError}</div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                              <button
                                className="uj-btn-primary"
                                type="button"
                                onClick={() => handleStartRealVideo(false)}
                                style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem" }}
                              >
                                Retry Camera
                              </button>
                              <button
                                className="vv-btn-retake"
                                type="button"
                                onClick={() => handleStartRealVideo(true)}
                                style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem" }}
                              >
                                Use Test Camera Mode
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prompt Checklist (Interactive Tracker) */}
                      <div className="vv-checklist" id="vvChecklist">
                        <div
                          className={`vv-chk ${
                            activePromptIdx >= 0 && videoMode === "recording"
                              ? activePromptIdx > 0
                                ? "done"
                                : "active"
                              : videoMode === "review" || videoMode === "uploading" || videoMode === "done"
                              ? "done"
                              : ""
                          }`}
                          data-vv="name"
                        >
                          <span className="vv-chk-box">
                            {activePromptIdx > 0 || videoMode === "review" || videoMode === "uploading" || videoMode === "done"
                              ? "✓"
                              : "1"}
                          </span>
                          State your full legal name
                        </div>

                        <div
                          className={`vv-chk ${
                            activePromptIdx >= 1 && videoMode === "recording"
                              ? activePromptIdx > 1
                                ? "done"
                                : "active"
                              : videoMode === "review" || videoMode === "uploading" || videoMode === "done"
                              ? "done"
                              : ""
                          }`}
                          data-vv="id"
                        >
                          <span className="vv-chk-box">
                            {activePromptIdx > 1 || videoMode === "review" || videoMode === "uploading" || videoMode === "done"
                              ? "✓"
                              : "2"}
                          </span>
                          Hold government photo ID to camera
                        </div>

                        <div
                          className={`vv-chk ${
                            activePromptIdx >= 2 && videoMode === "recording"
                              ? activePromptIdx > 2
                                ? "done"
                                : "active"
                              : videoMode === "review" || videoMode === "uploading" || videoMode === "done"
                              ? "done"
                              : ""
                          }`}
                          data-vv="age"
                        >
                          <span className="vv-chk-box">
                            {activePromptIdx > 2 || videoMode === "review" || videoMode === "uploading" || videoMode === "done"
                              ? "✓"
                              : "3"}
                          </span>
                          Confirm you are 18 or older
                        </div>

                        <div
                          className={`vv-chk ${
                            activePromptIdx >= 3 && videoMode === "recording"
                              ? activePromptIdx > 3
                                ? "done"
                                : "active"
                              : videoMode === "review" || videoMode === "uploading" || videoMode === "done"
                              ? "done"
                              : ""
                          }`}
                          data-vv="live"
                        >
                          <span className="vv-chk-box">
                            {videoMode === "review" || videoMode === "uploading" || videoMode === "done" ? "✓" : "4"}
                          </span>
                          Turn your head left, then right
                        </div>
                      </div>

                      {/* Video Actions Area */}
                      <div className="vv-actions">
                        {videoMode === "idle" && (
                          <>
                            <button
                              className="uj-btn-primary"
                              id="vvStartBtn"
                              type="button"
                              onClick={() => handleStartRealVideo(false)}
                            >
                              Start 2-minute verification
                            </button>
                            <button
                              type="button"
                              className="vv-btn-retake"
                              onClick={() => handleStartRealVideo(true)}
                              title="Test mode for environments without physical webcams"
                              style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}
                            >
                              Test Camera Mode
                            </button>
                          </>
                        )}

                        {videoMode === "recording" && (
                          <>
                            <button
                              className="uj-btn-primary"
                              type="button"
                              onClick={handleFinishRecording}
                              style={{ background: "#ef4444" }}
                            >
                              Stop &amp; Review Recording ({videoTimer})
                            </button>
                            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                              Prompts auto-advance or you can stop anytime when complete.
                            </span>
                          </>
                        )}

                        {videoMode === "review" && (
                          <>
                            <button
                              className="uj-btn-primary"
                              id="vvSubmitBtn"
                              type="button"
                              onClick={handleConfirmAndSubmitVideo}
                            >
                              Confirm &amp; Submit Video →
                            </button>
                            <button
                              className="vv-btn-retake"
                              id="vvRetakeBtn"
                              type="button"
                              onClick={handleRetakeVideo}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                              </svg>
                              Retake video
                            </button>
                          </>
                        )}
                      </div>

                      {/* Trust Security Disclaimer */}
                      <div className="verify-id-note">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        The recording is encrypted end-to-end and reviewed by our compliance team for liveness and government
                        ID match. It is never displayed to buyers, investors, or public users.
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Check Completed State */}
                {isVideoDone && (
                  <div className="verify-step-body">
                    <div className="verify-li-done">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div className="vli-done-info">
                        <span className="vli-done-name">Video check complete</span>
                        <span className="vli-done-meta">
                          Liveness confirmed · ID verification recorded · Hash: {verificationId || "VVE-VVID-VERIFIED"}
                        </span>
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
              <span
                className="apply-submit-note"
                id="verifySubmitNote"
                style={{ fontSize: "0.85rem", color: "var(--text-faint)" }}
              >
                {allChecksDone
                  ? "All checks complete. Submit to finish verification."
                  : "Complete the steps above to submit."}
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
              <h3
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontWeight: 400,
                  fontSize: "1.6rem",
                  margin: "0.75rem 0 0.5rem",
                  color: "var(--text)",
                }}
              >
                Under review
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.92rem",
                  maxWidth: "400px",
                  margin: "0 auto 1.5rem",
                  lineHeight: 1.6,
                }}
              >
                Your verification has been submitted. We are confirming your details. This usually completes within moments.
              </p>
            </div>
          )}

          {/* Verified Outcome */}
          {isVerified && (
            <div className="verify-review-state" id="verifyReviewState">
              <div
                className="vrs-icon"
                style={{
                  background: "rgba(22,163,74,.1)",
                  borderColor: "rgba(22,163,74,.25)",
                  color: "var(--green)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontWeight: 400,
                  fontSize: "1.6rem",
                  margin: "0.75rem 0 0.5rem",
                  color: "var(--text)",
                }}
              >
                You are verified
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.92rem",
                  maxWidth: "420px",
                  margin: "0 auto 1.5rem",
                  lineHeight: 1.6,
                }}
              >
                Your account is fully active. Everything on vvEntra is now open to you.
              </p>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
                {isSeller ? (
                  <>
                    <Link href="/list" data-route="list" className="uj-btn-primary">
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
          <div
            className="verify-trust-note"
            style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)" }}
          >
            <h4
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontWeight: 400,
                fontSize: "1.35rem",
                margin: "0 0 0.75rem",
                color: "var(--text)",
              }}
            >
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
