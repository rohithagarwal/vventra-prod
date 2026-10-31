import crypto from "crypto";

const DEFAULT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || "vventra-venture-auth-secret-key-2026";

export interface ResetTokenPayload {
  email: string;
  exp: number; // Unix timestamp in milliseconds
}

/**
 * Creates a signed, tamper-proof password reset token that expires after the specified minutes.
 */
export function createPasswordResetToken(email: string, expiresInMinutes = 60): string {
  const normalizedEmail = email.trim().toLowerCase();
  const exp = Date.now() + expiresInMinutes * 60 * 1000;
  const payload: ResetTokenPayload = { email: normalizedEmail, exp };
  
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", DEFAULT_SECRET)
    .update(payloadStr)
    .digest("base64url");

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies a password reset token: checks signature integrity and expiration.
 */
export function verifyPasswordResetToken(token: string): {
  valid: boolean;
  email?: string;
  error?: string;
} {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, error: "Invalid token format." };
  }

  const [payloadStr, signature] = token.split(".");
  if (!payloadStr || !signature) {
    return { valid: false, error: "Malformed reset token." };
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", DEFAULT_SECRET)
    .update(payloadStr)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return { valid: false, error: "Reset token signature is invalid or has been modified." };
  }

  try {
    const payload: ResetTokenPayload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.exp) {
      return { valid: false, error: "This password reset link has expired. Please request a new one." };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false, error: "Could not decode reset token payload." };
  }
}
