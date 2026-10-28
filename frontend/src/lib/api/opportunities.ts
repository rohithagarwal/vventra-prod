import { api, apiUrl } from "./client";

export interface OpportunityItem {
  id: string;
  code: string;
  title: string;
  sector: string;
  category?: string;
  status: string;
  deal_size: number;
  unlock_fee: number;
  target_return?: string;
  timeline?: string;
  headline?: string;
  summary?: string;
  problem_statement?: string;
  solution_overview?: string;
  market_size?: string;
  business_model?: string;
  doc_depth_pages: number;
  readiness_score: number;
  financial_model?: Record<string, unknown>;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface OpportunityCreatePayload {
  title: string;
  sector: string;
  category?: string;
  deal_size?: number;
  unlock_fee?: number;
  target_return?: string;
  timeline?: string;
  headline?: string;
  summary?: string;
  problem_statement?: string;
  solution_overview?: string;
  market_size?: string;
  business_model?: string;
  doc_depth_pages?: number;
  readiness_score?: number;
  financial_model?: Record<string, unknown>;
  is_featured?: boolean;
  status?: string;
}

export async function fetchOpportunities(filters?: {
  sector?: string;
  status?: string;
  search?: string;
  sort_by?: string;
}): Promise<OpportunityItem[]> {
  const params = new URLSearchParams();
  if (filters?.sector && filters.sector !== "all") params.append("sector", filters.sector);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.sort_by) params.append("sort_by", filters.sort_by);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await api.get(`/api/v1/opportunities${query}`);
  if (!res.ok) {
    throw new Error("Failed to load opportunities.");
  }
  const data = await res.json();
  return data.items || [];
}

export async function fetchOpportunityById(id: string): Promise<OpportunityItem> {
  const res = await api.get(`/api/v1/opportunities/${id}`);
  if (!res.ok) {
    throw new Error("Opportunity not found.");
  }
  return await res.json();
}

export async function createOpportunity(payload: OpportunityCreatePayload): Promise<OpportunityItem> {
  const res = await api.post("/api/v1/opportunities", payload);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create opportunity.");
  }
  return await res.json();
}

export async function deleteOpportunity(id: string): Promise<void> {
  const res = await api.delete(`/api/v1/opportunities/${id}`);
  if (!res.ok) {
    throw new Error("Failed to delete opportunity.");
  }
}

export function subscribeToOpportunitiesRealtime(callbacks: {
  onCreated?: (opp: OpportunityItem) => void;
  onUpdated?: (opp: OpportunityItem) => void;
  onDeleted?: (data: { id: string }) => void;
  onError?: (err: Event) => void;
}): () => void {
  if (typeof window === "undefined" || !("EventSource" in window)) {
    return () => {};
  }

  const sseUrl = apiUrl("/api/v1/opportunities/stream");
  const eventSource = new EventSource(sseUrl);

  if (callbacks.onCreated) {
    eventSource.addEventListener("opportunity_created", (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        callbacks.onCreated?.(parsed);
      } catch (e) {
        console.error("Failed to parse opportunity_created event", e);
      }
    });
  }

  if (callbacks.onUpdated) {
    eventSource.addEventListener("opportunity_updated", (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        callbacks.onUpdated?.(parsed);
      } catch (e) {
        console.error("Failed to parse opportunity_updated event", e);
      }
    });
  }

  if (callbacks.onDeleted) {
    eventSource.addEventListener("opportunity_deleted", (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        callbacks.onDeleted?.(parsed);
      } catch (e) {
        console.error("Failed to parse opportunity_deleted event", e);
      }
    });
  }

  if (callbacks.onError) {
    eventSource.onerror = (err) => {
      callbacks.onError?.(err);
    };
  }

  return () => {
    eventSource.close();
  };
}
