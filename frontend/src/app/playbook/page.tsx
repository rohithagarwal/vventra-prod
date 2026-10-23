"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PlaybookPage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [activeChapter, setActiveChapter] = useState<string>("ch-01");

  useEffect(() => {
    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || "investor";
    setRole(savedRole);
    document.documentElement.setAttribute("data-role", savedRole);

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

    const handleScroll = () => {
      const chapters = document.querySelectorAll(".chapter");
      let current: string | null = null;
      chapters.forEach((ch) => {
        const r = ch.getBoundingClientRect();
        if (r.top <= 220) {
          current = ch.id;
        }
      });
      if (current) {
        setActiveChapter(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      revealIO.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [role]);

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
    localStorage.setItem("vve-role", newRole);
    document.documentElement.setAttribute("data-role", newRole);
    setActiveChapter("ch-01");
  };

  const scrollToChapter = (chapterId: string) => {
    setActiveChapter(chapterId);
    const target = document.getElementById(chapterId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="playbook" className={`page playbook-page role-${role}`}>
        {/* HERO */}
        <header className="hero">
          <div className="container-narrow">
            <div className="hero-content">
              <span className="eyebrow reveal">The Playbook · Strategic guidelines</span>
              <h1 className="display xl reveal delay-1">How serious users get <em>serious results.</em></h1>
              <p className="lead reveal delay-2">
                vvEntra is built for operators, not amateurs. This playbook is what we've learned from watching the top 10% of users succeed and the bottom 30% fail. <em>Read it before you act.</em>
              </p>

              <div className="role-toggle reveal delay-3" id="role-toggle">
                <div className="role-indicator"></div>
                <button
                  type="button"
                  className={`role-btn ${role === "investor" ? "active" : ""}`}
                  data-role="investor"
                  onClick={() => handleRoleToggle("investor")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 21v-1a8 8 0 0 1 16 0v1"/>
                  </svg>
                  <span className="icon-text">As Buyer<span className="sub-label">Investor playbook</span></span>
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === "architect" ? "active" : ""}`}
                  data-role="architect"
                  onClick={() => handleRoleToggle("architect")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path d="M3 3h18M5 3v10a7 7 0 0 0 14 0V3"/>
                    <circle cx="12" cy="20" r="1.5"/>
                  </svg>
                  <span className="icon-text">As Architect<span className="sub-label">Creator playbook</span></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* PROGRESS NAV */}
        <div className="progress-nav">
          <div className="progress-nav-inner">
            <button
              type="button"
              className={`prog-step ${activeChapter === "ch-01" ? "active" : ""}`}
              onClick={() => scrollToChapter("ch-01")}
            >
              <span className="step-num">01</span><span>Mindset</span>
            </button>
            <button
              type="button"
              className={`prog-step ${activeChapter === "ch-02" ? "active" : ""}`}
              onClick={() => scrollToChapter("ch-02")}
            >
              <span className="step-num">02</span><span>Preparation</span>
            </button>
            <button
              type="button"
              className={`prog-step ${activeChapter === "ch-03" ? "active" : ""}`}
              onClick={() => scrollToChapter("ch-03")}
            >
              <span className="step-num">03</span><span>Execution</span>
            </button>
            <button
              type="button"
              className={`prog-step ${activeChapter === "ch-04" ? "active" : ""}`}
              onClick={() => scrollToChapter("ch-04")}
            >
              <span className="step-num">04</span><span>Red flags</span>
            </button>
            <button
              type="button"
              className={`prog-step ${activeChapter === "ch-05" ? "active" : ""}`}
              onClick={() => scrollToChapter("ch-05")}
            >
              <span className="step-num">05</span><span>Success patterns</span>
            </button>
            <button
              type="button"
              className={`prog-step ${activeChapter === "ch-06" ? "active" : ""}`}
              onClick={() => scrollToChapter("ch-06")}
            >
              <span className="step-num">06</span><span>Common mistakes</span>
            </button>
          </div>
        </div>

        {/* BUYER PLAYBOOK */}
        <div className="role-show" data-show="investor" style={{ display: role === "investor" ? "block" : "none" }}>
          


  {/*  CH 01 · MINDSET  */}
  <section className="chapter" id="ch-01">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">01</span><span className="line"></span><span className="name">Mindset</span></div>
        <h2 className="display lg">Think like an <em>operator</em>, not a tourist.</h2>
        <p>The buyers who succeed on vvEntra approach opportunities the way they approach a private investment. They underwrite, they ask hard questions, and they trust the staged-reveal process. <em>The buyers who fail are the ones who treat this like a marketplace and expect everything visible upfront.</em></p>
      </div>

      <div className="principles-grid">
        <div className="principle reveal" data-num="1">
          <h3>Conviction over <em>curiosity</em></h3>
          <p>Don't unlock opportunities to "see what's in there." Unlock because you have a defined thesis and this opportunity fits it. <strong>Curiosity unlocks are how buyers waste capital and architects lose trust.</strong></p>
          <span className="key-tag">→ Define thesis first</span>
        </div>
        <div className="principle reveal delay-1" data-num="2">
          <h3>Trust the <em>structure</em></h3>
          <p>The staged reveal exists because every previous idea marketplace died from full-IP exposure. <strong>You will not see everything before paying.</strong> If that's a deal-breaker for you, this platform isn't for you.</p>
          <span className="key-tag">→ Pay in stages</span>
        </div>
        <div className="principle reveal" data-num="3">
          <h3>Architects are <em>partners</em>, not vendors</h3>
          <p>The best transactions involve ongoing relationships, not one-time downloads. <strong>Treat senior architects as potential operating partners</strong> who happen to have already done the structuring work for you.</p>
          <span className="key-tag">→ Build relationships</span>
        </div>
        <div className="principle reveal delay-1" data-num="4">
          <h3>Time is the <em>real cost</em></h3>
          <p>The $5,000 unlock isn't the price. The price is the 6-12 months you'd have spent researching this opportunity yourself. <strong>Compare against your own time cost, not against a freelance fee.</strong></p>
          <span className="key-tag">→ Price your time</span>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 02 · PREPARATION  */}
  <section className="chapter" id="ch-02">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">02</span><span className="line"></span><span className="name">Preparation</span></div>
        <h2 className="display lg">What to do <em>before</em> your first unlock.</h2>
        <p>The biggest delta between buyers who get great deals and buyers who get burned is what they do *before* paying anything. <em>This is the single highest-leverage hour you'll spend on the platform.</em></p>
      </div>

      <div className="checklist reveal">
        <div className="checklist-head">
          <h3>Buyer <em>pre-flight checklist</em></h3>
          <span className="count">7 steps</span>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Define your <em>thesis</em> in writing</strong>
            <span>One paragraph. Sector, geography, deal size, what kind of operator you want behind it, what stage of opportunity you're looking for. <em>If you can't write it, you don't have one.</em></span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Set your <em>capital allocation</em> for the platform</strong>
            <span>Decide upfront how much you're willing to deploy across unlocks this quarter. <strong>Most successful buyers allocate $20-40k per quarter</strong>, distributed across 4-8 opportunities. Random one-off unlocks tend to underperform.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Verify your account <em>and your buyer tier</em></strong>
            <span>Complete the KYC + capacity verification before browsing. Architects can see your verification status and will deprioritize unverified inquiries. Premium-tier verification unlocks priority architect responses.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Read 3-5 <em>full opportunity previews</em> before paying for any</strong>
            <span>Calibrate your eye for what depth looks like. <em>Notice which architects write tightly, which financial models actually make sense, and which preview sentences signal real insight vs marketing fluff.</em></span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Check the <em>architect's track record</em></strong>
            <span>Previous deals closed, average buyer rating, sector consistency, exit history. <strong>A senior architect with 5+ closed deals is worth a 20% premium over an unproven one</strong>, every time.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Send <em>structured questions at Tier 1</em></strong>
            <span>Free tier inquiries are how you stress-test the architect's depth without paying. Ask 2-3 sharp questions about the specific market, the execution constraints, or the financial assumptions. <em>How they answer matters more than what they answer.</em></span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Understand the <em>refund policy</em> before paying</strong>
            <span>Refunds are issued for material misrepresentation, not for changing your mind. If that policy feels uncomfortable, stop here. <strong>The buyers who succeed accept this trade-off as the price of architect trust.</strong></span>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 03 · EXECUTION  */}
  <section className="chapter" id="ch-03">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">03</span><span className="line"></span><span className="name">Execution</span></div>
        <h2 className="display lg">The five stages of a <em>successful unlock.</em></h2>
        <p>Each stage has a discipline. The buyers who skip stages don't save time, they just create downstream confusion. <em>Move through deliberately, not aggressively.</em></p>
      </div>

      <div className="stages reveal">
        <div className="stage">
          <span className="stage-num">Stage 1</span>
          <span className="stage-ttl">Identify</span>
          <span className="stage-desc">Browse with your thesis as a filter. Save 5-8 opportunities to your shortlist. Don't rush this.</span>
          <div className="stage-bar"></div>
        </div>
        <div className="stage">
          <span className="stage-num">Stage 2</span>
          <span className="stage-ttl">Probe</span>
          <span className="stage-desc">Send Tier 1 structured questions to 2-3 shortlisted architects. Their answer quality is your signal.</span>
          <div className="stage-bar"></div>
        </div>
        <div className="stage">
          <span className="stage-num">Stage 3</span>
          <span className="stage-ttl">Commit</span>
          <span className="stage-desc">Pay the Tier 2 interest deposit on your top pick. Wait for the architect to grant access.</span>
          <div className="stage-bar"></div>
        </div>
        <div className="stage">
          <span className="stage-num">Stage 4</span>
          <span className="stage-ttl">Verify</span>
          <span className="stage-desc">Sign the NDA. Review the partial unlock. Confirm the architect's claims match what you see.</span>
          <div className="stage-bar"></div>
        </div>
        <div className="stage">
          <span className="stage-num">Stage 5</span>
          <span className="stage-ttl">Unlock</span>
          <span className="stage-desc">Pay the full unlock. Use the 7-day inspection window to vet thoroughly. Open execution dialogue.</span>
          <div className="stage-bar"></div>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 04 · RED FLAGS  */}
  <section className="chapter" id="ch-04">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">04</span><span className="line"></span><span className="name">Red flags</span></div>
        <h2 className="display lg">When to <em>walk away</em>.</h2>
        <p>These signals are how experienced buyers detect that an opportunity will likely disappoint, even if everything looks fine on the surface. <em>Walking away is also a skill.</em></p>
      </div>

      <div className="red-flags reveal">
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Architect won't answer Tier 1 questions</h4></div>
          <p>If they dodge specific market questions or give marketing-style responses to operational questions, the depth probably isn't there. <em>Real operators love technical questions.</em></p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Generic frameworks, no proprietary insight</h4></div>
          <p>If the preview mentions only standard frameworks (Porter's Five Forces, SWOT, etc.) without sector-specific depth, the full document likely lacks original thinking. <strong>You're paying for what only this operator can know.</strong></p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Pricing way below sector average</h4></div>
          <p>If a Fintech listing is priced at $1,500 when the sector average is $7,200, either the architect doesn't know their value (concerning) or the depth is shallow (more likely). <em>Cheap rarely means good in this market.</em></p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>No verified credentials or exit history</h4></div>
          <p>First-time architects can deliver excellent work, but the variance is much higher. <strong>For your first 2-3 platform purchases, stick to architects with track record.</strong> Use new architects only after you've calibrated.</p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Architect avoids the 7-day inspection window</h4></div>
          <p>If they pressure you to "skip the inspection" or "release funds early because they need it for their next project," that's a hard stop. <em>Serious architects respect the process.</em></p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Vague answers about execution support</h4></div>
          <p>If you ask "would you advise during execution?" and the answer is unclear, you're buying static IP only. Sometimes that's fine. <strong>But the highest-value opportunities come with architect involvement.</strong> Confirm before paying.</p>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 05 · SUCCESS PATTERNS  */}
  <section className="chapter" id="ch-05">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">05</span><span className="line"></span><span className="name">Success patterns</span></div>
        <h2 className="display lg">What <em>top buyers</em> do differently.</h2>
        <p>We've studied the buyers who keep coming back, who close more deals, who turn into operating partners with their architects. <em>Here's what separates them.</em></p>
      </div>

      <div className="success-grid reveal">
        <div className="success-card">
          <span className="label">Deal velocity</span>
          <div className="metric"><em>4-8</em><small>unlocks per year</small></div>
          <h4>They <em>concentrate</em> on a thesis</h4>
          <p>Top buyers unlock 4-8 opportunities in their core sector annually. They build domain depth on the platform itself, recognizing patterns most one-off buyers miss.</p>
        </div>
        <div className="success-card">
          <span className="label">Time to action</span>
          <div className="metric"><em>30d</em><small>median to first action</small></div>
          <h4>They <em>act fast</em> after unlock</h4>
          <p>Top buyers begin execution within 30 days of unlock. The opportunities decay in value the longer they sit on a hard drive. <strong>Speed of action correlates with deal success.</strong></p>
        </div>
        <div className="success-card">
          <span className="label">Architect retention</span>
          <div className="metric"><em>62%</em><small>buy again from same</small></div>
          <h4>They <em>build with</em> architects</h4>
          <p>62% of top buyers eventually unlock 2+ opportunities from the same senior architect. The first deal is the audition. The second deal is the relationship.</p>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 06 · COMMON MISTAKES  */}
  <section className="chapter" id="ch-06">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">06</span><span className="line"></span><span className="name">Common mistakes</span></div>
        <h2 className="display lg">What <em>not to do</em>.</h2>
        <p>These are the patterns that show up in nearly every disappointed buyer's history. <em>Avoid these and you'll outperform 80% of the buyer pool by default.</em></p>
      </div>

      <div className="mistakes reveal">
        <div className="mistake">
          <span className="num">01</span>
          <div className="content">
            <h4>Buying <em>before</em> defining a thesis</h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>"This AI workflow opportunity looks interesting, let me unlock it and see if I can do something with it."</span></div>
            <div className="right"><span className="lbl">Right</span><span>"I'm looking for B2B vertical AI plays in regulated industries with $2-5M revenue potential within 18 months. <strong>This matches my filter.</strong> Unlocking."</span></div>
          </div>
        </div>

        <div className="mistake">
          <span className="num">02</span>
          <div className="content">
            <h4>Skipping <em>Tier 1 questions</em> to "save time"</h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>Paying the Tier 2 deposit immediately because the preview "looks good enough."</span></div>
            <div className="right"><span className="lbl">Right</span><span>Sending 2-3 sharp Tier 1 questions and reviewing the architect's response style. <em>15 minutes of Tier 1 probing saves $5k of regret.</em></span></div>
          </div>
        </div>

        <div className="mistake">
          <span className="num">03</span>
          <div className="content">
            <h4>Ignoring the <em>inspection window</em></h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>Unlocking, glancing at the materials, and letting the 7 days expire without a thorough review.</span></div>
            <div className="right"><span className="lbl">Right</span><span>Blocking 2-3 hours on day 1-3 to read fully and stress-test claims. <strong>If you spot any material discrepancy, raise it before day 7.</strong></span></div>
          </div>
        </div>

        <div className="mistake">
          <span className="num">04</span>
          <div className="content">
            <h4>Treating architects like <em>vendors</em></h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>Paying, downloading, ghosting. Closing the relationship after Tier 4.</span></div>
            <div className="right"><span className="lbl">Right</span><span>Asking the architect for 30 minutes after unlock to walk through execution constraints. <em>Often free, always valuable.</em> Many top buyers turn architects into advisors.</span></div>
          </div>
        </div>

        <div className="mistake">
          <span className="num">05</span>
          <div className="content">
            <h4>Buying <em>across sectors</em> without focus</h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>Unlocking one D2C, one Fintech, one Climate, one AI in the same quarter. "Diversification."</span></div>
            <div className="right"><span className="lbl">Right</span><span>Concentrating on 1-2 sectors. <strong>Pattern recognition compounds.</strong> By your 4th unlock in a sector you'll spot weak listings instantly.</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>


        </div>

        {/* ARCHITECT PLAYBOOK */}
        <div className="role-show" data-show="architect" style={{ display: role === "architect" ? "block" : "none" }}>
          


  {/*  CH 01 · MINDSET  */}
  <section className="chapter" id="ch-01">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">01</span><span className="line"></span><span className="name">Mindset</span></div>
        <h2 className="display lg">Think like a <em>publisher</em>, not a freelancer.</h2>
        <p>The architects who succeed on vvEntra treat their listings like premium intellectual property they're licensing, not gigs they're selling. They invest deeply in fewer listings. <em>Volume thinking destroys reputation here.</em></p>
      </div>

      <div className="principles-grid">
        <div className="principle reveal" data-num="1">
          <h3>Depth is the <em>moat</em></h3>
          <p>The platform's filter is depth. <strong>Shallow listings get rejected, deprioritized, or refunded.</strong> The minimum 90 pages isn't a paperwork requirement, it's a quality filter that protects every other architect's pricing power.</p>
          <span className="key-tag">→ Go deep, not wide</span>
        </div>
        <div className="principle reveal delay-1" data-num="2">
          <h3>Your <em>first listing</em> sets your tier</h3>
          <p>Reviews compound. Your first 3 listings determine whether you become a senior architect (90/10 commission, premium placement) or stay standard (88/12, regular placement). <strong>Invest disproportionately in the first one.</strong></p>
          <span className="key-tag">→ Front-load quality</span>
        </div>
        <div className="principle reveal" data-num="3">
          <h3>Buyers are <em>not customers</em></h3>
          <p>They're potential operating partners. The unlock fee is the audition; the long-term value comes from execution support, advisory roles, or follow-on listings. <strong>Treat every buyer as a potential ongoing relationship.</strong></p>
          <span className="key-tag">→ Play long game</span>
        </div>
        <div className="principle reveal delay-1" data-num="4">
          <h3>Reject buyers <em>who don't fit</em></h3>
          <p>You can decline buyer access at Tier 2 without penalty. Use this. <em>One bad buyer ruins three reviews.</em> Senior architects accept only 40-60% of access requests, and their ratings reflect that selectivity.</p>
          <span className="key-tag">→ Be selective</span>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 02 · PREPARATION  */}
  <section className="chapter" id="ch-02">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">02</span><span className="line"></span><span className="name">Preparation</span></div>
        <h2 className="display lg">How to structure your <em>first listing.</em></h2>
        <p>The hardest single decision an architect makes is what to put inside the package. <em>This checklist is what we've seen consistently distinguish accepted from rejected first submissions.</em></p>
      </div>

      <div className="checklist reveal">
        <div className="checklist-head">
          <h3>Architect <em>pre-listing checklist</em></h3>
          <span className="count">8 steps</span>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Pick a sector <em>you have personally operated in</em></strong>
            <span>Not "interested in." Not "researched extensively." Operated in. <em>Buyers can tell within the first 10 pages whether you've actually shipped in this space.</em> Use your hard-won insight as your differentiator.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Check the <em>demand radar</em> before you build</strong>
            <span>The architect dashboard shows live sector demand. <strong>Building in a +60% demand gap sector clears 3x faster than building in saturated sectors.</strong> Don't build what you want to build; build what's underserved that you can build well.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Aim for <em>120-150 pages</em> for your first listing</strong>
            <span>The minimum is 90 but median accepted depth is 118. <em>Going beyond shows seriousness and dramatically reduces dispute risk.</em> Pages should be substance, not filler.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Include <em>at least 8-10 frameworks or models</em></strong>
            <span>Financial models, operational playbooks, market sizing models, hiring plans, GTM templates. <strong>Diagrams and tools are what buyers screenshot and reference for years.</strong> Lists of advice are not enough.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Build a <em>tight 1-page thesis</em> for Tier 1</strong>
            <span>The Tier 1 preview is your highest-leverage marketing surface. <em>One paragraph problem statement, one paragraph approach, one paragraph why-you, one paragraph buyer profile.</em> Spend hours on it.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Plan your <em>execution support</em> package</strong>
            <span>Decide before listing: do you offer 90-day advisory? Hourly consulting? Operating-partner option? <strong>Listings with structured execution-support tiers earn 2-3x more than IP-only listings.</strong> Price accordingly.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Price against the <em>sector benchmark</em>, not your effort</strong>
            <span>The dashboard shows sector average, min, top. <em>Price within 80-120% of the average for your first listing.</em> Senior architects can charge top-tier. New ones build trust first, then raise prices.</span>
          </div>
        </div>

        <div className="check-item">
          <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div className="body">
            <strong>Have a <em>colleague review</em> before submitting</strong>
            <span>Someone from your operational background who can pressure-test the claims. <em>Internal review catches 90% of issues that would otherwise trigger rejection.</em> The platform's reviewers are far less forgiving than your friends will be.</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 03 · EXECUTION  */}
  <section className="chapter" id="ch-03">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">03</span><span className="line"></span><span className="name">Execution</span></div>
        <h2 className="display lg">The five stages of a <em>successful listing.</em></h2>
        <p>From submission to settlement, your job changes at each stage. <em>The architects who understand this earn 3x what those who don't.</em></p>
      </div>

      <div className="stages reveal">
        <div className="stage">
          <span className="stage-num">Stage 1</span>
          <span className="stage-ttl">Submit</span>
          <span className="stage-desc">Upload your full package. Review takes 5-7 days. Senior architects skip to 2-3 days.</span>
          <div className="stage-bar"></div>
        </div>
        <div className="stage">
          <span className="stage-num">Stage 2</span>
          <span className="stage-ttl">Promote</span>
          <span className="stage-desc">Once live, respond to Tier 1 questions within 24 hours. Response speed correlates with conversion.</span>
          <div className="stage-bar"></div>
        </div>
        <div className="stage">
          <span className="stage-num">Stage 3</span>
          <span className="stage-ttl">Filter</span>
          <span className="stage-desc">Review buyer profiles at Tier 2. Accept serious ones, decline misfits. No penalty either way.</span>
          <div className="stage-bar"></div>
        </div>
        <div className="stage">
          <span className="stage-num">Stage 4</span>
          <span className="stage-ttl">Reveal</span>
          <span className="stage-desc">At Tier 3, sign NDA, deliver partial reveal. Be available for substantive questions.</span>
          <div className="stage-bar"></div>
        </div>
        <div className="stage">
          <span className="stage-num">Stage 5</span>
          <span className="stage-ttl">Support</span>
          <span className="stage-desc">After Tier 4 unlock, offer 30-min onboarding call. This is where execution-support revenue starts.</span>
          <div className="stage-bar"></div>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 04 · RED FLAGS  */}
  <section className="chapter" id="ch-04">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">04</span><span className="line"></span><span className="name">Red flags</span></div>
        <h2 className="display lg">Which <em>buyers to decline.</em></h2>
        <p>You earn the right to decline. Every wrong buyer accepted is a one-star review waiting to happen. <em>Senior architects build their tier by being selective.</em></p>
      </div>

      <div className="red-flags reveal">
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Unverified or incomplete buyer profile</h4></div>
          <p>If their KYC isn't complete or their capacity verification is missing, decline. <strong>The platform requires verification for a reason.</strong> Incomplete profiles correlate with dispute behavior.</p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Tier 1 questions that don't match the sector</h4></div>
          <p>If a buyer asks generic "what's the market size?" questions when your listing covers a specific niche, they haven't read the preview. <em>Buyers who don't engage seriously at Tier 1 won't engage at Tier 4 either.</em></p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Buyer with multiple prior disputes</h4></div>
          <p>Their public profile shows dispute history. Even if some were resolved, the pattern matters. <strong>A buyer with 2+ disputes is significantly more likely to file another.</strong> Decline politely.</p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Negotiation outside the platform</h4></div>
          <p>If a buyer suggests "let's do this offline to save commission," that's a hard stop. <em>Off-platform deals have no escrow, no dispute mechanism, no track record.</em> Report and decline.</p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Pressure to skip stages</h4></div>
          <p>"I'll pay full price now, can we skip Tier 2 and Tier 3?" No. The stages protect both sides. <strong>A buyer who wants to skip is signaling they don't want to be tested.</strong></p>
        </div>
        <div className="red-flag">
          <div className="flag-head"><span className="ic">!</span><h4>Buyer claims to know you "from outside"</h4></div>
          <p>If they reference your real identity (which they shouldn't have at this tier), something's wrong. <em>This is either an injection attempt or a social engineering vector.</em> Report immediately.</p>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 05 · SUCCESS PATTERNS  */}
  <section className="chapter" id="ch-05">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">05</span><span className="line"></span><span className="name">Success patterns</span></div>
        <h2 className="display lg">What <em>top architects</em> do differently.</h2>
        <p>We've tracked the architects who built six-figure earnings on the platform. <em>Here's what we've learned from their behavior.</em></p>
      </div>

      <div className="success-grid reveal">
        <div className="success-card">
          <span className="label">Quality concentration</span>
          <div className="metric"><em>3-5</em><small>listings/year</small></div>
          <h4>They <em>publish less</em>, charge more</h4>
          <p>Top architects publish only 3-5 listings per year. Each one is treated like a senior strategic document. <strong>Their average pricing is 1.8x platform median.</strong></p>
        </div>
        <div className="success-card">
          <span className="label">Buyer relationships</span>
          <div className="metric"><em>2.4x</em><small>execution revenue</small></div>
          <h4>They <em>earn more</em> post-unlock</h4>
          <p>Top architects earn 2.4x as much from execution support and advisory as from the original unlock. <em>The unlock is the introduction; the relationship is where value lives.</em></p>
        </div>
        <div className="success-card">
          <span className="label">Response speed</span>
          <div className="metric"><em>4hr</em><small>median Tier 1 response</small></div>
          <h4>They <em>respond fast</em>, deliberately</h4>
          <p>Top architects respond to Tier 1 inquiries within 4 hours during business hours. Speed signals seriousness. <strong>Slow responders lose 40% of qualified buyers.</strong></p>
        </div>
      </div>
    </div>
  </section>

  {/*  CH 06 · COMMON MISTAKES  */}
  <section className="chapter" id="ch-06">
    <div className="container-narrow">
      <div className="chapter-head reveal">
        <div className="chapter-marker"><span className="num">06</span><span className="line"></span><span className="name">Common mistakes</span></div>
        <h2 className="display lg">What <em>not to do</em>.</h2>
        <p>These are the patterns that consistently show up in the architects who get stuck at standard tier or drop off entirely. <em>Avoid these and your earning ceiling expands dramatically.</em></p>
      </div>

      <div className="mistakes reveal">
        <div className="mistake">
          <span className="num">01</span>
          <div className="content">
            <h4>Listing <em>too many opportunities</em> too fast</h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>Submitting 5 listings in the first month to "maximize coverage."</span></div>
            <div className="right"><span className="lbl">Right</span><span>Submitting one excellent listing, closing 2-3 deals, gathering reviews, then scaling. <em>Reputation precedes volume.</em></span></div>
          </div>
        </div>

        <div className="mistake">
          <span className="num">02</span>
          <div className="content">
            <h4>Pricing <em>below</em> sector average to "compete"</h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>"I'll price my AI workflow at $2,800 because I'm new and want volume."</span></div>
            <div className="right"><span className="lbl">Right</span><span>Pricing at $4,400-5,400 (sector average for AI Workflow). <strong>Underpricing signals weak content.</strong> Serious buyers actively avoid underpriced listings.</span></div>
          </div>
        </div>

        <div className="mistake">
          <span className="num">03</span>
          <div className="content">
            <h4>Ignoring <em>Tier 1 inquiries</em> from "low-tier" buyers</h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>Only responding to PE/VC inquiries; ignoring family offices or operator-investors as "less serious."</span></div>
            <div className="right"><span className="lbl">Right</span><span>Treating all verified buyers equally. <em>Family offices unlock at higher average price than VCs.</em> Operator-investors close fastest. Don't filter by perceived prestige.</span></div>
          </div>
        </div>

        <div className="mistake">
          <span className="num">04</span>
          <div className="content">
            <h4>Skipping the <em>execution support</em> tier</h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>"I just want to sell the IP and move on. No advisory."</span></div>
            <div className="right"><span className="lbl">Right</span><span>Listing optional 90-day execution-support packages at $5-15k. <strong>Roughly 40% of buyers add the package.</strong> Doubles your effective earning per listing.</span></div>
          </div>
        </div>

        <div className="mistake">
          <span className="num">05</span>
          <div className="content">
            <h4>Going <em>defensive</em> when a buyer raises a question</h4>
            <div className="wrong"><span className="lbl">Wrong</span><span>Treating Tier 1 questions as challenges to your competence and answering tersely.</span></div>
            <div className="right"><span className="lbl">Right</span><span>Treating questions as buying signals. <em>A buyer who asks 3 sharp questions converts at 4x the rate of one who doesn't ask any.</em> Engagement is enthusiasm.</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>


        </div>

        {/*  CLOSING  */}
<section className="closing">
  <div className="container-narrow">
    <div className="closing-card">
      <span className="eyebrow">Now you're ready</span>
      <h2 className="display lg">The platform <em>rewards discipline.</em></h2>
      <p className="lead" style={{'textAlign': 'center'}}>The users who treat vvEntra as a serious environment get serious results. The ones who don't, don't. <em>You've now read more than 80% of the people you'll transact with.</em></p>
      <div style={{'display': 'flex', 'gap': '.75rem', 'flexWrap': 'wrap', 'justifyContent': 'center', 'marginTop': '.5rem'}}>
        <Link href="/dashboard" className="btn btn-orange">Open the dashboard <span className="arrow">→</span></Link>
        <Link href="/trust" className="btn btn-outline">Read trust policy <span className="arrow">→</span></Link>
        <Link href="/faq" className="btn btn-outline">View FAQ <span className="arrow">→</span></Link>
      </div>
    </div>
  </div>
</section>

{/*  FOOTER  */}


      </main>

      <Footer />
    </>
  );
}
