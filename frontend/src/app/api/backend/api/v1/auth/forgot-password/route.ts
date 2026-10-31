import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth/token";
import { sendPasswordResetEmail } from "@/lib/email/mailer";

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

    // Determine host origin for absolute email link.
    // Prefer production domain (or NEXT_PUBLIC_APP_URL) so emails can be opened on mobile devices & external clients.
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    let origin = configuredUrl || "https://vventra-prod.vercel.app";
    const originHeader = request.headers.get("origin") || request.headers.get("x-forwarded-host");
    if (originHeader && !originHeader.includes("localhost") && !originHeader.includes("127.0.0.1")) {
      origin = originHeader.startsWith("http") ? originHeader : `https://${originHeader}`;
    }

    // Generate secure, signed 60-minute password reset token
    const token = createPasswordResetToken(email, 60);
    const resetUrl = `${origin}/forgot-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    // Dispatch email via Resend or SMTP
    const emailResult = await sendPasswordResetEmail({
      toEmail: email,
      resetUrl,
    });

    // Notify backend if online
    const backendUrl = (
      process.env.API_PROXY_TARGET ||
      "https://vventra-backend.onrender.com"
    ).replace(/\/$/, "");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      await fetch(`${backendUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, reset_url: resetUrl }),
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeout);
    } catch {
      // Backend offline / timed out
    }

    return NextResponse.json({
      success: true,
      message: `Password reset instructions have been sent to ${email}. Please check your inbox (and spam folder) for the secure recovery link.`,
      provider: emailResult.provider,
      dev_link: emailResult.provider === "simulated" ? resetUrl : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to process password reset request." },
      { status: 400 }
    );
  }
}
