import { NextRequest, NextResponse } from "next/server";
import fallbackManager from "@/providers/fallback";
import { AnimeApiService } from "@/services/anime-api";
import { applyFilters } from "@/utils/filter";
import { FilterState } from "@/components/common/FilterDrawer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");

    // Read active filters from parameters
    const filters: FilterState = {
      genre: searchParams.get("genre") || "All",
      status: searchParams.get("status") || "All",
      type: searchParams.get("type") || "All",
      year: searchParams.get("year") || "All",
      rating: searchParams.get("rating") || "All",
      sortBy: searchParams.get("sortBy") || "Latest Update",
    };

    console.log(`[API search] Route Invoked: page=${page}, query="${query}", filters=${JSON.stringify(filters)}`);

    if (!query.trim()) {
      // 1. Browse Catalog Mode (paginated browse with active filters)
      const [ongoingData, completedData] = await Promise.all([
        AnimeApiService.getOngoingAnime(page).catch(() => ({ animeList: [], pagination: { hasNextPage: false } })),
        AnimeApiService.getCompletedAnime(page).catch(() => ({ animeList: [], pagination: { hasNextPage: false } }))
      ]);

      const ongoingList = ongoingData?.animeList || [];
      const completedList = completedData?.animeList || [];

      // Deduplicate combined results
      const combinedList = [];
      const seenIds = new Set();
      for (const item of [...ongoingList, ...completedList]) {
        if (item && item.id && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          combinedList.push(item);
        }
      }

      // Apply active filters server-side
      const filteredList = applyFilters(combinedList, filters);

      const hasNextPage = (ongoingData.pagination?.hasNextPage) || (completedData.pagination?.hasNextPage);

      console.log(`[API search] Browse catalog page ${page} complete. Raw: ${combinedList.length}, Filtered: ${filteredList.length}, hasNextPage: ${!!hasNextPage}`);

      return NextResponse.json(
        {
          animeList: filteredList,
          pagination: {
            currentPage: page,
            hasNextPage: !!hasNextPage,
            nextPage: hasNextPage ? page + 1 : null
          }
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=180", // 5 min cache
            "Access-Control-Allow-Origin": "*",
          }
        }
      );
    }

    // 2. Search Mode (with query q and active filters)
    const results = await fallbackManager.search(query);
    
    // Apply filters to search results server-side
    const filteredList = applyFilters(results, filters);

    console.log(`[API search] Search query complete. Raw: ${results.length}, Filtered: ${filteredList.length}`);

    return NextResponse.json(
      {
        animeList: filteredList,
        pagination: {
          currentPage: 1,
          hasNextPage: false,
          nextPage: null
        }
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=180", // 5 min cache
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("[API search] Error in GET route:", error.message);
    return NextResponse.json(
      {
        animeList: [],
        pagination: {
          currentPage: 1,
          hasNextPage: false,
          nextPage: null
        }
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
