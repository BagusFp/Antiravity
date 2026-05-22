export interface AnimeSearchResult {
  id: string;
  title: string;
  image: string;
  genres?: string[];
  rating?: string;
  type?: string;
  status?: string;
  episodesCount?: number;
  releaseDay?: string;
  latestReleaseDate?: string;
}

export interface Episode {
  id: string;
  number: number;
  title?: string;
  releasedDate?: string;
}

export interface AnimeDetail {
  id: string;
  title: string;
  image: string;
  genres: string[];
  rating?: string;
  synopsis?: string;
  status?: string;
  episodesCount?: number;
  studio?: string;
  releasedDate?: string;
  episodes: Episode[];
}

export interface VideoSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface SubtitleTrack {
  url: string;
  lang: string;
  label: string;
  default?: boolean;
}

export interface StreamSource {
  animeId?: string;
  sources: VideoSource[];
  subtitles: SubtitleTrack[];
  headers?: Record<string, string>;
}

export interface ScheduleItem {
  id: string;
  title: string;
  image: string;
  airingTime: string;
  episode: number;
  day: string; // e.g., 'monday', 'tuesday', etc.
  latestReleaseDate?: string;
}

export interface HomeData {
  trending: AnimeSearchResult[];
  popular: AnimeSearchResult[];
  latestUpdates: AnimeSearchResult[];
  ongoing: AnimeSearchResult[];
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

export interface PaginatedAnimeResponse {
  animeList: AnimeSearchResult[];
  pagination: PaginationMetadata;
}

