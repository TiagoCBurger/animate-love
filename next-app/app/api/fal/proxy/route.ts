import { NextRequest, NextResponse } from "next/server";

const FAL_KEY = process.env.FAL_KEY;
const FAL_API_URL = "https://queue.fal.run";

/**
 * Proxy route for fal.ai requests
 * This keeps the API key secure on the server side
 */
export async function POST(request: NextRequest) {
  if (!FAL_KEY) {
    return NextResponse.json(
      { error: "FAL_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { model, input, action = "submit" } = body;

    if (!model) {
      return NextResponse.json(
        { error: "Model is required" },
        { status: 400 }
      );
    }

    let url = `${FAL_API_URL}/${model}`;

    // Handle different actions
    if (action === "status" && body.requestId) {
      url = `${FAL_API_URL}/${model}/requests/${body.requestId}/status`;
    } else if (action === "result" && body.requestId) {
      url = `${FAL_API_URL}/${model}/requests/${body.requestId}`;
    }

    const response = await fetch(url, {
      method: action === "submit" ? "POST" : "GET",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: action === "submit" ? JSON.stringify(input) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Fal API error:", errorData);
      return NextResponse.json(
        { error: "Fal API request failed", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fal proxy error:", error);
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const model = searchParams.get("model");
  const requestId = searchParams.get("requestId");
  const action = searchParams.get("action") || "status";

  if (!FAL_KEY) {
    return NextResponse.json(
      { error: "FAL_KEY not configured" },
      { status: 500 }
    );
  }

  if (!model || !requestId) {
    return NextResponse.json(
      { error: "Model and requestId are required" },
      { status: 400 }
    );
  }

  try {
    let url = `${FAL_API_URL}/${model}/requests/${requestId}`;
    if (action === "status") {
      url += "/status";
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: "Fal API request failed", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fal proxy error:", error);
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 500 }
    );
  }
}
