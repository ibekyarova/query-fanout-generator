import type { FanoutResult, ModelType, QueryType } from "./types";

/**
 * Groups fanout queries by their type for UI clustering.
 */
export function groupByType(
  queries: FanoutResult["fanout_queries"]
): Record<QueryType, FanoutResult["fanout_queries"]> {
  const groups: Record<QueryType, FanoutResult["fanout_queries"]> = {
    informational: [],
    commercial: [],
    comparison: [],
    troubleshooting: [],
    navigational: [],
  };

  for (const q of queries) {
    if (groups[q.type]) {
      groups[q.type].push(q);
    } else {
      groups.informational.push(q);
    }
  }

  return groups;
}

/**
 * Returns only groups that have at least one query.
 */
export function getNonEmptyGroups(
  grouped: Record<QueryType, FanoutResult["fanout_queries"]>
): [QueryType, FanoutResult["fanout_queries"]][] {
  return (Object.entries(grouped) as [QueryType, FanoutResult["fanout_queries"]][]).filter(
    ([, queries]) => queries.length > 0
  );
}

/**
 * Converts fanout result to CSV string.
 */
export function toCSV(result: FanoutResult): string {
  const header = "query,type,intent,confidence";
  const rows = result.fanout_queries.map((q) => {
    const escapedQuery = `"${q.query.replace(/"/g, '""')}"`;
    const escapedIntent = `"${q.intent.replace(/"/g, '""')}"`;
    return `${escapedQuery},${q.type},${escapedIntent},${q.confidence}`;
  });
  return [header, ...rows].join("\n");
}

/**
 * Converts fanout result to a pretty JSON string.
 */
export function toJSON(result: FanoutResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Returns all query strings as a plain text list.
 */
export function toPlainText(result: FanoutResult): string {
  return result.fanout_queries.map((q, i) => `${i + 1}. ${q.query}`).join("\n");
}

/**
 * Builds a Google search URL for a query.
 */
export function buildGoogleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Builds a Bing search URL for a query.
 */
export function buildBingSearchUrl(query: string): string {
  return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Calculates simple stats for analytics display.
 */
export function calcStats(result: FanoutResult) {
  const total = result.fanout_queries.length;
  const avgConfidence =
    total > 0
      ? Math.round((result.fanout_queries.reduce((s, q) => s + q.confidence, 0) / total) * 100) / 100
      : 0;
  const highConfidence = result.fanout_queries.filter((q) => q.confidence >= 0.8).length;

  const typeCount: Partial<Record<QueryType, number>> = {};
  for (const q of result.fanout_queries) {
    typeCount[q.type] = (typeCount[q.type] ?? 0) + 1;
  }

  return { total, avgConfidence, highConfidence, typeCount };
}
