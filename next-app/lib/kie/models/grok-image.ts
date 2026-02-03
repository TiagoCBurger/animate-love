// =============================================================================
// Grok Imagine - xAI Image Generation
// =============================================================================

import { createTask, waitForTask } from "../client";
import { KIE_MODELS, type GrokImageOptions, type KieTaskResult } from "../types";

/**
 * Generate an image using Grok Imagine (Text to Image)
 *
 * @example
 * ```ts
 * const result = await generateWithGrokImage({
 *   prompt: "A cyberpunk street scene with neon lights",
 *   aspectRatio: "16:9"
 * });
 * console.log(result.resultUrls);
 * ```
 */
export async function generateWithGrokImage(
  options: GrokImageOptions
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    aspect_ratio: options.aspectRatio || "1:1",
  };

  const taskId = await createTask(
    KIE_MODELS.GROK_TEXT_TO_IMAGE,
    input,
    options.callbackUrl
  );

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  return waitForTask(taskId);
}

/**
 * Generate image from another image using Grok Imagine (Image to Image)
 */
export async function generateWithGrokImageToImage(
  options: GrokImageOptions & { imageUrl: string }
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    image_url: options.imageUrl,
    aspect_ratio: options.aspectRatio || "1:1",
  };

  const taskId = await createTask(
    KIE_MODELS.GROK_IMAGE_TO_IMAGE,
    input,
    options.callbackUrl
  );

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  return waitForTask(taskId);
}

/**
 * Upscale an image using Grok Imagine
 */
export async function upscaleWithGrokImage(
  taskIdToUpscale: string,
  callbackUrl?: string
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    task_id: taskIdToUpscale,
  };

  const taskId = await createTask(
    KIE_MODELS.GROK_IMAGE_UPSCALE,
    input,
    callbackUrl
  );

  if (callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  return waitForTask(taskId);
}

/**
 * Generate video from image using Grok Imagine
 */
export async function generateVideoWithGrokImage(
  options: {
    imageUrl: string;
    prompt?: string;
    callbackUrl?: string;
  }
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    image_url: options.imageUrl,
  };

  if (options.prompt) {
    input.prompt = options.prompt;
  }

  const taskId = await createTask(
    KIE_MODELS.GROK_IMAGE_TO_VIDEO,
    input,
    options.callbackUrl
  );

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  return waitForTask(taskId, { maxWaitMs: 10 * 60 * 1000 }); // 10 min for video
}

/**
 * Start Grok Image generation (async, returns taskId)
 */
export async function startGrokImageGeneration(
  options: GrokImageOptions
): Promise<string> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    aspect_ratio: options.aspectRatio || "1:1",
  };

  return createTask(KIE_MODELS.GROK_TEXT_TO_IMAGE, input, options.callbackUrl);
}
