import type { ComponentType, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import type { Analysis, RiskSeverity } from "@/lib/types";
import { cn } from "@/lib/utils";

const severityClasses: Record<RiskSeverity, string> = {
  critical: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  high: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
  medium: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  low: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
};

const severityDot: Record<RiskSeverity, string> = {
  critical: "bg-rose-400",
  high: "bg-orange-400",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
};

interface SectionLabelProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  tone: string;
}

function SectionLabel({ icon: Icon, label, tone }: SectionLabelProps) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md ring-1 ring-inset",
          tone,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      {label}
    </p>
  );
}

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
    <div className="group relative overflow-hidden rounded-2xl glass p-5 transition-all duration-300 hover:border-white/15 hover:shadow-[0_20px_60px_-28px_rgba(99,102,241,0.45)] animate-fade-up">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-indigo-500/70 via-violet-500/40 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-relaxed text-zinc-100">
          {summary}
        </p>
        {actions}
      </div>

      {meta ? <div className="mt-3">{meta}</div> : null}

      {insights.length > 0 ? (
        <div className="mt-5">
          <SectionLabel
            icon={Lightbulb}
            label="Insights"
            tone="bg-amber-500/10 text-amber-300 ring-amber-400/20"
          />
          <ul className="mt-3 space-y-2">
            {insights.map((insight) => (
              <li
                key={insight}
                className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
                {insight}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {risks.length > 0 ? (
        <div className="mt-5">
          <SectionLabel
            icon={AlertTriangle}
            label="Risks"
            tone="bg-rose-500/10 text-rose-300 ring-rose-400/20"
          />
          <ul className="mt-3 space-y-2.5">
            {risks.map((risk, index) => (
              <li
                key={`${risk.description}-${index}`}
                className="flex items-start gap-2.5"
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset",
                    severityClasses[risk.severity] ?? severityClasses.low,
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      severityDot[risk.severity] ?? severityDot.low,
                    )}
                  />
                  {risk.severity}
                </span>
                <span className="text-sm leading-relaxed text-zinc-300">
                  {risk.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {recommendations.length > 0 ? (
        <div className="mt-5">
          <SectionLabel
            icon={Sparkles}
            label="Recommendations"
            tone="bg-indigo-500/10 text-indigo-300 ring-indigo-400/20"
          />
          <ul className="mt-3 space-y-2">
            {recommendations.map((recommendation) => (
              <li
                key={recommendation}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-300"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
