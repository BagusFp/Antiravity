import { AnimeSearchResult, AnimeDetail, StreamSource, ScheduleItem, HomeData } from "@/types/anime";

export interface IAnimeProvider {
  name: string;
  
  getHomeData?(): Promise<HomeData>;
  search?(query: string): Promise<AnimeSearchResult[]>;
  getAnimeDetail?(id: string): Promise<AnimeDetail>;
  getStreamSources?(episodeId: string): Promise<StreamSource>;
  getSchedule?(): Promise<ScheduleItem[]>;
  getRecommendations?(id: string): Promise<AnimeSearchResult[]>;
}
