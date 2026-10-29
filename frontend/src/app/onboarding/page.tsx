"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getStoredRegistrationData } from "@/lib/api/auth";
import {
  submitInvestorProfile,
  submitArchitectProfile,
  InvestorProfilePayload,
  ArchitectProfilePayload,
} from "@/lib/api/profile";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<"investor" | "architect">("investor");
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [otherExpertise, setOtherExpertise] = useState("");
  const [intent, setIntent] = useState("");
  const [range, setRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check URL search params first, fallback to storedRegistration / localStorage
    const roleParam = searchParams.get("role");
    const storedRegistration = getStoredRegistrationData();

    if (roleParam === "architect" || roleParam === "investor") {
      setRole(roleParam);
      document.documentElement.setAttribute("data-role", roleParam);
      localStorage.setItem("vve-role", roleParam);
    } else if (storedRegistration?.role) {
      setRole(storedRegistration.role);
      document.documentElement.setAttribute("data-role", storedRegistration.role);
      localStorage.setItem("vve-role", storedRegistration.role);
    } else {
      const savedRole = localStorage.getItem("vve-role") as "investor" | "architect";
      if (savedRole === "architect" || savedRole === "investor") {
        setRole(savedRole);
        document.documentElement.setAttribute("data-role", savedRole);
      }
    }

    // Set applied stage
    localStorage.setItem("vve-stage", "applied");
  }, [searchParams]);

  const config = useMemo(() => {
    const isArchitect = role === "architect";
    return isArchitect
      ? {
          kicker: "Architect account setup",
          aside:
            "A strong profile helps vvEntra review your work and gives verified buyers confidence before they request access.",
          firstCopy:
            "Share the professional details that help reviewers understand your background.",
          secondCopy:
            "Select the areas where you have genuine operating, market, or opportunity-building experience.",
          thirdTitle: "What are you ready to <em>build?</em>",
          thirdCopy:
            "Tell us at a high level. Do not share confidential information at this stage.",
          headline: "Professional headline",
          headlinePlaceholder: "e.g. Former COO, B2B operator",
          intent: "What opportunity do you plan to bring?",
          intentPlaceholder:
            "Describe the type of opportunity, the problem it solves, and the market it serves.",
          range: "Expected documentation depth",
          ranges: [
            "90–120 pages",
            "120–150 pages",
            "150+ pages",
            "I am still planning it",
          ],
          timeline: "When do you expect to submit?",
          timelines: [
            "Within 30 days",
            "Within 3 months",
            "Later this year",
            "I am exploring",
          ],
          chips: [
            "B2B SaaS",
            "AI & automation",
            "Marketplaces",
            "Fintech",
            "Climate & industry",
            "D2C & consumer",
            "Operations",
            "Healthtech",
          ],
        }
      : {
          kicker: "Investor account setup",
          aside:
            "A focused profile helps vvEntra understand the opportunities you are looking to assess and keeps the marketplace relevant.",
          firstCopy:
            "Share the professional details that help us understand your investment or operating background.",
          secondCopy: "Select the sectors and themes you actively follow or support.",
          thirdTitle: "What are you ready to <em>back?</em>",
          thirdCopy:
            "Tell us what you are looking for at a high level. You can refine your criteria later.",
          headline: "Investment or operating focus",
          headlinePlaceholder: "e.g. Growth investor, operator-investor",
          intent: "What kind of opportunities are you looking for?",
          intentPlaceholder:
            "Describe the sectors, stages, or types of opportunities you are interested in reviewing.",
          range: "Typical capital range",
          ranges: [
            "Under $10,000",
            "$10,000 – $50,000",
            "$50,000 – $250,000",
            "$250,000 – $1M",
            "Above $1M",
            "I am exploring",
          ],
          timeline: "When are you looking to deploy?",
          timelines: [
            "Now",
            "Within 3 months",
            "Within 12 months",
            "I am exploring",
          ],
          chips: [
            "B2B SaaS",
            "AI & automation",
            "Marketplaces",
            "Fintech",
            "Climate & industry",
            "D2C & consumer",
            "Operations",
            "Healthtech",
          ],
        };
  }, [role]);

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
    setError("");
  };

  const handleRoleToggle = (newRole: "investor" | "architect") => {
    setRole(newRole);
    document.documentElement.setAttribute("data-role", newRole);
    localStorage.setItem("vve-role", newRole);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      setError("");
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim() || !headline.trim() || !location.trim()) {
        setError("Please complete your name, professional focus, and location to continue.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (selectedChips.length === 0) {
        setError("Choose at least one area of expertise or focus to continue.");
        return;
      }
      setError("");
      setStep(3);
    } else if (step === 3) {
      if (!intent.trim() || !range || !timeline) {
        setError("Complete all three fields so we can tailor your workspace.");
        return;
      }
      setError("");
      setIsSubmitting(true);

      // Construct the exact user profile dictionary as requested
      const profileDictionary: InvestorProfilePayload = {
        full_name: name.trim(),
        focus: headline.trim(),
        location: location.trim(),
        sectors: selectedChips,
        additional_notes: otherExpertise.trim() || null,
        looking_for: intent.trim(),
        capital_range: range,
        deployment_timeline: timeline,
      };

      // Always persist the payload locally in frontend storage
      localStorage.setItem("vve-stage", "applied");
      localStorage.setItem("vve-profile", JSON.stringify(profileDictionary));
      localStorage.setItem("vve-profile-dict", JSON.stringify(profileDictionary));

      try {
        const storedUserRaw = localStorage.getItem("vve-user");
        if (storedUserRaw) {
          const storedUser = JSON.parse(storedUserRaw);
          storedUser.status = "pending_review";
          localStorage.setItem("vve-user", JSON.stringify(storedUser));
        }
      } catch {}

      try {
        if (role === "architect") {
          const architectPayload: ArchitectProfilePayload = {
            full_name: name.trim(),
            headline: headline.trim(),
            location: location.trim(),
            sectors: selectedChips,
            additional_notes: otherExpertise.trim() || null,
            opportunity_description: intent.trim(),
            doc_depth: range,
            submission_timeline: timeline,
          };
          await submitArchitectProfile(architectPayload);
        } else {
          await submitInvestorProfile(profileDictionary);
        }
      } catch (err) {
        console.warn("[Onboarding] Error submitting profile payload to backend:", err);
      } finally {
        setIsSubmitting(false);
        router.push(`/dashboard?role=${role}`);
      }
    }
  };

  return (
    <>
      <Navbar currentRole={role} onRoleChange={handleRoleToggle} />

      <main data-page="onboarding" className="page onboarding-page" data-onboard-role={role}>
        <div className="onboarding-shell">
          {/* ================= ASIDE COLUMN ================= */}
          <aside className="onboarding-aside">
            <span className="onboarding-kicker" id="onboardingKicker">
              {config.kicker}
            </span>
            <h1>
              Make your <em>first impression</em> count.
            </h1>
            <p id="onboardingAsideCopy">{config.aside}</p>
            <div className="onboarding-steps" aria-label="Account setup progress">
              <div
                className={`onboarding-step-marker ${step === 1 ? "active" : step > 1 ? "done" : ""}`}
                data-onboarding-marker="1"
              >
                <span>1</span>About you
              </div>
              <div
                className={`onboarding-step-marker ${step === 2 ? "active" : step > 2 ? "done" : ""}`}
                data-onboarding-marker="2"
              >
                <span>2</span>Your strengths
              </div>
              <div
                className={`onboarding-step-marker ${step === 3 ? "active" : step > 3 ? "done" : ""}`}
                data-onboarding-marker="3"
              >
                <span>3</span>Your opportunity
              </div>
            </div>
          </aside>

          {/* ================= MAIN FORM SECTION ================= */}
          <section className="onboarding-main" aria-label="Account setup form">
            <div className="onboarding-progress">
              <span id="onboardingProgressText">Step {step} of 3</span>
              <div className="onboarding-progress-track">
                <div
                  className="onboarding-progress-fill"
                  id="onboardingProgressFill"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: ABOUT YOU */}
            <div className={`onboarding-view ${step === 1 ? "active" : ""}`} data-onboarding-view="1">
              <h2 className="onboarding-title">
                First, the <em>person</em> behind the work.
              </h2>
              <p className="onboarding-copy" id="onboardingStepOneCopy">
                {config.firstCopy}
              </p>
              <div className="onboarding-fields">
                <label className="onboarding-label">
                  Full name
                  <input
                    className="onboarding-input"
                    id="onboardingName"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                  />
                </label>
                <label className="onboarding-label" id="onboardingRoleLabel">
                  {config.headline}
                  <input
                    className="onboarding-input"
                    id="onboardingHeadline"
                    type="text"
                    placeholder={config.headlinePlaceholder}
                    value={headline}
                    onChange={(e) => {
                      setHeadline(e.target.value);
                      setError("");
                    }}
                  />
                </label>
                <label className="onboarding-label wide">
                  Where are you based?
                  <input
                    className="onboarding-input"
                    id="onboardingLocation"
                    type="text"
                    autoComplete="country-name"
                    placeholder="City and country"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setError("");
                    }}
                  />
                </label>
              </div>
              <div className="onboarding-note">
                <span>✦</span>
                <span>
                  <strong>Keep it professional.</strong> This information is reviewed by vvEntra and is not shown
                  publicly until your account is approved.
                </span>
              </div>
            </div>

            {/* STEP 2: YOUR STRENGTHS */}
            <div className={`onboarding-view ${step === 2 ? "active" : ""}`} data-onboarding-view="2">
              <h2 className="onboarding-title">
                Where do you bring the <em>most value?</em>
              </h2>
              <p className="onboarding-copy" id="onboardingStepTwoCopy">
                {config.secondCopy}
              </p>
              <div className="onboarding-chip-group" id="onboardingChips" aria-label="Choose areas of expertise">
                {config.chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={`onboarding-chip ${selectedChips.includes(chip) ? "selected" : ""}`}
                    data-onboarding-chip={chip}
                    onClick={() => toggleChip(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <label className="onboarding-label" style={{ marginTop: "1.4rem" }}>
                Anything else we should know?
                <small>Optional. Add specialist skills, sectors, or your operating experience.</small>
                <input
                  className="onboarding-input"
                  id="onboardingOtherExpertise"
                  type="text"
                  placeholder="e.g. Enterprise GTM, compliance, marketplace operations"
                  value={otherExpertise}
                  onChange={(e) => setOtherExpertise(e.target.value)}
                />
              </label>
              <div className="onboarding-note">
                <span>✦</span>
                <span>
                  <strong>Choose only what is real.</strong> Clear expertise helps reviewers place your opportunity in the
                  right category.
                </span>
              </div>
            </div>

            {/* STEP 3: YOUR OPPORTUNITY */}
            <div className={`onboarding-view ${step === 3 ? "active" : ""}`} data-onboarding-view="3">
              <h2
                className="onboarding-title"
                id="onboardingStepThreeTitle"
                dangerouslySetInnerHTML={{ __html: config.thirdTitle }}
              />
              <p className="onboarding-copy" id="onboardingStepThreeCopy">
                {config.thirdCopy}
              </p>
              <div className="onboarding-fields">
                <label className="onboarding-label wide" id="onboardingIntentLabel">
                  {config.intent}
                  <textarea
                    className="onboarding-textarea"
                    id="onboardingIntent"
                    placeholder={config.intentPlaceholder}
                    value={intent}
                    onChange={(e) => {
                      setIntent(e.target.value);
                      setError("");
                    }}
                  />
                </label>
                <label className="onboarding-label" id="onboardingRangeLabel">
                  {config.range}
                  <select
                    className="onboarding-select"
                    id="onboardingRange"
                    value={range}
                    onChange={(e) => {
                      setRange(e.target.value);
                      setError("");
                    }}
                  >
                    <option value="">Choose one</option>
                    {config.ranges.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="onboarding-label" id="onboardingTimelineLabel">
                  {config.timeline}
                  <select
                    className="onboarding-select"
                    id="onboardingTimeline"
                    value={timeline}
                    onChange={(e) => {
                      setTimeline(e.target.value);
                      setError("");
                    }}
                  >
                    <option value="">Choose one</option>
                    {config.timelines.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="onboarding-note">
                <span>✦</span>
                <span>
                  <strong>Your next step is verification.</strong> Once the profile is complete, vvEntra will guide you
                  through identity checks before a listing can be published.
                </span>
              </div>
            </div>

            {/* ERROR DISPLAY */}
            <p className="onboarding-error" id="onboardingError" role="status" aria-live="polite">
              {error}
            </p>

            {/* ACTIONS */}
            <div className="onboarding-actions">
              <button
                type="button"
                className="onboarding-back"
                id="onboardingBack"
                disabled={step === 1}
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="onboarding-next"
                id="onboardingNext"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {step === 3 ? (isSubmitting ? "Finishing..." : "Finish profile") : "Continue"}
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="onboarding-page" />}>
      <OnboardingContent />
    </Suspense>
  );
}
