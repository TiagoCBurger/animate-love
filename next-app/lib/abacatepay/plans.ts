// Plan configurations - shared between client and server
export const PLANS = {
  plan_1: {
    id: "plan_1",
    name: "1 Geração",
    credits: 1,
    bonus: 1,
    totalCredits: 2,
    price: 990, // in cents (R$9,90)
  },
  plan_3: {
    id: "plan_3",
    name: "3 Gerações",
    credits: 3,
    bonus: 2,
    totalCredits: 5,
    price: 2990, // in cents (R$29,90)
  },
  plan_5: {
    id: "plan_5",
    name: "5 Gerações",
    credits: 5,
    bonus: 3,
    totalCredits: 8,
    price: 5990, // in cents (R$59,90)
  },
} as const;

export type PlanId = keyof typeof PLANS;
