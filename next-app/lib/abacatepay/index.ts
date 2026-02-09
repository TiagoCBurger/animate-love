import AbacatePay from "abacatepay-nodejs-sdk";
import { PLANS, type PlanId } from "./plans";

export { PLANS, type PlanId } from "./plans";

const apiKey = process.env.ABACATEPAY_API_KEY;

if (!apiKey) {
  console.warn("ABACATEPAY_API_KEY not configured");
}

export const abacatepay = apiKey ? AbacatePay(apiKey) : null;

export interface CreateBillingParams {
  planId: PlanId;
  customer: {
    name: string;
    email: string;
    cellphone?: string;
    taxId?: string;
  };
}

export interface BillingResponse {
  id: string;
  url: string;
  amount: number;
  status: string;
  devMode: boolean;
  methods: string[];
  frequency: string;
  customer: {
    id: string;
    metadata: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
}

export async function createBilling(params: CreateBillingParams): Promise<BillingResponse> {
  if (!abacatepay) {
    throw new Error("AbacatePay not configured");
  }

  const plan = PLANS[params.planId];
  if (!plan) {
    throw new Error("Invalid plan");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Store planId and credits in the product externalId for webhook reference
  const externalId = `${plan.id}:${plan.totalCredits}`;

  const billing = await abacatepay.billing.create({
    frequency: "ONE_TIME",
    methods: ["PIX"],
    products: [
      {
        externalId: externalId,
        name: `${plan.name} + ${plan.bonus} bônus`,
        quantity: 1,
        price: plan.price,
      },
    ],
    returnUrl: `${baseUrl}/funnel?status=pending`,
    completionUrl: `${baseUrl}/funnel?status=success`,
    customer: {
      name: params.customer.name,
      email: params.customer.email,
      cellphone: params.customer.cellphone || "",
      taxId: params.customer.taxId || "",
    },
  });

  return billing.data as BillingResponse;
}

// Webhook signature validation
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Webhook event types
export interface WebhookBillingPaidEvent {
  event: "billing.paid";
  data: {
    billing: {
      id: string;
      amount: number;
      status: string;
      fee: number;
      method: string;
      products: Array<{
        externalId: string;
        name: string;
        quantity: number;
        price: number;
      }>;
      customer: {
        id: string;
        metadata: {
          name: string;
          email: string;
          cellphone: string;
          taxId: string;
        };
      };
      paidAt: string;
      createdAt: string;
    };
  };
}

export type WebhookEvent = WebhookBillingPaidEvent;
