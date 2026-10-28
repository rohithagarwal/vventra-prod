"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  fetchOpportunities,
  subscribeToOpportunitiesRealtime,
  OpportunityItem as BackendOpportunity,
} from "@/lib/api/opportunities";

interface OpportunityItem {
  id: string;
  code: string;
  industry: string;
  stage: "execution" | "validated" | "concept";
  stageLabel: string;
  status: "available" | "review";
  statusLabel: string;
  tags: string[];
  title: string;
  hook: string;
  capital: string;
  timeToLaunch: string;
  trustScore: number;
  listedDaysAgo: number;
  priceNum: number;
  unlockPrice: string;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "saas", label: "SaaS" },
  { id: "fintech", label: "Fintech" },
  { id: "services", label: "Professional Services" },
  { id: "marketplace", label: "Marketplace" },
  { id: "climate", label: "Climate" },
  { id: "ai", label: "AI" },
  { id: "health", label: "Health & Wellness" },
  { id: "industrial", label: "Industrial" },
];

function toDisplayOpp(b: BackendOpportunity): OpportunityItem {
  const isExecution = (b.doc_depth_pages || 0) >= 120;
  const isValidated = (b.readiness_score || 0) >= 70;
  const stage = isExecution ? "execution" : isValidated ? "validated" : "concept";
  const stageLabel = isExecution ? "Execution-Ready" : isValidated ? "Validated Thesis" : "Early Concept";

  const isAvail = b.status === "active";
  const status = isAvail ? "available" : "review";
  const statusLabel = isAvail ? "Available" : "In Review";

  const tags = [b.sector ? b.sector.toUpperCase() : "VENTURE"];
  if (b.category) tags.push(b.category);

  const daysAgo = b.created_at
    ? Math.max(0, Math.floor((Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const dealSize = Number(b.deal_size) || 0;
  const unlockFee = Number(b.unlock_fee) || 0;

  return {
    id: b.id,
    code: b.code || "VVE-OPP",
    industry: (b.sector || "saas").toLowerCase(),
    stage,
    stageLabel,
    status,
    statusLabel,
    tags,
    title: b.title,
    hook: b.headline || b.summary || "Structured institutional opportunity with verified documentation.",
    capital: dealSize > 0 ? `$${Math.round(dealSize).toLocaleString("en-US")}` : "$50,000 – $100,000",
    timeToLaunch: b.timeline || "60–90 days",
    trustScore: b.readiness_score || 92,
    listedDaysAgo: daysAgo,
    priceNum: unlockFee,
    unlockPrice: unlockFee > 0 ? `$${Math.round(unlockFee).toLocaleString("en-US")}` : "$450",
  };
}

export default function BrowsePage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("trust");
  const [rawOpportunities, setRawOpportunities] = useState<BackendOpportunity[]>([]);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  // Load opportunities from backend database
  const loadOpportunities = useCallback(async () => {
    try {
      const items = await fetchOpportunities({
        sector: activeFilter !== "all" ? activeFilter : undefined,
        status: "active",
        sort_by: sortBy,
      });
      setRawOpportunities(items);
    } catch {
      // Backend offline or empty, keep empty state
      setRawOpportunities([]);
    }
  }, [activeFilter, sortBy]);

  useEffect(() => {
    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || "investor";
    setRole(savedRole);

    loadOpportunities();

    // Subscribe to live Real-Time SSE updates from the backend
    const unsubscribe = subscribeToOpportunitiesRealtime({
      onCreated: (newOpp) => {
        setRawOpportunities((prev) => {
          if (prev.some((x) => x.id === newOpp.id)) return prev;
          return [newOpp, ...prev];
        });
        setRealtimeNotification(`⚡ Real-time update: New opportunity "${newOpp.title}" just published!`);
        setTimeout(() => setRealtimeNotification(null), 5000);
      },
      onUpdated: (updatedOpp) => {
        setRawOpportunities((prev) =>
          prev.map((item) => (item.id === updatedOpp.id ? updatedOpp : item))
        );
        setRealtimeNotification(`⚡ Real-time update: "${updatedOpp.title}" was updated.`);
        setTimeout(() => setRealtimeNotification(null), 5000);
      },
      onDeleted: ({ id }) => {
        setRawOpportunities((prev) => prev.filter((item) => item.id !== id));
        setRealtimeNotification(`⚡ Real-time update: An opportunity was unlisted.`);
        setTimeout(() => setRealtimeNotification(null), 5000);
      },
    });

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

    return () => {
      unsubscribe();
      revealIO.disconnect();
    };
  }, [loadOpportunities]);

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
  };

  const displayList = useMemo(() => {
    return rawOpportunities.map(toDisplayOpp);
  }, [rawOpportunities]);

  const filtered = useMemo(() => {
    let result = displayList.filter((item) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "ai") {
        return item.tags.some((t) => t.toLowerCase().includes("ai")) || item.industry === "ai";
      }
      return item.industry === activeFilter;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "trust") return b.trustScore - a.trustScore;
      if (sortBy === "price-low") return a.priceNum - b.priceNum;
      if (sortBy === "price-high") return b.priceNum - a.priceNum;
      if (sortBy === "newest") return a.listedDaysAgo - b.listedDaysAgo;
      return 0;
    });

    return result;
  }, [displayList, activeFilter, sortBy]);

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="browse" className="page browse-page">
        {/* REALTIME TOAST ALERT */}
        {realtimeNotification && (
          <div
            style={{
              position: "fixed",
              top: "5rem",
              right: "2rem",
              zIndex: 9999,
              background: "var(--role)",
              color: "#fff",
              padding: "0.75rem 1.25rem",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              fontSize: "0.88rem",
              fontWeight: 500,
              animation: "fadeIn 0.3s ease",
            }}
          >
            {realtimeNotification}
          </div>
        )}

        {/* BROWSE HEADER */}
        <header className="container-wide browse-header">
          <Link
            className="workspace-return"
            id="browseOverviewReturn"
            href="/dashboard"
            data-route="dashboard"
          >
            Back to your overview
          </Link>
          <span className="eyebrow reveal in">The marketplace</span>
          <h1 className="display lg reveal delay-1 in">
            Curated opportunities, <em>structured for serious capital</em>.
          </h1>
          <p className="browse-sub reveal delay-2 in">
            Every opportunity below has been verified, documentation-reviewed, and structured to
            vvEntra&apos;s standard. Browse freely. Unlock only what earns your attention.
          </p>
        </header>

        {/* FILTER BAR */}
        <div className="container-wide browse-toolbar reveal in">
          <div className="browse-filters" id="browseFilters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`bfilter ${activeFilter === f.id ? "active" : ""}`}
                data-filter={f.id}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="browse-sort">
            <span className="browse-count" id="browseCount">
              {filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"}
            </span>
            <select
              className="browse-select"
              id="browseSort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort opportunities"
            >
              <option value="trust">Sort: Trust score</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
              <option value="newest">Newest listed</option>
            </select>
          </div>
        </div>

        {/* OPPORTUNITY GRID */}
        {filtered.length > 0 ? (
          <div className="container-wide browse-grid" id="browseGrid">
            {filtered.map((opp, idx) => (
              <Link
                key={opp.id}
                href={`/listing?id=${opp.id}`}
                data-route="listing"
                className={`opp-card reveal in delay-${idx % 3}`}
                data-industry={opp.industry}
                data-trust={opp.trustScore}
                data-price={opp.priceNum}
                data-listed={opp.listedDaysAgo}
              >
                <div className="opp-card-top">
                  <span className={`opp-stage ${opp.stage}`}>{opp.stageLabel}</span>
                  <span className={`opp-status ${opp.status}`}>{opp.statusLabel}</span>
                </div>

                <div className="opp-tags">
                  {opp.tags.map((tag) => (
                    <span key={tag} className="opp-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="opp-title">{opp.title}</h2>
                <p className="opp-hook">{opp.hook}</p>
                <div className="opp-divider" />

                <div className="opp-metrics">
                  <div className="opp-metric">
                    <span className="om-label">Capital</span>
                    <span className="om-val">{opp.capital}</span>
                  </div>
                  <div className="opp-metric">
                    <span className="om-label">Time to launch</span>
                    <span className="om-val">{opp.timeToLaunch}</span>
                  </div>
                </div>

                <div className="opp-card-foot">
                  <div className="opp-architect">
                    <span className="oa-avatar">A</span>
                    <div className="oa-info">
                      <span className="oa-name">Verified Architect</span>
                      <span className="oa-trust">Trust {opp.trustScore}</span>
                    </div>
                  </div>
                  <div className="opp-price">
                    <span className="op-unlock">{opp.unlockPrice}</span>
                    <span className="op-label">to unlock</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div
            className="container-wide browse-empty platform-empty-state"
            id="browseEmpty"
            style={{
              display: "block",
              textAlign: "center",
              padding: "4rem 2rem",
              border: "1px dashed var(--line-strong)",
              background: "var(--bg-paper)",
              borderRadius: "12px",
              margin: "2rem auto",
            }}
          >
            <span
              className="empty-value"
              style={{
                display: "block",
                fontSize: "2.5rem",
                fontWeight: 300,
                color: "var(--role)",
                marginBottom: "0.5rem",
              }}
            >
              0
            </span>
            <h3 style={{ fontSize: "1.25rem", color: "var(--text)", marginBottom: "0.5rem" }}>
              No published opportunities yet
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.92rem",
                maxWidth: "460px",
                margin: "0 auto 1.5rem",
              }}
            >
              Approved listings will appear automatically when they are published.
            </p>
            <Link href="/list" className="btn btn-outline">
              List an opportunity <span className="arrow">→</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
