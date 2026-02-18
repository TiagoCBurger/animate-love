"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UseAuthReturn {
  user: User | null;
  balanceCents: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [balanceCents, setBalanceCents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
      if (user) {
        fetchBalance();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchBalance();
      } else {
        setBalanceCents(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const response = await fetch("/api/credits");
      if (response.ok) {
        const data = await response.json();
        setBalanceCents(data.balance_cents ?? 0);
      }
    } catch {
      // Silently fail — user may not have balance yet
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setBalanceCents(0);
  }, []);

  return {
    user,
    balanceCents,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshBalance: fetchBalance,
  };
}
