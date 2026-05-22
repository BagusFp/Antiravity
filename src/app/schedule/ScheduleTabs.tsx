"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Play, Inbox, Calendar, Flame, Sparkles, Tv, Layers } from "lucide-react";
import { ScheduleItem } from "@/types/anime";

interface ScheduleTabsProps {
  scheduleItems: ScheduleItem[];
}

export default function ScheduleTabs({ scheduleItems }: ScheduleTabsProps) {
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
  // Find current day name
  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const todayName = daysOfWeek[todayIndex === 0 ? 6 : todayIndex - 1];

  const [viewMode, setViewMode] = useState<"weekly" | "latest">("weekly");
  const [activeTab, setActiveTab] = useState<string>(todayName);

  // Filter items matching active day for Weekly Schedule (Desktop)
  const activeItems = scheduleItems.filter(
    (item) => item.day.toLowerCase() === activeTab.toLowerCase()
  );

  // Groupings for Latest Releases View
  const newlyReleased = scheduleItems.slice(0, 12);
  const latestUpdates = scheduleItems.slice(12, 24);
  const ongoingReleases = scheduleItems.slice(24);

  // Helper component to render an anime schedule card
  const renderScheduleCard = (item: ScheduleItem) => {
    return (
      <Link
        key={item.id}
        href={`/anime/${encodeURIComponent(item.id)}`}
        className="group block relative flex flex-col space-y-2 animate-fade-in"
      >
        {/* Cover visual */}
        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-muted/20 border border-white/5 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:shadow-accent/15 group-hover:border-accent/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80"}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/40">
              <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Airing Time Badge overlay (bottom left) */}
          {item.airingTime && (
            <div className="absolute bottom-2 left-2 z-10 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#0B0B0F]/90 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-lg">
              <Clock className="w-2.5 h-2.5 text-accent" />
              <span>{item.airingTime}</span>
            </div>
          )}

          {/* Episode Number Badge (top left) */}
          {item.episode && (
            <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded bg-accent text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-md">
              EP {item.episode}
            </div>
          )}

          {/* Latest/New Episode Badge overlay (top right) */}
          <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-green-500/90 text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-md animate-pulse">
            NEW
          </div>
        </div>

        {/* Title and metadata text info */}
        <div className="space-y-0.5 px-0.5">
          <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate group-hover:text-accent transition-colors duration-200">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground">
            <span className="capitalize truncate mr-2">{item.day}</span>
            {item.latestReleaseDate && (
              <span className="bg-white/5 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] text-accent/80 font-bold border border-white/5 shrink-0">
                {item.latestReleaseDate}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Selector tab view switch */}
      <div className="flex items-center space-x-3 sm:space-x-4 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setViewMode("weekly")}
          className={`flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            viewMode === "weekly"
              ? "bg-accent text-white shadow-lg shadow-accent/25"
              : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Schedule</span>
        </button>
        <button
          onClick={() => setViewMode("latest")}
          className={`flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            viewMode === "latest"
              ? "bg-accent text-white shadow-lg shadow-accent/25"
              : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Latest Groupings</span>
        </button>
      </div>

      {viewMode === "weekly" ? (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* 7 Day tab buttons - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex overflow-x-auto gap-2 pb-2 no-scrollbar border-b border-white/5">
            {daysOfWeek.map((day) => {
              const isActive = activeTab === day;
              return (
                <button
                  key={day}
                  onClick={() => setActiveTab(day)}
                  className={`px-5 py-3 rounded-xl text-sm font-bold capitalize transition-all shrink-0 ${
                    isActive
                      ? "bg-accent text-white shadow-lg shadow-accent/25 scale-[1.02]"
                      : "bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Desktop single day grid - Hidden on mobile */}
          <div className="hidden md:block">
            {activeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass rounded-3xl border border-white/5 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Inbox className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">No Scheduled Airings</h3>
                  <p className="text-sm text-muted-foreground">
                    There are no scheduled releases for <span className="capitalize text-accent font-semibold">{activeTab}</span>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {activeItems.map(renderScheduleCard)}
              </div>
            )}
          </div>

          {/* Mobile stacked grouped schedule sections - Hidden on desktop */}
          <div className="md:hidden space-y-8">
            {daysOfWeek.map((day) => {
              const dayItems = scheduleItems.filter(
                (item) => item.day.toLowerCase() === day.toLowerCase()
              );
              if (dayItems.length === 0) return null;
              return (
                <section key={day} className="space-y-4 animate-fade-in">
                  <h3 className="text-base font-bold text-white capitalize border-l-4 border-accent pl-3 tracking-wide">
                    {day}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {dayItems.map(renderScheduleCard)}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-10 sm:space-y-16 animate-fade-in">
          {/* Newly Released Episodes Group */}
          {newlyReleased.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 text-accent">
                  <Flame className="w-5 h-5 animate-pulse" />
                  <span className="text-xs uppercase font-extrabold tracking-widest text-accent/80">
                    Just Dropped
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white border-l-4 border-accent pl-3">
                  Newly Released Episodes
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {newlyReleased.map(renderScheduleCard)}
              </div>
            </section>
          )}

          {/* Latest Updates Group */}
          {latestUpdates.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 text-accent">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs uppercase font-extrabold tracking-widest text-accent/80">
                    Fresh Uploads
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white border-l-4 border-accent pl-3">
                  Latest Updates
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {latestUpdates.map(renderScheduleCard)}
              </div>
            </section>
          )}

          {/* Ongoing Releases Group */}
          {ongoingReleases.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 text-accent">
                  <Tv className="w-5 h-5" />
                  <span className="text-xs uppercase font-extrabold tracking-widest text-accent/80">
                    Airing Seasonal Shows
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white border-l-4 border-accent pl-3">
                  Ongoing Releases
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {ongoingReleases.map(renderScheduleCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
