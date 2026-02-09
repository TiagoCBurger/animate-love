"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Palette } from "lucide-react";
import { STYLE_PRESETS, type StyleId } from "@/lib/constants/styles";
import type { Character } from "@/types/funnel";
import { FunnelShell } from "../FunnelShell";
import { StyledPreviewCard } from "../characters/StyledPreviewCard";

interface StyleStepProps {
  characters: Character[];
  selectedStyle: string | null;
  onSelectStyle: (styleId: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void;
}

export function StyleStep({
  characters,
  selectedStyle,
  onSelectStyle,
  onContinue,
  onBack,
  onUpdateCharacter,
}: StyleStepProps) {
  const allStylesDone = !selectedStyle || characters.every(
    (c) => c.styleStatus === "done" || c.styleStatus === undefined
  );
  const anyGenerating = characters.some((c) => c.styleStatus === "generating");
  const hasStyledCharacters = characters.some((c) => c.styledUrl);

  return (
    <FunnelShell step="style" onBack={onBack}>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <Palette className="w-8 h-8 text-violet-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Escolha o estilo da sua historia
        </h1>
        <p className="text-zinc-400">
          Seus personagens serao transformados no estilo escolhido
        </p>
      </div>

      {/* Character previews */}
      {characters.length > 0 && (
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {characters.map((char) => (
            <div
              key={char.id}
              className="w-16 h-16 rounded-lg overflow-hidden border-2 border-zinc-700"
            >
              <img
                src={char.croppedPreview || char.originalPreview}
                alt={char.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Style grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {Object.values(STYLE_PRESETS).map((style) => {
          const Icon = style.icon;
          const isSelected = selectedStyle === style.id;

          return (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? `border-transparent bg-gradient-to-br ${style.bgColor}`
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              {isSelected && (
                <div
                  className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r ${style.color} flex items-center justify-center`}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.bgColor} flex items-center justify-center mb-4`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isSelected ? "text-white" : "text-zinc-300"
                  }`}
                />
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">
                {style.name}
              </h3>
              <p className="text-sm text-zinc-400">{style.description}</p>
            </button>
          );
        })}
      </div>

      {/* Styled preview cards */}
      {selectedStyle && hasStyledCharacters && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 text-center">
            Preview Estilizado
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {characters.map((char) => (
              <StyledPreviewCard
                key={char.id}
                character={char}
                onRetry={() => {
                  onUpdateCharacter(char.id, { styleStatus: "idle", styledUrl: undefined });
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={onContinue}
        disabled={!selectedStyle || anyGenerating}
        className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-2xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {anyGenerating ? (
          "Gerando previews..."
        ) : (
          <>
            Continuar com {selectedStyle ? STYLE_PRESETS[selectedStyle as StyleId]?.name : "estilo"}
            <ArrowRight className="w-6 h-6 ml-3" />
          </>
        )}
      </Button>
    </FunnelShell>
  );
}
