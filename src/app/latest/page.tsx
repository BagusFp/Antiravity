import PaginatedAnimeList from "@/components/home/PaginatedAnimeList";

export const metadata = {
  title: "Latest Episodes - MAG",
  description: "Get the absolute freshest episode releases and quick anime updates as soon as they air.",
};

export default function LatestPage() {
  return (
    <PaginatedAnimeList
      title="Latest Updates"
      description="Stay on top of recently uploaded episodes and freshly subbed releases."
      apiEndpoint="/api/latest"
    />
  );
}
