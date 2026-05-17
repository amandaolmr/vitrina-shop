import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TopProductData = {
  productId: string;
  name: string;
  imageUrl: string | null;
  views: number | null;
};

export function useTopProducts(storeId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: ["top-products", storeId, limit],
    enabled: !!storeId,
    queryFn: async (): Promise<TopProductData[]> => {
      // 1. Fetch analytics top products from API
      let topRaw: Array<{ productId: string; views: number }> = [];
      try {
        const res = await fetch(`/api/analytics/products/top?storeId=${storeId}&limit=${limit}`);
        if (res.ok) topRaw = await res.json();
      } catch {
        // fall through to featured fallback
      }

      if (topRaw.length > 0) {
        const ids = topRaw.map((r) => r.productId);

        const [{ data: products }, { data: colorImages }, { data: productImages }] =
          await Promise.all([
            supabase.from("products").select("id, name").in("id", ids),
            supabase
              .from("product_color_images")
              .select("product_id, image_url, position")
              .in("product_id", ids)
              .order("position"),
            supabase
              .from("product_images")
              .select("product_id, url, position")
              .in("product_id", ids)
              .order("position"),
          ]);

        const productMap = new Map((products ?? []).map((p) => [p.id, p.name]));
        const colorImageMap = new Map<string, string>();
        for (const ci of colorImages ?? []) {
          if (!colorImageMap.has(ci.product_id)) {
            colorImageMap.set(ci.product_id, ci.image_url);
          }
        }
        const productImageMap = new Map<string, string>();
        for (const pi of productImages ?? []) {
          if (!productImageMap.has(pi.product_id)) {
            productImageMap.set(pi.product_id, pi.url);
          }
        }

        return topRaw.map((r) => ({
          productId: r.productId,
          name: productMap.get(r.productId) ?? "Produto",
          imageUrl: colorImageMap.get(r.productId) ?? productImageMap.get(r.productId) ?? null,
          views: r.views,
        }));
      }

      // Fallback: most recent active products
      const { data: featured } = await supabase
        .from("products")
        .select("id, name, product_images(*), product_color_images(*)")
        .eq("store_id", storeId!)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      return (featured ?? []).map((p: any) => {
        const sortedColorImages = [...(p.product_color_images ?? [])].sort(
          (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
        );
        const sortedImages = [...(p.product_images ?? [])].sort(
          (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
        );
        return {
          productId: p.id,
          name: p.name,
          imageUrl: sortedColorImages[0]?.image_url ?? sortedImages[0]?.url ?? null,
          views: null,
        };
      });
    },
  });
}
