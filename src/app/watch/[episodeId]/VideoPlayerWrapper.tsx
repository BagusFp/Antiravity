"use client";

import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/watch/VideoPlayer";
import { StreamSource } from "@/types/anime";

interface VideoPlayerWrapperProps {
  streamSource: StreamSource | null;
  nextEpisodeId: string | null;
  errorMsg?: string | null;
}

export default function VideoPlayerWrapper({
  streamSource,
  nextEpisodeId,
  errorMsg = null,
}: VideoPlayerWrapperProps) {
  const router = useRouter();

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
