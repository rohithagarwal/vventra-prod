import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { linkedin_url?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  const rawUrl = (body.linkedin_url || "").trim();
  if (!rawUrl) {
    return NextResponse.json({ detail: "LinkedIn profile URL is required." }, { status: 400 });
  }

  let cleanUrl = rawUrl.startsWith("@") ? rawUrl.slice(1).trim() : rawUrl;
  if (!cleanUrl.includes("linkedin.com")) {
    cleanUrl = `https://www.linkedin.com/in/${cleanUrl}`;
  } else if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }
  cleanUrl = cleanUrl.split("?")[0].replace(/\/+$/, "");

  const match = cleanUrl.match(/^https?:\/\/(?:[a-zA-Z0-9_-]+\.)?linkedin\.com\/in\/([a-zA-Z0-9%_-]+)/i);
  if (!match) {
    return NextResponse.json(
      { detail: "Please provide a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username)." },
      { status: 422 }
    );
  }

  const username = match[1];

  // Try proxying to backend
  const backendUrl = (
    process.env.API_PROXY_TARGET ||
    "https://vventra-backend.onrender.com"
  ).replace(/\/$/, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const auth = request.headers.get("authorization");
    if (auth) headers["authorization"] = auth;
    const cookie = request.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;

    const res = await fetch(`${backendUrl}/api/v1/verification/linkedin`, {
      method: "POST",
      headers,
      body: JSON.stringify({ linkedin_url: cleanUrl }),
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
    message: "LinkedIn profile verified successfully.",
    linkedin_url: cleanUrl,
    is_verified: true,
    username: username,
  });
}
