import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
}

interface AnalyticsEnv {
  KV?: KVNamespace;
}

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

async function handleAnalyticsRequest(
  request: Request,
  env: AnalyticsEnv,
): Promise<Response | null> {
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === "/api/analytics") {
    try {
      const body = (await request.json()) as {
        storeId?: string;
        productId?: string;
        type?: string;
        isNewVisitor?: boolean;
      };
      const { storeId, productId, type } = body;
      if (type === "product_view" && storeId && productId && env.KV) {
        const today = new Date().toISOString().slice(0, 10);
        const kvKey = `product:${storeId}:${productId}:${today}`;
        const current = Number((await env.KV.get(kvKey)) ?? "0");
        await env.KV.put(kvKey, String(current + 1));
      }
      if (type === "visit" && storeId && env.KV) {
        const today = new Date().toISOString().slice(0, 10);
        const kvKey = `analytics:${storeId}:${today}`;
        const raw = await env.KV.get(kvKey);
        const current: { visitors: number; pageviews: number } = raw
          ? (JSON.parse(raw) as { visitors: number; pageviews: number })
          : { visitors: 0, pageviews: 0 };
        current.pageviews += 1;
        if (body.isNewVisitor) current.visitors += 1;
        await env.KV.put(kvKey, JSON.stringify(current));
      }
    } catch {
      // ignore parse errors
    }
    return new Response(null, { status: 204 });
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/analytics" &&
    url.searchParams.has("period")
  ) {
    const storeId = url.searchParams.get("storeId");
    const period = url.searchParams.get("period") ?? "7d";
    if (!storeId || !env.KV) {
      return Response.json({ visitors: 0, pageviews: 0, viewsPerVisit: 0, daily: [] });
    }
    const dates = getDateRange(period);
    const daily = await Promise.all(
      dates.map(async (date) => {
        const raw = await env.KV!.get(`analytics:${storeId}:${date}`);
        const d = raw
          ? (JSON.parse(raw) as { visitors: number; pageviews: number })
          : { visitors: 0, pageviews: 0 };
        return { date, visitors: d.visitors, pageviews: d.pageviews };
      }),
    );
    const totals = daily.reduce(
      (acc, d) => ({ visitors: acc.visitors + d.visitors, pageviews: acc.pageviews + d.pageviews }),
      { visitors: 0, pageviews: 0 },
    );
    return Response.json({
      visitors: totals.visitors,
      pageviews: totals.pageviews,
      viewsPerVisit: totals.visitors > 0 ? +(totals.pageviews / totals.visitors).toFixed(1) : 0,
      daily,
    });
  }

  if (request.method === "GET" && url.pathname === "/api/analytics/products/top") {
    const storeId = url.searchParams.get("storeId");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "5"), 50);
    if (!storeId || !env.KV) {
      return Response.json([]);
    }
    const list = await env.KV.list({ prefix: `product:${storeId}:` });
    const viewMap = new Map<string, number>();
    for (const key of list.keys) {
      const parts = key.name.split(":");
      const productId = parts[2];
      if (!productId) continue;
      const count = Number((await env.KV.get(key.name)) ?? "0");
      viewMap.set(productId, (viewMap.get(productId) ?? 0) + count);
    }
    const sorted = Array.from(viewMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId, views]) => ({ productId, views }));
    return Response.json(sorted);
  }

  return null;
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const analyticsResponse = await handleAnalyticsRequest(request, env as AnalyticsEnv);
    if (analyticsResponse) return analyticsResponse;

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
