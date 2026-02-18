"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Crown, Sparkles, Zap } from "lucide-react";
import { formatCredits, formatBRL } from "@/lib/costs";

export interface PaywallPlan {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  priceCents: number;
  description: string;
}

interface PaywallStepProps {
  plans: PaywallPlan[];
  onSelectPlan: (planId: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const PLAN_ICONS = [
  <Zap key="zap" className="w-6 h-6" />,
  <Sparkles key="sparkles" className="w-6 h-6" />,
  <Crown key="crown" className="w-6 h-6" />,
];

const PLAN_COLORS = [
  {
    bg: "from-zinc-800 to-zinc-900",
    border: "border-zinc-700",
    badge: "bg-zinc-700",
  },
  {
    bg: "from-pink-950/50 to-zinc-900",
    border: "border-pink-500/50",
    badge: "bg-pink-600",
  },
  {
    bg: "from-amber-950/30 to-zinc-900",
    border: "border-amber-500/50",
    badge: "bg-amber-600",
  },
];

export function PaywallStep({ plans, onSelectPlan, onBack, isLoading }: PaywallStepProps) {
  // Default to second plan (popular) if available
  const defaultPlanId = plans.length >= 2 ? plans[1].id : plans[0]?.id ?? "";
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectPlan(selectedPlanId);
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
          {plans.map((plan, index) => {
            const colors = PLAN_COLORS[index] || PLAN_COLORS[0];
            const icon = PLAN_ICONS[index] || PLAN_ICONS[0];
            const isSelected = selectedPlanId === plan.id;
            const isPopular = index === 1; // second plan is "popular"

            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
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
                    {icon}
                  </div>
                  <span className="font-semibold text-lg">{plan.name}</span>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    R${(plan.priceCents / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {formatCredits(plan.credits)}
                  </li>
                  {plan.bonusCredits > 0 && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      +{formatCredits(plan.bonusCredits)} gratis
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {formatCredits(plan.totalCredits)} no total
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {plan.description}
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
            disabled={isLoading || !selectedPlan}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border-0 rounded-xl shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50"
          >
            {isLoading
              ? "Processando..."
              : selectedPlan
              ? `Pagar R$${(selectedPlan.priceCents / 100).toFixed(2).replace(".", ",")}`
              : "Selecione um plano"}
          </Button>

          <p className="text-xs text-center text-zinc-500 mt-4">
            Pagamento seguro via PIX pelo AbacatePay.
          </p>
        </form>
      </div>
    </div>
  );
}
