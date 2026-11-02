"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { saveNewOpportunity, OpportunityItem } from "@/lib/storage/opportunities";
import { createOpportunity } from "@/lib/api/opportunities";

interface DeepFieldConfig {
  id: string;
  label: string;
  ph: string;
}

const FREE_FIELDS = [
  { id: "title", label: "Opportunity title", type: "text", ph: "Autonomous Backend Operations System for Mid-Market E-Commerce Brands" },
  { id: "tags", label: "Industry tags (comma separated)", type: "text", ph: "E-Commerce, AI Automation, Ops" },
  { id: "hook", label: "One-line hook", type: "textarea", ph: "A documented operational intelligence system that removes the founder from backend e-commerce operations in under 90 days." },
  { id: "stage", label: "Stage", type: "select", options: ["Early Concept", "Validated Thesis", "Execution-Ready"] },
  { id: "geography", label: "Geography", type: "text", ph: "US, UK, Global" },
  { id: "capital", label: "Capital required", type: "text", ph: "$28,000 – $56,000" },
  { id: "timeline", label: "Time to launch", type: "text", ph: "60–90 days" },
  { id: "monet", label: "Monetisation", type: "text", ph: "Retainer + project" },
  { id: "price", label: "Listed price (USD)", type: "number", ph: "28000" },
];

const DEEP_FIELDS: DeepFieldConfig[] = [
  { id: "thesis", label: "Investment thesis", ph: "Write the full thesis. Why this opportunity exists, the structural reason serious capital should pay attention, and what makes it defensible. No length limit." },
  { id: "problem", label: "The problem", ph: "Describe the full problem. What is broken, who feels the pain, what it costs them today." },
  { id: "gap", label: "Market gap", ph: "The complete whitespace analysis. What existing solutions miss and why this is structurally underserved." },
  { id: "model", label: "Business model & revenue logic", ph: "Full revenue model. Unit economics, pricing logic, margins, retention assumptions." },
  { id: "competitive", label: "Competitive landscape", ph: "Every relevant competitor and adjacent player, and why none of them is a direct head-to-head." },
  { id: "risks", label: "Risks & execution challenges", ph: "The honest risk register. What could go wrong and what it takes to execute well." },
  { id: "gtm", label: "Go-to-market strategy", ph: "The complete GTM. Channels, sequencing, anchor accounts, content engine, first-customer motion." },
  { id: "financials", label: "Financial projections", ph: "Full projections. Revenue trajectory, cost to first customers, key assumptions, sensitivity." },
];

function simulateSummary(fieldLabel: string, text: string) {
  if (!text || !text.trim()) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const wordCount = clean.split(/\s+/).length;

  const dataRe = /(\$[\d,.]+\s?[KMB]?|\b\d+[\d,.]*\s?%|\b\d+[\d,.]*\s?(x|months?|days?|weeks?|years?|hours?)\b|\b\d{2,}[\d,.]*\b)/i;
  const signalRe = /\b(market|customers?|segment|target|revenue|margin|pricing|charge|cost|save|reduce|grow|demand|competitor|incumbent|because|driver|trend|why now|moat|defensible|retention|churn|acquisition)\b/i;

  const dataSentences = sentences.filter((s) => dataRe.test(s));
  const signalSentences = sentences.filter((s) => signalRe.test(s) && !dataRe.test(s));

  const trim = (s: string, max = 160) => (s.length <= max ? s : s.slice(0, max).replace(/\s+\S*$/, "") + "…");
  const firstSentence = sentences[0] || "";
  const firstIsSubstantive = firstSentence.length > 40 && (dataRe.test(firstSentence) || signalRe.test(firstSentence));

  const points: string[] = [];
  const usedLead = firstIsSubstantive ? firstSentence : null;
  dataSentences.filter((s) => s !== usedLead).slice(0, 3).forEach((s) => points.push(trim(s)));
  if (points.length < 3) {
    signalSentences.filter((s) => s !== usedLead).slice(0, 3 - points.length).forEach((s) => points.push(trim(s)));
  }

  const depthNote =
    wordCount > 220 ? "The full write-up runs deep" :
    wordCount > 110 ? "The full write-up is detailed" :
    "The full detail continues";

  const sectionLead: Record<string, string> = {
    "Investment thesis": "The core thesis, in the architect's own words:",
    "The problem": "The problem being solved:",
    "Market gap": "The market gap identified:",
    "Business model & revenue logic": "How the opportunity makes money:",
    "Competitive landscape": "The competitive position:",
    "Risks & execution challenges": "The key risks named:",
    "Go-to-market strategy": "The go-to-market approach:",
    "Financial projections": "The financial picture:",
  };

  let out = "";
  if (firstIsSubstantive) {
    out += trim(firstSentence, 220) + "\n\n";
  }
  if (points.length) {
    out += (sectionLead[fieldLabel] || "Key points:") + "\n";
    out += points.map((p) => "• " + p).join("\n") + "\n\n";
  }
  out += depthNote + ", including specifics and supporting evidence, in the locked section.";
  return out.trim();
}

