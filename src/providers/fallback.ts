import { AnimeApiService } from "@/services/anime-api";
import { AnimeSearchResult, AnimeDetail, StreamSource, ScheduleItem, HomeData } from "@/types/anime";
import { SamehadakuProvider } from "./samehadaku";
import { KuramanimeProvider } from "./kuramanime";
import { JikanProvider } from "./jikan";

const jikanProvider = new JikanProvider();

class ProviderManager {
  /**
   * Home Data Fetcher:
   * Uses Sanka Anime API home data as primary source, with Jikan API fallback.
   */
  async getHomeData(): Promise<HomeData> {
    try {
      console.log("[Fallback Manager] Fetching Home Data - Primary: Sanka Anime API");
      const data = await AnimeApiService.getHomeData();
      if (data && data.ongoing && data.ongoing.length > 0) {
        return data;
      }
      throw new Error("Empty data returned from Sanka API");
    } catch (error) {
      console.warn("[Fallback Manager] Sanka Anime API home failed. Falling back to Jikan API...", error);
      try {
        const jikanData = await jikanProvider.getHomeData();
        if (jikanData && jikanData.ongoing && jikanData.ongoing.length > 0) {
          return jikanData;
        }
      } catch (jikanErr) {
        console.warn("[Fallback Manager] Jikan API home failed:", jikanErr);
      }
      return this.getMockHomeData();
    }
  }

  /**
   * Search:
   * Direct search to Sanka Anime API with Jikan API fallback
   */
  async search(query: string): Promise<AnimeSearchResult[]> {
    try {
      console.log(`[Fallback Manager] Searching for "${query}" - Primary: Sanka Anime API`);
      const results = await AnimeApiService.searchAnime(query, "otakudesu");
      if (results.length > 0) return results;
      
      throw new Error("No results returned from Sanka Anime API search");
    } catch (error) {
      console.warn(`[Fallback Manager] Sanka search failed. Falling back to Jikan search for "${query}":`, error);
      try {
        return await jikanProvider.search(query);
      } catch (jikanErr) {
        console.warn(`[Fallback Manager] Jikan search also failed:`, jikanErr);
        return [];
      }
    }
  }

  /**
   * Details:
   * Resolves detail via Sanka Anime API with Jikan API fallback
   */
  async getAnimeDetail(id: string): Promise<AnimeDetail> {
    try {
      console.log(`[Fallback Manager] Fetching Details for "${id}" - Primary: Sanka Anime API`);
      return await AnimeApiService.getAnimeDetail(id);
    } catch (error) {
      console.warn(`[Fallback Manager] Sanka details failed for "${id}". Attempting Jikan fallback...`, error);
      const cleanId = id.includes(":") ? id.split(":").slice(-1)[0] : id;
      try {
        return await jikanProvider.getAnimeDetail(cleanId);
      } catch (jikanErr) {
        console.error(`[Fallback Manager] Details failed on both Sanka and Jikan:`, jikanErr);
        throw error;
      }
    }
  }

  /**
   * Stream Sources:
   * Multi-provider extraction: Sanka -> Samehadaku -> Kuramanime -> Resilient Stub Container
   */
  async getStreamSources(episodeId: string): Promise<StreamSource> {
    const rawId = episodeId.includes(":") ? episodeId.split(":").slice(-1)[0] : episodeId;
    const cleanEpId = decodeURIComponent(rawId);

    // 1. Primary: Sanka Anime API
    try {
      console.log(`[Fallback Manager] Loading episode streams for "${cleanEpId}" - Primary: Sanka Anime API`);
      const stream = await AnimeApiService.getEpisodeStream(cleanEpId);
      if (stream && stream.sources && stream.sources.length > 0) {
        return stream;
      }
    } catch (error: any) {
      console.warn(`[Fallback Manager] Sanka Anime API stream loading failed for ${cleanEpId}:`, error.message);
    }

    // 2. Secondary Fallback: Samehadaku Provider
    try {
      console.log(`[Fallback Manager] Trying Samehadaku fallback provider for stream: ${cleanEpId}`);
      const samehadaku = new SamehadakuProvider();
      const stream = await samehadaku.getStreamSources(cleanEpId);
      if (stream && stream.sources && stream.sources.length > 0) {
        return stream;
      }
    } catch (err: any) {
      console.warn(`[Fallback Manager] Samehadaku stream fallback failed for ${cleanEpId}:`, err.message);
    }

    // 3. Tertiary Fallback: Kuramanime Provider
    try {
      console.log(`[Fallback Manager] Trying Kuramanime fallback provider for stream: ${cleanEpId}`);
      const kuramanime = new KuramanimeProvider();
      const stream = await kuramanime.getStreamSources(cleanEpId);
      if (stream && stream.sources && stream.sources.length > 0) {
        return stream;
      }
    } catch (err: any) {
      console.warn(`[Fallback Manager] Kuramanime stream fallback failed for ${cleanEpId}:`, err.message);
    }

    // 4. Return clean empty stream container to allow VideoPlayer error UI to display retry option instead of crashing 500
    const parentAnimeId = cleanEpId.replace(/-episode-\d+.*$/i, "").replace(/-ep-\d+.*$/i, "");
    return {
      animeId: parentAnimeId || cleanEpId,
      sources: [],
      subtitles: [
        {
          url: "https://raw.githubusercontent.com/andreyvit/subtitle-tools/master/sample.vtt",
          lang: "id",
          label: "Bahasa Indonesia",
          default: true,
        }
      ]
    };
  }

