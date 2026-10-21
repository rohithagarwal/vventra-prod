"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
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

      <main data-page="terms" className="page terms-page">
        <div className="container terms-container">
          <div className="section-head reveal in" style={{ marginBottom: "3rem" }}>
            <div className="section-marker">
              <span className="num">03</span>
              <span className="line"></span>
              <span className="name">Platform terms</span>
            </div>
            <h1 className="display lg">
              Terms and <em>policy.</em>
            </h1>
            <p className="lead" style={{ maxWidth: "560px" }}>
              These are the rules that govern every interaction on vvEntra. Read them before you participate. By applying for access, you agree to these terms.
            </p>
            <span style={{ fontSize: ".8rem", color: "var(--text-faint)" }}>
              Last updated: June 2026 · Version 1.0
            </span>
          </div>

          <div className="terms-body reveal delay-1 in">
            {/* 01 */}
            <div className="terms-section">
              <div className="terms-section-num">01</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">Platform role</h2>
                <p>
                  vvEntra is a facilitator. We connect opportunity creators with execution-focused buyers and operators. We are not a party to any transaction, investment agreement, or business arrangement made through the platform.
                </p>
                <p>
                  We do not guarantee the success or failure of any opportunity listed. We do not provide investment, legal, or financial advice. Every participant is responsible for conducting their own due diligence before committing capital or entering any agreement.
                </p>
              </div>
            </div>

            {/* 02 */}
            <div className="terms-section">
              <div className="terms-section-num">02</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">Architect responsibility</h2>
                <p>
                  Architects must submit original content. You may not list a business system, model, or blueprint that you do not own or have the right to sell. Duplicate listings of the same core opportunity are prohibited.
                </p>
                <p>
                  All documentation you submit must be accurate to the best of your knowledge. Deliberately misleading buyers, inflating metrics, or misrepresenting the nature of an opportunity is grounds for immediate account removal and forfeiture of any pending payments.
                </p>
                <p>
                  Once a buyer has unlocked your listing, you are expected to engage in good faith: respond to messages within a reasonable timeframe, conduct the agreed meeting within the 7-day window, and provide the documentation package exactly as listed.
                </p>
              </div>
            </div>

            {/* 03 */}
            <div className="terms-section">
              <div className="terms-section-num">03</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">Buyer responsibility</h2>
                <p>
                  Buyers may not copy, redistribute, resell, or repurpose any documentation or IP accessed through vvEntra without a completed full-payment transaction and explicit agreement with the architect. The unlock fee grants access to review materials, not ownership of the IP.
                </p>
                <p>
                  All materials accessed through an unlock are covered by mutual NDA. Buyers agree to maintain confidentiality for a period of no less than 24 months from the date of access.
                </p>
                <p>
                  Buyers who repeatedly unlock and reject without engaging in meetings or providing substantive feedback may have their access reviewed. Patterns of bad-faith engagement will result in account suspension.
                </p>
              </div>
            </div>

            {/* 04 */}
            <div className="terms-section">
              <div className="terms-section-num">04</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">Payment terms</h2>
                <p>
                  All transactions on vvEntra follow a two-stage structure. The unlock fee (10% of the listed price) is required to access documents and open the buyer-seller portal. The remaining amount is committed only after a meeting has been conducted and both parties agree to proceed.
                </p>
                <p>
                  All payments are held in escrow and are not released to the architect until the buyer approves delivery at each milestone. vvEntra takes a platform fee of 10% from each transaction. Architects receive 90% of the agreed engagement value.
                </p>
                <p>
                  Payments are processed in USD. Tax obligations arising from any transaction are the sole responsibility of each party in their respective jurisdictions.
                </p>
              </div>
            </div>

            {/* 05 */}
            <div className="terms-section">
              <div className="terms-section-num">05</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">Refund policy</h2>
                <p>
                  The unlock fee is non-refundable once you have accessed the document package. You are paying for access to confidential strategic material and the architect&apos;s time. The act of opening the portal constitutes access.
                </p>
                <p>
                  A refund of the unlock fee may be granted in the following circumstances only: the document package delivered does not match the table of contents shown pre-unlock, the listing contained materially false or fabricated information, or fraud is confirmed by vvEntra&apos;s review team.
                </p>
                <p>
                  The following are not grounds for a refund: the buyer changes their mind after reviewing the documents, the opportunity is not a fit for the buyer&apos;s current priorities, or the buyer and architect fail to reach agreement on engagement terms.
                </p>
                <p>
                  If a buyer rejects post-unlock and the listing is subsequently unlocked by a second buyer, the first buyer will receive a partial goodwill credit of 5% of their unlock fee. This credit applies to a future unlock on the platform and is not paid out in cash.
                </p>
              </div>
            </div>

            {/* 06 */}
            <div className="terms-section">
              <div className="terms-section-num">06</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">7-day engagement window</h2>
                <p>
                  Once a buyer unlocks an opportunity, both parties have 7 calendar days to conduct a meeting and proceed to terms. If no meeting takes place and no terms are accepted within this window, the offer is automatically cancelled.
                </p>
                <p>
                  The unlock fee is not returned in the event of an automatic cancellation. The listing may re-enter the marketplace at the architect&apos;s discretion. The buyer may submit a new unlock request if the listing becomes available again.
                </p>
                <p>
                  The 7-day clock begins from the moment the unlock payment clears, not from the time the buyer opens the portal.
                </p>
              </div>
            </div>

            {/* 07 */}
            <div className="terms-section">
              <div className="terms-section-num">07</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">Intellectual property</h2>
                <p>
                  Ownership of the opportunity, blueprint, and all associated documentation remains with the architect until a full-payment transaction is completed. Unlocking grants a confidential review licence only.
                </p>
                <p>
                  Upon completion of the full engagement payment, IP transfer terms are governed by the signed agreement between the buyer and architect. vvEntra is not a party to that agreement and does not assume liability for any IP dispute arising from it.
                </p>
                <p>
                  Architects retain the right to list new, original opportunities at any time. Listing the same core opportunity more than once, or listing an opportunity that was previously sold to another buyer, is prohibited.
                </p>
              </div>
            </div>

            {/* 08 */}
            <div className="terms-section">
              <div className="terms-section-num">08</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">Dispute handling</h2>
                <p>
                  Either party may raise a formal dispute within 7 calendar days of a milestone delivery or payment release event. Disputes must be submitted through the platform. Off-platform disputes are not considered by vvEntra.
                </p>
                <p>
                  vvEntra reviews all evidence submitted through the platform: messages, call records, documents, and milestone records. Both parties will be given the opportunity to submit their account before a decision is made.
                </p>
                <p>
                  In the early stage of the platform, vvEntra&apos;s decision is final. Disputed funds remain in escrow until resolution. Resolutions may result in full release to either party or a split based on evidence.
                </p>
              </div>
            </div>

            {/* 09 */}
            <div className="terms-section">
              <div className="terms-section-num">09</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">Account policy</h2>
                <p>
                  Each individual may hold only one vvEntra account. Creating duplicate accounts, sharing credentials, or circumventing the one-person-one-account policy will result in permanent removal of all accounts associated with the individual.
                </p>
                <p>
                  Accounts are non-transferable. You may not sell, assign, or otherwise transfer your vvEntra account or any rights associated with it to any other person or entity.
                </p>
                <p>
                  vvEntra reserves the right to suspend or terminate any account that violates these terms, engages in fraudulent activity, or causes harm to other members of the platform. In cases of termination for cause, pending payments may be forfeited.
                </p>
              </div>
            </div>

            {/* 10 */}
            <div className="terms-section">
              <div className="terms-section-num">10</div>
              <div className="terms-section-content">
                <h2 className="terms-h2">Privacy and data</h2>
                <p>
                  vvEntra collects only the information necessary to operate the platform: account details, verification documents, transaction records, and platform activity. We do not sell your data to third parties.
                </p>
                <p>
                  Verification documents are encrypted in transit and at rest. They are accessed only by the verification team and are not visible to any other user, architect, or buyer on the platform.
                </p>
                <p>
                  Messages, call records, and documents exchanged through the platform are retained for the purpose of dispute resolution. Participants should conduct all material communications through the platform for this reason.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Footer */}
          <div className="terms-footer reveal in">
            <span className="terms-footer-copy">
              © 2026 vvEntra. All rights reserved. These terms are subject to change. Continued use of the platform constitutes acceptance of the current version.
            </span>
            <Link href="/signup" data-route="apply" className="btn btn-orange btn-sm">
              Apply for access <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
