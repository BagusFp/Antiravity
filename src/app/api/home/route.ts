import { NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";

export async function GET() {
  try {
    const data = await fallbackManager.getHomeData();
    
    // Add Vercel Edge caching headers: 15 minutes cache, 10 minutes stale-while-revalidate
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[API home] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch homepage data", details: error.message },
      { status: 500 }
    );
  }
}
