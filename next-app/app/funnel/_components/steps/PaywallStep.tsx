"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PLANS, type PlanId } from "@/lib/abacatepay/plans";
import { ArrowLeft, Check, Crown, Sparkles, Zap } from "lucide-react";

interface PaywallStepProps {
  onSelectPlan: (planId: PlanId) => void;
  onBack: () => void;
  isLoading: boolean;
}

const PLAN_ICONS: Record<PlanId, React.ReactNode> = {
  plan_1: <Zap className="w-6 h-6" />,
  plan_3: <Sparkles className="w-6 h-6" />,
  plan_5: <Crown className="w-6 h-6" />,
};

const PLAN_COLORS: Record<PlanId, { bg: string; border: string; badge: string }> = {
  plan_1: {
    bg: "from-zinc-800 to-zinc-900",
    border: "border-zinc-700",
    badge: "bg-zinc-700",
  },
  plan_3: {
    bg: "from-pink-950/50 to-zinc-900",
    border: "border-pink-500/50",
    badge: "bg-pink-600",
  },
  plan_5: {
    bg: "from-amber-950/30 to-zinc-900",
    border: "border-amber-500/50",
    badge: "bg-amber-600",
  },
};

export function PaywallStep({ onSelectPlan, onBack, isLoading }: PaywallStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("plan_3");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectPlan(selectedPlan);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="max-w-3xl mx-auto w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">
            Escolha seu plano
          </h2>
          <p className="text-zinc-400">
            Selecione um plano para gerar sua historia animada
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {(Object.keys(PLANS) as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const colors = PLAN_COLORS[planId];
            const isSelected = selectedPlan === planId;
            const isPopular = planId === "plan_3";

            return (
              <button
                key={planId}
                onClick={() => setSelectedPlan(planId)}
                className={`relative rounded-2xl p-6 text-left transition-all border-2 bg-gradient-to-b ${colors.bg} ${
                  isSelected
                    ? "border-pink-500 scale-[1.02] shadow-lg shadow-pink-500/20"
                    : `${colors.border} hover:border-zinc-500`
                }`}
              >
                {isPopular && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 ${colors.badge} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                    Mais popular
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-pink-500/20 text-pink-400" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {PLAN_ICONS[planId]}
                  </div>
                  <span className="font-semibold text-lg">{plan.name}</span>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    R${(plan.price / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {plan.credits} {plan.credits === 1 ? "geração" : "gerações"} de vídeo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    +{plan.bonus} {plan.bonus === 1 ? "bônus" : "bônus"} grátis
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {plan.totalCredits} créditos no total
                  </li>
                </ul>

                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Pay button */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-xl shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50"
          >
            {isLoading ? "Processando..." : `Pagar R$${(PLANS[selectedPlan].price / 100).toFixed(2).replace(".", ",")}`}
          </Button>

          <p className="text-xs text-center text-zinc-500 mt-4">
            Pagamento seguro via PIX pelo AbacatePay.
          </p>
        </form>
      </div>
    </div>
  );
}
