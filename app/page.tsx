"use client";

import { useState, useEffect, useCallback } from "react";
import { Network, TrendingUp, AlertCircle } from "lucide-react";
import { QueryInput } from "@/components/query-input";
import { ResultsSection } from "@/components/results-section";
import { HistorySidebar } from "@/components/history-sidebar";
import { SkeletonResults } from "@/components/skeleton-loader";
import type { FanoutResult, HistoryItem, ModelType } from "@/lib/types";

const HISTORY_KEY = "fanout_history_v1";
const TOTAL_COUNTER_KEY = "fanout_total_generated";
const MAX_HISTORY = 10;

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function loadTotalCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(TOTAL_COUNTER_KEY) ?? "0", 10);
}

function saveTotalCount(n: number) {
  localStorage.setItem(TOTAL_COUNTER_KEY, String(n));
}

export default function HomePage() {
  const [result, setResult] = useState<FanoutResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [currentQuery, setCurrentQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    setHistory(loadHistory());
    setTotalGenerated(loadTotalCount());
  }, []);

  const handleSubmit = useCallback(
    async (query: string, model: ModelType, deepMode: boolean) => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setCurrentQuery(query);

      try {
        const res = await fetch("/api/fanout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, model_type: model, deep_mode: deepMode }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Request failed with status ${res.status}`);
        }

        const data: FanoutResult = await res.json();
        setResult(data);

        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          query,
          model_type: model,
          result: data,
          timestamp: Date.now(),
        };

        const updated = [newItem, ...history.filter((h) => h.query !== query)].slice(0, MAX_HISTORY);
        setHistory(updated);
        saveHistory(updated);

        const newTotal = totalGenerated + data.total_count;
        setTotalGenerated(newTotal);
        saveTotalCount(newTotal);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    },
    [history, totalGenerated]
  );

  const handleHistorySelect = (item: HistoryItem) => {
    setResult(item.result);
    setCurrentQuery(item.query);
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
              <Network className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground tracking-tight">
                Query Fan-Out
              </span>
              <span className="hidden sm:inline text-sm text-muted-foreground ml-1.5">
                Generator
              </span>
            </div>
          </div>

          {totalGenerated > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>
                <span className="font-semibold text-foreground tabular-nums">{totalGenerated.toLocaleString()}</span>
                {" "}queries generated
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Main column */}
          <div className="space-y-8 min-w-0">
            {/* Hero */}
            <div className="space-y-3 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                <span className="text-gradient">AI Query Fan-Out</span>{" "}
                <span className="text-foreground">Generator</span>
              </h1>
              <p className="text-muted-foreground text-base max-w-2xl">
                Simulate how AI search systems like{" "}
                <span className="text-foreground font-medium">ChatGPT</span>,{" "}
                <span className="text-foreground font-medium">Perplexity</span>, and{" "}
                <span className="text-foreground font-medium">Google AI Mode</span> expand
                a single query into multiple retrieval sub-queries for comprehensive coverage.
              </p>
            </div>

            {/* Input */}
            <div className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6">
              <QueryInput
                onSubmit={handleSubmit}
                isLoading={isLoading}
                defaultQuery={currentQuery}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Results */}
            {isLoading && <SkeletonResults />}
            {!isLoading && result && <ResultsSection result={result} />}

            {/* Empty state */}
            {!isLoading && !result && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
                  <Network className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ready to fan out</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter a query above and click Generate to see sub-queries
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-4">
                  {[
                    { label: "Intent Expansion", desc: "Informational, commercial & navigational" },
                    { label: "Semantic Variants", desc: "Synonyms, modifiers & entity variations" },
                    { label: "AI Simulation", desc: "Mimics ChatGPT, Perplexity, Google AI" },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl border border-border bg-card p-3 text-left">
                      <p className="text-xs font-semibold text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <HistorySidebar
              history={history}
              onSelect={handleHistorySelect}
              onClear={handleClearHistory}
              currentQuery={currentQuery}
            />

            {/* Info card */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">How It Works</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  "Enter any search query",
                  "Choose an AI model to simulate",
                  "Enable Deep mode for 30+ queries",
                  "Get clustered sub-queries by intent",
                  "Search directly on Google or Bing",
                  "Export as JSON or CSV",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* API notice */}
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-xs text-yellow-400 font-medium mb-1">OpenAI API Key</p>
              <p className="text-xs text-muted-foreground">
                Add <code className="rounded bg-muted px-1 font-mono">OPENAI_API_KEY</code> to{" "}
                <code className="rounded bg-muted px-1 font-mono">.env.local</code> for real AI generation.
                Without it, the tool runs in mock mode.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
