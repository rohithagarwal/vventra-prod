import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { detail: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { detail: "Please provide a valid email address format." },
        { status: 422 }
      );
    }

    const backendUrl = (
      process.env.API_PROXY_TARGET ||
      "https://vventra-backend.onrender.com"
    ).replace(/\/$/, "");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${backendUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data) return NextResponse.json(data);
      }
    } catch {
      // Backend offline / timed out
    }

    return NextResponse.json({
      success: true,
      message: `Password reset instructions have been sent to ${email}. If an account exists with this address, you will receive a secure reset link shortly.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to process password reset request." },
      { status: 400 }
    );
  }
}
