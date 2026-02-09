"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Users } from "lucide-react";
import type { Character, CropData } from "@/types/funnel";
import type { Area } from "react-easy-crop";
import { FunnelShell } from "../FunnelShell";
import { CharacterCard } from "../characters/CharacterCard";
import { ImageCropModal } from "../characters/ImageCropModal";
import { getCroppedImg } from "@/hooks/useImageCrop";

const MAX_CHARACTERS = 5;

interface CharactersStepProps {
  characters: Character[];
  onAddCharacter: (character: Character) => void;
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void;
  onRemoveCharacter: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function CharactersStep({
  characters,
  onAddCharacter,
  onUpdateCharacter,
  onRemoveCharacter,
  onContinue,
  onBack,
}: CharactersStepProps) {
  const [cropTarget, setCropTarget] = useState<string | null>(null);

  const handleAddCharacter = () => {
    if (characters.length >= MAX_CHARACTERS) return;
    const newCharacter: Character = {
      id: crypto.randomUUID(),
      name: `Personagem ${characters.length + 1}`,
      description: "",
      originalFile: null,
      originalPreview: "",
    };
    onAddCharacter(newCharacter);
  };

  const handleFileSelected = useCallback(
    (characterId: string, file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        onUpdateCharacter(characterId, {
          originalFile: file,
          originalPreview: preview,
          croppedPreview: undefined,
          cropData: undefined,
        });
      };
      reader.readAsDataURL(file);
    },
    [onUpdateCharacter]
  );

  const handleCropComplete = useCallback(
    async (croppedAreaPixels: Area) => {
      if (!cropTarget) return;
      const character = characters.find((c) => c.id === cropTarget);
      if (!character?.originalPreview) return;

      try {
        const croppedDataUrl = await getCroppedImg(
          character.originalPreview,
          croppedAreaPixels
        );

        const cropData: CropData = {
          x: croppedAreaPixels.x,
          y: croppedAreaPixels.y,
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height,
        };

        onUpdateCharacter(cropTarget, {
          croppedPreview: croppedDataUrl,
          cropData,
        });
      } catch (err) {
        console.error("Crop failed:", err);
      }

      setCropTarget(null);
    },
    [cropTarget, characters, onUpdateCharacter]
  );

  const cropCharacter = cropTarget
    ? characters.find((c) => c.id === cropTarget)
    : null;

  // Validation: at least 1 character with name, description, and photo
  const isValid =
    characters.length >= 1 &&
    characters.some(
      (c) => c.name.trim() && c.description.trim() && c.originalPreview
    );

  return (
    <>
      <FunnelShell step="characters" onBack={onBack}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Crie seus personagens
          </h1>
          <p className="text-zinc-400">
            Adicione ate {MAX_CHARACTERS} personagens com nome, descricao e foto
          </p>
        </div>

        {/* Character list */}
        <div className="space-y-4 mb-6">
          {characters.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={index}
              onUpdate={(updates) => onUpdateCharacter(character.id, updates)}
              onRemove={() => onRemoveCharacter(character.id)}
              onFileSelected={(file) => handleFileSelected(character.id, file)}
              onCropRequest={() => setCropTarget(character.id)}
            />
          ))}
        </div>

        {/* Add character button */}
        {characters.length < MAX_CHARACTERS && (
          <button
            onClick={handleAddCharacter}
            className="w-full py-4 mb-8 border-2 border-dashed border-zinc-800 hover:border-pink-500/30 rounded-xl text-zinc-400 hover:text-pink-400 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar personagem ({characters.length}/{MAX_CHARACTERS})
          </button>
        )}

        {/* Validation hint */}
        {!isValid && characters.length > 0 && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-sm text-amber-400">
              Preencha nome, descricao e foto de pelo menos 1 personagem para continuar.
            </p>
          </div>
        )}

        {characters.length === 0 && (
          <div className="mb-6 p-8 text-center">
            <p className="text-zinc-500 mb-4">
              Nenhum personagem adicionado ainda.
            </p>
            <Button
              onClick={handleAddCharacter}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar primeiro personagem
            </Button>
          </div>
        )}

        <Button
          onClick={onContinue}
          disabled={!isValid}
          className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-2xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Escolher Estilo
          <ArrowRight className="w-6 h-6 ml-3" />
        </Button>
      </FunnelShell>

      {/* Crop Modal */}
      {cropTarget && cropCharacter?.originalPreview && (
        <ImageCropModal
          imageSrc={cropCharacter.originalPreview}
          onCropComplete={handleCropComplete}
          onClose={() => setCropTarget(null)}
        />
      )}
    </>
  );
}
