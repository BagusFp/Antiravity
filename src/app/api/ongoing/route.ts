import { NextResponse } from "next/server";
import { AnimeApiService } from "@/services/anime-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const data = await AnimeApiService.getOngoingAnime(page);
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[API ongoing] Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch ongoing anime" }, { status: 500 });
  }
}
