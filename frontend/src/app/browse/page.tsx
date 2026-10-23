"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface OpportunityItem {
  id: string;
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

const OPPORTUNITIES_DATA: OpportunityItem[] = [
  {
    id: "opp-1",
    industry: "ecommerce",
    stage: "execution",
    stageLabel: "Execution-Ready",
    status: "available",
    statusLabel: "Available",
    tags: ["E-Commerce", "AI Automation"],
    title: "Autonomous Backend Operations System for Mid-Market E-Commerce Brands",
    hook: "A documented operational intelligence system that removes the founder from backend work in under 90 days.",
    capital: "$28K – $56K",
    timeToLaunch: "60–90 days",
    trustScore: 87,
    listedDaysAgo: 3,
    priceNum: 28000,
    unlockPrice: "$2,800",
  },
  {
    id: "opp-2",
    industry: "saas",
    stage: "validated",
    stageLabel: "Validated Thesis",
    status: "available",
    statusLabel: "Available",
    tags: ["B2B SaaS", "Fintech"],
    title: "Compliance Copilot for Mid-Market Fintechs",
    hook: "An embedded compliance review engine that compresses 14-day vendor reviews into a 36-hour structured workflow, validated with nine design partners.",
    capital: "$42K – $68K",
    timeToLaunch: "5–7 months",
    trustScore: 91,
    listedDaysAgo: 1,
    priceNum: 42000,
    unlockPrice: "$4,200",
  },
  {
    id: "opp-3",
    industry: "services",
    stage: "execution",
    stageLabel: "Execution-Ready",
    status: "available",
    statusLabel: "Available",
    tags: ["Professional Services", "AI & Legal"],
    title: "Structured Tax Memo Generation for Accounting Firms",
    hook: "An automated research and drafting system that produces audit-defensible tax position memos in 40 minutes instead of six hours.",
    capital: "$22K – $38K",
    timeToLaunch: "45–60 days",
    trustScore: 89,
    listedDaysAgo: 5,
    priceNum: 22000,
    unlockPrice: "$2,200",
  },
  {
    id: "opp-4",
    industry: "marketplace",
    stage: "execution",
    stageLabel: "Execution-Ready",
    status: "review",
    statusLabel: "In Review",
    tags: ["Marketplace", "Home Services"],
    title: "Verified Contractor Marketplace for Residential Repairs",
    hook: "A trust-first marketplace connecting homeowners with vetted local contractors, with instant structured quotes and escrow-backed milestones.",
    capital: "$35K – $75K",
    timeToLaunch: "90–120 days",
    trustScore: 83,
    listedDaysAgo: 2,
    priceNum: 35000,
    unlockPrice: "$3,500",
  },
  {
    id: "opp-5",
    industry: "fintech",
    stage: "execution",
    stageLabel: "Execution-Ready",
    status: "available",
    statusLabel: "Available",
    tags: ["Fintech", "B2B"],
    title: "Embedded Treasury Management for SMB Platforms",
    hook: "A white-label treasury and yield layer that vertical SaaS platforms can embed to monetise idle customer balances, with full compliance scaffolding.",
    capital: "$50K – $90K",
    timeToLaunch: "6–8 months",
    trustScore: 88,
    listedDaysAgo: 4,
    priceNum: 50000,
    unlockPrice: "$5,000",
  },
  {
    id: "opp-6",
    industry: "ecommerce",
    stage: "concept",
    stageLabel: "Early Concept",
    status: "available",
    statusLabel: "Available",
    tags: ["E-Commerce", "Sustainability"],
    title: "Zero-Waste Subscription Commerce System",
    hook: "A curated subscription model for sustainable consumer goods, with supplier vetting frameworks and a content-led retention engine.",
    capital: "$15K – $30K",
    timeToLaunch: "60 days",
    trustScore: 72,
    listedDaysAgo: 6,
    priceNum: 15000,
    unlockPrice: "$1,500",
  },
];

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

export default function BrowsePage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("trust");

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

  const filtered = useMemo(() => {
    let result = OPPORTUNITIES_DATA.filter((item) => {
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
  }, [activeFilter, sortBy]);

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="browse" className="page browse-page">
        {/* BROWSE HEADER */}
        <header className="container-wide browse-header">
          <Link
            className="workspace-return"
            id="browseOverviewReturn"
            href="/dashboard"
            data-route="dashboard"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
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
                href="/listing"
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
          <div className="container-wide browse-empty" id="browseEmpty" style={{ display: "block" }}>
            <p>No opportunities match this filter yet. Try another category.</p>
            <button
              type="button"
              className="bfilter active"
              style={{ marginTop: "1rem" }}
              onClick={() => setActiveFilter("all")}
            >
              Reset to all sectors
            </button>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
