"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Smartphone, Monitor, Square, Wallet } from "lucide-react";
import { estimateImageCost, COSTS, formatCredits, canAfford, type CostsOverride } from "@/lib/costs";
import type { Scene, SceneDuration, SceneType } from "@/types/scene";
import {
  DURATION_CONSTRAINTS,
  getAvailableDurations,
  canAddScene,
  validateScenes,
} from "@/types/scene";
import type { Character, AspectRatio } from "@/types/funnel";
import { STYLE_PRESETS, type StyleId } from "@/lib/constants/styles";
import { FunnelShell } from "../FunnelShell";
import { DurationBar } from "../scenes/DurationBar";
import { SceneCard } from "../scenes/SceneCard";

const ASPECT_RATIO_OPTIONS: {
  value: AspectRatio;
  label: string;
  sublabel: string;
  icon: typeof Smartphone;
}[] = [
  { value: "9:16", label: "Vertical", sublabel: "TikTok/Reels", icon: Smartphone },
  { value: "16:9", label: "Horizontal", sublabel: "YouTube", icon: Monitor },
  { value: "1:1", label: "Quadrado", sublabel: "Instagram", icon: Square },
];

interface ScenesStepProps {
  scenes: Scene[];
  characters: Character[];
  selectedStyle: string | null;
  aspectRatio: AspectRatio;
  balanceCents: number;
  costs?: CostsOverride;
  onSetAspectRatio: (ratio: AspectRatio) => void;
  onAddScene: (type: SceneType, duration: SceneDuration) => void;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onRemoveScene: (id: string) => void;
  onStartProcessing: () => void;
  onBack: () => void;
}

export function ScenesStep({
  scenes,
  characters,
  selectedStyle,
  aspectRatio,
  balanceCents,
  costs,
  onSetAspectRatio,
  onAddScene,
  onUpdateScene,
  onRemoveScene,
  onStartProcessing,
  onBack,
}: ScenesStepProps) {
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const remainingDuration = DURATION_CONSTRAINTS.TOTAL_MAX - totalDuration;
  const availableDurations = getAvailableDurations(scenes);

  const characterDescriptionCombined = characters
    .map((c) => `${c.name}: ${c.description}`)
    .join(". ");
  const { valid: scenesValid, errors: validationErrors } = validateScenes(
    scenes,
    characterDescriptionCombined
  );

  return (
    <FunnelShell step="scenes" onBack={onBack}>
      {selectedStyle && (
        <div className="flex justify-center mb-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${STYLE_PRESETS[selectedStyle as StyleId]?.bgColor} border border-white/10`}
          >
            {(() => {
              const Icon = STYLE_PRESETS[selectedStyle as StyleId]?.icon;
              return Icon ? <Icon className="w-4 h-4 text-white" /> : null;
            })()}
            <span className="text-sm font-medium text-white">
              Estilo: {STYLE_PRESETS[selectedStyle as StyleId]?.name}
            </span>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">
          Monte sua historia
        </h1>
        <p className="text-zinc-400">
          Crie cenas com ate {DURATION_CONSTRAINTS.TOTAL_MAX} segundos no total
        </p>
      </div>

      <DurationBar
        scenes={scenes}
        minDuration={DURATION_CONSTRAINTS.TOTAL_MIN}
        maxDuration={DURATION_CONSTRAINTS.TOTAL_MAX}
      />

      {/* Aspect Ratio Selector */}
      <div className="mb-6">
        <p className="text-sm text-zinc-400 mb-3">Formato do video</p>
        <div className="flex gap-2">
          {ASPECT_RATIO_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = aspectRatio === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onSetAspectRatio(option.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-pink-500/10 border-pink-500 text-white"
                    : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-pink-400" : ""}`} />
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-[10px] opacity-60">{option.sublabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenes */}
      <div className="space-y-4 mb-6">
        {scenes.map((scene, index) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={index}
            characters={characters}
            onUpdate={(updates) => onUpdateScene(scene.id, updates)}
            onRemove={() => onRemoveScene(scene.id)}
            canChangeDuration={false}
          />
        ))}
      </div>

      {/* Add Scene Button */}
      {remainingDuration > 0 && (
        <button
          onClick={() => onAddScene("photo-based", availableDurations[0] || 5)}
          disabled={availableDurations.length === 0}
          className="w-full py-4 mb-8 border-2 border-dashed border-zinc-800 hover:border-pink-500/30 rounded-xl text-zinc-400 hover:text-pink-400 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Adicionar cena
        </button>
      )}

      {/* Cost Estimate */}
      {(() => {
        const perImage = costs?.image ?? COSTS.IMAGE_GENERATION;
        const imageCost = estimateImageCost(scenes.length, costs);
        const affordable = canAfford(balanceCents, imageCost);
        return (
          <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Custo estimado</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-zinc-400">Imagens ({scenes.length}x): {scenes.length} x {perImage} créditos</span>
              <span className="text-white">{formatCredits(imageCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Seu saldo:</span>
              <span className={affordable ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                {formatCredits(balanceCents)}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <ul className="text-sm text-red-400 space-y-1">
            {validationErrors.map((error, i) => (
              <li key={i}>- {error}</li>
            ))}
          </ul>
        </div>
      )}

      <Button
        onClick={onStartProcessing}
        disabled={!scenesValid || !canAfford(balanceCents, estimateImageCost(scenes.length, costs))}
        className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-2xl shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-6 h-6 mr-3" />
        Criar Minha Historia ({totalDuration}s)
      </Button>
    </FunnelShell>
  );
}
