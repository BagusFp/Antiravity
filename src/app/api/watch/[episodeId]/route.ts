import { NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;
    
    if (!episodeId) {
      return NextResponse.json({ error: "Missing episode ID parameter" }, { status: 400 });
    }

    const decodedEpisodeId = decodeURIComponent(episodeId);
    const sources = await fallbackManager.getStreamSources(decodedEpisodeId);

    return NextResponse.json(sources, {
      headers: {
        "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=3600", // Cache watch sources for 2 hours
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[API watch] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to extract watch stream sources", details: error.message },
      { status: 500 }
    );
  }
}
