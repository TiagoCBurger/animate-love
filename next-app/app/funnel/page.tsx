"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFunnelState } from "@/hooks/useFunnelState";
import { useStylePreview } from "@/hooks/useStylePreview";
import { useGenerationPipeline } from "@/hooks/useGenerationPipeline";
import { useAuth } from "@/hooks/useAuth";
import { createScene } from "@/types/scene";
import { estimateImageCost, type CostsOverride } from "@/lib/costs";
import type { PaywallPlan } from "./_components/steps/PaywallStep";
import { LandingStep } from "./_components/steps/LandingStep";
import { CharactersStep } from "./_components/steps/CharactersStep";
import { StyleStep } from "./_components/steps/StyleStep";
import { ScenesStep } from "./_components/steps/ScenesStep";
import { EmailStep } from "./_components/steps/EmailStep";
import { ScenePreviewStep } from "./_components/steps/ScenePreviewStep";
import { PaywallStep } from "./_components/steps/PaywallStep";
import { LoadingStep } from "./_components/steps/LoadingStep";
import { ResultStep } from "./_components/steps/ResultStep";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";

export default function FunnelPage() {
  const {
    state,
    setStep,
    addCharacter,
    updateCharacter,
    removeCharacter,
    setStyle,
    setAspectRatio,
    addScene,
    updateScene,
    removeScene,
    setScenes,
    setGenerationProgress,
    setGenerationError,
    setVideoUrls,
    reset,
    saveDraft,
    loadDraft,
    clearDraft,
  } = useFunnelState();

  const { isAuthenticated, isLoading: authLoading, user, balanceCents, refreshBalance } = useAuth();
  const searchParams = useSearchParams();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // DB-driven config
  const [configPlans, setConfigPlans] = useState<PaywallPlan[]>([]);
  const [configCosts, setConfigCosts] = useState<CostsOverride | undefined>(undefined);

  // Fetch config (costs + plans) on mount
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.costs) {
          setConfigCosts(data.costs);
        }
        if (data.plans && Array.isArray(data.plans)) {
          setConfigPlans(
            data.plans.map((p: any) => ({
              id: p.id,
              name: p.name,
              credits: p.credits,
              bonusCredits: p.bonusCredits,
              totalCredits: p.totalCredits,
              priceCents: p.priceCents,
              description: p.description,
            }))
          );
        }
      })
      .catch((err) => console.warn("Failed to fetch config:", err));
  }, []);

  // Load draft only for non-authenticated users (once auth resolves)
  const hasTriedDraft = useRef(false);
  useEffect(() => {
    if (authLoading || hasTriedDraft.current) return;
    hasTriedDraft.current = true;
    if (!isAuthenticated) {
      loadDraft();
    } else {
      // Authenticated: clear stale draft so next visit starts fresh
      clearDraft();
    }
  }, [authLoading, isAuthenticated, loadDraft, clearDraft]);

  // Handle return from AbacatePay
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      setPaymentSuccess(true);
    }
  }, [searchParams]);

  // Refresh balance when user is authenticated (e.g. after login via magic link)
  useEffect(() => {
    if (isAuthenticated) {
      refreshBalance();
    }
  }, [isAuthenticated, refreshBalance]);

  // Auto-redirect when user is authenticated and on email-verification step
  useEffect(() => {
    if (state.step === "email-verification" && isAuthenticated) {
      setStep("paywall");
    }
  }, [state.step, isAuthenticated, setStep]);

  // Auto-redirect from paywall when user already has balance
  useEffect(() => {
    if (state.step === "paywall" && isAuthenticated && balanceCents >= estimateImageCost(state.scenes.length || 1, configCosts)) {
      setStep("scenes");
    }
  }, [state.step, isAuthenticated, balanceCents, state.scenes.length, configCosts, setStep]);

  const { generateAllPreviews } = useStylePreview({
    characters: state.characters,
    selectedStyle: state.selectedStyle,
    onUpdateCharacter: updateCharacter,
  });

  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);

  const { runPipeline, generateSceneImagesOnly, generateVideosOnly, regenerateSingleScene } = useGenerationPipeline({
    characters: state.characters,
    scenes: state.scenes,
    selectedStyle: state.selectedStyle,
    aspectRatio: state.aspectRatio,
    costs: configCosts,
    onUpdateCharacter: updateCharacter,
    setScenes,
    setGenerationProgress,
    setGenerationError,
    setVideoUrls,
    setStep: setStep as (step: "result") => void,
  });

  // Navigation handlers
  const handleStartCharacters = useCallback(() => {
    setStep("characters");
  }, [setStep]);

  const handleContinueToStyle = useCallback(() => {
    setStep("style");
  }, [setStep]);

  const handleSelectStyle = useCallback(
    (styleId: string) => {
      setStyle(styleId);
    },
    [setStyle]
  );

  const handleContinueToScenes = useCallback(() => {
    if (!state.selectedStyle) return;

    // Only generate style previews for authenticated users with balance
    if (isAuthenticated && balanceCents > 0) {
      generateAllPreviews();
    }

    // Initialize with a default scene if empty
    if (state.scenes.length === 0 && state.characters.length > 0) {
      const defaultScene = createScene("photo-based", 5);
      setScenes([{ ...defaultScene, referenceCharacterIds: state.characters.map((c) => c.id) }]);
    }

    setStep("scenes");
  }, [state.selectedStyle, state.scenes.length, state.characters, isAuthenticated, balanceCents, generateAllPreviews, setScenes, setStep]);

  const handleStartProcessing = useCallback(() => {
    // Not authenticated → go to email verification first
    if (!isAuthenticated) {
      saveDraft();
      setStep("email-verification");
      return;
    }

    // Authenticated but insufficient balance → go to paywall
    const imageCost = estimateImageCost(state.scenes.length, configCosts);
    if (balanceCents < imageCost) {
      saveDraft();
      setStep("paywall");
      return;
    }

    // Authenticated with enough balance → generate
    setGenerationProgress(null);
    setGenerationError(null);
    setStep("scene-preview");
    generateSceneImagesOnly();
  }, [isAuthenticated, balanceCents, state.scenes.length, configCosts, saveDraft, setStep, setGenerationProgress, setGenerationError, generateSceneImagesOnly]);

  const handleEmailVerified = useCallback(() => {
    refreshBalance();
    setStep("paywall");
  }, [refreshBalance, setStep]);

  const handleConfirmAndAnimate = useCallback(() => {
    if (!isAuthenticated) {
      saveDraft();
      setStep("email-verification");
      return;
    }

    setGenerationProgress(null);
    setGenerationError(null);
    setVideoUrls([]);
    setStep("loading");
    generateVideosOnly();
  }, [isAuthenticated, saveDraft, setStep, setGenerationProgress, setGenerationError, setVideoUrls, generateVideosOnly]);

  const handleRegenerateScene = useCallback(async (sceneId: string) => {
    setRegeneratingSceneId(sceneId);
    try {
      await regenerateSingleScene(sceneId);
    } finally {
      setRegeneratingSceneId(null);
    }
  }, [regenerateSingleScene]);

  const handleRetryGeneration = useCallback(() => {
    setGenerationError(null);
    runPipeline();
  }, [setGenerationError, runPipeline]);

  const handleSelectPlan = useCallback(async (planId: string) => {
    setPaymentLoading(true);
    try {
      saveDraft();

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          customer: {
            name: user?.user_metadata?.name || user?.email || "",
            email: user?.email || "",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to create payment");
      window.location.href = data.billing.url;
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentLoading(false);
    }
  }, [saveDraft, user]);

  const handleGenerationComplete = useCallback(() => {
    clearDraft();
  }, [clearDraft]);

  // Payment success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Pagamento confirmado!</h2>
          <p className="text-zinc-400 mb-6">
            Seus creditos serao adicionados em instantes.
            Aguarde nesta pagina ou volte ao funil.
          </p>
          <Button
            onClick={() => {
              refreshBalance();
              setPaymentSuccess(false);
              setStep("scenes");
            }}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0"
          >
            Voltar ao funil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {state.step === "landing" && (
        <LandingStep onStart={handleStartCharacters} isAuthenticated={isAuthenticated} />
      )}

      {state.step === "characters" && (
        <CharactersStep
          characters={state.characters}
          onAddCharacter={addCharacter}
          onUpdateCharacter={updateCharacter}
          onRemoveCharacter={removeCharacter}
          onContinue={handleContinueToStyle}
          onBack={() => setStep("landing")}
        />
      )}

      {state.step === "style" && (
        <StyleStep
          characters={state.characters}
          selectedStyle={state.selectedStyle}
          onSelectStyle={handleSelectStyle}
          onContinue={handleContinueToScenes}
          onBack={() => setStep("characters")}
          onUpdateCharacter={updateCharacter}
        />
      )}

      {state.step === "scenes" && (
        <ScenesStep
          scenes={state.scenes}
          characters={state.characters}
          selectedStyle={state.selectedStyle}
          aspectRatio={state.aspectRatio}
          balanceCents={balanceCents}
          costs={configCosts}
          onSetAspectRatio={setAspectRatio}
          onAddScene={addScene}
          onUpdateScene={updateScene}
          onRemoveScene={removeScene}
          onStartProcessing={handleStartProcessing}
          onBack={() => setStep("style")}
        />
      )}

      {state.step === "email-verification" && (
        <EmailStep
          onVerified={handleEmailVerified}
          onBack={() => setStep("scenes")}
        />
      )}

      {state.step === "scene-preview" && (
        <ScenePreviewStep
          scenes={state.scenes}
          characters={state.characters}
          selectedStyle={state.selectedStyle}
          balanceCents={balanceCents}
          costs={configCosts}
          isGenerating={regeneratingSceneId !== null || (state.generationProgress !== null && state.generationProgress.stage !== "complete")}
          regeneratingSceneId={regeneratingSceneId}
          onConfirm={handleConfirmAndAnimate}
          onRegenerate={handleRegenerateScene}
          onUpdateScene={updateScene}
          onBack={() => setStep("scenes")}
        />
      )}

      {state.step === "paywall" && (
        <PaywallStep
          plans={configPlans}
          onSelectPlan={handleSelectPlan}
          onBack={() => setStep("scenes")}
          isLoading={paymentLoading}
        />
      )}

      {state.step === "loading" && (
        <LoadingStep
          selectedStyle={state.selectedStyle}
          generationProgress={state.generationProgress}
          generationError={state.generationError}
          onRetry={handleRetryGeneration}
        />
      )}

      {state.step === "result" && (
        <ResultStep
          scenes={state.scenes}
          videoUrls={state.videoUrls}
          selectedStyle={state.selectedStyle}
          aspectRatio={state.aspectRatio}
          balanceCents={balanceCents}
          onCreateNew={() => {
            handleGenerationComplete();
            reset();
          }}
        />
      )}
    </div>
  );
}
