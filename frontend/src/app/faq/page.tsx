"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function FaqPage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  const faqs = [
    {
      q: "How does vvEntra protect my intellectual property?",
      a: "Everything is mutual NDA-gated. Public previews only reveal market fit, scope, and high-level frameworks without exposing raw proprietary IP. The 10% unlock fee validates buyer seriousness before materials are opened.",
    },
    {
      q: "What does the 10% unlock fee cover?",
      a: "The unlock fee opens the mutual portal, grants 7 days of direct architect communication, and unlocks the complete opportunity dossier. 90% is held in escrow toward the engagement, while 10% covers escrow security.",
    },
    {
      q: "What happens if an opportunity is misrepresented?",
      a: "Disputes can be raised within 7 days. vvEntra conducts platform arbitration. If the delivered documentation materially deviates from the validated table of contents, buyers receive a prompt refund.",
    },
    {
      q: "Who can list opportunities as an architect?",
      a: "Only verified operators, ex-founders, and specialized architects. Every listing undergoes deep review: duplicate checks, depth audits (min. 90 pages equivalent), and quality benchmarking.",
    },
    {
      q: "How do architects get paid?",
      a: "Funds are held in secure escrow and released upon milestone completion or mutual signoff. vvEntra takes a 10% platform facilitation fee; architects receive 90% of the transaction value directly.",
    },
    {
      q: "Can I buy out 100% of the opportunity IP?",
      a: "Yes. vvEntra supports full IP transfer, shared advisory, and minority execution partnership structures. The buyer and architect agree on terms during the 7-day engagement window.",
    },
  ];

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="faq" className="page faq-page">
        <div className="container" style={{ maxWidth: "860px", paddingTop: "5rem", paddingBottom: "6rem", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          <div className="section-head reveal in" style={{ marginBottom: "3rem" }}>
            <div className="section-marker">
              <span className="num">08</span>
              <span className="line"></span>
              <span className="name">Platform FAQ</span>
            </div>
            <h1 className="display lg">
              Frequently asked <em>questions.</em>
            </h1>
            <p className="lead" style={{ maxWidth: "600px" }}>
              Clear answers on intellectual property, the 10% unlock fee, moderation standards, and how transactions settle.
            </p>
          </div>

          <div className="faq-accordion reveal delay-1 in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: "1.5rem 1.75rem",
                    background: "var(--card-bg, #111)",
                    border: "1px solid var(--line)",
                    cursor: "pointer",
                    borderRadius: "8px",
                  }}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 500, margin: 0, color: "var(--text)" }}>
                      {item.q}
                    </h3>
                    <span style={{ fontSize: "1.2rem", color: "var(--orange)", transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s ease" }}>
                      +
                    </span>
                  </div>
                  {isOpen && (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: "1.65", margin: "1rem 0 0" }}>
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="reveal delay-2 in" style={{ marginTop: "4rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/pricing" className="btn btn-outline">
              Review fee mechanics <span className="arrow">→</span>
            </Link>
            <Link href="/terms" className="btn btn-orange">
              Platform terms & policy <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
