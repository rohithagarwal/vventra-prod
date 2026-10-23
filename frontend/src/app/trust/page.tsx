"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TrustPage() {
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

      <main data-page="trust" className="page trust-page">
{/* HERO */}
<header className="hero">
  <div className="container">
    <div className="hero-content">
      <span className="eyebrow reveal">Trust architecture · Payment security</span>
      <h1 className="display xl reveal delay-1">Trust is <em>engineered.</em><br />Not promised.</h1>
      <p className="lead reveal delay-2">Every dollar that flows through vvEntra is protected by five layers of structured trust. Identity verification. Escrow custody. Staged reveal. Clear dispute resolution. And for premium deals, a platform-backed guarantee. This page explains exactly how your money and your intellectual property are protected.</p>
      <div className="hero-pills reveal delay-3">
        <span className="pill"><span className="ic">●</span> Escrow held</span>
        <span className="pill"><span className="ic">●</span> NDA gated</span>
        <span className="pill"><span className="ic">●</span> ID verified</span>
        <span className="pill"><span className="ic">●</span> 5-day disputes</span>
      </div>
    </div>
  </div>
</header>

{/* THE PARADOX */}
<section className="paradox-section">
  <div className="container">
    <div className="section-head center reveal">
      <div className="section-marker"><span className="num">01</span><span className="line"></span><span className="name">The trust paradox</span><span className="line"></span></div>
      <h2 className="display lg">The problem every <em>idea marketplace</em> has failed to solve.</h2>
      <p className="lead" style={{ textAlign: 'center' }}>Buying a business opportunity is fundamentally different from buying a physical product. Once intellectual property is revealed, it cannot be returned. This creates an unsolvable trust problem, until you engineer around it.</p>
    </div>

    <div className="paradox-grid reveal delay-1">
      <div className="paradox-card">
        <span className="role">— Architect's fear</span>
        <p className="quote">If I show the buyer my opportunity, they will steal it without paying. I cannot show the substance until I am paid.</p>
        <span className="label">The seller cannot reveal first.</span>
      </div>
      <div className="paradox-vs">vs</div>
      <div className="paradox-card">
        <span className="role">— Buyer's fear</span>
        <p className="quote">If I pay before seeing the opportunity, the architect could deliver junk or something I already know. I cannot pay until I see the substance.</p>
        <span className="label">The buyer cannot pay first.</span>
      </div>
    </div>

    <div className="paradox-resolution reveal delay-2">
      <div className="label">vvEntra's resolution</div>
      <p>Neither party reveals or pays first. Both commit progressively through a <em>staged reveal</em> protected by <em>escrow custody</em>, where each tier of trust unlocks the next layer of value.</p>
    </div>
  </div>
</section>

