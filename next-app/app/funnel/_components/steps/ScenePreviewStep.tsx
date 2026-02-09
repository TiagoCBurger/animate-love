"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Check,
  Pencil,
  X,
} from "lucide-react";
import type { Scene } from "@/types/scene";
import type { Character } from "@/types/funnel";
import { FunnelShell } from "../FunnelShell";

interface ScenePreviewStepProps {
  scenes: Scene[];
  characters: Character[];
  selectedStyle: string | null;
  isGenerating: boolean;
  regeneratingSceneId: string | null;
  onConfirm: () => void;
  onRegenerate: (sceneId: string) => void;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onBack: () => void;
}

export function ScenePreviewStep({
  scenes,
  characters,
  selectedStyle,
  isGenerating,
  regeneratingSceneId,
  onConfirm,
  onRegenerate,
  onUpdateScene,
  onBack,
}: ScenePreviewStepProps) {
  const allScenesGenerated = scenes.every((s) => s.generatedImageUrl);
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  // Track which scene is being edited
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);

  const styledCharacters = characters.filter(
    (c) => c.styledUrl || c.croppedPreview || c.originalPreview
  );

  return (
    <FunnelShell step="scene-preview" onBack={onBack}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">
          Preview das Cenas
        </h1>
        <p className="text-zinc-400">
          Confira as imagens geradas antes de animar ({totalDuration}s total).
          Edite o prompt ou personagens e regenere se necessario.
        </p>
      </div>

      {/* Scene previews */}
      <div className="space-y-6 mb-8">
        {scenes.map((scene, index) => {
          const sceneCharacters = characters.filter((c) =>
            scene.referenceCharacterIds?.includes(c.id)
          );
          const isEditing = editingSceneId === scene.id;
          const isRegenerating = regeneratingSceneId === scene.id;

          return (
            <div
              key={scene.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-start gap-4">
                {/* Scene number badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Scene info header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-zinc-500">
                      {scene.duration}s
                    </span>
                    {sceneCharacters.length > 0 && !isEditing && (
                      <span className="text-xs text-zinc-600">
                        • {sceneCharacters.map((c) => c.name).join(", ")}
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setEditingSceneId(isEditing ? null : scene.id)
                      }
                      disabled={isRegenerating}
                      className="ml-auto p-1.5 text-zinc-500 hover:text-pink-400 transition disabled:opacity-50"
                      title={isEditing ? "Fechar edicao" : "Editar cena"}
                    >
                      {isEditing ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Pencil className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Editing mode */}
                  {isEditing ? (
                    <div className="mb-3 space-y-3">
                      {/* Character selection */}
                      {styledCharacters.length > 0 && (
                        <div>
                          <p className="text-xs text-zinc-500 mb-2">
                            Personagens nesta cena:
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {styledCharacters.map((char) => {
                              const imgSrc =
                                char.styledUrl ||
                                char.croppedPreview ||
                                char.originalPreview;
                              const isReferenced =
                                scene.referenceCharacterIds?.includes(char.id);
                              return (
                                <button
                                  key={char.id}
                                  onClick={() => {
                                    const current =
                                      scene.referenceCharacterIds || [];
                                    const updated = isReferenced
                                      ? current.filter((id) => id !== char.id)
                                      : [...current, char.id];
                                    onUpdateScene(scene.id, {
                                      referenceCharacterIds: updated,
                                    });
                                  }}
                                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                                    isReferenced
                                      ? "border-pink-500 ring-2 ring-pink-500/30"
                                      : "border-zinc-700 hover:border-zinc-600"
                                  }`}
                                >
                                  <img
                                    src={imgSrc}
                                    alt={char.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {isReferenced && (
                                    <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-medium text-center py-0.5 truncate px-1">
                                    {char.name}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Prompt editing */}
                      <textarea
                        value={scene.prompt}
                        onChange={(e) =>
                          onUpdateScene(scene.id, { prompt: e.target.value })
                        }
                        placeholder="Descreva o que acontece nesta cena..."
                        className="w-full min-h-[80px] bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 outline-none resize-none transition"
                      />

                      {/* Regenerate button */}
                      <button
                        onClick={() => {
                          onRegenerate(scene.id);
                          setEditingSceneId(null);
                        }}
                        disabled={isGenerating || !scene.prompt.trim()}
                        className="w-full py-2.5 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 rounded-lg text-sm font-medium text-pink-400 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Regenerar Imagem
                      </button>
                    </div>
                  ) : (
                    /* Read-only prompt display */
                    <p className="text-sm text-zinc-300 mb-3">{scene.prompt}</p>
                  )}

                  {/* Generated image or loading */}
                  {isRegenerating ? (
                    <div className="w-full aspect-[9/16] bg-zinc-800/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-zinc-400">
                          Regenerando imagem...
                        </p>
                      </div>
                    </div>
                  ) : scene.generatedImageUrl ? (
                    <div className="relative group">
                      <img
                        src={scene.generatedImageUrl}
                        alt={`Cena ${index + 1}`}
                        className="w-full aspect-[9/16] object-cover rounded-lg"
                      />

                      {/* Quick regenerate overlay */}
                      <button
                        onClick={() => onRegenerate(scene.id)}
                        disabled={isGenerating}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <RefreshCw className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Gerar Novamente
                          </span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full aspect-[9/16] bg-zinc-800/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-zinc-400">
                          Gerando imagem...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          disabled={isGenerating}
          variant="outline"
          className="flex-1 h-14 text-lg border-zinc-700 hover:bg-zinc-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Editar Cenas
        </Button>

        <Button
          onClick={onConfirm}
          disabled={!allScenesGenerated || isGenerating}
          className="flex-1 h-14 text-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isGenerating
            ? "Gerando..."
            : allScenesGenerated
            ? "Animar Cenas"
            : "Aguardando imagens..."}
        </Button>
      </div>

      {/* Cost warning */}
      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-sm text-amber-200 text-center">
          ⚠️ A animacao consome creditos. Confira se as imagens estao
          corretas antes de prosseguir.
        </p>
      </div>
    </FunnelShell>
  );
}
