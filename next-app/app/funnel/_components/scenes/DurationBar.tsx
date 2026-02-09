"use client";

import { Clock } from "lucide-react";
import type { Scene } from "@/types/scene";

interface DurationBarProps {
  scenes: Scene[];
  minDuration: number;
  maxDuration: number;
}

export function DurationBar({ scenes, minDuration, maxDuration }: DurationBarProps) {
  const usedDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const remaining = maxDuration - usedDuration;
  const isValid = usedDuration <= maxDuration;
  const isOverMax = usedDuration > maxDuration;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-medium text-zinc-300">
            Duração Total
          </span>
        </div>
        <span className={`text-sm font-bold ${isValid ? "text-emerald-400" : "text-red-400"}`}>
          {usedDuration}s
          {isValid && usedDuration > 0 && " \u2713"}
          {isOverMax && ` (max: ${maxDuration}s)`}
        </span>
      </div>

      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex relative">
        {scenes.map((scene, i) => (
          <div
            key={scene.id}
            className="h-full transition-all bg-gradient-to-r from-pink-500 to-rose-500"
            style={{ width: `${(scene.duration / maxDuration) * 100}%` }}
            title={`Cena ${i + 1}: ${scene.duration}s`}
          />
        ))}
        {remaining > 0 && (
          <div
            className="h-full bg-zinc-700"
            style={{ width: `${(remaining / maxDuration) * 100}%` }}
          />
        )}
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
        <span className="text-zinc-400">Maximo: {maxDuration}s</span>
        {remaining > 0 && isValid && (
          <span className="text-emerald-400 ml-auto">Pode adicionar ate {remaining}s</span>
        )}
      </div>
    </div>
  );
}