{/* FIVE LAYERS */}
<section className="layers-section">
  <div className="container">
    <div className="section-head reveal">
      <div className="section-marker"><span className="num">02</span><span className="line"></span><span className="name">The five layers</span></div>
      <h2 className="display lg">Trust is not one thing. It is <em>five layers</em> engineered together.</h2>
      <p className="lead">Each layer protects against a specific failure mode. Together they create an architecture where bad actors are filtered at every step, and good actors transact with confidence.</p>
    </div>

    <div className="layers-grid">
      <div className="layer-card reveal">
        <div className="layer-num">01</div>
        <div className="layer-content">
          <span className="subtitle">— Before any money moves</span>
          <h3>Identity & <em>reputation</em> verification</h3>
          <p>Every architect and every buyer is a verified human with public stake. No anonymous accounts. No multiple identities. Every action is attached to a real, accountable person. Verification is itself a trust signal, visible on every profile.</p>
        </div>
        <div className="layer-mechanism">
          <div className="label">How we verify</div>
          <ul>
            <li>Government ID (Aadhaar / passport)</li>
            <li>Bank account ownership (penny drop)</li>
            <li>Phone & email confirmed</li>
            <li>Buyer capacity verification</li>
            <li>One-person-one-account policy</li>
          </ul>
        </div>
      </div>

      <div className="layer-card reveal">
        <div className="layer-num">02</div>
        <div className="layer-content">
          <span className="subtitle">— The foundation</span>
          <h3>Escrow <em>custody</em> on every transaction</h3>
          <p>Money never moves directly from buyer to seller. Every dollar is held in a regulated escrow account before it ever reaches the architect. This neutralises the trust paradox: the architect knows the money is committed, the buyer knows their funds are protected.</p>
        </div>
        <div className="layer-mechanism">
          <div className="label">How escrow works</div>
          <ul>
            <li>Buyer funds held by vvEntra</li>
            <li>Architect notified of commitment</li>
            <li>Content unlocks against escrow</li>
            <li>7-day inspection window opens</li>
            <li>Funds release on satisfaction</li>
          </ul>
        </div>
      </div>

      <div className="layer-card reveal">
        <div className="layer-num">03</div>
        <div className="layer-content">
          <span className="subtitle">— The real innovation</span>
          <h3>Staged <em>reveal</em> · four progressive tiers</h3>
          <p>Buyers do not pay full price for full access at once. They progress through four tiers, each unlocking more substance for proportionally more commitment. This mirrors how real M&A diligence works: NDA, CIM review, data room, closing.</p>
        </div>
        <div className="layer-mechanism">
          <div className="label">The four tiers</div>
          <ul>
            <li>Tier 0 · Public preview (free)</li>
            <li>Tier 1 · Verified access (free)</li>
            <li>Tier 2 · Interest deposit ($100–500)</li>
            <li>Tier 3 · NDA + partial unlock (30%)</li>
            <li>Tier 4 · Full unlock (remaining 70%)</li>
          </ul>
        </div>
      </div>

      <div className="layer-card reveal">
        <div className="layer-num">04</div>
        <div className="layer-content">
          <span className="subtitle">— When something goes wrong</span>
          <h3>Dispute <em>resolution</em> · clear, fast, fair</h3>
          <p>Disputes are resolved within five business days by vvEntra moderation, using documented criteria. Refunds are not subjective. They are granted for specific, verifiable failures: misrepresented depth, plagiarised content, false credentials. Not for buyer's remorse.</p>
        </div>
        <div className="layer-mechanism">
          <div className="label">Our commitment</div>
          <ul>
            <li>Documented refund criteria</li>
            <li>5-business-day resolution SLA</li>
            <li>Public reputation feedback</li>
            <li>Frivolous claims penalised</li>
            <li>Bad actors lose access</li>
          </ul>
        </div>
      </div>

      <div className="layer-card reveal">
        <div className="layer-num">05</div>
        <div className="layer-content">
          <span className="subtitle">— For high-value deals</span>
          <h3>Platform <em>guarantee</em> · the premium layer</h3>
          <p>For transactions above $10,000, the vvEntra Guarantee tier puts the platform itself behind the payment. Architects receive guaranteed settlement even during disputes. Buyers receive a verified premium badge. Risk transfers from the parties to the platform.</p>
        </div>
        <div className="layer-mechanism">
          <div className="label">What's included</div>
          <ul>
            <li>Guaranteed architect settlement</li>
            <li>Premium buyer verification</li>
            <li>Priority dispute review</li>
            <li>Up to $50k coverage cap</li>
            <li>Available on high-tier deals</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ESCROW FLOW DIAGRAM */}
