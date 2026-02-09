"use client";

import { Button } from "@/components/ui/button";
import { Heart, Check, Loader2 } from "lucide-react";
import { STYLE_PRESETS, type StyleId } from "@/lib/constants/styles";
import type { GenerationProgress } from "@/types/funnel";

interface LoadingStepProps {
  selectedStyle: string | null;
  generationProgress: GenerationProgress | null;
  generationError: string | null;
  onRetry: () => void;
}

export function LoadingStep({
  selectedStyle,
  generationProgress,
  generationError,
  onRetry,
}: LoadingStepProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent" />

      <div className="relative z-10 text-center max-w-md mx-auto">
        {selectedStyle && (
          <div className="flex justify-center mb-6">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${STYLE_PRESETS[selectedStyle as StyleId]?.bgColor}`}
            >
              {(() => {
                const Icon = STYLE_PRESETS[selectedStyle as StyleId]?.icon;
                return Icon ? <Icon className="w-4 h-4 text-white" /> : null;
              })()}
              <span className="text-sm font-medium text-white">
                {STYLE_PRESETS[selectedStyle as StyleId]?.name}
              </span>
            </div>
          </div>
        )}

        {generationError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm mb-3">{generationError}</p>
            <Button
              onClick={onRetry}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-0"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {!generationError && (
          <>
            <div className="relative w-32 h-32 mx-auto mb-10">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full animate-pulse opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                {generationProgress?.stage === "complete" ? (
                  <Check className="w-16 h-16 text-emerald-500" />
                ) : (
                  <Heart className="w-16 h-16 text-pink-500 fill-pink-500 animate-pulse" />
                )}
              </div>
            </div>

            <div className="w-full h-2 bg-zinc-800 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${generationProgress?.percentage || 0}%` }}
              />
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {(["uploading", "generating-images", "generating-videos", "concatenating"] as const).map(
                (stage, i) => (
                  <div
                    key={stage}
                    className={`w-2 h-2 rounded-full transition-all ${
                      generationProgress?.stage === stage
                        ? "bg-pink-500 scale-125"
                        : (["uploading", "generating-images", "generating-videos", "concatenating"] as const).indexOf(
                            generationProgress?.stage as typeof stage
                          ) > i
                        ? "bg-pink-500/50"
                        : "bg-zinc-700"
                    }`}
                  />
                )
              )}
            </div>

            <div className="h-8 mb-4">
              <p className="text-xl text-white font-medium flex items-center justify-center gap-2">
                {generationProgress?.stage !== "complete" && (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
                {generationProgress?.message || "Iniciando..."}
              </p>
            </div>

            {generationProgress?.currentScene ? (
              <p className="text-sm text-zinc-400 mb-4">
                Cena {generationProgress.currentScene} de {generationProgress.totalScenes}
              </p>
            ) : null}

            <p className="text-sm text-zinc-500">
              {generationProgress?.stage === "generating-videos"
                ? "Geracao de video pode levar alguns minutos..."
                : "Criando sua historia de amor..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
