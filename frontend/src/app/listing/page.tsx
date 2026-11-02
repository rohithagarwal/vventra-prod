"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  getStoredOpportunities,
  getUnlockedOpportunities,
  unlockOpportunity,
  simulateSummary,
  OpportunityItem,
} from "@/lib/storage/opportunities";

function ListingDetailContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams ? searchParams.get("id") : null;
  const [unlocked, setUnlocked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const opp = useMemo(() => {
    if (typeof window === "undefined" || !idParam) return null;
    const all = getStoredOpportunities();
    let found = all.find((item) => item.id === idParam) || null;
    if (!found) {
      try {
        const composedRaw = localStorage.getItem("vve-composed-listing");
        if (composedRaw) {
          const parsed = JSON.parse(composedRaw);
          if (parsed && parsed.id === idParam) {
            found = parsed;
          }
        }
      } catch {}
    }
    return found;
  }, [idParam, isClient]);

  // Sync unlock state with persistent store
  useEffect(() => {
    if (typeof window !== "undefined" && opp?.id) {
      const unlockedList = getUnlockedOpportunities();
      if (unlockedList.includes(opp.id)) {
        setUnlocked(true);
      }
    }
  }, [opp?.id]);

  const handleUnlock = () => {
    if (!opp) return;
    setUnlocked(true);
    unlockOpportunity(opp.id);
  };

  const thesisSummary = useMemo(() => {
    if (!opp) return "";
    return (
      opp.thesisSummary ||
      opp.aiSummaries?.thesis ||
      simulateSummary("Investment thesis", opp.thesis || "")
    );
  }, [opp]);

  const problemSummary = useMemo(() => {
    if (!opp) return "";
    return (
      opp.problemSummary ||
      opp.aiSummaries?.problem ||
      simulateSummary("The problem", opp.problem || "")
    );
  }, [opp]);

  // When still hydrating on client and idParam is present, render clean loader
  if (!isClient && idParam) {
    return (
      <main data-page="listing" className="page listing-page">
        <div className="container-wide" style={{ padding: "4rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading opportunity specification...
        </div>
      </main>
    );
  }

  if (!opp) {
    return (
      <main data-page="listing" className="page listing-page">
        <div className="container-wide" style={{ padding: "4rem 1.5rem", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div className="platform-empty-state" style={{ padding: "5rem 2rem", border: "1px dashed var(--line-strong)", background: "var(--bg-paper)", borderRadius: "16px" }}>
            <span className="empty-value" style={{ display: "block", fontSize: "3rem", fontWeight: 300, color: "var(--role)", marginBottom: "0.75rem" }}>0</span>
            <h1 className="display md" style={{ fontSize: "1.6rem", marginBottom: "0.75rem", color: "var(--text)" }}>No published opportunities yet</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
              Approved listings will appear automatically when they are published. As architects pass moderation, confidential opportunity dossiers will unlock here.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/browse" className="btn btn-outline">Back to marketplace</Link>
              <Link href="/list" className="btn btn-primary">List an opportunity</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main data-page="listing" className="page listing-page">
      <div className="container-wide" style={{ padding: "2rem 1.5rem" }}>
        <Link href="/browse" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", border: "1px solid var(--line)" }}>
          ← Back to marketplace
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2.5rem", alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <span className={`opp-stage ${opp.stage}`} style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "4px", background: "var(--role-ghost)", color: "var(--role)" }}>
                {opp.stageLabel}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "4px",
                  background: opp.status === "review" ? "rgba(245, 158, 11, 0.12)" : "rgba(22, 163, 74, 0.1)",
                  color: opp.status === "review" ? "#d97706" : "var(--green)",
                  fontWeight: 500,
                }}
              >
                {opp.statusLabel}
              </span>
              {(opp.tags || []).map((t) => (
                <span key={t} style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "4px", border: "1px solid var(--line)", color: "var(--text-muted)" }}>
                  {t}
                </span>
              ))}
            </div>

            <h1 className="display md listing-main-title" style={{ marginBottom: "1rem" }}>{opp.title}</h1>
            <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "2rem" }}>{opp.hook}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", padding: "1.5rem", background: "var(--bg-paper)", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "2.5rem" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-faint)", textTransform: "uppercase" }}>Listed Valuation</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>${opp.priceNum?.toLocaleString("en-US") || "30,000"}</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-faint)", textTransform: "uppercase" }}>Capital Required</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>{opp.capital || "--"}</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-faint)", textTransform: "uppercase" }}>Time to Launch</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>{opp.timeToLaunch || "--"}</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-faint)", textTransform: "uppercase" }}>Trust Score</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 600, color: opp.trustScore && opp.trustScore > 0 ? "var(--green)" : "var(--text-muted)" }}>
                  {opp.trustScore && opp.trustScore > 0 ? `${opp.trustScore} / 100` : "Pending Review"}
                </span>
              </div>
            </div>

            {/* INVESTMENT THESIS */}
            <section style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Investment Thesis</h2>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "4px",
                    background: unlocked ? "rgba(22, 163, 74, 0.1)" : "rgba(245, 158, 11, 0.12)",
                    color: unlocked ? "var(--green)" : "#d97706",
                    fontWeight: 600,
                  }}
                >
                  {unlocked ? "✓ Unlocked · Full Specification" : "Public AI Summary · Full Text Locked"}
                </span>
              </div>

              <div style={{ padding: "1.25rem", background: "var(--bg-paper)", borderRadius: "8px", border: "1px solid var(--line)", lineHeight: 1.6 }}>
                {unlocked ? (
                  <div style={{ whiteSpace: "pre-line", fontSize: "0.95rem", color: "var(--text)" }}>
                    {opp.thesis || "High margin whitespace with enterprise demand and pilot validations ready to deploy."}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "0.92rem", color: "var(--text)", lineHeight: 1.6 }}>
                      {thesisSummary.split("\n").filter(Boolean).map((line, idx) =>
                        line.trim().startsWith("•") ? (
                          <div key={idx} style={{ paddingLeft: "1rem", margin: "0.25rem 0", color: "var(--text)" }}>
                            {line}
                          </div>
                        ) : (
                          <p key={idx} style={{ margin: "0.35rem 0" }}>{line}</p>
                        )
                      )}
                    </div>

                    <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px dashed var(--line)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--role)", fontWeight: 600, marginBottom: "0.4rem" }}>
                        <span>Architect&apos;s Full Write-up</span>
                        <span>•</span>
                        <span>Confidential (Locked)</span>
                      </div>
                      <div style={{ position: "relative", overflow: "hidden", borderRadius: "6px", background: "rgba(0,0,0,0.03)", padding: "1rem" }}>
                        <div style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                          Proprietary architectural operational framework, unit economics, defensible IP boundaries, validation datasets, and confidential roadmap specifications remain locked behind the investor unlock fee. Complete architectural documentation, code schemas, and financial sensitivities unlock immediately upon access authorization.
                        </div>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.45)" }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            id="unlockThesisBtn"
                            style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", background: "var(--bg-paper)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                            onClick={handleUnlock}
                          >
                            🔒 Unlock full thesis ({opp.unlockPrice})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* THE PROBLEM */}
            <section style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>The Problem</h2>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "4px",
                    background: unlocked ? "rgba(22, 163, 74, 0.1)" : "rgba(245, 158, 11, 0.12)",
                    color: unlocked ? "var(--green)" : "#d97706",
                    fontWeight: 600,
                  }}
                >
                  {unlocked ? "✓ Unlocked · Full Specification" : "Public AI Summary · Full Text Locked"}
                </span>
              </div>

              <div style={{ padding: "1.25rem", background: "var(--bg-paper)", borderRadius: "8px", border: "1px solid var(--line)", lineHeight: 1.6 }}>
                {unlocked ? (
                  <div style={{ whiteSpace: "pre-line", fontSize: "0.95rem", color: "var(--text)" }}>
                    {opp.problem || "Inefficient manual processes costing businesses substantial time and operational overhead."}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "0.92rem", color: "var(--text)", lineHeight: 1.6 }}>
                      {problemSummary.split("\n").filter(Boolean).map((line, idx) =>
                        line.trim().startsWith("•") ? (
                          <div key={idx} style={{ paddingLeft: "1rem", margin: "0.25rem 0", color: "var(--text)" }}>
                            {line}
                          </div>
                        ) : (
                          <p key={idx} style={{ margin: "0.35rem 0" }}>{line}</p>
                        )
                      )}
                    </div>

                    <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px dashed var(--line)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--role)", fontWeight: 600, marginBottom: "0.4rem" }}>
                        <span>Architect&apos;s Full Write-up</span>
                        <span>•</span>
                        <span>Confidential (Locked)</span>
                      </div>
                      <div style={{ position: "relative", overflow: "hidden", borderRadius: "6px", background: "rgba(0,0,0,0.03)", padding: "1rem" }}>
                        <div style={{ filter: "blur(5px)", userSelect: "none", pointerEvents: "none", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                          Detailed root-cause analysis, workflow friction breakdowns, operational bottleneck figures, customer interview transcripts, and legacy software limitations remain locked behind the unlock fee. Complete architectural problem dossier and cost model unlock immediately upon access authorization.
                        </div>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.45)" }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            id="unlockProblemBtn"
                            style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", background: "var(--bg-paper)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                            onClick={handleUnlock}
                          >
                            🔒 Unlock full problem ({opp.unlockPrice})
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR UNLOCK CARD */}
          <aside style={{ position: "sticky", top: "100px", padding: "1.5rem", background: "var(--bg-paper)", border: "1px solid var(--line)", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--role)", fontWeight: 600 }}>Exclusive Dossier</span>
            <div style={{ margin: "1rem 0" }}>
              <span style={{ fontSize: "2rem", fontWeight: 700 }}>{opp.unlockPrice}</span>
              <span style={{ color: "var(--text-faint)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>to unlock</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Unlocks full 90+ page architectural specification, financial models, architecture diagrams, and founder intro call.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              id="sidebarUnlockBtn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleUnlock}
            >
              {unlocked ? "✓ Unlocked · Access Granted" : `Unlock dossier (${opp.unlockPrice})`}
            </button>

            {unlocked && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.3)", borderRadius: "6px", color: "var(--green)", fontSize: "0.85rem", textAlign: "center" }}>
                ✓ Dossier unlocked. Check your email and dashboard for direct access.
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function ListingDetailPage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");

  useEffect(() => {
    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || "investor";
    setRole(savedRole);
  }, []);

  return (
    <>
      <Navbar currentRole={role} onRoleChange={setRole} />
      <Suspense fallback={<div className="page" style={{ padding: "4rem", textAlign: "center" }}>Loading listing...</div>}>
        <ListingDetailContent />
      </Suspense>
      <Footer />
    </>
  );
}