<section className="escrow-section">
  <div className="container">
    <div className="section-head reveal">
      <div className="section-marker"><span className="num">03</span><span className="line"></span><span className="name">Escrow flow · visualised</span></div>
      <h2 className="display lg">Follow the <em>money.</em><br />From buyer commitment to architect settlement.</h2>
      <p className="lead">Every transaction flows through this exact sequence. The money is never under the control of either party. It is held by vvEntra's escrow infrastructure and released only when the agreed conditions are met.</p>
    </div>

    <div className="flow-card reveal delay-1">
      <div className="flow-header">
        <h4>Sample transaction · VVE-2438 · $4,800</h4>
        <span className="meta">Standard escrow flow</span>
      </div>

      <div className="flow-diagram">
        <div className="flow-actor">
          <div className="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
          </div>
          <span className="role">— Buyer</span>
          <span className="name">PE Director</span>
          <span className="status">VERIFIED · KYC COMPLETE</span>
        </div>

        <div className="flow-actor escrow">
          <div className="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="14" r="1.5"/></svg>
          </div>
          <span className="role">— vvEntra Escrow</span>
          <span className="name"><em>Neutral custody</em></span>
          <span className="status">FIDUCIARY · REGULATED</span>
        </div>

        <div className="flow-actor">
          <div className="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3h18M5 3v10a7 7 0 0 0 14 0V3"/><circle cx="12" cy="20" r="1.5"/></svg>
          </div>
          <span className="role">— Architect</span>
          <span className="name">Senior · 2 Exits</span>
          <span className="status">VERIFIED · BANK CONFIRMED</span>
        </div>
      </div>

      <div className="flow-steps">
        <div className="flow-step">
          <span className="stepn">01</span>
          <span className="step-desc"><strong>Buyer initiates unlock</strong> on VVE-2438. Payment of $4,800 debited via card / bank transfer.</span>
          <span className="step-state action">INITIATED</span>
        </div>
        <div className="flow-step">
          <span className="stepn">02</span>
          <span className="step-desc">Funds held in vvEntra escrow. <strong>Architect receives notification</strong> of committed payment. Content unlock begins.</span>
          <span className="step-state held">$4,800 HELD</span>
        </div>
        <div className="flow-step">
          <span className="stepn">03</span>
          <span className="step-desc">Buyer reviews opportunity. <strong>7-day inspection window</strong> opens. Buyer can raise dispute with documented evidence if material misrepresentation found.</span>
          <span className="step-state held">INSPECTION OPEN</span>
        </div>
        <div className="flow-step">
          <span className="stepn">04a</span>
          <span className="step-desc"><strong>Path A · Buyer satisfied.</strong> Funds release to architect minus platform commission (typically 12-18%). Architect receives $4,032 net within 24 hours.</span>
          <span className="step-state released">RELEASED</span>
        </div>
        <div className="flow-step">
          <span className="stepn">04b</span>
          <span className="step-desc"><strong>Path B · Buyer disputes.</strong> Funds frozen. Both parties submit evidence. vvEntra moderation team reviews and resolves within 5 business days.</span>
          <span className="step-state frozen">FROZEN · UNDER REVIEW</span>
        </div>
      </div>
    </div>
  </div>
</section>

{/* STAGED REVEAL */}
<section className="reveal-section">
  <div className="container">
    <div className="section-head reveal">
      <div className="section-marker"><span className="num">04</span><span className="line"></span><span className="name">Staged reveal mechanism</span></div>
      <h2 className="display lg">Four tiers. Each one unlocks <em>more substance</em> for <em>more commitment.</em></h2>
      <p className="lead">This is how real M&A deals work. NDA before the data room. Deposit before due diligence. Full payment before closing. vvEntra digitises this proven flow for business opportunities of every scale.</p>
    </div>

    <div className="reveal-tiers">
      <div className="tier-card reveal">
        <span className="tier-num">00</span>
        <div>
          <h4 className="tier-name">Public <em>preview</em></h4>
          <div className="tier-cost">Cost · <strong>Free · anyone can see</strong></div>
        </div>
        <p className="tier-unlocks"><strong>What's visible:</strong> Sector, market, scale, geography. Architect's verified credentials and exit history. Documentation depth metrics (pages, frameworks, models). Demand signals. <em>Core IP remains locked.</em></p>
        <div className="tier-percent">0%<span className="small">Paid</span></div>
      </div>

      <div className="tier-card reveal delay-1">
        <span className="tier-num">01</span>
        <div>
          <h4 className="tier-name">Verified <em>access</em></h4>
          <div className="tier-cost">Cost · <strong>Free · after KYC</strong></div>
        </div>
        <p className="tier-unlocks"><strong>What's visible:</strong> Full opportunity title and one-paragraph thesis. Sub-category and geographic scope. Estimated execution timeline and capital required. Ability to send structured questions to the architect.</p>
        <div className="tier-percent">0%<span className="small">Paid</span></div>
      </div>

      <div className="tier-card reveal delay-2">
        <span className="tier-num">02</span>
        <div>
          <h4 className="tier-name">Interest <em>deposit</em></h4>
          <div className="tier-cost">Cost · <strong>$100–500 · refundable</strong></div>
        </div>
        <p className="tier-unlocks"><strong>What changes:</strong> Buyer signals real interest with a refundable deposit. Architect reviews the buyer's profile and decides whether to grant deeper access. If architect declines, deposit returns automatically. If granted, deposit credits toward full unlock.</p>
        <div className="tier-percent">~10%<span className="small">Of total</span></div>
      </div>

      <div className="tier-card reveal delay-3">
        <span className="tier-num">03</span>
        <div>
          <h4 className="tier-name">NDA + <em>partial unlock</em></h4>
          <div className="tier-cost">Cost · <strong>30% of total · NDA signed</strong></div>
        </div>
        <p className="tier-unlocks"><strong>What unlocks:</strong> Full business model document. Market research summary. Execution roadmap. Direct architect conversation enabled. <em>Financial models and proprietary IP remain locked.</em> 5-day window before next tier.</p>
        <div className="tier-percent">30%<span className="small">Paid</span></div>
      </div>

      <div className="tier-card reveal delay-4">
        <span className="tier-num">04</span>
        <div>
          <h4 className="tier-name">Full <em>unlock</em></h4>
          <div className="tier-cost">Cost · <strong>Remaining 70% · final</strong></div>
        </div>
        <p className="tier-unlocks"><strong>What unlocks:</strong> Complete documentation, financial models, frameworks, SOPs, sensitive IP. Architect's full contact. The ongoing relationship begins: acquire, partner, collaborate, or build with execution support. 7-day inspection window.</p>
        <div className="tier-percent">100%<span className="small">Settled</span></div>
      </div>
    </div>
  </div>
