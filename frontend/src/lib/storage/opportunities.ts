export interface OpportunityItem {
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
  architectVerified?: boolean;
  architectName?: string;
  submittedAt?: string;
  thesis?: string;
  problem?: string;
  thesisSummary?: string;
  problemSummary?: string;
  aiSummaries?: Record<string, string>;
  geography?: string;
  monetisation?: string;
  docs?: string[];
}

export interface LiveMarketStats {
  totalListings: number;
  activeNow: number;
  newThisWeek: number;
  architectsOnline: number;
  avgUnlockPrice: number;
  avgUnlockFmt: string;
  dealsClosed: number;
  deltaToday: string;
  deltaWoW: string;
  demandGap: string;
}

const STORAGE_KEY = "vve-opportunities";
const COMPOSED_KEY = "vve-composed-listing";
const UNLOCKED_KEY = "vve-unlocked-opps";

export function simulateSummary(fieldLabel: string, text: string): string {
  if (!text || !text.trim()) return "Proprietary architectural details available upon unlocking the confidential dossier.";
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const wordCount = clean.split(/\s+/).length;

  const dataRe = /(\$[\d,.]+\s?[KMB]?|\b\d+[\d,.]*\s?%|\b\d+[\d,.]*\s?(x|months?|days?|weeks?|years?|hours?)\b|\b\d{2,}[\d,.]*\b)/i;
  const signalRe = /\b(market|customers?|segment|target|revenue|margin|pricing|charge|cost|save|reduce|grow|demand|competitor|incumbent|because|driver|trend|why now|moat|defensible|retention|churn|acquisition)\b/i;

  const dataSentences = sentences.filter((s) => dataRe.test(s));
  const signalSentences = sentences.filter((s) => signalRe.test(s) && !dataRe.test(s));

  const trim = (s: string, max = 80) => (s.length <= max ? s : s.slice(0, max).replace(/\s+\S*$/, "") + "…");

  const points: string[] = [];
  dataSentences.slice(0, 2).forEach((s) => points.push(trim(s)));
  if (points.length < 2) {
    signalSentences.slice(0, 2 - points.length).forEach((s) => points.push(trim(s)));
  }

  const depthNote =
    wordCount > 200 ? "The full write-up runs deep" :
    wordCount > 80 ? "The full write-up is detailed" :
    "The full architectural write-up continues";

  let out = `Executive focus: Strategic venture analysis addressing commercial opportunity and target deployment.\n\n`;
  if (points.length) {
    out += "Public highlights:\n" + points.map((p) => "• " + p).join("\n") + "\n\n";
  }
  out += depthNote + ", including proprietary metrics, customer diligence, and full data models, in the locked confidential section.";
  return out.trim();
}

export function getUnlockedOpportunities(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function unlockOpportunity(oppId: string): void {
  if (typeof window === "undefined" || !oppId) return;
  try {
    const current = getUnlockedOpportunities();
    if (!current.includes(oppId)) {
      current.push(oppId);
      localStorage.setItem(UNLOCKED_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent("vve-opportunity-unlocked", { detail: { id: oppId } }));
      window.dispatchEvent(new Event("storage"));
    }
  } catch {}
}

export function getStoredOpportunities(): OpportunityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Only available/approved opportunities should appear in the public marketplace
    return parsed.filter((item: OpportunityItem) => item && (item.status === "available" || item.status === undefined));
  } catch {
    return [];
  }
}

export function getComposedOpportunity(): OpportunityItem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COMPOSED_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveNewOpportunity(opp: OpportunityItem): OpportunityItem[] {
  if (typeof window === "undefined") return [opp];
  try {
    // Save composer snapshot for the current user
    localStorage.setItem(COMPOSED_KEY, JSON.stringify(opp));

    // Only add to public marketplace listings cache if approved/available
    const current = getStoredOpportunities();
    let updated = current;
    if (opp.status === "available") {
      updated = [opp, ...current.filter((item) => item.id !== opp.id)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    
    // Dispatch events for immediate live stats update in current tab and across tabs
    window.dispatchEvent(new CustomEvent("vve-opportunity-listed", { detail: opp }));
    window.dispatchEvent(new CustomEvent("vve-opportunities-updated", { detail: updated }));
    window.dispatchEvent(new Event("storage"));
    return updated;
  } catch {
    return [opp];
  }
}

export function clearAllOpportunities(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COMPOSED_KEY);
    window.dispatchEvent(new CustomEvent("vve-opportunities-updated", { detail: [] }));
    window.dispatchEvent(new Event("storage"));
  } catch {}
}

