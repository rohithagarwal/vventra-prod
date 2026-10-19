const API_PROXY_PREFIX = "/api/backend";
const ACCESS_TOKEN_KEY = "vve-access-token";
const REFRESH_PATH = "/api/v1/auth/refresh";

let refreshInFlight: Promise<string | null> | null = null;

function readAccessToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function saveAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function clearAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function isExpiredTokenResponse(response: Response): boolean {
  return response.status === 401;
}

function getAccessTokenFromResponse(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const response = body as { access_token?: unknown; data?: unknown };
  if (typeof response.access_token === "string") return response.access_token;
  if (response.data && typeof response.data === "object") {
    const nestedToken = (response.data as { access_token?: unknown }).access_token;
    if (typeof nestedToken === "string") return nestedToken;
  }
  return null;
}

function getRequestUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === "string" && input.startsWith("/")) return `${API_PROXY_PREFIX}${input}`;
  return input;
}

export function apiUrl(path: string): string {
  return `${API_PROXY_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(apiUrl(REFRESH_PATH), {
          method: "POST",
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (!response.ok) {
          clearAccessToken();
          return null;
        }
        const body: unknown = await response.json().catch(() => null);
        const token = getAccessTokenFromResponse(body);
        if (!token) {
          clearAccessToken();
          return null;
        }
        saveAccessToken(token);
        return token;
      } catch {
        clearAccessToken();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

function friendlyExpiredResponse(): Response {
  return Response.json(
    { detail: "Your session has expired. Please sign in again." },
    { status: 401, statusText: "Unauthorized" }
  );
}

/** Sends a protected request, refreshing once and retrying transparently after a 401. */
export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const url = getRequestUrl(input);
  const requestInit: RequestInit = { ...init, credentials: init.credentials ?? "include" };
  const send = (token: string | null) => {
    const sourceHeaders = init.headers ?? (input instanceof Request ? input.headers : undefined);
    const headers = new Headers(sourceHeaders);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...requestInit, headers });
  };

  const response = await send(readAccessToken());
  if (!isExpiredTokenResponse(response)) return response;

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) return friendlyExpiredResponse();

  const retryResponse = await send(refreshedToken);
  if (isExpiredTokenResponse(retryResponse)) {
    clearAccessToken();
    return friendlyExpiredResponse();
  }
  return retryResponse;
}

function jsonRequest(method: string, body?: unknown, init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  if (body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return {
    ...init,
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
}

export const api = {
  get(path: string, init?: RequestInit) {
    return fetchWithAuth(path, jsonRequest("GET", undefined, init));
  },
  post(path: string, body?: unknown, init?: RequestInit) {
    return fetchWithAuth(path, jsonRequest("POST", body, init));
  },
  put(path: string, body?: unknown, init?: RequestInit) {
    return fetchWithAuth(path, jsonRequest("PUT", body, init));
  },
  patch(path: string, body?: unknown, init?: RequestInit) {
    return fetchWithAuth(path, jsonRequest("PATCH", body, init));
  },
  delete(path: string, init?: RequestInit) {
    return fetchWithAuth(path, jsonRequest("DELETE", undefined, init));
  },
};