</section>

{/* REFUND POLICY */}
<section className="refund-section">
  <div className="container">
    <div className="section-head reveal">
      <div className="section-marker"><span className="num">05</span><span className="line"></span><span className="name">Refund policy</span></div>
      <h2 className="display lg">Refunds are <em>structured.</em><br />Not subjective.</h2>
      <p className="lead">Most platforms either refund too easily, which lets buyers consume content and claim dissatisfaction, or refund too rarely, which destroys buyer trust. vvEntra uses documented eligibility criteria, applied consistently by moderation.</p>
    </div>

    <div className="refund-grid">
      <div className="refund-card granted reveal">
        <span className="role">— Refunds are granted when</span>
        <h4>The architect <em>materially misrepresents</em> the opportunity</h4>
        <ul>
          <li>Documentation depth is materially less than advertised (e.g., promised 120 pages, delivered 40)</li>
          <li>Content is plagiarised, AI-generated boilerplate, or duplicates a known existing opportunity</li>
          <li>Architect made factually false claims about credentials, track record, or exit history</li>
          <li>Critical promised sections are missing (e.g., financial model advertised but not included)</li>
          <li>The opportunity is fundamentally different from what was previewed in Tier 0–2</li>
        </ul>
      </div>

      <div className="refund-card denied reveal delay-1">
        <span className="role">— Refunds are NOT granted when</span>
        <h4>The buyer's <em>circumstances or opinions</em> change after access</h4>
        <ul>
          <li>Buyer simply disagrees with the strategy or market thesis</li>
          <li>Buyer's market view differs from the architect's</li>
          <li>Buyer changes their mind after consuming the content</li>
          <li>Buyer claims they "already knew" the idea (subjective, unverifiable)</li>
          <li>Buyer's investment priorities shift after due diligence</li>
        </ul>
      </div>
    </div>
  </div>
</section>

{/* DISPUTE TIMELINE */}
<section className="dispute-section">
  <div className="container">
    <div className="section-head center reveal">
      <div className="section-marker"><span className="num">06</span><span className="line"></span><span className="name">Dispute resolution</span><span className="line"></span></div>
      <h2 className="display lg">When things go wrong, they are resolved in <em>five days.</em></h2>
      <p className="lead" style={{ textAlign: 'center' }}>A documented SLA. Equal voice for both sides. Clear evidence requirements. No black-box decisions. Resolution within five business days, every time.</p>
    </div>

    <div className="timeline reveal delay-1">
      <div className="timeline-node">
        <div className="dot">01</div>
        <h5>Dispute raised</h5>
        <span className="time">Day 0</span>
        <p>Buyer submits dispute within inspection window with specific evidence of misrepresentation.</p>
      </div>
      <div className="timeline-node">
        <div className="dot">02</div>
        <h5>Architect responds</h5>
        <span className="time">Day 1–2</span>
        <p>Architect has 48 hours to submit counter-evidence and contextual response.</p>
      </div>
      <div className="timeline-node">
        <div className="dot">03</div>
        <h5>Moderation review</h5>
        <span className="time">Day 3–4</span>
        <p>vvEntra team reviews both submissions against documented refund criteria.</p>
      </div>
      <div className="timeline-node">
        <div className="dot">04</div>
        <h5>Decision rendered</h5>
        <span className="time">Day 5</span>
        <p>Outcome communicated to both parties with reasoning. No black-box decisions.</p>
      </div>
      <div className="timeline-node">
        <div className="dot">✓</div>
        <h5>Resolution executed</h5>
        <span className="time">Within 24h</span>
        <p>Refund processed, payment released, or partial settlement applied based on findings.</p>
      </div>
    </div>
  </div>
