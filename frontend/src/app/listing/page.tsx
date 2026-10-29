"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getStoredOpportunities, OpportunityItem } from "@/lib/storage/opportunities";

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
    return all.find((item) => item.id === idParam) || null;
  }, [idParam, isClient]);

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
              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "4px", background: "rgba(22, 163, 74, 0.1)", color: "var(--green)" }}>
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
                <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--green)" }}>{opp.trustScore} / 100</span>
              </div>
            </div>

            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Investment Thesis</h2>
              <div style={{ padding: "1.25rem", background: "var(--bg-paper)", borderRadius: "8px", border: "1px solid var(--line)", lineHeight: 1.6 }}>
                {opp.thesis || "High margin whitespace with enterprise demand and pilot validations ready to deploy."}
              </div>
            </section>

            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>The Problem</h2>
              <div style={{ padding: "1.25rem", background: "var(--bg-paper)", borderRadius: "8px", border: "1px solid var(--line)", lineHeight: 1.6 }}>
                {opp.problem || "Inefficient manual processes costing businesses substantial time and operational overhead."}
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
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setUnlocked(true)}
            >
              {unlocked ? "Unlocked · Access Granted" : `Unlock dossier (${opp.unlockPrice})`}
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
