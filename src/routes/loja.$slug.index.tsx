import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { useStore } from "./loja.$slug";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/loja/$slug/")({
  component: StorefrontPage,
});

function StorefrontPage() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["public-products", store.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, featured, category_id, product_images(url, position)")
        .eq("store_id", store.id)
        .eq("active", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: cats = [] } = useQuery({
    queryKey: ["public-cats", store.id],
    queryFn: async () => (await supabase.from("categories").select("*").eq("store_id", store.id).order("position")).data ?? [],
  });

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      if (activeCat && p.category_id !== activeCat) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [products, q, activeCat]);

  const featured = products.filter((p: any) => p.featured).slice(0, 6);

  return (
    <main>
      {store.banner_url && (
        <div className="relative h-44 w-full overflow-hidden md:h-64">
          <img src={store.banner_url} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-6">
        {store.description && <p className="text-center text-muted-foreground">{store.description}</p>}

        <div className="mt-6 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produtos..." className="pl-9" />
        </div>

        {cats.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto">
            <button onClick={() => setActiveCat(null)} className={`rounded-full border px-3 py-1 text-sm ${!activeCat ? "border-foreground bg-foreground text-background" : "border-border"}`}>Todos</button>
            {cats.map((c: any) => (
              <button key={c.id} onClick={() => setActiveCat(c.id)} className={`rounded-full border px-3 py-1 text-sm whitespace-nowrap ${activeCat === c.id ? "border-foreground bg-foreground text-background" : "border-border"}`}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {featured.length > 0 && !q && !activeCat && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">Destaques</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p: any) => <ProductCard key={p.id} p={p} slug={store.slug} />)}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">{q || activeCat ? "Resultados" : "Todos os produtos"}</h2>
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">Nenhum produto encontrado.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p: any) => <ProductCard key={p.id} p={p} slug={store.slug} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProductCard({ p, slug }: { p: any; slug: string }) {
  const cover = p.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url;
  return (
    <Link
      to="/loja/$slug/produto/$productId"
      params={{ slug, productId: p.id }}
      className="group overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {cover ? (
          <img src={cover} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">Sem imagem</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium">{p.name}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold">{formatBRL(Number(p.price))}</span>
          {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
            <span className="text-xs text-muted-foreground line-through">{formatBRL(Number(p.compare_at_price))}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
