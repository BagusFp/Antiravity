import { IAnimeProvider } from "./base";
import { AnimeSearchResult, AnimeDetail, StreamSource, ScheduleItem, HomeData, Episode } from "@/types/anime";
import { resilientFetch } from "@/services/fetcher";
import { sanitizeSynopsis, formatRating, cleanId } from "@/utils/formatters";
import { CacheService } from "@/services/cache";

const BASE_URL = "https://api.jikan.moe/v4";
const CACHE_TTL_HOUR = 60 * 60 * 1000;
const CACHE_TTL_DAY = 24 * 60 * 60 * 1000;

export class JikanProvider implements IAnimeProvider {
  name = "jikan";

  async getHomeData(): Promise<HomeData> {
    const cacheKey = "jikan:home";
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        // Fetch trending (airing top), popular (all-time top), latest/ongoing (seasonal now)
        const [trendingRes, popularRes, seasonalRes] = await Promise.all([
          resilientFetch<any>(`${BASE_URL}/top/anime?filter=airing&limit=12`),
          resilientFetch<any>(`${BASE_URL}/top/anime?limit=12`),
          resilientFetch<any>(`${BASE_URL}/seasons/now?limit=12`),
        ]);

        const mapSearchResult = (item: any): AnimeSearchResult => ({
          id: cleanId(item.mal_id),
          title: item.title_english || item.title || "Unknown Title",
          image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
          genres: item.genres?.map((g: any) => g.name) || [],
          rating: formatRating(item.rating),
          type: item.type || "TV",
          status: item.status || "Finished Airing",
          episodesCount: item.episodes || 0,
        });

        return {
          trending: trendingRes?.data?.map(mapSearchResult) || [],
          popular: popularRes?.data?.map(mapSearchResult) || [],
          latestUpdates: seasonalRes?.data?.map(mapSearchResult) || [],
          ongoing: seasonalRes?.data?.filter((item: any) => item.status === "Currently Airing").map(mapSearchResult) || [],
        };
      },
      CACHE_TTL_HOUR // cache home data for 1 hour
    );
  }

  async search(query: string): Promise<AnimeSearchResult[]> {
    const cacheKey = `jikan:search:${query}`;
    
    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const response = await resilientFetch<any>(
          `${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=24`
        );

        return response?.data?.map((item: any) => ({
          id: cleanId(item.mal_id),
          title: item.title_english || item.title || "Unknown Title",
          image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
          genres: item.genres?.map((g: any) => g.name) || [],
          rating: formatRating(item.rating),
          type: item.type || "TV",
          status: item.status || "Finished Airing",
          episodesCount: item.episodes || 0,
        })) || [];
      },
      15 * 60 * 1000 // Cache search results for 15 minutes
    );
  }

  async getAnimeDetail(id: string): Promise<AnimeDetail> {
    const cacheKey = `jikan:anime:${id}`;

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const response = await resilientFetch<any>(`${BASE_URL}/anime/${id}/full`);
        const item = response?.data;

        if (!item) {
          throw new Error(`Anime with ID ${id} not found on Jikan API`);
        }

        // Dynamically build standard episodes array up to episodesCount
        const epCount = item.episodes || 12;
        const episodes: Episode[] = [];
        for (let i = 1; i <= epCount; i++) {
          episodes.push({
            id: `${id}-episode-${i}`,
            number: i,
            title: `Episode ${i}`,
          });
        }

        return {
          id: cleanId(item.mal_id),
          title: item.title_english || item.title || "Unknown Title",
          image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
          genres: item.genres?.map((g: any) => g.name) || [],
          rating: formatRating(item.rating),
          synopsis: sanitizeSynopsis(item.synopsis),
          status: item.status || "Unknown",
          episodesCount: item.episodes || 0,
          studio: item.studios?.[0]?.name || "Unknown Studio",
          releasedDate: item.aired?.string || "Unknown",
          episodes,
        };
      },
      CACHE_TTL_DAY // cache full details for 1 day
    );
  }

  async getSchedule(): Promise<ScheduleItem[]> {
    const cacheKey = "jikan:schedule";

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const response = await resilientFetch<any>(`${BASE_URL}/schedules?limit=50`);
        
        return response?.data?.map((item: any) => {
          // Normalize day of week
          const day = (item.broadcast?.day || "Unknown").toLowerCase().trim();
          
          return {
            id: cleanId(item.mal_id),
            title: item.title_english || item.title || "Unknown Title",
            image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
            airingTime: item.broadcast?.time || "N/A",
            episode: 0, // Jikan schedule doesn't specify airing episode number easily
            day: day.endsWith("s") ? day.slice(0, -1) : day, // convert e.g., 'mondays' to 'monday'
          };
        }) || [];
      },
      CACHE_TTL_HOUR * 4 // Cache schedule for 4 hours
    );
  }

  async getRecommendations(id: string): Promise<AnimeSearchResult[]> {
    const cacheKey = `jikan:recommendations:${id}`;

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const response = await resilientFetch<any>(`${BASE_URL}/anime/${id}/recommendations`);
        
        return response?.data?.slice(0, 10).map((rec: any) => {
          const item = rec.entry;
          return {
            id: cleanId(item.mal_id),
            title: item.title || "Unknown Title",
            image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
          };
        }) || [];
      },
      CACHE_TTL_DAY
    );
  }
}
