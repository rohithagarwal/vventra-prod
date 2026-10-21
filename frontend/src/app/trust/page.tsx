"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TrustPage() {
  return (
    <>
      <Navbar currentRole="investor" />

      <main data-page="trust" className="page trust-page">
        <section className="terms-hero" style={{ padding: "6rem 0 3.5rem" }}>
          <div className="container">
            <span className="eyebrow reveal in">Trust Architecture · Institutional Standards</span>
            <h1 className="display lg reveal in delay-1">Built for <em>serious capital.</em></h1>
            <p className="lead reveal in delay-2">
              Trust is not a tagline at vvEntra. It is an architecture. Every layer of the platform is designed to filter for seriousness, protect intellectual property, and keep all participants accountable.
            </p>
          </div>
        </section>

        <section id="trust" style={{ padding: "1rem 0 5rem" }}>
          <div className="container">
            <div className="section-head reveal in">
              <div className="section-marker"><span className="num">01</span><span className="line"></span><span className="name">Platform Governance</span></div>
              <h2 className="display md">Four pillars of <em>institutional trust.</em></h2>
              <p className="lead">How vvEntra eliminates noise, enforces originality, and guarantees transaction security.</p>
            </div>

            <div className="trust-grid reveal in delay-1">
              <div className="trust-card">
                <span className="num">— 01</span>
                <h5>Verified members</h5>
                <p>Government ID verification and bank account validation. One-person-one-account policy. No bots. No duplicate identities. Every architect and every buyer is real, verified, and accountable.</p>
              </div>

              <div className="trust-card">
                <span className="num">— 02</span>
                <h5>Curated listings</h5>
                <p>Every opportunity is moderated before going live. Minimum 90+ pages of operational depth required. Originality checked and benchmarked against the standard the platform demands.</p>
              </div>

              <div className="trust-card">
                <span className="num">— 03</span>
                <h5>NDA-gated access</h5>
                <p>Confidentiality tiers protect substance. Buyers see structural metrics before accessing proprietary IP. Architects retain complete control over who unlocks what, and when.</p>
              </div>

              <div className="trust-card">
                <span className="num">— 04</span>
                <h5>Controlled unlock</h5>
                <p>Escrow logic weighted toward fairness and dispute protection. Repeated negative patterns trigger listing review. Bad actors lose access immediately, on either side.</p>
              </div>
            </div>

            <div style={{ marginTop: "4rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }} className="reveal in delay-2">
              <div className="card" style={{ padding: "2rem", border: "1px solid var(--line)" }}>
                <span className="num" style={{ fontFamily: "var(--font-serif, serif)", color: "var(--role)", fontSize: ".85rem" }}>Confidentiality</span>
                <h4 style={{ margin: ".75rem 0", fontFamily: "var(--font-serif, serif)", fontSize: "1.25rem" }}>Zero IP Leakage</h4>
                <p style={{ color: "var(--text-muted)", fontSize: ".88rem", lineHeight: 1.6, margin: 0 }}>
                  Pre-unlock previews conceal identifying operational IP. Watermarked and audit-logged blueprint deliveries protect creator copyrights throughout the evaluation cycle.
                </p>
              </div>

              <div className="card" style={{ padding: "2rem", border: "1px solid var(--line)" }}>
                <span className="num" style={{ fontFamily: "var(--font-serif, serif)", color: "var(--role)", fontSize: ".85rem" }}>Financial Protection</span>
                <h4 style={{ margin: ".75rem 0", fontFamily: "var(--font-serif, serif)", fontSize: "1.25rem" }}>Regulated Settlement</h4>
                <p style={{ color: "var(--text-muted)", fontSize: ".88rem", lineHeight: 1.6, margin: 0 }}>
                  Funds are held in secure escrow. Payouts to architects and unlock releases to buyers are governed by clear, deterministic rules without hidden deductions.
                </p>
              </div>

              <div className="card" style={{ padding: "2rem", border: "1px solid var(--line)" }}>
                <span className="num" style={{ fontFamily: "var(--font-serif, serif)", color: "var(--role)", fontSize: ".85rem" }}>Fairness Standard</span>
                <h4 style={{ margin: ".75rem 0", fontFamily: "var(--font-serif, serif)", fontSize: "1.25rem" }}>Neutral Arbitration</h4>
                <p style={{ color: "var(--text-muted)", fontSize: ".88rem", lineHeight: 1.6, margin: 0 }}>
                  In the rare event of quality disputes, objective criteria (completeness, framework depth, operational veracity) determine outcomes without bias toward either party.
                </p>
              </div>
            </div>

            <div style={{ marginTop: "4rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }} className="reveal in delay-3">
              <Link href="/pricing" className="btn btn-orange">
                Review Pricing &amp; Fees <span className="arrow">→</span>
              </Link>
              <Link href="/terms" className="btn btn-outline">
                Read Full Terms of Service <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
