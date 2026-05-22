import { AnimeApiService } from "@/services/anime-api";
import { AnimeSearchResult, AnimeDetail, StreamSource, ScheduleItem, HomeData } from "@/types/anime";

class ProviderManager {
  /**
   * Home Data Fetcher:
   * Uses Sanka Anime API home data as primary source.
   */
  async getHomeData(): Promise<HomeData> {
    try {
      console.log("[Fallback Manager] Fetching Home Data - Primary: Sanka Anime API");
      return await AnimeApiService.getHomeData();
    } catch (error) {
      console.error("[Fallback Manager] Sanka Anime API home failed. Returning premium fallbacks.", error);
      return this.getMockHomeData();
    }
  }

  /**
   * Search:
   * Direct search to Sanka Anime API
   */
  async search(query: string): Promise<AnimeSearchResult[]> {
    try {
      console.log(`[Fallback Manager] Searching for "${query}" - Primary: Sanka Anime API`);
      const results = await AnimeApiService.searchAnime(query, "otakudesu");
      if (results.length > 0) return results;
      
      throw new Error("No results returned from Sanka Anime API search");
    } catch (error) {
      console.warn(`[Fallback Manager] Search failed. Returning empty list:`, error);
      return [];
    }
  }

  /**
   * Details:
   * Resolves detail via Sanka Anime API
   */
  async getAnimeDetail(id: string): Promise<AnimeDetail> {
    try {
      console.log(`[Fallback Manager] Fetching Details for "${id}" - Primary: Sanka Anime API`);
      return await AnimeApiService.getAnimeDetail(id);
    } catch (error) {
      console.error(`[Fallback Manager] Details failed for "${id}".`, error);
      throw error;
    }
  }

  /**
   * Stream Sources:
   * Direct extraction from Sanka Anime API backend
   */
  async getStreamSources(episodeId: string): Promise<StreamSource> {
    try {
      console.log(`[Fallback Manager] Loading episode streams for "${episodeId}" - Primary: Sanka Anime API`);
      const stream = await AnimeApiService.getEpisodeStream(episodeId);
      
      if (stream && stream.sources && stream.sources.length > 0) {
        return stream;
      }
      throw new Error("No active real streams extracted");
    } catch (error) {
      console.error(`[Fallback Manager] Sanka Anime API stream loading failed for ${episodeId}:`, error);
      throw error;
    }
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
      return this.getMockSchedule();
    } catch (error) {
      console.error("[Fallback Manager] Schedule failed. Returning mock list.");
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
      const detail = await AnimeApiService.getAnimeDetail(id);
      if (detail && detail.genres.length > 0) {
        const matchingResults = await AnimeApiService.searchAnime(detail.genres[0], "otakudesu");
        return matchingResults.filter(a => a.id !== id).slice(0, 6);
      }
      return [];
    } catch (error) {
      console.error("[Fallback Manager] Recommendations failed. Returning empty list.");
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
