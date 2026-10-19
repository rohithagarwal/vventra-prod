"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { resolveAccountDestination } from "@/lib/auth/access";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    if (!localStorage.getItem("vve-access-token")) return;

    void (async () => {
      try {
        const destination = await resolveAccountDestination();
        if (cancelled) return;
        localStorage.setItem("vve-role", destination.role);
        localStorage.setItem("vve-stage", destination.path.startsWith("/dashboard") ? "verified" : "applied");
        window.dispatchEvent(new Event("storage"));
        router.replace(destination.path);
      } catch {
        // The public landing page remains available when session lookup is unavailable.
      }
    })();

    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    // 1. HERO CANVAS (theme-aware)
    let animationFrameId: number;
    const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
    let cleanupCanvas = () => {};

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        let w = 0;
        let h = 0;
        let dpr = 1;
        const nodes: Array<{ x: number; y: number; vx: number; vy: number; r: number }> = [];

        const resize = () => {
          const rect = canvas.getBoundingClientRect();
          dpr = window.devicePixelRatio || 1;
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          ctx.scale(dpr, dpr);
          w = rect.width;
          h = rect.height;
        };

        const initNodes = () => {
          nodes.length = 0;
          for (let i = 0; i < 38; i++) {
            nodes.push({
              x: Math.random() * w,
              y: Math.random() * h,
              vx: (Math.random() - 0.5) * 0.15,
              vy: (Math.random() - 0.5) * 0.15,
              r: Math.random() * 1.35 + 1.05,
            });
          }
        };

        const onResize = () => {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          resize();
          initNodes();
        };

        window.addEventListener("resize", onResize);
        resize();
        initNodes();

        const tick = () => {
          const isDark = document.documentElement.getAttribute("data-theme") === "dark";
          const lineColor = isDark ? "250, 202, 170" : "137, 53, 12";
          const dotColor = isDark ? "rgba(255, 159, 99, 0.86)" : "rgba(194, 67, 14, 0.82)";

          ctx.clearRect(0, 0, w, h);

          for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
              const b = nodes[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < 140) {
                ctx.strokeStyle = `rgba(${lineColor}, ${(1 - d / 140) * (isDark ? 0.26 : 0.22)})`;
                ctx.lineWidth = 0.9;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }

          nodes.forEach((n) => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > w) n.vx *= -1;
            if (n.y < 0 || n.y > h) n.vy *= -1;
            ctx.fillStyle = dotColor;
            ctx.shadowColor = isDark ? "rgba(255, 123, 57, 0.65)" : "rgba(194, 67, 14, 0.35)";
            ctx.shadowBlur = isDark ? 8 : 4;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
          });

          ctx.shadowBlur = 0;
          animationFrameId = requestAnimationFrame(tick);
        };

        tick();

        cleanupCanvas = () => {
          window.removeEventListener("resize", onResize);
          cancelAnimationFrame(animationFrameId);
        };
      }
    }

    // 2. REVEAL OBSERVER
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealIO.observe(el));

    // Stagger hero reveal
    const heroReveals = document.querySelectorAll(".hero .reveal");
    const heroTimeouts: NodeJS.Timeout[] = [];
    heroReveals.forEach((el, i) => {
      heroTimeouts.push(
        setTimeout(() => {
          el.classList.add("in");
        }, 80 + i * 80)
      );
    });

    // 3. SMOOTH SCROLL FOR IN-PAGE ANCHORS
    const anchorHandlers: Array<{ el: Element; handler: (e: Event) => void }> = [];
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const handler = (e: Event) => {
        const href = a.getAttribute("href");
        if (href && href.length > 1) {
          const t = document.querySelector(href);
          if (t) {
            e.preventDefault();
            t.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      };
      a.addEventListener("click", handler);
      anchorHandlers.push({ el: a, handler });
    });

    // 4. BARS CARD OBSERVER (14 sectors)
    const barIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const rows = e.target.querySelectorAll(".bar-wrap");
            rows.forEach((r, i) => setTimeout(() => r.classList.add("in"), i * 70));
            barIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".bars-card").forEach((el) => barIO.observe(el));

    // 5. DEMAND BARS OBSERVER (#ds-rows)
    const dsIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(".ds-bar").forEach((b, i) => setTimeout(() => b.classList.add("in"), i * 60));
            dsIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    const dsRows = document.getElementById("ds-rows");
    if (dsRows) dsIO.observe(dsRows);

    // 6. GAUGE OBSERVER
    const gaugeIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            gaugeIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    const gauge = document.getElementById("gauge");
    if (gauge) gaugeIO.observe(gauge);

    // 7. PULSE GRID WITH LIVE SPARKLINES
    const pulseGrid = document.getElementById("pulse-grid");
    let pulseInterval: NodeJS.Timeout | null = null;
    if (pulseGrid && pulseGrid.children.length === 0) {
      const sectors = [
        { name: "AI Agents", count: 29, dir: "up", delta: 24 },
        { name: "RegTech", count: 18, dir: "up", delta: 26 },
        { name: "B2B SaaS", count: 42, dir: "up", delta: 22 },
        { name: "Climate Tech", count: 11, dir: "up", delta: 18 },
        { name: "Workflow AI", count: 18, dir: "up", delta: 16 },
        { name: "Healthtech", count: 14, dir: "up", delta: 12 },
        { name: "Crypto / Web3", count: 6, dir: "down", delta: -8 },
        { name: "Web3 Gaming", count: 3, dir: "down", delta: -18 },
      ];
      const POINTS = 20;
      const series = sectors.map((s) => {
        const arr: number[] = [];
        let v = 50 + Math.random() * 20;
        for (let i = 0; i < POINTS; i++) {
          v += (Math.random() - 0.5) * 8;
          v = Math.max(20, Math.min(90, v));
          arr.push(v);
        }
        if (s.dir === "up") arr[arr.length - 1] = Math.max(arr[arr.length - 1], arr[0] + 8);
        else arr[arr.length - 1] = Math.min(arr[arr.length - 1], arr[0] - 5);
        return arr;
      });

      const buildPath = (arr: number[]) => {
        const W = 200;
        const H = 36;
        const max = Math.max(...arr);
        const min = Math.min(...arr);
        const range = max - min || 1;
        return arr
          .map((val, i) => {
            const x = (i / (arr.length - 1)) * W;
            const y = H - ((val - min) / range) * (H - 4) - 2;
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" ");
      };

      const buildArea = (arr: number[]) => buildPath(arr) + " L 200 36 L 0 36 Z";

      sectors.forEach((s, idx) => {
        const card = document.createElement("div");
        card.className = "pulse-card";
        card.innerHTML = `
          <div class="row"><span class="name">${s.name}</span><span class="count" id="pulse-count-${idx}">${s.count}</span></div>
          <div class="spark"><svg viewBox="0 0 200 36" preserveAspectRatio="none"><path class="area" id="spark-area-${idx}" d="${buildArea(series[idx])}"/><path id="spark-path-${idx}" d="${buildPath(series[idx])}"/></svg></div>
          <div class="row"><span class="delta ${s.dir}">${s.delta > 0 ? "↑" : "↓"} ${Math.abs(s.delta)}% · 7d</span><span style="font-size:.65rem;color:var(--text-faint);font-family:'JetBrains Mono',monospace;">LIVE</span></div>
        `;
        pulseGrid.appendChild(card);
      });

      pulseInterval = setInterval(() => {
        sectors.forEach((s, idx) => {
          const arr = series[idx];
          arr.shift();
          let next = arr[arr.length - 1] + (Math.random() - 0.45) * 8;
          next = Math.max(20, Math.min(90, next));
          arr.push(next);
          const path = document.getElementById(`spark-path-${idx}`);
          const area = document.getElementById(`spark-area-${idx}`);
          if (path) path.setAttribute("d", buildPath(arr));
          if (area) area.setAttribute("d", buildArea(arr));
          if (Math.random() > 0.7) {
            const cEl = document.getElementById(`pulse-count-${idx}`);
            if (cEl) {
              const dir = Math.random() > 0.3 ? 1 : -1;
              const newCount = Math.max(1, s.count + dir);
              s.count = newCount;
              cEl.innerText = String(newCount);
            }
          }
        });
      }, 2500);
    }

    // 8. MINI CHART IN AUDIENCE CARD
    let miniInterval: NodeJS.Timeout | null = null;
    const miniSvg = document.getElementById("mini-svg");
    if (miniSvg) {
      const path = miniSvg.querySelector(".live-path");
      const area = miniSvg.querySelector(".live-area");
      const W = 240;
      const H = 60;
      const POINTS = 14;
      const arr: number[] = [];
      let v = 30;
      for (let i = 0; i < POINTS; i++) {
        v += (Math.random() - 0.4) * 6;
        v = Math.max(8, Math.min(54, v));
        arr.push(v);
      }
      const buildMini = () => {
        const p = arr
          .map((y, i) => {
            const x = (i / (arr.length - 1)) * W;
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${(H - y).toFixed(1)}`;
          })
          .join(" ");
        if (path) path.setAttribute("d", p);
        if (area) area.setAttribute("d", p + ` L ${W} ${H} L 0 ${H} Z`);
      };
      buildMini();
      miniInterval = setInterval(() => {
        arr.shift();
        let next = arr[arr.length - 1] + (Math.random() - 0.35) * 5;
        next = Math.max(8, Math.min(54, next));
        arr.push(next);
        buildMini();
      }, 2200);
    }

    // 9. INVESTOR ACTIVITY FEED
    const feed = document.getElementById("investor-feed");
    let feedInterval: NodeJS.Timeout | null = null;
    if (feed && feed.children.length === 0) {
      const acts = [
        { role: "PE Director", action: "unlocked", code: "VVE-2438", sector: "D2C Ayurveda" },
        { role: "Family Office", action: "requested access to", code: "VVE-2436", sector: "AI Workflow" },
        { role: "VC Partner", action: "unlocked", code: "VVE-2434", sector: "Fintech SMB" },
        { role: "Operator-Investor", action: "closed deal on", code: "VVE-2425", sector: "Climate Ind." },
        { role: "Strategic Buyer", action: "requested access to", code: "VVE-2437", sector: "B2B SaaS" },
        { role: "Founder", action: "unlocked", code: "VVE-2432", sector: "Climate Industry" },
      ];
      const createFeedRow = (a: { role: string; action: string; code: string; sector: string }) => {
        const d = document.createElement("div");
        d.style.cssText =
          "display:grid;grid-template-columns:1fr auto;gap:.85rem;align-items:center;padding:.55rem 0;border-bottom:1px solid var(--section-dark-line);font-size:.82rem;";
        d.innerHTML = `<div style="display:flex;flex-direction:column;gap:.1rem;"><span style="color:var(--section-dark-text);"><span style="color:var(--role);">${a.role}</span> ${a.action} <span style="font-family:'JetBrains Mono',monospace;color:var(--role);">${a.code}</span></span><span style="font-size:.65rem;color:var(--section-dark-text-faint);letter-spacing:.04em;font-family:'JetBrains Mono',monospace;">${a.sector} · just now</span></div><span class="live-dot" style="color:var(--section-dark-text-muted);"></span>`;
        return d;
      };
      acts.slice(0, 4).forEach((a) => feed.appendChild(createFeedRow(a)));
      let actIdx = 4;
      feedInterval = setInterval(() => {
        const a = acts[actIdx % acts.length];
        actIdx++;
        const r = createFeedRow(a);
        r.style.opacity = "0";
        r.style.transform = "translateY(-8px)";
        r.style.transition = "opacity .5s, transform .5s";
        feed.insertBefore(r, feed.firstChild);
        requestAnimationFrame(() => {
          r.style.opacity = "1";
          r.style.transform = "translateY(0)";
        });
        if (feed.children.length > 4 && feed.lastChild) {
          feed.removeChild(feed.lastChild);
        }
      }, 5500);
    }

    // 10. PREVIEW ACTIVITY TAPE
    const tapeTrack = document.getElementById("tape-track");
    if (tapeTrack && tapeTrack.children.length === 0) {
      const tapeItems = [
        { code: "VVE-2438", text: "D2C ayurveda", delta: "UNLOCKED" },
        { code: "VVE-2437", text: "B2B compliance SaaS", delta: "+12%" },
        { code: "VVE-2440", text: "B2B media · new listing", delta: "LIVE" },
        { code: "VVE-2436", text: "AI agent · vertical ops", delta: "+8%" },
        { code: "VVE-2435", text: "Edtech · MEA reskill", delta: "PENDING" },
        { code: "VVE-2434", text: "SMB lending tier-2", delta: "+22%" },
        { code: "VVE-2429", text: "Creator marketplace", delta: "LIVE" },
        { code: "VVE-2432", text: "Climate industrial", delta: "+14%" },
      ];
      const tapeHtml = tapeItems
        .map(
          (it) =>
            `<span class="tape-item"><span class="code">${it.code}</span><span>${it.text}</span><span class="up">${it.delta}</span><span class="sep"></span></span>`
        )
        .join("");
      tapeTrack.innerHTML = tapeHtml + tapeHtml;
    }

    // 11. INDEX BAR VALUES (Synchronized with live Netlify demo benchmark)
    const setText = (id: string, value: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    setText("ix-index", "20");
    setText("ix-live", "12");
    setText("ix-cap", "$1,100,000");
    setText("ix-avg", "$4,725");
    setText("ix-arch", "10");
    setText("ix-deals", "3");
    setText("ix-architect-chip", "10");
    setText("ix-live-d", "12 live listings");
    setText("ix-cap-d", "Sample capital across 10 investors");
    setText("ix-avg-d", "Average published unlock");
    setText("ix-arch-d", "10 active architects");
    setText("ix-deals-d", "3 deals closed");
    setText("browse-count", "12");

    return () => {
      cleanupCanvas();
      revealIO.disconnect();
      barIO.disconnect();
      dsIO.disconnect();
      gaugeIO.disconnect();
      heroTimeouts.forEach(clearTimeout);
      anchorHandlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
      if (pulseInterval) clearInterval(pulseInterval);
      if (miniInterval) clearInterval(miniInterval);
      if (feedInterval) clearInterval(feedInterval);
    };
  }, []);

  return (
    <>
      <Navbar />
      <main data-page="home" className="page home-page">

<header className="hero">
  <canvas id="hero-canvas"></canvas>
  <div className="container">
    <div className="hero-content">
      <span className="eyebrow reveal">Venture intelligence marketplace · Private launch</span>
      <h1 className="display xl reveal delay-1">Where vision and ventures<br /><em>enter reality.</em></h1>
      <p className="lead reveal delay-2">A private network where execution-ready opportunities meet operators, investors, and founders who can build them. Curated. Verified. Confidential by design.</p>

      <div className="search-bar reveal delay-3">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
        <input className="search-input" type="text" placeholder="Search opportunities by sector, market, or scale..." />
        <span className="search-sep"></span>
        <select className="search-cat">
          <option>All sectors</option><option>SaaS & B2B</option><option>Fintech</option><option>AI & Automation</option>
        </select>
        <button className="search-btn">Discover <span className="arrow">→</span></button>
      </div>

      <div className="hero-quick reveal delay-4">
        <span className="chip">Market <strong>Opening soon</strong></span>
        <span className="chip">Data <strong>Live from listings</strong></span>
        <span className="chip">New <strong id="ix-new-today">0 today</strong></span>
        <span className="chip">Architects <strong id="ix-architect-chip">0</strong></span>
      </div>
    </div>

    <div className="index-bar reveal delay-4">
      <div className="index-inner">
        <div className="index-cell"><span className="nm">vvE Index</span><span className="v"><em id="ix-index">0</em></span><span className="d" id="ix-index-d">Launch phase</span></div>
        <div className="index-cell"><span className="nm">Live Listings</span><span className="v"><em id="ix-live">0</em></span><span className="d" id="ix-live-d">No live listings yet</span></div>
        <div className="index-cell"><span className="nm">Capital In Market</span><span className="v"><em id="ix-cap">$0</em></span><span className="d" id="ix-cap-d">No capital committed</span></div>
        <div className="index-cell"><span className="nm">Avg Unlock</span><span className="v"><em id="ix-avg">$0</em></span><span className="d" id="ix-avg-d">No completed unlocks</span></div>
        <div className="index-cell"><span className="nm">Architects</span><span className="v"><em id="ix-arch">0</em></span><span className="d" id="ix-arch-d">No active architects</span></div>
        <div className="index-cell"><span className="nm">Deals Closed</span><span className="v"><em id="ix-deals">0</em></span><span className="d" id="ix-deals-d">No completed deals</span></div>
      </div>
    </div>
  </div>
</header>

<section id="market" className="market">
  <div className="container">
    <p className="restoration-sample-note">Demo market intelligence · Charts illustrate the original experience. They are not live investment signals.</p>
    <div className="market-head">
      <h3>What's in <em>demand</em> right now</h3>
      <span className="meta">Live · 7-day window</span>
    </div>
    <p className="market-intro">Two views, one story. First, the raw data: every sector ranked by buyer demand. Then, the interpretation: where each sector sits strategically, and what an architect or investor should do about it.</p>

    <div className="reveal">
      <div className="step-label"><span className="stepnum">01</span><span className="stepname">The data</span><span className="stepline"></span></div>
      <h3 className="step-h">Sector growth · <em>ranked by 7-day change.</em></h3>
      <p className="step-sub">Top of the list is where buyer demand is accelerating fastest. Bottom is where it is cooling. Bars extend from zero. Trend lines on the right show the trajectory.</p>

      <div className="bars-card">
        <div className="bars-header">
          <h4>vvE Sector Index · 14 sectors tracked</h4>
          <span className="meta">Live · updated continuously</span>
        </div>
        <div className="bars-table-head">
          <span>#</span><span>Sector</span><span>7-day change</span><span>%</span><span>7d trend</span><span>Opps</span>
        </div>
        <div className="bars-row"><span className="rnk">01</span><span className="nm"><span className="sect">AI Compliance</span><span className="cat">AI · Regulatory</span></span><div className="bar-wrap" style={{ '--w': '46%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+28.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,24 L13,22 L26,18 L40,14 L53,9 L66,5 L80,2"/></svg></span><span className="opps">12</span></div>
        <div className="bars-row"><span className="rnk">02</span><span className="nm"><span className="sect">RegTech</span><span className="cat">Compliance · Audit</span></span><div className="bar-wrap" style={{ '--w': '43%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+26.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,22 L13,20 L26,17 L40,12 L53,11 L66,7 L80,3"/></svg></span><span className="opps">18</span></div>
        <div className="bars-row"><span className="rnk">03</span><span className="nm"><span className="sect">AI Agents</span><span className="cat">AI · Vertical ops</span></span><div className="bar-wrap" style={{ '--w': '40%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+24.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,23 L13,18 L26,20 L40,13 L53,10 L66,8 L80,4"/></svg></span><span className="opps">29</span></div>
        <div className="bars-row"><span className="rnk">04</span><span className="nm"><span className="sect">B2B SaaS</span><span className="cat">Vertical · Mid-market</span></span><div className="bar-wrap" style={{ '--w': '37%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+22.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,20 L13,17 L26,15 L40,14 L53,10 L66,9 L80,6"/></svg></span><span className="opps">42</span></div>
        <div className="bars-row"><span className="rnk">05</span><span className="nm"><span className="sect">Climate Tech</span><span className="cat">Industrial · Carbon</span></span><div className="bar-wrap" style={{ '--w': '30%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+18.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,22 L13,19 L26,18 L40,15 L53,12 L66,9 L80,8"/></svg></span><span className="opps">11</span></div>
        <div className="bars-row"><span className="rnk">06</span><span className="nm"><span className="sect">Workflow AI</span><span className="cat">AI · Automation</span></span><div className="bar-wrap" style={{ '--w': '27%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+16.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,21 L13,20 L26,16 L40,14 L53,13 L66,11 L80,9"/></svg></span><span className="opps">18</span></div>
        <div className="bars-row"><span className="rnk">07</span><span className="nm"><span className="sect">Vertical SaaS</span><span className="cat">Specialty industries</span></span><div className="bar-wrap" style={{ '--w': '24%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+14.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,20 L13,18 L26,17 L40,15 L53,12 L66,12 L80,10"/></svg></span><span className="opps">24</span></div>
        <div className="bars-row"><span className="rnk">08</span><span className="nm"><span className="sect">Healthtech</span><span className="cat">Diagnostics · Care</span></span><div className="bar-wrap" style={{ '--w': '21%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+12.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,19 L13,18 L26,17 L40,15 L53,14 L66,12 L80,11"/></svg></span><span className="opps">14</span></div>
        <div className="bars-row"><span className="rnk">09</span><span className="nm"><span className="sect">Fintech SMB</span><span className="cat">Lending · Payments</span></span><div className="bar-wrap" style={{ '--w': '16%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+9.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,18 L13,17 L26,17 L40,15 L53,15 L66,13 L80,12"/></svg></span><span className="opps">17</span></div>
        <div className="bars-row"><span className="rnk">10</span><span className="nm"><span className="sect">D2C Wellness</span><span className="cat">Consumer · Brand</span></span><div className="bar-wrap" style={{ '--w': '11%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+6.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,17 L13,16 L26,17 L40,15 L53,15 L66,14 L80,13"/></svg></span><span className="opps">13</span></div>
        <div className="bars-row"><span className="rnk">11</span><span className="nm"><span className="sect">Edtech</span><span className="cat">Reskill · Workforce</span></span><div className="bar-wrap" style={{ '--w': '6%' } as React.CSSProperties}><div className="bar-fill up"></div></div><span className="pct up">+3.0%</span><span className="spark up"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,16 L13,15 L26,16 L40,15 L53,16 L66,14 L80,14"/></svg></span><span className="opps">16</span></div>
        <div className="bars-row"><span className="rnk">12</span><span className="nm"><span className="sect">Crypto / Web3</span><span className="cat">Cooling · Out of favor</span></span><div className="bar-wrap" style={{ '--w': '15%' } as React.CSSProperties}><div className="bar-fill dn"></div></div><span className="pct dn">−8.0%</span><span className="spark dn"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,10 L13,11 L26,13 L40,15 L53,16 L66,19 L80,21"/></svg></span><span className="opps">6</span></div>
        <div className="bars-row"><span className="rnk">13</span><span className="nm"><span className="sect">NFT / Web3</span><span className="cat">Declining</span></span><div className="bar-wrap" style={{ '--w': '22%' } as React.CSSProperties}><div className="bar-fill dn"></div></div><span className="pct dn">−12.0%</span><span className="spark dn"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,8 L13,10 L26,12 L40,15 L53,17 L66,20 L80,23"/></svg></span><span className="opps">4</span></div>
        <div className="bars-row"><span className="rnk">14</span><span className="nm"><span className="sect">Web3 Gaming</span><span className="cat">Avoid</span></span><div className="bar-wrap" style={{ '--w': '30%' } as React.CSSProperties}><div className="bar-fill dn"></div></div><span className="pct dn">−18.0%</span><span className="spark dn"><svg viewBox="0 0 80 28" preserveAspectRatio="none"><path className="line" d="M0,5 L13,8 L26,10 L40,14 L53,17 L66,21 L80,24"/></svg></span><span className="opps">3</span></div>
      </div>
    </div>

    <div className="market-divider"></div>

    <div className="reveal">
      <div className="step-label"><span className="stepnum">02</span><span className="stepname">The interpretation</span><span className="stepline"></span></div>
      <h3 className="step-h">Strategic positioning · <em>where to act.</em></h3>
      <p className="step-sub">Same sectors, plotted by growth and activity. Stars are the bet-the-house quadrant. Cash cows are reliable demand. Out-of-favor is the avoid zone. Pulses highlight sectors with the biggest gaps to fill.</p>

      <div className="quad-wrap">
        <div className="quad-card">
          <div className="quad-header">
            <h4>Sector strategic positioning</h4>
            <span className="legend">Quadrant analysis · 7d</span>
          </div>
          <svg className="quad-svg" viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid meet">
            <rect className="quad-bg-tl" x="80" y="40" width="540" height="220"/>
            <rect className="quad-bg-tr" x="620" y="40" width="540" height="220"/>
            <rect className="quad-bg-bl" x="80" y="260" width="540" height="220"/>
            <rect className="quad-bg-br" x="620" y="260" width="540" height="220"/>
            <line className="quad-line" x1="620" y1="40" x2="620" y2="480"/>
            <line className="quad-line" x1="80" y1="260" x2="1160" y2="260"/>
            <text className="quad-zone-title" x="630" y="65">Stars</text>
            <text className="quad-zone-sub" x="630" y="80">Hot demand · fast growth</text>
            <text className="quad-zone-title" x="90" y="65">Rising</text>
            <text className="quad-zone-sub" x="90" y="80">Lower activity · momentum</text>
            <text className="quad-zone-title" x="630" y="290">Cash cows</text>
            <text className="quad-zone-sub" x="630" y="305">Reliable demand · slow growth</text>
            <text className="quad-zone-title" x="90" y="290" fill="#DC2626">Out of favor</text>
            <text className="quad-zone-sub" x="90" y="305">Avoid building here</text>
            <line className="quad-axis" x1="80" y1="480" x2="1160" y2="480"/>
            <line className="quad-axis" x1="80" y1="40" x2="80" y2="480"/>
            <path className="quad-axis-arrow" d="M 1160 480 L 1170 480 M 1166 476 L 1170 480 L 1166 484"/>
            <path className="quad-axis-arrow" d="M 80 40 L 80 30 M 76 34 L 80 30 L 84 34"/>
            <text className="quad-axis-label" x="80" y="498">Slow</text>
            <text className="quad-axis-label" x="620" y="498" textAnchor="middle">Demand growth →</text>
            <text className="quad-axis-label" x="1160" y="498" textAnchor="end">Fast</text>
            <text className="quad-axis-label" x="70" y="480" transform="rotate(-90 70 480)" style={{ textAnchor: 'start' }}>Low</text>
            <text className="quad-axis-label" x="70" y="260" transform="rotate(-90 70 260)" style={{ textAnchor: 'start' }}>Market activity ↑</text>
            <text className="quad-axis-label" x="70" y="40" transform="rotate(-90 70 40)" style={{ textAnchor: 'end' }}>High</text>

            <circle className="quad-dot-pulse" cx="1020" cy="120" r="10"/><circle className="quad-dot star" cx="1020" cy="120" r="10"/><text className="quad-label" x="1035" y="124">AI Agents · +24%</text>
            <circle className="quad-dot star" cx="970" cy="80" r="12"/><text className="quad-label" x="987" y="84">B2B SaaS · +22%</text>
            <circle className="quad-dot-pulse" cx="1100" cy="150" r="7"/><circle className="quad-dot star" cx="1100" cy="150" r="7"/><text className="quad-label" x="1112" y="154">AI Compliance · +28%</text>
            <circle className="quad-dot star" cx="900" cy="180" r="9"/><text className="quad-label" x="914" y="184">Vertical SaaS · +14%</text>
            <circle className="quad-dot star" cx="860" cy="210" r="8"/><text className="quad-label" x="873" y="214">Workflow AI · +16%</text>
            <circle className="quad-dot-pulse" cx="1080" cy="230" r="8"/><circle className="quad-dot star" cx="1080" cy="230" r="8"/><text className="quad-label" x="1093" y="234">RegTech · +26%</text>

            <circle className="quad-dot cash" cx="890" cy="340" r="8"/><text className="quad-label" x="903" y="344">Climate · +18%</text>
            <circle className="quad-dot cash" cx="830" cy="380" r="9"/><text className="quad-label" x="844" y="384">Healthtech · +12%</text>
            <circle className="quad-dot cash" cx="760" cy="400" r="10"/><text className="quad-label" x="775" y="404">Fintech SMB · +9%</text>
            <circle className="quad-dot cash" cx="700" cy="420" r="9"/><text className="quad-label" x="714" y="424">D2C Wellness · +6%</text>
            <circle className="quad-dot cash" cx="660" cy="370" r="9"/><text className="quad-label" x="674" y="374">Marketplaces · +4%</text>
            <circle className="quad-dot cash" cx="630" cy="440" r="8"/><text className="quad-label" x="644" y="444">Edtech · +3%</text>

            <circle className="quad-dot dog" cx="380" cy="410" r="7"/><text className="quad-label" x="392" y="414">Crypto · −8%</text>
            <circle className="quad-dot dog" cx="270" cy="440" r="6"/><text className="quad-label" x="281" y="444">NFT · −12%</text>
            <circle className="quad-dot dog" cx="160" cy="450" r="5"/><text className="quad-label" x="170" y="454">Web3 Gaming · −18%</text>
          </svg>
        </div>

        <div className="quad-side">
          <div className="list-card">
            <h5><span className="ic">↑</span> Top gainers · 7d</h5>
            <div className="list-row"><span className="rnk">01</span><span className="nm">AI Compliance</span><span className="ch up">+28.0%</span></div>
            <div className="list-row"><span className="rnk">02</span><span className="nm">RegTech</span><span className="ch up">+26.0%</span></div>
            <div className="list-row"><span className="rnk">03</span><span className="nm">AI Agents</span><span className="ch up">+24.0%</span></div>
            <div className="list-row"><span className="rnk">04</span><span className="nm">B2B SaaS</span><span className="ch up">+22.0%</span></div>
            <div className="list-row"><span className="rnk">05</span><span className="nm">Climate Tech</span><span className="ch up">+18.0%</span></div>
            <div className="footer">Best categories to <em>build in</em></div>
          </div>

          <div className="list-card">
            <h5><span className="ic">$</span> Highest-paying sectors</h5>
            <div className="list-row"><span className="rnk">01</span><span className="nm">Fintech SMB</span><span className="ch up">$7.2k avg</span></div>
            <div className="list-row"><span className="rnk">02</span><span className="nm">Healthtech</span><span className="ch up">$6.8k avg</span></div>
            <div className="list-row"><span className="rnk">03</span><span className="nm">AI · Workflow</span><span className="ch up">$5.4k avg</span></div>
            <div className="list-row"><span className="rnk">04</span><span className="nm">D2C Ayurveda</span><span className="ch up">$4.8k avg</span></div>
            <div className="list-row"><span className="rnk">05</span><span className="nm">Climate Industry</span><span className="ch up">$4.4k avg</span></div>
            <div className="footer">Where capital is <em>deepest</em></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="demand-section dark">
  <div className="container">
    <div className="section-head reveal">
      <div className="section-marker"><span className="num">02</span><span className="line"></span><span className="name">Demand vs supply</span></div>
      <h2 className="display lg">Where buyer demand is <em>outpacing</em> supply.</h2>
      <p className="lead">Real arbitrage signals. Sectors with high buyer interest and low supply of validated opportunities. This is where architects should build next, and where buyers will pay premium for what does exist.</p>
    </div>

    <div className="demand-grid">
      <div className="demand-card reveal">
        <h5>Buyer demand vs architect supply</h5>
        <div className="ds-head"><span>Sector</span><span>Buyer demand</span><span>Listings supply</span><span style={{ textAlign: 'right' }}>Gap</span></div>
        <div className="ds-rows" id="ds-rows">
          <div className="ds-row"><span className="nm">AI Agents</span><div className="ds-bar demand" style={{ '--w': '92%' } as React.CSSProperties}><div className="fill"></div></div><div className="ds-bar supply" style={{ '--w': '32%' } as React.CSSProperties}><div className="fill"></div></div><span className="gap-v high">+60</span></div>
          <div className="ds-row"><span className="nm">RegTech</span><div className="ds-bar demand" style={{ '--w': '84%' } as React.CSSProperties}><div className="fill"></div></div><div className="ds-bar supply" style={{ '--w': '18%' } as React.CSSProperties}><div className="fill"></div></div><span className="gap-v high">+66</span></div>
          <div className="ds-row"><span className="nm">Healthtech</span><div className="ds-bar demand" style={{ '--w': '74%' } as React.CSSProperties}><div className="fill"></div></div><div className="ds-bar supply" style={{ '--w': '28%' } as React.CSSProperties}><div className="fill"></div></div><span className="gap-v high">+46</span></div>
          <div className="ds-row"><span className="nm">Climate Industry</span><div className="ds-bar demand" style={{ '--w': '68%' } as React.CSSProperties}><div className="fill"></div></div><div className="ds-bar supply" style={{ '--w': '22%' } as React.CSSProperties}><div className="fill"></div></div><span className="gap-v high">+46</span></div>
          <div className="ds-row"><span className="nm">Fintech SMB</span><div className="ds-bar demand" style={{ '--w': '62%' } as React.CSSProperties}><div className="fill"></div></div><div className="ds-bar supply" style={{ '--w': '36%' } as React.CSSProperties}><div className="fill"></div></div><span className="gap-v high">+26</span></div>
          <div className="ds-row"><span className="nm">B2B SaaS</span><div className="ds-bar demand" style={{ '--w': '78%' } as React.CSSProperties}><div className="fill"></div></div><div className="ds-bar supply" style={{ '--w': '74%' } as React.CSSProperties}><div className="fill"></div></div><span className="gap-v">+4</span></div>
          <div className="ds-row"><span className="nm">D2C Wellness</span><div className="ds-bar demand" style={{ '--w': '52%' } as React.CSSProperties}><div className="fill"></div></div><div className="ds-bar supply" style={{ '--w': '58%' } as React.CSSProperties}><div className="fill"></div></div><span className="gap-v low">−6</span></div>
          <div className="ds-row"><span className="nm">Edtech</span><div className="ds-bar demand" style={{ '--w': '38%' } as React.CSSProperties}><div className="fill"></div></div><div className="ds-bar supply" style={{ '--w': '48%' } as React.CSSProperties}><div className="fill"></div></div><span className="gap-v low">−10</span></div>
        </div>
        <p style={{ fontSize: '.72rem', color: 'var(--section-dark-text-faint)', margin: '1rem 0 0', letterSpacing: '.04em', lineHeight: '1.5' }}>Gap = (demand − supply). Positive gaps signal undersupplied opportunities, premium pricing power, faster unlock.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="demand-card reveal delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          <h5>Market sentiment</h5>
          <div className="gauge" id="gauge" style={{ '--len': '195', '--rot': '38deg' } as React.CSSProperties}>
            <svg viewBox="0 0 220 130">
              <path className="gauge-track" d="M 20 110 A 90 90 0 0 1 200 110" pathLength="360"/>
              <path className="gauge-fill" d="M 20 110 A 90 90 0 0 1 200 110" pathLength="360"/>
              <line className="gauge-needle" x1="110" y1="110" x2="110" y2="35"/>
              <circle cx="110" cy="110" r="5" fill="#E2571B"/>
            </svg>
            <span className="value" id="sentiment-val">72</span>
            <span className="label">Greed · expanding</span>
            <span className="descr">Buyer activity high, listings clearing fast, capital deployment accelerating across AI and RegTech.</span>
          </div>
        </div>

        <div className="demand-card reveal delay-2">
          <h5>Live investor activity</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginTop: '.5rem' }} id="investor-feed"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="pulse-section">
  <div className="container">
    <div className="pulse-head">
      <h3>Live sector <em>pulse</em></h3>
      <span className="meta">Real-time · sector activity (last 7 days)</span>
    </div>
    <div className="pulse-grid" id="pulse-grid"></div>
  </div>
</section>

<section className="audience-section">
  <div className="container">
    <div className="section-head center reveal">
      <div className="section-marker"><span className="num">03</span><span className="line"></span><span className="name">Two sides · one network</span><span className="line"></span></div>
      <h2 className="display lg">Which <em>side</em> are you on?</h2>
      <p className="lead" style={{ textAlign: 'center' }}>vvEntra is built for two types of operators. Each side has its own playbook, dashboards, pro tips, and knowledge base. Choose your path.</p>
    </div>

    <div className="audience-grid">
      <a href="#list" data-route="list" className="audience-card reveal">
        <span className="role">— For investors & buyers</span>
        <h3>I have <em>capital.</em> I need conviction-ready opportunities.</h3>
        <p>You command capital, teams, and execution capacity. What you lack is research time. vvEntra surfaces validated opportunities matched to your sector, scale, and conviction.</p>
        <ul>
          <li>Personalised deal flow tuned to your thesis</li>
          <li>Pro tips on evaluation, due diligence, and unlock decisions</li>
          <li>Red flag detection and depth scoring</li>
          <li>Direct intro to senior architects with execution support</li>
        </ul>
        <span className="quote">"Acquire opportunity. Deploy execution."</span>
        <span className="btn btn-outline">Explore investor side <span className="arrow">→</span></span>
      </a>

      <a href="#browse" data-route="browse" className="audience-card reveal delay-1">
        <span className="role">— For architects & opportunity creators</span>
        <h3>I have <em>intelligence.</em> I monetise the thinking.</h3>
        <p>You build systems, identify gaps, and architect opportunities others would not find on their own. But you do not want to run every venture you imagine. vvEntra gives your intelligence a market.</p>
        <ul>
          <li>Real-time market demand signals to guide what to build</li>
          <li>Pro tips on structuring, pricing, and packaging opportunities</li>
          <li>Earnings benchmarks by sector, depth, and architect tier</li>
          <li>Knowledge base on what serious buyers want to see</li>
        </ul>
        <span className="quote">"Sell the thinking. Keep your operating life clean."</span>
        <span className="btn btn-outline">Explore architect side <span className="arrow">→</span></span>
      </a>
    </div>
  </div>
</section>

<section className="preview-section">
  <div className="container">
    <div className="section-head center reveal" style={{ marginBottom: '2.5rem' }}>
      <div className="section-marker"><span className="num">04</span><span className="line"></span><span className="name">Inside vvEntra</span><span className="line"></span></div>
      <h2 className="display lg">A live look at the <em>platform.</em></h2>
      <p className="lead" style={{ textAlign: 'center' }}>This is the architect dashboard. Opportunities flow in, get validated, get matched. Every state visible. Nothing exposed.</p>
    </div>

    <div className="preview-frame reveal delay-1">
      <div className="preview-bar">
        <span className="preview-dot"></span><span className="preview-dot"></span><span className="preview-dot"></span>
        <div className="preview-bar-url">vventra.com / <em>marketplace / live</em></div>
        <span className="live-dot">Live</span>
      </div>
      <div className="preview-body">
        <div className="preview-side">
          <div className="side-brand">
            <svg className="logo-mark sm" viewBox="0 0 64 64" aria-hidden="true">
              <path className="w-fill" d="M14 16 L22 48 L32 28 L42 48 L50 16 L42 16 L37 36 L32 22 L27 36 L22 16 Z"/>
            </svg>
            <span className="brand-wordmark sm"><span className="vv">vv</span><span className="e">Entra</span></span>
          </div>
          <div className="side-section">
            <div className="side-label">Marketplace</div>
            <div className="side-item active"><span className="dot"></span>Live <span className="count" id="side-live">0</span></div>
            <div className="side-item"><span className="dot"></span>In review <span className="count">0</span></div>
            <div className="side-item"><span className="dot"></span>Drafts <span className="count">0</span></div>
            <div className="side-item"><span className="dot"></span>Closed <span className="count">37</span></div>
          </div>
          <div className="side-section">
            <div className="side-label">Account</div>
            <div className="side-item"><span className="dot"></span>Profile</div>
            <div className="side-item"><span className="dot"></span>Vault</div>
            <div className="side-item"><span className="dot"></span>NDAs</div>
            <div className="side-item"><span className="dot"></span>Settings</div>
          </div>
        </div>

        <div className="preview-main">
          <div className="preview-h"><h6>Live opportunities</h6><span className="count" id="preview-count">No active listings</span></div>
          <div className="feed" id="feed">
            <div className="feed-row"><span className="feed-code">VVE-2438</span><div className="feed-info"><span className="feed-title">Indian D2C ayurveda · category build-out</span><span className="feed-meta">127 pages · 9 frameworks · 4 financial models</span></div><span className="feed-price">$4,800</span><span className="feed-status live"></span></div>
            <div className="feed-row"><span className="feed-code">VVE-2437</span><div className="feed-info"><span className="feed-title">B2B SaaS · vertical compliance, US mid-market</span><span className="feed-meta">96 pages · 6 frameworks · 3 financial models</span></div><span className="feed-price">$3,200</span><span className="feed-status live"></span></div>
            <div className="feed-row"><span className="feed-code">VVE-2436</span><div className="feed-info"><span className="feed-title">AI workflow agent · vertical operations</span><span className="feed-meta">112 pages · 8 frameworks · 5 financial models</span></div><span className="feed-price">$5,400</span><span className="feed-status locked"></span></div>
            <div className="feed-row"><span className="feed-code">VVE-2435</span><div className="feed-info"><span className="feed-title">Edtech · senior workforce reskilling, MEA</span><span className="feed-meta">88 pages · 5 frameworks · 3 financial models</span></div><span className="feed-price">$2,900</span><span className="feed-status pending"></span></div>
          </div>
        </div>

        <div className="preview-aside">
          <div className="aside-stat"><span className="label">Today · activity</span><span className="num"><em id="today-act">+12</em></span><span className="delta">↑ 38% vs last 7d</span></div>
          <div>
            <span className="label" style={{ marginBottom: '.5rem', display: 'block' }}>Sector velocity (live)</span>
            <div className="mini-chart"><svg viewBox="0 0 240 60" preserveAspectRatio="none" id="mini-svg"><path className="live-area" d=""/><path className="live-path" d=""/></svg></div>
          </div>
          <div className="aside-stat"><span className="label">Capital represented</span><span className="num"><em id="cap-aside">$42M</em></span><span className="delta">↑ 14% MoM</span></div>
          <div className="aside-stat"><span className="label">Architect tier</span><span className="num">Senior</span><span className="delta" style={{ color: 'var(--role)' }}>2 successful exits</span></div>
        </div>

        <div className="preview-tape">
          <div className="tape-label">Activity</div>
          <div className="tape-track" id="tape-track"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="opportunities">
  <div className="container">
    <div className="section-head reveal" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '680px' }}>
        <div className="section-marker"><span className="num">05</span><span className="line"></span><span className="name">Featured opportunities</span></div>
        <h2 className="display lg">Curated. Verified. <em>Locked by default.</em></h2>
        <p className="lead">Every opportunity has a public preview. The substance is locked. Buyers see structure, depth, and architect credibility before they request access.</p>
      </div>
      <a href="#" className="btn btn-outline">Browse all <span id="browse-count">0</span> <span className="arrow">→</span></a>
    </div>

    <div className="opp-grid">
      <div className="opp-card reveal"><div className="opp-head"><span className="opp-code">VVE-2438</span><span className="opp-tag">D2C · Ayurveda</span><span className="opp-demand-tag">↑ +24% demand</span></div><h3 className="opp-title">Indian D2C <span className="blur">ayurveda category build-out</span></h3><p className="opp-desc">A full category playbook for an under-served wellness vertical with $1.2B TAM growth runway. Operator-grade execution plan with sourcing, branding, and channel strategy already mapped.</p><div className="opp-metrics"><div className="opp-metric"><span className="v">127</span><span className="l">Pages</span></div><div className="opp-metric"><span className="v">9</span><span className="l">Frameworks</span></div><div className="opp-metric"><span className="v">4</span><span className="l">Fin models</span></div></div><div className="opp-foot"><span className="opp-architect"><span className="architect-dot"></span>Senior architect · 2 exits</span><span className="opp-price"><em>$4,800</em></span></div></div>
      <div className="opp-card reveal delay-1"><div className="opp-head"><span className="opp-code">VVE-2437</span><span className="opp-tag">SaaS · Compliance</span><span className="opp-demand-tag">↑ +28% demand</span></div><h3 className="opp-title">B2B SaaS for <span className="blur">vertical compliance, US mid-market</span></h3><p className="opp-desc">An execution-ready compliance automation play for US mid-market manufacturers. Includes ICP, regulatory map, GTM motion, and pricing architecture validated against 47 customer signals.</p><div className="opp-metrics"><div className="opp-metric"><span className="v">96</span><span className="l">Pages</span></div><div className="opp-metric"><span className="v">6</span><span className="l">Frameworks</span></div><div className="opp-metric"><span className="v">3</span><span className="l">Fin models</span></div></div><div className="opp-foot"><span className="opp-architect"><span className="architect-dot"></span>Senior architect · COO bg</span><span className="opp-price"><em>$3,200</em></span></div></div>
      <div className="opp-card reveal delay-2"><div className="opp-head"><span className="opp-code">VVE-2436</span><span className="opp-tag">AI · Workflow</span><span className="opp-demand-tag">🔥 Surging</span></div><h3 className="opp-title">AI workflow agent for <span className="blur">vertical operations</span></h3><p className="opp-desc">Vertical-specific AI workflow agent targeting a high-friction operational layer. Includes prompt engineering library, agent architecture, integration spec, and 24-month commercial roadmap.</p><div className="opp-metrics"><div className="opp-metric"><span className="v">112</span><span className="l">Pages</span></div><div className="opp-metric"><span className="v">8</span><span className="l">Frameworks</span></div><div className="opp-metric"><span className="v">5</span><span className="l">Fin models</span></div></div><div className="opp-foot"><span className="opp-architect"><span className="architect-dot"></span>Senior architect · AI bg</span><span className="opp-price"><em>$5,400</em></span></div></div>
      <div className="opp-card reveal"><div className="opp-head"><span className="opp-code">VVE-2434</span><span className="opp-tag">Fintech · SMB</span><span className="opp-demand-tag">↑ Top paying</span></div><h3 className="opp-title">SMB lending infrastructure for <span className="blur">tier-2 Indian cities</span></h3><p className="opp-desc">A regulatory-grade lending architecture for under-banked SMB segments in tier-2 Indian markets. Includes underwriting model, distribution playbook, and a 36-month capital plan.</p><div className="opp-metrics"><div className="opp-metric"><span className="v">142</span><span className="l">Pages</span></div><div className="opp-metric"><span className="v">11</span><span className="l">Frameworks</span></div><div className="opp-metric"><span className="v">6</span><span className="l">Fin models</span></div></div><div className="opp-foot"><span className="opp-architect"><span className="architect-dot"></span>Senior architect · ex-NBFC</span><span className="opp-price"><em>$7,200</em></span></div></div>
      <div className="opp-card reveal delay-1"><div className="opp-head"><span className="opp-code">VVE-2432</span><span className="opp-tag">Climate · Industry</span><span className="opp-demand-tag">↑ +18% demand</span></div><h3 className="opp-title">Industrial emissions monitoring for <span className="blur">heavy manufacturing</span></h3><p className="opp-desc">A hardware-plus-software stack for emissions monitoring in heavy industry. Includes BOM, supply chain, regulatory pathway, and a clear case for enterprise pilot conversion within 6 months.</p><div className="opp-metrics"><div className="opp-metric"><span className="v">108</span><span className="l">Pages</span></div><div className="opp-metric"><span className="v">7</span><span className="l">Frameworks</span></div><div className="opp-metric"><span className="v">3</span><span className="l">Fin models</span></div></div><div className="opp-foot"><span className="opp-architect"><span className="architect-dot"></span>Senior architect · industrial</span><span className="opp-price"><em>$4,400</em></span></div></div>
      <div className="opp-card reveal delay-2"><div className="opp-head"><span className="opp-code">VVE-2429</span><span className="opp-tag">Marketplace · Niche</span><span className="opp-demand-tag">New</span></div><h3 className="opp-title">Specialty marketplace for <span className="blur">an under-served creator vertical</span></h3><p className="opp-desc">A two-sided marketplace play in a niche creator vertical with proven demand and weak existing infrastructure. Includes both sides of the GTM, take-rate model, and category economics.</p><div className="opp-metrics"><div className="opp-metric"><span className="v">94</span><span className="l">Pages</span></div><div className="opp-metric"><span className="v">7</span><span className="l">Frameworks</span></div><div className="opp-metric"><span className="v">3</span><span className="l">Fin models</span></div></div><div className="opp-foot"><span className="opp-architect"><span className="architect-dot"></span>Senior architect · marketplace</span><span className="opp-price"><em>$3,800</em></span></div></div>
    </div>
  </div>
</section>

<section id="how">
  <div className="container">
    <div className="section-head reveal">
      <div className="section-marker"><span className="num">06</span><span className="line"></span><span className="name">How it works</span></div>
      <h2 className="display lg">Built like a <em>private exchange.</em></h2>
      <p className="lead">Four stages. Every listing earns its place. Every buyer is verified before access. Confidentiality is engineered into every layer.</p>
    </div>
    <div className="how-grid reveal delay-1">
      <div className="how-step"><span className="how-num">01</span><h4>Submit</h4><p>Architects submit structured opportunities. Minimum 90 pages of operational depth. Business model, execution system, workflows, frameworks, risk maps, market intelligence. Effort is the first filter.</p></div>
      <div className="how-step"><span className="how-num">02</span><h4>Validate</h4><p>Every listing reviewed by vvEntra moderation. Duplicate checks. Depth audits. Quality benchmarking. Only opportunities that meet the bar go live. Shallow ideas do not reach buyers.</p></div>
      <div className="how-step"><span className="how-num">03</span><h4>Discover</h4><p>Verified buyers browse curated opportunities. Public previews show positioning, sector, scale, documentation depth, never the core IP. Confidentiality layers protect what matters.</p></div>
      <div className="how-step"><span className="how-num">04</span><h4>Unlock</h4><p>Buyer requests deeper access. Seller reviews buyer profile and seriousness. NDA-gated unlock begins. From there: acquire, collaborate, execute, or partner long-term.</p></div>
    </div>
  </div>
</section>

<section id="trust" className="dark">
  <div className="container">
    <div className="section-head reveal">
      <div className="section-marker"><span className="num">07</span><span className="line"></span><span className="name">Trust architecture</span></div>
      <h2 className="display lg">Built for <em>serious capital.</em></h2>
      <p className="lead">Trust is not a tagline. It is an architecture. Every layer of the platform is designed to filter for seriousness, protect confidentiality, and keep both sides honest.</p>
    </div>
    <div className="trust-grid reveal delay-1">
      <div className="trust-card"><span className="num">— 01</span><h5>Verified members</h5><p>Government ID verification. One-person-one-account policy. No bots. No duplicate identities. Every architect and every buyer is real and accountable.</p></div>
      <div className="trust-card"><span className="num">— 02</span><h5>Curated listings</h5><p>Every opportunity moderated before going live. Depth filtered. Originality checked. Quality benchmarked against the standard the platform demands.</p></div>
      <div className="trust-card"><span className="num">— 03</span><h5>NDA-gated access</h5><p>Confidentiality layers between preview and core IP. Buyers see structure before substance. Sellers control who unlocks what, and when.</p></div>
      <div className="trust-card"><span className="num">— 04</span><h5>Controlled unlock</h5><p>Refund logic weighted toward fairness, not reversals. Repeated negative patterns trigger listing review. Bad actors lose access, on either side.</p></div>
    </div>
  </div>
</section>

<section id="cta" className="final">
  <div className="container">
    <div className="brand-stamp reveal">
      <svg className="logo-mark lg" viewBox="0 0 64 64" aria-hidden="true">
        <path className="w-fill" d="M14 16 L22 48 L32 28 L42 48 L50 16 L42 16 L37 36 L32 22 L27 36 L22 16 Z"/>
      </svg>
    </div>
    <div className="reveal delay-1"><span className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Private launch · By application</span></div>
    <h2 className="display xl reveal delay-2">Enter the <em>network.</em></h2>
    <p className="lead reveal delay-3">vvEntra is in private launch. Access is by application or referral from existing members. We are intentionally selective. We do not scale by volume. We scale by quality.</p>
    <div className="final-ctas reveal delay-3">
      <a href="#apply" data-route="apply" className="btn btn-orange">Apply as an architect <span className="arrow">→</span></a>
      <a href="#apply" data-route="apply" className="btn btn-outline">Apply as an investor <span className="arrow">→</span></a>
    </div>
  </div>
</section>

      </main>
      <Footer />
    </>
  );
}
