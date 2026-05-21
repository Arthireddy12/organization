import type { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: "blue" | "green" | "amber" | "violet" | "pink";
  trend?: string;
  trendDirection?: "up" | "down";
  detail?: string;
};

const tones = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-400 to-emerald-500",
  amber: "from-amber-400 to-orange-500",
  violet: "from-violet-500 to-indigo-500",
  pink: "from-pink-500 to-rose-500",
};

export function MetricCard({
  detail = "from last month",
  icon,
  label,
  tone = "blue",
  trend,
  trendDirection = "up",
  value,
}: MetricCardProps) {
  const positive = trendDirection === "up";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${tones[tone]}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-950">
            {value}
          </p>
        </div>
      </div>
      {trend && (
        <p
          className={`mt-4 flex items-center gap-1 text-xs font-medium ${
            positive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          <span>{trend}</span>
          <span className="text-slate-500">{detail}</span>
        </p>
      )}
    </article>
  );
}
