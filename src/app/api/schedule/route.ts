import { NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const schedule = await fallbackManager.getSchedule();
    
    return NextResponse.json(schedule, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[API schedule] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch schedule data", details: error.message },
      { status: 500 }
    );
  }
}
