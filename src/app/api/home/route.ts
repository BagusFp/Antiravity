import { NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await fallbackManager.getHomeData();
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
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