</section>

{/* GUARANTEE TIER */}
<section className="guarantee-section">
  <div className="container">
    <div className="section-head reveal">
      <div className="section-marker"><span className="num">07</span><span className="line"></span><span className="name">Premium tier</span></div>
      <h2 className="display lg">For high-value deals, the platform itself <em>guarantees</em> the payment.</h2>
      <p className="lead">On transactions above $10,000, vvEntra steps in as the guarantor. Architects receive settlement even during disputes. Buyers receive a premium verification status. Risk transfers from the parties to the platform.</p>
    </div>

    <div className="guarantee-grid">
      <div className="guarantee-card reveal">
        <span className="badge">⬩ For architects</span>
        <h3>Guaranteed <em>settlement.</em><br />Even during disputes.</h3>
        <p>When you list a premium opportunity, vvEntra commits to settling your payment within 48 hours of full unlock, regardless of dispute status. The platform absorbs the risk while disputes are reviewed.</p>
        <ul>
          <li>Payment within 48 hours of unlock</li>
          <li>Platform absorbs dispute risk up to cap</li>
          <li>Priority dispute review by senior moderators</li>
          <li>Premium architect badge on profile</li>
          <li>Coverage cap up to $50,000 per transaction</li>
        </ul>
      </div>

      <div className="guarantee-card reveal delay-1">
        <span className="badge">⬩ For buyers</span>
        <h3>Premium <em>verification.</em><br />Priority access.</h3>
        <p>Premium-verified buyers gain access to the highest-tier opportunities and earn faster trust from architects. Your verification badge signals serious intent and reduces friction at every tier of access.</p>
        <ul>
          <li>Premium buyer badge on profile</li>
          <li>Access to senior architect tier opportunities</li>
          <li>Architect approval typically within 4 hours</li>
          <li>Higher unlock limits per quarter</li>
          <li>Priority placement in deal flow recommendations</li>
        </ul>
      </div>
    </div>
  </div>
</section>

{/* PARTNERS */}
<section className="partners-section">
  <div className="container">
    <div className="section-head reveal">
      <div className="section-marker"><span className="num">08</span><span className="line"></span><span className="name">Infrastructure partners</span></div>
      <h2 className="display lg">Built on the same rails as <em>Stripe</em>, <em>Razorpay</em>, and major exchanges.</h2>
      <p className="lead">vvEntra does not reinvent payment infrastructure. We use the same regulated payment processors, escrow providers, and KYC systems that power global commerce. Your money flows through battle-tested rails.</p>
    </div>

    <div className="partners-grid reveal delay-1">
      <div className="partner-card">
        <span className="nm"><em>Stripe</em> Connect</span>
        <span className="role">— Global payments + escrow</span>
      </div>
      <div className="partner-card">
        <span className="nm"><em>Razorpay</em> Route</span>
        <span className="role">— India transactions</span>
      </div>
      <div className="partner-card">
        <span className="nm"><em>Persona</em> KYC</span>
        <span className="role">— Identity verification</span>
      </div>
      <div className="partner-card">
        <span className="nm"><em>Tazapay</em></span>
        <span className="role">— Cross-border escrow</span>
      </div>
    </div>
  </div>
</section>

