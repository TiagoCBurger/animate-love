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

  console.log("[KIE Client] Request:", options.method || "GET", url);

  if (!KIE_API_KEY) {
    console.error("[KIE Client] ERROR: KIE_API_KEY is not configured!");
    throw new KieApiError(401, "KIE_API_KEY is not configured", {});
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  console.log("[KIE Client] Response status:", response.status);
  console.log("[KIE Client] Response code:", data.code, "msg:", data.msg);

  if (data.code !== 200) {
    console.error("[KIE Client] API Error:", data);
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

  console.log("[KIE Client] Creating task with body:", JSON.stringify(body, null, 2));

  const response = await kieRequest<KieTaskResponse>("/jobs/createTask", {
    method: "POST",
    body: JSON.stringify(body),
  });

  console.log("[KIE Client] Task created successfully:", response.data.taskId);

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
  console.log("[KIE Client] Fetching status for taskId:", taskId);

  const response = await kieRequest<{
    taskId: string;
    model: string;
    state: "waiting" | "generating" | "success" | "fail";
    param: string;
    resultJson: string | null;
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  }>(`/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, { method: "GET" });

  const data = response.data;

  console.log("[KIE Client] Raw API response:", JSON.stringify(data, null, 2));

  // Parse resultJson if available
  let resultUrls: string[] | undefined;
  if (data.resultJson) {
    try {
      const parsed = JSON.parse(data.resultJson);
      resultUrls = parsed.resultUrls;
      console.log("[KIE Client] Parsed resultUrls:", resultUrls);
    } catch (e) {
      console.warn("[KIE Client] Failed to parse resultJson:", e);
    }
  }

  // Convert state to status for consistency
  // Kie.ai states: "waiting", "generating", "success", "fail"
  let status: "pending" | "processing" | "completed" | "failed";

  switch (data.state) {
    case "waiting":
      status = "pending";
      break;
    case "generating":
      status = "processing";
      break;
    case "success":
      status = "completed";
      break;
    case "fail":
      status = "failed";
      break;
    default:
      // Unknown state - treat as processing to avoid false failures
      console.warn(`[KIE Client] Unknown state: "${data.state}", treating as processing`);
      status = "processing";
  }

  console.log("[KIE Client] Mapped status:", {
    rawState: data.state,
    mappedStatus: status,
    failCode: data.failCode,
    failMsg: data.failMsg
  });

  return {
    taskId: data.taskId,
    status,
    resultUrls,
    error: data.failMsg || undefined,
  };
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
