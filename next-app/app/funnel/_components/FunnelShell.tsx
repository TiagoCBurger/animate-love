"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import type { FunnelStep } from "@/types/funnel";

const STEP_ORDER: FunnelStep[] = ["landing", "characters", "style", "scenes", "scene-preview", "loading", "result"];
const STEP_LABELS: Partial<Record<FunnelStep, string>> = {
  characters: "Personagens",
  style: "Estilo",
  scenes: "Cenas",
  "scene-preview": "Preview",
};

interface FunnelShellProps {
  step: FunnelStep;
  onBack?: () => void;
  children: React.ReactNode;
}

export function FunnelShell({ step, onBack, children }: FunnelShellProps) {
  const visibleSteps = STEP_ORDER.filter((s) => STEP_LABELS[s]);
  const currentIdx = visibleSteps.indexOf(step);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          ) : (
            <div />
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            <span className="font-semibold text-white">Animalove</span>
          </Link>
        </div>

        {/* Step indicator */}
        {currentIdx >= 0 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {visibleSteps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    i < currentIdx
                      ? "bg-pink-500/20 text-pink-400"
                      : i === currentIdx
                      ? "bg-pink-500 text-white"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  <span>{i + 1}</span>
                  <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
                </div>
                {i < visibleSteps.length - 1 && (
                  <div
                    className={`w-6 h-0.5 ${
                      i < currentIdx ? "bg-pink-500/50" : "bg-zinc-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
