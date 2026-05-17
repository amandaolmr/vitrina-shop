import { useState } from "react";
import { RefreshCw, Users, Eye, ChartNoAxesColumn, TrendingUp } from "lucide-react";
import { useAnalytics, type AnalyticsPeriod } from "@/hooks/use-analytics";
import { PeriodFilter } from "./PeriodFilter";
import { VisitChart } from "./VisitChart";
import { AnalyticsTooltip } from "./AnalyticsTooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}k`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("pt-BR");
}

function formatDateFull(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

interface KpiBlockProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  tooltip: string;
  value: number;
  loading: boolean;
}

function KpiBlock({ icon, iconBg, iconColor, label, tooltip, value, loading }: KpiBlockProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground border-border/60 shadow-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}
          >
            {icon}
          </div>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <AnalyticsTooltip content={tooltip} />
          </div>
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <h3 className="text-2xl font-bold tracking-tight">{fmt(value)}</h3>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  storeId: string;
}

export function AnalyticsDashboard({ storeId }: Props) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const { data, isLoading, refetch } = useAnalytics(storeId, period);

  const daily = data?.daily ?? [];
  const reversedDaily = [...daily].reverse();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitoramento de visitas da sua loja</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => refetch()}
            aria-label="Atualizar dados"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiBlock
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          label="Visitantes Únicos"
          tooltip="Quantidade de pessoas únicas que visitaram sua vitrine."
          value={data?.visitors ?? 0}
          loading={isLoading}
        />
        <KpiBlock
          icon={<Eye className="h-5 w-5" />}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-600"
          label="Pageviews"
          tooltip="Quantidade total de páginas visualizadas pelos visitantes."
          value={data?.pageviews ?? 0}
          loading={isLoading}
        />
        <KpiBlock
          icon={<ChartNoAxesColumn className="h-5 w-5" />}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
          label="Views por Visita"
          tooltip="Média de páginas visualizadas por visitante."
          value={data?.viewsPerVisit ?? 0}
          loading={isLoading}
        />
      </div>

      {/* Chart Card */}
      <Card className="border-border/60">
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="tracking-tight text-base font-bold">Visitas diárias</div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Visitantes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
                Pageviews
              </span>
            </div>
          </div>
        </div>
        <CardContent className="pt-0">
          <VisitChart data={daily} loading={isLoading} />
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden border-border/60">
        <div className="flex flex-col space-y-1.5 p-6 border-b border-border/40 pb-4">
          <div className="tracking-tight text-base font-bold">Detalhamento por dia</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-6 py-3 text-left text-muted-foreground font-semibold">Data</th>
                <th className="px-6 py-3 text-right text-muted-foreground font-semibold">
                  Visitantes
                </th>
                <th className="px-6 py-3 text-right text-muted-foreground font-semibold">
                  Pageviews
                </th>
                <th className="px-6 py-3 text-right text-muted-foreground font-semibold">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="px-6 py-3">
                        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="h-4 w-8 ml-auto animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="h-4 w-8 ml-auto animate-pulse rounded bg-muted" />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="h-4 w-8 ml-auto animate-pulse rounded bg-muted" />
                      </td>
                    </tr>
                  ))
                : reversedDaily.map((row) => (
                    <tr
                      key={row.date}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-foreground">
                        {formatDateFull(row.date)}
                      </td>
                      <td className="px-6 py-3 text-right text-emerald-600 font-bold">
                        {row.visitors}
                      </td>
                      <td className="px-6 py-3 text-right text-indigo-600 font-bold">
                        {row.pageviews}
                      </td>
                      <td className="px-6 py-3 text-right text-muted-foreground">
                        {row.visitors > 0 ? (row.pageviews / row.visitors).toFixed(1) : "—"}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Footer */}
      <p className="text-center text-muted-foreground text-xs pb-4">
        Dados armazenados no Cloudflare KV · Atualização em tempo real
      </p>
    </div>
  );
}
