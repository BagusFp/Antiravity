import { NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing anime ID parameter" }, { status: 400 });
    }

    const decodedId = decodeURIComponent(id);
    const recommendations = await fallbackManager.getRecommendations(decodedId);

    return NextResponse.json(recommendations, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=7200", // Cache recommendations for 1 day
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[API recommendation] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch recommendations", details: error.message },
      { status: 500 }
    );
  }
}
