import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { DailyData } from "@/hooks/use-analytics";

function formatDateLabel(date: string): string {
  const parts = date.split("-");
  return `${parts[2]}/${parts[1]}`;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "12px",
        fontSize: "13px",
        color: "hsl(var(--foreground))",
        padding: "8px 12px",
        whiteSpace: "nowrap",
      }}
    >
      <p style={{ margin: "0 0 4px", color: "hsl(var(--muted-foreground))" }}>
        {formatDateLabel(label as string)}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span style={{ fontWeight: 600 }}>: {entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  data: DailyData[];
  loading?: boolean;
}

export function VisitChart({ data, loading }: Props) {
  if (loading) {
    return <div className="h-[260px] animate-pulse rounded-xl bg-muted" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Nenhum dado para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateLabel}
          stroke="none"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          stroke="none"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="visitors"
          name="Visitantes"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="pageviews"
          name="Pageviews"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
