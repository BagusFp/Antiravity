import PaginatedAnimeList from "@/components/home/PaginatedAnimeList";

export const metadata = {
  title: "Popular Completed Anime - MAG",
  description: "Explore the most popular finished series and community favorites on MAG with full episode archives.",
};

export default function PopularPage() {
  return (
    <PaginatedAnimeList
      title="All-Time Popular"
      description="Explore completed series and all-time fan favorites loved by the community."
      apiEndpoint="/api/popular"
    />
  );
}
