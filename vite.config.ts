// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Dev plugin: simulates Cloudflare KV in memory for analytics endpoints.
function analyticsKvDevPlugin() {
  const kv = new Map<string, string>();

  function getDateRange(period: string): string[] {
    const today = new Date();
    if (period === "today") return [today.toISOString().slice(0, 10)];
    if (period === "yesterday") {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return [d.toISOString().slice(0, 10)];
    }
    const days = period === "14d" ? 14 : period === "30d" ? 30 : period === "60d" ? 60 : 7;
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }

  return {
    name: "analytics-kv-dev",
    apply: "serve" as const,
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: () => void) => {
        if (req.method === "POST" && req.url === "/api/analytics") {
          let body = "";
          req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            try {
              const { storeId, productId, type, isNewVisitor } = JSON.parse(body);
              const today = new Date().toISOString().slice(0, 10);
              if (type === "product_view" && storeId && productId) {
                const key = `product:${storeId}:${productId}:${today}`;
                kv.set(key, String(Number(kv.get(key) ?? "0") + 1));
              }
              if (type === "visit" && storeId) {
                const key = `analytics:${storeId}:${today}`;
                const raw = kv.get(key);
                const current = raw
                  ? (JSON.parse(raw) as { visitors: number; pageviews: number })
                  : { visitors: 0, pageviews: 0 };
                current.pageviews += 1;
                if (isNewVisitor) current.visitors += 1;
                kv.set(key, JSON.stringify(current));
              }
            } catch {
              // ignore parse errors
            }
            res.writeHead(204);
            res.end();
          });
          return;
        }

        // GET /api/analytics?storeId=X&period=7d  (store visit stats)
        if (
          req.method === "GET" &&
          req.url?.startsWith("/api/analytics") &&
          !req.url.includes("/api/analytics/")
        ) {
          const url = new URL(req.url, "http://localhost");
          const storeId = url.searchParams.get("storeId");
          const period = url.searchParams.get("period") ?? "7d";
          if (!storeId || !url.searchParams.has("period")) {
            next();
            return;
          }

          const dates = getDateRange(period);
          const daily = dates.map((date) => {
            const raw = kv.get(`analytics:${storeId}:${date}`);
            const d = raw
              ? (JSON.parse(raw) as { visitors: number; pageviews: number })
              : { visitors: 0, pageviews: 0 };
            return { date, visitors: d.visitors, pageviews: d.pageviews };
          });
          const totals = daily.reduce(
            (acc, d) => ({
              visitors: acc.visitors + d.visitors,
              pageviews: acc.pageviews + d.pageviews,
            }),
            { visitors: 0, pageviews: 0 },
          );
          const result = {
            ...totals,
            viewsPerVisit:
              totals.visitors > 0 ? +(totals.pageviews / totals.visitors).toFixed(1) : 0,
            daily,
          };
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
          return;
        }

        // GET /api/analytics/products/top
        if (req.method === "GET" && req.url?.startsWith("/api/analytics/products/top")) {
          const url = new URL(req.url, "http://localhost");
          const storeId = url.searchParams.get("storeId");
          const limit = Math.min(Number(url.searchParams.get("limit") ?? "5"), 50);
          const results: Array<{ productId: string; views: number }> = [];

          if (storeId) {
            const viewMap = new Map<string, number>();
            for (const [key, val] of kv.entries()) {
              if (key.startsWith(`product:${storeId}:`)) {
                const parts = key.split(":");
                const productId = parts[2];
                if (productId) {
                  viewMap.set(productId, (viewMap.get(productId) ?? 0) + Number(val));
                }
              }
            }
            viewMap.forEach((views, productId) => results.push({ productId, views }));
            results.sort((a, b) => b.views - a.views);
            results.splice(limit);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(results));
          return;
        }

        next();
      });
    },
  };
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [analyticsKvDevPlugin()],
  },
});
