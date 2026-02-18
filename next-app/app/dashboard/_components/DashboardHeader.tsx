"use client";

import { Heart, Coins, User, Plus, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCredits } from "@/lib/costs";

interface DashboardHeaderProps {
  balanceCents: number;
}

export function DashboardHeader({ balanceCents }: DashboardHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            <span className="font-semibold text-white">Animalove</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/funnel")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-sm font-medium rounded-full transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Historia</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-full border border-zinc-700">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">{formatCredits(balanceCents)}</span>
            </div>

            <div className="relative group">
              <button className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
