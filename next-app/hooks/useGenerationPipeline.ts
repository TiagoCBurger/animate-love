"use client";

import { useCallback, useRef } from "react";
import type { Scene } from "@/types/scene";
import type { Character, GenerationProgress, AspectRatio } from "@/types/funnel";
import type { StyleId } from "@/lib/constants/styles";
import { STYLE_PRESETS } from "@/lib/constants/styles";
import { dataUrlToBlob } from "./useImageCrop";
import { estimateImageCost, estimateVideoCost, type CostsOverride } from "@/lib/costs";

interface UseGenerationPipelineOptions {
  characters: Character[];
  scenes: Scene[];
  selectedStyle: string | null;
  aspectRatio: AspectRatio;
  costs?: CostsOverride;
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void;
  setScenes: (scenes: Scene[]) => void;
  setGenerationProgress: (progress: GenerationProgress | null) => void;
  setGenerationError: (error: string | null) => void;
  setVideoUrls: (urls: string[]) => void;
  setStep: (step: "result") => void;
}

async function uploadImage(file: File | Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to upload image");
  const data = await response.json();
  return data.url;
}

async function generateStyledImage(imageUrl: string, style: string): Promise<string> {
  const response = await fetch("/api/kie/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "style", imageUrl, style }),
  });
  if (!response.ok) throw new Error("Failed to generate styled image");
  const data = await response.json();
  return data.image?.imageUrl || data.image?.url;
}

async function generateSceneImage(
  scenePrompt: string,
  characters: Array<{ name: string; description: string; styledUrl: string }>,
  style: string,
  aspectRatio: AspectRatio = "9:16"
): Promise<string> {
  // Build detailed character manifest with explicit role assignment
  // Using "PROTAGONIST" labeling to enforce character hierarchy
  const characterCount = characters.length;
  const charDescs = characters.length > 0
    ? characters.map((c, i) => `PROTAGONIST_${i + 1}: "${c.name}" (${c.description})`).join(" | ")
    : null;

  // Compose prompt with strict character constraints and trait fidelity
  // Explicit negative instructions prevent model from inventing or modifying characters
  const fullPrompt = charDescs
    ? `[CAST LOCK: EXACTLY ${characterCount} protagonist(s)] PROTAGONISTS: ${charDescs}. [SCENE]: ${scenePrompt}. [CHARACTER FIDELITY - CRITICAL]: Reproduce protagonists with 100% trait accuracy from reference images. DO NOT modify, alter, or reinterpret any physical features. Same face structure, same proportions, same colors, same distinctive marks. [FORBIDDEN]: No new main characters, no trait changes, no style reinterpretation of character features. Background extras must be blurred/silhouetted only.`
    : scenePrompt;

  // Collect all styled image URLs from referenced characters
  const imageUrls = characters
    .map((c) => c.styledUrl)
    .filter((url): url is string => Boolean(url));

  console.log("=== [generateSceneImage] DEBUG START ===");
  console.log(`[generateSceneImage] Total characters received: ${characters.length}`);
  characters.forEach((c, i) => {
    console.log(`  Character[${i}]: name="${c.name}", styledUrl=${c.styledUrl ? `"${c.styledUrl.substring(0, 60)}..."` : "EMPTY/MISSING"}`);
  });
  console.log(`[generateSceneImage] Valid imageUrls after filter: ${imageUrls.length}`);
  imageUrls.forEach((url, i) => {
    console.log(`  imageUrl[${i}]: ${url}`);
  });

  // GUARD: Warn if some characters are missing styledUrls
  const missingStyled = characters.filter((c) => !c.styledUrl);
  if (missingStyled.length > 0) {
    console.warn(`[generateSceneImage] WARNING: ${missingStyled.length} character(s) have NO styledUrl:`,
      missingStyled.map((c) => c.name));
  }
  console.log("=== [generateSceneImage] DEBUG END ===");

  const requestBody = {
    action: "generate-with-reference",
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    prompt: fullPrompt,
    style,
    aspectRatio,
  };

  console.log("[generateSceneImage] Request body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch("/api/kie/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) throw new Error("Failed to generate scene image");
  const data = await response.json();
  return data.image?.imageUrl || data.image?.url;
}

