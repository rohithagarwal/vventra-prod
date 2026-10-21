"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PlaybookPage() {
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
    localStorage.setItem("vve-role", newRole);
    document.documentElement.setAttribute("data-role", newRole);
  };

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="playbook" className="page playbook-page">
        <div className="container" style={{ maxWidth: "1000px", paddingTop: "5rem", paddingBottom: "6rem", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          <div className="section-head reveal in" style={{ marginBottom: "3rem" }}>
            <div className="section-marker">
              <span className="num">06</span>
              <span className="line"></span>
              <span className="name">Operating Playbook</span>
            </div>
            <h1 className="display lg">
              Built like a <em>private exchange.</em>
            </h1>
            <p className="lead" style={{ maxWidth: "640px" }}>
              Four disciplined stages. Every listing earns its place. Every buyer is verified before access. Confidentiality is engineered into every layer.
            </p>
          </div>

          <div className="how-grid reveal delay-1 in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            <div className="how-step card" style={{ padding: "2rem", background: "var(--card-bg, #111)", border: "1px solid var(--line)" }}>
              <span className="how-num" style={{ font: "700 1.2rem 'JetBrains Mono', monospace", color: "var(--orange)", display: "block", marginBottom: "1rem" }}>01</span>
              <h4 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "var(--text)" }}>Submit</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                Architects submit structured opportunities. Minimum 90 pages of operational depth. Business model, execution system, workflows, frameworks, risk maps, market intelligence. Effort is the first filter.
              </p>
            </div>

            <div className="how-step card" style={{ padding: "2rem", background: "var(--card-bg, #111)", border: "1px solid var(--line)" }}>
              <span className="how-num" style={{ font: "700 1.2rem 'JetBrains Mono', monospace", color: "var(--orange)", display: "block", marginBottom: "1rem" }}>02</span>
              <h4 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "var(--text)" }}>Validate</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                Every listing reviewed by vvEntra moderation. Duplicate checks. Depth audits. Quality benchmarking. Only opportunities that meet the bar go live. Shallow ideas do not reach buyers.
              </p>
            </div>

            <div className="how-step card" style={{ padding: "2rem", background: "var(--card-bg, #111)", border: "1px solid var(--line)" }}>
              <span className="how-num" style={{ font: "700 1.2rem 'JetBrains Mono', monospace", color: "var(--orange)", display: "block", marginBottom: "1rem" }}>03</span>
              <h4 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "var(--text)" }}>Discover</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                Verified buyers browse curated opportunities. Public previews show positioning, sector, scale, documentation depth, never the core IP. Confidentiality layers protect what matters.
              </p>
            </div>

            <div className="how-step card" style={{ padding: "2rem", background: "var(--card-bg, #111)", border: "1px solid var(--line)" }}>
              <span className="how-num" style={{ font: "700 1.2rem 'JetBrains Mono', monospace", color: "var(--orange)", display: "block", marginBottom: "1rem" }}>04</span>
              <h4 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", color: "var(--text)" }}>Unlock</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                Buyer requests deeper access. Seller reviews buyer profile and seriousness. NDA-gated unlock begins. From there: acquire, collaborate, execute, or partner long-term.
              </p>
            </div>
          </div>

          <div className="reveal delay-2 in" style={{ marginTop: "4rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/pricing" className="btn btn-orange">
              See fee mechanics <span className="arrow">→</span>
            </Link>
            <Link href="/terms" className="btn btn-outline">
              Review platform terms <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
