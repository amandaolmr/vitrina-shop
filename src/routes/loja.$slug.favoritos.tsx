import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store-context";
import { useFavorites } from "@/lib/favorites";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/loja/$slug/favoritos")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const store = useStore();
  const { favoriteIds, count } = useFavorites(store.slug);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["fav-products-page", favoriteIds],
    queryFn: async () => {
      if (favoriteIds.length === 0) return [];
      const { data } = await supabase
        .from("products")
        .select(
          "id, name, price, compare_at_price, featured, category_id, product_images(url, position)",
        )
        .in("id", favoriteIds);
      return data ?? [];
    },
    enabled: favoriteIds.length > 0,
  });

  if (count === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center w-full">
        <Heart className="mx-auto h-16 w-16 text-slate-200 mb-4" />
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
          Nenhum favorito
        </h1>
        <p className="mt-2 text-slate-500">Adicione produtos ao coração para salvar.</p>
        <Link to="/loja/$slug" params={{ slug: store.slug }}>
          <Button className="mt-6">
            <ShoppingBag className="mr-2 h-4 w-4" /> Ver produtos
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Header */}
      <div className="mb-8 sm:mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">
            Sua seleção
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 uppercase">
            Favoritos
          </h1>
        </div>
        <span className="rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 shrink-0">
          {count} {count === 1 ? "item" : "itens"}
        </span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-[2rem] aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} p={p} slug={store.slug} />
          ))}
        </div>
      )}
    </main>
  );
}
