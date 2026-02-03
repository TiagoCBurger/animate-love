// =============================================================================
// Sora 2 - OpenAI Video Generation
// =============================================================================

import { createTask, waitForTask } from "../client";
import { KIE_MODELS, type Sora2Options, type KieTaskResult } from "../types";

/**
 * Generate a video using Sora 2 (Text to Video)
 *
 * @example
 * ```ts
 * const result = await generateWithSora2({
 *   prompt: "A timelapse of flowers blooming in a garden",
 *   aspectRatio: "landscape",
 *   nFrames: "15"
 * });
 * console.log(result.resultUrls);
 * ```
 */
export async function generateWithSora2(
  options: Sora2Options
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    aspect_ratio: options.aspectRatio || "landscape",
    n_frames: options.nFrames || "10",
  };

  if (options.removeWatermark !== undefined) {
    input.remove_watermark = options.removeWatermark;
  }

  if (options.characterIdList && options.characterIdList.length > 0) {
    input.character_id_list = options.characterIdList;
  }

  const taskId = await createTask(
    KIE_MODELS.SORA2_TEXT_TO_VIDEO,
    input,
    options.callbackUrl,
    options.progressCallbackUrl
  );

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  // Video generation takes longer
  return waitForTask(taskId, {
    maxWaitMs: 10 * 60 * 1000,
    pollIntervalMs: 5000,
  });
}

/**
 * Generate a video from an image using Sora 2 (Image to Video)
 *
 * @example
 * ```ts
 * const result = await generateSora2FromImage({
 *   prompt: "Animate this landscape with gentle wind",
 *   imageUrl: "https://example.com/landscape.jpg",
 *   aspectRatio: "landscape"
 * });
 * ```
 */
export async function generateSora2FromImage(
  options: Sora2Options & { imageUrl: string }
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    image_urls: [options.imageUrl],
    aspect_ratio: options.aspectRatio || "landscape",
    n_frames: options.nFrames || "10",
  };

  if (options.removeWatermark !== undefined) {
    input.remove_watermark = options.removeWatermark;
  }

  if (options.characterIdList && options.characterIdList.length > 0) {
    input.character_id_list = options.characterIdList;
  }

  const taskId = await createTask(
    KIE_MODELS.SORA2_IMAGE_TO_VIDEO,
    input,
    options.callbackUrl,
    options.progressCallbackUrl
  );

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  return waitForTask(taskId, {
    maxWaitMs: 10 * 60 * 1000,
    pollIntervalMs: 5000,
  });
}

/**
 * Generate high-quality video using Sora 2 Pro (Text to Video)
 */
export async function generateWithSora2Pro(
  options: Sora2Options
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    aspect_ratio: options.aspectRatio || "landscape",
    n_frames: options.nFrames || "10",
  };

  if (options.removeWatermark !== undefined) {
    input.remove_watermark = options.removeWatermark;
  }

  if (options.characterIdList && options.characterIdList.length > 0) {
    input.character_id_list = options.characterIdList;
  }

  const taskId = await createTask(
    KIE_MODELS.SORA2_PRO_TEXT_TO_VIDEO,
    input,
    options.callbackUrl,
    options.progressCallbackUrl
  );

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  return waitForTask(taskId, {
    maxWaitMs: 15 * 60 * 1000, // Pro takes longer
    pollIntervalMs: 5000,
  });
}

/**
 * Generate high-quality video from image using Sora 2 Pro
 */
export async function generateSora2ProFromImage(
  options: Sora2Options & { imageUrl: string }
): Promise<KieTaskResult> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    image_urls: [options.imageUrl],
    aspect_ratio: options.aspectRatio || "landscape",
    n_frames: options.nFrames || "10",
  };

  if (options.removeWatermark !== undefined) {
    input.remove_watermark = options.removeWatermark;
  }

  if (options.characterIdList && options.characterIdList.length > 0) {
    input.character_id_list = options.characterIdList;
  }

  const taskId = await createTask(
    KIE_MODELS.SORA2_PRO_IMAGE_TO_VIDEO,
    input,
    options.callbackUrl,
    options.progressCallbackUrl
  );

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  return waitForTask(taskId, {
    maxWaitMs: 15 * 60 * 1000,
    pollIntervalMs: 5000,
  });
}

/**
 * Start Sora 2 generation (async, returns taskId)
 */
export async function startSora2Generation(options: Sora2Options): Promise<string> {
  const input: Record<string, unknown> = {
    prompt: options.prompt,
    aspect_ratio: options.aspectRatio || "landscape",
    n_frames: options.nFrames || "10",
  };

  if (options.removeWatermark !== undefined) {
    input.remove_watermark = options.removeWatermark;
  }

  if (options.characterIdList && options.characterIdList.length > 0) {
    input.character_id_list = options.characterIdList;
  }

  return createTask(
    KIE_MODELS.SORA2_TEXT_TO_VIDEO,
    input,
    options.callbackUrl,
    options.progressCallbackUrl
  );
}
