// =============================================================================
// Scene Types for Storytelling System
// =============================================================================

/**
 * Type of scene generation
 * - photo-based: Uses uploaded reference photo as base
 * - prompt-only: Generates image from AI using character reference
 */
export type SceneType = "photo-based" | "prompt-only";

/**
 * Available scene durations (Kling 2.5 supports only 5 seconds)
 */
export type SceneDuration = 5;

/**
 * Scene generation status
 */
export type SceneStatus =
  | "pending"
  | "generating-image"
  | "generating-video"
  | "completed"
  | "failed";

/**
 * Individual scene in the story
 */
export interface Scene {
  id: string;
  type: SceneType;
  duration: SceneDuration;
  prompt: string;

  // For photo-based scenes: which reference photo to use
  referencePhotoId?: string;

  // Characters referenced in this scene
  referenceCharacterIds?: string[];

  // Generation results
  generatedImageUrl?: string; // Flux2 result (styled or generated)
  videoUrl?: string; // Kling result
  taskId?: string; // Current generation task ID

  // Status tracking
  status?: SceneStatus;
  error?: string;
}

/**
 * Story configuration containing all scenes and settings
 */
export interface StoryConfig {
  characters: Array<{
    id: string;
    name: string;
    description: string;
    styledUrl?: string;
    uploadedUrl?: string;
  }>;
  scenes: Scene[];
  totalDuration: number;
  style: string;
}

// =============================================================================
// Duration Constraints
// =============================================================================

export const DURATION_CONSTRAINTS = {
  /** Minimum total duration in seconds */
  TOTAL_MIN: 0,

  /** Maximum total duration in seconds (Kling 2.5: 3 scenes × 5s = 15s) */
  TOTAL_MAX: 15,

  /** Allowed durations for each scene (Kling 2.5: 5 seconds only) */
  ALLOWED_DURATIONS: [5] as const,

  /** Minimum duration per scene */
  MIN_DURATION: 5,

  /** Maximum duration per scene */
  MAX_DURATION: 5,

  /** Minimum number of scenes */
  MIN_SCENES: 1,

  /** Maximum number of scenes (Kling 2.5: max 3 scenes) */
  MAX_SCENES: 3,
} as const;

/**
 * Suggested scene configurations (Kling 2.5: 5 seconds only)
 */
export const SUGGESTED_CONFIGURATIONS = [
  { scenes: [5], label: "1 cena de 5s" },
  { scenes: [5, 5], label: "2 cenas de 5s" },
  { scenes: [5, 5, 5], label: "3 cenas de 5s" },
] as const;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Calculate total duration from scenes
 */
export function getTotalDuration(scenes: Scene[]): number {
  return scenes.reduce((sum, s) => sum + s.duration, 0);
}

/**
 * Calculate remaining duration until max
 */
export function getRemainingDuration(scenes: Scene[]): number {
  const used = getTotalDuration(scenes);
  return DURATION_CONSTRAINTS.TOTAL_MAX - used;
}

/**
 * Check if a new scene with given duration can be added
 */
export function canAddScene(scenes: Scene[], duration: SceneDuration): boolean {
  return getRemainingDuration(scenes) >= duration;
}

/**
 * Get available durations based on remaining time
 */
export function getAvailableDurations(scenes: Scene[]): SceneDuration[] {
  const remaining = getRemainingDuration(scenes);
  return DURATION_CONSTRAINTS.ALLOWED_DURATIONS.filter((d) => d <= remaining);
}

/**
 * Check if scene configuration is valid (0-15s total)
 */
export function isValidConfiguration(scenes: Scene[]): boolean {
  const total = getTotalDuration(scenes);
  return total >= DURATION_CONSTRAINTS.TOTAL_MIN && total <= DURATION_CONSTRAINTS.TOTAL_MAX;
}

/**
 * Validate all scenes and return errors
 */
export function validateScenes(
  scenes: Scene[],
  characterDescription: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check total duration
  const total = getTotalDuration(scenes);
  if (total > DURATION_CONSTRAINTS.TOTAL_MAX) {
    errors.push(
      `Duração máxima é ${DURATION_CONSTRAINTS.TOTAL_MAX}s (atual: ${total}s)`
    );
  }

  // Check minimum scenes
  if (scenes.length === 0) {
    errors.push("Adicione pelo menos uma cena");
  }

  // Check each scene
  scenes.forEach((scene, i) => {
    // All scenes need a prompt
    if (!scene.prompt.trim()) {
      errors.push(`Cena ${i + 1}: Adicione uma descrição`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Create a new empty scene with default values
 */
export function createScene(
  type: SceneType,
  duration: SceneDuration,
  referencePhotoId?: string
): Scene {
  return {
    id: crypto.randomUUID(),
    type,
    duration,
    prompt: "",
    referencePhotoId: type === "photo-based" ? referencePhotoId : undefined,
    status: "pending",
  };
}
