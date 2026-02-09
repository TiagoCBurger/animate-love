// =============================================================================
// KIE.AI Provider - Unified AI Generation API
// =============================================================================

// Client
export {
  createTask,
  createVeoTask,
  getTaskStatus,
  getVeoTaskStatus,
  waitForTask,
  KieApiError,
} from "./client";

// Types
export * from "./types";

// Image Models
export {
  generateWithNanoBanana,
  generateWithNanoBananaPro,
  generateWithNanoBananaEdit,
  startNanoBananaGeneration,
  startNanoBananaEditGeneration,
} from "./models/nano-banana";

export {
  generateWithFlux2,
  generateWithFlux2ImageToImage,
  startFlux2Generation,
} from "./models/flux2";

export {
  generateWithGrokImage,
  generateWithGrokImageToImage,
  upscaleWithGrokImage,
  generateVideoWithGrokImage,
  startGrokImageGeneration,
} from "./models/grok-image";

// Video Models
export {
  generateWithVeo3,
  generateVeo3FromFrames,
  generateVeo3FromReference,
  startVeo3Generation,
} from "./models/veo3";

export {
  generateWithSora2,
  generateSora2FromImage,
  generateWithSora2Pro,
  generateSora2ProFromImage,
  startSora2Generation,
} from "./models/sora2";

// Kling Video Models
export {
  generateWithKling,
  generateKlingWithMultishot,
  startKlingGeneration,
  startKlingMultishotGeneration,
  batchStartKlingGeneration,
  createMultishotPrompt,
  MULTISHOT_PROMPTS,
  type MultishotPromptType,
} from "./models/kling";
