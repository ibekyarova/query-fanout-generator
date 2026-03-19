"use client";

import {
  BookOpen,
  ShoppingCart,
  GitCompare,
  Wrench,
  Compass,
  Sparkles,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { QueryCard } from "@/components/query-card";
import { ExportButtons } from "@/components/export-buttons";
import { TooltipProvider } from "@/components/ui/tooltip";
import { groupByType, getNonEmptyGroups, calcStats } from "@/lib/fanout";
import { MODEL_LABELS, QUERY_TYPE_COLORS, type FanoutResult, type QueryType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<QueryType, React.ReactNode> = {
  informational: <BookOpen className="h-4 w-4" />,
  commercial: <ShoppingCart className="h-4 w-4" />,
  comparison: <GitCompare className="h-4 w-4" />,
  troubleshooting: <Wrench className="h-4 w-4" />,
  navigational: <Compass className="h-4 w-4" />,
};

const TYPE_LABELS: Record<QueryType, string> = {
  informational: "Informational",
  commercial: "Commercial",
  comparison: "Comparison",
  troubleshooting: "Troubleshooting",
  navigational: "Navigational",
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-primary mt-0.5">{sub}</p>}
    </div>
  );
}

interface ResultsSectionProps {
  result: FanoutResult;
}

export function ResultsSection({ result }: ResultsSectionProps) {
  const grouped = groupByType(result.fanout_queries);
  const nonEmpty = getNonEmptyGroups(grouped);
  const stats = calcStats(result);

  let cardIndex = 0;

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Fan-Out Results</h2>
              {result.is_mock && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 px-2 py-0.5 text-xs text-yellow-400">
                  <AlertCircle className="h-3 w-3" />
                  Mock Mode
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">"{result.original_query}"</span>
              {" · "}
              {MODEL_LABELS[result.model_type]}
            </p>
          </div>
          <ExportButtons result={result} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Queries" value={stats.total} />
          <StatCard label="Avg. Confidence" value={`${Math.round(stats.avgConfidence * 100)}%`} />
          <StatCard
            label="High Confidence"
            value={stats.highConfidence}
            sub={`≥ 80% score`}
          />
        </div>

        {/* Type distribution bar */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Intent Distribution
          </div>
          <div className="flex rounded-full overflow-hidden h-2 gap-0.5">
            {nonEmpty.map(([type, queries]) => (
              <div
                key={type}
                className={cn(
                  "h-full transition-all",
                  type === "informational" ? "bg-blue-500" :
                  type === "commercial" ? "bg-emerald-500" :
                  type === "comparison" ? "bg-purple-500" :
                  type === "troubleshooting" ? "bg-orange-500" :
                  "bg-pink-500"
                )}
                style={{ width: `${(queries.length / stats.total) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {nonEmpty.map(([type, queries]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "inline-block h-2 w-2 rounded-full",
                    type === "informational" ? "bg-blue-500" :
                    type === "commercial" ? "bg-emerald-500" :
                    type === "comparison" ? "bg-purple-500" :
                    type === "troubleshooting" ? "bg-orange-500" :
                    "bg-pink-500"
                  )}
                />
                {TYPE_LABELS[type]} ({queries.length})
              </div>
            ))}
          </div>
        </div>

        {/* Grouped query cards */}
        {nonEmpty.map(([type, queries]) => (
          <div key={type} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", QUERY_TYPE_COLORS[type])}>
                {TYPE_ICONS[type]}
                {TYPE_LABELS[type]}
              </span>
              <span className="text-xs text-muted-foreground">{queries.length} queries</span>
            </div>
            <div className="grid gap-2.5">
              {queries.map((q) => {
                const idx = cardIndex++;
                return (
                  <QueryCard
                    key={idx}
                    query={q.query}
                    type={q.type}
                    intent={q.intent}
                    confidence={q.confidence}
                    index={idx}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
