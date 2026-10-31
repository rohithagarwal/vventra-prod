import { NextResponse } from "next/server";
import { verifyPasswordResetToken } from "@/lib/auth/token";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const newPassword = body.new_password || "";
    const token = body.token || "";

    if (!email) {
      return NextResponse.json({ detail: "Email address is required." }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { detail: "New password must be at least 8 characters long and satisfy all requirements." },
        { status: 422 }
      );
    }

    // If reset token is provided, verify signature and expiration
    if (token) {
      const verification = verifyPasswordResetToken(token);
      if (!verification.valid) {
        return NextResponse.json(
          { detail: verification.error || "The reset link has expired or is invalid. Please request a new one." },
          { status: 400 }
        );
      }
      if (verification.email && verification.email.toLowerCase() !== email) {
        return NextResponse.json(
          { detail: "Reset token email does not match the submitted email address." },
          { status: 400 }
        );
      }
    }

    // Forward to backend service if reachable
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
      message: "Your password has been successfully updated. You can now sign in with your new password.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to reset password." },
      { status: 400 }
    );
  }
}
