"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/watch/VideoPlayer";
import { StreamSource } from "@/types/anime";
import { historyStorage } from "@/utils/history";

interface VideoPlayerWrapperProps {
  streamSource: StreamSource | null;
  nextEpisodeId: string | null;
  errorMsg?: string | null;
  animeId: string;
  animeTitle: string;
  episodeNumber: number;
  episodeId: string;
  thumbnail: string;
}

export default function VideoPlayerWrapper({
  streamSource,
  nextEpisodeId,
  errorMsg = null,
  animeId,
  animeTitle,
  episodeNumber,
  episodeId,
  thumbnail,
}: VideoPlayerWrapperProps) {
  const router = useRouter();

  useEffect(() => {
    if (animeId && animeTitle && episodeId) {
      historyStorage.save({
        animeId,
        animeTitle,
        episodeNumber,
        thumbnail,
        watchUrl: `/watch/${encodeURIComponent(episodeId)}`,
      });
    }
  }, [animeId, animeTitle, episodeNumber, episodeId, thumbnail]);

  const handleNextEpisode = () => {
    if (nextEpisodeId) {
      router.push(`/watch/${encodeURIComponent(nextEpisodeId)}`);
    }
  };

  return (
    <VideoPlayer
      streamSource={streamSource}
      onNextEpisode={handleNextEpisode}
      nextEpisodeId={nextEpisodeId}
      errorMsg={errorMsg}
    />
  );
}
