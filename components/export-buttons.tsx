"use client";

import { useState } from "react";
import { Download, Copy, Check, FileJson, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toCSV, toJSON, toPlainText } from "@/lib/fanout";
import type { FanoutResult } from "@/lib/types";

interface ExportButtonsProps {
  result: FanoutResult;
}

export function ExportButtons({ result }: ExportButtonsProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(toPlainText(result));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportJSON = () => {
    const blob = new Blob([toJSON(result)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fanout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const blob = new Blob([toCSV(result)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fanout-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyAll}>
            {copiedAll ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedAll ? "Copied!" : "Copy All"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy all queries as plain text</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportJSON}>
            <FileJson className="h-3.5 w-3.5" />
            Export JSON
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download as JSON file</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <FileText className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download as CSV file</TooltipContent>
      </Tooltip>
    </div>
  );
}
