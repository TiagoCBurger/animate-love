// 1 crédito = 1 centavo interno
// Custos reais: imagem=$0.02 (~R$0,10), vídeo=$0.15/s (~R$0,75/s)
export const COSTS = {
  IMAGE_GENERATION: 10,   // 10 créditos por imagem
  VIDEO_PER_SECOND: 75,   // 75 créditos por segundo de vídeo
} as const;

/** Overridable cost config (from DB). When absent, uses static COSTS. */
export interface CostsOverride {
  image: number;
  video_per_second: number;
}

export function estimateImageCost(sceneCount: number, costs?: CostsOverride): number {
  const perImage = costs?.image ?? COSTS.IMAGE_GENERATION;
  return sceneCount * perImage;
}

export function estimateVideoCost(scenes: { duration: number }[], costs?: CostsOverride): number {
  const perSecond = costs?.video_per_second ?? COSTS.VIDEO_PER_SECOND;
  const totalSeconds = scenes.reduce((sum, s) => sum + s.duration, 0);
  return totalSeconds * perSecond;
}

export interface CostEstimate {
  imageCredits: number;
  videoCredits: number;
  totalCredits: number;
}

export function estimateProjectCost(scenes: { duration: number }[], costs?: CostsOverride): CostEstimate {
  const imageCredits = estimateImageCost(scenes.length, costs);
  const videoCredits = estimateVideoCost(scenes, costs);
  return {
    imageCredits,
    videoCredits,
    totalCredits: imageCredits + videoCredits,
  };
}

export function formatCredits(credits: number): string {
  return `${credits} créditos`;
}

/** Format BRL for payment-facing contexts (AbacatePay product names etc.) */
export function formatBRL(cents: number): string {
  const reais = (cents / 100).toFixed(2).replace(".", ",");
  return `R$ ${reais}`;
}

export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost;
}
