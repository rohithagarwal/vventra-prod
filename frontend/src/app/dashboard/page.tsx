"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { resolveAccountDestination } from "@/lib/auth/access";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [period, setPeriod] = useState<"7-day" | "30-day" | "Quarterly">("7-day");
  const [sectorFilter, setSectorFilter] = useState<string>("All sectors");

  // What Should I List interactive state
  const [wslCapital, setWslCapital] = useState<"lean" | "mid" | "heavy">("lean");
  const [wslSpeed, setWslSpeed] = useState<"fast" | "value" | "balanced">("fast");
  const [wslDomain, setWslDomain] = useState<"any" | "tech" | "ops" | "consumer">("any");

  useEffect(() => {
    const roleParam = searchParams.get("role") as "investor" | "architect" | null;
    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || roleParam || "investor";
    setRole(savedRole);
    document.documentElement.setAttribute("data-role", savedRole);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== "undefined" ? localStorage.getItem("vve-access-token") : null;
    if (!token) return;

    void (async () => {
      try {
        const destination = await resolveAccountDestination();
        if (cancelled) return;
        const hasSubmittedProfile =
          typeof window !== "undefined" &&
          (Boolean(localStorage.getItem("vve-profile")) ||
            localStorage.getItem("vve-stage") === "applied" ||
            localStorage.getItem("vve-stage") === "verified");

        if (!destination.path.startsWith("/dashboard") && !hasSubmittedProfile) {
          router.replace(destination.path);
          return;
        }
        localStorage.setItem("vve-role", destination.role);
        localStorage.setItem("vve-stage", "verified");
        document.documentElement.setAttribute("data-role", destination.role);
        setRole(destination.role);
      } catch {
        // Fallback to preview mode if backend is unreachable
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
    localStorage.setItem("vve-role", newRole);
    document.documentElement.setAttribute("data-role", newRole);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => {
        document.querySelectorAll(`.role-show[data-show="${newRole}"] .reveal`).forEach(el => {
          el.classList.add("in");
        });
      }, 50);
    }
  };

  // WSL Recommender calculation
  const CATS = [
    { name: "RegTech · mid-market compliance", demand: 84, supply: 18, unlock: 6200, clear: 12, cost: "mid", domain: "ops" },
    { name: "AI agents · vertical operations", demand: 92, supply: 32, unlock: 7800, clear: 8, cost: "mid", domain: "tech" },
    { name: "Healthtech · diagnostics workflow", demand: 74, supply: 28, unlock: 5400, clear: 15, cost: "heavy", domain: "tech" },
    { name: "Climate · industrial efficiency", demand: 68, supply: 22, unlock: 6900, clear: 18, cost: "heavy", domain: "ops" },
    { name: "Fintech SMB · embedded lending", demand: 62, supply: 36, unlock: 5800, clear: 11, cost: "mid", domain: "ops" },
    { name: "D2C · subscription retention engine", demand: 71, supply: 41, unlock: 3900, clear: 9, cost: "lean", domain: "consumer" },
    { name: "B2B SaaS · onboarding automation", demand: 79, supply: 35, unlock: 4600, clear: 10, cost: "lean", domain: "tech" },
    { name: "Creator economy · monetization ops", demand: 58, supply: 26, unlock: 3200, clear: 13, cost: "lean", domain: "consumer" },
    { name: "Logistics · last-mile optimization", demand: 66, supply: 24, unlock: 6100, clear: 14, cost: "mid", domain: "ops" },
    { name: "Insurtech · claims automation", demand: 70, supply: 20, unlock: 7200, clear: 12, cost: "heavy", domain: "tech" }
  ];

  const scoreCat = (c: typeof CATS[0]) => {
    const gap = c.demand - c.supply;
    let s = gap * 1.2 + c.demand * 0.4;
    if (wslSpeed === "fast") s += Math.max(0, (20 - c.clear)) * 2.2;
    else if (wslSpeed === "value") s += (c.unlock / 1000) * 3.0;
    else s += Math.max(0, (20 - c.clear)) * 1.0 + (c.unlock / 1000) * 1.2;

    const order: Record<string, number> = { lean: 1, mid: 2, heavy: 3 };
    const fitGap = Math.abs(order[wslCapital] - order[c.cost]);
    s -= fitGap * 10;
    if (wslDomain !== "any") s += (c.domain === wslDomain) ? 16 : -6;
    return s;
  };

  const fitLabel = (c: typeof CATS[0]) => {
    const order: Record<string, number> = { lean: 1, mid: 2, heavy: 3 };
    const fitGap = Math.abs(order[wslCapital] - order[c.cost]);
    const domainOk = (wslDomain === "any" || c.domain === wslDomain);
    return (fitGap === 0 && domainOk) ? { t: "Strong fit", c: "high" } : { t: "Good fit", c: "mid" };
  };

  const rankedWsl = [...CATS].map(c => ({ c, s: scoreCat(c) })).sort((a, b) => b.s - a.s).slice(0, 4);

  // Live Terminal Simulations & Dynamic Updates
  useEffect(() => {
    // 1. Reveal elements observer
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));

    // Instantly reveal hero / role-toggle-section elements
    document.querySelectorAll(".role-toggle-section .reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), 50 + i * 50);
    });

    // Reveal initially active role-show content
    document.querySelectorAll(`.role-show[data-show="${role}"] .reveal`).forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), 60 + i * 40);
    });

    // 2. Funnel observer
    const funnel = document.getElementById("funnel");
    let funnelIO: IntersectionObserver | null = null;
    if (funnel) {
      funnelIO = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(".funnel-stage").forEach((s, i) => setTimeout(() => s.classList.add("in"), i * 120));
          }
        });
      }, { threshold: 0.3 });
      funnelIO.observe(funnel);
    }

    // 3. Region bars observer
    const regionObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".region-bar").forEach((b, i) => setTimeout(() => b.classList.add("in"), i * 90));
        }
      });
    }, { threshold: 0.3 });
    ["region-bars-inv", "region-bars-arc"].forEach(id => {
      const el = document.getElementById(id);
      if (el) regionObs.observe(el);
    });

    // 4. Sector Activity Heatmap populated declaratively in JSX

    // 5. Demand & Supply SVG Live Chart
    const W = 600, H = 320, POINTS = 30;
    const demand: number[] = [], supply: number[] = [];
    let dv = 60, sv = 30;
    for (let i = 0; i < POINTS; i++) {
      dv += (Math.random() - 0.45) * 12;
      sv += (Math.random() - 0.5) * 8;
      dv = Math.max(20, Math.min(95, dv));
      sv = Math.max(15, Math.min(75, sv));
      demand.push(dv);
      supply.push(sv);
    }
    const buildPath = (arr: number[]) => {
      return arr.map((v, i) => {
        const x = (i / (arr.length - 1)) * W;
        const y = H - (v / 100) * (H - 40) - 20;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(" ");
    };
    const buildArea = (arr: number[]) => buildPath(arr) + ` L ${W} ${H} L 0 ${H} Z`;
    const updateChart = () => {
      const dl = document.getElementById("demand-line");
      const da = document.getElementById("demand-area");
      const sl = document.getElementById("supply-line");
      const sa = document.getElementById("supply-area");
      if (!dl || !da || !sl || !sa) return;
      dl.setAttribute("d", buildPath(demand));
      da.setAttribute("d", buildArea(demand));
      sl.setAttribute("d", buildPath(supply));
      sa.setAttribute("d", buildArea(supply));
    };
    updateChart();

    const chartInterval = setInterval(() => {
      demand.shift();
      supply.shift();
      dv += (Math.random() - 0.4) * 10;
      sv += (Math.random() - 0.5) * 7;
      dv = Math.max(20, Math.min(95, dv));
      sv = Math.max(15, Math.min(75, sv));
      demand.push(dv);
      supply.push(sv);
      updateChart();
    }, 2400);

    // 6. Live Metrics Strip Updates (idle: 0 users on platform yet)
    const metricsInterval = setInterval(() => {}, 60000);

    // 7. Live Deal Feed (idle: 0 users on platform yet)
    const dealInterval = setInterval(() => {}, 60000);

    // 8. Live Peer Activity (idle: 0 users on platform yet)
    const peerInterval = setInterval(() => {}, 60000);

    // 9. Live Looking (idle: 0 users on platform yet)
    const lookInterval = setInterval(() => {}, 60000);

    // 10. What Should I List interactive module
    const wslModule = document.getElementById("whatToListModule");
    if (wslModule) {
      const state = { capital: "lean", speed: "fast", domain: "any" };
      const score = (c: any) => {
        const gap = c.demand - c.supply;
        let s = gap * 1.2 + c.demand * 0.4;
        if (state.speed === "fast") s += Math.max(0, (20 - c.clear)) * 2.2;
        else if (state.speed === "value") s += (c.unlock / 1000) * 3.0;
        else s += Math.max(0, (20 - c.clear)) * 1.0 + (c.unlock / 1000) * 1.2;
        const order: any = { lean: 1, mid: 2, heavy: 3 };
        const fitGap = Math.abs(order[state.capital] - order[c.cost]);
        s -= fitGap * 10;
        if (state.domain !== "any") s += (c.domain === state.domain) ? 16 : -6;
        return s;
      };
      const fitLabel = (c: any) => {
        const order: any = { lean: 1, mid: 2, heavy: 3 };
        const fitGap = Math.abs(order[state.capital] - order[c.cost]);
        const domainOk = (state.domain === "any" || c.domain === state.domain);
        return (fitGap === 0 && domainOk) ? { t: "Strong fit", c: "high" } : { t: "Good fit", c: "mid" };
      };
      const renderWsl = () => {
        const ranked = CATS.map(c => ({ c, s: score(c) })).sort((a, b) => b.s - a.s).slice(0, 4);
        const list = document.getElementById("wslResults");
        if (!list) return;
        list.innerHTML = ranked.map((r, i) => {
          const c = r.c; const gap = c.demand - c.supply; const fit = fitLabel(c);
          return '<div class="wsl-card" style="animation-delay:' + (i * 0.05) + 's">'
            + '<div class="wsl-card-rank">0' + (i + 1) + '</div>'
            + '<div class="wsl-card-main"><p class="wsl-card-name">' + c.name + '</p>'
            + '<div class="wsl-card-meta"><span>Demand <b>' + c.demand + '</b></span><span>Supply <b>' + c.supply + '</b></span><span>Avg unlock <b>$' + c.unlock.toLocaleString("en-US") + '</b></span><span>~<b>' + c.clear + 'd</b> clear</span></div></div>'
            + '<div class="wsl-card-score"><span class="wsl-score-num">+' + gap + '</span><span class="wsl-score-lbl">demand gap</span><br><span class="wsl-fit ' + fit.c + '">' + fit.t + '</span></div>'
            + '</div>';
        }).join("");
        const ctaText = document.getElementById("wslCtaText");
        if (ctaText && ranked[0]) ctaText.textContent = "Top match: " + ranked[0].c.name + ". Structure a 90+ page opportunity here and it clears fastest for your profile.";
      };
      wslModule.querySelectorAll(".wsl-options").forEach(group => {
        const key = (group as HTMLElement).dataset.wsl as string;
        group.querySelectorAll(".wsl-opt").forEach(btn => btn.addEventListener("click", () => {
          group.querySelectorAll(".wsl-opt").forEach(b => b.classList.toggle("active", b === btn));
          (state as any)[key] = (btn as HTMLElement).dataset.val;
          renderWsl();
        }));
      });
      renderWsl();
    }

    // 11. Dashboard filter pills
    const filterPills = document.querySelectorAll(".dash-filters .filter-pill");
    filterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        const text = pill.textContent?.trim();
        if (text === "7-day" || text === "30-day" || text === "Quarterly") {
          filterPills.forEach(p => {
            const t = p.textContent?.trim();
            if (t === "7-day" || t === "30-day" || t === "Quarterly") {
              p.classList.toggle("active", p === pill);
            }
          });
        } else {
          filterPills.forEach(p => {
            const t = p.textContent?.trim();
            if (t === "All sectors" || t === "AI · Tech" || t === "Fintech") {
              p.classList.toggle("active", p === pill);
            }
          });
        }
      });
    });

    return () => {
      io.disconnect();
      if (funnelIO) funnelIO.disconnect();
      regionObs.disconnect();
      clearInterval(chartInterval);
      clearInterval(metricsInterval);
      clearInterval(dealInterval);
      clearInterval(peerInterval);
      clearInterval(lookInterval);
    };
  }, []);

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="dashboard" className="page dashboard-page" data-role={role}>
        
