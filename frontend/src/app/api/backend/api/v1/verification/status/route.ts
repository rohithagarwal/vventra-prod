import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = (
    process.env.API_PROXY_TARGET ||
    "https://vventra-backend.onrender.com"
  ).replace(/\/$/, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const headers: Record<string, string> = {};
    const auth = request.headers.get("authorization");
    if (auth) headers["authorization"] = auth;
    const cookie = request.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;

    const res = await fetch(`${backendUrl}/api/v1/verification/status`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data) {
        return NextResponse.json(data);
      }
    }
  } catch {
    // Backend offline
  }

  return NextResponse.json({
    total_steps: 4,
    current_step: 2,
    verifying_as: "architect",
    is_verified: false,
    is_fully_verified: false,
    status: "applied",
    user_status: "applied",
    video_verification: {
      is_verified: false,
      is_submitted: false,
      status: "pending",
    },
    linkedin: {
      is_verified: false,
      username: "",
    },
  });
}
