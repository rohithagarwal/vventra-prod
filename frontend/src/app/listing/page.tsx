"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchOpportunityById, OpportunityItem } from "@/lib/api/opportunities";

function ListingDetailContent() {
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [opp, setOpp] = useState<OpportunityItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const searchParams = useSearchParams();
  const oppId = searchParams.get("id");

  useEffect(() => {
    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || "investor";
    setRole(savedRole);

    if (oppId) {
      setIsLoading(true);
      fetchOpportunityById(oppId)
        .then((data) => setOpp(data))
        .catch(() => setOpp(null))
        .finally(() => setIsLoading(false));
    } else {
      // Check if user recently composed a listing
      try {
        const lastCreated = localStorage.getItem("vve-last-created-opp");
        if (lastCreated) {
          const parsed = JSON.parse(lastCreated);
          if (parsed && parsed.id) {
            setOpp(parsed);
          }
        }
      } catch {
        // No cached listing
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
    document.querySelectorAll(".reveal").forEach((el) => {
      revealIO.observe(el);
      el.classList.add("in");
    });

    return () => revealIO.disconnect();
  }, [oppId]);

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
  };

  const handleUnlockClick = () => {
    setUnlocked(true);
  };

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="listing" className="page listing-page">
        {opp ? (
          /* ACTIVE OPPORTUNITY DOSSIER VIEW */
          <div className="container-wide" style={{ padding: "3rem 1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
              <Link href="/browse" className="workspace-return" style={{ display: "inline-flex", marginBottom: "1rem" }}>
                ← Back to marketplace
              </Link>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <span className="opp-stage execution" style={{ textTransform: "uppercase", fontSize: "0.75rem", padding: "0.25rem 0.6rem", borderRadius: "4px", background: "rgba(226, 87, 27, 0.1)", color: "var(--role)", fontWeight: 600 }}>
                  {opp.code}
                </span>
                <span className="opp-status available" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem", borderRadius: "4px", background: "rgba(34, 197, 94, 0.1)", color: "#16a34a", fontWeight: 600 }}>
                  {opp.status.toUpperCase()}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Sector: {opp.sector.toUpperCase()}
                </span>
              </div>
              <h1 className="display md" style={{ fontSize: "2.2rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.75rem" }}>
                {opp.title}
              </h1>
              <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: "750px" }}>
                {opp.headline || opp.summary}
              </p>
            </div>

            {/* KEY METRICS BAR */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", padding: "1.5rem", background: "var(--bg-paper)", border: "1px solid var(--line)", borderRadius: "12px", marginBottom: "2.5rem" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Capital Requirement</span>
                <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--text)" }}>${Math.round(opp.deal_size).toLocaleString("en-US")}</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Target Return</span>
                <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--role)" }}>{opp.target_return || "3.5x in 24m"}</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Time to Launch</span>
                <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--text)" }}>{opp.timeline || "60–90 days"}</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Trust & Readiness</span>
                <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "#16a34a" }}>Score {opp.readiness_score}/100</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Unlock Access</span>
                <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--text)" }}>${Math.round(opp.unlock_fee).toLocaleString("en-US")}</span>
              </div>
            </div>

            {/* DOSSIER BODY */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>
              <div>
                {opp.problem_statement && (
                  <section style={{ marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>Problem Statement</h2>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{opp.problem_statement}</p>
                  </section>
                )}

                {opp.solution_overview && (
                  <section style={{ marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>Solution Overview & Architecture</h2>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{opp.solution_overview}</p>
                  </section>
                )}

                {opp.market_size && (
                  <section style={{ marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>Market Size & Addressable Whitespace</h2>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{opp.market_size}</p>
                  </section>
                )}

                {opp.business_model && (
                  <section style={{ marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text)" }}>Business & Revenue Model</h2>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{opp.business_model}</p>
                  </section>
                )}
              </div>

              {/* UNLOCK CARD */}
              <div>
                <div style={{ position: "sticky", top: "6rem", padding: "1.75rem", background: "var(--bg-paper)", border: "1px solid var(--line-strong)", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--role)", fontWeight: 700 }}>Confidential Dossier</span>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 600, margin: "0.5rem 0", color: "var(--text)" }}>
                    {opp.doc_depth_pages}+ Pages Documentation
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                    Unlocks full financial models, cap table projections, supplier contracts, code repositories, and architect direct advisory channel.
                  </p>
                  {!unlocked ? (
                    <button
                      type="button"
                      onClick={handleUnlockClick}
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.95rem" }}
                    >
                      Unlock for ${Math.round(opp.unlock_fee).toLocaleString("en-US")}
                    </button>
                  ) : (
                    <div style={{ padding: "0.75rem", background: "rgba(34, 197, 94, 0.1)", color: "#16a34a", borderRadius: "8px", textAlign: "center", fontWeight: 600, fontSize: "0.9rem" }}>
                      ✓ Staged Unlock Initiated (Tier 1 Active)
                    </div>
                  )}
                  <span style={{ display: "block", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                    Protected by vvEntra Staged Inspection Escrow
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CLEAN ZERO-STATE WHEN NO OPPORTUNITY IS SELECTED */
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
        )}
      </main>

      <Footer />
    </>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={null}>
      <ListingDetailContent />
    </Suspense>
  );
}
