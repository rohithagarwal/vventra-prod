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
  submittedAt?: string;
  thesis?: string;
  problem?: string;
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

export function getStoredOpportunities(): OpportunityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNewOpportunity(opp: OpportunityItem): OpportunityItem[] {
  if (typeof window === "undefined") return [opp];
  try {
    const current = getStoredOpportunities();
    const updated = [opp, ...current.filter((item) => item.id !== opp.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(COMPOSED_KEY, JSON.stringify(opp));
    
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
  const count = opportunities.length;
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

  const totalUnlock = opportunities.reduce(
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
        const backendItems: OpportunityItem[] = data.items.map((b: any) => ({
          id: b.id,
          industry: b.sector || "saas",
          stage: "validated",
          stageLabel: b.category || "Validated Concept",
          status: "available",
          statusLabel: "Available",
          tags: [b.sector?.toUpperCase() || "B2B SAAS", "Verified"],
          title: b.title,
          hook: b.headline || b.summary || "",
          capital: b.deal_size ? `$${b.deal_size.toLocaleString()}` : "$50,000",
          timeToLaunch: b.timeline || "30 days",
          trustScore: b.readiness_score || 94,
          listedDaysAgo: 0,
          priceNum: b.deal_size || 50000,
          unlockPrice: b.unlock_fee ? `$${b.unlock_fee.toLocaleString()}` : "$450",
          thesis: b.summary,
          problem: b.problem_statement,
        }));

        // Keep local listings composed in the current session
        const composedRaw = localStorage.getItem(COMPOSED_KEY);
        let locallyComposed: OpportunityItem | null = null;
        if (composedRaw) {
          try {
            locallyComposed = JSON.parse(composedRaw);
          } catch {}
        }

        const merged: OpportunityItem[] = [...backendItems];
        if (locallyComposed && !merged.some((i) => i.id === locallyComposed?.id)) {
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
