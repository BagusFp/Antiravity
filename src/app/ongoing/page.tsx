import PaginatedAnimeList from "@/components/home/PaginatedAnimeList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Ongoing Releases - MAG",
  description: "Browse and stream currently airing ongoing anime series with up-to-date schedule and subbed episodes in high quality.",
};

export default function OngoingPage() {
  return (
    <PaginatedAnimeList
      title="Ongoing Releases"
      description="Browse currently airing weekly shows with fresh episode updates in real-time."
      apiEndpoint="/api/ongoing"
    />
  );
}
