"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, LogIn } from "lucide-react";

interface LandingStepProps {
  onStart: () => void;
}

export function LandingStep({ onStart }: LandingStepProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <Link
        href="/auth/login"
        className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <LogIn className="w-4 h-4" />
        Ja tenho conta
      </Link>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-900/30 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <span className="font-bold text-3xl bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            Animalove
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Crie sua
          <span className="block bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent mt-2">
            historia animada de amor
          </span>
        </h1>

        <p className="text-xl text-zinc-400 mb-12 max-w-xl mx-auto">
          Crie personagens, escolha um estilo e monte cenas animadas.
          15 segundos de pura emocao.
        </p>

        <Button
          onClick={onStart}
          className="h-16 px-12 text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-2xl shadow-lg shadow-pink-500/25 transition-all hover:scale-105"
        >
          <Sparkles className="w-6 h-6 mr-3" />
          Comecar Agora
        </Button>

        <p className="mt-8 text-sm text-zinc-500">
          Ate 5 personagens - 15 segundos de video
        </p>
      </div>
    </div>
  );
}
