import fallbackManager from "@/providers/fallback";
import HeroBanner from "@/components/home/HeroBanner";
import AnimeCarousel from "@/components/home/AnimeCarousel";
import { Sparkles, Tv, Flame, TrendingUp } from "lucide-react";

// Opt-out of static rendering to ensure Jikan API updates are dynamic
export const revalidate = 900; // Revalidate at most every 15 minutes

export default async function HomePage() {
  const homeData = await fallbackManager.getHomeData();

  // Pick a featured show for the cinematic banner (first ongoing or Evangelion)
  const featured = (homeData.ongoing && homeData.ongoing[0]) || (homeData.trending && homeData.trending[0]) || {
    id: "21",
    title: "Neon Genesis Evangelion",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80",
    rating: "9.1",
    genres: ["Action", "Sci-Fi", "Mecha", "Psychological"],
  };

  return (
    <div className="flex flex-col space-y-12 pb-16 bg-[#0B0B0F]">
      
      {/* Cinematic Banner */}
      <HeroBanner featured={featured} />

      {/* Main Catalog Slider Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-16">

        {/* Ongoing Slides */}
        <section className="animate-fade-in">
          <div className="flex items-center space-x-2 text-accent mb-1 px-4 sm:px-0">
            <Tv className="w-5 h-5 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-accent/80">
              Airing Right Now
            </span>
          </div>
          <AnimeCarousel title="Ongoing Releases" items={homeData.ongoing} viewMoreHref="/ongoing" />
        </section>

        {/* Popular Slides */}
        <section className="animate-fade-in">
          <div className="flex items-center space-x-2 text-accent mb-1 px-4 sm:px-0">
            <Flame className="w-5 h-5" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-accent/80">
              Community Favorites
            </span>
          </div>
          <AnimeCarousel title="All-Time Popular" items={homeData.popular} viewMoreHref="/popular" />
        </section>

        {/* Latest Updates Slides */}
        <section className="animate-fade-in">
          <div className="flex items-center space-x-2 text-accent mb-1 px-4 sm:px-0">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-accent/80">
              Fresh Releases
            </span>
          </div>
          <AnimeCarousel title="Latest Updates" items={homeData.latestUpdates} viewMoreHref="/latest" />
        </section>
      </div>
    </div>
  );
}
