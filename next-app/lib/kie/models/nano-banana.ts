// =============================================================================
// Nano Banana Pro - Google Image Generation
// =============================================================================

import { createTask, waitForTask } from "../client";
import { KIE_MODELS, type NanoBananaProOptions, type KieTaskResult } from "../types";

/**
 * Generate an image using Nano Banana Pro (Google)
 *
 * @example
 * ```ts
 * const result = await generateWithNanoBanana({
 *   prompt: "A futuristic cityscape at sunset",
 *   aspectRatio: "16:9",
 *   outputFormat: "png"
 * });
 * console.log(result.resultUrls);
 * ```
 */
export async function generateWithNanoBanana(
  options: NanoBananaProOptions
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    image_size: options.aspectRatio || "1:1",
    output_format: options.outputFormat || "png",
  };

  const taskId = await createTask(
    KIE_MODELS.NANO_BANANA,
    input,
    options.callbackUrl
  );

  // If callback URL provided, return early with taskId
  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  // Otherwise, wait for completion
  return waitForTask(taskId);
}

/**
 * Generate an image using Nano Banana Pro (enhanced version)
 */
export async function generateWithNanoBananaPro(
  options: NanoBananaProOptions & { imageUrl?: string }
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    image_size: options.aspectRatio || "1:1",
    output_format: options.outputFormat || "png",
  };

  if (options.imageUrl) {
    input.image_url = options.imageUrl;
  }

  const taskId = await createTask(
    KIE_MODELS.NANO_BANANA_PRO,
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
 * Start Nano Banana generation (async, returns taskId)
 */
export async function startNanoBananaGeneration(
  options: NanoBananaProOptions
): Promise<string> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    image_size: options.aspectRatio || "1:1",
    output_format: options.outputFormat || "png",
  };

  return createTask(KIE_MODELS.NANO_BANANA, input, options.callbackUrl);
}
