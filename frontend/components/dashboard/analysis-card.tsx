import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import type { Analysis, RiskSeverity } from "@/lib/types";

const severityClasses: Record<RiskSeverity, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

interface AnalysisCardProps extends Analysis {
  meta?: ReactNode;
  actions?: ReactNode;
}

export function AnalysisCard({
  summary,
  insights,
  risks,
  recommendations,
  meta,
  actions,
}: AnalysisCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-relaxed text-zinc-900">
          {summary}
        </p>
        {actions}
      </div>

      {meta ? <div className="mt-2">{meta}</div> : null}

      {insights.length > 0 ? (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <Lightbulb className="h-3.5 w-3.5" />
            Insights
          </p>
          <ul className="mt-2 space-y-1.5">
            {insights.map((insight) => (
              <li key={insight} className="text-sm text-zinc-600">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {risks.length > 0 ? (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Risks
          </p>
          <ul className="mt-2 space-y-2">
            {risks.map((risk, index) => (
              <li
                key={`${risk.description}-${index}`}
                className="flex items-start gap-2"
              >
                <span
                  className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                    severityClasses[risk.severity] ?? severityClasses.low
                  }`}
                >
                  {risk.severity}
                </span>
                <span className="text-sm text-zinc-600">{risk.description}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {recommendations.length > 0 ? (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <Sparkles className="h-3.5 w-3.5" />
            Recommendations
          </p>
          <ul className="mt-2 space-y-1.5">
            {recommendations.map((recommendation) => (
              <li
                key={recommendation}
                className="flex items-start gap-2 text-sm text-zinc-600"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
