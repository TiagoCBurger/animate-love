// =============================================================================
// Video Concatenation Utility
// =============================================================================

import { uploadToR2, getPresignedDownloadUrl } from "@/lib/cloudflare";

/**
 * Video segment information
 */
export interface VideoSegment {
  url: string;
  duration?: number;
}

/**
 * Concatenation result
 */
export interface ConcatResult {
  videoUrl: string;
  duration: number;
  segments: number;
}

/**
 * Download a video from URL and return as Buffer
 */
async function downloadVideo(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Create a simple video playlist for client-side concatenation
 * Returns an array of video URLs that can be played sequentially
 */
export function createPlaylist(videos: VideoSegment[]): {
  videos: VideoSegment[];
  totalDuration: number;
} {
  const totalDuration = videos.reduce(
    (sum, video) => sum + (video.duration || 5),
    0
  );

  return {
    videos,
    totalDuration,
  };
}

/**
 * Concatenate videos using ffmpeg (server-side)
 * This requires ffmpeg to be installed on the server
 *
 * For serverless environments, consider using:
 * - Cloudinary's video transformation
 * - AWS MediaConvert
 * - Or client-side ffmpeg.wasm
 */
export async function concatenateVideosWithFfmpeg(
  videoUrls: string[],
  outputKey: string
): Promise<ConcatResult> {
  // Dynamic import for server-side only
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const fs = await import("fs/promises");
  const path = await import("path");
  const os = await import("os");

  const execAsync = promisify(exec);

  // Create temp directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "video-concat-"));

  try {
    // Download all videos
    const localFiles: string[] = [];
    for (let i = 0; i < videoUrls.length; i++) {
      const videoBuffer = await downloadVideo(videoUrls[i]);
      const localPath = path.join(tempDir, `segment_${i}.mp4`);
      await fs.writeFile(localPath, videoBuffer);
      localFiles.push(localPath);
    }

    // Create concat file list
    const listPath = path.join(tempDir, "concat_list.txt");
    const listContent = localFiles.map((f) => `file '${f}'`).join("\n");
    await fs.writeFile(listPath, listContent);

    // Output path
    const outputPath = path.join(tempDir, "output.mp4");

    // Run ffmpeg to concatenate
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`,
      { timeout: 120000 } // 2 minutes timeout
    );

    // Read output file
    const outputBuffer = await fs.readFile(outputPath);

    // Upload to R2
    const r2Result = await uploadToR2(
      outputKey,
      outputBuffer,
      "video/mp4"
    );

    // Get public URL
    const publicUrl = await getPresignedDownloadUrl(outputKey, 86400); // 24 hours

    return {
      videoUrl: publicUrl,
      duration: videoUrls.length * 5, // Assuming 5s per video
      segments: videoUrls.length,
    };
  } finally {
    // Cleanup temp files
    try {
      const files = await fs.readdir(tempDir);
      for (const file of files) {
        await fs.unlink(path.join(tempDir, file));
      }
      await fs.rmdir(tempDir);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Simple video merge by downloading all videos and creating a playlist manifest
 * This is useful for client-side playback without server processing
 */
export async function createVideoManifest(
  videos: VideoSegment[],
  userId: string
): Promise<{
  manifestUrl: string;
  videos: VideoSegment[];
  totalDuration: number;
}> {
  const manifest = {
    version: "1.0",
    userId,
    createdAt: new Date().toISOString(),
    videos: videos.map((v, i) => ({
      index: i,
      url: v.url,
      duration: v.duration || 5,
    })),
    totalDuration: videos.reduce((sum, v) => sum + (v.duration || 5), 0),
  };

  // Upload manifest to R2
  const manifestKey = `manifests/${userId}/${Date.now()}.json`;
  await uploadToR2(
    manifestKey,
    Buffer.from(JSON.stringify(manifest, null, 2)),
    "application/json"
  );

  const manifestUrl = await getPresignedDownloadUrl(manifestKey, 86400);

  return {
    manifestUrl,
    videos,
    totalDuration: manifest.totalDuration,
  };
}

/**
 * Check if ffmpeg is available on the system
 */
export async function isFfmpegAvailable(): Promise<boolean> {
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);
    await execAsync("ffmpeg -version");
    return true;
  } catch {
    return false;
  }
}
