"use client";

import { Film, Clock, Palette, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Generation } from "@/types/generation";
import { STYLE_PRESETS, type StyleId } from "@/lib/constants/styles";

interface ProjectCardProps {
  generation: Generation;
}

const ASPECT_RATIO_CLASS: Record<string, string> = {
  "9:16": "aspect-[9/16]",
  "16:9": "aspect-video",
  "1:1": "aspect-square",
};

export function ProjectCard({ generation }: ProjectCardProps) {
  const router = useRouter();
  const style = STYLE_PRESETS[generation.style as StyleId];
  const thumbnailAspect = ASPECT_RATIO_CLASS[generation.aspect_ratio] || "aspect-video";
  const totalDuration = generation.scenes.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );
  const date = new Date(generation.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <button
      onClick={() => router.push(`/dashboard/project/${generation.id}`)}
      className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:bg-zinc-900/80 transition-all text-left"
    >
      <div className={`${thumbnailAspect} relative`}>
        {generation.thumbnail_url ? (
          <img
            src={generation.thumbnail_url}
            alt={generation.name || "Projeto"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${style?.bgColor || "from-zinc-700/20 to-zinc-600/20"} flex items-center justify-center`}
          >
            <Film className="w-10 h-10 text-zinc-600" />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              generation.status === "completed"
                ? "bg-emerald-500/20 text-emerald-400"
                : generation.status === "failed"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {generation.status === "completed"
              ? "Concluido"
              : generation.status === "failed"
                ? "Erro"
                : "Em andamento"}
          </span>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ChevronRight className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white truncate mb-1">
          {generation.name || "Sem nome"}
        </h3>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {style && (
            <span className="flex items-center gap-1">
              <Palette className="w-3 h-3" />
              {style.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Film className="w-3 h-3" />
            {generation.scenes.length} cenas
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {totalDuration}s
          </span>
        </div>
        <p className="text-xs text-zinc-600 mt-2">{date}</p>
      </div>
    </button>
  );
}
