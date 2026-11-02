"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");

  useEffect(() => {
    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || "investor";
    setRole(savedRole);

    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      revealIO.observe(el);
      el.classList.add("in");
    });

    return () => revealIO.disconnect();
  }, []);

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
    localStorage.setItem("vve-role", newRole);
    document.documentElement.setAttribute("data-role", newRole);
  };

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="about" className="page about-page">
        {/* HERO */}
        <header className="hero">
          <div className="container">
            <div className="hero-content">
              <span className="eyebrow reveal">The vvEntra Story · Venture Intelligence</span>
              <h1 className="display xl reveal delay-1">
                We enter ventures <em>together.</em>
              </h1>
              <p className="lead reveal delay-2">
                Traditional venture creation and brokerage is plagued by opaque middlemen, stolen ideas, and shallow pitch decks. vvEntra is built on a simple conviction: high-depth venture intelligence should be discovered, protected, and transacted with institutional trust.
              </p>
              <div className="hero-pills reveal delay-3" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
                <span className="pill" style={{ background: "var(--bg-paper)", border: "1px solid var(--line-strong)", padding: "0.4rem 0.85rem", borderRadius: "100px", fontSize: "0.82rem", fontWeight: 500 }}>
                  <span style={{ color: "var(--role)", marginRight: "0.4rem" }}>●</span> 90+ Page Minimum Depth
                </span>
                <span className="pill" style={{ background: "var(--bg-paper)", border: "1px solid var(--line-strong)", padding: "0.4rem 0.85rem", borderRadius: "100px", fontSize: "0.82rem", fontWeight: 500 }}>
                  <span style={{ color: "var(--role)", marginRight: "0.4rem" }}>●</span> Flat 10% Platform Fee
                </span>
                <span className="pill" style={{ background: "var(--bg-paper)", border: "1px solid var(--line-strong)", padding: "0.4rem 0.85rem", borderRadius: "100px", fontSize: "0.82rem", fontWeight: 500 }}>
                  <span style={{ color: "var(--role)", marginRight: "0.4rem" }}>●</span> Staged Reveal Protection
                </span>
                <span className="pill" style={{ background: "var(--bg-paper)", border: "1px solid var(--line-strong)", padding: "0.4rem 0.85rem", borderRadius: "100px", fontSize: "0.82rem", fontWeight: 500 }}>
                  <span style={{ color: "var(--role)", marginRight: "0.4rem" }}>●</span> Escrow Custody
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* MISSION & ORIGIN */}
        <section className="section" style={{ padding: "4rem 0", borderBottom: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ maxWidth: "840px", margin: "0 auto" }}>
              <span className="eyebrow reveal">Why vvEntra Exists</span>
              <h2 className="display lg reveal delay-1" style={{ marginTop: "0.5rem", marginBottom: "1.25rem" }}>
                Solving the fundamental dilemma of <em>idea marketplaces.</em>
              </h2>
              <div className="reveal delay-2" style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <p>
                  Every previous marketplace for business concepts died of the same failure mode: once intellectual property is seen, it cannot be un-seen. Buyers would browse opportunities, absorb the core insights, refuse to pay, and execute independently. Creators, burned by copyright theft, retreated behind secrecy or ceased publishing deep work entirely.
                </p>
                <p>
                  vvEntra solved this by replacing upfront full disclosure with our patent-ready <strong>Staged Reveal Architecture</strong>:
                </p>
                <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <li><strong>Stage 1 · Public AI Teaser:</strong> High-level problem statement, market size, and unit economics without revealing proprietary secret sauce.</li>
                  <li><strong>Stage 2 · Verified Intent:</strong> Identity verification via LinkedIn and refundable interest deposit.</li>
                  <li><strong>Stage 3 · Mutual Protection:</strong> Enforceable mutual NDA and preview of architectural frameworks.</li>
                  <li><strong>Stage 4 · Full Dossier Unlock:</strong> Escrow-backed release of complete 90+ page architectural specifications, models, and creator advisory access.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CORE PILLARS */}
        <section className="section" style={{ padding: "4rem 0", background: "var(--bg-bone)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3rem auto" }}>
              <span className="eyebrow reveal">Our Principles</span>
              <h2 className="display lg reveal delay-1" style={{ marginTop: "0.5rem" }}>
                Four commitments we <em>never break.</em>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              <div className="reveal" style={{ background: "var(--bg-paper)", border: "1px solid var(--line-strong)", borderRadius: "12px", padding: "1.75rem" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--role)", display: "block", marginBottom: "0.5rem" }}>01</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text)" }}>Proof of Depth</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                  We reject shallow 10-slide decks. Every listing on vvEntra must demonstrate institutional depth: tech architecture, TAM underwriting, unit economics, regulatory analysis, and 90-day execution roadmaps.
                </p>
              </div>

              <div className="reveal delay-1" style={{ background: "var(--bg-paper)", border: "1px solid var(--line-strong)", borderRadius: "12px", padding: "1.75rem" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--role)", display: "block", marginBottom: "0.5rem" }}>02</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text)" }}>Transparent 10% Fee</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                  We take a flat 10% commission on completed transactions. You keep 90% of everything you earn. Zero listing charges, zero subscription tiers, zero hidden brokerage spreads.
                </p>
              </div>

              <div className="reveal delay-2" style={{ background: "var(--bg-paper)", border: "1px solid var(--line-strong)", borderRadius: "12px", padding: "1.75rem" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--role)", display: "block", marginBottom: "0.5rem" }}>03</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text)" }}>Strict Escrow Custody</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                  Buyer capital never goes directly to an unverified party. Escrow holds funds safely throughout the 7-day inspection window, protecting both parties against fraud and delivery failure.
                </p>
              </div>

              <div className="reveal delay-3" style={{ background: "var(--bg-paper)", border: "1px solid var(--line-strong)", borderRadius: "12px", padding: "1.75rem" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--role)", display: "block", marginBottom: "0.5rem" }}>04</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text)" }}>Evidence-Based Disputes</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                  Our neutral dispute board resolves contested claims in 5 business days using cryptographic on-platform transaction records. Honest operators always receive fair adjudication.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="section" style={{ padding: "5rem 0", textAlign: "center" }}>
          <div className="container">
            <div style={{ maxWidth: "650px", margin: "0 auto" }}>
              <span className="eyebrow reveal">Get Started</span>
              <h2 className="display lg reveal delay-1" style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
                Ready to review verified <em>opportunities?</em>
              </h2>
              <p className="lead reveal delay-2" style={{ margin: "0 auto 2rem auto" }}>
                Join forward-thinking operators, family offices, and architectural creators building the future of venture intelligence.
              </p>
              <div className="reveal delay-3" style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/browse" className="btn btn-orange">
                  Explore opportunities →
                </Link>
                <Link href="/trust" className="btn btn-outline">
                  Read trust policy
                </Link>
                <Link href="/faq" className="btn btn-outline">
                  Frequently asked questions
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
