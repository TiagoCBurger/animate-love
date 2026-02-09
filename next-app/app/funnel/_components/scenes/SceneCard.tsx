"use client";

import { Card } from "@/components/ui/card";
import {
  GripVertical,
  Check,
  Trash2,
} from "lucide-react";
import type { Scene, SceneDuration } from "@/types/scene";
import { DURATION_CONSTRAINTS } from "@/types/scene";
import type { Character } from "@/types/funnel";

interface SceneCardProps {
  scene: Scene;
  index: number;
  characters: Character[];
  onUpdate: (updates: Partial<Scene>) => void;
  onRemove: () => void;
  canChangeDuration: boolean;
}

export function SceneCard({
  scene,
  index,
  characters,
  onUpdate,
  onRemove,
  canChangeDuration,
}: SceneCardProps) {
  // Show styled characters as thumbnails
  const styledCharacters = characters.filter((c) => c.styledUrl || c.croppedPreview || c.originalPreview);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 p-4 rounded-xl">
      <div className="flex gap-4">
        <div className="flex items-center text-zinc-600">
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
            {index + 1}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <select
                value={scene.duration}
                onChange={(e) => onUpdate({ duration: parseInt(e.target.value) as SceneDuration })}
                disabled={!canChangeDuration}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all bg-zinc-800 text-zinc-300 border border-zinc-700 focus:border-pink-500 outline-none ${
                  !canChangeDuration ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {DURATION_CONSTRAINTS.ALLOWED_DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}s
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onRemove}
              className="ml-auto p-1.5 text-zinc-500 hover:text-red-400 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Character thumbnails for reference */}
          {styledCharacters.length > 0 && (
            <>
              <p className="text-xs text-zinc-500 mb-2">
                Selecione os personagens que devem aparecer nesta cena:
              </p>
              <div className="flex gap-2 mb-3">
              {styledCharacters.map((char) => {
                const imgSrc = char.styledUrl || char.croppedPreview || char.originalPreview;
                const isReferenced = scene.referenceCharacterIds?.includes(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      const current = scene.referenceCharacterIds || [];
                      const updated = isReferenced
                        ? current.filter((id) => id !== char.id)
                        : [...current, char.id];
                      onUpdate({ referenceCharacterIds: updated });
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
            </>
          )}

          <textarea
            value={scene.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value })}
            placeholder="Descreva o que acontece nesta cena..."
            className="w-full min-h-[60px] bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 outline-none resize-none transition"
          />
        </div>
      </div>
    </Card>
  );
}
