"use client";

import { useCallback } from "react";
import type { Character } from "@/types/funnel";
import { dataUrlToBlob } from "./useImageCrop";

interface UseStylePreviewOptions {
  characters: Character[];
  selectedStyle: string | null;
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void;
}

async function uploadImage(file: File | Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await response.json();
  return data.url;
}

async function generateStyledImage(imageUrl: string, style: string): Promise<string> {
  const response = await fetch("/api/kie/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "style",
      imageUrl,
      style,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate styled image");
  }

  const data = await response.json();
  return data.image?.imageUrl || data.image?.url;
}

export function useStylePreview({
  characters,
  selectedStyle,
  onUpdateCharacter,
}: UseStylePreviewOptions) {
  const generatePreviewForCharacter = useCallback(
    async (characterId: string) => {
      if (!selectedStyle) return;

      const character = characters.find((c) => c.id === characterId);
      if (!character) return;

      onUpdateCharacter(characterId, { styleStatus: "generating" });

      try {
        // Upload the crop (or original) if not yet uploaded
        let imageUrl = character.croppedUploadedUrl || character.uploadedUrl;

        if (!imageUrl) {
          const src = character.croppedPreview || character.originalPreview;
          if (!src) throw new Error("No image to upload");

          if (character.originalFile && !character.croppedPreview) {
            imageUrl = await uploadImage(character.originalFile);
            onUpdateCharacter(characterId, { uploadedUrl: imageUrl });
          } else {
            const blob = dataUrlToBlob(src);
            imageUrl = await uploadImage(blob);
            if (character.croppedPreview) {
              onUpdateCharacter(characterId, { croppedUploadedUrl: imageUrl });
            } else {
              onUpdateCharacter(characterId, { uploadedUrl: imageUrl });
            }
          }
        }

        // Generate styled version
        const styledUrl = await generateStyledImage(imageUrl, selectedStyle);

        onUpdateCharacter(characterId, {
          styledUrl,
          styleStatus: "done",
        });
      } catch (err) {
        console.error("Style preview generation failed:", err);
        onUpdateCharacter(characterId, { styleStatus: "error" });
      }
    },
    [characters, selectedStyle, onUpdateCharacter]
  );

  const generateAllPreviews = useCallback(async () => {
    if (!selectedStyle) return;

    const toGenerate = characters.filter(
      (c) => c.originalPreview && c.styleStatus !== "generating" && c.styleStatus !== "done"
    );

    await Promise.allSettled(
      toGenerate.map((c) => generatePreviewForCharacter(c.id))
    );
  }, [characters, selectedStyle, generatePreviewForCharacter]);

  return {
    generatePreviewForCharacter,
    generateAllPreviews,
  };
}
