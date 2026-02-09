// =============================================================================
// Kling 2.5 - Professional Image-to-Video Generation
// =============================================================================

import { createTask, waitForTask } from "../client";
import {
  KIE_MODELS,
  type KlingOptions,
  type KlingModel,
  type KieTaskResult,
} from "../types";

/**
 * Get the correct model constant based on KlingModel type
 */
function getKlingModelId(model: KlingModel = "v2.5-turbo-pro"): string {
  switch (model) {
    case "v2.5-turbo-pro":
      return KIE_MODELS.KLING_V2_5_TURBO_PRO;
    case "v2.5-turbo":
      return KIE_MODELS.KLING_V2_5_TURBO_STANDARD;
    case "v2.1-master":
      return KIE_MODELS.KLING_V2_1_MASTER;
    case "v2.1-standard":
      return KIE_MODELS.KLING_V2_1_STANDARD;
    default:
      return KIE_MODELS.KLING_V2_5_TURBO_PRO;
  }
}

/**
 * Multishot video prompt templates optimized for romantic couple animations
 * These prompts create smooth, cinematic animations with subtle movements
 */
export const MULTISHOT_PROMPTS = {
  // Base romantic prompts for different scenarios
  romantic_gaze: {
    prompt:
      "Cinematic video, smooth gentle camera movement, romantic couple portrait animation. Soft natural movements: gentle hair sway, subtle breathing, eyes blinking naturally, warm ambient lighting with bokeh. Emotional intimate moment, tender loving gaze between couple. Professional cinematography, shallow depth of field, golden hour warmth. 8K quality, film grain texture.",
    negativePrompt:
      "blur, distort, low quality, jerky movements, unnatural motion, morphing faces, deformed, glitch, artifacts, text, watermark",
  },

  romantic_embrace: {
    prompt:
      "Cinematic video, gentle embrace animation, romantic couple holding each other. Subtle natural movements: soft swaying, gentle breathing, light breeze on hair and clothes. Warm golden lighting, dreamy atmosphere, bokeh background. Intimate loving moment captured in motion. Professional film quality, smooth camera, shallow depth of field.",
    negativePrompt:
      "blur, distort, low quality, jerky movements, unnatural motion, morphing faces, deformed, glitch, artifacts",
  },

  romantic_kiss: {
    prompt:
      "Cinematic romantic video, tender kiss moment between couple. Slow gentle movements, soft lighting, intimate atmosphere. Natural subtle motions: slight head tilt, gentle breathing, soft hair movement in breeze. Warm color grading, professional cinematography, emotional scene. Shallow depth of field, bokeh lights background.",
    negativePrompt:
      "blur, distort, low quality, sudden movements, unnatural motion, morphing, deformed, glitch, artifacts",
  },

  romantic_walk: {
    prompt:
      "Cinematic couple walking video, romantic stroll together. Smooth camera tracking, natural walking motion, hands holding gently. Subtle movements: clothes flowing, hair swaying, soft smiles. Beautiful scenery background, golden hour lighting. Professional film quality, steady camera movement.",
    negativePrompt:
      "blur, distort, low quality, jerky camera, unnatural gait, morphing, deformed, glitch, artifacts",
  },

  romantic_dance: {
    prompt:
      "Cinematic romantic dance video, couple dancing slowly together. Graceful flowing movements, gentle spinning, intimate closeness. Soft ambient lighting, dreamy atmosphere, elegant motion. Natural body movements, synchronized dance, loving gazes. Professional cinematography, smooth camera work.",
    negativePrompt:
      "blur, distort, low quality, jerky movements, clumsy motion, morphing faces, deformed, glitch, artifacts",
  },

  // Generic romantic animation - good for any couple photo
  romantic_generic: {
    prompt:
      "Cinematic romantic couple portrait video, gentle natural animation. Subtle lifelike movements: soft breathing, gentle eye movements, slight smile changes, delicate hair sway in breeze. Warm intimate lighting, professional cinematography, shallow depth of field with bokeh. Emotional connection between couple, tender loving atmosphere. 8K quality, smooth motion, film-like color grading.",
    negativePrompt:
      "blur, distort, low quality, jerky movements, unnatural motion, morphing faces, deformed features, glitch, artifacts, text, watermark, sudden changes",
  },
} as const;

export type MultishotPromptType = keyof typeof MULTISHOT_PROMPTS;

