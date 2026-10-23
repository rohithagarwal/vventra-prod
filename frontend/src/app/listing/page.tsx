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
        <div className="container-wide" style={{ padding: "4rem 1.5rem", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div className="platform-empty-state" style={{ padding: "5rem 2rem", border: "1px dashed var(--line)", background: "var(--card-bg, #0d0d0d)", borderRadius: "16px" }}>
            <span className="empty-value" style={{ display: "block", fontSize: "3rem", fontWeight: 300, color: "var(--text-faint)", marginBottom: "0.75rem" }}>0</span>
            <h1 className="display md" style={{ fontSize: "1.6rem", marginBottom: "0.75rem", color: "var(--text)" }}>No published opportunities yet</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
              Approved listings will appear automatically when they are published. As architects pass moderation, confidential opportunity dossiers will unlock here.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/browse" className="btn btn-outline">Back to marketplace</Link>
              <Link href="/list" className="btn btn-primary">List an opportunity</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
