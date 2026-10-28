import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const role = body.role === "architect" ? "architect" : "investor";
    const email = body.email || "newmember@vventra.com";

    const backendUrl = (
      process.env.API_PROXY_TARGET ||
      (process.env.NODE_ENV === "production"
        ? "https://vventra-backend.onrender.com"
        : "http://localhost:8000")
    ).replace(/\/$/, "");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${backendUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json().catch(() => null);
      if (data) {
        return NextResponse.json(data, { status: res.status });
      }
    } catch {
      // Backend offline, fallback to local registration
    }

    return NextResponse.json({
      access_token: "vve_token_" + Buffer.from(email).toString("base64") + "_" + Date.now(),
      token_type: "bearer",
      expires_in: 86400,
      is_new_user: true,
      user: {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email: email,
        role: role,
        status: "onboarding",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Registration failed" }, { status: 400 });
  }
}
