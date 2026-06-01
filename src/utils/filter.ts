import { AnimeSearchResult } from "@/types/anime";
import { FilterState } from "@/components/common/FilterDrawer";

export function applyFilters(items: AnimeSearchResult[], filters: FilterState): AnimeSearchResult[] {
  let result = [...items];

  // 1. Filter by Status
  if (filters.status && filters.status !== "All") {
    result = result.filter((item) => {
      const itemStatus = (item.status || "").toLowerCase();
      const title = (item.title || "").toLowerCase();
      const targetStatus = filters.status.toLowerCase();
      
      if (targetStatus === "ongoing") {
        return (
          itemStatus.includes("ongoing") ||
          itemStatus.includes("airing") ||
          itemStatus.includes("lancar") ||
          title.includes("[ongoing]") ||
          title.includes("ongoing")
        );
      }
      if (targetStatus === "completed") {
        return (
          itemStatus.includes("completed") ||
          itemStatus.includes("complete") ||
          itemStatus.includes("tamat") ||
          itemStatus.includes("finish") ||
          title.includes("[completed]") ||
          title.includes("completed")
        );
      }
      if (targetStatus === "upcoming") {
        return (
          itemStatus.includes("upcoming") ||
          itemStatus.includes("yet to") ||
          itemStatus.includes("akan")
        );
      }
      return itemStatus.includes(targetStatus);
    });
  }

  // 2. Filter by Type
  if (filters.type && filters.type !== "All") {
    result = result.filter((item) => {
      const targetType = filters.type.toLowerCase();
      
      if (item.type) {
        return item.type.toLowerCase() === targetType;
      }
      
      const title = (item.title || "").toLowerCase();
      if (targetType === "movie") {
        return (
          title.includes("movie") ||
          title.includes("gekijouban") ||
          title.includes("film") ||
          title.includes("the movie")
        );
      }
      if (targetType === "ova") {
        return title.includes("ova") || title.includes("oad") || title.includes("special episode");
      }
      if (targetType === "special") {
        return (
          title.includes("special") ||
          title.includes("sp ") ||
          title.endsWith(" sp") ||
          title.includes("specials")
        );
      }
      if (targetType === "tv") {
        const isOther =
          title.includes("movie") ||
          title.includes("gekijouban") ||
          title.includes("film") ||
          title.includes("ova") ||
          title.includes("oad") ||
          title.includes("special");
        return !isOther;
      }
      return true;
    });
  }

  // 3. Filter by Rating (Minimum Rating filter, e.g. "9.0+")
  if (filters.rating && filters.rating !== "All") {
    const minRating = parseFloat(filters.rating);
    if (!isNaN(minRating)) {
      result = result.filter((item) => {
        // Fallback for known anime ratings if not set
        let itemRatingStr = item.rating;
        if (!itemRatingStr) {
          if (item.id.includes("naruto") || item.title.includes("Naruto")) itemRatingStr = "8.3";
          else if (item.id.includes("one-piece") || item.title.includes("One Piece")) itemRatingStr = "8.9";
          else if (item.id.includes("evangelion") || item.title.includes("Evangelion")) itemRatingStr = "9.1";
          else itemRatingStr = "7.5"; // average default
        }
        const itemRating = parseFloat(itemRatingStr) || 0.0;
        return itemRating >= minRating;
      });
    }
  }

  // 4. Filter by Genre
  if (filters.genre && filters.genre !== "All") {
    result = result.filter((item) => {
      const targetGenre = filters.genre.toLowerCase();
      
      if (item.genres && item.genres.length > 0) {
        return item.genres.some((g) => g.toLowerCase().includes(targetGenre));
      }
      
      const title = (item.title || "").toLowerCase();
      if (targetGenre === "isekai") {
        return (
          title.includes("isekai") ||
          title.includes("reborn") ||
          title.includes("another world") ||
          title.includes("dunia lain") ||
          title.includes("tensei")
        );
      }
      if (targetGenre === "action") {
        return (
          title.includes("battle") ||
          title.includes("fight") ||
          title.includes("warrior") ||
          title.includes("slayer") ||
          title.includes("kaisen") ||
          title.includes("shingeki") ||
          title.includes("hunter") ||
          title.includes("sword") ||
          title.includes("gundam") ||
          title.includes("hero")
        );
      }
      if (targetGenre === "sports") {
        return (
          title.includes("sport") ||
          title.includes("ball") ||
          title.includes("tennis") ||
          title.includes("basket") ||
          title.includes("soccer") ||
          title.includes("football") ||
          title.includes("haikyu") ||
          title.includes("blue lock") ||
          title.includes("yowamushi") ||
          title.includes("shippuden")
        );
      }
      if (targetGenre === "fantasy") {
        return (
          title.includes("magic") ||
          title.includes("mage") ||
          title.includes("fantasy") ||
          title.includes("demon") ||
          title.includes("sword") ||
          title.includes("tensei") ||
          title.includes("maou") ||
          title.includes("witch")
        );
      }
      if (targetGenre === "romance") {
        return (
          title.includes("love") ||
          title.includes("romance") ||
          title.includes("kanojo") ||
          title.includes("girlfriend") ||
          title.includes("boyfriend") ||
          title.includes("married") ||
          title.includes("kekkon") ||
          title.includes("kimi")
        );
      }
      if (targetGenre === "comedy") {
        return (
          title.includes("comedy") ||
          title.includes("funny") ||
          title.includes("asobi") ||
          title.includes("nichijou") ||
          title.includes("baka")
        );
      }
      if (targetGenre === "mecha") {
        return (
          title.includes("mecha") ||
          title.includes("gundam") ||
          title.includes("robot") ||
          title.includes("evangelion") ||
          title.includes("code geass")
        );
      }
      if (targetGenre === "slice of life") {
        return (
          title.includes("slice of life") ||
          title.includes("school") ||
          title.includes("club") ||
          title.includes("camp") ||
          title.includes("room") ||
          title.includes("friends") ||
          title.includes("nichijou")
        );
      }
      if (targetGenre === "supernatural") {
        return (
          title.includes("supernatural") ||
          title.includes("spirit") ||
          title.includes("ghost") ||
          title.includes("yokai") ||
          title.includes("mononoke") ||
          title.includes("bakemonogatari") ||
          title.includes("demon")
        );
      }
      if (targetGenre === "mystery") {
        return (
          title.includes("mystery") ||
          title.includes("detective") ||
          title.includes("conan") ||
          title.includes("hyouka") ||
          title.includes("death note")
        );
      }
      if (targetGenre === "shounen") {
        return (
          title.includes("naruto") ||
          title.includes("one piece") ||
          title.includes("bleach") ||
          title.includes("dbz") ||
          title.includes("dragon ball") ||
          title.includes("black clover") ||
          title.includes("hero academia") ||
          title.includes("shippuden") ||
          title.includes("kaisen")
        );
      }
      return title.includes(targetGenre);
    });
  }

  // 5. Filter by Year
  if (filters.year && filters.year !== "All") {
    result = result.filter((item) => {
      const dateStr = `${item.latestReleaseDate || ""} ${item.releaseDay || ""} ${item.title || ""}`;
      const yearMatch = dateStr.match(/\b(20\d{2}|19\d{2})\b/);
      let itemYear: number | null = yearMatch ? parseInt(yearMatch[1], 10) : null;
      
      if (!itemYear) {
        if (item.id.includes("naruto")) itemYear = 2007;
        else if (item.id.includes("one-piece")) itemYear = 1999;
        else if (item.id.includes("boruto")) itemYear = 2017;
        else if (item.id.includes("evangelion")) itemYear = 1995;
        else {
          itemYear = item.status === "Ongoing" ? 2026 : 2025;
        }
      }

      const targetYear = filters.year;
      if (targetYear === "2010s") {
        return itemYear >= 2010 && itemYear <= 2019;
      }
      if (targetYear === "2000s") {
        return itemYear >= 2000 && itemYear <= 2009;
      }
      if (targetYear === "Older") {
        return itemYear < 2000;
      }
      
      const targetYearNum = parseInt(targetYear, 10);
      if (!isNaN(targetYearNum)) {
        return itemYear === targetYearNum;
      }
      return true;
    });
  }

  // 6. Sort By
  if (filters.sortBy) {
    const sortVal = filters.sortBy.toLowerCase();
    if (sortVal === "most popular" || sortVal === "highest rated") {
      result.sort((a, b) => {
        const rA = parseFloat(a.rating || "0") || (a.title.includes("One Piece") || a.title.includes("Naruto") ? 9.0 : 7.0);
        const rB = parseFloat(b.rating || "0") || (b.title.includes("One Piece") || b.title.includes("Naruto") ? 9.0 : 7.0);
        return rB - rA; 
      });
    } else if (sortVal === "a-z") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortVal === "latest update") {
      result.sort((a, b) => {
        const dateA = a.latestReleaseDate ? new Date(a.latestReleaseDate).getTime() : 0;
        const dateB = b.latestReleaseDate ? new Date(b.latestReleaseDate).getTime() : 0;
        if (dateA && dateB) {
          return dateB - dateA;
        }
        return 0; 
      });
    }
  }

  return result;
}