  /**
   * Schedules:
   * Dynamic daily scheduler list mapped from Sanka Anime API
   */
  async getSchedule(): Promise<ScheduleItem[]> {
    try {
      console.log("[Fallback Manager] Fetching Schedule - Primary: Sanka Anime API");
      
      // Fetch multiple pages of ongoing anime in parallel
      const pages = [1, 2, 3];
      const pagesResults = await Promise.all(
        pages.map(page => AnimeApiService.getOngoingAnime(page).catch(() => ({ animeList: [], pagination: { currentPage: page, totalPages: 1, hasNextPage: false, nextPage: null } })))
      );
      const ongoing = pagesResults.flatMap(p => p.animeList || []);
      
      if (ongoing && ongoing.length > 0) {
        const daysMap: Record<string, string> = {
          senin: "monday",
          selasa: "tuesday",
          rabu: "wednesday",
          kamis: "thursday",
          jumat: "friday",
          sabtu: "saturday",
          minggu: "sunday"
        };

        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

        return ongoing.map((anime, idx) => {
          // Resolve airing day from releaseDay returned by Sanka API
          const rawDay = (anime.releaseDay || "").toLowerCase().trim();
          let day = daysMap[rawDay];
          
          if (!day) {
            // Deterministic day if not specified by Sanka API
            let hash = 0;
            for (let i = 0; i < anime.id.length; i++) {
              hash = anime.id.charCodeAt(i) + ((hash << 5) - hash);
            }
            day = days[Math.abs(hash) % 7];
          }

          // Deterministic airing time
          let hashTime = 0;
          for (let i = 0; i < anime.title.length; i++) {
            hashTime = anime.title.charCodeAt(i) + ((hashTime << 5) - hashTime);
          }
          const hours = 17 + (Math.abs(hashTime) % 6); // 17:00 to 22:00
          const minutes = (Math.abs(hashTime) % 4) * 15; // 0, 15, 30, 45
          const airingTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

          return {
            id: anime.id,
            title: anime.title,
            image: anime.image,
            airingTime,
            episode: anime.episodesCount || 1,
            day,
            latestReleaseDate: anime.latestReleaseDate || "",
          };
        });
      }
      throw new Error("No ongoing anime returned from Sanka API");
    } catch (error) {
      console.warn("[Fallback Manager] Schedule failed from Sanka API. Falling back to Jikan schedule...", error);
      try {
        const jikanSched = await jikanProvider.getSchedule();
        if (jikanSched && jikanSched.length > 0) {
          return jikanSched;
        }
      } catch (jikanErr) {
        console.warn("[Fallback Manager] Jikan schedule also failed:", jikanErr);
      }
      return this.getMockSchedule();
    }
  }

  /**
   * Recommendations:
   * Context-aware matches based on similar tags
   */
  async getRecommendations(id: string): Promise<AnimeSearchResult[]> {
    try {
      console.log(`[Fallback Manager] Fetching Recommendations for "${id}" - Primary: Sanka Anime API`);
      
      const detail = await AnimeApiService.getAnimeDetail(id).catch((err) => {
        console.warn("[Fallback Manager] Details failed during recommendations fetch:", err.message || err);
        return null;
      });

      if (detail && Array.isArray(detail.genres) && detail.genres.length > 0) {
        const primaryGenre = detail.genres[0];
        if (primaryGenre) {
          const matchingResults = await AnimeApiService.searchAnime(primaryGenre, "otakudesu").catch((err) => {
            console.warn("[Fallback Manager] Search failed during recommendations matching:", err.message || err);
            return [];
          });

          if (Array.isArray(matchingResults)) {
            return matchingResults.filter(a => a && a.id !== id).slice(0, 6);
          }
        }
      }
      return [];
    } catch (error: any) {
      console.error("[Fallback Manager] Recommendations failed. Returning empty list.", error.message || error);
      return [];
    }
  }

  // --- STABLE MOCK BACKUPS ---

  private getMockHomeData(): HomeData {
    const mockCard = (id: string, title: string, img: string, rating: string): AnimeSearchResult => ({
      id,
      title,
      image: img,
      genres: ["Action", "Adventure", "Fantasy"],
      rating,
      type: "TV",
      status: "Ongoing",
      episodesCount: 12,
    });

    const trending = [
      mockCard("otakudesu:naruto-sub-indo", "Naruto: Shippuden [Sub Indo]", "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80", "9.1"),
      mockCard("otakudesu:one-piece-sub-indo", "One Piece [Sub Indo]", "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80", "8.9"),
      mockCard("otakudesu:boruto-sub-indo", "Boruto: Naruto Next Generations [Sub Indo]", "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=600&q=80", "7.3"),
    ];

    return {
      trending,
      popular: trending,
      latestUpdates: trending,
      ongoing: trending,
    };
  }

  private getMockSchedule(): ScheduleItem[] {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    return [
      {
        id: "otakudesu:naruto-sub-indo",
        title: "Naruto: Shippuden [Sub Indo]",
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80",
        airingTime: "22:30",
        episode: 500,
        day: days[new Date().getDay()] || "sunday",
      },
      {
        id: "otakudesu:one-piece-sub-indo",
        title: "One Piece [Sub Indo]",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
        airingTime: "17:30",
        episode: 1090,
        day: days[new Date().getDay()] || "sunday",
      }
    ];
  }
}

export const fallbackManager = new ProviderManager();
export default fallbackManager;
