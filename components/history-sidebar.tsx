"use client";

import { Clock, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODEL_LABELS, type HistoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  currentQuery?: string;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function HistorySidebar({ history, onSelect, onClear, currentQuery }: HistorySidebarProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Recent Searches</h3>
        </div>
        <p className="text-xs text-muted-foreground">Your last 10 searches will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Recent Searches</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          onClick={onClear}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>

      <div className="space-y-1">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={cn(
              "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors",
              "hover:bg-accent group",
              currentQuery === item.query
                ? "bg-accent text-foreground"
                : "text-muted-foreground"
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate text-foreground">{item.query}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {MODEL_LABELS[item.model_type]} · {item.result.total_count} queries · {timeAgo(item.timestamp)}
              </p>
            </div>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