{/* ============================================== */}
{/* ROLE TOGGLE */}
{/* ============================================== */}
<section className="role-toggle-section">
  <div className="container">
    <div className="role-toggle-wrap">
      <span className="eyebrow reveal">Intelligence Terminal · Live data</span>
      <h1 className="display lg reveal delay-1">View the market <em>through your lens.</em></h1>
      <p className="reveal delay-2">Same market data, two perspectives. <em>Choose how you want to see it.</em> Switch any time, your preference is saved.</p>

      <div className="role-toggle reveal delay-3" id="role-toggle">
        <div className="role-indicator"></div>
        <button type="button" className={`role-btn ${role === "investor" ? "active" : ""}`} data-role="investor" onClick={() => handleRoleToggle("investor")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
          <span className="icon-text">As Investor<span className="sub-label">Find opportunities</span></span>
        </button>
        <button type="button" className={`role-btn ${role === "architect" ? "active" : ""}`} data-role="architect" onClick={() => handleRoleToggle("architect")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3h18M5 3v10a7 7 0 0 0 14 0V3"/><circle cx="12" cy="20" r="1.5"/></svg>
          <span className="icon-text">As Architect<span className="sub-label">Find demand</span></span>
        </button>
      </div>
    </div>
  </div>
</section>

{/* ============================================== */}
{/* ROLE-AWARE DASH HEADER */}
{/* ============================================== */}
<header className="dash-header">
  <div className="container">
    <div className="dash-header-inner">
      <div className="dash-greeting reveal" id="greeting-wrap">
        {/* INVESTOR VIEW */}
        <div className="role-show" data-show="investor">
          <h2 className="display md">The <em>investor terminal.</em></h2>
          <p>Real-time deal flow, sector demand, capital deployment, and matched opportunities. <em>Tuned to your thesis.</em> Updated continuously.</p>
        </div>
        {/* ARCHITECT VIEW */}
        <div className="role-show" data-show="architect">
          <h2 className="display md">The <em>architect terminal.</em></h2>
          <p>Where buyer demand is strongest. What they pay. Which buyer types are looking at your sectors. <em>Tuned to help you decide what to build next.</em></p>
        </div>
      </div>
      <div className="dash-filters reveal delay-1">
        <button className="filter-pill active">7-day</button>
        <button className="filter-pill">30-day</button>
        <button className="filter-pill">Quarterly</button>
        <span style={{"width":"1px","height":"24px","background":"var(--line-strong)","margin":"0 .25rem"}}></span>
        <button className="filter-pill active">All sectors</button>
        <button className="filter-pill">AI · Tech</button>
        <button className="filter-pill">Fintech</button>
      </div>
    </div>
  </div>
</header>

{/* ============================================== */}
{/* ROLE-AWARE METRICS STRIP */}
{/* ============================================== */}
<div className="metrics-strip">
  <div className="container">
    {/* INVESTOR METRICS */}
    <div className="metrics-grid role-show" data-show="investor">
      <div className="metric-cell">
        <span className="nm"><span className="live"></span>Live Listings</span>
        <span className="v" id="inv-m1">0</span>
        <span className="d up" id="inv-m1-d">0 today</span>
      </div>
      <div className="metric-cell">
        <span className="nm"><span className="live"></span>Active Now</span>
        <span className="v" id="inv-m2">0</span>
        <span className="d up">0 vs avg</span>
      </div>
      <div className="metric-cell">
        <span className="nm">New This Week</span>
        <span className="v" id="inv-m3">0</span>
        <span className="d up">0 WoW</span>
      </div>
      <div className="metric-cell">
        <span className="nm">Architects Online</span>
        <span className="v" id="inv-m4">0</span>
        <span className="d up">0 this wk</span>
      </div>
      <div className="metric-cell">
        <span className="nm">Avg Unlock</span>
        <span className="v">$0</span>
        <span className="d up">0% MoM</span>
      </div>
      <div className="metric-cell">
        <span className="nm">Deals Closed</span>
        <span className="v">0</span>
        <span className="d up">0% MoM</span>
      </div>
    </div>
    {/* ARCHITECT METRICS */}
    <div className="metrics-grid role-show" data-show="architect">
      <div className="metric-cell">
        <span className="nm"><span className="live"></span>Buyers Online</span>
        <span className="v" id="arc-m1">0</span>
        <span className="d up">0 vs avg</span>
      </div>
      <div className="metric-cell">
        <span className="nm">Active Searches</span>
        <span className="v" id="arc-m2">0</span>
        <span className="d up">0 this wk</span>
      </div>
      <div className="metric-cell">
        <span className="nm">Avg Unlock Value</span>
        <span className="v">$0</span>
        <span className="d up">0% MoM</span>
      </div>
      <div className="metric-cell">
        <span className="nm">Top Sector Pay</span>
        <span className="v">$0</span>
        <span className="d up">--</span>
      </div>
      <div className="metric-cell">
        <span className="nm">Demand Gap</span>
        <span className="v" style={{"color":"var(--role)"}}>0%</span>
        <span className="d up">Top 5 sectors</span>
      </div>
      <div className="metric-cell">
        <span className="nm">Listings Cleared</span>
        <span className="v" id="arc-m3">0</span>
        <span className="d up">0% MoM</span>
      </div>
    </div>
  </div>
</div>

{/* ============================================== */}
{/* ROLE-AWARE INSIGHT CALLOUT */}
{/* ============================================== */}
<section style={{"padding":"1.5rem 0 0"}}>
  <div className="container">
    <div className="role-show" data-show="investor">
      <div className="insight-callout reveal">
        <div className="ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v8M12 22v-2M2 12h2M20 12h2"/><circle cx="12" cy="12" r="6"/></svg>
        </div>
        <div>
          <h4>Your <em>thesis match</em> this week</h4>
          <p>Based on your interest in <strong>AI vertical workflow</strong> and <strong>B2B SaaS mid-market</strong>: 0 listings matched your thesis currently. As architects publish verified blueprints, matched opportunities and peer unlock signals will stream here.</p>
          <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/browse" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>Browse opportunities (0) <span className="arrow">→</span></Link>
            <Link href="/list" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', border: '1px solid var(--line)' }}>List an opportunity <span className="arrow">→</span></Link>
          </div>
        </div>
      </div>
    </div>
    <div className="role-show" data-show="architect">
      <div className="insight-callout reveal">
        <div className="ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M12 2v20"/></svg>
        </div>
        <div>
          <h4>Your <em>build signal</em> this week</h4>
          <p>Highest-value gap detected in <strong>RegTech compliance for mid-market</strong>: buyer demand index 84, 0 active listings on vvEntra, benchmark unlock $6,200. <strong>Structure a 90+ page opportunity here to be the first architect to capture this demand.</strong></p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ============================================== */}
{/* SECTION 01 · ROLE-AWARE PRIMARY VIEW */}
{/* ============================================== */}
<section className="dash-section">
  <div className="container">

    {/* INVESTOR · DEAL FLOW + DEMAND CHART */}
    <div className="role-show" data-show="investor">
      <div className="section-head reveal">
        <div className="section-marker"><span className="num">01</span><span className="line"></span><span className="name">Live deal flow &amp; demand</span></div>
      </div>

      <div className="dash-grid deal-flow-grid">
        <div className="card reveal">
          <div className="card-h">
            <h3>Live <em>deal flow</em></h3>
            <span className="sub">Live · streaming</span>
          </div>
          <div className="deal-feed" id="deal-feed">
            <div className="deal-row" style={{"justifyContent":"center","color":"var(--text-faint)","fontSize":".82rem","padding":"2.5rem 1rem","textAlign":"center"}}>No platform listings yet · Real-time deals will stream here as architects publish.</div>
          </div>
        </div>

        <div className="card reveal delay-1">
          <div className="card-h">
            <h3>Buyer <em>demand</em> · 30 days</h3>
            <div className="toggle">
              <button className="active">Demand</button>
              <button>Supply</button>
            </div>
          </div>
          <div className="demand-chart-wrap">
            <div className="demand-chart">
              <svg viewBox="0 0 600 320" preserveAspectRatio="none" id="demand-svg">
                <line className="chart-grid-line" x1="0" y1="60" x2="600" y2="60"/>
                <line className="chart-grid-line" x1="0" y1="120" x2="600" y2="120"/>
                <line className="chart-grid-line" x1="0" y1="180" x2="600" y2="180"/>
                <line className="chart-grid-line" x1="0" y1="240" x2="600" y2="240"/>
                <text className="chart-label" x="0" y="55">High</text>
                <text className="chart-label" x="0" y="245">Low</text>
                <path className="area-fill-2" id="supply-area" d=""/>
                <path className="area-line-2" id="supply-line" d=""/>
                <path className="area-fill" id="demand-area" d=""/>
                <path className="area-line" id="demand-line" d=""/>
              </svg>
            </div>
            <div className="demand-legend">
              <div className="legend-item"><span className="legend-dot orange"></span>Buyer demand</div>
              <div className="legend-item"><span className="legend-dot blue"></span>Architect supply</div>
              <div className="legend-item" style={{"marginLeft":"auto","color":"var(--role)","fontFamily":"'JetBrains Mono',monospace","fontSize":".7rem"}}>Gap: <span style={{"fontWeight":"500"}}>+34%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* HEATMAP */}
      <div className="card reveal delay-2">
        <div className="card-h">
          <h3>Sector · Day <em>activity heatmap</em></h3>
          <span className="meta">Last 7 days · buyer interest intensity</span>
        </div>
        <div className="heatmap-grid" id="heatmap">
          <div className="heatmap-header" />
          {HEATMAP_DAYS.map(day => (
            <div key={day} className="heatmap-header">{day}</div>
          ))}
          {HEATMAP_SECTORS.map((sector, sIdx) => (
            <React.Fragment key={sector}>
              <div className="heatmap-row-label">{sector}</div>
              {HEATMAP_DAYS.map((day, dIdx) => {
                const cellData = HEATMAP_CELLS[sIdx][dIdx];
                return (
                  <div
                    key={day}
                    className="heatmap-cell"
                    data-v={cellData.v}
                    data-tooltip={`${sector} · ${day} · ${cellData.c} signals`}
                  >
                    {cellData.v >= 3 ? cellData.c : ""}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less activity</span>
          <div className="legend-scale">
            <span data-v="0"></span><span data-v="1"></span><span data-v="2"></span><span data-v="3"></span><span data-v="4"></span><span data-v="5"></span>
          </div>
          <span>More activity</span>
        </div>
      </div>
    </div>

    {/* ARCHITECT · DEMAND RADAR + GAP LIST */}
    <div className="role-show" data-show="architect">
      <div className="section-head reveal">
        <div className="section-marker"><span className="num">01</span><span className="line"></span><span className="name">Demand vs supply · where to build</span></div>
      </div>

      <div className="dash-grid">
        <div className="card reveal">
          <div className="card-h">
            <h3>Sector <em>demand radar</em></h3>
            <span className="sub">Live · weekly snapshot</span>
          </div>
          <div className="radar-chart">
            <svg viewBox="0 0 460 380" preserveAspectRatio="xMidYMid meet">
              <circle className="radar-grid" cx="230" cy="190" r="40"/>
              <circle className="radar-grid" cx="230" cy="190" r="80"/>
              <circle className="radar-grid" cx="230" cy="190" r="120"/>
              <circle className="radar-grid" cx="230" cy="190" r="160"/>
              <line className="radar-axis" x1="230" y1="30" x2="230" y2="350"/>
              <line className="radar-axis" x1="70" y1="190" x2="390" y2="190"/>
              <line className="radar-axis" x1="116" y1="76" x2="344" y2="304"/>
              <line className="radar-axis" x1="344" y1="76" x2="116" y2="304"/>
              <polygon className="radar-poly radar-poly-supply" points="230,90 320,140 295,220 200,260 130,225 145,160 175,110 250,80"/>
              <polygon className="radar-poly radar-poly-demand" points="230,50 348,120 330,235 245,310 110,275 85,160 130,80 250,55"/>
              <circle className="radar-dot-pulse" cx="230" cy="50" r="6"/>
              <circle className="radar-dot" cx="230" cy="50" r="4"/>
              <circle className="radar-dot-pulse" cx="348" cy="120" r="6"/>
              <circle className="radar-dot" cx="348" cy="120" r="4"/>
              <circle className="radar-dot" cx="330" cy="235" r="4"/>
              <circle className="radar-dot" cx="245" cy="310" r="4"/>
              <circle className="radar-dot" cx="110" cy="275" r="4"/>
              <circle className="radar-dot" cx="85" cy="160" r="4"/>
              <circle className="radar-dot-pulse" cx="130" cy="80" r="6"/>
              <circle className="radar-dot" cx="130" cy="80" r="4"/>
              <circle className="radar-dot" cx="250" cy="55" r="4"/>
              <text className="radar-label" x="230" y="20" textAnchor="middle">AI Compliance</text>
              <text className="radar-value" x="230" y="32" textAnchor="middle">+28%</text>
              <text className="radar-label" x="395" y="120" textAnchor="start">RegTech</text>
              <text className="radar-value" x="395" y="132" textAnchor="start">+26%</text>
              <text className="radar-label" x="400" y="235" textAnchor="start">Fintech SMB</text>
              <text className="radar-value" x="400" y="247" textAnchor="start">+9%</text>
              <text className="radar-label" x="245" y="335" textAnchor="middle">Healthtech</text>
              <text className="radar-value" x="245" y="347" textAnchor="middle">+12%</text>
              <text className="radar-label" x="60" y="290" textAnchor="end">Climate Tech</text>
              <text className="radar-value" x="60" y="302" textAnchor="end">+18%</text>
              <text className="radar-label" x="35" y="160" textAnchor="end">B2B SaaS</text>
              <text className="radar-value" x="35" y="172" textAnchor="end">+22%</text>
              <text className="radar-label" x="80" y="75" textAnchor="end">AI Agents</text>
              <text className="radar-value" x="80" y="87" textAnchor="end">+24%</text>
              <text className="radar-label" x="250" y="42" textAnchor="middle">Workflow AI</text>
              <text className="radar-value" x="250" y="32" textAnchor="middle">+16%</text>
            </svg>
          </div>
          <div className="demand-legend" style={{"justifyContent":"center"}}>
            <div className="legend-item"><span className="legend-dot orange"></span>Buyer demand</div>
            <div className="legend-item"><span className="legend-dot blue"></span>Architect supply</div>
            <div className="legend-item" style={{"marginLeft":"auto","color":"var(--role)","fontFamily":"'JetBrains Mono',monospace"}}>3 sectors in <strong style={{"fontWeight":"500"}}>surge</strong></div>
          </div>
        </div>

        <div className="card reveal delay-1">
          <div className="card-h">
            <h3>Top <em>opportunity gaps</em></h3>
            <span className="meta">Build here for fastest clearing</span>
          </div>
          <div className="gap-list">
            <div className="gap-row">
              <div className="rank">01</div>
              <div className="info"><span className="nm">RegTech · mid-market</span><span className="meta">Demand 84 · Supply 18 · 12-day clear</span></div>
              <div className="gap-val">+66<small>Gap</small></div>
            </div>
            <div className="gap-row">
              <div className="rank">02</div>
              <div className="info"><span className="nm">AI Agents · vertical ops</span><span className="meta">Demand 92 · Supply 32 · 8-day clear</span></div>
              <div className="gap-val">+60<small>Gap</small></div>
            </div>
            <div className="gap-row">
              <div className="rank">03</div>
              <div className="info"><span className="nm">Healthtech · diagnostics</span><span className="meta">Demand 74 · Supply 28 · 15-day clear</span></div>
              <div className="gap-val">+46<small>Gap</small></div>
            </div>
            <div className="gap-row">
              <div className="rank">04</div>
              <div className="info"><span className="nm">Climate · industrial</span><span className="meta">Demand 68 · Supply 22 · 18-day clear</span></div>
              <div className="gap-val">+46<small>Gap</small></div>
            </div>
            <div className="gap-row">
              <div className="rank">05</div>
              <div className="info"><span className="nm">Fintech SMB · lending</span><span className="meta">Demand 62 · Supply 36 · 11-day clear</span></div>
              <div className="gap-val">+26<small>Gap</small></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ============================================== */}
    {/* WHAT SHOULD I LIST? (interactive recommender) */}
    {/* ============================================== */}
    <div className="wsl-wrap reveal" id="whatToListModule">
      <div className="wsl-head">
        <div className="section-marker"><span className="num">◆</span><span className="line"></span><span className="name">Personalized · for listers</span></div>
        <h3 className="wsl-title">What should you <em>list?</em></h3>
        <p className="wsl-sub">Shape the lens to your situation. We match it against live buyer demand and return the categories worth building.</p>
      </div>

      <div className="wsl-controls">
        <div className="wsl-control">
          <label className="wsl-label">Capital you can deploy to build</label>
          <div className="wsl-options" data-wsl="capital">
            <button className="wsl-opt active" data-val="lean">Lean / bootstrap</button>
            <button className="wsl-opt" data-val="mid">Moderate</button>
            <button className="wsl-opt" data-val="heavy">Well funded</button>
          </div>
        </div>
        <div className="wsl-control">
          <label className="wsl-label">How fast you want it to clear</label>
          <div className="wsl-options" data-wsl="speed">
            <button className="wsl-opt active" data-val="fast">Fastest</button>
            <button className="wsl-opt" data-val="balanced">Balanced</button>
            <button className="wsl-opt" data-val="value">Highest value</button>
          </div>
        </div>
        <div className="wsl-control">
          <label className="wsl-label">Where your edge is</label>
          <div className="wsl-options" data-wsl="domain">
            <button className="wsl-opt active" data-val="any">No preference</button>
            <button className="wsl-opt" data-val="ops">Operations / B2B</button>
            <button className="wsl-opt" data-val="tech">AI / software</button>
            <button className="wsl-opt" data-val="consumer">Consumer / D2C</button>
          </div>
        </div>
      </div>

      <div className="wsl-results">
        <div className="wsl-results-head"><span>Best matches for you</span><span className="wsl-results-meta" id="wslMatchMeta">Ranked by demand, supply gap, and your lens</span></div>
        <div className="wsl-result-list" id="wslResults"></div>
        <div className="wsl-cta">
          <span className="wsl-cta-text" id="wslCtaText">Pick a category and structure a 90+ page opportunity around it.</span>
          <Link href="/onboarding?role=architect" data-route="list" className="btn btn-orange btn-sm">List this opportunity <span className="arrow">→</span></Link>
        </div>
      </div>
    </div>

  </div>
</section>

{/* ============================================== */}
{/* SECTION 02 · ROLE-AWARE SECONDARY VIEW */}
{/* ============================================== */}
<section className="dash-section">
  <div className="container">

    {/* INVESTOR · CAPITAL + VELOCITY + PEER LOOKING */}
    <div className="role-show" data-show="investor">
      <div className="section-head reveal">
        <div className="section-marker"><span className="num">02</span><span className="line"></span><span className="name">Market signals</span></div>
      </div>

      <div className="dash-grid three">
        <div className="card reveal">
          <div className="card-h">
            <h3>Capital <em>deployed</em> · weekly</h3>
            <span className="meta">Total · $0</span>
          </div>
          <div className="deploy-chart">
            <div className="deploy-bar-wrap">
              <div className="deploy-col"><div className="deploy-bar in" style={{"height":"4px"}}><span className="val">$0</span></div><span className="lbl">W1</span></div>
              <div className="deploy-col"><div className="deploy-bar in" style={{"height":"4px"}}><span className="val">$0</span></div><span className="lbl">W2</span></div>
              <div className="deploy-col"><div className="deploy-bar in" style={{"height":"4px"}}><span className="val">$0</span></div><span className="lbl">W3</span></div>
              <div className="deploy-col"><div className="deploy-bar in" style={{"height":"4px"}}><span className="val">$0</span></div><span className="lbl">W4</span></div>
              <div className="deploy-col"><div className="deploy-bar in" style={{"height":"4px"}}><span className="val">$0</span></div><span className="lbl">W5</span></div>
              <div className="deploy-col"><div className="deploy-bar in" style={{"height":"4px"}}><span className="val">$0</span></div><span className="lbl">W6</span></div>
              <div className="deploy-col"><div className="deploy-bar in" style={{"height":"4px"}}><span className="val">$0</span></div><span className="lbl">W7</span></div>
              <div className="deploy-col"><div className="deploy-bar in" style={{"height":"4px"}}><span className="val">$0</span></div><span className="lbl">W8</span></div>
            </div>
          </div>
          <div style={{"fontSize":".72rem","color":"var(--text-muted)","lineHeight":"1.5","paddingTop":".5rem","borderTop":"1px solid var(--line)"}}>No platform transactions yet. Capital flow will display as deals close.</div>
        </div>

        <div className="card reveal delay-1">
          <div className="card-h">
            <h3>Sector <em>velocity</em></h3>
            <span className="meta">Buyer interest · 7d</span>
          </div>
          <div className="velocity-list">
            <div className="velocity-row"><span className="rnk">01</span><span className="nm">AI Compliance</span><span className="spark up"><svg viewBox="0 0 60 22" preserveAspectRatio="none"><path d="M0,18 L10,16 L20,12 L30,8 L40,5 L50,3 L60,2"/></svg></span><span className="change up">+28%</span></div>
            <div className="velocity-row"><span className="rnk">02</span><span className="nm">RegTech</span><span className="spark up"><svg viewBox="0 0 60 22" preserveAspectRatio="none"><path d="M0,17 L10,15 L20,13 L30,9 L40,7 L50,5 L60,3"/></svg></span><span className="change up">+26%</span></div>
            <div className="velocity-row"><span className="rnk">03</span><span className="nm">AI Agents</span><span className="spark up"><svg viewBox="0 0 60 22" preserveAspectRatio="none"><path d="M0,17 L10,14 L20,15 L30,9 L40,7 L50,6 L60,3"/></svg></span><span className="change up">+24%</span></div>
            <div className="velocity-row"><span className="rnk">04</span><span className="nm">B2B SaaS</span><span className="spark up"><svg viewBox="0 0 60 22" preserveAspectRatio="none"><path d="M0,15 L10,13 L20,12 L30,11 L40,8 L50,7 L60,5"/></svg></span><span className="change up">+22%</span></div>
            <div className="velocity-row"><span className="rnk">05</span><span className="nm">Climate Tech</span><span className="spark up"><svg viewBox="0 0 60 22" preserveAspectRatio="none"><path d="M0,16 L10,14 L20,14 L30,12 L40,10 L50,8 L60,7"/></svg></span><span className="change up">+18%</span></div>
            <div className="velocity-row"><span className="rnk">06</span><span className="nm">Workflow AI</span><span className="spark up"><svg viewBox="0 0 60 22" preserveAspectRatio="none"><path d="M0,16 L10,15 L20,13 L30,12 L40,10 L50,9 L60,8"/></svg></span><span className="change up">+16%</span></div>
            <div className="velocity-row"><span className="rnk">12</span><span className="nm">Crypto / Web3</span><span className="spark down"><svg viewBox="0 0 60 22" preserveAspectRatio="none"><path d="M0,8 L10,9 L20,11 L30,13 L40,14 L50,16 L60,18"/></svg></span><span className="change down">−8%</span></div>
          </div>
        </div>

        <div className="card reveal delay-2">
          <div className="card-h">
            <h3>Where <em>peers</em> are looking</h3>
            <span className="meta">Aggregated buyer signals</span>
          </div>
          <div className="velocity-list">
            <div className="velocity-row"><span className="rnk">·</span><span className="nm">Fintech SMB</span><span className="change" style={{"fontSize":".7rem","color":"var(--text-faint)","textAlign":"right"}}>0 views</span><span className="change" style={{"textAlign":"right","color":"var(--text-faint)"}}>0 unlocks</span></div>
            <div className="velocity-row"><span className="rnk">·</span><span className="nm">Healthtech</span><span className="change" style={{"fontSize":".7rem","color":"var(--text-faint)","textAlign":"right"}}>0 views</span><span className="change" style={{"textAlign":"right","color":"var(--text-faint)"}}>0 unlocks</span></div>
            <div className="velocity-row"><span className="rnk">·</span><span className="nm">AI Workflow</span><span className="change" style={{"fontSize":".7rem","color":"var(--text-faint)","textAlign":"right"}}>0 views</span><span className="change" style={{"textAlign":"right","color":"var(--text-faint)"}}>0 unlocks</span></div>
            <div className="velocity-row"><span className="rnk">·</span><span className="nm">D2C Ayurveda</span><span className="change" style={{"fontSize":".7rem","color":"var(--text-faint)","textAlign":"right"}}>0 views</span><span className="change" style={{"textAlign":"right","color":"var(--text-faint)"}}>0 unlocks</span></div>
            <div className="velocity-row"><span className="rnk">·</span><span className="nm">Climate Ind.</span><span className="change" style={{"fontSize":".7rem","color":"var(--text-faint)","textAlign":"right"}}>0 views</span><span className="change" style={{"textAlign":"right","color":"var(--text-faint)"}}>0 unlocks</span></div>
            <div className="velocity-row"><span className="rnk">·</span><span className="nm">Edtech</span><span className="change" style={{"fontSize":".7rem","color":"var(--text-faint)","textAlign":"right"}}>0 views</span><span className="change" style={{"textAlign":"right","color":"var(--text-faint)"}}>0 unlocks</span></div>
          </div>
        </div>
      </div>
    </div>

    {/* ARCHITECT · PRICING + BUYER MIX */}
    <div className="role-show" data-show="architect">
      <div className="section-head reveal">
        <div className="section-marker"><span className="num">02</span><span className="line"></span><span className="name">Pricing &amp; buyer mix</span></div>
      </div>

      <div className="dash-grid">
        <div className="card pricing-card reveal" style={{"padding":"0"}}>
          <div className="pricing-header">
            <h3>Sector <em>pricing benchmarks</em></h3>
            <span className="meta">Avg · last 30 days</span>
          </div>
          <div className="pricing-table-head">
            <span>Sector</span><span>Min</span><span>Avg</span><span>Top</span><span>Trend</span>
          </div>
          <div className="pricing-row">
            <span className="nm">Fintech SMB<small>Lending · Payments</small></span>
            <span className="v">$4.2k</span><span className="price">$7.2k</span><span className="v">$12.4k</span>
            <span className="trend up"><svg viewBox="0 0 60 24" preserveAspectRatio="none"><path d="M0,18 L10,16 L20,14 L30,10 L40,7 L50,5 L60,3"/></svg></span>
          </div>
          <div className="pricing-row">
            <span className="nm">Healthtech<small>Diagnostics · Care</small></span>
            <span className="v">$3.8k</span><span className="price">$6.8k</span><span className="v">$11.2k</span>
            <span className="trend up"><svg viewBox="0 0 60 24" preserveAspectRatio="none"><path d="M0,17 L10,15 L20,14 L30,11 L40,9 L50,7 L60,5"/></svg></span>
          </div>
          <div className="pricing-row">
            <span className="nm">AI Workflow<small>Vertical agents</small></span>
            <span className="v">$2.9k</span><span className="price">$5.4k</span><span className="v">$9.8k</span>
            <span className="trend up"><svg viewBox="0 0 60 24" preserveAspectRatio="none"><path d="M0,18 L10,14 L20,13 L30,10 L40,8 L50,7 L60,4"/></svg></span>
          </div>
          <div className="pricing-row">
            <span className="nm">D2C Ayurveda<small>Wellness · Consumer</small></span>
            <span className="v">$2.6k</span><span className="price">$4.8k</span><span className="v">$8.4k</span>
            <span className="trend up"><svg viewBox="0 0 60 24" preserveAspectRatio="none"><path d="M0,17 L10,16 L20,13 L30,12 L40,10 L50,9 L60,7"/></svg></span>
          </div>
          <div className="pricing-row">
            <span className="nm">Climate Industry<small>Carbon · Industrial</small></span>
            <span className="v">$2.4k</span><span className="price">$4.4k</span><span className="v">$7.8k</span>
            <span className="trend up"><svg viewBox="0 0 60 24" preserveAspectRatio="none"><path d="M0,16 L10,15 L20,13 L30,12 L40,10 L50,9 L60,8"/></svg></span>
          </div>
          <div className="pricing-row">
            <span className="nm">B2B SaaS<small>Mid-market vertical</small></span>
            <span className="v">$1.8k</span><span className="price">$3.2k</span><span className="v">$6.4k</span>
            <span className="trend up"><svg viewBox="0 0 60 24" preserveAspectRatio="none"><path d="M0,15 L10,14 L20,13 L30,11 L40,10 L50,9 L60,8"/></svg></span>
          </div>
        </div>

        <div className="card reveal delay-1">
          <div className="card-h">
            <h3>Who's <em>looking</em> · buyer mix</h3>
            <span className="meta">By sector engagement</span>
          </div>
          <div className="donut-wrap">
            <div className="donut-chart in" id="donut">
              <svg viewBox="0 0 180 180">
                <circle className="donut-track" cx="90" cy="90" r="70" pathLength="360"/>
                <circle className="donut-segment" cx="90" cy="90" r="70" pathLength="360" stroke="#E2571B" style={{["--len" as any]:"0","strokeDasharray":"0 360"}}/>
                <circle className="donut-segment" cx="90" cy="90" r="70" pathLength="360" stroke="#3B82F6" style={{["--len" as any]:"0","strokeDasharray":"0 360","strokeDashoffset":"0"}}/>
                <circle className="donut-segment" cx="90" cy="90" r="70" pathLength="360" stroke="#8B5CF6" style={{["--len" as any]:"0","strokeDasharray":"0 360","strokeDashoffset":"0"}}/>
                <circle className="donut-segment" cx="90" cy="90" r="70" pathLength="360" stroke="#C7A06B" style={{["--len" as any]:"0","strokeDasharray":"0 360","strokeDashoffset":"0"}}/>
                <circle className="donut-segment" cx="90" cy="90" r="70" pathLength="360" stroke="#16A34A" style={{["--len" as any]:"0","strokeDasharray":"0 360","strokeDashoffset":"0"}}/>
              </svg>
              <div className="donut-center">
                <span className="v"><em>0</em></span>
                <span className="lbl">Total buyers</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="donut-legend-item"><span className="swatch" style={{"background":"#E2571B"}}></span><span>PE Directors</span><span className="val">0%</span></div>
              <div className="donut-legend-item"><span className="swatch" style={{"background":"#3B82F6"}}></span><span>VC Partners</span><span className="val">0%</span></div>
              <div className="donut-legend-item"><span className="swatch" style={{"background":"#8B5CF6"}}></span><span>Family Offices</span><span className="val">0%</span></div>
              <div className="donut-legend-item"><span className="swatch" style={{"background":"#C7A06B"}}></span><span>Strategic Buyers</span><span className="val">0%</span></div>
              <div className="donut-legend-item"><span className="swatch" style={{"background":"#16A34A"}}></span><span>Operator-Investors</span><span className="val">0%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

{/* ============================================== */}
{/* SECTION 03 · ROLE-AWARE THIRD VIEW */}
{/* ============================================== */}
<section className="dash-section">
  <div className="container">

    {/* INVESTOR · PEER ACTIVITY + REGIONAL */}
    <div className="role-show" data-show="investor">
      <div className="section-head reveal">
        <div className="section-marker"><span className="num">03</span><span className="line"></span><span className="name">Buyer network signals</span></div>
      </div>
      <div className="dash-grid two-equal">
        <div className="card reveal">
          <div className="card-h">
            <h3>Anonymized <em>peer activity</em></h3>
            <span className="sub">Live · privacy preserved</span>
          </div>
          <div className="looking-grid" id="peer-activity-inv">
            <div className="looking-row" style={{"justifyContent":"center","color":"var(--text-faint)","fontSize":".82rem","padding":"2.5rem 1rem","textAlign":"center"}}>No peer activity yet · Real-time transactions will stream here as buyers engage.</div>
          </div>
        </div>

        <div className="card reveal delay-1">
          <div className="card-h">
            <h3>Regional <em>deal flow</em></h3>
            <span className="meta">By geography · 30 days</span>
          </div>
          <div className="region-bars" id="region-bars-inv">
            <div className="region-row"><span className="nm">India<small>Tier 1 &amp; 2 cities</small></span><div className="region-bar" style={{["--w" as any]:"88%"}}><div className="fill"></div></div><span className="val">88%</span></div>
            <div className="region-row"><span className="nm">North America<small>US, Canada</small></span><div className="region-bar" style={{["--w" as any]:"76%"}}><div className="fill"></div></div><span className="val">76%</span></div>
            <div className="region-row"><span className="nm">Europe<small>UK, EU</small></span><div className="region-bar" style={{["--w" as any]:"62%"}}><div className="fill"></div></div><span className="val">62%</span></div>
            <div className="region-row"><span className="nm">Singapore<small>+SEA hubs</small></span><div className="region-bar" style={{["--w" as any]:"54%"}}><div className="fill"></div></div><span className="val">54%</span></div>
            <div className="region-row"><span className="nm">UAE<small>+GCC</small></span><div className="region-bar" style={{["--w" as any]:"46%"}}><div className="fill"></div></div><span className="val">46%</span></div>
            <div className="region-row"><span className="nm">Australia<small>Sydney, Melbourne</small></span><div className="region-bar" style={{["--w" as any]:"32%"}}><div className="fill"></div></div><span className="val">32%</span></div>
          </div>
        </div>
      </div>
    </div>

    {/* ARCHITECT · FUNNEL + REGIONAL + WHO IS LOOKING */}
    <div className="role-show" data-show="architect">
      <div className="section-head reveal">
        <div className="section-marker"><span className="num">03</span><span className="line"></span><span className="name">Performance &amp; engagement</span></div>
      </div>
      <div className="dash-grid three">
        <div className="card reveal">
          <div className="card-h">
            <h3>Avg listing <em>funnel</em></h3>
            <span className="meta">Senior tier · 30d</span>
          </div>
          <div className="funnel" id="funnel">
            <div className="funnel-stage" style={{["--w" as any]:"4px"}}><span className="lbl">Public previews<small>Tier 0</small></span><div className="funnel-bar-wrap"><div className="funnel-bar"></div></div><span className="count">0</span><span className="rate">0%</span></div>
            <div className="funnel-stage" style={{["--w" as any]:"4px"}}><span className="lbl">Verified access<small>Tier 1</small></span><div className="funnel-bar-wrap"><div className="funnel-bar"></div></div><span className="count">0</span><span className="rate">0%</span></div>
            <div className="funnel-stage" style={{["--w" as any]:"4px"}}><span className="lbl">Interest deposit<small>Tier 2</small></span><div className="funnel-bar-wrap"><div className="funnel-bar"></div></div><span className="count">0</span><span className="rate">0%</span></div>
            <div className="funnel-stage" style={{["--w" as any]:"4px"}}><span className="lbl">NDA signed<small>Tier 3</small></span><div className="funnel-bar-wrap"><div className="funnel-bar"></div></div><span className="count">0</span><span className="rate">0%</span></div>
            <div className="funnel-stage" style={{["--w" as any]:"4px"}}><span className="lbl">Full unlock<small>Tier 4</small></span><div className="funnel-bar-wrap"><div className="funnel-bar"></div></div><span className="count">0</span><span className="rate">0%</span></div>
          </div>
        </div>

        <div className="card reveal delay-1">
          <div className="card-h">
            <h3>Regional <em>demand</em></h3>
            <span className="meta">By geography</span>
          </div>
          <div className="region-bars" id="region-bars-arc">
            <div className="region-row"><span className="nm">India<small>Tier 1 &amp; 2 cities</small></span><div className="region-bar" style={{["--w" as any]:"92%"}}><div className="fill"></div></div><span className="val">92%</span></div>
            <div className="region-row"><span className="nm">North America<small>US, Canada</small></span><div className="region-bar" style={{["--w" as any]:"78%"}}><div className="fill"></div></div><span className="val">78%</span></div>
            <div className="region-row"><span className="nm">Europe<small>UK, EU</small></span><div className="region-bar" style={{["--w" as any]:"65%"}}><div className="fill"></div></div><span className="val">65%</span></div>
            <div className="region-row"><span className="nm">Singapore<small>+SEA hubs</small></span><div className="region-bar" style={{["--w" as any]:"58%"}}><div className="fill"></div></div><span className="val">58%</span></div>
            <div className="region-row"><span className="nm">UAE<small>+GCC</small></span><div className="region-bar" style={{["--w" as any]:"48%"}}><div className="fill"></div></div><span className="val">48%</span></div>
            <div className="region-row"><span className="nm">Australia<small>Sydney</small></span><div className="region-bar" style={{["--w" as any]:"34%"}}><div className="fill"></div></div><span className="val">34%</span></div>
          </div>
        </div>

        <div className="card reveal delay-2">
          <div className="card-h">
            <h3>Live · <em>who's exploring</em></h3>
            <span className="sub">Your sectors</span>
          </div>
          <div className="looking-grid" id="looking-arc">
            <div className="looking-row" style={{"justifyContent":"center","color":"var(--text-faint)","fontSize":".82rem","padding":"2.5rem 1rem","textAlign":"center"}}>No active buyer sessions yet · Real-time buyer signals will stream here.</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

{/* ============================================== */}
{/* SECTION 04 · PERSONALIZED PICKS / PROMPTS */}
{/* ============================================== */}
<section className="picks-section">
  <div className="container">

    {/* INVESTOR PICKS (EMPTY WHEN NONE PUBLISHED) */}
    <div className="role-show" data-show="investor">
      <div className="section-head reveal" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '680px' }}>
          <div className="section-marker"><span className="num">04</span><span className="line"></span><span className="name">Matched to your thesis</span></div>
          <h2 className="display md">Personalized <em>picks</em> · based on your unlock history.</h2>
          <p>The matching engine surfaces opportunities likely to fit your investment thesis based on past unlocks, search filters, and stated sector interest.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/browse" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>Browse catalog (0) <span className="arrow">→</span></Link>
          <Link href="/list" className="btn btn-ghost" style={{ whiteSpace: 'nowrap', border: '1px solid var(--line)' }}>List an opportunity <span className="arrow">→</span></Link>
        </div>
      </div>

      <div className="picks-grid">
        <div className="platform-empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 2rem', border: '1px dashed var(--line)', background: 'var(--card-bg, #0d0d0d)', borderRadius: '12px', width: '100%' }}>
          <span className="empty-value" style={{ display: 'block', fontSize: '2.5rem', fontWeight: 300, color: 'var(--text-faint)', marginBottom: '0.5rem' }}>0</span>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.5rem' }}>No published opportunities yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.25rem' }}>Approved listings will appear automatically when they are published.</p>
          <Link href="/list" className="btn btn-outline">List an opportunity <span className="arrow">→</span></Link>
        </div>
      </div>
    </div>

    {/* ARCHITECT PROMPTS */}
    <div className="role-show" data-show="architect">
      <div className="section-head reveal">
        <div className="section-marker"><span className="num">04</span><span className="line"></span><span className="name">What to build next</span></div>
        <h2 className="display md">Build <em>prompts</em> · matched to your expertise.</h2>
        <p>Curated opportunity prompts based on demand gaps, your sector experience, and what serious buyers are actively searching for. Each prompt shows expected pricing and clearing time.</p>
      </div>

      <div className="picks-grid">
        <div className="pick-card reveal">
          <span className="match-badge">🔥 Surge</span>
          <div className="pick-head">
            <span className="tag">RegTech</span>
            <span className="tag">Mid-market</span>
          </div>
          <h3 className="pick-title">RegTech compliance for mid-market manufacturing</h3>
          <div className="pick-reason">Demand index 84 · 0 active listings on vvEntra · High buyer demand.</div>
          <div className="pick-meta">
            <span className="pages">120-140p · 8-10 frameworks</span>
            <span className="price">~$6,200</span>
          </div>
        </div>

        <div className="pick-card reveal delay-1">
          <span className="match-badge">High Match</span>
          <div className="pick-head">
            <span className="tag">AI Agents</span>
            <span className="tag">Vertical Ops</span>
          </div>
          <h3 className="pick-title">Industry-specific AI agent for legal operations</h3>
          <div className="pick-reason">Family Offices and Strategic Buyers looking in AI legal · 0 active listings on vvEntra.</div>
          <div className="pick-meta">
            <span className="pages">100-120p · 7-9 frameworks</span>
            <span className="price">~$5,800</span>
          </div>
        </div>

        <div className="pick-card reveal delay-2">
          <span className="match-badge">Underserved</span>
          <div className="pick-head">
            <span className="tag">Healthtech</span>
            <span className="tag">Diagnostics</span>
          </div>
          <h3 className="pick-title">Tier-2 India diagnostics network playbook</h3>
          <div className="pick-reason">Underserved category · 0 active listings on vvEntra · Target tier-2 healthcare.</div>
          <div className="pick-meta">
            <span className="pages">130-150p · 9-11 frameworks</span>
            <span className="price">~$7,400</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

{/* FOOTER */}

      </main>

      <Footer />
    </>
  );
}