async function generateVideoWithKling25(
  sceneImageUrl: string,
  characters: Array<{ name: string; description: string; photoUrl: string }>,
  prompt: string,
  duration: string
): Promise<string> {
  // Build enhanced prompt with strict trait preservation for video animation
  // Video prompts focus on motion while maintaining exact character fidelity
  const characterCount = characters.length;
  let enhancedPrompt = prompt;
  if (characters.length > 0) {
    const characterDescs = characters
      .map((char, i) => `PROTAGONIST_${i + 1}: "${char.name}" (${char.description})`)
      .join(" | ");
    enhancedPrompt = `[VIDEO ANIMATION - CHARACTER FIDELITY MODE]

[PROTAGONISTS]: ${characterCount} character(s): ${characterDescs}

[ACTION]: ${prompt}

[TRAIT PRESERVATION - CRITICAL]:
- Character faces must remain IDENTICAL throughout animation
- NO morphing, warping, or distortion of facial features
- Maintain exact proportions, colors, and distinctive marks
- Characters must be recognizable in every single frame

[ANIMATION RULES]:
- Subtle natural movements: breathing, blinking, gentle expressions
- Smooth fluid motion without altering character structure
- Background/environment may animate freely
- Protagonists remain focal point

[FORBIDDEN]:
- Face morphing or feature drift
- Body proportion changes
- Color shifting on characters
- Introducing new characters`;
  } else {
    enhancedPrompt = `[VIDEO ANIMATION]
[ACTION]: ${prompt}

[RULES]:
- Natural ambient movement throughout scene
- Cinematic quality, smooth fluid animation
- Maintain visual consistency with source image`;
  }

  // Start async video generation with Kling 2.5
  const startResponse = await fetch("/api/kie/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "start",
      imageUrl: sceneImageUrl,
      prompt: enhancedPrompt,
      duration,
      model: "v2.5-turbo-pro",
      cfgScale: 0.5,
    }),
  });

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    throw new Error(`Kling 2.5 submit failed: ${errorText}`);
  }

  const startData = await startResponse.json();
  const taskId = startData.taskId;

  // Poll for completion
  const maxAttempts = 180; // 15 minutes with 5s intervals
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const statusResponse = await fetch(
      `/api/kie/video?taskId=${encodeURIComponent(taskId)}`
    );

    if (!statusResponse.ok) continue;

    const statusData = await statusResponse.json();

    if (statusData.status === "completed") {
      if (!statusData.resultUrls?.[0]) {
        throw new Error("Video generation completed but no URL returned");
      }
      return statusData.resultUrls[0];
    }

    if (statusData.status === "failed") {
      throw new Error(`Kling 2.5 video generation failed: ${statusData.error || "Unknown error"}`);
    }
  }

  throw new Error("Kling 2.5 video generation timed out after 15 minutes");
}

