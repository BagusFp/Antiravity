import { NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
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
