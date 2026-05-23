import { resilientFetch } from "./fetcher";
import { AnimeSearchResult, AnimeDetail, StreamSource, VideoSource, HomeData, PaginatedAnimeResponse } from "@/types/anime";

// We retrieve NEXT_PUBLIC_ANIME_API from process.env, defaulting to https://www.sankavollerei.com/anime
const API_BASE = process.env.NEXT_PUBLIC_ANIME_API || "https://www.sankavollerei.com/anime";

function convertToStreamUrl(redirectUrl: string): { url: string; isEmbed: boolean } | null {
  if (redirectUrl.includes("pixeldrain.com")) {
    const match = redirectUrl.match(/pixeldrain\.com\/u\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return {
        url: `https://pixeldrain.com/api/file/${match[1]}`,
        isEmbed: false,
      };
    }
  } else if (redirectUrl.includes("mega.nz")) {
    const converted = redirectUrl.replace("/file/", "/embed/");
    return {
      url: converted,
      isEmbed: true,
    };
  } else if (redirectUrl.includes("krakenfiles.com")) {
    const match = redirectUrl.match(/krakenfiles\.com\/view\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return {
        url: `https://krakenfiles.com/embed-video/${match[1]}`,
        isEmbed: true,
      };
    }
  } else if (redirectUrl.includes("acefile.co")) {
    const match = redirectUrl.match(/acefile\.co\/f\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return {
        url: `https://acefile.co/player/${match[1]}`,
        isEmbed: true,
      };
    }
  }
  return null;
}


export class AnimeApiService {
  /**
   * Fetch home page data (ongoing and completed) from Sanka API
   */
  static async getHomeData(): Promise<HomeData> {
    try {
      const url = `${API_BASE}/home`;
      console.log(`[AnimeApiService] Fetching home data from: ${url}`);
      const res = await resilientFetch<any>(url);

      if (res && res.data) {
        const ongoing = (res.data.ongoing?.animeList || []).map((item: any) => ({
          id: `otakudesu:${item.animeId || ""}`,
          title: item.title || "Untitled",
          image: item.poster || "",
          episodesCount: typeof item.episodes === "number" ? item.episodes : parseInt(item.episodes) || undefined,
          status: "Ongoing",
          releaseDay: item.releaseDay || "",
          latestReleaseDate: item.latestReleaseDate || "",
        }));

        const completed = (res.data.completed?.animeList || []).map((item: any) => ({
          id: `otakudesu:${item.animeId || ""}`,
          title: item.title || "Untitled",
          image: item.poster || "",
          rating: item.score || undefined,
          episodesCount: typeof item.episodes === "number" ? item.episodes : parseInt(item.episodes) || undefined,
          status: "Completed",
        }));

        return {
          trending: ongoing.slice(0, 10),
          popular: completed.slice(0, 10),
          latestUpdates: ongoing,
          ongoing: ongoing,
        };
      }
      throw new Error("Invalid home data response payload from Sanka API");
    } catch (error: any) {
      console.error(`[AnimeApiService] Failed to fetch home data:`, error.message || error);
      throw error;
    }
  }

