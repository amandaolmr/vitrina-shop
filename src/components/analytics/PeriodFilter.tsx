import type { AnalyticsPeriod } from "@/hooks/use-analytics";

interface Props {
  value: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
}

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "7d", label: "7 dias" },
  { value: "14d", label: "14 dias" },
  { value: "30d", label: "30 dias" },
  { value: "60d", label: "60 dias" },
];

export function PeriodFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-xl p-1 border border-border/60">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            value === p.value
              ? "bg-background text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
