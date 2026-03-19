import OpenAI from "openai";
import type { FanoutResult, ModelType } from "./types";

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

function buildSystemPrompt(modelType: ModelType): string {
  const modelPersonas: Record<ModelType, string> = {
    chatgpt:
      "You simulate ChatGPT/OpenAI's internal query expansion system. Focus on conversational intent, follow-up questions a real user would ask, and natural language variations of the original query.",
    perplexity:
      "You simulate Perplexity AI's retrieval system. Focus on factual sub-queries, source diversity, recent information needs, and breaking the query into specific answerable questions.",
    google:
      "You simulate Google AI Mode's query fan-out. Focus on entity disambiguation, search intent classification, SERP feature optimization, and queries that match real Google search patterns.",
  };

  return `You are an expert SEO and AI search system specialist. ${modelPersonas[modelType]}

Your task is to generate realistic search sub-queries that a real person would actually type into a search engine when researching the given topic.

STRICT RULES:
- Every query must be something a real user would genuinely search for
- Queries must be directly related to the original topic — do NOT invent unrelated topics
- Use natural search language (how people actually type queries)
- Do NOT add fictional brands, made-up products, or non-existent services
- Keep queries concise and realistic (2-8 words typically)

Return ONLY valid JSON with no markdown, no code blocks, no extra text. Use this exact schema:
{
  "fanout_queries": [
    {
      "query": "string",
      "type": "informational | commercial | comparison | troubleshooting | navigational",
      "intent": "one sentence describing what the user wants to find",
      "confidence": number between 0.0 and 1.0
    }
  ]
}`;
}

function buildUserPrompt(query: string, deepMode: boolean): string {
  const count = deepMode ? "25-30" : "12-16";
  return `Generate ${count} realistic search sub-queries for the following user query.

Each sub-query must:
1. Be something a real person would actually search for on Google/ChatGPT/Perplexity
2. Stay strictly on topic — directly related to "${query}"
3. Cover different angles: informational, commercial, comparison, troubleshooting, navigational
4. Use natural search language

Good examples for "best CRM software":
- "best CRM for small business 2026"
- "CRM software pricing comparison"  
- "HubSpot vs Salesforce vs Pipedrive"
- "how to choose CRM software"
- "free CRM tools for startups"

Bad examples (too vague or unrelated):
- "software solutions for enterprises" ← too vague
- "business productivity tools" ← not directly related

Assign confidence (0.0-1.0) based on how likely a real user would search this exact query.

User query: "${query}"`;
}

export async function generateFanoutWithLLM(
  query: string,
  modelType: ModelType,
  deepMode: boolean
): Promise<FanoutResult> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: buildSystemPrompt(modelType) },
      { role: "user", content: buildUserPrompt(query, deepMode) },
    ],
    temperature: 0.4,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  let parsed: { fanout_queries: FanoutResult["fanout_queries"] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse LLM response as JSON");
  }

  if (!Array.isArray(parsed.fanout_queries)) {
    throw new Error("Invalid response structure from LLM");
  }

  const validated = parsed.fanout_queries
    .filter(
      (q) =>
        q.query &&
        typeof q.query === "string" &&
        q.type &&
        q.intent &&
        typeof q.confidence === "number"
    )
    .map((q) => ({
      query: String(q.query).trim(),
      type: (["informational", "commercial", "comparison", "troubleshooting", "navigational"].includes(q.type)
        ? q.type
        : "informational") as FanoutResult["fanout_queries"][0]["type"],
      intent: String(q.intent).trim(),
      confidence: Math.min(1, Math.max(0, Number(q.confidence))),
    }));

  return {
    original_query: query,
    fanout_queries: validated,
    model_type: modelType,
    generated_at: new Date().toISOString(),
    total_count: validated.length,
    is_mock: false,
  };
}

export function hasApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
