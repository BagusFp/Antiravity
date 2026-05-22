import { Calendar, Compass } from "lucide-react";
import fallbackManager from "@/providers/fallback";
import ScheduleTabs from "./ScheduleTabs";

export const revalidate = 14400; // Cache weekly schedules for 4 hours

export default async function SchedulePage() {
  const scheduleItems = await fallbackManager.getSchedule();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#0B0B0F]">
      
      {/* Header Description */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-accent" />
          <span>Release Schedule</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Keep track of new episodes airing weekly. Airing times are listed in local television broadcast hours.
        </p>
      </div>

      {/* Scheduler Tab Grid Component */}
      <ScheduleTabs scheduleItems={scheduleItems} />
    </div>
  );
}
