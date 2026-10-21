"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PricingPage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [priceInput, setPriceInput] = useState<string | number>(10000);
  const [openRuleIndex, setOpenRuleIndex] = useState<number | null>(null);

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
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealIO.observe(el));

    return () => revealIO.disconnect();
  }, []);

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
    localStorage.setItem("vve-role", newRole);
    document.documentElement.setAttribute("data-role", newRole);
  };

  // Safe pricing calculation
  const safe = Math.max(500, Math.min(1000000, typeof priceInput === "number" ? priceInput : (parseInt(priceInput) || 10000)));
  const capped = safe > 50000;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("is-capped", capped);
    }
  }, [capped]);

  const unlock = safe * 0.1;
  const remaining = safe - unlock;
  const opt1 = remaining;
  const opt2 = remaining * 0.7;
  const opt3 = remaining * 0.5;

  const arch_unlock = unlock * 0.9;
  const arch_opt1 = opt1 * 0.9;
  const arch_opt2 = opt2 * 0.9;
  const arch_opt3 = opt3 * 0.9;
  const arch_best = arch_unlock + arch_opt1;

  const buyer_opt1 = unlock + opt1;
  const buyer_opt2 = unlock + opt2;
  const buyer_opt3 = unlock + opt3;

  const arch_opt1_total = arch_unlock + arch_opt1;
  const arch_opt2_total = arch_unlock + arch_opt2;
  const arch_opt3_total = arch_unlock + arch_opt3;

  const disputeCommission = remaining * 0.1;
  const disputeArchEarn = remaining * 0.9;
  const disputeWin60 = disputeArchEarn * 0.6;
  const disputeLose40 = disputeArchEarn * 0.4;

  const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
  const disp = (amount: number, pctOfListed: string) => {
    if (capped) return pctOfListed + "%";
    return "$" + fmt(amount);
  };
  const dispListed = () => {
    if (capped) return "50K+";
    return "$" + fmt(safe);
  };

  const toggleRule = (idx: number) => {
    setOpenRuleIndex(openRuleIndex === idx ? null : idx);
  };

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="pricing" className="page active">
        {/* HERO */}
        <header className="hero">
          <div className="hero-bg" />
          <div className="container">
            <div className="hero-grid">
              <div className="hero-text">
                <span className="eyebrow reveal in">Pricing</span>

                <div className="role-toggle reveal delay-1 in" id="role-toggle">
                  <div className="role-indicator" />
                  <button
                    type="button"
                    className={`role-btn ${role === "investor" ? "active" : ""}`}
                    data-role="investor"
                    onClick={() => handleRoleToggle("investor")}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
                    </svg>
                    <span>I&apos;m a Buyer</span>
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === "architect" ? "active" : ""}`}
                    data-role="architect"
                    onClick={() => handleRoleToggle("architect")}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 3h18M5 3v10a7 7 0 0 0 14 0V3" />
                      <circle cx="12" cy="20" r="1.5" />
                    </svg>
                    <span>I&apos;m an Architect</span>
                  </button>
                </div>

                <h1 className="display xl reveal delay-2 in">
                  <span className="r-inv">
                    Pay <em>only</em> when you find what you need.
                  </span>
                  <span className="r-arc">
                    Keep <em>90%</em> of everything you earn.
                  </span>
                </h1>

                <p className="lead reveal delay-3 in">
                  <span className="r-inv">
                    Start with a <strong>small unlock fee</strong> to access any opportunity. Meet the architect. Decide how you want to proceed. <em>You&apos;re in control at every stage.</em>
                  </span>
                  <span className="r-arc">
                    List for free. Set your own price. <strong>vvEntra takes a flat 10%</strong> from each transaction. No subscriptions, no listing fees. <em>The simplest pricing in venture intelligence.</em>
                  </span>
                </p>

                <div className="hero-actions reveal delay-3 in">
                  <a href="#calculator" className="btn btn-role btn-lg">
                    Try the calculator <span className="arrow">→</span>
                  </a>
                  <a href="#flow" className="btn btn-ghost">
                    See how money flows
                  </a>
                </div>
              </div>

              <div className="headline-stat reveal delay-2 in">
                <div className="stat-header">
                  <span className="stat-tag">
                    <span className="r-inv">To explore vvEntra</span>
                    <span className="r-arc">Your platform fee</span>
                  </span>
                </div>

                <div className="stat-number-wrap">
                  <div className="stat-main">
                    <span className="r-inv">
                      <em>$0</em>
                    </span>
                    <span className="r-arc">
                      <em>90</em>%
                    </span>
                  </div>
                  <span className="stat-caption">
                    <span className="r-inv">
                      <strong>Free to browse. Free to compare.</strong> You only pay when you choose to unlock an opportunity. The unlock fee depends on the listing.
                    </span>
                    <span className="r-arc">
                      You keep <strong>90% of every payment</strong>. Our flat 10% is the only fee you&apos;ll ever see.
                    </span>
                  </span>
                </div>

                <div className="stat-divider" />

                <div className="stat-breakdown">
                  <div className="stat-pill">
                    <span className="lbl">
                      <span className="r-inv">Unlock fee</span>
                      <span className="r-arc">Listing fee</span>
                    </span>
                    <span className="v">
                      <span className="r-inv">
                        <em>Varies</em>
                      </span>
                      <span className="r-arc">
                        <em>$0</em>
                      </span>
                    </span>
                    <span className="desc">
                      <span className="r-inv">Scales with the listed price</span>
                      <span className="r-arc">Free to publish</span>
                    </span>
                  </div>
                  <div className="stat-pill">
                    <span className="lbl">
                      <span className="r-inv">Hidden fees</span>
                      <span className="r-arc">Subscription</span>
                    </span>
                    <span className="v">
                      <em>$0</em>
                    </span>
                    <span className="desc">
                      <span className="r-inv">What you see is what you pay</span>
                      <span className="r-arc">Pay per deal, not monthly</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CALCULATOR */}
        <section className="calc-section" id="calculator">
          <div className="container">
            <div className="section-head reveal in">
              <span className="eyebrow">Live calculator</span>
              <h2 className="display lg">
                <span className="r-inv">
                  See what your <em>unlock</em> gets you.
                </span>
                <span className="r-arc">
                  See what you <em>earn</em> per deal.
                </span>
              </h2>
              <p>
                <span className="r-inv">
                  Move the slider to any listed price. We&apos;ll show you the unlock cost and what each engagement path costs.
                </span>
                <span className="r-arc">
                  Move the slider to your planned listing price. We&apos;ll show your earnings across every possible outcome.
                </span>
              </p>
            </div>

            <div className="calc-card reveal delay-1 in">
              <div className="calc-input-side">
                <span className="calc-label">
                  <span className="r-inv">Opportunity listed at</span>
                  <span className="r-arc">Your listing price</span>
                </span>

                <div className="calc-input-row">
                  <span className="calc-currency">$</span>
                  <input
                    type="number"
                    className="calc-input"
                    id="calc-input"
                    value={priceInput}
                    min="500"
                    max="100000"
                    step="500"
                    onChange={(e) => setPriceInput(parseInt(e.target.value) || 0)}
                  />
                </div>

                <input
                  type="range"
                  className="calc-slider"
                  id="calc-slider"
                  min="500"
                  max="50000"
                  step="500"
                  value={Math.min(50000, safe)}
                  onChange={(e) => setPriceInput(parseInt(e.target.value) || 0)}
                />

                <div className="calc-presets">
                  {[2000, 5000, 10000, 25000, 50000].map((presetVal) => (
                    <button
                      key={presetVal}
                      type="button"
                      className={`calc-preset ${safe === presetVal ? "active" : ""}`}
                      data-val={presetVal}
                      onClick={() => setPriceInput(presetVal)}
                    >
                      ${presetVal / 1000}k
                    </button>
                  ))}
                </div>

                <div className="calc-help">
                  <span className="r-inv">
                    Your unlock fee is shown on the right. After meeting the architect, you choose how much further to go.
                  </span>
                  <span className="r-arc">
                    Set your own price. <em>Higher price equals higher unlock fee</em> and higher earnings at every stage.
                  </span>
                </div>
              </div>

              <div className="calc-results">
                {/* INVESTOR primary */}
                <div className="result-primary r-inv block">
                  <span className="lbl">Your unlock cost</span>
                  <span className="v">
                    <span className="currency">$</span>
                    <span id="r-unlock">{disp(unlock, "10")}</span>
                  </span>
                  <p className="desc">
                    Your unlock fee. Includes deeper documents, a live meeting with the architect, and the choice to proceed (or not) with three engagement paths below.
                  </p>
                </div>

                {/* ARCHITECT primary */}
                <div className="result-primary r-arc block">
                  <span className="lbl">You earn (best case)</span>
                  <span className="v">
                    <span className="currency">$</span>
                    <span id="r-best">{disp(arch_best, "90")}</span>
                  </span>
                  <p className="desc">
                    90% of the full deal value if the buyer chooses Full Partnership. Includes your unlock earnings (
                    <span id="calc-arch-unlock-earn">{disp(arch_unlock, "9")}</span>) plus full execution payment (
                    <span id="calc-arch-exec-earn">{disp(arch_opt1, "81")}</span>).
                  </p>
                </div>

                <div className="result-secondary">
                  {/* INVESTOR secondary */}
                  <div className="result-cell r-inv flex">
                    <span className="lbl">Full Partnership · total</span>
                    <span className="v">
                      <em>
                        <span id="r-opt1-b">{disp(buyer_opt1, "100")}</span>
                      </em>
                    </span>
                  </div>
                  <div className="result-cell r-inv flex">
                    <span className="lbl">Guidance · total</span>
                    <span className="v">
                      <em>
                        <span id="r-opt2-b">{disp(buyer_opt2, "70")}</span>
                      </em>
                    </span>
                  </div>
                  <div className="result-cell r-inv flex">
                    <span className="lbl">Documents Only · total</span>
                    <span className="v">
                      <em>
                        <span id="r-opt3-b">{disp(buyer_opt3, "50")}</span>
                      </em>
                    </span>
                  </div>

                  {/* ARCHITECT secondary */}
                  <div className="result-cell r-arc flex">
                    <span className="lbl">Full Partnership · earn</span>
                    <span className="v">
                      <em>
                        <span id="r-opt1-a">{disp(arch_opt1_total, "90")}</span>
                      </em>
                    </span>
                  </div>
                  <div className="result-cell r-arc flex">
                    <span className="lbl">Guidance · earn</span>
                    <span className="v">
                      <em>
                        <span id="r-opt2-a">{disp(arch_opt2_total, "63")}</span>
                      </em>
                    </span>
                  </div>
                  <div className="result-cell r-arc flex">
                    <span className="lbl">Documents Only · earn</span>
                    <span className="v">
                      <em>
                        <span id="r-opt3-a">{disp(arch_opt3_total, "45")}</span>
                      </em>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FLOW */}
        <section className="flow-section" id="flow">
          <div className="container">
            <div className="section-head reveal in">
              <span className="eyebrow">The flow</span>
              <h2 className="display lg">
                <span className="r-inv">
                  Where your <em>money</em> goes.
                </span>
                <span className="r-arc">
                  Every <em>dollar</em>, accounted for.
                </span>
              </h2>
              <p>
                <span className="r-inv">
                  Your payment is protected in escrow at every stage. Here is the path your money takes on a{" "}
                  <span id="flow-head-buyer">{dispListed()}</span> opportunity.
                </span>
                <span className="r-arc">
                  Here is what happens to a <span id="flow-head-arch">{dispListed()}</span> listing through every stage. No hidden steps, no surprise fees.
                </span>
              </p>
            </div>

            <div className="flow-diagram reveal delay-1 in">
              <div className="flow-stops">
                {/* BUYER VIEW */}
                <div className="flow-stop buyer r-inv block">
                  <span className="role-tag">Stage 1 · Unlock</span>
                  <span className="who">
                    <em>You pay</em>
                  </span>
                  <span className="amount">
                    <em>
                      <span id="flow-buyer-unlock">{disp(unlock, "10")}</span>
                    </em>
                  </span>
                  <span className="small">
                    Unlock fee on a <span id="flow-buyer-listed">{dispListed()}</span> listing
                  </span>
                </div>
                <div className="flow-arrow r-inv block">→</div>
                <div className="flow-stop platform r-inv block">
                  <span className="role-tag">Held in escrow</span>
                  <span className="who">vvEntra protects it</span>
                  <span className="amount">
                    <span id="flow-buyer-escrow">{disp(unlock, "10")}</span>
                  </span>
                  <span className="small">Until you confirm value received</span>
                </div>
                <div className="flow-arrow r-inv block">→</div>
                <div className="flow-stop architect r-inv block">
                  <span className="role-tag">Stage 2 · You decide</span>
                  <span className="who">
                    <em>You choose</em>
                  </span>
                  <span className="amount">
                    <em>3 paths</em>
                  </span>
                  <span className="small">
                    From <span id="flow-buyer-min">{disp(opt3, "50")}</span> to <span id="flow-buyer-max">{disp(opt1, "100")}</span> more
                  </span>
                </div>

                {/* ARCHITECT VIEW */}
                <div className="flow-stop buyer r-arc block">
                  <span className="role-tag">Buyer</span>
                  <span className="who">
                    <em>Pays</em>
                  </span>
                  <span className="amount">
                    <em>
                      <span id="flow-arch-buyer">{dispListed()}</span>
                    </em>
                  </span>
                  <span className="small">Total over deal lifecycle</span>
                </div>
                <div className="flow-arrow r-arc block">→</div>
                <div className="flow-stop platform r-arc block">
                  <span className="role-tag">vvEntra escrow</span>
                  <span className="who">Holds &amp; releases</span>
                  <span className="amount">
                    <span id="flow-arch-escrow">{dispListed()}</span>
                  </span>
                  <span className="small">10% commission deducted</span>
                </div>
                <div className="flow-arrow r-arc block">→</div>
                <div className="flow-stop architect r-arc block">
                  <span className="role-tag">Architect</span>
                  <span className="who">
                    <em>Receives</em>
                  </span>
                  <span className="amount">
                    <em>
                      <span id="flow-arch-receive">{disp(safe * 0.9, "90")}</span>
                    </em>
                  </span>
                  <span className="small">90% of every payment</span>
                </div>
              </div>

              <div className="flow-rules">
                <div className="flow-rule">
                  <span className="ic">1</span>
                  <div className="body">
                    <strong>Escrow at every stage</strong>
                    <span>Funds release only after milestones approve or auto-approve. Both sides are protected.</span>
                  </div>
                </div>
                <div className="flow-rule">
                  <span className="ic">2</span>
                  <div className="body">
                    <strong>
                      <span className="r-inv">No surprise charges</span>
                      <span className="r-arc">Architect gets 90%</span>
                    </strong>
                    <span>
                      <span className="r-inv">The listed price is the listed price. You pay exactly what you see, nothing added on top.</span>
                      <span className="r-arc">vvEntra&apos;s 10% is taken from architect&apos;s side. The buyer pays the listed price as advertised.</span>
                    </span>
                  </div>
                </div>
                <div className="flow-rule">
                  <span className="ic">3</span>
                  <div className="body">
                    <strong>
                      <span className="r-inv">Released after approval</span>
                      <span className="r-arc">Released in 7 days</span>
                    </strong>
                    <span>
                      <span className="r-inv">Money only moves when you approve milestones or after the 7-day inspection window.</span>
                      <span className="r-arc">From unlock or milestone approval. Bank transfer, Stripe, Wise, or Razorpay.</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OPTIONS */}
        <section className="options-section">
          <div className="container">
            <div className="section-head reveal in">
              <span className="eyebrow">Stage 2 · After the unlock</span>
              <h2 className="display lg">
                <span className="r-inv">
                  Three ways to <em>proceed</em>. You pick.
                </span>
                <span className="r-arc">
                  Three ways buyers <em>can engage</em>.
                </span>
              </h2>
              <p>
                <span className="r-inv">
                  After your unlock meeting, choose how much architect involvement you want. Price scales with engagement.
                </span>
                <span className="r-arc">
                  By listing, you commit to all three paths. Buyers pick what works for them; you deliver accordingly.
                </span>
              </p>
              <div className="based-on-strip">
                <span className="based-on-label">Showing prices for a listing at</span>
                <span className="based-on-value">
                  <span id="based-on-price">{dispListed()}</span>
                </span>
                <a href="#calculator" className="based-on-link">
                  Change in calculator <span className="arrow">↑</span>
                </a>
              </div>
            </div>

            <div className="options-grid reveal delay-1 in">
              {/* OPTION 1 */}
              <div className="option-card featured">
                <div className="option-banner" />
                <span className="option-tag">MOST INVOLVED</span>
                <div className="option-body">
                  <div className="option-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="9" cy="7" r="4" />
                      <path d="M3 21v-1a6 6 0 0 1 12 0v1" />
                      <circle cx="17" cy="11" r="3" />
                      <path d="M21 21v-.5a4.5 4.5 0 0 0-4.5-4.5" />
                    </svg>
                  </div>
                  <h3 className="option-name">
                    Full <em>partnership</em>
                  </h3>
                  <p className="option-tagline">
                    <span className="r-inv">
                      Architect joins as your execution partner. Active involvement, weekly check-ins, full operational support.
                    </span>
                    <span className="r-arc">
                      You join the buyer as an execution partner. Active operational involvement with milestone tracking.
                    </span>
                  </p>
                  <div className="option-percent">
                    <span className="pct">
                      100<span style={{ fontSize: ".7em" }}>%</span>
                    </span>
                    <span className="of">of remaining</span>
                  </div>
                  <div className="option-includes">
                    <span className="ttl">
                      <span className="r-inv">You receive</span>
                      <span className="r-arc">You deliver</span>
                    </span>
                    <div className="option-include-row yes">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>
                        <strong>Full opportunity package</strong>
                      </span>
                    </div>
                    <div className="option-include-row yes">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>
                        <strong>Active execution involvement</strong>
                      </span>
                    </div>
                    <div className="option-include-row yes">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>
                        <strong>Weekly milestone tracking</strong>
                      </span>
                    </div>
                    <div className="option-include-row yes">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>
                        <strong>Full execution support</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="option-footer">
                  <div>
                    <span className="option-footer-lbl">
                      <span className="r-inv">You pay total</span>
                      <span className="r-arc">You earn total</span>
                    </span>
                  </div>
                  <span className="option-footer-amount">
                    <span className="r-inv">
                      <em>
                        <span id="card1-buyer">{disp(buyer_opt1, "100")}</span>
                      </em>
                    </span>
                    <span className="r-arc">
                      <em>
                        <span id="card1-arch">{disp(arch_opt1_total, "90")}</span>
                      </em>
                    </span>
                  </span>
                </div>
              </div>

              {/* OPTION 2 */}
              <div className="option-card">
                <div className="option-banner" />
                <div className="option-body">
                  <div className="option-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <h3 className="option-name">
                    Guidance <em>+ advisory</em>
                  </h3>
                  <p className="option-tagline">
                    <span className="r-inv">
                      Architect advises but doesn&apos;t operate. Scheduled meetings, strategic input, full document access.
                    </span>
                    <span className="r-arc">
                      You advise but don&apos;t operate. Scheduled guidance meetings and strategic input only.
                    </span>
                  </p>
                  <div className="option-percent">
                    <span className="pct">
                      70<span style={{ fontSize: ".7em" }}>%</span>
                    </span>
                    <span className="of">of remaining</span>
                  </div>
                  <div className="option-includes">
                    <span className="ttl">
                      <span className="r-inv">You receive</span>
                      <span className="r-arc">You deliver</span>
                    </span>
                    <div className="option-include-row yes">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>
                        <strong>Full opportunity package</strong>
                      </span>
                    </div>
                    <div className="option-include-row yes">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>
                        <strong>Scheduled guidance meetings</strong>
                      </span>
                    </div>
                    <div className="option-include-row yes">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>
                        <strong>Weekly milestone tracking</strong>
                      </span>
                    </div>
                    <div className="option-include-row no">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="6" y1="18" x2="18" y2="6" />
                        </svg>
                      </span>
                      <span>No hands-on operations</span>
                    </div>
                  </div>
                </div>
                <div className="option-footer">
                  <div>
                    <span className="option-footer-lbl">
                      <span className="r-inv">You pay total</span>
                      <span className="r-arc">You earn total</span>
                    </span>
                  </div>
                  <span className="option-footer-amount">
                    <span className="r-inv">
                      <em>
                        <span id="card2-buyer">{disp(buyer_opt2, "70")}</span>
                      </em>
                    </span>
                    <span className="r-arc">
                      <em>
                        <span id="card2-arch">{disp(arch_opt2_total, "63")}</span>
                      </em>
                    </span>
                  </span>
                </div>
              </div>

              {/* OPTION 3 */}
              <div className="option-card">
                <div className="option-banner" />
                <div className="option-body">
                  <div className="option-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="14" x2="15" y2="14" />
                      <line x1="9" y1="18" x2="15" y2="18" />
                    </svg>
                  </div>
                  <h3 className="option-name">
                    Documents <em>only</em>
                  </h3>
                  <p className="option-tagline">
                    <span className="r-inv">
                      IP transfer only. Full opportunity package and exclusive execution rights. You execute independently.
                    </span>
                    <span className="r-arc">
                      You deliver the complete IP package. Your involvement ends at delivery. Buyer executes independently.
                    </span>
                  </p>
                  <div className="option-percent">
                    <span className="pct">
                      50<span style={{ fontSize: ".7em" }}>%</span>
                    </span>
                    <span className="of">of remaining</span>
                  </div>
                  <div className="option-includes">
                    <span className="ttl">
                      <span className="r-inv">You receive</span>
                      <span className="r-arc">You deliver</span>
                    </span>
                    <div className="option-include-row yes">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>
                        <strong>Full opportunity package</strong>
                      </span>
                    </div>
                    <div className="option-include-row yes">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span>
                        <strong>Exclusive execution rights</strong>
                      </span>
                    </div>
                    <div className="option-include-row no">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="6" y1="18" x2="18" y2="6" />
                        </svg>
                      </span>
                      <span>No further architect time</span>
                    </div>
                    <div className="option-include-row no">
                      <span className="ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="6" y1="18" x2="18" y2="6" />
                        </svg>
                      </span>
                      <span>No advisory meetings</span>
                    </div>
                  </div>
                </div>
                <div className="option-footer">
                  <div>
                    <span className="option-footer-lbl">
                      <span className="r-inv">You pay total</span>
                      <span className="r-arc">You earn total</span>
                    </span>
                  </div>
                  <span className="option-footer-amount">
                    <span className="r-inv">
                      <em>
                        <span id="card3-buyer">{disp(buyer_opt3, "50")}</span>
                      </em>
                    </span>
                    <span className="r-arc">
                      <em>
                        <span id="card3-arch">{disp(arch_opt3_total, "45")}</span>
                      </em>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="benefits-section">
          <div className="container">
            {/* INVESTOR BENEFITS */}
            <div className="r-inv block">
              <div className="section-head reveal in">
                <span className="eyebrow">Why buyers love it</span>
                <h2 className="display lg">
                  Built around <em>your protection.</em>
                </h2>
                <p>
                  vvEntra&apos;s pricing structure exists to make buying low-risk. Every dollar is protected, every commitment is staged, every architect is verified.
                </p>
              </div>

              <div className="benefits-grid">
                <div className="benefit reveal in">
                  <span className="benefit-num">01</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M12 2 4 6v6c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11V6l-8-4z" />
                    </svg>
                  </div>
                  <h3>
                    Pay only for what you <em>actually use</em>
                  </h3>
                  <p>
                    Start with a{" "}
                    <strong>
                      <span id="ben-buyer-unlock">{disp(unlock, "10")}</span> unlock
                    </strong>{" "}
                    on a <span id="ben-buyer-listed">{dispListed()}</span> listing. If you don&apos;t want to proceed, you stop there. No pressure, no obligation. Most serious buyers unlock 5-8 opportunities before choosing one.
                  </p>
                </div>

                <div className="benefit reveal delay-1 in">
                  <span className="benefit-num">02</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h3>
                    Every dollar in <em>escrow</em>
                  </h3>
                  <p>
                    vvEntra holds every payment. <strong>Funds release only after you approve milestones</strong> or after the 7-day inspection window. The architect can&apos;t disappear with your money.
                  </p>
                </div>

                <div className="benefit reveal delay-2 in">
                  <span className="benefit-num">03</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <h3>
                    Three ways to <em>engage</em>
                  </h3>
                  <p>
                    After unlock, you pick from three clear paths: <strong>Full Partnership</strong>, <strong>Guidance</strong>, or <strong>Documents Only</strong>. <em>The price changes with the path.</em> The architect cannot decline your choice. You&apos;re in control.
                  </p>
                </div>

                <div className="benefit reveal in">
                  <span className="benefit-num">04</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <h3>
                    Dispute window at <em>every stage</em>
                  </h3>
                  <p>
                    7-day inspection window after unlock. Weekly milestone approval during execution. <strong>If something is wrong, you have time and tools to raise it</strong> before any money releases.
                  </p>
                </div>

                <div className="benefit reveal delay-1 in">
                  <span className="benefit-num">05</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3>
                    Architects are <em>verified</em>
                  </h3>
                  <p>
                    Every architect&apos;s identity, credentials, and bank are verified before they can list. <em>Anonymous architects don&apos;t exist on vvEntra.</em> You always know exactly who you&apos;re working with.
                  </p>
                </div>

                <div className="benefit reveal delay-2 in">
                  <span className="benefit-num">06</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h3>
                    No <em>hidden fees</em>
                  </h3>
                  <p>
                    What you see is what you pay. No subscription, no charge to browse, no listing access fees. <strong>You pay exactly the price advertised on the listing</strong> — nothing more, nothing added at checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* ARCHITECT BENEFITS */}
            <div className="r-arc block">
              <div className="section-head reveal in">
                <span className="eyebrow">Why architects choose us</span>
                <h2 className="display lg">
                  Built to <em>reward your work.</em>
                </h2>
                <p>
                  vvEntra&apos;s economic model exists so that real operators get paid fairly for the hard intellectual work of structuring opportunities.
                </p>
              </div>

              <div className="benefits-grid">
                <div className="benefit reveal in">
                  <span className="benefit-num">01</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M12 1v22" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <h3>
                    Keep <em>90%</em> of every payment
                  </h3>
                  <p>
                    Flat 10% commission. No tiered fees. No hidden charges. <strong>The simplest pricing in venture intelligence.</strong> On a <span id="ben-arch-listed">{dispListed()}</span> deal you take home <span id="ben-arch-takehome">{disp(safe * 0.9, "90")}</span>.
                  </p>
                </div>

                <div className="benefit reveal delay-1 in">
                  <span className="benefit-num">02</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <polyline points="3 17 9 11 13 15 21 7" />
                      <polyline points="14 7 21 7 21 14" />
                    </svg>
                  </div>
                  <h3>
                    Earn at <em>every stage</em>
                  </h3>
                  <p>
                    You earn <span id="ben-arch-unlock-earn">{disp(arch_unlock, "9")}</span> on the unlock alone. Even if the buyer doesn&apos;t proceed further, the unlock is yours. <em>Every meeting you take, every preview you share, you&apos;re being paid.</em>
                  </p>
                </div>

                <div className="benefit reveal delay-2 in">
                  <span className="benefit-num">03</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h3>
                    Free to <em>list</em>, free to <em>maintain</em>
                  </h3>
                  <p>
                    No upfront cost to publish. No monthly subscription. No per-listing fees. <strong>Zero financial risk to test the platform.</strong> You only pay when you earn.
                  </p>
                </div>

                <div className="benefit reveal in">
                  <span className="benefit-num">04</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h3>
                    Escrow <em>protects</em> you
                  </h3>
                  <p>
                    Buyers cannot disappear. Their full payment sits in vvEntra escrow before you start. <strong>Milestone approval triggers release.</strong> If a buyer ghosts, milestones auto-approve after 5 days.
                  </p>
                </div>

                <div className="benefit reveal delay-1 in">
                  <span className="benefit-num">05</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <h3>
                    Set <em>your own</em> price
                  </h3>
                  <p>
                    No platform-imposed pricing. You decide what your opportunity is worth. <em>Higher prices reflect higher depth.</em> Top architects on the platform list at $7,000-$25,000.
                  </p>
                </div>

                <div className="benefit reveal delay-2 in">
                  <span className="benefit-num">06</span>
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <h3>
                    Payouts in <em>7 days</em>
                  </h3>
                  <p>
                    Funds release within 7 days of unlock or milestone approval. Bank transfer, Wise, Stripe, or Razorpay. <strong>No payment delays beyond what the processor charges.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DISPUTE SCENARIOS */}
        <section className="protection-section">
          <div className="container">
            <div className="section-head reveal in">
              <span className="eyebrow">When something goes wrong</span>
              <h2 className="display lg">
                Disputes resolve in <em>5 days</em>.
              </h2>
              <p>
                vvEntra moderation reviews disputes with platform-recorded evidence. Here&apos;s exactly how outcomes work, using a{" "}
                <span id="dispute-deal-amount">{disp(remaining, "90")}</span> Full Partnership deal as the example.
              </p>
            </div>

            <div className="scenarios-grid">
              <div className="scenario win reveal in">
                <span className="scenario-tag">
                  <span style={{ width: 6, height: 6, background: "var(--green)", borderRadius: "50%", display: "inline-block" }} />
                  Best outcome
                </span>
                <h3>
                  Deal completes <em>cleanly</em>
                </h3>
                <p className="scenario-desc">
                  Buyer approves all milestones (or auto-approval triggers after 5 days). Architect delivers. Money flows as expected.
                </p>
                <div className="scenario-math">
                  <div className="scenario-math-row r-arc flex">
                    <span className="lbl">vvEntra commission</span>
                    <span className="v">
                      <span id="d1-comm">{disp(disputeCommission, "9")}</span>
                    </span>
                  </div>
                  <div className="scenario-math-row">
                    <span className="lbl">Architect earnings</span>
                    <span className="v green">
                      <span id="d1-arch">{disp(disputeArchEarn, "81")}</span>
                    </span>
                  </div>
                  <div className="scenario-math-row total">
                    <span className="lbl">Buyer total spend</span>
                    <span className="v">
                      <span id="d1-total">{dispListed()}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="scenario lose reveal delay-1 in">
                <span className="scenario-tag">
                  <span style={{ width: 6, height: 6, background: "var(--red)", borderRadius: "50%", display: "inline-block" }} />
                  Architect ghosts
                </span>
                <h3>
                  Architect <em>disengages</em>
                </h3>
                <p className="scenario-desc">
                  Buyer files a dispute. Architect doesn&apos;t respond within moderation window. <span className="r-inv">Buyer gets refund.</span>
                  <span className="r-arc">Architect loses by default. vvEntra commission still taken.</span>
                </p>
                <div className="scenario-math">
                  <div className="scenario-math-row r-arc flex">
                    <span className="lbl">vvEntra commission</span>
                    <span className="v">
                      <span id="d2-comm">{disp(disputeCommission, "9")}</span>
                    </span>
                  </div>
                  <div className="scenario-math-row">
                    <span className="lbl">Buyer refund</span>
                    <span className="v green">
                      <span id="d2-refund">{disp(disputeArchEarn, "81")}</span>
                    </span>
                  </div>
                  <div className="scenario-math-row total">
                    <span className="lbl">Architect receives</span>
                    <span className="v red">$0</span>
                  </div>
                </div>
              </div>

              <div className="scenario win reveal delay-2 in">
                <span className="scenario-tag">
                  <span style={{ width: 6, height: 6, background: "var(--green)", borderRadius: "50%", display: "inline-block" }} />
                  Buyer wins dispute
                </span>
                <h3>
                  Moderator favors the <em>buyer</em>
                </h3>
                <p className="scenario-desc">
                  Both parties submit evidence. Moderator finds the buyer&apos;s complaint is valid. 60/40 split favoring the buyer.
                </p>
                <div className="scenario-math">
                  <div className="scenario-math-row r-arc flex">
                    <span className="lbl">vvEntra commission</span>
                    <span className="v">
                      <span id="d3-comm">{disp(disputeCommission, "9")}</span>
                    </span>
                  </div>
                  <div className="scenario-math-row">
                    <span className="lbl">Buyer refund (60%)</span>
                    <span className="v green">
                      <span id="d3-buyer60">{disp(disputeWin60, "49")}</span>
                    </span>
                  </div>
                  <div className="scenario-math-row">
                    <span className="lbl">Architect receives (40%)</span>
                    <span className="v">
                      <span id="d3-arch40">{disp(disputeLose40, "32")}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="scenario win reveal delay-3 in">
                <span className="scenario-tag">
                  <span style={{ width: 6, height: 6, background: "var(--green)", borderRadius: "50%", display: "inline-block" }} />
                  Architect wins dispute
                </span>
                <h3>
                  Moderator favors the <em>architect</em>
                </h3>
                <p className="scenario-desc">
                  Both parties submit evidence. Moderator finds the architect delivered as promised. 60/40 split favoring the architect.
                </p>
                <div className="scenario-math">
                  <div className="scenario-math-row r-arc flex">
                    <span className="lbl">vvEntra commission</span>
                    <span className="v">
                      <span id="d4-comm">{disp(disputeCommission, "9")}</span>
                    </span>
                  </div>
                  <div className="scenario-math-row">
                    <span className="lbl">Architect receives (60%)</span>
                    <span className="v green">
                      <span id="d4-arch60">{disp(disputeWin60, "49")}</span>
                    </span>
                  </div>
                  <div className="scenario-math-row">
                    <span className="lbl">Buyer refund (40%)</span>
                    <span className="v">
                      <span id="d4-buyer40">{disp(disputeLose40, "32")}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p style={{ textAlign: "center", fontSize: ".78rem", color: "var(--text-faint)", marginTop: "2.5rem", fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", lineHeight: 1.6 }}>
              <span className="r-inv">
                All disputes are handled by vvEntra moderation. Either party can request senior moderator review within 7 days of an initial decision.
              </span>
              <span className="r-arc">
                vvEntra&apos;s 10% commission is retained in all dispute outcomes. The same commission funds the moderation team.
                <br />
                Either party can request senior moderator review within 7 days of an initial decision.
              </span>
            </p>
          </div>
        </section>

        {/* RULES */}
        <section className="rules-section">
          <div className="container">
            <div className="section-head reveal in">
              <span className="eyebrow">Important rules · click to expand</span>
              <h2 className="display lg">
                The fine print, <em>in plain English.</em>
              </h2>
              <p>The rules that turn a marketplace into a serious platform. Tap any rule to read the detail.</p>
            </div>

            <div className="rules-list reveal delay-1 in">
              {/* 1 */}
              <div className={`rule-item ${openRuleIndex === 0 ? "open" : ""}`}>
                <div className="rule-q" onClick={() => toggleRule(0)}>
                  <span className="q-text">
                    Architects <em>cannot decline</em> a buyer&apos;s chosen path
                  </span>
                  <span className="ic">+</span>
                </div>
                <div className="rule-a">
                  By listing on vvEntra, the architect agrees to honor all three paths — Full Partnership, Guidance, and Documents Only. The buyer picks; the architect delivers. <em>This prevents bait-and-switch.</em> If you don&apos;t want to offer Documents Only deals, don&apos;t list on vvEntra.
                </div>
              </div>

              {/* 2 */}
              <div className={`rule-item ${openRuleIndex === 1 ? "open" : ""}`}>
                <div className="rule-q" onClick={() => toggleRule(1)}>
                  <span className="q-text">
                    No <em>custom negotiation</em> outside the three paths
                  </span>
                  <span className="ic">+</span>
                </div>
                <div className="rule-a">
                  Buyers cannot ask for &quot;Guidance without the meetings&quot; or &quot;Full Partnership at a discount.&quot; The three paths are the three paths. <em>This protects both sides from pressure tactics.</em> Pick a path, commit, execute.
                </div>
              </div>

              {/* 3 */}
              <div className={`rule-item ${openRuleIndex === 2 ? "open" : ""}`}>
                <div className="rule-q" onClick={() => toggleRule(2)}>
                  <span className="q-text">
                    The <em>unlock fee</em> is non-refundable if you proceed
                  </span>
                  <span className="ic">+</span>
                </div>
                <div className="rule-a">
                  <span className="r-inv">
                    If you unlock, have the meeting, see the documents, and then choose not to proceed, your unlock fee is not refunded. <strong>The architect delivered initial value to you — meetings, documents, time.</strong> You can still dispute the unlock within 7 days if you believe the preview was deceptive.
                  </span>
                  <span className="r-arc">
                    If a buyer unlocks, has the meeting, sees the documents, and then chooses not to proceed with any path, <strong>the architect still keeps the $900</strong>. The buyer received initial documents and a meeting; that has value.
                  </span>
                </div>
              </div>

              {/* 4 */}
              <div className={`rule-item ${openRuleIndex === 3 ? "open" : ""}`}>
                <div className="rule-q" onClick={() => toggleRule(3)}>
                  <span className="q-text">
                    Buyers can <em>dispute the unlock</em> if misled
                  </span>
                  <span className="ic">+</span>
                </div>
                <div className="rule-a">
                  If the buyer believes the preview was deceptive or the unlocked content was materially less than advertised, they can file an unlock-specific dispute within <em>7 days</em>. Honest disclosure at the listing stage is mandatory.
                </div>
              </div>

              {/* 5 */}
              <div className={`rule-item ${openRuleIndex === 4 ? "open" : ""}`}>
                <div className="rule-q" onClick={() => toggleRule(4)}>
                  <span className="q-text">
                    All deal communications happen <em>on vvEntra</em>
                  </span>
                  <span className="ic">+</span>
                </div>
                <div className="rule-a">
                  Chat, video calls, file exchanges, milestone reviews — everything on the platform. <em>Off-platform discussions are not admissible in disputes.</em> If it&apos;s not on vvEntra, it didn&apos;t happen.
                </div>
              </div>

              {/* 6 */}
              <div className={`rule-item ${openRuleIndex === 5 ? "open" : ""}`}>
                <div className="rule-q" onClick={() => toggleRule(5)}>
                  <span className="q-text">
                    Milestones <em>auto-approve</em> after 5 days
                  </span>
                  <span className="ic">+</span>
                </div>
                <div className="rule-a">
                  For Full Partnership and Guidance, the architect logs weekly progress. The buyer has 5 days to approve or flag. <strong>If the buyer doesn&apos;t respond, milestones auto-approve</strong> and payment releases. Prevents buyers from stalling payment.
                </div>
              </div>

              {/* 7 */}
              <div className={`rule-item r-arc block ${openRuleIndex === 6 ? "open" : ""}`}>
                <div className="rule-q" onClick={() => toggleRule(6)}>
                  <span className="q-text">
                    Architects are responsible for <em>their own taxes</em>
                  </span>
                  <span className="ic">+</span>
                </div>
                <div className="rule-a">
                  vvEntra deducts platform commission before payout. Architects handle their own tax filings (GST in India, income tax internationally). We provide annual income statements. <em>Detailed handling is in the architect agreement.</em>
                </div>
              </div>

              {/* 8 */}
              <div className={`rule-item ${openRuleIndex === 7 ? "open" : ""}`}>
                <div className="rule-q" onClick={() => toggleRule(7)}>
                  <span className="q-text">
                    Senior moderator <em>appeals</em> are available
                  </span>
                  <span className="ic">+</span>
                </div>
                <div className="rule-a">
                  Either party can request senior moderator review within 7 days of an initial decision. Senior decisions are final. <em>About 12% of senior reviews reverse the original outcome.</em> Appeal is free, one per dispute.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <section className="closing">
          <div className="container">
            <div className="closing-content">
              <span className="eyebrow">Ready to move</span>
              <h2 className="display lg">
                <span className="r-inv">
                  Start with a <em>single unlock</em>.
                </span>
                <span className="r-arc">
                  List your first <em>opportunity</em>.
                </span>
              </h2>
              <p>
                <span className="r-inv">
                  Browse the marketplace, find an opportunity that matches your thesis, unlock for a small fee, meet the architect. <em>You&apos;re never locked in.</em>
                </span>
                <span className="r-arc">
                  Free to list, free to maintain. Set your price, get matched with verified buyers. <em>You earn 90% of everything.</em>
                </span>
              </p>
              <div style={{ display: "flex", gap: ".65rem", flexWrap: "wrap", justifyContent: "center", marginTop: ".5rem" }}>
                <Link href={role === "architect" ? "/signup?role=architect" : "/signup"} className="btn btn-role btn-lg">
                  <span className="cta-text" /> <span className="arrow">→</span>
                </Link>
                <Link href="/#trust" className="btn btn-outline">
                  Read trust policy
                </Link>
                <Link href="/#faq" className="btn btn-outline">
                  View FAQ
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
