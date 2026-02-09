"use client";

import { Card } from "@/components/ui/card";
import { Trash2, Crop } from "lucide-react";
import type { Character } from "@/types/funnel";
import { CharacterPhotoUploader } from "./CharacterPhotoUploader";

interface CharacterCardProps {
  character: Character;
  index: number;
  onUpdate: (updates: Partial<Character>) => void;
  onRemove: () => void;
  onFileSelected: (file: File) => void;
  onCropRequest: () => void;
}

export function CharacterCard({
  character,
  index,
  onUpdate,
  onRemove,
  onFileSelected,
  onCropRequest,
}: CharacterCardProps) {
  const photoPreview = character.croppedPreview || character.originalPreview;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 p-4 rounded-xl">
      <div className="flex gap-4">
        {/* Photo area */}
        <div className="flex-shrink-0 w-28">
          <CharacterPhotoUploader
            preview={photoPreview || undefined}
            onFileSelected={onFileSelected}
          />
          {character.originalPreview && (
            <button
              onClick={onCropRequest}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-zinc-300 transition"
            >
              <Crop className="w-3 h-3" />
              Recortar
            </button>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <input
                type="text"
                value={character.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="bg-transparent text-white font-medium border-b border-transparent hover:border-zinc-600 focus:border-pink-500 outline-none transition text-sm"
                placeholder="Nome do personagem"
              />
            </div>
            <button
              onClick={onRemove}
              className="p-1.5 text-zinc-500 hover:text-red-400 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <textarea
            value={character.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Descreva o personagem (ex: Cachorro golden retriever, pelo dourado, olhos castanhos, coleira vermelha...)"
            className="w-full min-h-[80px] bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 outline-none resize-none transition"
          />
        </div>
      </div>
    </Card>
  );
}
