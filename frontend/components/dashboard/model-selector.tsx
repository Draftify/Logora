"use client";

import { ChevronDown, Sparkles } from "lucide-react";

export function ModelSelector() {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-zinc-600">Model</span>

      <div className="relative">
        <Sparkles className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

        <select
          defaultValue="deepseek"
          aria-label="Model"
          className="h-9 appearance-none rounded-md border border-zinc-300 bg-white pl-8 pr-8 text-sm font-medium text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <option value="deepseek">DeepSeek</option>
        </select>

        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      </div>
    </div>
  );
}
