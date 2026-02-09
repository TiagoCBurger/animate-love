"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UseAuthReturn {
  user: User | null;
  credits: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
      if (user) {
        fetchCredits();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCredits();
      } else {
        setCredits(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch("/api/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch {
      // Silently fail — user may not have credits yet
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setCredits(0);
  }, []);

  return {
    user,
    credits,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshCredits: fetchCredits,
  };
}