const HEATMAP_SECTORS = [
  "AI Compliance", "RegTech", "AI Agents", "B2B SaaS", "Climate Tech",
  "Workflow AI", "Healthtech", "Fintech SMB", "D2C Wellness", "Edtech"
];
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HEATMAP_CELLS = [
  // AI Compliance (sIdx 0)
  [{ v: 5, c: 114 }, { v: 4, c: 88 }, { v: 5, c: 104 }, { v: 5, c: 112 }, { v: 4, c: 92 }, { v: 2, c: 42 }, { v: 1, c: 28 }],
  // RegTech (sIdx 1)
  [{ v: 4, c: 86 }, { v: 5, c: 98 }, { v: 4, c: 84 }, { v: 4, c: 90 }, { v: 5, c: 106 }, { v: 2, c: 38 }, { v: 2, c: 34 }],
  // AI Agents (sIdx 2)
  [{ v: 5, c: 108 }, { v: 4, c: 82 }, { v: 5, c: 96 }, { v: 4, c: 78 }, { v: 5, c: 118 }, { v: 3, c: 54 }, { v: 1, c: 24 }],
  // B2B SaaS (sIdx 3)
  [{ v: 4, c: 92 }, { v: 4, c: 84 }, { v: 4, c: 88 }, { v: 5, c: 102 }, { v: 4, c: 80 }, { v: 2, c: 44 }, { v: 2, c: 36 }],
  // Climate Tech (sIdx 4)
  [{ v: 3, c: 68 }, { v: 4, c: 76 }, { v: 3, c: 62 }, { v: 3, c: 70 }, { v: 4, c: 74 }, { v: 1, c: 26 }, { v: 1, c: 22 }],
  // Workflow AI (sIdx 5)
  [{ v: 3, c: 64 }, { v: 3, c: 72 }, { v: 4, c: 78 }, { v: 3, c: 66 }, { v: 4, c: 82 }, { v: 2, c: 36 }, { v: 1, c: 20 }],
  // Healthtech (sIdx 6)
  [{ v: 3, c: 58 }, { v: 3, c: 60 }, { v: 3, c: 64 }, { v: 4, c: 72 }, { v: 3, c: 56 }, { v: 1, c: 22 }, { v: 0, c: 14 }],
  // Fintech SMB (sIdx 7)
  [{ v: 2, c: 44 }, { v: 2, c: 48 }, { v: 3, c: 52 }, { v: 2, c: 42 }, { v: 2, c: 46 }, { v: 1, c: 18 }, { v: 0, c: 12 }],
  // D2C Wellness (sIdx 8)
  [{ v: 1, c: 32 }, { v: 2, c: 38 }, { v: 1, c: 28 }, { v: 2, c: 36 }, { v: 2, c: 40 }, { v: 1, c: 16 }, { v: 0, c: 10 }],
  // Edtech (sIdx 9)
  [{ v: 1, c: 26 }, { v: 1, c: 30 }, { v: 2, c: 34 }, { v: 1, c: 24 }, { v: 2, c: 32 }, { v: 0, c: 12 }, { v: 0, c: 8 }]
];

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
