"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Share2,
  Heart,
  Film,
  Clock,
  Palette,
  Users,
  Plus,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoPlayer } from "@/app/funnel/_components/shared/VideoPlayer";
import type { Generation } from "@/types/generation";
import { STYLE_PRESETS, type StyleId } from "@/lib/constants/styles";

interface ProjectDetailProps {
  generation: Generation;
}

export function ProjectDetail({ generation }: ProjectDetailProps) {
  const router = useRouter();
  const style = STYLE_PRESETS[generation.style as StyleId];
  const totalDuration = generation.scenes.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );

  // Build scenes for VideoPlayer (it expects Scene[] with id and duration)
  const scenesForPlayer = generation.scenes.map((s, i) => ({
    id: `scene-${i}`,
    prompt: s.prompt,
    duration: 5 as const,
    type: "prompt-only" as const,
    referenceCharacterIds: [],
    status: "completed" as const,
  }));

  const date = new Date(generation.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Voltar</span>
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              <span className="font-semibold text-white">Animalove</span>
            </button>

            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              {generation.name || "Sem nome"}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">{date}</p>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800 rounded-3xl overflow-hidden mb-8">
            <VideoPlayer
              videos={generation.video_urls}
              scenes={scenesForPlayer}
              aspectRatio={generation.aspect_ratio as "16:9" | "9:16" | "1:1"}
            />

            <div className="p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                {style && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 rounded-full text-sm text-zinc-300 border border-zinc-700">
                    <Palette className="w-3.5 h-3.5" />
                    {style.name}
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 rounded-full text-sm text-zinc-300 border border-zinc-700">
                  <Film className="w-3.5 h-3.5" />
                  {generation.scenes.length} cenas
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 rounded-full text-sm text-zinc-300 border border-zinc-700">
                  <Clock className="w-3.5 h-3.5" />
                  {totalDuration}s
                </span>
                {generation.characters.length > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 rounded-full text-sm text-zinc-300 border border-zinc-700">
                    <Users className="w-3.5 h-3.5" />
                    {generation.characters.length} personagens
                  </span>
                )}
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">
                  HD 1080p
                </span>
              </div>

              {generation.scenes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-3">
                    Cenas
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {generation.scenes.map((scene, i) => (
                      <div key={i} className="flex-shrink-0 relative">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-zinc-700">
                          {scene.imageUrl ? (
                            <img
                              src={scene.imageUrl}
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
              )}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 mb-8">
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
              Meus Projetos
            </Button>
            <button
              onClick={() => router.push("/funnel")}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-pink-400 transition text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar nova historia
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
