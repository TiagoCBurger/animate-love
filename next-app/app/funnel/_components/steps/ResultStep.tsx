"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heart,
  Home,
  Coins,
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  Film,
  LayoutDashboard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Scene } from "@/types/scene";
import { STYLE_PRESETS, type StyleId } from "@/lib/constants/styles";
import { VideoPlayer } from "../shared/VideoPlayer";
import { formatCredits } from "@/lib/costs";

interface ResultStepProps {
  scenes: Scene[];
  videoUrls: string[];
  selectedStyle: string | null;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  balanceCents?: number;
  onCreateNew: () => void;
}

export function ResultStep({
  scenes,
  videoUrls,
  selectedStyle,
  aspectRatio,
  balanceCents,
  onCreateNew,
}: ResultStepProps) {
  const router = useRouter();
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Meus Projetos</span>
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              <span className="font-semibold text-white">Animalove</span>
            </button>

            <div className="flex items-center gap-4">
              {balanceCents !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-full border border-zinc-700">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white">{formatCredits(balanceCents)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Sua historia esta pronta!
            </h1>
            <p className="text-zinc-400">
              {scenes.length} cenas - {totalDuration}s de emocao pura
            </p>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800 rounded-3xl overflow-hidden mb-8">
            <VideoPlayer videos={videoUrls} scenes={scenes} aspectRatio={aspectRatio} />

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Nossa Historia de Amor
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {scenes.length} cenas - {totalDuration}s - Estilo{" "}
                    {selectedStyle ? STYLE_PRESETS[selectedStyle as StyleId]?.name : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">
                    HD 1080p
                  </span>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {scenes.map((scene, i) => (
                  <div key={scene.id} className="flex-shrink-0 relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-zinc-700">
                      {scene.generatedImageUrl ? (
                        <img
                          src={scene.generatedImageUrl}
                          alt={`Cena ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Film className="w-4 h-4 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-pink-500 rounded text-[10px] font-bold text-white">
                      {scene.duration}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button className="h-14 text-lg font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-xl">
              <Download className="w-5 h-5 mr-2" />
              Baixar Video
            </Button>
            <Button
              variant="outline"
              className="h-14 text-lg font-semibold bg-zinc-800/50 hover:bg-zinc-800 text-white border-zinc-700 rounded-xl"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Compartilhar
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="h-12 px-8 font-semibold bg-zinc-800/50 hover:bg-zinc-800 text-white border-zinc-700 rounded-full"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Ver Meus Projetos
            </Button>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-pink-400 transition text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Criar nova historia
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
