import { NextRequest, NextResponse } from "next/server";
import { startKlingMultishotGeneration, getTaskStatus, startKlingGeneration } from "@/lib/kie";

/**
 * GET /api/kie/test
 * Test endpoint to verify Kling 2.5 API connectivity
 *
 * Query params:
 * - taskId: Check status of existing task
 * - simple: Use simple prompt (no multishot)
 */
export async function GET(request: NextRequest) {
  const taskIdParam = request.nextUrl.searchParams.get("taskId");
  const useSimple = request.nextUrl.searchParams.get("simple") === "true";

  try {
    // Check if API key is configured
    if (!process.env.KIE_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "KIE_API_KEY not configured",
          message: "Please add KIE_API_KEY to your .env or .env.local file",
          envVars: {
            hasKey: !!process.env.KIE_API_KEY,
            keyLength: process.env.KIE_API_KEY?.length || 0,
          }
        },
        { status: 500 }
      );
    }

    // If taskId provided, just check status
    if (taskIdParam) {
      console.log("[TEST] Checking status for taskId:", taskIdParam);
      const status = await getTaskStatus(taskIdParam);
      return NextResponse.json({
        success: true,
        ...status,
      });
    }

    // Test with a sample image (using a public test image from Unsplash)
    const testImageUrl = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80";
    const testPrompt = "Romantic couple, gentle natural animation with soft movements";

    console.log("[TEST] Starting video generation test...");
    console.log("[TEST] Image URL:", testImageUrl);
    console.log("[TEST] Prompt:", testPrompt);
    console.log("[TEST] Using simple prompt:", useSimple);

    let taskId: string;

    if (useSimple) {
      // Use simple prompt without multishot optimization
      taskId = await startKlingGeneration({
        imageUrl: testImageUrl,
        prompt: testPrompt,
        duration: "5",
        model: "v2.5-turbo-pro",
        negativePrompt: "blur, distort, low quality",
        cfgScale: 0.5,
      });
    } else {
      // Use multishot optimized prompt
      taskId = await startKlingMultishotGeneration({
        imageUrl: testImageUrl,
        prompt: testPrompt,
        promptType: "romantic_generic",
        duration: "5",
        model: "v2.5-turbo-pro",
      });
    }

    console.log("[TEST] Task created successfully! Task ID:", taskId);

    // Check initial status
    const status = await getTaskStatus(taskId);
    console.log("[TEST] Initial status:", status);

    return NextResponse.json({
      success: true,
      message: "Kling 2.5 API test successful - task created",
      test: {
        imageUrl: testImageUrl,
        prompt: testPrompt,
        taskId,
        status,
        useSimple,
      },
      checkStatus: `/api/kie/test?taskId=${taskId}`,
      note: "Video generation takes 3-5 minutes. Check status periodically.",
    });
  } catch (error) {
    console.error("[TEST] Error:", error);

    const errorDetails: Record<string, unknown> = {
      success: false,
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };

    // Add more context for KieApiError
    if (error && typeof error === "object" && "code" in error) {
      errorDetails.apiCode = (error as { code: number }).code;
    }
    if (error && typeof error === "object" && "data" in error) {
      errorDetails.apiData = (error as { data: unknown }).data;
    }

    return NextResponse.json(errorDetails, { status: 500 });
  }
}
