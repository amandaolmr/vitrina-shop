import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo, useRef } from "react";
import { useStore } from "@/lib/store-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { formatBRL } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/loja/$slug/")({
  component: StorefrontPage,
});

function StorefrontPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [viewAllCategory, setViewAllCategory] = useState<{ id: string; name: string } | null>(null);

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
                className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-thin -mx-4 px-4"
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
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{categoryName}</h2>
                      <button
                        onClick={() => setViewAllCategory({ id: categoryId, name: categoryName })}
                        className="group flex items-center gap-1 text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-700"
                      >
                        Ver todos <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </button>
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
                        className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-thin -mx-4 px-4"
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

      <Dialog open={!!viewAllCategory} onOpenChange={(open) => !open && setViewAllCategory(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl sm:rounded-2xl border-none shadow-2xl">
          <DialogHeader className="p-6 border-b bg-white shrink-0">
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              {viewAllCategory?.name}
              <span className="ml-2 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {viewAllCategory && productsByCategory.get(viewAllCategory.id)?.length} produtos
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {viewAllCategory && productsByCategory.get(viewAllCategory.id)?.map((p: any) => (
                <ProductCard key={p.id} p={p} slug={store.slug} />
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t bg-white shrink-0 text-center sm:hidden">
            <Button 
              variant="ghost" 
              className="w-full text-emerald-600 font-bold hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => setViewAllCategory(null)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-2 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 border border-slate-100/50"
    >
      <div className="aspect-[4/5] overflow-hidden bg-slate-50 rounded-xl flex items-center justify-center relative">
        {cover ? (
          <img
            src={cover}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
            Sem imagem
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors">
          {p.name}
        </h3>
        <div className="mt-auto pt-3 flex flex-col gap-0.5">
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through decoration-slate-300">
              {formatBRL(comparePrice)}
            </span>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              {formatBRL(price)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100/50">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
