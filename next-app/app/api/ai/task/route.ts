import { NextRequest, NextResponse } from "next/server";
import { getTaskStatus, getVeoTaskStatus, KieApiError } from "@/lib/kie";

/**
 * GET /api/ai/task?taskId=xxx&type=veo
 *
 * Get the status and results of a generation task
 *
 * Query params:
 * - taskId: The task ID from a previous generation request
 * - type: "veo" for Veo3 tasks, omit for other tasks
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get("taskId");
    const type = searchParams.get("type");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    // Use appropriate status checker based on type
    const result =
      type === "veo"
        ? await getVeoTaskStatus(taskId)
        : await getTaskStatus(taskId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Task status error:", error);

    if (error instanceof KieApiError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get task status" },
      { status: 500 }
    );
  }
}
