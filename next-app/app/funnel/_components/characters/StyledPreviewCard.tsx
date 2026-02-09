"use client";

import { Loader2, RotateCcw, Check } from "lucide-react";
import type { Character } from "@/types/funnel";

interface StyledPreviewCardProps {
  character: Character;
  onRetry?: () => void;
}

export function StyledPreviewCard({ character, onRetry }: StyledPreviewCardProps) {
  const originalSrc = character.croppedPreview || character.originalPreview;
  const styledSrc = character.styledUrl;
  const status = character.styleStatus || "idle";

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 gap-0.5">
        {/* Original */}
        <div className="aspect-square relative">
          <img
            src={originalSrc}
            alt={`${character.name} - original`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] font-medium text-center py-0.5">
            Original
          </div>
        </div>

        {/* Styled */}
        <div className="aspect-square relative bg-zinc-800">
          {status === "generating" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
          )}
          {status === "done" && styledSrc && (
            <img
              src={styledSrc}
              alt={`${character.name} - estilizado`}
              className="w-full h-full object-cover"
            />
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <p className="text-xs text-red-400">Erro</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="p-1.5 bg-red-500/20 rounded-full hover:bg-red-500/30 transition"
                >
                  <RotateCcw className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          )}
          {status === "idle" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-zinc-500">Selecione um estilo</span>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] font-medium text-center py-0.5">
            {status === "done" ? (
              <span className="flex items-center justify-center gap-1">
                <Check className="w-3 h-3" /> Estilizado
              </span>
            ) : (
              "Estilizado"
            )}
          </div>
        </div>
      </div>

      <div className="p-2 text-center">
        <p className="text-sm font-medium text-white truncate">{character.name}</p>
      </div>
    </div>
  );
}
