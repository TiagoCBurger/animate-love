"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Loader2 } from "lucide-react";
import type { Scene } from "@/types/scene";

interface VideoPlayerProps {
  videos: string[];
  scenes: Scene[];
}

export function VideoPlayer({ videos, scenes }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handleVideoEnd = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowControls(false);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  };

  useEffect(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.play();
    }
  }, [currentIndex, isPlaying]);

  if (!videos.length) {
    return (
      <div className="aspect-video bg-zinc-800 flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="aspect-video bg-zinc-800 relative group"
      onClick={() => (isPlaying ? handlePause() : handlePlay())}
    >
      <video
        ref={videoRef}
        src={videos[currentIndex]}
        className="w-full h-full object-cover"
        onEnded={handleVideoEnd}
        playsInline
      />

      {showControls && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-pink-500/30"
          >
            <Play className="w-8 h-8 text-white ml-1" />
          </button>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {videos.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all ${
              i === currentIndex ? "bg-white w-8" : "bg-white/30 w-4"
            }`}
          />
        ))}
      </div>

      <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 rounded-full text-xs text-white">
        {currentIndex + 1} / {videos.length}
      </div>
    </div>
  );
}
