import { NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";

export async function GET() {
  try {
    const schedule = await fallbackManager.getSchedule();
    
    return NextResponse.json(schedule, {
      headers: {
        "Cache-Control": "public, s-maxage=14400, stale-while-revalidate=3600", // Cache schedules for 4 hours
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