/**
 * Generate optimized multishot prompt based on user's custom prompt
 * Combines user intent with professional animation directives
 */
export function createMultishotPrompt(
  userPrompt: string,
  type: MultishotPromptType = "romantic_generic"
): { prompt: string; negativePrompt: string } {
  const basePrompt = MULTISHOT_PROMPTS[type];

  // Combine user prompt with professional multishot directives
  const enhancedPrompt = `${userPrompt}. ${basePrompt.prompt}`;

  return {
    prompt: enhancedPrompt,
    negativePrompt: basePrompt.negativePrompt,
  };
}

/**
 * Generate video from image using Kling 2.5 Turbo Pro
 *
 * @example
 * ```ts
 * const result = await generateWithKling({
 *   prompt: "Couple smiling at each other with love",
 *   imageUrl: "https://example.com/couple.jpg",
 *   duration: "5"
 * });
 * console.log(result.resultUrls);
 * ```
 */
export async function generateWithKling(
  options: KlingOptions
): Promise<KieTaskResult> {
  const modelId = getKlingModelId(options.model);

  const input: Record<string, unknown> = {
    prompt: options.prompt,
    image_url: options.imageUrl,
    duration: options.duration || "5",
    negative_prompt: options.negativePrompt || "blur, distort, and low quality",
    cfg_scale: options.cfgScale ?? 0.5,
  };

  if (options.tailImageUrl) {
    input.tail_image_url = options.tailImageUrl;
  }

  const taskId = await createTask(modelId, input, options.callbackUrl);

  if (options.callbackUrl) {
    return {
      taskId,
      status: "pending",
    };
  }

  // Kling video generation takes time
  return waitForTask(taskId, {
    maxWaitMs: 10 * 60 * 1000, // 10 minutes
    pollIntervalMs: 5000,
  });
}

/**
 * Generate video with optimized multishot prompt
 * Uses professional animation directives for best results
 */
export async function generateKlingWithMultishot(
  options: Omit<KlingOptions, "negativePrompt"> & {
    promptType?: MultishotPromptType;
  }
): Promise<KieTaskResult> {
  const { prompt, negativePrompt } = createMultishotPrompt(
    options.prompt,
    options.promptType || "romantic_generic"
  );

  return generateWithKling({
    ...options,
    prompt,
    negativePrompt,
  });
}

/**
 * Start Kling generation (async, returns taskId immediately)
 */
export async function startKlingGeneration(
  options: KlingOptions
): Promise<string> {
  const modelId = getKlingModelId(options.model);

  const input: Record<string, unknown> = {
    prompt: options.prompt,
    image_url: options.imageUrl,
    duration: options.duration || "5",
    negative_prompt: options.negativePrompt || "blur, distort, and low quality",
    cfg_scale: options.cfgScale ?? 0.5,
  };

  if (options.tailImageUrl) {
    input.tail_image_url = options.tailImageUrl;
  }

  return createTask(modelId, input, options.callbackUrl);
}

/**
 * Start Kling generation with multishot optimization
 */
export async function startKlingMultishotGeneration(
  options: Omit<KlingOptions, "negativePrompt"> & {
    promptType?: MultishotPromptType;
  }
): Promise<string> {
  const { prompt, negativePrompt } = createMultishotPrompt(
    options.prompt,
    options.promptType || "romantic_generic"
  );

  return startKlingGeneration({
    ...options,
    prompt,
    negativePrompt,
  });
}

/**
 * Batch generate videos for multiple images
 * Returns array of task IDs for parallel processing
 */
export async function batchStartKlingGeneration(
  images: Array<{
    imageUrl: string;
    prompt: string;
    promptType?: MultishotPromptType;
  }>,
  commonOptions?: Partial<Omit<KlingOptions, "imageUrl" | "prompt">>
): Promise<string[]> {
  const taskIds: string[] = [];

  for (const image of images) {
    const { prompt, negativePrompt } = createMultishotPrompt(
      image.prompt,
      image.promptType || "romantic_generic"
    );

    const taskId = await startKlingGeneration({
      imageUrl: image.imageUrl,
      prompt,
      negativePrompt,
      duration: commonOptions?.duration || "5",
      cfgScale: commonOptions?.cfgScale ?? 0.5,
      model: commonOptions?.model || "v2.5-turbo-pro",
      callbackUrl: commonOptions?.callbackUrl,
    });

    taskIds.push(taskId);
  }

  return taskIds;
}
