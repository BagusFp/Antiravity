import { NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing anime ID parameter" }, { status: 400 });
    }

    // Since Samehadaku/Jikan IDs can contain url encodings, we decode the param
    const decodedId = decodeURIComponent(id);
    const detail = await fallbackManager.getAnimeDetail(decodedId);

    return NextResponse.json(detail, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("[API anime] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch anime details", details: error.message },
      { status: 500 }
    );
  }
}
