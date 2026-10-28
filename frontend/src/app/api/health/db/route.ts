import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/db";

export async function GET() {
  try {
    const health = await getDatabaseHealth();
    return NextResponse.json({
      status: "ok",
      service: "neon-postgres",
      data: health,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        service: "neon-postgres",
        error: error?.message || "Failed to query Neon PostgreSQL",
      },
      { status: 500 }
    );
  }
}
