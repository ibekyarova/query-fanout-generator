"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODEL_LABELS, type ModelType } from "@/lib/types";
import { cn } from "@/lib/utils";

const EXAMPLE_QUERIES = [
  "best project management software for startups",
  "how to improve website loading speed",
  "saas link building service",
  "email marketing automation tools",
  "how to reduce customer churn rate",
];

interface QueryInputProps {
  onSubmit: (query: string, model: ModelType, deepMode: boolean) => void;
  isLoading: boolean;
  defaultQuery?: string;
}

export function QueryInput({ onSubmit, isLoading, defaultQuery }: QueryInputProps) {
  const [query, setQuery] = useState(defaultQuery ?? "");
  const [model, setModel] = useState<ModelType>("chatgpt");
  const [deepMode, setDeepMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (defaultQuery !== undefined) setQuery(defaultQuery);
  }, [defaultQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSubmit(query.trim(), model, deepMode);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!query.trim() || isLoading) return;
      onSubmit(query.trim(), model, deepMode);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main textarea */}
      <div
        className={cn(
          "relative rounded-xl border bg-card transition-all duration-200",
          query.length > 0 ? "border-primary/50 glow-border" : "border-border"
        )}
      >
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a search query to simulate AI fan-out expansion…"
          rows={3}
          maxLength={500}
          className="w-full resize-none bg-transparent px-4 pt-4 pb-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {query.length}/500 · <kbd className="rounded bg-muted px-1 py-0.5 text-xs font-mono">⌘↵</kbd> to submit
          </span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1">
          <Select value={model} onValueChange={(v) => setModel(v as ModelType)}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(MODEL_LABELS) as [ModelType, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-lg border border-border bg-card px-3 py-2">
          <Switch
            checked={deepMode}
            onCheckedChange={setDeepMode}
            id="deep-mode"
          />
          <div className="flex items-center gap-1.5">
            <Zap className={cn("h-3.5 w-3.5 transition-colors", deepMode ? "text-yellow-400" : "text-muted-foreground")} />
            <span className="text-sm font-medium text-foreground">Deep Fan-Out</span>
            <span className="text-xs text-muted-foreground">(30+ queries)</span>
          </div>
        </label>

        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          size="lg"
          className="w-full sm:w-auto gap-2 font-semibold"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isLoading ? "Generating…" : "Generate Fan-Out"}
        </Button>
      </div>

      {/* Example queries */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Examples:</span>
        {EXAMPLE_QUERIES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => handleExampleClick(ex)}
            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>
    </form>
  );
}
