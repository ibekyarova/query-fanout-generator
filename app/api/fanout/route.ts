import { NextRequest, NextResponse } from "next/server";
import { generateFanoutWithLLM, hasApiKey } from "@/lib/llm";
import { generateMockFanout } from "@/lib/mock";
import type { FanoutRequestBody, ModelType } from "@/lib/types";

const VALID_MODEL_TYPES: ModelType[] = ["chatgpt", "perplexity", "google"];

export async function POST(request: NextRequest) {
  try {
    const body: FanoutRequestBody = await request.json();

    if (!body.query || typeof body.query !== "string" || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    if (body.query.trim().length > 500) {
      return NextResponse.json(
        { error: "Query must be 500 characters or less." },
        { status: 400 }
      );
    }

    const query = body.query.trim();
    const modelType: ModelType = VALID_MODEL_TYPES.includes(body.model_type as ModelType)
      ? (body.model_type as ModelType)
      : "chatgpt";
    const deepMode = Boolean(body.deep_mode);

    if (!hasApiKey()) {
      const result = generateMockFanout(query, modelType, deepMode);
      return NextResponse.json(result);
    }

    const result = await generateFanoutWithLLM(query, modelType, deepMode);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[/api/fanout] Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    if (message.includes("API key")) {
      return NextResponse.json({ error: "OpenAI API key is invalid or missing." }, { status: 401 });
    }

    if (message.includes("rate limit") || message.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: "Failed to generate fan-out queries." }, { status: 500 });
  }
}
