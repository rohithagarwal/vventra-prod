"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface FaqItem {
  id: string;
  question: string;
  answerHtml: string;
}

interface FaqCategory {
  num: string;
  titleHtml: string;
  rawTitle: string;
  count: string;
  items: FaqItem[];
}

interface FaqTrack {
  id: "buyer" | "architect";
  intro: {
    titleHtml: string;
    text: string;
  };
  categories: FaqCategory[];
}

const FAQ_DATA: Record<"buyer" | "architect", FaqTrack> = {
  "buyer": {
    "id": "buyer",
    "intro": {
      "titleHtml": "For <em>buyers and investors</em>",
      "text": "You have capital, execution capacity, and a thesis. What you need is conviction-ready opportunities and a process you can trust. These answers walk through how vvEntra protects your money and helps you make better unlock decisions."
    },
    "categories": [
      {
        "num": "01",
        "titleHtml": "Getting <em>started</em>",
        "rawTitle": "Getting started",
        "count": "5 questions",
        "items": [
          {
            "id": "buyer-0-0",
            "question": "Who is vvEntra built for as a buyer?",
            "answerHtml": "vvEntra is built for <strong>operators, investors, founders, and strategic buyers</strong> who command capital and execution capacity but lack the time to research and validate opportunities from scratch. If you're a PE director, family office principal, VC partner, serial founder, or corporate strategist looking for execution-ready business opportunities outside your existing deal flow, this platform is built for you. We are <em>not</em> built for first-time investors, hobbyists, or anyone looking for \"ideas to brainstorm with friends.\""
          },
          {
            "id": "buyer-0-1",
            "question": "How do I get access? Is this open or invitation-only?",
            "answerHtml": "vvEntra is currently in <strong>private launch</strong>. Access is by application or by referral from an existing member. The application reviews your professional background, deployment capacity, and intent. We're intentionally selective because the architects who list here only do so because the buyer pool is verified. Expect a 3-5 business day review of your application. Some applicants receive immediate approval; others may be asked for additional verification."
          },
          {
            "id": "buyer-0-2",
            "question": "What does \"buyer capacity verification\" actually require?",
            "answerHtml": "We need proof that you have realistic capacity to act on opportunities you unlock. Acceptable forms include: <ul><li>A recent bank statement showing minimum balance equivalent to typical deal sizes</li><li>A letter from your CA or auditor confirming investment capacity</li><li>Company registration documents if you're a registered fund or family office</li><li>LinkedIn verification of your role (CEO, Partner, Director at firm)</li><li>For institutional buyers: GST/PAN and entity verification</li></ul>This is not a wealth check. It's a <em>seriousness filter</em>. We're confirming you can credibly transact, not how much you're worth."
          },
          {
            "id": "buyer-0-3",
            "question": "Does it cost anything to join as a buyer?",
            "answerHtml": "Joining as a verified buyer is <strong>free</strong>. You pay only when you unlock an opportunity. There is no subscription, no monthly fee, no annual membership. You pay per transaction. Some premium opportunities may carry additional deposit requirements, and the Tier 2 interest deposit is refundable. The only cost of access is the one-time KYC verification process."
          },
          {
            "id": "buyer-0-4",
            "question": "How do I find the right opportunities for my thesis?",
            "answerHtml": "Three ways. <strong>First</strong>, browse the marketplace filtered by sector, geography, deal size, and execution stage. <strong>Second</strong>, set up a thesis profile that surfaces matching opportunities in your dashboard as they go live. <strong>Third</strong>, request introductions to senior architects in your target sector, which gives you first-look on opportunities they're preparing to list. Most active buyers use all three."
          }
        ]
      },
      {
        "num": "02",
        "titleHtml": "Payment &amp; <em>trust</em>",
        "rawTitle": "Payment &amp; trust",
        "count": "7 questions",
        "items": [
          {
            "id": "buyer-1-0",
            "question": "How is my money protected when I pay?",
            "answerHtml": "Every payment is held in <em>escrow</em>. Your money is never transferred directly to the architect. It sits in a regulated escrow account operated by vvEntra and our payment partners (Stripe Connect, Razorpay Route, Tazapay for cross-border). The architect only receives funds after your 7-day inspection window closes and you've confirmed satisfaction. If you raise a documented dispute during the window, funds are frozen until vvEntra moderation resolves it. <span class=\"tag\">7-day window</span><span class=\"tag\">Escrow protected</span>"
          },
          {
            "id": "buyer-1-1",
            "question": "What if I pay for an opportunity and it turns out to be junk?",
            "answerHtml": "This is exactly what the dispute mechanism protects against. If the architect <strong>materially misrepresented</strong> the opportunity (less depth than advertised, plagiarised content, false credentials, missing promised sections), you raise a dispute within the 7-day inspection window with specific evidence. vvEntra moderation reviews both sides and issues a decision within 5 business days. If you win the dispute, you receive a full refund. The architect's listing is pulled and their account is flagged. <strong>Note:</strong> Disputes are about <em>misrepresentation</em>, not about whether you personally agree with the strategy."
          },
          {
            "id": "buyer-1-2",
            "question": "Why can't I just pay the full amount and see everything immediately?",
            "answerHtml": "Because that's the model that has killed every previous idea marketplace. Once you've seen the full IP, you cannot un-see it, which makes refunds impossible to administer fairly. The <em>staged reveal</em> exists to protect both sides. You pay progressively as your conviction grows. You can exit at Tier 2 or Tier 3 with proportionally smaller exposure if the opportunity doesn't feel right. By the time you commit the final 70% at Tier 4, you've already seen the business model, market research, and execution roadmap. The unknown is much smaller."
          },
          {
            "id": "buyer-1-3",
            "question": "What payment methods do you accept?",
            "answerHtml": "For Indian buyers: UPI, NEFT, RTGS, IMPS, credit and debit cards, net banking through Razorpay. For international buyers: credit and debit cards (Visa, Mastercard, Amex), ACH (US), SEPA (EU), and wire transfers through Stripe Connect. Cross-border transactions are processed through Tazapay with automatic currency conversion at interbank rates. <strong>We do not accept cryptocurrency</strong> at this stage."
          },
          {
            "id": "buyer-1-4",
            "question": "What's the Tier 2 \"interest deposit\" and what happens to it?",
            "answerHtml": "The Tier 2 interest deposit ($100-500 depending on the opportunity's listed price) is a <strong>refundable signal of serious intent</strong>. You pay it to request deeper access to the opportunity. The architect reviews your buyer profile and decides whether to grant access. If the architect <em>declines</em>, your deposit is automatically refunded within 48 hours. If the architect <em>grants</em> access, your deposit is credited toward your Tier 3 unlock. Either way, you don't lose the money. It exists to filter out tire-kickers."
          },
          {
            "id": "buyer-1-5",
            "question": "Can I get a refund if I just change my mind?",
            "answerHtml": "No. This is the most important policy on the platform, and we say it directly. Refunds are <em>not</em> issued for: changing your mind after viewing content, disagreeing with the strategy, claiming you \"already knew\" the idea, or your investment priorities shifting. Refunds <em>are</em> issued for material misrepresentation by the architect. We hold this line because the opposite policy creates a perverse incentive: buyers consume IP, then claim dissatisfaction, then ask for their money back. That destroys architect trust and would kill the marketplace within a quarter."
          },
          {
            "id": "buyer-1-6",
            "question": "What is the vvEntra Premium Guarantee for buyers?",
            "answerHtml": "On premium-tier deals (typically above $10,000), buyers can opt into the <em>Premium Guarantee</em> for additional protection. As a Premium buyer you receive: priority dispute review by senior moderators, a verified premium badge on your profile, faster architect approval (typically within 4 hours), higher unlock limits per quarter, and priority placement in deal flow recommendations. The Premium tier carries a higher platform commission (18% vs 12%), but for serious capital deployment it's a credible signal to architects that you transact at scale."
          }
        ]
      },
      {
        "num": "03",
        "titleHtml": "Using the <em>platform</em>",
        "rawTitle": "Using the platform",
        "count": "6 questions",
        "items": [
          {
            "id": "buyer-2-0",
            "question": "How do I know if an architect is credible?",
            "answerHtml": "Every architect's profile shows: government ID verification status, bank verification status, exit history with verification, professional background, number of opportunities listed, number successfully closed, average buyer rating, and verified credentials. Senior architects also display LinkedIn-verified employment history and may carry additional badges (ex-McKinsey, ex-Anthropic, etc.). The <em>track record</em> on the platform is itself the strongest signal. An architect with 8 closed deals and a 4.8 rating is far more credible than one with no history, regardless of background claims."
          },
          {
            "id": "buyer-2-1",
            "question": "Can I talk to the architect before I commit to anything?",
            "answerHtml": "Yes, at Tier 1 (verified access, free) you can send <em>structured questions</em> to the architect using templated prompts. At Tier 3 (NDA + partial unlock) full direct conversation opens, including the ability to schedule a call. Direct contact information (email, phone) is only shared at Tier 4 after full unlock. This staged communication exists to protect both sides: architects can't be drowned in unserious inquiries, and buyers always have a channel to ask substantive questions before paying."
          },
          {
            "id": "buyer-2-2",
            "question": "What does \"execution support\" mean for an opportunity?",
            "answerHtml": "Many architects offer optional <strong>execution support</strong> alongside their listed opportunity. This can include: hands-on advisory during the first 90 days of execution, an introduction to operational partners or specialists, technical setup support if the opportunity requires specific tooling, or in some cases, the architect themselves joining as a co-founder or strategic advisor. Execution support is negotiated separately at Tier 4 unlock. It's not included in the listing price by default but is often the most valuable part of the relationship."
          },
          {
            "id": "buyer-2-3",
            "question": "What if I want to acquire the architect's involvement as well?",
            "answerHtml": "This is common with senior architects. After Tier 4 unlock, the relationship between buyer and architect transitions to direct dialogue. You can negotiate any of: equity advisory roles, operational partnerships, co-founder arrangements, or full acquisition of the architect's involvement. These arrangements are handled directly between you and the architect and are not facilitated by vvEntra. Some of our most successful transactions have resulted in the architect becoming a full operating partner with the buyer."
          },
          {
            "id": "buyer-2-4",
            "question": "Is there exclusivity? Can the same opportunity be sold twice?",
            "answerHtml": "Every opportunity is sold to a <strong>single buyer</strong>. Once you complete Tier 4 unlock, the listing is automatically removed from the public marketplace and the architect is contractually prevented from re-listing or selling the same opportunity to anyone else. You receive exclusivity over the documented opportunity and its core IP. The architect may continue to advise on the execution but cannot resell the underlying playbook."
          },
          {
            "id": "buyer-2-5",
            "question": "How do I download the materials after I unlock?",
            "answerHtml": "After Tier 4 unlock, all documents are accessible through your secure <em>vault</em> on the vvEntra dashboard. You can download PDFs, view embedded financial models, and access all frameworks. Some sensitive materials (proprietary tools, code, contracts) may be accessible only through the vault and not downloadable for confidentiality reasons. Your vault access is permanent for any opportunity you've unlocked. You retain access even if you choose to deactivate your account later."
          }
        ]
      },
      {
        "num": "04",
        "titleHtml": "Disputes &amp; <em>edge cases</em>",
        "rawTitle": "Disputes &amp; edge cases",
        "count": "6 questions",
        "items": [
          {
            "id": "buyer-3-0",
            "question": "How exactly do I raise a dispute?",
            "answerHtml": "Within your 7-day inspection window, you click <em>Raise Dispute</em> on the opportunity in your dashboard. You'll be asked to specify: which refund eligibility criterion was violated (with evidence), what was advertised vs what was delivered, any communication with the architect that's relevant. The architect is notified and has 48 hours to respond with counter-evidence. vvEntra moderation reviews both submissions and renders a decision within 5 business days from your initial submission. <span class=\"tag\">Day 0–5</span><span class=\"tag\">5-day SLA</span>"
          },
          {
            "id": "buyer-3-1",
            "question": "What happens if the architect disappears after I pay?",
            "answerHtml": "If the architect becomes unresponsive after your escrow is funded (defined as no response within 7 days of unlock and your direct outreach), vvEntra automatically returns your funds in full. The architect's listing is suspended, their account is flagged, and they lose access until they respond. Because every architect is KYC-verified with a verified Indian or international bank account, fraudulent disappearance is rare. The verification process exists precisely to make this consequence real."
          },
          {
            "id": "buyer-3-2",
            "question": "What if I find out the opportunity has already been executed by someone else?",
            "answerHtml": "This falls under <em>misrepresentation</em>, which is a valid refund cause. If you can demonstrate that the opportunity was already publicly known, executed, or sold elsewhere before you unlocked it, you have grounds for a full refund. Submit evidence: links to the existing execution, dates of prior listings, or public records. vvEntra moderation reviews and if the claim is valid, you receive a refund and the architect's listing is removed. Architects who knowingly list pre-executed opportunities lose platform access permanently."
          },
          {
            "id": "buyer-3-3",
            "question": "Can I dispute the documentation depth vs what was promised?",
            "answerHtml": "Yes, and this is one of the most common valid dispute grounds. The opportunity preview shows documentation metrics (pages, frameworks, financial models). If you unlock and find materially fewer pages, missing frameworks, or absent financial models, that's a refund-eligible discrepancy. <em>Material</em> is defined as 30% or more shortfall vs advertised. Small variations (a few pages short of the listed count) typically don't qualify for full refund but may result in partial refund or platform credit."
          },
          {
            "id": "buyer-3-4",
            "question": "What if I disagree with the dispute outcome?",
            "answerHtml": "You can request a <strong>senior review</strong> within 7 days of the initial decision. A senior moderator (typically with legal or M&amp;A background) re-examines the case with fresh eyes and either upholds or reverses the original decision. Senior review outcomes are final. We do this because consistent dispute decisions are how the platform earns trust over time, but we also recognise the initial review isn't infallible. About 12% of senior reviews reverse the original decision."
          },
          {
            "id": "buyer-3-5",
            "question": "What if my issue isn't covered by the standard refund criteria?",
            "answerHtml": "Reach out to vvEntra support directly. Genuinely unique situations (legal issues, jurisdictional complexity, special circumstances) are reviewed case by case by our operations team. We don't promise refunds for these, but we'll always investigate, communicate transparently about why we can or cannot help, and document the case for future policy improvements. Most edge cases are resolved through platform credit or partial settlement."
          }
        ]
      }
    ]
  },
  "architect": {
    "id": "architect",
    "intro": {
      "titleHtml": "For <em>architects and opportunity creators</em>",
      "text": "You see opportunities that others miss. You structure operational systems, validate markets, and build frameworks. vvEntra is the platform where your intelligence becomes a market. These answers walk through listing, pricing, protection, and how you actually get paid."
    },
    "categories": [
      {
        "num": "01",
        "titleHtml": "Listing &amp; <em>approval</em>",
        "rawTitle": "Listing &amp; approval",
        "count": "6 questions",
        "items": [
          {
            "id": "architect-0-0",
            "question": "Who can become an architect on vvEntra?",
            "answerHtml": "vvEntra is built for <strong>operators, COOs, founders, ex-consultants, sector specialists, and researchers</strong> who can produce execution-ready business opportunities with operational depth. We're not for content creators, blog writers, or anyone repackaging public information. The depth requirement (minimum 90 pages per listing) is the first filter. If you've actually built businesses, run operations, or worked deeply enough in a sector to map its inefficiencies, you'll meet the bar."
          },
          {
            "id": "architect-0-1",
            "question": "What's required for an opportunity to be approved?",
            "answerHtml": "Every listing must include: <ul><li>A business model document (minimum 30 pages)</li><li>Execution system with workflows and SOPs (minimum 25 pages)</li><li>Market research with validated demand signals (minimum 15 pages)</li><li>At least one financial model</li><li>Risk map and mitigation strategy</li><li>An operational roadmap covering at least 24 months</li></ul>Total minimum: <strong>90 pages of operational depth</strong>. Quality reviews check originality, factual accuracy, internal consistency, and execution viability. About 40% of submissions are rejected on first review, usually for shallow depth or generic frameworks."
          },
          {
            "id": "architect-0-2",
            "question": "How long does the approval process take?",
            "answerHtml": "First-time listings typically take <strong>5-7 business days</strong> for moderation review. This includes depth audit, plagiarism check, factual verification, and quality benchmarking. For architects with track record on the platform (3+ successful listings), reviews are expedited to 2-3 business days. If we request changes, you have unlimited revisions but each revision restarts the review clock. Approved listings go live within 24 hours of approval."
          },
          {
            "id": "architect-0-3",
            "question": "What does \"Senior Architect\" status mean and how do I earn it?",
            "answerHtml": "Senior Architect status is earned through track record. The criteria: 3 successfully closed opportunities, average buyer rating of 4.5 or higher, no upheld disputes in your history, and at least 12 months on the platform. Senior Architects receive: priority listing placement, expedited review, higher commission share (90% vs 88% for standard tier), access to private buyer networks for high-value deals, and the verified senior badge that significantly increases buyer trust. Roughly 18% of architects on the platform hold Senior status."
          },
          {
            "id": "architect-0-4",
            "question": "Can I list multiple opportunities at once?",
            "answerHtml": "Yes. Standard architects can have up to 5 active listings simultaneously. Senior architects have no cap. We do recommend focusing on quality over quantity, especially early on. Architects with 10+ shallow listings tend to under-perform architects with 2 deeply-structured ones. The reputation algorithm weighs the average quality of your listings, so a single weak listing can drag down the visibility of your stronger ones."
          },
          {
            "id": "architect-0-5",
            "question": "What if my opportunity is rejected? Can I appeal?",
            "answerHtml": "Rejections come with specific feedback: what was missing, what was inadequate, what needs to be revised. You can address the feedback and resubmit at no cost. If you believe the rejection was incorrect, you can request a <strong>senior moderator review</strong> within 14 days. Senior review either upholds the rejection (with additional reasoning) or overturns it. About 8% of appeals succeed. The process is honest, not adversarial; our goal is to get good opportunities live, not to keep them out."
          }
        ]
      },
      {
        "num": "02",
        "titleHtml": "Pricing &amp; <em>earnings</em>",
        "rawTitle": "Pricing &amp; earnings",
        "count": "6 questions",
        "items": [
          {
            "id": "architect-1-0",
            "question": "How much should I price my opportunity at?",
            "answerHtml": "The vvEntra dashboard shows you sector-specific pricing benchmarks. Average unlock values currently sit at: <strong>Fintech SMB $7.2k, Healthtech $6.8k, AI Workflow $5.4k, D2C Ayurveda $4.8k, Climate Industry $4.4k, B2B SaaS $3.2k</strong>. Your specific price depends on documentation depth, your architect tier, market demand for the sector, and the scale of the opportunity. Underpricing is the most common mistake. A serious 120-page opportunity with financial models should not be priced below $3,000."
          },
          {
            "id": "architect-1-1",
            "question": "What's vvEntra's commission?",
            "answerHtml": "Standard tier: <strong>12% platform commission</strong>. Premium Guarantee tier: <strong>18%</strong> (includes guaranteed settlement, premium positioning, priority dispute support). For Senior Architects, the standard rate drops to 10%. Commission is deducted at settlement, not at unlock. There are no hidden fees, no listing fees, no monthly charges. You see the full commission deducted from your final settlement and the buyer pays the listed price."
          },
          {
            "id": "architect-1-2",
            "question": "When do I actually receive my money?",
            "answerHtml": "Standard tier: Funds release at the end of the buyer's 7-day inspection window, plus 24-48 hours for bank settlement. Total: <strong>8-9 days from buyer's full unlock to your bank account</strong>. Premium Guarantee tier: settlement within <strong>48 hours of unlock</strong>, regardless of any dispute status. The platform absorbs the dispute risk during inspection in exchange for the higher commission. Most architects who handle high-volume or high-value deals use Premium Guarantee for predictable cash flow."
          },
          {
            "id": "architect-1-3",
            "question": "How do I get paid? What payment methods are available?",
            "answerHtml": "For Indian architects: direct bank transfer (NEFT/RTGS) to your verified Indian bank account. International architects: bank transfer (SWIFT/ACH/SEPA depending on geography), Wise transfer (lower fees for smaller amounts), Stripe Express dashboard for US/EU. Cross-border architects can also opt to receive USD or hold balance in vvEntra and withdraw in larger batches to reduce conversion fees. Tax documentation (1099 / Form 16 / equivalent) is auto-generated at year-end."
          },
          {
            "id": "architect-1-4",
            "question": "Can I offer execution support alongside the opportunity for extra income?",
            "answerHtml": "Yes, and this is often where senior architects earn the most. You can list optional <strong>execution support packages</strong> alongside your opportunity: hourly advisory ($150-500/hour), 90-day execution support ($5,000-25,000), or equity-based advisor arrangements. These are negotiated directly with the buyer after Tier 4 unlock and processed through vvEntra (with platform commission). Many of our top-earning architects make 2-3x more from execution support than from the initial unlock."
          },
          {
            "id": "architect-1-5",
            "question": "What about taxes on my earnings?",
            "answerHtml": "You are responsible for all taxes on your vvEntra earnings. We do not deduct TDS or withholding tax at source unless legally required in your jurisdiction. We provide: detailed transaction history exportable as CSV, annual income summary documents, GST invoices where applicable for Indian architects, and Form 1099 / equivalent for US-based architects. Consult your accountant for jurisdiction-specific tax treatment. We strongly recommend keeping a separate bank account for vvEntra income to simplify accounting."
          }
        ]
      },
      {
        "num": "03",
        "titleHtml": "IP <em>protection</em>",
        "rawTitle": "IP protection",
        "count": "5 questions",
        "items": [
          {
            "id": "architect-2-0",
            "question": "How is my IP protected before a buyer pays?",
            "answerHtml": "This is the core architecture of the platform. <strong>Nothing of substance is visible until payment moves into escrow.</strong> Tier 0 (public) shows only sector, scale, depth metrics, your credentials. Tier 1 (free, verified) shows opportunity title and one-paragraph thesis. Tier 2 (refundable deposit) gates the next reveal. Tier 3 (NDA + 30% paid) reveals business model and execution roadmap. Tier 4 (full payment) reveals financial models and proprietary IP. <em>You control what unlocks at each tier.</em> A buyer cannot accidentally see your full opportunity. <span class=\"tag\">NDA gated</span><span class=\"tag\">Staged reveal</span>"
          },
          {
            "id": "architect-2-1",
            "question": "What if a buyer screenshots or downloads my content and shares it?",
            "answerHtml": "Every Tier 3 and Tier 4 access is gated by a binding NDA with documented signatures. Document watermarking embeds the buyer's verified identity into every page they download. If your IP appears elsewhere, you can submit evidence through our IP enforcement channel. Confirmed leaks result in: legal action against the buyer (vvEntra supports with documentation), permanent account suspension, public blacklisting from the platform, and financial penalties as defined in our terms. Real-world precedent: 0 confirmed leak cases in the platform's history. The verification + accountability architecture creates strong deterrence."
          },
          {
            "id": "architect-2-2",
            "question": "Can I reject a buyer who wants access to my opportunity?",
            "answerHtml": "Yes, absolutely. At Tier 2 (when a buyer pays the interest deposit), <strong>you review their profile before access is granted</strong>. You see their verification status, capacity confirmation, transaction history, ratings from other architects, and their stated thesis. If they don't feel right, you decline and their deposit is automatically refunded. There's no penalty for declining buyers. Some architects accept 80% of requests; others accept only 30%. Both approaches work depending on the sensitivity of the opportunity."
          },
          {
            "id": "architect-2-3",
            "question": "Who owns the IP after the buyer unlocks?",
            "answerHtml": "This depends on what you've defined in your listing. By default, vvEntra unlocks transfer <strong>execution rights, not ownership</strong>. The buyer receives the right to execute the opportunity exclusively (you can't sell the same opportunity again), but you retain authorship of the materials. For full IP transfer (including the right to claim the work as their own, modify it, or resell), this is a separate premium listing option with different pricing. Most architects use the standard execution-rights model."
          },
          {
            "id": "architect-2-4",
            "question": "Can I list opportunities anonymously?",
            "answerHtml": "Partially. Your real name is shared only at Tier 4 unlock with the verified buyer. At Tier 0-3, buyers see your <em>architect profile</em> (e.g., \"Senior architect, ex-consulting, 2 successful exits, 4.9 rating\") without your real name. This is standard practice and protects your identity while still allowing buyers to evaluate credibility. Full anonymity (where your name is never revealed) is not supported because it would prevent post-unlock relationships and execution support, which is where most of the value flows."
          }
        ]
      },
      {
        "num": "04",
        "titleHtml": "Disputes &amp; <em>support</em>",
        "rawTitle": "Disputes &amp; support",
        "count": "5 questions",
        "items": [
          {
            "id": "architect-3-0",
            "question": "What happens if a buyer raises a frivolous dispute?",
            "answerHtml": "If a buyer raises a dispute outside our documented refund criteria (e.g., they just don't like the strategy), vvEntra moderation rules in your favor. Funds release to you normally. The buyer's account is flagged. <strong>Repeated frivolous disputes lead to buyer account suspension</strong>. About 6% of all disputes are deemed frivolous. We do this because architect trust is what keeps the marketplace alive. If buyers could refund-fish, no serious architect would list here."
          },
          {
            "id": "architect-3-1",
            "question": "How can I respond to a dispute against my opportunity?",
            "answerHtml": "When a buyer raises a dispute, you receive a notification with their specific claim and any submitted evidence. You have <strong>48 hours to respond</strong> with counter-evidence: documentation of what was advertised vs delivered, communication history showing what the buyer agreed to, evidence of the depth or completeness of your work. vvEntra moderation reviews both submissions and decides within 5 business days from the original dispute submission."
          },
          {
            "id": "architect-3-2",
            "question": "If a dispute is upheld against me, what happens?",
            "answerHtml": "If moderation rules in the buyer's favor: the buyer receives a full refund, your listing is removed from the marketplace, and your architect account is flagged. The flag is visible on your profile until you have 3 subsequent successful transactions. A first upheld dispute is recoverable. Two upheld disputes within 12 months trigger a senior review of your account, and three trigger permanent suspension. This is strict on purpose; serial misrepresentation hurts the entire marketplace."
          },
          {
            "id": "architect-3-3",
            "question": "What if I need help structuring my first opportunity?",
            "answerHtml": "vvEntra offers an optional <em>architect onboarding session</em> for new architects: 30 minutes with a senior architect or platform team member who reviews your draft opportunity and gives structural feedback. Free for first-time architects. We also publish a detailed <strong>Architect Playbook</strong> covering listing structure, pricing strategy, what buyers want to see, and how to position yourself for senior tier. Many of our top architects spent significant time on the first listing and shipped subsequent listings 4-5x faster."
          },
          {
            "id": "architect-3-4",
            "question": "Can I withdraw my opportunity after it's listed?",
            "answerHtml": "Yes, with conditions. You can pause or remove a listing at any time before a buyer reaches Tier 3 (NDA + partial payment). Once a buyer is at Tier 3, you can't withdraw without their agreement, because they've committed financially. If a buyer is at Tier 4, the opportunity is in their unlock window and cannot be withdrawn at all. You're free to delist for any reason: change of strategy, decided to execute it yourself, market shifted. Just communicate clearly through the platform."
          }
        ]
      }
    ]
  }
};

