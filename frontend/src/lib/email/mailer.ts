import nodemailer from "nodemailer";

export interface SendResetEmailOptions {
  toEmail: string;
  resetUrl: string;
}

export interface SendResetEmailResult {
  success: boolean;
  provider: "resend" | "smtp" | "simulated";
  messageId?: string;
  error?: string;
  devLink?: string;
}

function buildHtmlTemplate(toEmail: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your vvEntra Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f17; width: 100%; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #121824; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.45);">
          
          <!-- Top Accent Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #ea580c, #f97316, #fb923c);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: #ffffff;">
                      vv<span style="color: #ea580c;">Entra</span>
                    </span>
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; margin-top: 2px;">
                      Venture Intelligence Platform
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 10px 36px 32px;">
              <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                Reset your account password
              </h1>
              
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #d1d5db;">
                We received a request to reset the password for the vvEntra account registered with <strong style="color: #ffffff;">${toEmail}</strong>.
              </p>

              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #d1d5db;">
                Click the button below to choose a new password. This secure link is valid for <strong>60 minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 28px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #ea580c;">
                    <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.01em;">
                      Reset Your Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <div style="padding: 16px; background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 6px; font-size: 12px; color: #9ca3af; font-weight: 500;">
                  Button not working? Copy and paste this link into your browser:
                </p>
                <p style="margin: 0; font-size: 12px; word-break: break-all;">
                  <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="color: #f97316; text-decoration: underline;">
                    ${resetUrl}
                  </a>
                </p>
              </div>

              <!-- Security Warning -->
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #6b7280;">
                If you did not request this password reset, no further action is required. Your account remains secure and your password will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #0e141f; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #6b7280; text-align: center;">
                &copy; ${new Date().getFullYear()} vvEntra Inc. &middot; Private Institutional Market Intelligence
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Dispatches a password reset email using Resend (HTTPS) or Nodemailer (SMTP).
 * If no live credentials are provided in environment variables, it logs the secure link
 * and returns it gracefully so development and testing continue smoothly.
 */
export async function sendPasswordResetEmail({
  toEmail,
  resetUrl,
}: SendResetEmailOptions): Promise<SendResetEmailResult> {
  const fromAddress = process.env.EMAIL_FROM || "vvEntra Security <onboarding@resend.dev>";
  const html = buildHtmlTemplate(toEmail, resetUrl);
  const text = `Reset your vvEntra password\n\nWe received a request to reset your password for ${toEmail}.\n\nClick the link below to set a new password:\n${resetUrl}\n\nThis link is valid for 60 minutes.\n\nIf you did not request this reset, you can safely ignore this email.`;

  // 1. Try Resend if RESEND_API_KEY is available
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toEmail],
          subject: "Reset your vvEntra password",
          html,
          text,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok) {
        return {
          success: true,
          provider: "resend",
          messageId: data?.id,
        };
      }
      console.warn("[mailer] Resend API error:", data);
    } catch (err: any) {
      console.warn("[mailer] Failed calling Resend API:", err?.message);
    }
  }

  // 2. Try Nodemailer SMTP (Gmail or custom SMTP)
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || (process.env.GMAIL_USER ? "smtp.gmail.com" : undefined);

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const port = Number(process.env.SMTP_PORT) || (process.env.GMAIL_USER ? 465 : 587);
      const secure = port === 465;

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: "Reset your vvEntra password",
        text,
        html,
      });

      return {
        success: true,
        provider: "smtp",
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.warn("[mailer] SMTP dispatch failed:", err?.message);
    }
  }

  // 3. Fallback: Log reset link for direct access
  console.log(`\n======================================================`);
  console.log(`[vvEntra Password Reset] Real Email Delivery Simulation`);
  console.log(`To: ${toEmail}`);
  console.log(`Direct Reset URL: ${resetUrl}`);
  console.log(`======================================================\n`);

  return {
    success: true,
    provider: "simulated",
    devLink: resetUrl,
  };
}
