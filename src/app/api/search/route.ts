import { NextRequest, NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([], {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const results = await fallbackManager.search(query);
    
    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=180", // 5 min cache
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[API search] Error:", error.message);
    return NextResponse.json([], {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
