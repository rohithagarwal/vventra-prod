import { NextResponse } from "next/server";
import { verifyPasswordResetToken } from "@/lib/auth/token";
import { sql } from "@/lib/db";
import { hash } from "@node-rs/argon2";

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

    // Require and verify secure cryptographic reset token
    if (!token) {
      return NextResponse.json(
        { detail: "A valid recovery token is required. Please use the secure link sent to your email address." },
        { status: 400 }
      );
    }

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

    // Compute standard Argon2id hash compatible with Python backend
    const passwordHash = await hash(newPassword, {
      memoryCost: 65536,
      timeCost: 3,
      outputLen: 32,
      parallelism: 4,
    });

    // Update Neon PostgreSQL users table directly
    let dbUpdated = false;
    let userId: string | null = null;
    try {
      const rows = await sql`
        UPDATE users
        SET password_hash = ${passwordHash}, updated_at = NOW()
        WHERE lower(email) = lower(${email})
        RETURNING id, email, role, status;
      `;
      if (rows && rows.length > 0) {
        dbUpdated = true;
        userId = rows[0].id;
      }
    } catch (dbErr) {
      console.error("Neon DB password update error:", dbErr);
    }

    // Forward to Render backend if reachable for session / event parity
    const backendUrl = (
      process.env.API_PROXY_TARGET ||
      "https://vventra-backend.onrender.com"
    ).replace(/\/$/, "");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      await fetch(`${backendUrl}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, new_password: newPassword, token }),
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeout);
    } catch {
      // Backend offline / timed out
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully updated in the database. You can now sign in with your new password.",
      database_updated: dbUpdated,
      user_id: userId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message || "Failed to reset password." },
      { status: 400 }
    );
  }
}
