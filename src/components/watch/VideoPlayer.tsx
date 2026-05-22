"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  FastForward,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { StreamSource, VideoSource, SubtitleTrack } from "@/types/anime";

interface VideoPlayerProps {
  streamSource: StreamSource | null;
  onNextEpisode?: () => void;
  nextEpisodeId?: string | null;
  errorMsg?: string | null;
}

export default function VideoPlayer({
  streamSource,
  onNextEpisode,
  nextEpisodeId,
  errorMsg = null,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Switching quality source trackers
  const prevTimeRef = useRef<number>(0);
  const prevPlayingRef = useRef<boolean>(false);
  const isSwitchingSourceRef = useRef<boolean>(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Source selection states
  const [activeSource, setActiveSource] = useState<VideoSource | null>(null);
  const [activeSubtitle, setActiveSubtitle] = useState<SubtitleTrack | null>(null);
  
  // UI states
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);

  // Initialize Source and Subtitles on mount/change
  useEffect(() => {
    if (streamSource && streamSource.sources && streamSource.sources.length > 0) {
      console.log("[VideoPlayer] Detected mirrors:", streamSource.sources);
      const qualities = Array.from(new Set(streamSource.sources.map((s) => s.quality)));
      console.log("[VideoPlayer] Detected qualities:", qualities);

      setActiveSource(streamSource.sources[0]);
    } else {
      setActiveSource(null);
    }
    
    if (streamSource && streamSource.subtitles) {
      const defaultSub = streamSource.subtitles.find((sub) => sub.default) || streamSource.subtitles[0] || null;
      setActiveSubtitle(defaultSub);
    } else {
      setActiveSubtitle(null);
    }
    setNextCountdown(null);
  }, [streamSource]);

  // Load HLS or normal MP4 stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSource) return;

    console.log("[VideoPlayer] Selected source:", activeSource.quality);
    console.log("[VideoPlayer] Stream URL:", activeSource.url);

    // Reset player states if we are not in the middle of a seamless quality switch
    if (!isSwitchingSourceRef.current) {
      setIsPlaying(false);
    }
    
    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (activeSource.isM3U8 && Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 30, // 30 seconds buffer
        enableWorker: true,
      });

      hlsRef.current = hls;
      hls.loadSource(activeSource.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Ready to play
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS fatal network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS fatal media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable HLS error, recreating...");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari native HLS support
      video.src = activeSource.url;
    } else {
      // Normal MP4 URL or generic video
      video.src = activeSource.url;
    }
  }, [activeSource]);

  // Handle Controls Fading Timer
  useEffect(() => {
    let controlsTimer: NodeJS.Timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(controlsTimer);
      controlsTimer = setTimeout(() => {
        if (isPlaying && !showSettingsMenu && !showSubtitleMenu) {
          setShowControls(false);
        }
      }, 3500);
    };

    const container = playerContainerRef.current;
    if (container) {
      container.addEventListener("mousemove", resetTimer);
      container.addEventListener("click", resetTimer);
      container.addEventListener("touchstart", resetTimer);
    }

    return () => {
      container?.removeEventListener("mousemove", resetTimer);
      container?.removeEventListener("click", resetTimer);
      container?.removeEventListener("touchstart", resetTimer);
      clearTimeout(controlsTimer);
    };
  }, [isPlaying, showSettingsMenu, showSubtitleMenu]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only execute if user isn't typing in an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.currentTime + 10, video.duration || 0);
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(video.currentTime - 10, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.min(prev + 0.05, 1);
            video.volume = next;
            return next;
          });
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.max(prev - 0.05, 0);
            video.volume = next;
            return next;
          });
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [volume, isMuted, isFullscreen]);

  // Countdown timer for Auto-Next
  useEffect(() => {
    if (nextCountdown === null) return;

    if (nextCountdown <= 0) {
      setNextCountdown(null);
      if (onNextEpisode) onNextEpisode();
      return;
    }

    const timer = setTimeout(() => {
      setNextCountdown((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [nextCountdown, onNextEpisode]);

  const handleSourceChange = (src: VideoSource) => {
    console.log("[VideoPlayer] Switching source to:", src.quality);
    console.log("[VideoPlayer] Stream URL:", src.url);
    
    const video = videoRef.current;
    if (video) {
      prevTimeRef.current = video.currentTime;
      prevPlayingRef.current = !video.paused;
      isSwitchingSourceRef.current = true;
    }
    setActiveSource(src);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    setDuration(video.duration);

    if (isSwitchingSourceRef.current) {
      isSwitchingSourceRef.current = false;
      
      // Restore current time
      if (prevTimeRef.current > 0) {
        console.log(`[VideoPlayer] Restoring playback time to: ${prevTimeRef.current}s`);
        video.currentTime = prevTimeRef.current;
        setCurrentTime(prevTimeRef.current);
      }

      // Restore playback state
      if (prevPlayingRef.current) {
        console.log("[VideoPlayer] Resuming playback after quality switch");
        video.play().catch((err) => console.log("Restore play failed: ", err));
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch((err) => console.log("Play failed: ", err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
    video.muted = vol === 0;
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettingsMenu(false);
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Handles visual fullscreen updates from browser buttons/escapes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (nextEpisodeId && onNextEpisode) {
      setNextCountdown(5); // 5-second countdown to autoplay next episode
    }
  };

  const formatTime = (time: number) => {
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isEmbed = activeSource
    ? (!activeSource.isM3U8 &&
        (activeSource.url.includes("embed") ||
          activeSource.url.includes("iframe") ||
          activeSource.url.includes("player") ||
          activeSource.quality === "HD Embed" ||
          activeSource.quality.includes("Embed") ||
          (!activeSource.url.includes(".m3u8") && !activeSource.url.includes(".mp4") && !activeSource.url.includes("googlevideo") && !activeSource.url.includes("videoplayback"))))
    : false;

  return (
    <div className="flex flex-col space-y-6 w-full animate-fade-in">
      <div
        ref={playerContainerRef}
        className="relative w-full aspect-video rounded-2xl bg-black border border-white/5 shadow-2xl overflow-hidden group select-none"
      >
      {/* HTML5 Native Video Tag / Iframe Embed / Fallback Error UI */}
      {errorMsg ? (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in z-40">
          <div className="w-16 h-16 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10">
            <VolumeX className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-bold text-white tracking-wide">
              Extraction Error / Server Offline
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We encountered a temporary problem extracting stream links from our providers. Select another episode or mirror:
            </p>
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs font-mono text-purple-300 break-words whitespace-pre-wrap overflow-x-auto max-h-32 text-left select-all">
              {errorMsg}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 font-semibold text-white transition-all shadow-md shadow-purple-600/20 text-sm animate-pulse"
            >
              Retry Connection
            </button>
            <a
              href="/"
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all text-sm font-semibold"
            >
              Return Home
            </a>
          </div>
        </div>
      ) : isEmbed && activeSource ? (
        <iframe
          src={activeSource.url}
          className="w-full h-full border-0 rounded-2xl"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Video Playback Embed"
        />
      ) : (
        /* eslint-disable-next-line jsx-a11y/media-has-caption */
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        >
          {activeSubtitle && (
            <track
              src={activeSubtitle.url}
              kind="subtitles"
              srcLang={activeSubtitle.lang}
              label={activeSubtitle.label}
              default
            />
          )}
        </video>
      )}

      {/* Auto-Next Autoplay Countdown Overlay */}
      {nextCountdown !== null && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-5 animate-fade-in">
          <div className="flex items-center space-x-2 text-accent">
            <Sparkles className="w-8 h-8 animate-pulse" />
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Playing Next Episode
            </h2>
          </div>
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Visual SVG Circular track */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                className="stroke-muted fill-none stroke-[6px]"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                className="stroke-accent fill-none stroke-[6px] transition-all duration-1000"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * nextCountdown) / 5}
              />
            </svg>
            <span className="absolute text-3xl font-extrabold text-white">
              {nextCountdown}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setNextCountdown(null);
                if (onNextEpisode) onNextEpisode();
              }}
              className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover font-semibold text-white transition-all shadow-md shadow-accent/20"
            >
              Play Now
            </button>
            <button
              onClick={() => setNextCountdown(null)}
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Big Play Overlay (appears when paused) */}
      {!isEmbed && !isPlaying && nextCountdown === null && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer animate-fade-in"
        >
          <div className="w-16 h-16 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-lg shadow-accent/40 scale-100 hover:scale-110 active:scale-95 transition-all duration-200">
            <Play className="w-7 h-7 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Custom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 w-full z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-4 px-4 flex flex-col space-y-3 transition-opacity duration-300 ${
          showControls && !isEmbed ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Seek slider */}
        <div className="flex items-center space-x-3 w-full group/seek">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-full accent-accent bg-white/20 cursor-pointer transition-all focus:outline-none hover:h-2"
          />
        </div>

        {/* Action Panel buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-accent transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>

            {/* Next Episode Button */}
            {nextEpisodeId && (
              <button
                onClick={onNextEpisode}
                title="Play next episode"
                className="text-white hover:text-accent transition-colors"
              >
                <FastForward className="w-5 h-5" />
              </button>
            )}

            {/* Muted Volume */}
            <div className="flex items-center space-x-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-accent transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 accent-accent bg-white/20 rounded-full h-1 transition-all duration-300 cursor-pointer focus:outline-none"
              />
            </div>

            {/* Time Stamp display */}
            <span className="text-xs text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-4 relative">
            {/* Subtitles Button selector */}
            {streamSource && streamSource.subtitles && streamSource.subtitles.length > 0 && (
              <div>
                <button
                  onClick={() => {
                    setShowSubtitleMenu(!showSubtitleMenu);
                    setShowSettingsMenu(false);
                  }}
                  className={`transition-colors ${
                    activeSubtitle ? "text-accent" : "text-white hover:text-accent"
                  }`}
                >
                  <Subtitles className="w-5 h-5" />
                </button>

                {/* Subtitles Dropdown */}
                {showSubtitleMenu && (
                  <div className="absolute bottom-12 right-0 sm:right-16 glass border border-white/5 rounded-xl py-2 px-1 w-44 max-h-48 overflow-y-auto z-30 animate-fade-in text-xs sm:text-sm shadow-2xl scrollbar-thin">
                    <div className="px-3 py-1 text-xs text-muted-foreground font-semibold border-b border-white/5 pb-1 mb-1">
                      Subtitles
                    </div>
                    <button
                      onClick={() => {
                        setActiveSubtitle(null);
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                        activeSubtitle === null
                          ? "bg-accent/20 text-accent font-bold"
                          : "text-white hover:bg-white/5"
                      }`}
                    >
                      Turn Off
                    </button>
                    {streamSource.subtitles.map((sub) => (
                      <button
                        key={sub.url}
                        onClick={() => {
                          setActiveSubtitle(sub);
                          setShowSubtitleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors truncate ${
                          activeSubtitle?.url === sub.url
                            ? "bg-accent/20 text-accent font-bold"
                            : "text-white hover:bg-white/5"
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings (Quality, speed) */}
            <div>
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowSubtitleMenu(false);
                }}
                className="text-white hover:text-accent transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Settings Dropdown */}
              {showSettingsMenu && (
                <div className="absolute bottom-12 right-0 sm:right-8 glass border border-white/5 rounded-xl py-2 px-1 w-52 max-h-60 overflow-y-auto z-30 animate-fade-in text-xs sm:text-sm shadow-2xl space-y-1 scrollbar-thin">
                  <div className="px-3 py-1 text-xs text-muted-foreground font-semibold border-b border-white/5 pb-1">
                    Quality Selector
                  </div>
                  {streamSource && streamSource.sources && streamSource.sources.map((src) => (
                    <button
                      key={src.url}
                      onClick={() => {
                        handleSourceChange(src);
                        setShowSettingsMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors truncate ${
                        activeSource?.url === src.url
                          ? "bg-accent/20 text-accent font-bold"
                          : "text-white hover:bg-white/5"
                      }`}
                    >
                      {src.quality}
                    </button>
                  ))}

                  <div className="px-3 py-1 text-xs text-muted-foreground font-semibold border-t border-white/5 pt-1.5 mt-1 pb-1">
                    Playback Speed
                  </div>
                  {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`w-full text-left px-3 py-1 rounded-lg transition-colors ${
                        playbackSpeed === speed
                          ? "bg-accent/20 text-accent font-bold"
                          : "text-white hover:bg-white/5"
                      }`}
                    >
                      {speed === 1 ? "Normal" : `${speed}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-accent transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Premium Quality / Server Mirror Selector Panel */}
      {streamSource && streamSource.sources && streamSource.sources.length > 0 && (
        <div className="p-5 rounded-2xl bg-muted/20 border border-white/5 space-y-4 animate-fade-in shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-md shadow-accent/50" />
              Available Server Mirrors & Qualities
            </h3>
            <span className="text-[10px] text-muted-foreground bg-white/5 border border-white/10 px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              {streamSource.sources.length} Active Mirrors
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 max-h-[160px] overflow-y-auto pr-1 select-none scrollbar-thin">
            {streamSource.sources.map((src, idx) => {
              const isActive = activeSource?.url === src.url;
              return (
                <button
                  key={src.url}
                  onClick={() => handleSourceChange(src)}
                  className={`text-xs px-4 py-2.5 rounded-xl font-bold transition-all duration-200 border flex items-center gap-2 hover:-translate-y-[1.5px] hover:shadow-md active:translate-y-0 ${
                    isActive
                      ? "bg-accent/15 border-accent text-accent font-extrabold shadow-lg shadow-accent/15 scale-[1.02]"
                      : "bg-white/5 border-white/5 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isActive ? "fill-current" : ""}`} />
                  <span>{src.quality}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
