export interface Generation {
  id: string;
  user_id: string;
  style: string;
  characters: Array<{ name: string; description: string }>;
  scenes: Array<{ prompt: string; duration: number; imageUrl?: string }>;
  video_urls: string[];
  aspect_ratio: string;
  status: "in_progress" | "completed" | "failed";
  name: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}
