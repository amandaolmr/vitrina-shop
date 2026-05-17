import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsTooltip } from "./AnalyticsTooltip";

interface Props {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tooltip?: string;
  sub?: ReactNode;
}

export function KpiCard({ label, value, icon, tooltip, sub }: Props) {
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-6">
        {icon && <div className="mb-2">{icon}</div>}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {tooltip && <AnalyticsTooltip content={tooltip} />}
          </div>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
