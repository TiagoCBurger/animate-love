import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: generations, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch generations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ generations });
  } catch (error) {
    console.error("Error fetching generations:", error);
    return NextResponse.json(
      { error: "Failed to fetch generations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { style, characters, scenes, videoUrls, name, thumbnailUrl, aspectRatio } = body;

    // Auto-generate name if not provided: style + date
    const autoName =
      name ||
      `${style ? style.charAt(0).toUpperCase() + style.slice(1) : "Projeto"} - ${new Date().toLocaleDateString("pt-BR")}`;

    // Use first scene imageUrl as thumbnail if not explicitly provided
    const autoThumbnail =
      thumbnailUrl || scenes?.[0]?.imageUrl || null;

    // Save generation using admin client (user RLS only allows INSERT)
    const adminClient = createAdminClient();
    const { data: generation, error } = await adminClient
      .from("generations")
      .insert({
        user_id: user.id,
        style: style || "unknown",
        aspect_ratio: aspectRatio || "9:16",
        characters: characters || [],
        scenes: scenes || [],
        video_urls: videoUrls || [],
        status: "completed",
        name: autoName,
        thumbnail_url: autoThumbnail,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save generation:", error);
      return NextResponse.json(
        { error: "Failed to save generation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ generation });
  } catch (error) {
    console.error("Error saving generation:", error);
    return NextResponse.json(
      { error: "Failed to save generation" },
      { status: 500 }
    );
  }
}