  /**
   * Fetch ongoing anime list from Sanka API
   */
  static async getOngoingAnime(page: number = 1, source: string = "otakudesu"): Promise<PaginatedAnimeResponse> {
    try {
      const url = `${API_BASE}/ongoing-anime?page=${page}`;
      console.log(`[AnimeApiService] Fetching ongoing anime from: ${url}`);
      const res = await resilientFetch<any>(url);

      if (res && res.data && res.data.animeList) {
        const animeList = res.data.animeList.map((item: any) => ({
          id: `otakudesu:${item.animeId || ""}`,
          title: item.title || "Untitled",
          image: item.poster || "",
          episodesCount: typeof item.episodes === "number" ? item.episodes : parseInt(item.episodes) || undefined,
          status: "Ongoing",
          releaseDay: item.releaseDay || "",
          latestReleaseDate: item.latestReleaseDate || "",
        }));

        const pagination = {
          currentPage: res.pagination?.currentPage || page,
          totalPages: res.pagination?.totalPages || 1,
          hasNextPage: res.pagination?.hasNextPage ?? false,
          nextPage: res.pagination?.nextPage ?? null,
        };

        return { animeList, pagination };
      }
      
      return {
        animeList: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          hasNextPage: false,
          nextPage: null,
        }
      };
    } catch (error) {
      console.error(`[AnimeApiService] Failed to fetch ongoing anime:`, error);
      return {
        animeList: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          hasNextPage: false,
          nextPage: null,
        }
      };
    }
  }

  /**
   * Fetch completed anime list from Sanka API (for Popular section)
   */
  static async getCompletedAnime(page: number = 1, source: string = "otakudesu"): Promise<PaginatedAnimeResponse> {
    try {
      const url = `${API_BASE}/complete-anime?page=${page}`;
      console.log(`[AnimeApiService] Fetching completed anime from: ${url}`);
      const res = await resilientFetch<any>(url);

      if (res && res.data && res.data.animeList) {
        const animeList = res.data.animeList.map((item: any) => ({
          id: `otakudesu:${item.animeId || ""}`,
          title: item.title || "Untitled",
          image: item.poster || "",
          rating: item.score || undefined,
          episodesCount: typeof item.episodes === "number" ? item.episodes : parseInt(item.episodes) || undefined,
          status: "Completed",
        }));

        const pagination = {
          currentPage: res.pagination?.currentPage || page,
          totalPages: res.pagination?.totalPages || 1,
          hasNextPage: res.pagination?.hasNextPage ?? false,
          nextPage: res.pagination?.nextPage ?? null,
        };

        return { animeList, pagination };
      }
      
      return {
        animeList: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          hasNextPage: false,
          nextPage: null,
        }
      };
    } catch (error) {
      console.error(`[AnimeApiService] Failed to fetch completed anime:`, error);
      return {
        animeList: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          hasNextPage: false,
          nextPage: null,
        }
      };
    }
  }

  /**
   * Search anime using Sanka API search keyword endpoint
   */
  static async searchAnime(query: string, source: string = "otakudesu"): Promise<AnimeSearchResult[]> {
    try {
      const url = `${API_BASE}/search/${encodeURIComponent(query)}`;
      console.log(`[AnimeApiService] Searching anime for "${query}" from: ${url}`);
      const res = await resilientFetch<any>(url);

      if (res && res.data && res.data.animeList) {
        return res.data.animeList.map((item: any) => ({
          id: `otakudesu:${item.animeId || ""}`,
          title: item.title || "Untitled",
          image: item.poster || "",
          status: item.status || "Unknown",
          rating: item.score || undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error(`[AnimeApiService] Failed to search anime:`, error);
      return [];
    }
  }

  /**
   * Fetch anime details by ID using Sanka API details endpoint
   */
  static async getAnimeDetail(prefixedId: string): Promise<AnimeDetail> {
    const animeId = prefixedId.includes(":") ? prefixedId.split(":")[1] : prefixedId;
    const url = `${API_BASE}/anime/${animeId}`;
    console.log(`[AnimeApiService] Fetching details from: ${url}`);

    try {
      const res = await resilientFetch<any>(url);

      if (res && res.data) {
        const d = res.data;
        
        // Map episodes list robustly
        const episodes = (d.episodeList || []).map((ep: any) => {
          const epNum = typeof ep.eps === "number" ? ep.eps : parseFloat(ep.eps) || 1;
          return {
            id: `otakudesu:${ep.episodeId}`,
            number: epNum,
            title: ep.title || `Episode ${epNum}`,
            releasedDate: ep.date || "",
          };
        });

        // Sort episodes in ascending order
        episodes.sort((a: any, b: any) => a.number - b.number);

        // Normalize genres
        const genres = (d.genreList || []).map((g: any) => g.title).filter(Boolean);

        // Extract synopsis paragraphs and join them as string
        let synopsis = "No synopsis available.";
        if (d.synopsis) {
          if (Array.isArray(d.synopsis.paragraphs)) {
            synopsis = d.synopsis.paragraphs.join("\n\n");
          } else if (typeof d.synopsis === "string") {
            synopsis = d.synopsis;
          }
        }

        return {
          id: `otakudesu:${animeId}`,
          title: d.title || "Untitled",
          image: d.poster || "",
          genres,
          rating: d.score || "8.0",
          synopsis,
          status: d.status || "Unknown",
          episodesCount: episodes.length,
          releasedDate: d.aired || "",
          studio: d.studios || "",
          episodes,
        };
      }
      throw new Error("Invalid detail response payload from Sanka API");
    } catch (err: any) {
      console.error(`[AnimeApiService] Details failed for anime "${animeId}":`, err.message || err);
      throw err;
    }
  }

  /**
   * Get episode streaming sources by ID and resolve mirror servers in parallel
   */
  static async getEpisodeStream(prefixedId: string): Promise<StreamSource> {
    const episodeId = prefixedId.includes(":") ? prefixedId.split(":")[1] : prefixedId;
    const url = `${API_BASE}/episode/${episodeId}`;
    console.log(`[AnimeApiService] Fetching episode from: ${url}`);
    
    try {
      const res = await resilientFetch<any>(url);

      if (res && res.data) {
        const d = res.data;
        const sources: VideoSource[] = [];
        
        // Resolve all servers in parallel so the player can switch dynamically
        if (d.server && Array.isArray(d.server.qualities)) {
          const resolvePromises: Promise<any>[] = [];
          
          for (const q of d.server.qualities) {
            const qualityName = q.title || "HD";
            if (Array.isArray(q.serverList)) {
              for (const server of q.serverList) {
                if (server.serverId) {
                  const promise = (async () => {
                    try {
                      const serverUrl = `${API_BASE}/server/${server.serverId}`;
                      const serverRes = await resilientFetch<any>(serverUrl);
                      if (serverRes && serverRes.data && serverRes.data.url) {
                        let finalUrl = serverRes.data.url;
                        
                        // Parse direct video link from DesuStream if possible
                        if (finalUrl.includes("desustream.info")) {
                          try {
                            const html = await resilientFetch<string>(finalUrl, { timeout: 4000 });
                            const videoMatch = html.match(/<source\s+src="([^"]+)"/i);
                            if (videoMatch && videoMatch[1]) {
                              finalUrl = videoMatch[1];
                              console.log(`[AnimeApiService] Extracted direct video URL from DesuStream: ${finalUrl}`);
                            } else {
                              // Fetch desustream JSON fallback
                              const jsonUrl = `${finalUrl}&mode=json`;
                              const jsonRes = await resilientFetch<any>(jsonUrl, { timeout: 4000 });
                              if (jsonRes && jsonRes.video) {
                                finalUrl = jsonRes.video;
                                console.log(`[AnimeApiService] Extracted direct video JSON URL from DesuStream: ${finalUrl}`);
                              }
                            }
                          } catch (htmlErr: any) {
                            console.warn(`[AnimeApiService] Failed to extract source from desustream link:`, htmlErr.message);
                          }
                        }

                        sources.push({
                          url: finalUrl,
                          quality: `${qualityName} - ${server.title || "Server"}`,
                          isM3U8: finalUrl.includes(".m3u8") || false,
                        });
                      }
                    } catch (err: any) {
                      console.warn(`[AnimeApiService] Failed to resolve server ID ${server.serverId}:`, err.message);
                    }
                  })();
                  resolvePromises.push(promise);
                }
              }
            }
          }

          await Promise.all(resolvePromises);
        }

        // Parse and resolve 1080p and other high-quality mirrors from downloadUrl object robustly
        const downloadData = d.downloadUrl || d.downloads;
        const downloadQualities = Array.isArray(downloadData) ? downloadData : (downloadData?.qualities || []);
        
        if (downloadQualities.length > 0) {
          const downloadPromises: Promise<any>[] = [];
          
          for (const dq of downloadQualities) {
            const title = dq.title || "";
            const qualityMatch = title.match(/(\d+p)/i);
            const qualityName = qualityMatch ? qualityMatch[1] : title;
            
            if (Array.isArray(dq.urls)) {
              for (const link of dq.urls) {
                if (link.url) {
                  const promise = (async () => {
                    try {
                      const resRedirect = await fetch(link.url, { redirect: "manual" });
                      if (resRedirect && (resRedirect.status === 302 || resRedirect.status === 301)) {
                        const redirectUrl = resRedirect.headers.get("location");
                        if (redirectUrl) {
                          const converted = convertToStreamUrl(redirectUrl);
                          if (converted) {
                            sources.push({
                              url: converted.url,
                              quality: `${qualityName} - ${link.title || "Download Mirror"}`,
                              isM3U8: converted.url.includes(".m3u8") || false,
                            });
                            console.log(`[AnimeApiService] Successfully extracted high-quality stream source: ${qualityName} - ${link.title || "Mirror"}`);
                          }
                        }
                      }
                    } catch (err: any) {
                      console.warn(`[AnimeApiService] Failed to resolve high-quality mirror for ${link.title}:`, err.message);
                    }
                  })();
                  downloadPromises.push(promise);
                }
              }
            }
          }
          
          await Promise.all(downloadPromises);
        }

        // Fallback to defaultStreamingUrl if no mirror resolved
        if (sources.length === 0 && d.defaultStreamingUrl) {
          sources.push({
            url: d.defaultStreamingUrl,
            quality: "Default - Server",
            isM3U8: d.defaultStreamingUrl.includes(".m3u8"),
          });
        }

        if (sources.length === 0) {
          throw new Error("No active playable streams resolved for this episode.");
        }

        // Subtitles setup (default Indonesian subtitle sample)
        const subtitles = [
          {
            url: "https://raw.githubusercontent.com/andreyvit/subtitle-tools/master/sample.vtt",
            lang: "id",
            label: "Bahasa Indonesia",
            default: true,
          }
        ];

        return {
          animeId: d.animeId,
          sources,
          subtitles,
        };
      }
      throw new Error("Invalid episode stream response payload from Sanka API");
    } catch (error: any) {
      console.error(`[AnimeApiService] Error getting stream:`, error);
      throw new Error(`[AnimeApiService] Failed to extract stream links for episode "${episodeId}": ${error.message}`);
    }
  }
}
