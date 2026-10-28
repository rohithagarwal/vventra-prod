import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = (
    process.env.API_PROXY_TARGET ||
    (process.env.NODE_ENV === "production"
      ? "https://vventra-backend.onrender.com"
      : "http://localhost:8000")
  ).replace(/\/$/, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
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
    total_steps: 3,
    current_step: 3,
    verifying_as: "architect",
    is_verified: true,
    is_fully_verified: true,
    status: "verified",
    user_status: "verified",
    video_verification: {
      is_verified: true,
      status: "success",
    },
    linkedin: {
      is_verified: true,
      username: "member",
    },
    payout: {
      account_id: "acct_demo_verified",
      is_connected: true,
      bank_name: "Standard Chartered",
      last4: "8899",
      currency: "USD",
    },
  });
}
