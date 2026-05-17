export function trackProductView(storeId: string, productId: string): void {
  const key = `pv_${storeId}_${productId}`;
  const now = Date.now();
  const last = Number(localStorage.getItem(key) ?? "0");
  if (now - last < 30_000) return;
  localStorage.setItem(key, String(now));
  fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ storeId, productId, type: "product_view" }),
  }).catch(() => {
    // fire-and-forget; swallow network errors silently
  });
}
