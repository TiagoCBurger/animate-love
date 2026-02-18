"use client";

import type { Generation } from "@/types/generation";
import { DashboardHeader } from "./DashboardHeader";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "./EmptyState";

interface DashboardContentProps {
  generations: Generation[];
  balanceCents: number;
}

export function DashboardContent({
  generations,
  balanceCents,
}: DashboardContentProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <DashboardHeader balanceCents={balanceCents} />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Meus Projetos</h1>
            <p className="text-zinc-500 mt-1">
              {generations.length > 0
                ? `${generations.length} ${generations.length === 1 ? "historia criada" : "historias criadas"}`
                : "Comece criando sua primeira historia"}
            </p>
          </div>

          {generations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.map((gen) => (
                <ProjectCard key={gen.id} generation={gen} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
