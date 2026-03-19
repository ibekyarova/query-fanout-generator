"use client";

import { useState } from "react";
import { Copy, Check, Search, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buildGoogleSearchUrl, buildBingSearchUrl } from "@/lib/fanout";
import { QUERY_TYPE_COLORS, QUERY_TYPE_LABELS, type QueryType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QueryCardProps {
  query: string;
  type: QueryType;
  intent: string;
  confidence: number;
  index: number;
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80
      ? "bg-emerald-500"
      : pct >= 60
      ? "bg-blue-500"
      : pct >= 40
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  );
}

export function QueryCard({ query, type, intent, confidence, index }: QueryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="group rounded-xl border border-border bg-card p-4 space-y-3 card-hover animate-slide-up"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground font-medium leading-relaxed flex-1">{query}</p>
        <Badge className={cn("shrink-0 text-xs border", QUERY_TYPE_COLORS[type])}>
          {QUERY_TYPE_LABELS[type]}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{intent}</p>

      <div className="flex items-center justify-between pt-1">
        <ConfidenceBar value={confidence} />

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => window.open(buildGoogleSearchUrl(query), "_blank")}
              >
                <Search className="h-3 w-3" />
                Google
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search on Google</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => window.open(buildBingSearchUrl(query), "_blank")}
              >
                <ExternalLink className="h-3 w-3" />
                Bing
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search on Bing</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? "Copied!" : "Copy query"}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
