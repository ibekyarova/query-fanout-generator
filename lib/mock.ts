import type { FanoutQuery, FanoutResult, ModelType, QueryType } from "./types";

const MODIFIERS = {
  informational: ["how to", "what is", "why does", "when to", "guide to", "explained", "tutorial"],
  commercial: ["best", "top", "cheap", "affordable", "buy", "pricing", "cost of", "discount"],
  comparison: ["vs", "versus", "compared to", "alternatives to", "or", "difference between"],
  troubleshooting: ["not working", "fix", "error", "problem with", "issue", "broken", "slow"],
  navigational: ["official site", "login", "dashboard", "download", "sign up", "docs"],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateConfidence(): number {
  return Math.round((0.55 + Math.random() * 0.44) * 100) / 100;
}

function buildIntent(query: string, type: QueryType): string {
  const intents: Record<QueryType, string[]> = {
    informational: [
      `User wants to understand what ${query} means`,
      `User seeks educational content about ${query}`,
      `User is researching ${query} for the first time`,
    ],
    commercial: [
      `User is ready to purchase or evaluate ${query}`,
      `User compares pricing and options for ${query}`,
      `User wants the best solution for ${query}`,
    ],
    comparison: [
      `User wants to compare ${query} against alternatives`,
      `User is deciding between multiple options for ${query}`,
      `User evaluates pros and cons of ${query}`,
    ],
    troubleshooting: [
      `User is experiencing issues with ${query}`,
      `User needs a fix or workaround for ${query}`,
      `User wants to resolve a specific problem with ${query}`,
    ],
    navigational: [
      `User wants to go directly to ${query}'s website`,
      `User is looking for the official resource for ${query}`,
      `User wants to access ${query} platform directly`,
    ],
  };
  return pickRandom(intents[type]);
}

export function generateMockFanout(
  query: string,
  modelType: ModelType,
  deepMode: boolean
): FanoutResult {
  const words = query.trim().split(/\s+/);
  const coreNoun = words.slice(-2).join(" ");
  const count = deepMode ? 30 : 14;

  const queries: FanoutQuery[] = [];
  const types: QueryType[] = [
    "informational",
    "commercial",
    "comparison",
    "troubleshooting",
    "navigational",
  ];

  const perType = Math.floor(count / types.length);

  for (const type of types) {
    const mods = MODIFIERS[type];
    for (let i = 0; i < perType; i++) {
      const mod = mods[i % mods.length];
      let generatedQuery = "";

      if (type === "informational") {
        generatedQuery = `${mod} ${query}`;
      } else if (type === "commercial") {
        generatedQuery = `${mod} ${coreNoun} ${i > 2 ? "2026" : ""}`.trim();
      } else if (type === "comparison") {
        const competitors = ["alternative", "competitor", "similar tool", "option"];
        generatedQuery = `${query} ${mod} ${competitors[i % competitors.length]}`;
      } else if (type === "troubleshooting") {
        generatedQuery = `${query} ${mod}`;
      } else {
        generatedQuery = `${query} ${mod}`;
      }

      queries.push({
        query: generatedQuery.trim(),
        type,
        intent: buildIntent(query, type),
        confidence: generateConfidence(),
      });
    }
  }

  // Fill remaining up to count
  while (queries.length < count) {
    const type = pickRandom(types);
    const mod = pickRandom(MODIFIERS[type]);
    queries.push({
      query: `${mod} ${query}`.trim(),
      type,
      intent: buildIntent(query, type),
      confidence: generateConfidence(),
    });
  }

  return {
    original_query: query,
    fanout_queries: queries.slice(0, count),
    model_type: modelType,
    generated_at: new Date().toISOString(),
    total_count: Math.min(queries.length, count),
    is_mock: true,
  };
}