export function calculateLiveStats(opportunities: OpportunityItem[]): LiveMarketStats {
  const activeOpportunities = opportunities.filter((o) => !o.status || o.status === "available");
  const count = activeOpportunities.length;
  if (count === 0) {
    return {
      totalListings: 0,
      activeNow: 0,
      newThisWeek: 0,
      architectsOnline: 0,
      avgUnlockPrice: 0,
      avgUnlockFmt: "$0",
      dealsClosed: 0,
      deltaToday: "0 today",
      deltaWoW: "0 WoW",
      demandGap: "0%",
    };
  }

  const totalUnlock = activeOpportunities.reduce(
    (acc, curr) => acc + (curr.priceNum ? Math.max(450, Math.round(curr.priceNum * 0.015)) : 450),
    0
  );
  const avgUnlock = Math.round(totalUnlock / count);

  return {
    totalListings: count,
    activeNow: Math.max(count, 1),
    newThisWeek: count,
    architectsOnline: Math.max(1, Math.min(count, 3)),
    avgUnlockPrice: avgUnlock,
    avgUnlockFmt: "$" + avgUnlock.toLocaleString("en-US"),
    dealsClosed: 0,
    deltaToday: `+${count} today`,
    deltaWoW: `+${count} WoW`,
    demandGap: "+34%",
  };
}

export async function syncOpportunitiesWithBackend(): Promise<OpportunityItem[]> {
  if (typeof window === "undefined") return [];
  try {
    const backendUrl = "https://vventra-backend.onrender.com";
    const res = await fetch(`${backendUrl}/api/v1/opportunities`).catch(() => null);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data && Array.isArray(data.items)) {
        // Only active/available opportunities belong in the public marketplace
        const backendItems: OpportunityItem[] = data.items
          .filter((b: any) => b.status === "active" || b.status === "available")
          .map((b: any) => ({
            id: b.id,
            industry: b.sector || "saas",
            stage: "validated",
            stageLabel: b.category || "Validated Concept",
            status: "available" as const,
            statusLabel: "Available",
            tags: [b.sector?.toUpperCase() || "B2B SAAS", "Verified"],
            title: b.title,
            hook: b.headline || b.summary || "",
            capital: b.deal_size ? `$${b.deal_size.toLocaleString()}` : "$50,000",
            timeToLaunch: b.timeline || "30 days",
            trustScore: b.readiness_score || 0,
            architectVerified: (b.readiness_score || 0) >= 80,
            architectName: (b.readiness_score || 0) >= 80 ? "Verified Architect" : "Pending Verification",
            listedDaysAgo: 0,
            priceNum: b.deal_size || 50000,
            unlockPrice: b.unlock_fee ? `$${b.unlock_fee.toLocaleString()}` : "$450",
            thesis: b.summary,
            problem: b.problem_statement,
            thesisSummary: simulateSummary("Investment thesis", b.summary || ""),
            problemSummary: simulateSummary("The problem", b.problem_statement || ""),
          }));

        // Keep local listings composed in the current session ONLY if they are available
        const composedRaw = localStorage.getItem(COMPOSED_KEY);
        let locallyComposed: OpportunityItem | null = null;
        if (composedRaw) {
          try {
            locallyComposed = JSON.parse(composedRaw);
          } catch {}
        }

        const merged: OpportunityItem[] = [...backendItems];
        if (
          locallyComposed &&
          locallyComposed.status === "available" &&
          !merged.some((i) => i.id === locallyComposed?.id)
        ) {
          merged.unshift(locallyComposed);
        }

        // Set authoritative opportunities list in storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("vve-opportunities-updated", { detail: merged }));
        return merged;
      }
    }
  } catch {}
  return getStoredOpportunities();
}