{/* FAQ */}
<section className="faq-section">
  <div className="container-narrow">
    <div className="section-head center reveal">
      <div className="section-marker"><span className="num">09</span><span className="line"></span><span className="name">Frequently asked</span><span className="line"></span></div>
      <h2 className="display lg">The questions <em>everyone asks</em> before their first transaction.</h2>
    </div>

    <div className="faq-list">
      <div className="faq-item reveal">
        <div className="faq-q" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>
          What happens if the architect disappears after I pay?
          <span className="ic">+</span>
        </div>
        <div className="faq-a">If the architect becomes unresponsive after escrow is funded, vvEntra automatically returns the funds to the buyer within 7 days of inactivity. The architect's listing is suspended and their account is flagged. Because every architect is KYC-verified with a verified bank account, fraudulent disappearance is rare and consequences are real.</div>
      </div>

      <div className="faq-item reveal">
        <div className="faq-q" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>
          What stops a buyer from accessing the content and then claiming a refund?
          <span className="ic">+</span>
        </div>
        <div className="faq-a">Three safeguards. First, refunds are granted only against documented criteria, not buyer's remorse. Second, frivolous disputes trigger account warnings and eventually access loss. Third, every buyer has a public reputation score visible to architects, so a pattern of disputes is visible before architects grant access. Bad actors get filtered out within a few transactions.</div>
      </div>

      <div className="faq-item reveal">
        <div className="faq-q" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>
          What is vvEntra's platform commission?
          <span className="ic">+</span>
        </div>
        <div className="faq-a">Standard tier: 12% platform commission on the gross transaction value. Premium Guarantee tier: 18%, which includes the platform-backed guarantee, premium verification, and priority dispute resolution. There are no hidden fees. The architect sees the full commission deducted at settlement; the buyer pays the listed price.</div>
      </div>

      <div className="faq-item reveal">
        <div className="faq-q" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>
          How long does the architect wait to receive funds after a buyer unlocks?
          <span className="ic">+</span>
        </div>
        <div className="faq-a">Standard tier: Funds release at the end of the 7-day buyer inspection window, plus 24–48 hours for bank settlement. Total typically 8–9 days from buyer unlock to architect's bank account. Premium Guarantee tier: Architects receive settlement within 48 hours of unlock, regardless of dispute status.</div>
      </div>

      <div className="faq-item reveal">
        <div className="faq-q" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>
          Can I make partial payments instead of unlocking everything at once?
          <span className="ic">+</span>
        </div>
        <div className="faq-a">Yes. The staged reveal mechanism is designed exactly for this. You commit a small refundable deposit at Tier 2, pay 30% at Tier 3 to access partial content, and pay the remaining 70% at Tier 4 for full unlock. You can stop at any tier with progressively smaller exposure. This is the same way M&A deals are structured in the real world.</div>
      </div>

      <div className="faq-item reveal">
        <div className="faq-q" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>
          Is my data and identity confidential?
          <span className="ic">+</span>
        </div>
        <div className="faq-a">Yes. KYC data is held by our regulated identity verification partners (Persona / DigiLocker), encrypted at rest and in transit. vvEntra sees only verification status, not raw documents. Your conversations with architects or buyers are private and not shared publicly. The only public information on your profile is what you explicitly choose to show: name, role, verified badges, reputation score, transaction count.</div>
      </div>

      <div className="faq-item reveal">
        <div className="faq-q" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>
          What jurisdictions does vvEntra operate in?
          <span className="ic">+</span>
        </div>
        <div className="faq-a">vvEntra operates globally for cross-border transactions through our regulated escrow partners. India transactions are processed through Razorpay Route under Indian financial regulations. US, UK, EU, and SEA transactions are processed through Stripe Connect and Tazapay. Currency conversion is handled automatically at interbank rates.</div>
      </div>
    </div>
  </div>
</section>

{/* CTA */}
<section id="cta" className="final">
  <div className="container">
    <div className="brand-stamp reveal">
      <svg className="logo-mark lg" viewBox="0 0 64 64" aria-hidden="true">
        <path className="w-fill" d="M14 16 L22 48 L32 28 L42 48 L50 16 L42 16 L37 36 L32 22 L27 36 L22 16 Z"/>
      </svg>
    </div>
    <div className="reveal delay-1"><span className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Trust is the platform</span></div>
    <h2 className="display xl reveal delay-2">Now you know <em>exactly</em> how it works.</h2>
    <p className="lead reveal delay-3">Every dollar protected. Every IP gated. Every dispute resolved within five days. Trust is not a tagline at vvEntra. It is the architecture.</p>
    <div className="final-ctas reveal delay-3">
      <Link className="btn btn-orange" href="/signup">Apply for access <span className="arrow">→</span></Link>
      <Link href="/" data-route="home" className="btn btn-outline">Back to homepage <span className="arrow">→</span></Link>
    </div>
  </div>
</section>

      </main>

      <Footer />
    </>
  );
}
