export type QueryType =
  | "informational"
  | "commercial"
  | "comparison"
  | "troubleshooting"
  | "navigational";

export type ModelType = "chatgpt" | "perplexity" | "google";

export interface FanoutQuery {
  query: string;
  type: QueryType;
  intent: string;
  confidence: number;
}

export interface FanoutResult {
  original_query: string;
  fanout_queries: FanoutQuery[];
  model_type: ModelType;
  generated_at: string;
  total_count: number;
  is_mock?: boolean;
}

export interface HistoryItem {
  id: string;
  query: string;
  model_type: ModelType;
  result: FanoutResult;
  timestamp: number;
}

export interface FanoutRequestBody {
  query: string;
  model_type?: ModelType;
  deep_mode?: boolean;
}

export const QUERY_TYPE_LABELS: Record<QueryType, string> = {
  informational: "Informational",
  commercial: "Commercial",
  comparison: "Comparison",
  troubleshooting: "Troubleshooting",
  navigational: "Navigational",
};

export const QUERY_TYPE_COLORS: Record<QueryType, string> = {
  informational: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  commercial: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  comparison: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  troubleshooting: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  navigational: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

export const MODEL_LABELS: Record<ModelType, string> = {
  chatgpt: "ChatGPT / OpenAI",
  perplexity: "Perplexity AI",
  google: "Google AI Mode",
};
