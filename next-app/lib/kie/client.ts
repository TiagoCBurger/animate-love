// =============================================================================
// KIE.AI API Client
// =============================================================================

import type { KieApiResponse, KieTaskResponse, KieTaskResult } from "./types";

const KIE_API_BASE_URL = "https://api.kie.ai/api/v1";
const KIE_API_KEY = process.env.KIE_API_KEY!;

/**
 * Base HTTP client for Kie.ai API
 */
async function kieRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<KieApiResponse<T>> {
  const url = `${KIE_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (data.code !== 200) {
    throw new KieApiError(data.code, data.msg, data);
  }

  return data;
}

/**
 * Create a generation task (unified endpoint for most models)
 */
export async function createTask(
  model: string,
  input: Record<string, unknown>,
  callbackUrl?: string,
  progressCallbackUrl?: string
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    input,
  };

  if (callbackUrl) {
    body.callBackUrl = callbackUrl;
  }

  if (progressCallbackUrl) {
    body.progressCallBackUrl = progressCallbackUrl;
  }

  const response = await kieRequest<KieTaskResponse>("/jobs/createTask", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response.data.taskId;
}

/**
 * Create a Veo3 video generation task (separate endpoint)
 */
export async function createVeoTask(
  options: {
    prompt: string;
    model?: string;
    generationType?: string;
    aspectRatio?: string;
    imageUrls?: string[];
    seeds?: number;
    enableTranslation?: boolean;
    watermark?: string;
    callbackUrl?: string;
  }
): Promise<string> {
  const body: Record<string, unknown> = {
    prompt: options.prompt,
    model: options.model || "veo3_fast",
    aspect_ratio: options.aspectRatio || "16:9",
    enableTranslation: options.enableTranslation ?? true,
  };

  if (options.generationType) {
    body.generationType = options.generationType;
  }

  if (options.imageUrls && options.imageUrls.length > 0) {
    body.imageUrls = options.imageUrls;
  }

  if (options.seeds) {
    body.seeds = options.seeds;
  }

  if (options.watermark) {
    body.watermark = options.watermark;
  }

  if (options.callbackUrl) {
    body.callBackUrl = options.callbackUrl;
  }

  const response = await kieRequest<KieTaskResponse>("/veo/generate", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return response.data.taskId;
}

/**
 * Query task status and results
 */
export async function getTaskStatus(taskId: string): Promise<KieTaskResult> {
  const response = await kieRequest<KieTaskResult>(
    `/jobs/taskInfo?taskId=${encodeURIComponent(taskId)}`,
    { method: "GET" }
  );

  return response.data;
}

/**
 * Query Veo3 task status
 */
export async function getVeoTaskStatus(taskId: string): Promise<KieTaskResult> {
  const response = await kieRequest<KieTaskResult>(
    `/veo/record-info?taskId=${encodeURIComponent(taskId)}`,
    { method: "GET" }
  );

  return response.data;
}

/**
 * Poll for task completion with timeout
 */
export async function waitForTask(
  taskId: string,
  options: {
    maxWaitMs?: number;
    pollIntervalMs?: number;
    isVeoTask?: boolean;
  } = {}
): Promise<KieTaskResult> {
  const {
    maxWaitMs = 5 * 60 * 1000, // 5 minutes default
    pollIntervalMs = 3000, // 3 seconds
    isVeoTask = false,
  } = options;

  const startTime = Date.now();
  const getStatus = isVeoTask ? getVeoTaskStatus : getTaskStatus;

  while (Date.now() - startTime < maxWaitMs) {
    const result = await getStatus(taskId);

    if (result.status === "completed") {
      return result;
    }

    if (result.status === "failed") {
      throw new KieApiError(501, result.error || "Task failed", result);
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new KieApiError(408, "Task timed out", { taskId });
}

/**
 * Custom error class for Kie API errors
 */
export class KieApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: unknown
  ) {
    super(`Kie API Error (${code}): ${message}`);
    this.name = "KieApiError";
  }
}

// Export client utilities
export { kieRequest, KIE_API_BASE_URL };
