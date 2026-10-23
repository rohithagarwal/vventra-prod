"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ListingDetailPage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [unlocked, setUnlocked] = useState(false);
  const [saved, setSaved] = useState(false);

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
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      revealIO.observe(el);
      el.classList.add("in");
    });

    return () => revealIO.disconnect();
  }, []);

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

  {/* BACK NAV */}
  <div className="listing-back container-wide">
    <Link href="/browse" className="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
      Back to opportunities
    </Link>
  </div>

  {/* MAIN GRID: content + sidebar */}
  <div className="listing-grid container-wide">

    {/* LEFT: CONTENT COLUMN */}
    <article className="listing-content">

      {/* HEADER */}
      <header className="listing-header reveal">
        <div className="listing-meta-row">
          <span className="listing-industry">E-Commerce Operations</span>
          <span className="listing-sep">·</span>
          <span className="listing-industry">AI Automation</span>
          <span className="listing-conf-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Confidential
          </span>
          <span className="listing-id">ASSET-7741-B</span>
        </div>

        <h1 className="listing-title reveal delay-1">
          Autonomous Backend Operations System for
          <em>Mid-Market E-Commerce Brands</em>
        </h1>

        <p className="listing-hook reveal delay-2">
          A fully documented operational intelligence system that removes the founder from backend e-commerce operations — product listing, QA, catalogue management, supplier workflows, and AI-assisted automation — in under 90 days.
        </p>

        {/* KEY STAT ROW */}
        <div className="listing-stats reveal delay-3">
          <div className="lstat">
            <span className="lstat-v">$28,000</span>
            <span className="lstat-l">Listed at</span>
          </div>
          <div className="lstat">
            <span className="lstat-v">$2,800</span>
            <span className="lstat-l">To unlock</span>
          </div>
          <div className="lstat">
            <span className="lstat-v">90 days</span>
            <span className="lstat-l">To launch</span>
          </div>
          <div className="lstat">
            <span className="lstat-v">87 / 100</span>
            <span className="lstat-l">Trust score</span>
          </div>
        </div>
      </header>

      {/* DIVIDER */}
      <div className="listing-rule"></div>

      {/* SECTION 01: INVESTMENT THESIS */}
      <section className="listing-section reveal" id="ls-01">
        <div className="ls-num">01</div>
        <div className="ls-body">
          <h2 className="ls-title">Investment thesis</h2>
          <p className="ls-text">E-commerce brands at the $2M–$15M GMV stage are operationally bottlenecked by the founder's direct involvement in backend work. Product listing, QA, catalogue management, and supplier coordination consume 60–80% of operational bandwidth. The brands that break through this ceiling are the ones that systematise first.</p>
          <p className="ls-text">This system is not a set of SOPs. It is a fully operational intelligence layer — structured workflows, trained decision trees, automation triggers, QA checkpoints, and supplier communication frameworks — that can be handed to a 3-person remote team and run independently within 90 days of deployment.</p>
          <blockquote className="ls-quote">
            "The founder who systematises their backend before $10M GMV reaches $50M. The one who doesn't is still doing the same work at $30M."
          </blockquote>
        </div>
      </section>

      {/* SECTION 02: THE PROBLEM */}
      <section className="listing-section reveal" id="ls-02">
        <div className="ls-num">02</div>
        <div className="ls-body">
          <h2 className="ls-title">The problem</h2>
          <p className="ls-text">Mid-market e-commerce brands run their operations on tribal knowledge, Slack messages, and the founder's memory. When a product listing is wrong, the founder fixes it. When a supplier sends incorrect specs, the founder catches it. When a theme update breaks the checkout, the founder notices it at 11pm.</p>
          <p className="ls-text">This creates three compounding problems: the brand cannot scale beyond what one person can manage; the brand cannot raise capital because there are no documented systems for investors to audit; and the brand cannot be acquired because the operator is the operation.</p>

          <div className="ls-problem-grid">
            <div className="ls-problem-card">
              <span className="lpc-icon">⊗</span>
              <span className="lpc-label">Cannot scale</span>
              <span className="lpc-detail">Operations tied to the founder's bandwidth, not the brand's revenue.</span>
            </div>
            <div className="ls-problem-card">
              <span className="lpc-icon">⊗</span>
              <span className="lpc-label">Cannot raise</span>
              <span className="lpc-detail">No documented systems means no institutional confidence for investors.</span>
            </div>
            <div className="ls-problem-card">
              <span className="lpc-icon">⊗</span>
              <span className="lpc-label">Cannot exit</span>
              <span className="lpc-detail">If the operator is the operation, there is no business to acquire.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: MARKET GAP */}
      <section className="listing-section reveal" id="ls-03">
        <div className="ls-num">03</div>
        <div className="ls-body">
          <h2 className="ls-title">Market gap</h2>
          <p className="ls-text">There are two categories of solutions available today: expensive e-commerce agencies that handle execution but build no internal systems (and leave when the retainer ends), and generic SOP marketplaces that sell templates without the operational logic that makes them work.</p>
          <p className="ls-text">Neither category addresses the $2M–$15M GMV brand that needs a complete, deployable operational system built specifically for how e-commerce backends actually work — suppliers, listings, QA, catalogues, themes, customer operations — not a management consultant's version of it.</p>
          <div className="ls-gap-bar">
            <div className="ls-gap-label">
              <span>Generic SOP templates</span>
              <span className="gap-tag low">No operational logic</span>
            </div>
            <div className="gap-track"><div className="gap-fill" style={{'width': '20%'}}></div></div>
            <div className="ls-gap-label">
              <span>E-commerce agencies</span>
              <span className="gap-tag mid">No system transfer</span>
            </div>
            <div className="gap-track"><div className="gap-fill" style={{'width': '45%'}}></div></div>
            <div className="ls-gap-label">
              <span className="gap-highlight">This opportunity</span>
              <span className="gap-tag high">Full system, deployed</span>
            </div>
            <div className="gap-track"><div className="gap-fill" style={{'width': '92%'}}></div></div>
          </div>
        </div>
      </section>

      {/* SECTION 04: THE ARCHITECT */}
      <section className="listing-section reveal" id="ls-04">
        <div className="ls-num">04</div>
        <div className="ls-body">
          <h2 className="ls-title">The architect</h2>
          <div className="ls-architect-card">
            <div className="arch-avatar">
              <span>AJ</span>
            </div>
            <div className="arch-info">
              <span className="arch-name">Verified Architect · Identity confirmed</span>
              <span className="arch-title">Senior E-Commerce Operations Specialist</span>
              <span className="arch-track">3 successful system deployments · 2 active clients · Austpek (AU) reference available post-unlock</span>
            </div>
            <div className="arch-score">
              <span className="arch-score-v">94</span>
              <span className="arch-score-l">Trust</span>
            </div>
          </div>
          <p className="ls-text" style={{'marginTop': '1.25rem'}}>Full identity, LinkedIn profile, operational references, and client case studies are released upon unlock. The architect is available for a live structured meeting with every buyer who unlocks — no exceptions, no automated responses.</p>
        </div>
      </section>

      {/* SECTION 05: ENGAGEMENT MODEL */}
      <section className="listing-section reveal" id="ls-05">
        <div className="ls-num">05</div>
        <div className="ls-body">
          <h2 className="ls-title">Engagement model</h2>
          <p className="ls-text">After unlocking, you choose one of three paths. The architect cannot decline your chosen path.</p>
          <div className="ls-engagement-grid">
            <div className="ls-eng-card featured">
              <span className="eng-label">Full Partnership</span>
              <span className="eng-price">$25,200</span>
              <span className="eng-desc">Architect joins as your execution partner. Active involvement, weekly check-ins, full operational support across the 90-day deployment.</span>
              <span className="eng-tag">100% of remaining</span>
            </div>
            <div className="ls-eng-card">
              <span className="eng-label">Guidance</span>
              <span className="eng-price">$17,640</span>
              <span className="eng-desc">Architect advises and reviews. Scheduled sessions, document access, strategic input — you execute independently.</span>
              <span className="eng-tag">70% of remaining</span>
            </div>
            <div className="ls-eng-card">
              <span className="eng-label">Documents Only</span>
              <span className="eng-price">$12,600</span>
              <span className="eng-desc">Full IP transfer. Complete system documentation with exclusive execution rights. You build your own team around it.</span>
              <span className="eng-tag">50% of remaining</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 06: WHY NOW */}
      <section className="listing-section reveal" id="ls-06">
        <div className="ls-num">06</div>
        <div className="ls-body">
          <h2 className="ls-title">Why now</h2>
          <p className="ls-text">Three forces are converging. First, AI tooling (GPT-4o-level models, automation APIs) has made it possible to build operational systems in 2025 that would have required a 10-person ops team in 2020 — the cost of the system is a fraction of what it once was. Second, e-commerce margins are compressing globally, forcing brands to cut operational overhead or lose. Third, the acquisition market for sub-$20M e-commerce brands has heated significantly, and systematised operations are the single largest valuation lever available to founders below Series A.</p>
          <div className="ls-why-row">
            <div className="ls-why-item">
              <span className="why-icon">↑</span>
              <span className="why-text">AI tooling makes this system 70% cheaper to deploy than 2020 equivalent</span>
            </div>
            <div className="ls-why-item">
              <span className="why-icon">↑</span>
              <span className="why-text">E-commerce M&A activity at 5-year high, systematic ops = valuation premium</span>
            </div>
            <div className="ls-why-item">
              <span className="why-icon">↑</span>
              <span className="why-text">Margin compression forcing brands to cut operational cost or exit</span>
            </div>
          </div>
        </div>
      </section>

      {/* LOCKED GATE INDICATOR */}
      <div className="listing-lock-gate reveal">
        <div className="lock-gate-header">
          <div className="lock-gate-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="lock-gate-text">
            <span className="lock-gate-title" id="lockGateTitle">The full package unlocks after payment</span>
            <span className="lock-gate-sub">Unlock for <strong id="lockGateFee">$2,800</strong> to receive every document below, plus the full thesis and a live architect meeting.</span>
          </div>
        </div>

        {/* WHAT YOU RECEIVE: clear document table of contents */}
        <div className="doc-package">
          <div className="doc-package-label">What you receive on unlock</div>
          <div className="doc-package-list" id="docPackageList">
            <div className="doc-pkg-row">
              <span className="doc-pkg-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
              <span className="doc-pkg-name">Full Operational Blueprint — 90-page system documentation</span>
              <span className="doc-pkg-type">PDF</span>
              <span className="doc-pkg-lock"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            </div>
            <div className="doc-pkg-row">
              <span className="doc-pkg-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
              <span className="doc-pkg-name">Financial Model &amp; Unit Economics</span>
              <span className="doc-pkg-type">XLSX</span>
              <span className="doc-pkg-lock"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            </div>
            <div className="doc-pkg-row">
              <span className="doc-pkg-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
              <span className="doc-pkg-name">Go-to-Market Playbook — Phase 1 Launch Plan</span>
              <span className="doc-pkg-type">PDF</span>
              <span className="doc-pkg-lock"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            </div>
            <div className="doc-pkg-row">
              <span className="doc-pkg-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
              <span className="doc-pkg-name">Competitive Landscape Deep-Dive with Feature Matrix</span>
              <span className="doc-pkg-type">PDF</span>
              <span className="doc-pkg-lock"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            </div>
            <div className="doc-pkg-row">
              <span className="doc-pkg-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
              <span className="doc-pkg-name">Supplier &amp; Workflow SOP Templates</span>
              <span className="doc-pkg-type">PDF</span>
              <span className="doc-pkg-lock"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            </div>
            <div className="doc-pkg-row">
              <span className="doc-pkg-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
              <span className="doc-pkg-name">Reference Architecture &amp; Tooling Stack</span>
              <span className="doc-pkg-type">PDF</span>
              <span className="doc-pkg-lock"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            </div>
          </div>
          <div className="doc-package-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            File names are shown so you know exactly what you receive. Contents are released after payment and NDA.
          </div>
        </div>
      </div>

      {/* BOTTOM UNLOCK CTA */}
      <div className="listing-unlock-bottom reveal">
        <div className="unlock-bottom-inner">
          <div className="unlock-bottom-head">
            <h2 className="unlock-bottom-title">Ready to go deeper?</h2>
            <p className="unlock-bottom-sub">Unlock for <strong>$2,800</strong> to access the full thesis, meet the architect, and choose your engagement path. Your payment is held in escrow until you confirm value received.</p>
          </div>

          <div className="unlock-steps">
            <div className="unlock-step">
              <span className="ustep-n">1</span>
              <div className="ustep-body">
                <span className="ustep-title">Pay to unlock</span>
                <span className="ustep-desc">$2,800 held in escrow. Access all 12 sections plus the full document package.</span>
              </div>
            </div>
            <div className="unlock-step-arrow">→</div>
            <div className="unlock-step">
              <span className="ustep-n">2</span>
              <div className="ustep-body">
                <span className="ustep-title">Meet the architect</span>
                <span className="ustep-desc">A live structured call, minimum 60 minutes. Identity and references confirmed.</span>
              </div>
            </div>
            <div className="unlock-step-arrow">→</div>
            <div className="unlock-step">
              <span className="ustep-n">3</span>
              <div className="ustep-body">
                <span className="ustep-title">Choose your path</span>
                <span className="ustep-desc">Full Partnership, Guidance, or Documents Only. The architect cannot decline.</span>
              </div>
            </div>
          </div>

          <div className="unlock-bottom-actions">
            <button className="unlock-primary-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Unlock this opportunity · $2,800
            </button>
            <span className="unlock-assurance">Funds held in escrow · Released only after your approval</span>
          </div>
        </div>
      </div>

    </article>

    {/* RIGHT: STICKY SIDEBAR */}
    <aside className="listing-sidebar">
      <div className="sidebar-inner">

        {/* SNAPSHOT CARD */}
        <div className="sidebar-card snapshot-card">
          <span className="sidebar-card-label">Snapshot</span>
          <div className="snapshot-rows">
            <div className="snap-row">
              <span className="snap-key">Stage</span>
              <span className="snap-val execution">Execution-Ready</span>
            </div>
            <div className="snap-row">
              <span className="snap-key">Geography</span>
              <span className="snap-val">AU, US, UK</span>
            </div>
            <div className="snap-row">
              <span className="snap-key">Capital required</span>
              <span className="snap-val">$28,000 – $56,000</span>
            </div>
            <div className="snap-row">
              <span className="snap-key">Time to launch</span>
              <span className="snap-val">60–90 days</span>
            </div>
            <div className="snap-row">
              <span className="snap-key">Market demand</span>
              <span className="snap-val high">High</span>
            </div>
            <div className="snap-row">
              <span className="snap-key">Monetisation</span>
              <span className="snap-val">Retainer + project</span>
            </div>
          </div>

          {/* TRUST SCORE */}
          <div className="trust-score-block">
            <div className="trust-score-row">
              <span className="trust-score-label">vvEntra Trust Score</span>
              <span className="trust-score-val">87 / 100</span>
            </div>
            <div className="trust-track">
              <div className="trust-fill" style={{'width': '87%'}}></div>
            </div>
            <span className="trust-note">Identity verified · Documentation reviewed · 3 client references</span>
          </div>

          {/* TAGS */}
          <div className="snap-tags">
            <span className="snap-tag">E-Commerce</span>
            <span className="snap-tag">Operations</span>
            <span className="snap-tag">AI Systems</span>
            <span className="snap-tag">B2B</span>
          </div>
        </div>

        {/* MINI UNLOCK CTA */}
        <div className="sidebar-card unlock-mini-card">
          <div className="unlock-mini-price">
            <span className="ump-label">Unlock fee</span>
            <span className="ump-val">$2,800</span>
          </div>
          <div className="unlock-mini-detail">
            <span>Full thesis · 12 sections</span>
            <span>Live architect meeting</span>
            <span>Three engagement paths</span>
            <span>Escrow-protected payment</span>
          </div>
          <button className="unlock-mini-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Unlock · $2,800
          </button>
          <span className="unlock-mini-assurance">Funds held in escrow</span>
        </div>

        {/* INTEGRITY CHECKLIST */}
        <div className="sidebar-card integrity-card">
          <span className="sidebar-card-label">Integrity checklist</span>
          <div className="integrity-rows">
            <div className="int-row verified">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Identity verified
            </div>
            <div className="int-row verified">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Documentation reviewed
            </div>
            <div className="int-row verified">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Duplicate listing check
            </div>
            <div className="int-row verified">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Client references (3)
            </div>
            <div className="int-row pending">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              Financial audit (post-unlock)
            </div>
          </div>
        </div>

      </div>
    </aside>

  </div>{/* end listing-grid */}


  {/* ============ POST-UNLOCK JOURNEY (hidden until unlocked) ============ */}
  <div className="container-wide unlocked-journey" id="unlockedJourney" style={{'display': 'none'}}>

    {/* Progress rail */}
    <div className="uj-rail">
      <div className="uj-step is-active" data-ujstep="1"><span className="uj-dot">✓</span><span className="uj-step-label">Unlocked</span></div>
      <div className="uj-line"></div>
      <div className="uj-step" data-ujstep="2"><span className="uj-dot">2</span><span className="uj-step-label">Choose path</span></div>
      <div className="uj-line"></div>
      <div className="uj-step" data-ujstep="3"><span className="uj-dot">3</span><span className="uj-step-label">Commit</span></div>
      <div className="uj-line"></div>
      <div className="uj-step" data-ujstep="4"><span className="uj-dot">4</span><span className="uj-step-label">Engagement</span></div>
    </div>

    {/* Money status bar */}
    <div className="uj-money" id="ujMoney">
      <div className="ujm-item"><span className="ujm-k">Unlock fee paid</span><span className="ujm-v paid" id="ujmUnlock">$2,800</span></div>
      <div className="ujm-item"><span className="ujm-k">Held in escrow</span><span className="ujm-v escrow" id="ujmEscrow">$2,800</span></div>
      <div className="ujm-item"><span className="ujm-k">Remaining on commit</span><span className="ujm-v" id="ujmRemaining">$25,200</span></div>
      <div className="ujm-item"><span className="ujm-k">Released to architect</span><span className="ujm-v" id="ujmReleased">$0</span></div>
    </div>

    {/* STATE 2: Unlocked confirmation + what they now have */}
    <div className="uj-panel" id="ujPanel-unlocked">
      <div className="uj-confirm">
        <div className="uj-confirm-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="16 9 11 14.5 8 11.5"/></svg></div>
        <div>
          <h2 className="uj-h2">Opportunity unlocked</h2>
          <p className="uj-sub">The full thesis is open below and every document is ready to download. Your $2,800 is held in escrow. Review everything, then choose how you want to engage with the architect.</p>
        </div>
      </div>

      {/* Downloadable documents (now unlocked) */}
      <div className="uj-docs">
        <span className="uj-docs-label">Your documents · ready to download</span>
        <div className="uj-doc-grid" id="ujDocGrid">
          <a className="uj-doc" href="#listing" onClick={(e) => e.preventDefault()}><span className="uj-doc-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span><span className="uj-doc-name">Full Operational Blueprint</span><span className="uj-doc-dl">Download</span></a>
          <a className="uj-doc" href="#listing" onClick={(e) => e.preventDefault()}><span className="uj-doc-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span><span className="uj-doc-name">Financial Model &amp; Unit Economics</span><span className="uj-doc-dl">Download</span></a>
          <a className="uj-doc" href="#listing" onClick={(e) => e.preventDefault()}><span className="uj-doc-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span><span className="uj-doc-name">Go-to-Market Playbook</span><span className="uj-doc-dl">Download</span></a>
        </div>
      </div>

      <button className="uj-btn-primary" id="ujToPathBtn">Choose your engagement path →</button>
    </div>

    {/* STATE 2b: Choose path */}
    <div className="uj-panel" id="ujPanel-path" style={{'display': 'none'}}>
      <h2 className="uj-h2">Choose how you engage</h2>
      <p className="uj-sub">One choice. The architect cannot decline your selected path. The remaining amount is based on what you choose, and stays in escrow until you approve delivery.</p>

      <div className="uj-paths">
        <label className="uj-path" data-path="full" data-remaining="25200">
          <input type="radio" name="ujpath" value="full" />
          <div className="uj-path-inner">
            <div className="uj-path-head"><span className="uj-path-name">Full Partnership</span><span className="uj-path-tag">100% of remaining</span></div>
            <span className="uj-path-price">$25,200</span>
            <span className="uj-path-desc">The architect joins as your execution partner. Active weekly involvement across the full 90-day deployment.</span>
          </div>
        </label>
        <label className="uj-path" data-path="guidance" data-remaining="17640">
          <input type="radio" name="ujpath" value="guidance" />
          <div className="uj-path-inner">
            <div className="uj-path-head"><span className="uj-path-name">Guidance</span><span className="uj-path-tag">70% of remaining</span></div>
            <span className="uj-path-price">$17,640</span>
            <span className="uj-path-desc">The architect advises and reviews. Scheduled sessions and document access; you execute independently.</span>
          </div>
        </label>
        <label className="uj-path" data-path="docs" data-remaining="12600">
          <input type="radio" name="ujpath" value="docs" />
          <div className="uj-path-inner">
            <div className="uj-path-head"><span className="uj-path-name">Documents Only</span><span className="uj-path-tag">50% of remaining</span></div>
            <span className="uj-path-price">$12,600</span>
            <span className="uj-path-desc">Full IP transfer with exclusive execution rights. You build your own team around the system.</span>
          </div>
        </label>
      </div>

      <div className="uj-path-actions">
        <button className="uj-btn-ghost" id="ujBackToUnlocked">← Back</button>
        <button className="uj-btn-primary" id="ujToCommitBtn" disabled>Continue to commit</button>
      </div>
    </div>

    {/* STATE 3: Commit / pay remaining */}
    <div className="uj-panel" id="ujPanel-commit" style={{'display': 'none'}}>
      <h2 className="uj-h2">Commit to <span id="ujCommitPathName">Full Partnership</span></h2>
      <p className="uj-sub">Your payment is held in escrow and released to the architect only as milestones are approved by you. You have a 7-day appeal window at each release.</p>

      <div className="uj-commit-breakdown">
        <div className="uj-cb-row"><span>Unlock fee (already paid)</span><span className="uj-cb-paid">$2,800 ✓</span></div>
        <div className="uj-cb-row"><span id="ujCommitPathLabel">Full Partnership · remaining</span><span id="ujCommitRemaining">$25,200</span></div>
        <div className="uj-cb-divider"></div>
        <div className="uj-cb-row uj-cb-total"><span>Due now to commit</span><span id="ujCommitDue">$25,200</span></div>
        <div className="uj-cb-row uj-cb-note"><span>Total engagement value</span><span id="ujCommitTotal">$28,000</span></div>
      </div>

      <div className="uj-commit-actions">
        <button className="uj-btn-ghost" id="ujBackToPath">← Change path</button>
        <button className="uj-btn-primary" id="ujCommitBtn">Pay &amp; commit · <span id="ujCommitBtnAmt">$25,200</span></button>
      </div>
    </div>

    {/* STATE 4: Engagement active */}
    <div className="uj-panel" id="ujPanel-engage" style={{'display': 'none'}}>
      <div className="uj-confirm">
        <div className="uj-confirm-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="16 9 11 14.5 8 11.5"/></svg></div>
        <div>
          <h2 className="uj-h2">Engagement active</h2>
          <p className="uj-sub">Your full payment is held in escrow. Funds release to the architect as each milestone is approved by you. The architect has been notified and will schedule your kickoff.</p>
        </div>
      </div>

      <div className="uj-milestones" id="ujMilestones">
        <div className="uj-ms" data-ms="1">
          <div className="uj-ms-left"><span className="uj-ms-dot"></span><div><span className="uj-ms-title">Kickoff &amp; system handover</span><span className="uj-ms-desc">Architect delivers documentation and runs onboarding</span></div></div>
          <div className="uj-ms-right"><span className="uj-ms-amt">$8,400</span><button className="uj-ms-approve" data-ms-approve="1">Approve release</button></div>
        </div>
        <div className="uj-ms" data-ms="2">
          <div className="uj-ms-left"><span className="uj-ms-dot"></span><div><span className="uj-ms-title">Mid-point deployment review</span><span className="uj-ms-desc">First systems live, workflows operational</span></div></div>
          <div className="uj-ms-right"><span className="uj-ms-amt">$8,400</span><button className="uj-ms-approve" data-ms-approve="2" disabled>Locked</button></div>
        </div>
        <div className="uj-ms" data-ms="3">
          <div className="uj-ms-left"><span className="uj-ms-dot"></span><div><span className="uj-ms-title">Final delivery &amp; sign-off</span><span className="uj-ms-desc">Full system operational and handed over</span></div></div>
          <div className="uj-ms-right"><span className="uj-ms-amt">$8,400</span><button className="uj-ms-approve" data-ms-approve="3" disabled>Locked</button></div>
        </div>
      </div>

      <div className="uj-engage-foot">
        <span className="uj-engage-note" id="ujEngageNote">$0 of $25,200 released · $25,200 protected in escrow</span>
        <Link href="/dashboard" className="uj-btn-ghost">View in dashboard</Link>
      </div>
    </div>

  </div>

  {/* ============ UNLOCK FLOW MODALS ============ */}
  <div className="lst-modal-root" id="lstModalRoot" aria-hidden="true">
    <div className="lst-modal-backdrop" data-modal-close></div>

    {/* STEP 1: NDA / CONFIDENTIAL ACCESS */}
    <div className="lst-modal" id="lstModalNda" role="dialog" aria-modal="true" aria-labelledby="ndaTitle">
      <button className="lst-modal-x" data-modal-close aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <span className="lst-modal-eyebrow">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Confidential access
      </span>
      <h2 className="lst-modal-title" id="ndaTitle">Request full access</h2>
      <p className="lst-modal-desc">This opportunity is reviewed under NDA. Continuing acknowledges vvEntra's standard mutual confidentiality terms and confirms your standing as a verified buyer.</p>

      <div className="nda-terms">
        <div className="nda-row">
          <span className="nda-key">Reviewing party</span>
          <span className="nda-val">You <span className="nda-verified">verified</span></span>
        </div>
        <div className="nda-row">
          <span className="nda-key">Counterparty</span>
          <span className="nda-val">vvEntra (custodian) / Architect (anonymized)</span>
        </div>
        <div className="nda-row">
          <span className="nda-key">Term</span>
          <span className="nda-val">24 months mutual</span>
        </div>
        <div className="nda-row">
          <span className="nda-key">Scope</span>
          <span className="nda-val">Materials accessed via this listing</span>
        </div>
      </div>

      <label className="nda-consent">
        <input type="checkbox" id="ndaConsent" />
        <span className="nda-checkmark">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <span className="nda-consent-text">I agree to vvEntra's mutual NDA and confirm I will not share materials outside my acquisition team.</span>
      </label>

      <div className="lst-modal-footer">
        <span className="lst-modal-assurance">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Audit-logged · counter-signed
        </span>
        <div className="lst-modal-btns">
          <button className="lst-btn-ghost" data-modal-close>Cancel</button>
          <button className="lst-btn-primary" id="ndaContinueBtn" disabled>Sign &amp; continue</button>
        </div>
      </div>
    </div>

    {/* STEP 2: PAYMENT CONFIRMATION */}
    <div className="lst-modal" id="lstModalPay" role="dialog" aria-modal="true" aria-labelledby="payTitle">
      <button className="lst-modal-x" data-modal-close aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <span className="lst-modal-eyebrow">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Unlock opportunity
      </span>
      <h2 className="lst-modal-title" id="payTitle">Confirm unlock</h2>
      <p className="lst-modal-desc">Unlocking gives you immediate access to all 12 sections, the full document package, and a live meeting with the architect. Your payment is held in escrow until you confirm value received.</p>

      <div className="pay-breakdown">
        <div className="pay-row">
          <span className="pay-key">Unlock fee</span>
          <span className="pay-val">$2,800</span>
        </div>
        <div className="pay-row pay-muted">
          <span className="pay-key">Held in escrow</span>
          <span className="pay-val">Until your approval</span>
        </div>
        <div className="pay-divider"></div>
        <div className="pay-row pay-total">
          <span className="pay-key">Due now</span>
          <span className="pay-val">$2,800</span>
        </div>
      </div>

      <div className="pay-assurance-block">
        <div className="pay-assurance-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          Architect is notified and confirms your access
        </div>
        <div className="pay-assurance-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          Funds released only after you confirm value
        </div>
        <div className="pay-assurance-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          7-day appeal window if materials misrepresent
        </div>
      </div>

      <div className="lst-modal-footer">
        <span className="lst-modal-assurance">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Escrow-protected
        </span>
        <div className="lst-modal-btns">
          <button className="lst-btn-ghost" id="payBackBtn">Back</button>
          <button className="lst-btn-primary" id="payConfirmBtn">Confirm · $2,800</button>
        </div>
      </div>
    </div>

    {/* STEP 3: UNLOCKED SUCCESS */}
    <div className="lst-modal lst-modal-success" id="lstModalDone" role="dialog" aria-modal="true" aria-labelledby="doneTitle">
      <button className="lst-modal-x" data-modal-close aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <div className="done-check">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="16 9 11 14.5 8 11.5"/></svg>
      </div>
      <h2 className="lst-modal-title" id="doneTitle">Opportunity unlocked</h2>
      <p className="lst-modal-desc">You now have full access to all 12 sections and the document package. The architect has been notified and will reach out to schedule your meeting. Everything is available in your dashboard.</p>

      <div className="done-next">
        <span className="done-next-label">What happens next</span>
        <div className="done-step"><span className="done-step-n">1</span> The architect confirms and schedules a live call within 48 hours</div>
        <div className="done-step"><span className="done-step-n">2</span> You review the full thesis and document package</div>
        <div className="done-step"><span className="done-step-n">3</span> You choose your engagement path after the meeting</div>
      </div>

      <div className="done-actions">
        <Link href="/dashboard" className="lst-btn-primary">View in dashboard</Link>
        <button className="lst-btn-ghost" data-modal-close>Continue browsing</button>
      </div>
    </div>

  </div>

</main>

      <Footer />
    </>
  );
}