export function useGenerationPipeline({
  characters,
  scenes,
  selectedStyle,
  aspectRatio,
  costs,
  onUpdateCharacter,
  setScenes,
  setGenerationProgress,
  setGenerationError,
  setVideoUrls,
  setStep,
}: UseGenerationPipelineOptions) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const runPipeline = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    setGenerationError(null);

    // Characters that have photos
    const activeCharacters = characters.filter((c) => c.originalPreview);
    const uploadSteps = activeCharacters.filter((c) => !c.uploadedUrl && !c.croppedUploadedUrl).length;
    const styleSteps = activeCharacters.filter((c) => !c.styledUrl).length;
    const sceneSteps = scenes.length * 2;
    const totalSteps = uploadSteps + styleSteps + sceneSteps + 1;
    let completedSteps = 0;

    try {
      // Local maps to track URLs generated during this pipeline run
      // (React state updates are async, so closure values would be stale)
      const localUploadedUrls: Record<string, string> = {};
      const localStyledUrls: Record<string, string> = {};

      // Stage 1: Upload character photos if needed
      setGenerationProgress({
        stage: "uploading",
        currentScene: 0,
        totalScenes: scenes.length,
        currentStage: "image",
        message: "Enviando fotos dos personagens...",
        percentage: 0,
      });

      for (const char of activeCharacters) {
        let url = char.croppedUploadedUrl || char.uploadedUrl;
        if (!url) {
          const src = char.croppedPreview || char.originalPreview;
          if (char.originalFile && !char.croppedPreview) {
            url = await uploadImage(char.originalFile);
            onUpdateCharacter(char.id, { uploadedUrl: url });
          } else {
            const blob = dataUrlToBlob(src);
            url = await uploadImage(blob);
            if (char.croppedPreview) {
              onUpdateCharacter(char.id, { croppedUploadedUrl: url });
            } else {
              onUpdateCharacter(char.id, { uploadedUrl: url });
            }
          }
          localUploadedUrls[char.id] = url;
          completedSteps++;
          setGenerationProgress({
            stage: "uploading",
            currentScene: 0,
            totalScenes: scenes.length,
            currentStage: "image",
            message: `Enviando foto ${completedSteps} de ${uploadSteps}...`,
            percentage: (completedSteps / totalSteps) * 100,
          });
        }
      }

      // Stage 2: Ensure ALL characters are styled before proceeding to scenes
      // This guarantees styled images are ready even if user advanced too quickly
      if (selectedStyle) {
        for (const char of activeCharacters) {
          if (!char.styledUrl && !localStyledUrls[char.id]) {
            const imgUrl = char.croppedUploadedUrl || char.uploadedUrl || localUploadedUrls[char.id];
            if (imgUrl) {
              setGenerationProgress({
                stage: "generating-images",
                currentScene: 0,
                totalScenes: scenes.length,
                currentStage: "image",
                message: `Estilizando ${char.name}...`,
                percentage: (completedSteps / totalSteps) * 100,
              });
              const styledUrl = await generateStyledImage(imgUrl, selectedStyle);
              onUpdateCharacter(char.id, { styledUrl, styleStatus: "done" });
              localStyledUrls[char.id] = styledUrl;
              completedSteps++;
            }
          }
        }

        // Verify all characters have styled images before proceeding
        const allStyled = activeCharacters.every((c) =>
          c.styledUrl || localStyledUrls[c.id] || (!c.croppedUploadedUrl && !c.uploadedUrl && !localUploadedUrls[c.id])
        );
        if (!allStyled) {
          throw new Error("Não foi possível estilizar todos os personagens");
        }
      }

      // Build character reference data for video generation
      // Use local maps to get the most up-to-date URLs
      const uploadedCharacters = activeCharacters.map((char) => ({
        id: char.id,
        name: char.name,
        description: char.description,
        photoUrl: char.croppedUploadedUrl || char.uploadedUrl || localUploadedUrls[char.id] || "",
        styledUrl: char.styledUrl || localStyledUrls[char.id] || "",
      }));

      // Stage 3: Process each scene — generate scene image using styled characters
      const updatedScenes = [...scenes];
      const generatedVideoUrls: string[] = [];

      console.log("=== [runPipeline] CHARACTER SUMMARY ===");
      uploadedCharacters.forEach((c, i) => {
        console.log(`  uploadedChar[${i}]: id=${c.id}, name="${c.name}", styledUrl=${c.styledUrl ? `"${c.styledUrl.substring(0, 60)}..."` : "EMPTY"}`);
      });

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        let sourceImageUrl: string;

        // Find which characters are referenced in this scene
        const sceneCharIds = scene.referenceCharacterIds || [];
        const sceneChars = sceneCharIds.length > 0
          ? uploadedCharacters.filter((c) => sceneCharIds.includes(c.id))
          : []; // Empty array when no characters selected

        console.log(`=== [runPipeline] SCENE ${i + 1} ===`);
        console.log(`  referenceCharacterIds: ${JSON.stringify(sceneCharIds)}`);
        console.log(`  matched characters: ${sceneChars.length}`);
        sceneChars.forEach((c, j) => {
          console.log(`    sceneChar[${j}]: name="${c.name}", styledUrl=${c.styledUrl ? "SET" : "EMPTY"}`);
        });

        setGenerationProgress({
          stage: "generating-images",
          currentScene: i + 1,
          totalScenes: scenes.length,
          currentStage: "image",
          message: `Gerando imagem para cena ${i + 1}...`,
          percentage: (completedSteps / totalSteps) * 100,
        });

        // Generate scene image with all styled character images as reference
        sourceImageUrl = await generateSceneImage(
          scene.prompt,
          sceneChars.map((c) => ({ name: c.name, description: c.description, styledUrl: c.styledUrl })),
          selectedStyle!,
          aspectRatio
        );

        updatedScenes[i] = { ...updatedScenes[i], generatedImageUrl: sourceImageUrl };
        completedSteps++;

        // Generate video
        setGenerationProgress({
          stage: "generating-videos",
          currentScene: i + 1,
          totalScenes: scenes.length,
          currentStage: "video",
          message: `Animando cena ${i + 1} (${scene.duration}s) com Kling 2.5...`,
          percentage: (completedSteps / totalSteps) * 100,
        });

        // Use styled character images for video element references when available
        const videoCharacters = sceneChars.map((c) => ({
          name: c.name,
          description: c.description,
          photoUrl: c.styledUrl || c.photoUrl,
        }));

        const videoUrl = await generateVideoWithKling25(
          sourceImageUrl,
          videoCharacters,
          scene.prompt,
          scene.duration.toString()
        );

        updatedScenes[i] = { ...updatedScenes[i], videoUrl };
        generatedVideoUrls.push(videoUrl);
        completedSteps++;
      }

      setScenes(updatedScenes);
      setVideoUrls(generatedVideoUrls);

      // Stage 4: Create playlist
      setGenerationProgress({
        stage: "concatenating",
        currentScene: scenes.length,
        totalScenes: scenes.length,
        currentStage: "video",
        message: "Finalizando sua historia...",
        percentage: (completedSteps / totalSteps) * 100,
      });

      await fetch("/api/video/concat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "playlist",
          videos: generatedVideoUrls.map((url, i) => ({
            url,
            duration: scenes[i].duration,
          })),
        }),
      });

      completedSteps++;

      // Save generation and consume credit
      setGenerationProgress({
        stage: "concatenating",
        currentScene: scenes.length,
        totalScenes: scenes.length,
        currentStage: "video",
        message: "Salvando sua historia...",
        percentage: 98,
      });

      try {
        const styleName = selectedStyle
          ? selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)
          : "Projeto";
        await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            style: selectedStyle,
            aspectRatio,
            characters: uploadedCharacters.map((c) => ({
              name: c.name,
              description: c.description,
            })),
            scenes: updatedScenes.map((s) => ({
              prompt: s.prompt,
              duration: s.duration,
              imageUrl: s.generatedImageUrl,
            })),
            videoUrls: generatedVideoUrls,
            name: `${styleName} - ${new Date().toLocaleDateString("pt-BR")}`,
            thumbnailUrl: updatedScenes[0]?.generatedImageUrl || null,
          }),
        });
      } catch (err) {
        console.error("Failed to save generation:", err);
      }

      setGenerationProgress({
        stage: "complete",
        currentScene: scenes.length,
        totalScenes: scenes.length,
        currentStage: "video",
        message: "Sua historia esta pronta!",
        percentage: 100,
      });

      setTimeout(() => {
        setStep("result");
      }, 1500);
    } catch (error) {
      console.error("Generation error:", error);
      setGenerationError(
        error instanceof Error ? error.message : "Ocorreu um erro durante a geracao"
      );
    }
  }, [
    characters,
    scenes,
    selectedStyle,
    aspectRatio,
    onUpdateCharacter,
    setScenes,
    setGenerationProgress,
    setGenerationError,
    setVideoUrls,
    setStep,
  ]);

  // Generate only scene images (for preview before animating)
  const generateSceneImagesOnly = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    setGenerationError(null);

    const activeCharacters = characters.filter((c) => c.originalPreview);

    try {
      // Consume balance for image generation
      const imageCost = estimateImageCost(scenes.length, costs);
      const res = await fetch("/api/balance/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_cents: imageCost, type: "image_generation" }),
      });
      if (!res.ok) throw new Error("Saldo insuficiente para gerar imagens");

      // Local maps to track URLs generated during this pipeline run
      const localUploadedUrls: Record<string, string> = {};
      const localStyledUrls: Record<string, string> = {};

      // Stage 1: Upload character photos if needed
      setGenerationProgress({
        stage: "uploading",
        currentScene: 0,
        totalScenes: scenes.length,
        currentStage: "image",
        message: "Preparando personagens...",
        percentage: 0,
      });

      for (const char of activeCharacters) {
        let url = char.croppedUploadedUrl || char.uploadedUrl;
        if (!url) {
          const src = char.croppedPreview || char.originalPreview;
          if (char.originalFile && !char.croppedPreview) {
            url = await uploadImage(char.originalFile);
            onUpdateCharacter(char.id, { uploadedUrl: url });
          } else {
            const blob = dataUrlToBlob(src);
            url = await uploadImage(blob);
            if (char.croppedPreview) {
              onUpdateCharacter(char.id, { croppedUploadedUrl: url });
            } else {
              onUpdateCharacter(char.id, { uploadedUrl: url });
            }
          }
          localUploadedUrls[char.id] = url;
        }
      }

      // Stage 2: Ensure all characters are styled
      if (selectedStyle) {
        for (const char of activeCharacters) {
          if (!char.styledUrl && !localStyledUrls[char.id]) {
            const imgUrl = char.croppedUploadedUrl || char.uploadedUrl || localUploadedUrls[char.id];
            if (imgUrl) {
              setGenerationProgress({
                stage: "generating-images",
                currentScene: 0,
                totalScenes: scenes.length,
                currentStage: "image",
                message: `Estilizando ${char.name}...`,
                percentage: 20,
              });
              const styledUrl = await generateStyledImage(imgUrl, selectedStyle);
              onUpdateCharacter(char.id, { styledUrl, styleStatus: "done" });
              localStyledUrls[char.id] = styledUrl;
            }
          }
        }
      }

      // Build character reference data using local maps for fresh URLs
      const uploadedCharacters = activeCharacters.map((char) => ({
        id: char.id,
        name: char.name,
        description: char.description,
        photoUrl: char.croppedUploadedUrl || char.uploadedUrl || localUploadedUrls[char.id] || "",
        styledUrl: char.styledUrl || localStyledUrls[char.id] || "",
      }));

      // Stage 3: Generate scene images only
      const updatedScenes = [...scenes];

      console.log("=== [generateSceneImagesOnly] CHARACTER SUMMARY ===");
      uploadedCharacters.forEach((c, i) => {
        console.log(`  uploadedChar[${i}]: id=${c.id}, name="${c.name}", styledUrl=${c.styledUrl ? `"${c.styledUrl.substring(0, 60)}..."` : "EMPTY"}`);
      });

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const sceneCharIds = scene.referenceCharacterIds || [];
        const sceneChars = sceneCharIds.length > 0
          ? uploadedCharacters.filter((c) => sceneCharIds.includes(c.id))
          : [];

        console.log(`=== [generateSceneImagesOnly] SCENE ${i + 1} ===`);
        console.log(`  referenceCharacterIds: ${JSON.stringify(sceneCharIds)}`);
        console.log(`  matched characters: ${sceneChars.length}`);
        sceneChars.forEach((c, j) => {
          console.log(`    sceneChar[${j}]: name="${c.name}", styledUrl=${c.styledUrl ? "SET" : "EMPTY"}`);
        });

        setGenerationProgress({
          stage: "generating-images",
          currentScene: i + 1,
          totalScenes: scenes.length,
          currentStage: "image",
          message: `Gerando imagem da cena ${i + 1}...`,
          percentage: 40 + ((i + 1) / scenes.length) * 60,
        });

        const sourceImageUrl = await generateSceneImage(
          scene.prompt,
          sceneChars.map((c) => ({ name: c.name, description: c.description, styledUrl: c.styledUrl })),
          selectedStyle!,
          aspectRatio
        );

        updatedScenes[i] = { ...updatedScenes[i], generatedImageUrl: sourceImageUrl };
      }

      setScenes(updatedScenes);

      setGenerationProgress({
        stage: "complete",
        currentScene: scenes.length,
        totalScenes: scenes.length,
        currentStage: "image",
        message: "Imagens geradas!",
        percentage: 100,
      });
    } catch (error) {
      console.error("Image generation error:", error);
      setGenerationError(
        error instanceof Error ? error.message : "Erro ao gerar imagens"
      );
    }
  }, [
    characters,
    scenes,
    selectedStyle,
    aspectRatio,
    costs,
    onUpdateCharacter,
    setScenes,
    setGenerationProgress,
    setGenerationError,
  ]);

  // Generate videos only (assumes scene images already exist)
  const generateVideosOnly = useCallback(async () => {
    abortControllerRef.current = new AbortController();
    setGenerationError(null);

    const activeCharacters = characters.filter((c) => c.originalPreview);
    const generatedVideoUrls: string[] = [];

    try {
      // Consume balance for video generation
      const videoCost = estimateVideoCost(scenes, costs);
      const res = await fetch("/api/balance/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_cents: videoCost, type: "video_generation" }),
      });
      if (!res.ok) throw new Error("Saldo insuficiente para gerar videos");

      setGenerationProgress({
        stage: "generating-videos",
        currentScene: 0,
        totalScenes: scenes.length,
        currentStage: "video",
        message: "Preparando animação...",
        percentage: 0,
      });

      const uploadedCharacters = activeCharacters.map((char) => ({
        id: char.id,
        name: char.name,
        description: char.description,
        photoUrl: char.croppedUploadedUrl || char.uploadedUrl || "",
        styledUrl: char.styledUrl || "",
      }));

      const updatedScenes = [...scenes];

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];

        if (!scene.generatedImageUrl) {
          throw new Error(`Cena ${i + 1} não tem imagem gerada`);
        }

        const sceneCharIds = scene.referenceCharacterIds || [];
        const sceneChars = sceneCharIds.length > 0
          ? uploadedCharacters.filter((c) => sceneCharIds.includes(c.id))
          : [];

        setGenerationProgress({
          stage: "generating-videos",
          currentScene: i + 1,
          totalScenes: scenes.length,
          currentStage: "video",
          message: `Animando cena ${i + 1} (${scene.duration}s) com Kling 2.5...`,
          percentage: ((i + 1) / scenes.length) * 90,
        });

        const videoCharacters = sceneChars.map((c) => ({
          name: c.name,
          description: c.description,
          photoUrl: c.styledUrl || c.photoUrl,
        }));

        const videoUrl = await generateVideoWithKling25(
          scene.generatedImageUrl,
          videoCharacters,
          scene.prompt,
          scene.duration.toString()
        );

        updatedScenes[i] = { ...updatedScenes[i], videoUrl };
        generatedVideoUrls.push(videoUrl);
      }

      setScenes(updatedScenes);
      setVideoUrls(generatedVideoUrls);

      // Create playlist
      setGenerationProgress({
        stage: "concatenating",
        currentScene: scenes.length,
        totalScenes: scenes.length,
        currentStage: "video",
        message: "Finalizando sua história...",
        percentage: 95,
      });

      await fetch("/api/video/concat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "playlist",
          videos: generatedVideoUrls.map((url, i) => ({
            url,
            duration: scenes[i].duration,
          })),
        }),
      });

      // Save generation and consume credit
      try {
        const styleName = selectedStyle
          ? selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)
          : "Projeto";
        await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            style: selectedStyle,
            aspectRatio,
            characters: uploadedCharacters.map((c) => ({
              name: c.name,
              description: c.description,
            })),
            scenes: updatedScenes.map((s) => ({
              prompt: s.prompt,
              duration: s.duration,
              imageUrl: s.generatedImageUrl,
            })),
            videoUrls: generatedVideoUrls,
            name: `${styleName} - ${new Date().toLocaleDateString("pt-BR")}`,
            thumbnailUrl: updatedScenes[0]?.generatedImageUrl || null,
          }),
        });
      } catch (err) {
        console.error("Failed to save generation:", err);
      }

      setGenerationProgress({
        stage: "complete",
        currentScene: scenes.length,
        totalScenes: scenes.length,
        currentStage: "video",
        message: "Sua história está pronta!",
        percentage: 100,
      });

      setTimeout(() => {
        setStep("result");
      }, 1500);
    } catch (error) {
      console.error("Video generation error:", error);
      setGenerationError(
        error instanceof Error ? error.message : "Erro ao gerar vídeos"
      );
    }
  }, [
    characters,
    scenes,
    selectedStyle,
    aspectRatio,
    costs,
    setScenes,
    setGenerationProgress,
    setGenerationError,
    setVideoUrls,
    setStep,
  ]);

  // Regenerate image for a single scene by ID
  const regenerateSingleScene = useCallback(async (sceneId: string) => {
    setGenerationError(null);

    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) {
      setGenerationError("Cena não encontrada");
      return;
    }

    const activeCharacters = characters.filter((c) => c.originalPreview);

    try {
      setGenerationProgress({
        stage: "generating-images",
        currentScene: 1,
        totalScenes: 1,
        currentStage: "image",
        message: "Regenerando imagem da cena...",
        percentage: 10,
      });

      // Local maps to track URLs generated during this call
      const localUploadedUrls: Record<string, string> = {};
      const localStyledUrls: Record<string, string> = {};

      // Ensure characters are uploaded and styled
      for (const char of activeCharacters) {
        if (!char.croppedUploadedUrl && !char.uploadedUrl) {
          const src = char.croppedPreview || char.originalPreview;
          let url: string;
          if (char.originalFile && !char.croppedPreview) {
            url = await uploadImage(char.originalFile);
            onUpdateCharacter(char.id, { uploadedUrl: url });
          } else {
            const blob = dataUrlToBlob(src);
            url = await uploadImage(blob);
            if (char.croppedPreview) {
              onUpdateCharacter(char.id, { croppedUploadedUrl: url });
            } else {
              onUpdateCharacter(char.id, { uploadedUrl: url });
            }
          }
          localUploadedUrls[char.id] = url;
        }

        if (selectedStyle && !char.styledUrl && !localStyledUrls[char.id]) {
          const imgUrl = char.croppedUploadedUrl || char.uploadedUrl || localUploadedUrls[char.id];
          if (imgUrl) {
            const styledUrl = await generateStyledImage(imgUrl, selectedStyle);
            onUpdateCharacter(char.id, { styledUrl, styleStatus: "done" });
            localStyledUrls[char.id] = styledUrl;
          }
        }
      }

      // Build character data using local maps for fresh URLs
      const uploadedChars = activeCharacters.map((char) => ({
        id: char.id,
        name: char.name,
        description: char.description,
        photoUrl: char.croppedUploadedUrl || char.uploadedUrl || localUploadedUrls[char.id] || "",
        styledUrl: char.styledUrl || localStyledUrls[char.id] || "",
      }));

      // Get characters for this scene
      const sceneCharIds = scene.referenceCharacterIds || [];
      const sceneChars = sceneCharIds.length > 0
        ? uploadedChars.filter((c) => sceneCharIds.includes(c.id))
        : [];

      console.log("=== [regenerateSingleScene] CHARACTER SUMMARY ===");
      uploadedChars.forEach((c, i) => {
        console.log(`  uploadedChar[${i}]: id=${c.id}, name="${c.name}", styledUrl=${c.styledUrl ? `"${c.styledUrl.substring(0, 60)}..."` : "EMPTY"}`);
      });
      console.log(`  referenceCharacterIds: ${JSON.stringify(sceneCharIds)}`);
      console.log(`  matched characters: ${sceneChars.length}`);
      sceneChars.forEach((c, j) => {
        console.log(`    sceneChar[${j}]: name="${c.name}", styledUrl=${c.styledUrl ? "SET" : "EMPTY"}`);
      });

      setGenerationProgress({
        stage: "generating-images",
        currentScene: 1,
        totalScenes: 1,
        currentStage: "image",
        message: "Gerando nova imagem...",
        percentage: 50,
      });

      const newImageUrl = await generateSceneImage(
        scene.prompt,
        sceneChars.map((c) => ({ name: c.name, description: c.description, styledUrl: c.styledUrl })),
        selectedStyle!,
        aspectRatio
      );

      // Update only this scene
      const updatedScenes = scenes.map((s) =>
        s.id === sceneId ? { ...s, generatedImageUrl: newImageUrl, videoUrl: undefined } : s
      );
      setScenes(updatedScenes);

      setGenerationProgress({
        stage: "complete",
        currentScene: 1,
        totalScenes: 1,
        currentStage: "image",
        message: "Imagem regenerada!",
        percentage: 100,
      });

      // Clear progress after a moment
      setTimeout(() => setGenerationProgress(null), 1500);
    } catch (error) {
      console.error("Scene regeneration error:", error);
      setGenerationError(
        error instanceof Error ? error.message : "Erro ao regenerar imagem"
      );
      setGenerationProgress(null);
    }
  }, [
    characters,
    scenes,
    selectedStyle,
    aspectRatio,
    onUpdateCharacter,
    setScenes,
    setGenerationProgress,
    setGenerationError,
  ]);

  return { runPipeline, generateSceneImagesOnly, generateVideosOnly, regenerateSingleScene };
}
