import { IAnimeProvider } from "./base";
import { AnimeSearchResult, AnimeDetail, StreamSource, Episode } from "@/types/anime";
import { resilientFetch } from "@/services/fetcher";
import { CacheService } from "@/services/cache";
import * as cheerio from "cheerio";

const KURAMANIME_BASE = "https://v18.kuramanime.ing";
const CACHE_TTL_HOUR = 60 * 60 * 1000;

export class KuramanimeProvider implements IAnimeProvider {
  name = "kuramanime";

  private cleanText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
  }

  async search(query: string): Promise<AnimeSearchResult[]> {
    const cacheKey = `kuramanime:search:${query}`;

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const searchUrl = `${KURAMANIME_BASE}/anime?search=${encodeURIComponent(query)}`;
          const html = await resilientFetch<string>(searchUrl, { timeout: 6000 });
          const $ = cheerio.load(html);
          
          const results: AnimeSearchResult[] = [];
          
          $("#animeList .col-lg-4, .anime__item").each((_, el) => {
            const $el = $(el);
            const title = this.cleanText($el.find(".anime__item__text h5 a, h5 a").text());
            const link = $el.find("a").attr("href") || "";
            // Extract the path after /anime/, e.g., "185/naruto"
            const id = link.replace(KURAMANIME_BASE, "").replace("/anime/", "").trim();
            const image = $el.find(".anime__item__pic, img").attr("src") || $el.find("[data-setbg]").attr("data-setbg") || "";
            
            if (title && id) {
              results.push({
                id: `kurama:${id}`,
                title,
                image: image.startsWith("http") ? image : `${KURAMANIME_BASE}${image}`,
                type: "TV",
              });
            }
          });

          return results;
        } catch (error) {
          console.warn(`[Kuramanime Search Error] Failed to search for ${query}:`, error);
          return [];
        }
      },
      15 * 60 * 1000
    );
  }

  async getAnimeDetail(id: string): Promise<AnimeDetail> {
    const cleanId = id.startsWith("kurama:") ? id.split(":")[1] : id;
    const cacheKey = `kuramanime:anime:${cleanId}`;

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const detailUrl = `${KURAMANIME_BASE}/anime/${cleanId}`;
          const html = await resilientFetch<string>(detailUrl, { timeout: 6000 });
          const $ = cheerio.load(html);
          
          const title = this.cleanText($(".anime__details__title h3, h3").first().text());
          const image = $(".anime__details__pic, img").first().attr("src") || $(".anime__details__pic").attr("data-setbg") || "";
          const synopsis = this.cleanText($(".anime__details__text p, p").first().text());
          
          const genres: string[] = [];
          $(".anime__details__widget ul li").each((_, el) => {
            const text = $(el).text();
            if (text.includes("Genre:")) {
              $(el).find("a").each((_, gEl) => {
                genres.push($(gEl).text().trim());
              });
            }
          });

          const episodes: Episode[] = [];
          // Parse all ep-buttons and standard links pointing to episode watch page
          $(".anime__details__episodes a, a[href*='/episode/']").each((_, el) => {
            const $el = $(el);
            const epLink = $el.attr("href") || "";
            if (!epLink || epLink.includes("?page=")) return; // Skip pagination links

            // Extract the path after /anime/, e.g., "185/naruto/episode/1"
            const epId = epLink.replace(KURAMANIME_BASE, "").replace("/anime/", "").trim();
            const epNum = parseFloat($el.text().replace(/\D/g, "")) || episodes.length + 1;

            if (epId && !episodes.some(e => e.id === `kurama:${epId}`)) {
              episodes.push({
                id: `kurama:${epId}`,
                number: epNum,
                title: `Episode ${epNum} [Sub Indo]`,
              });
            }
          });

          return {
            id: `kurama:${cleanId}`,
            title: title || cleanId.split("/")[1]?.replace(/-/g, " ") || cleanId,
            image: image.startsWith("http") ? image : `${KURAMANIME_BASE}${image}`,
            genres,
            rating: "8.2",
            synopsis: synopsis || "No synopsis available.",
            status: "Ongoing",
            episodesCount: episodes.length,
            episodes: episodes.sort((a, b) => a.number - b.number),
          };
        } catch (error) {
          throw new Error(`[Kuramanime Detail Error] Failed scraping for ${cleanId}: ${error}`);
        }
      },
      CACHE_TTL_HOUR
    );
  }

  async getStreamSources(episodeId: string): Promise<StreamSource> {
    const cleanEpId = episodeId.startsWith("kurama:") ? episodeId.split(":")[1] : episodeId;
    const cacheKey = `kuramanime:stream:${cleanEpId}`;

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          // Safety guard: Instantly skip if external provider ID format is passed (e.g. 61316-episode-2)
          if (!cleanEpId.includes("/")) {
            throw new Error(`Invalid ID format for Kuramanime: "${cleanEpId}". Kuramanime URLs require slashes (e.g., "185/naruto/episode/1").`);
          }

          const watchUrl = `${KURAMANIME_BASE}/anime/${cleanEpId}`;
          console.log(`[Kuramanime Pipeline] Requested episode watch URL: ${watchUrl}`);
          
          // Custom cookie jar parsing logic
          let cookies: string[] = [];
          const extractCookies = (headers: Headers) => {
            const setCookies = headers.getSetCookie ? headers.getSetCookie() : [];
            if (setCookies && setCookies.length > 0) {
              for (const cookie of setCookies) {
                const part = cookie.split(";")[0];
                if (part) {
                  const name = part.split("=")[0];
                  cookies = cookies.filter(c => !c.startsWith(`${name}=`));
                  cookies.push(part);
                }
              }
            } else {
              const rawSetCookie = headers.get("set-cookie");
              if (rawSetCookie) {
                const part = rawSetCookie.split(";")[0];
                if (part) {
                  const name = part.split("=")[0];
                  cookies = cookies.filter(c => !c.startsWith(`${name}=`));
                  cookies.push(part);
                }
              }
            }
          };

          const getCookieHeader = () => cookies.join("; ");

          // Strict Chrome browser headers to bypass basic security/bot-detection
          const baseHeaders = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Referer": "https://v18.kuramanime.ing/",
            "Origin": "https://v18.kuramanime.ing",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          };

          // Step 1: Initial request to watch page to establish session & get CSRF
          console.log(`[Kuramanime Pipeline] Step 1: Fetching watch page HTML...`);
          const watchPageRes = await fetch(watchUrl, { headers: baseHeaders });
          extractCookies(watchPageRes.headers);
          const initialHtml = await watchPageRes.text();
          const $initial = cheerio.load(initialHtml);

          // Highly resilient fallback parsers using DOM Selectors + Regex matches
          let csrfToken = $initial('meta[name="csrf-token"]').attr("content");
          if (!csrfToken) {
            const csrfMatch = initialHtml.match(/csrf-token"\s*content="([^"]+)"/) || 
                              initialHtml.match(/"csrf-token":\s*"([^"]+)"/) ||
                              initialHtml.match(/csrfToken\s*=\s*'([^']+)'/);
            if (csrfMatch) csrfToken = csrfMatch[1];
          }

          let checkEpUrl = $initial("#checkEp").val() as string;
          if (!checkEpUrl) {
            const checkEpMatch = initialHtml.match(/id="checkEp"\s*value="([^"]+)"/) ||
                                 initialHtml.match(/checkEpUrl\s*=\s*'([^']+)'/);
            if (checkEpMatch) checkEpUrl = checkEpMatch[1];
          }

          let routeParamValue = $initial("[data-kk]").attr("data-kk") as string;
          if (!routeParamValue) {
            const kkMatch = initialHtml.match(/data-kk="([^"]+)"/) ||
                            initialHtml.match(/data-kk='([^']+)'/);
            if (kkMatch) routeParamValue = kkMatch[1];
          }

          console.log(`[Kuramanime Pipeline] Extracted CSRF Token: ${csrfToken ? "FOUND" : "NOT FOUND"}`);
          console.log(`[Kuramanime Pipeline] Extracted checkEpUrl: ${checkEpUrl ? "FOUND" : "NOT FOUND"}`);
          console.log(`[Kuramanime Pipeline] Extracted routeParamValue: ${routeParamValue ? "FOUND" : "NOT FOUND"}`);

          if (!csrfToken || !checkEpUrl || !routeParamValue) {
            throw new Error("Failed to parse CSRF token, checkEpUrl, or routeParamValue from watch page.");
          }

          // Step 2: Fetch dynamic variable environment keys script
          const envScriptUrl = `${KURAMANIME_BASE}/assets/js/${routeParamValue}.js`;
          console.log(`[Kuramanime Pipeline] Step 2: Fetching environment keys: ${envScriptUrl}`);
          const envScriptRes = await fetch(envScriptUrl, {
            headers: {
              ...baseHeaders,
              "Cookie": getCookieHeader(),
              "Referer": watchUrl,
            }
          });
          extractCookies(envScriptRes.headers);
          const envScript = await envScriptRes.text();

          // Robust environment keys parser using regex mapping
          const prefixAuthMatch = envScript.match(/MIX_PREFIX_AUTH_ROUTE_PARAM:\s*'([^']+)'/);
          const authRouteMatch = envScript.match(/MIX_AUTH_ROUTE_PARAM:\s*'([^']+)'/);
          const authKeyMatch = envScript.match(/MIX_AUTH_KEY:\s*'([^']+)'/);
          const authTokenMatch = envScript.match(/MIX_AUTH_TOKEN:\s*'([^']+)'/);
          const pageTokenMatch = envScript.match(/MIX_PAGE_TOKEN_KEY:\s*'([^']+)'/);
          const streamServerMatch = envScript.match(/MIX_STREAM_SERVER_KEY:\s*'([^']+)'/);

          const prefixAuthRoute = prefixAuthMatch ? prefixAuthMatch[1] : "assets/";
          const authRoute = authRouteMatch ? authRouteMatch[1] : "Ks6sqSgloPTlHMl.txt";
          const authKey = authKeyMatch ? authKeyMatch[1] : "rFj8fp1nxMuNfKq";
          const authToken = authTokenMatch ? authTokenMatch[1] : "ijjAwj6Jze0kscx";
          const pageTokenKey = pageTokenMatch ? pageTokenMatch[1] : "Ub3BzhijicHXZdv";
          const streamServerKey = streamServerMatch ? streamServerMatch[1] : "C2XAPerzX1BM7V9";

          // Step 3: Fetch check-episode endpoint to get the page parameter
          console.log(`[Kuramanime Pipeline] Step 3: Fetching check-episode: ${checkEpUrl}`);
          const checkEpRes = await fetch(checkEpUrl, {
            headers: {
              ...baseHeaders,
              "Cookie": getCookieHeader(),
              "X-CSRF-TOKEN": csrfToken,
              "X-Requested-With": "XMLHttpRequest",
              "Origin": KURAMANIME_BASE,
              "Referer": watchUrl,
            }
          });
          extractCookies(checkEpRes.headers);
          const checkResRaw = await checkEpRes.text();
          const cleanPage = checkResRaw.replace(/"/g, "").trim();

          // Step 4: Fetch security access token
          const tokenUrl = `${KURAMANIME_BASE}/${prefixAuthRoute}${authRoute}`;
          console.log(`[Kuramanime Pipeline] Step 4: Fetching security access token: ${tokenUrl}`);
          const tokenRes = await fetch(tokenUrl, {
            headers: {
              ...baseHeaders,
              "Cookie": getCookieHeader(),
              "X-Fuck-ID": `${authKey}:${authToken}`,
              "X-Request-ID": "abcdef",
              "X-Request-Index": cleanPage,
              "Referer": watchUrl,
            }
          });
          extractCookies(tokenRes.headers);
          const token = (await tokenRes.text()).trim();
          console.log(`[Kuramanime Pipeline] Retrieved dynamic token: ${token}`);

          // Step 5: Post request to load players for kuramadrive
          const playerUrl = `${KURAMANIME_BASE}/anime/${cleanEpId}?${pageTokenKey}=${token}&${streamServerKey}=kuramadrive&page=${cleanPage}`;
          console.log(`[Kuramanime Pipeline] Step 5: Fetching loaded player HTML: ${playerUrl}`);
          const playerRes = await fetch(playerUrl, {
            method: "POST",
            headers: {
              ...baseHeaders,
              "Cookie": getCookieHeader(),
              "X-CSRF-TOKEN": csrfToken,
              "X-Requested-With": "XMLHttpRequest",
              "Origin": KURAMANIME_BASE,
              "Referer": watchUrl,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "authorization=kJuHHkaqcBFXiGMHQf6bJw8YAyDcwGD8Ur",
          });
          extractCookies(playerRes.headers);
          const playerHtml = await playerRes.text();
          const $ = cheerio.load(playerHtml);

          const sources: { url: string; quality: string; isM3U8: boolean }[] = [];

          // Parse direct video files (Kuramadrive s1)
          $("video source, source").each((_, el) => {
            const $el = $(el);
            const src = $el.attr("src") || "";
            const quality = $el.attr("size") || "HD";
            if (src) {
              sources.push({
                url: src,
                quality: `${quality}p`,
                isM3U8: src.includes(".m3u8"),
              });
            }
          });

          // Parse active mirror hosts from iframe elements (FileMoon, StreamWish, Mega)
          $("iframe").each((_, el) => {
            const src = $(el).attr("src") || "";
            if (src) {
              const url = src.startsWith("//") ? `https:${src}` : src;
              let quality = "HD Embed";
              
              if (url.includes("filemoon")) {
                quality = "FileMoon";
              } else if (url.includes("streamwish") || url.includes("wishembed")) {
                quality = "StreamWish";
              } else if (url.includes("mega.nz")) {
                quality = "Mega";
              } else if (url.includes("kuramadrive") || url.includes("asuna.my.id")) {
                quality = "Kuramadrive";
              }

              sources.push({
                url,
                quality,
                isM3U8: url.includes(".m3u8"),
              });
            }
          });

          if (sources.length === 0) {
            throw new Error("No playable streaming sources found inside the loaded player.");
          }

          console.log(`[Kuramanime Pipeline] Successfully extracted stream sources:`, JSON.stringify(sources, null, 2));

          return {
            sources,
            subtitles: [
              {
                url: "https://raw.githubusercontent.com/andreyvit/subtitle-tools/master/sample.vtt",
                lang: "id",
                label: "Bahasa Indonesia",
                default: true,
              }
            ],
          };

        } catch (error: any) {
          console.error(`[Kuramanime Stream Error] Failed to extract streams for ${cleanEpId}:`, error);
          throw new Error(`[Kuramanime Stream Error] Failed to extract streams for ${cleanEpId}: ${error.message}`);
        }
      },
      CACHE_TTL_HOUR * 2
    );
  }
}
