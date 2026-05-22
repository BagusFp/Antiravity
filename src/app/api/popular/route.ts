import { NextResponse } from "next/server";
import { AnimeApiService } from "@/services/anime-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const data = await AnimeApiService.getCompletedAnime(page);
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("[API popular] Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch popular completed anime" }, { status: 500 });
  }
}
