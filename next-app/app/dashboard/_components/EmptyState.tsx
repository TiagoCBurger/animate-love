"use client";

import { Film, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mb-6">
        <Film className="w-10 h-10 text-zinc-600" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        Nenhum projeto ainda
      </h2>
      <p className="text-zinc-500 text-center max-w-sm mb-8">
        Crie sua primeira historia animada com seus pets e pessoas queridas.
      </p>
      <Button
        onClick={() => router.push("/funnel")}
        className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-full"
      >
        <Plus className="w-5 h-5 mr-2" />
        Criar Primeira Historia
      </Button>
    </div>
  );
}
