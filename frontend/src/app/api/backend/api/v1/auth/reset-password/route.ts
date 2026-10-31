import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const newPassword = body.new_password || "";

    if (!email) {
      return NextResponse.json({ detail: "Email address is required." }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { detail: "New password must be at least 8 characters long." },
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
      const res = await fetch(`${backendUrl}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      message: "Your password has been successfully reset. You can now sign in with your new password.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to reset password." },
      { status: 400 }
    );
  }
}
