import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo, useRef } from "react";
import { useStore } from "@/lib/store-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/loja/$slug/")({
  component: StorefrontPage,
});

function StorefrontPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const scrollContainerRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scroll = (key: string, direction: "left" | "right") => {
    const container = scrollContainerRef.current[key];
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const { data: products = [] } = useQuery({
    queryKey: ["public-products", store.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, name, price, compare_at_price, featured, category_id, product_images(url, position)",
        )
        .eq("store_id", store.id)
        .eq("active", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: cats = [] } = useQuery({
    queryKey: ["public-cats", store.id],
    queryFn: async () =>
      (
        await supabase
          .from("categories")
          .select("id,name,parent_id")
          .eq("store_id", store.id)
          .order("position")
      ).data ?? [],
  });

  const departments = (cats as any[]).filter((c) => !c.parent_id);
  const subcats = (cats as any[]).filter((c) => c.parent_id === activeDept);
  const subcatIds = useMemo(() => new Set(subcats.map((c) => c.id)), [subcats]);

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      if (activeCat) {
        if (p.category_id !== activeCat) return false;
      } else if (activeDept) {
        if (!subcatIds.has(p.category_id)) return false;
      }
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [products, q, activeCat, activeDept, subcatIds]);

  // Agrupar produtos por categoria
  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, any[]>();

    filtered.forEach((p: any) => {
      if (!p.category_id) {
        // Produtos sem categoria
        const uncategorized = grouped.get("uncategorized") || [];
        uncategorized.push(p);
        grouped.set("uncategorized", uncategorized);
      } else {
        const catProducts = grouped.get(p.category_id) || [];
        catProducts.push(p);
        grouped.set(p.category_id, catProducts);
      }
    });

    return grouped;
  }, [filtered]);

  const featured = products.filter((p: any) => p.featured).slice(0, 6);

  return (
    <main>
      {store.banner_url && (
        <div className="relative h-44 w-full overflow-hidden md:h-64">
          <img src={store.banner_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-6">
        {store.description && (
          <p className="text-center text-muted-foreground">{store.description}</p>
        )}

        <div className="mt-6 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produtos..."
            className="pl-9"
          />
        </div>

        {departments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveDept(null);
                setActiveCat(null);
              }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${!activeDept ? "border-foreground bg-foreground text-background" : "border-border"}`}
            >
              Todos
            </button>
            {departments.map((d: any) => (
              <button
                key={d.id}
                onClick={() => {
                  setActiveDept(d.id);
                  setActiveCat(null);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${activeDept === d.id ? "border-foreground bg-foreground text-background" : "border-border"}`}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}

        {activeDept && subcats.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat(null)}
              className={`rounded-full border px-3 py-1 text-xs ${!activeCat ? "border-foreground bg-foreground text-background" : "border-border"}`}
            >
              Todas
            </button>
            {subcats.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`rounded-full border px-3 py-1 text-xs whitespace-nowrap ${activeCat === c.id ? "border-foreground bg-foreground text-background" : "border-border"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {featured.length > 0 && !q && !activeCat && !activeDept && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">Destaques</h2>
            <div className="relative overflow-hidden">
              {featured.length > 4 && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full shadow-2xl bg-white border flex items-center justify-center"
                    onClick={() => scroll("featured", "left")}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full shadow-2xl bg-white border flex items-center justify-center"
                    onClick={() => scroll("featured", "right")}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              <div
                ref={(el) => {
                  scrollContainerRef.current["featured"] = el;
                }}
                className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin -mx-4 px-4"
                style={{ scrollbarWidth: "auto" }}
              >
                {featured.map((p: any) => (
                  <div key={p.id} className="flex-none w-[45%] sm:w-[30%] md:w-[23%] snap-start">
                    <ProductCard p={p} slug={store.slug} />
                  </div>
                ))}
              </div>
              {featured.length > 4 && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-background to-transparent" />
              )}
            </div>
          </section>
        )}

        <section className="mt-10">
          {filtered.length === 0 ? (
            <>
              <h2 className="mb-4 text-lg font-semibold">
                {q || activeCat || activeDept ? "Resultados" : "Todos os produtos"}
              </h2>
              <p className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                Nenhum produto encontrado.
              </p>
            </>
          ) : (
            <div className="space-y-8">
              {Array.from(productsByCategory.entries()).map(([categoryId, categoryProducts]) => {
                const category = cats.find((c: any) => c.id === categoryId);
                const categoryName = category?.name || "Sem categoria";

                return (
                  <div key={categoryId}>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold">{categoryName}</h2>
                    </div>
                    <div className="relative overflow-hidden">
                      {categoryProducts.length > 4 && (
                        <>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full shadow-2xl bg-white border flex items-center justify-center"
                            onClick={() => scroll(`cat-${categoryId}`, "left")}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full shadow-2xl bg-white border flex items-center justify-center"
                            onClick={() => scroll(`cat-${categoryId}`, "right")}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                      <div
                        ref={(el) => {
                          scrollContainerRef.current[`cat-${categoryId}`] = el;
                        }}
                        className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin -mx-4 px-4"
                        style={{ scrollbarWidth: "auto" }}
                      >
                        {categoryProducts.map((p: any) => (
                          <div
                            key={p.id}
                            className="flex-none w-[45%] sm:w-[30%] md:w-[23%] snap-start"
                          >
                            <ProductCard p={p} slug={store.slug} />
                          </div>
                        ))}
                      </div>
                      {categoryProducts.length > 4 && (
                        <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-background to-transparent" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProductCard({ p, slug }: { p: any; slug: string }) {
  const cover = p.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url;
  const price = Number(p.price);
  const comparePrice = p.compare_at_price ? Number(p.compare_at_price) : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <Link
      to="/loja/$slug/produto/$productId"
      params={{ slug, productId: p.id }}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-card transition hover:shadow-md"
    >
      {hasDiscount && (
        <div className="absolute left-2 top-2 z-10">
          <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground shadow-sm">
            {discountPercent}% OFF
          </span>
        </div>
      )}
      
      <div className="aspect-[4/5] overflow-hidden bg-white rounded-xl flex items-center justify-center">
        {cover ? (
          <img
            src={cover}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
            Sem imagem
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {p.name}
        </h3>
        <div className="mt-2 flex flex-col">
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
              {formatBRL(comparePrice)}
            </span>
          )}
          <span className={`font-bold ${hasDiscount ? "text-destructive" : "text-foreground"}`}>
            {formatBRL(price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