function fmtMoney(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export default function ListOpportunityPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Record<string, string>>({
    title: "",
    tags: "",
    hook: "",
    stage: "Early Concept",
    geography: "",
    capital: "",
    timeline: "",
    monet: "",
    price: "",
    docs: "",
  });

  // Deep fields full text + AI summaries
  const [deepTexts, setDeepTexts] = useState<Record<string, string>>({
    thesis: "",
    problem: "",
    gap: "",
    model: "",
    competitive: "",
    risks: "",
    gtm: "",
    financials: "",
  });

  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({
    thesis: "",
    problem: "",
    gap: "",
    model: "",
    competitive: "",
    risks: "",
    gtm: "",
    financials: "",
  });

  const [aiEdited, setAiEdited] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string>("investor");
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Authentication Route Guard
  useEffect(() => {
    const stage = localStorage.getItem("vve-stage") || "guest";
    const token = localStorage.getItem("vve-access-token");
    const user = localStorage.getItem("vve-user");
    const role = localStorage.getItem("vve-role") || "investor";
    setUserRole(role);
    setIsVerified(stage === "verified");
    const isAuth = stage === "applied" || stage === "verified" || Boolean(token || user);

    if (!isAuth) {
      router.replace("/login?redirect=/list");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Handle Free Field Change
  const handleFreeChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle Deep Field Full Text Change
  const handleDeepChange = (id: string, label: string, value: string) => {
    setDeepTexts((prev) => ({ ...prev, [id]: value }));
    if (!aiEdited[id]) {
      const generated = simulateSummary(label, value);
      setAiSummaries((prev) => ({ ...prev, [id]: generated }));
    }
  };

  // Handle AI Summary Manual Edit
  const handleAiSummaryChange = (id: string, value: string) => {
    setAiEdited((prev) => ({ ...prev, [id]: true }));
    setAiSummaries((prev) => ({ ...prev, [id]: value }));
  };

  // Regenerate AI Summary
  const handleRegenerate = (id: string, label: string) => {
    setAiEdited((prev) => ({ ...prev, [id]: false }));
    const generated = simulateSummary(label, deepTexts[id] || "");
    setAiSummaries((prev) => ({ ...prev, [id]: generated }));
  };

  // Calculations & Validation
  const numericPrice = parseFloat(formData.price);
  const isPriceValid = !isNaN(numericPrice) && numericPrice > 0;
  const unlockFee = isPriceValid ? fmtMoney(numericPrice * 0.1) : "$0";

  // Readiness Tracking
  const REQUIRED = useMemo(
    () => [
      { id: "title", label: "Opportunity title", isDone: formData.title.trim().length > 0 },
      { id: "hook", label: "One-line hook", isDone: formData.hook.trim().length > 0 },
      { id: "price", label: "Listed price (must be greater than $0)", isDone: isPriceValid },
      { id: "thesis", label: "Investment thesis (full text)", isDone: deepTexts.thesis.trim().length > 0 },
      { id: "problem", label: "The problem (full text)", isDone: deepTexts.problem.trim().length > 0 },
    ],
    [formData.title, formData.hook, isPriceValid, deepTexts.thesis, deepTexts.problem]
  );

  const completedCount = useMemo(() => {
    return REQUIRED.filter((r) => r.isDone).length;
  }, [REQUIRED]);

  const isAllRequiredDone = completedCount === REQUIRED.length;

  const handleSubmit = () => {
    if (!isAllRequiredDone || !isPriceValid) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const listingPayload = {
        ...formData,
        deep: deepTexts,
        aiSummaries,
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem("vve-composed-listing", JSON.stringify(listingPayload));

      const tagList = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const docList = formData.docs
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const stageLower = (formData.stage || "").toLowerCase();
      const stage: "execution" | "validated" | "concept" = stageLower.includes("execution")
        ? "execution"
        : stageLower.includes("validate")
        ? "validated"
        : "concept";

      const rawIndustry = (tagList[0] || "saas").toLowerCase();
      const industry = rawIndustry.includes("ai")
        ? "ai"
        : rawIndustry.includes("fintech")
        ? "fintech"
        : rawIndustry.includes("ecom")
        ? "ecommerce"
        : "saas";

      const isUserVerified = typeof window !== "undefined" && localStorage.getItem("vve-stage") === "verified";
      const currentRole = typeof window !== "undefined" ? localStorage.getItem("vve-role") || "investor" : "investor";
      const isArchitectVerified = isUserVerified && currentRole === "architect";

      const oppId = "opp-" + Date.now();
      const newOpp: OpportunityItem = {
        id: oppId,
        industry,
        stage,
        stageLabel: formData.stage || "Validated Concept",
        status: "review",
        statusLabel: "In Review",
        tags: tagList.length > 0 ? tagList : ["B2B SaaS", "Automation"],
        title: formData.title,
        hook: formData.hook,
        capital: formData.capital || "$50k - $100k",
        timeToLaunch: formData.timeline || "30 days",
        trustScore: 0,
        architectVerified: isArchitectVerified,
        architectName: isArchitectVerified
          ? "Verified Architect"
          : currentRole === "architect"
          ? "Pending Verification"
          : "Unverified Investor",
        listedDaysAgo: 0,
        priceNum: numericPrice,
        unlockPrice: unlockFee || "$450",
        submittedAt: new Date().toISOString(),
        thesis: deepTexts.thesis,
        problem: deepTexts.problem,
        geography: formData.geography,
        monetisation: formData.monet,
        docs: docList,
      };

      saveNewOpportunity(newOpp);

      try {
        void createOpportunity({
          title: formData.title,
          sector: industry,
          category: formData.stage,
          deal_size: numericPrice,
          unlock_fee: parseFloat(unlockFee.replace(/[^0-9.]/g, "")) || 450,
          timeline: formData.timeline,
          headline: formData.hook,
          summary: deepTexts.thesis,
          problem_statement: deepTexts.problem,
          is_featured: false,
          status: "pending_review",
          readiness_score: 0,
        }).catch(() => {});
      } catch {}

      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  if (isCheckingAuth) {
    return null;
  }

  const docList = formData.docs
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const tagList = formData.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <>
      <Navbar currentRole="architect" />

      <main data-page="list" className="page list-page">
        {/* ================= HEADER ================= */}
        <header className="container-wide list-header">
          <span className="eyebrow">List an opportunity</span>
          <h1 className="display lg">
            Compose your listing. <em>See exactly what the buyer sees</em>.
          </h1>
          <p className="list-sub">
            Fill the form on the left. The panel on the right shows your listing through the buyer’s eyes in real time, so you always know what is free, what is teased, and what unlocks only after payment.
          </p>

          {/* VISIBILITY LEGEND */}
          <div className="vis-legend">
            <div className="vis-legend-item">
              <span className="vis-dot free" />
              <div className="vis-legend-text">
                <span className="vl-title">Free</span>
                <span className="vl-desc">Buyer sees this fully, before paying anything.</span>
              </div>
            </div>
            <div className="vis-legend-item">
              <span className="vis-dot teaser" />
              <div className="vis-legend-text">
                <span className="vl-title">Teaser</span>
                <span className="vl-desc">Buyer reads an AI summary free. They pay the unlock fee to reveal the full text.</span>
              </div>
            </div>
            <div className="vis-legend-item">
              <span className="vis-dot doc" />
              <div className="vis-legend-text">
                <span className="vl-title">Document</span>
                <span className="vl-desc">Shared as downloadable files only after unlock and NDA.</span>
              </div>
            </div>
          </div>
        </header>

        {/* UNVERIFIED NOTICE */}
        {(!isVerified || userRole !== "architect") && (
          <div className="container-wide" style={{ marginBottom: "1.75rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "1rem 1.25rem",
                borderRadius: "8px",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                fontSize: "0.88rem",
                color: "var(--text)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ color: "#d97706", display: "flex", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <span>
                  <strong>Architect Verification Required:</strong> Your submission will enter our review queue with status <em>In Review</em>. All marketplace listings require verified architect standing (LinkedIn + live check) before publication to buyers.
                </span>
              </div>
              <Link
                href="/verify"
                className="btn btn-primary"
                style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem", whiteSpace: "nowrap" }}
              >
                Verify Identity →
              </Link>
            </div>
          </div>
        )}

        {/* ================= SPLIT COMPOSER & PREVIEW ================= */}
        <div className="container-wide list-split">
          {/* LEFT: COMPOSER */}
          <div className="list-composer" id="listComposer">
            {/* TIER 1: FREE */}
            <div className="composer-tier">
              <div className="composer-tier-head">
                <span className="cth-badge free">Free</span>
                <span className="cth-title">Always visible to the buyer</span>
                <span className="cth-hint">Builds trust</span>
              </div>

              {FREE_FIELDS.map((f) => {
                if (f.type === "textarea") {
                  return (
                    <div key={f.id} className="cfield">
                      <label className="cfield-label">{f.label}</label>
                      <textarea
                        className="cfield-textarea"
                        data-fid={f.id}
                        placeholder={f.ph}
                        value={formData[f.id]}
                        onChange={(e) => handleFreeChange(f.id, e.target.value)}
                      />
                    </div>
                  );
                }
                if (f.type === "select") {
                  return (
                    <div key={f.id} className="cfield">
                      <label className="cfield-label">{f.label}</label>
                      <select
                        className="cfield-select"
                        data-fid={f.id}
                        value={formData[f.id]}
                        onChange={(e) => handleFreeChange(f.id, e.target.value)}
                      >
                        {f.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return (
                  <div key={f.id} className="cfield">
                    <label className="cfield-label">{f.label}</label>
                    <input
                      className={`cfield-input ${f.id === "price" && formData.price.trim().length > 0 && !isPriceValid ? "is-invalid" : ""}`}
                      type={f.type}
                      data-fid={f.id}
                      placeholder={f.ph}
                      min={f.id === "price" ? "1" : undefined}
                      step={f.id === "price" ? "any" : undefined}
                      value={formData[f.id]}
                      onChange={(e) => handleFreeChange(f.id, e.target.value)}
                    />
                    {f.id === "price" && formData.price.trim().length > 0 && !isPriceValid && (
                      <div
                        className="cfield-error-msg"
                        id="priceErrorMsg"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          marginTop: "0.4rem",
                          fontSize: "0.8rem",
                          color: "#dc2626",
                          fontWeight: 500,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Listed price must be a positive amount greater than $0.</span>
                      </div>
                    )}
                    {f.id === "price" && (
                      <div className="unlock-calc">
                        <span className="unlock-calc-label">Buyer pays to unlock (10%)</span>
                        <span className="unlock-calc-val" id="unlockCalcVal">
                          {unlockFee}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* TIER 2: TEASER (DEEP FIELDS) */}
            <div className="composer-tier">
              <div className="composer-tier-head">
                <span className="cth-badge teaser">Teaser</span>
                <span className="cth-title">Buyer sees an AI summary free · your full text unlocks after payment</span>
                <span className="cth-hint">Creates curiosity</span>
              </div>
              <p className="deep-explainer">
                Write the real, complete content on the left. vvEntra automatically writes a public summary on the right that conveys your quality without revealing specifics. The buyer reads the summary free, plus a short blurred glimpse of your real words, then pays to unlock everything. You can edit the summary anytime.
              </p>

              {DEEP_FIELDS.map((f) => {
                const wordCount = deepTexts[f.id]?.trim() ? deepTexts[f.id].trim().split(/\s+/).length : 0;
                return (
                  <div key={f.id} className="deep-field">
                    <div className="deep-field-label">{f.label}</div>
                    <div className="deep-cols">
                      <div className="deep-col">
                        <div className="deep-col-head">
                          <span className="deep-col-tag full">Your full text</span>
                          <span className="deep-col-sub">Confidential · unlocks after payment · no limit</span>
                        </div>
                        <textarea
                          className="cfield-textarea deep-textarea"
                          data-fid={f.id}
                          placeholder={f.ph}
                          value={deepTexts[f.id]}
                          onChange={(e) => handleDeepChange(f.id, f.label, e.target.value)}
                        />
                        <span className="cfield-charcount" data-cc={f.id}>
                          {wordCount} words
                        </span>
                      </div>

                      <div className="deep-col">
                        <div className="deep-col-head">
                          <span className="deep-col-tag ai">Buyer sees (free)</span>
                          <button
                            type="button"
                            className="deep-regen"
                            data-regen={f.id}
                            title="Regenerate from your text"
                            onClick={() => handleRegenerate(f.id, f.label)}
                          >
                            ↻ Auto
                          </button>
                        </div>
                        <textarea
                          className="cfield-textarea deep-textarea deep-ai"
                          data-ai={f.id}
                          placeholder="An AI summary of your text appears here automatically. You can edit it."
                          value={aiSummaries[f.id]}
                          onChange={(e) => handleAiSummaryChange(f.id, e.target.value)}
                        />
                        <span className="deep-ai-note">Auto-written from your text · editable</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TIER 3: DOCUMENTS */}
            <div className="composer-tier">
              <div className="composer-tier-head">
                <span className="cth-badge doc">Document</span>
                <span className="cth-title">Shared as files after unlock + NDA</span>
                <span className="cth-hint">Your prepared package</span>
              </div>
              <div className="cfield">
                <label className="cfield-label">Document package (one file name per line)</label>
                <textarea
                  className="cfield-textarea"
                  data-fid="docs"
                  placeholder="Market sizing model (verified)&#10;Reference architecture&#10;Supplier contract templates&#10;90-day deployment plan&#10;Financial model (XLSX)"
                  value={formData.docs}
                  onChange={(e) => handleFreeChange("docs", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE BUYER PREVIEW */}
          <div className="list-preview-wrap">
            <div className="list-preview-sticky">
              <div className="preview-chrome">
                <span className="preview-chrome-label">Buyer preview</span>
                <span className="preview-chrome-note">Live · updates as you type</span>
              </div>

              <div className="list-preview" id="listPreview">
                {/* Tags */}
                <div className="pv-tags" id="pvTags">
                  {tagList.length > 0 ? (
                    tagList.map((tag, idx) => (
                      <span key={idx} className="pv-tag">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="pv-tag">Sector tag</span>
                  )}
                </div>

                {/* Title */}
                <div className={`pv-title ${!formData.title ? "empty" : ""}`} id="pvTitle">
                  {formData.title || "Your opportunity title"}
                </div>

                {/* Hook */}
                <div className={`pv-hook ${!formData.hook ? "empty" : ""}`} id="pvHook">
                  {formData.hook || "Your one-line hook will appear here."}
                </div>

                {/* Snapshot Matrix */}
                <div className="pv-snapshot">
                  <div className="pv-snap-cell">
                    <span className="pv-snap-k">Stage</span>
                    <span className="pv-snap-v" id="pvStage">
                      {formData.stage || "Early Concept"}
                    </span>
                  </div>
                  <div className="pv-snap-cell">
                    <span className="pv-snap-k">Geography</span>
                    <span className="pv-snap-v" id="pvGeography">
                      {formData.geography || "—"}
                    </span>
                  </div>
                  <div className="pv-snap-cell">
                    <span className="pv-snap-k">Capital</span>
                    <span className="pv-snap-v" id="pvCapital">
                      {formData.capital || "—"}
                    </span>
                  </div>
                  <div className="pv-snap-cell">
                    <span className="pv-snap-k">Time to launch</span>
                    <span className="pv-snap-v" id="pvTimeline">
                      {formData.timeline || "—"}
                    </span>
                  </div>
                  <div className="pv-snap-cell">
                    <span className="pv-snap-k">Monetisation</span>
                    <span className="pv-snap-v" id="pvMonet">
                      {formData.monet || "—"}
                    </span>
                  </div>
                  <div className="pv-snap-cell">
                    <span className="pv-snap-k">Unlock fee</span>
                    <span className="pv-snap-v" id="pvUnlock">
                      {unlockFee}
                    </span>
                  </div>
                </div>

                {/* Deep Teaser Sections */}
                <div id="pvSections">
                  {DEEP_FIELDS.map((f) => {
                    const full = deepTexts[f.id] || "";
                    const summary = aiSummaries[f.id] || "";
                    const glimpse = full.slice(0, 90);
                    const blurGlimpse = full.slice(90, 220) || "and continues in full detail behind the unlock...";

                    return (
                      <div key={f.id} className="pv-section">
                        <div className="pv-sec-title">{f.label}</div>
                        <div className="pv-sec-summary" data-pvsum={f.id}>
                          {summary ? (
                            <div className="pv-summary-text">
                              {summary.split("\n").filter(Boolean).map((line, lIdx) =>
                                line.trim().startsWith("•") ? (
                                  <div key={lIdx} className="pv-sum-bullet">
                                    {line.replace(/^•\s*/, "")}
                                  </div>
                                ) : (
                                  <p key={lIdx}>{line}</p>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="pv-empty-hint">Nothing written yet.</span>
                          )}
                        </div>

                        {full && (
                          <div className="pv-sec-teaser" data-pvtease={f.id}>
                            <div className="pv-glimpse-wrap">
                              <span className="pv-glimpse-label">From the architect&apos;s full write-up</span>
                              <div className="pv-glimpse">
                                <span className="pv-glimpse-vis">{glimpse}</span>
                                <span className="pv-glimpse-blur"> {blurGlimpse}</span>
                              </div>
                              <div className="pv-teaser-prompt">
                                🔒 Pay {unlockFee} to read the full section
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Document Package */}
                <div className="pv-section">
                  <div className="pv-sec-title">Document package</div>
                  <div id="pvDocs">
                    {docList.length > 0 ? (
                      docList.map((doc, idx) => (
                        <div key={idx} className="pv-doc-row">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                          </svg>
                          <span className="pv-doc-name">{doc}</span>
                          <span className="pv-doc-lock">NDA</span>
                        </div>
                      ))
                    ) : (
                      <span className="pv-empty-hint">No documents listed yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SUBMIT / SUCCESS SECTION ================= */}
        <div className="container-wide list-submit-wrap">
          {!isSubmitted ? (
            <div className="list-submit-card" id="listSubmitCard">
              <div className="lsub-head">
                <span className="lsub-eyebrow">Before you submit</span>
                <h2 className="lsub-title">Ready to publish?</h2>
                <p className="lsub-desc">
                  Your listing goes to vvEntra review first. Once approved, it appears in the marketplace with the free fields visible and the deeper sections teased. Buyers unlock the rest by paying your unlock fee.
                </p>
              </div>

              <div className="lsub-readiness" id="lsubReadiness">
                {REQUIRED.map((r, idx) => {
                  const filled = r.isDone;
                  return (
                    <div key={idx} className={`lready-row ${filled ? "done" : "miss"}`}>
                      {filled ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                      <span>{r.label}</span>
                    </div>
                  );
                })}
                <div
                  className="lready-row"
                  style={{ borderTop: "1px solid var(--line)", paddingTop: ".6rem", marginTop: ".3rem" }}
                >
                  <span className="lready-count">
                    {completedCount} of {REQUIRED.length} required fields complete
                  </span>
                </div>
              </div>

              <div className="lsub-actions">
                <button
                  type="button"
                  className="lsub-btn-primary"
                  id="lsubSubmitBtn"
                  disabled={!isAllRequiredDone || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? "Submitting..." : "Submit for review"}
                </button>
                <span className="lsub-note">You can edit anytime before approval</span>
              </div>
            </div>
          ) : (
            <div className="list-submit-success" id="listSubmitSuccess">
              <div className="lsuccess-check">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 9 11 14.5 8 11.5" />
                </svg>
              </div>
              <h2 className="lsub-title">Listing submitted for review</h2>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "999px",
                  background: "rgba(245, 158, 11, 0.12)",
                  color: "#d97706",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  margin: "0.5rem auto 1rem",
                }}
              >
                <span>Status: In Review</span>
                <span>•</span>
                <span>Trust Score: Pending Review</span>
              </div>
              <p className="lsub-desc">
                Your opportunity has entered vvEntra’s review queue. We verify documentation depth, check for duplicates, and confirm your architect standing before it goes live. This usually takes 2 to 3 working days.
              </p>

              {(!isVerified || userRole !== "architect") && (
                <div
                  style={{
                    margin: "1.5rem auto",
                    maxWidth: "500px",
                    padding: "1.25rem",
                    borderRadius: "8px",
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                      color: "#b45309",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Identity Verification Required
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0 0 1rem", lineHeight: 1.5 }}>
                    Your account is currently <strong>Unverified</strong>. All marketplace listings require architect identity verification (LinkedIn + live check) before they can be approved and published to capital partners.
                  </p>
                  <Link
                    href="/verify"
                    className="btn btn-primary"
                    style={{ display: "inline-flex", fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                  >
                    Complete Identity Verification →
                  </Link>
                </div>
              )}

              <p className="lsuccess-prompt">Want to see how your submission will appear in the marketplace once approved?</p>
              <div className="lsub-actions">
                <Link href="/dashboard" className="lsub-btn-primary" id="lsubPreviewBtn">
                  Market Dashboard →
                </Link>
                <button
                  type="button"
                  className="lsub-btn-ghost"
                  id="lsubEditBtn"
                  onClick={() => setIsSubmitted(false)}
                >
                  Back to composer
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
