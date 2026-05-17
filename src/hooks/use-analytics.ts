import { useQuery } from "@tanstack/react-query";

export type AnalyticsPeriod = "today" | "yesterday" | "7d" | "14d" | "30d" | "60d";

export type DailyData = {
  date: string;
  visitors: number;
  pageviews: number;
};

export type AnalyticsData = {
  visitors: number;
  pageviews: number;
  viewsPerVisit: number;
  daily: DailyData[];
};

const EMPTY: AnalyticsData = { visitors: 0, pageviews: 0, viewsPerVisit: 0, daily: [] };

export function useAnalytics(storeId: string | undefined, period: AnalyticsPeriod) {
  return useQuery({
    queryKey: ["store-analytics", storeId, period],
    enabled: !!storeId,
    refetchInterval: 60_000,
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        const res = await fetch(
          `/api/analytics?storeId=${encodeURIComponent(storeId!)}&period=${period}`,
        );
        if (!res.ok) return EMPTY;
        return (await res.json()) as AnalyticsData;
      } catch {
        return EMPTY;
      }
    },
  });
}
