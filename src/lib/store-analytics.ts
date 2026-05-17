/**
 * Tracks a store page view. Safe to call on every page render within a store.
 * - Each day, the first call marks the visitor as new (localStorage flag).
 * - Subsequent calls on the same day only increment pageviews.
 */
export function trackStoreVisit(storeId: string): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  const key = `visited_${storeId}_${today}`;
  const isNewVisitor = !localStorage.getItem(key);
  if (isNewVisitor) localStorage.setItem(key, "1");

  fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ storeId, type: "visit", isNewVisitor }),
  }).catch(() => {
    // fire-and-forget
  });
}