export default function FaqPage() {
  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [activeTab, setActiveTab] = useState<"buyer" | "architect">("buyer");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // 1. Initial role alignment
    const savedRole = (localStorage.getItem("vve-role") as "investor" | "architect") || "investor";
    setRole(savedRole);
    setActiveTab(savedRole === "architect" ? "architect" : "buyer");

    // 2. Observer for global data-role changes (from navbar or system)
    const handleStorage = () => {
      const current = (localStorage.getItem("vve-role") as "investor" | "architect") || "investor";
      setRole(current);
      setActiveTab(current === "architect" ? "architect" : "buyer");
    };
    window.addEventListener("storage", handleStorage);

    // 3. Scroll reveal observer
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
      window.removeEventListener("storage", handleStorage);
      revealIO.disconnect();
    };
  }, []);

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
    const newTab = newRole === "architect" ? "architect" : "buyer";
    setActiveTab(newTab);
    localStorage.setItem("vve-role", newRole);
    document.documentElement.setAttribute("data-role", newRole);
    setSearchQuery("");
    setOpenItems({});
  };

  const handleTabChange = (tab: "buyer" | "architect") => {
    setActiveTab(tab);
    const nextRole = tab === "architect" ? "architect" : "investor";
    setRole(nextRole);
    localStorage.setItem("vve-role", nextRole);
    document.documentElement.setAttribute("data-role", nextRole);
    document.documentElement.classList.toggle("vve-investor", nextRole === "investor");
    setSearchQuery("");
    setOpenItems({});
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
  };

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Active track
  const currentTrack = FAQ_DATA[activeTab];

  // Search filtering
  const query = searchQuery.toLowerCase().trim();

  const filteredCategories = useMemo(() => {
    if (!query) {
      return currentTrack.categories;
    }
    return currentTrack.categories
      .map((cat) => {
        const matchingItems = cat.items.filter((item) => {
          const qText = item.question.toLowerCase();
          // strip html tags for clean text matching
          const aText = item.answerHtml.replace(/<[^>]+>/g, "").toLowerCase();
          return qText.includes(query) || aText.includes(query);
        });
        return {
          ...cat,
          items: matchingItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [currentTrack, query]);

  const totalVisibleQuestions = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="faq" className="page active">
        {/* HERO */}
        <header className="hero">
          <div className="container">
            <div className="hero-content">
              <span className="eyebrow reveal in">Questions answered · honestly</span>
              <h1 className="display xl reveal delay-1 in">
                Everything you need <em>before</em><br />your first transaction.
              </h1>
              <p className="lead reveal delay-2 in">
                vvEntra works differently from any platform you&apos;ve used before. These are the questions every serious buyer and architect asks. Direct answers, no marketing fluff. Pick your side below.
              </p>

              <div className="faq-search reveal delay-3 in">
                <svg className="faq-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16.5" y2="16.5" />
                </svg>
                <input
                  id="faq-search-input"
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search questions"
                />
                <span className="count" id="faq-count">
                  {totalVisibleQuestions} {totalVisibleQuestions === 1 ? "question" : "questions"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* TAB SWITCHER */}
        <section className="tab-section">
          <div className="container-narrow">
            <div className="tabs-wrap" id="tabs-wrap" data-tab={activeTab}>
              <div className="tab-indicator" />
              <button
                type="button"
                className={`tab-btn ${activeTab === "buyer" ? "active" : ""}`}
                data-tab="buyer"
                onClick={() => handleTabChange("buyer")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
                </svg>
                As a Buyer
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "architect" ? "active" : ""}`}
                data-tab="architect"
                onClick={() => handleTabChange("architect")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 3h18M5 3v10a7 7 0 0 0 14 0V3" />
                  <circle cx="12" cy="20" r="1.5" />
                </svg>
                As an Architect
              </button>
            </div>
          </div>
        </section>

        {/* FAQ MAIN */}
        <section className="faq-main">
          <div className="container-narrow">
            {/* ACTIVE TRACK */}
            <div className="faq-track active" id={`track-${activeTab}`}>
              <div className="faq-intro reveal in">
                <div className="ic">
                  {activeTab === "buyer" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 3h18M5 3v10a7 7 0 0 0 14 0V3" />
                      <circle cx="12" cy="20" r="1.5" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 dangerouslySetInnerHTML={{ __html: currentTrack.intro.titleHtml }} />
                  <p>{currentTrack.intro.text}</p>
                </div>
              </div>

              {filteredCategories.map((cat) => (
                <div key={cat.num} className="faq-category">
                  <div className="cat-header">
                    <div className="cat-header-left">
                      <span className="cat-num">{cat.num}</span>
                      <h3 className="cat-title" dangerouslySetInnerHTML={{ __html: cat.titleHtml }} />
                    </div>
                    <span className="cat-count">{cat.items.length} questions</span>
                  </div>

                  <div className="faq-list">
                    {cat.items.map((item) => {
                      const isOpen = !!openItems[item.id];
                      return (
                        <div
                          key={item.id}
                          className={`faq-item ${isOpen ? "open" : ""}`}
                        >
                          <div
                            className="faq-q"
                            onClick={() => toggleItem(item.id)}
                            role="button"
                            tabIndex={0}
                            aria-expanded={isOpen}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleItem(item.id);
                              }
                            }}
                          >
                            <span className="q-text">{item.question}</span>
                            <span className="ic">+</span>
                          </div>
                          <div
                            className="faq-a"
                            dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* NO RESULTS EMPTY STATE */}
            <div className={`no-results ${totalVisibleQuestions === 0 ? "show" : ""}`} id="no-results">
              <h2 className="display lg">
                No questions match <em>your search.</em>
              </h2>
              <p>Try a different keyword, or scroll through the full list above.</p>
            </div>
          </div>
        </section>

        {/* STILL NEED HELP */}
        <section className="contact-section">
          <div className="container-narrow">
            <div className="contact-card reveal in">
              <span className="eyebrow">Still need help?</span>
              <h2 className="display lg">
                Didn&apos;t find your <em>answer?</em>
              </h2>
              <p className="lead" style={{ textAlign: "center" }}>
                We&apos;re a small team and we answer founder-style: directly, quickly, no support-bot routing. Pick the channel that works for you.
              </p>
              <div className="channels">
                <a href="mailto:hello@vventra.com" className="channel">
                  <div className="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </div>
                  <span className="ttl">Email us</span>
                  <span className="desc">hello@vventra.com</span>
                </a>
                <div className="channel" tabIndex={0} role="button">
                  <div className="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <span className="ttl">Live chat</span>
                  <span className="desc">Mon-Sat · 9am-9pm IST</span>
                </div>
                <div className="channel" tabIndex={0} role="button">
                  <div className="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <span className="ttl">Schedule a call</span>
                  <span className="desc">Premium tier · 15 min</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", justifyContent: "center", marginTop: ".5rem" }}>
                <Link className="btn btn-orange" href="/signup">
                  <span className="cta-text">Apply for access</span> <span className="arrow">→</span>
                </Link>
                <Link href="/trust" data-route="trust" className="btn btn-outline">
                  Read trust policy <span className="arrow">→</span>
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
