"use client";

import { useCallback, useRef } from "react";
import { Upload, ImagePlus } from "lucide-react";

interface CharacterPhotoUploaderProps {
  onFileSelected: (file: File) => void;
  preview?: string;
}

export function CharacterPhotoUploader({
  onFileSelected,
  preview,
}: CharacterPhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith("image/")) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file?.type.startsWith("image/")) {
        onFileSelected(file);
      }
      // Reset so same file can be re-selected
      e.target.value = "";
    },
    [onFileSelected]
  );

  if (preview) {
    return (
      <div
        className="relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <ImagePlus className="w-8 h-8 text-white" />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
      className="w-full aspect-square border-2 border-dashed border-zinc-700 hover:border-pink-500/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors gap-2"
    >
      <Upload className="w-8 h-8 text-zinc-500" />
      <p className="text-sm text-zinc-400 text-center px-2">
        Arraste ou clique para enviar
      </p>
      <p className="text-xs text-zinc-600">JPG, PNG ou WEBP</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
