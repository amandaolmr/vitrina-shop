import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/admin/produtos/")({
  component: ProductsList,
});

function ProductsList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: store } = useQuery({
    queryKey: ["my-store", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("stores").select("*").eq("owner_id", user!.id).maybeSingle()).data,
  });

  const { data: products, refetch } = useQuery({
    queryKey: ["admin-products", store?.id],
    enabled: !!store,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url, position)")
        .eq("store_id", store!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function createProduct() {
    if (!store) return;
    const { data, error } = await supabase
      .from("products")
      .insert({ store_id: store.id, name: "Novo produto", price: 0, active: false })
      .select()
      .single();
    if (error) return alert(error.message);
    navigate({ to: "/admin/produtos/$id", params: { id: data.id } });
    refetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={createProduct}><Plus className="mr-2 h-4 w-4" /> Novo produto</Button>
      </div>

      {products?.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Nenhum produto ainda. Clique em <strong>Novo produto</strong> para começar.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((p: any) => {
          const cover = p.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url;
          return (
            <Link
              key={p.id}
              to="/admin/produtos/$id"
              params={{ id: p.id }}
              className="overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
            >
              <div className="aspect-square bg-muted">
                {cover ? <img src={cover} alt={p.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-medium">{p.name}</h3>
                  {p.featured && <Star className="h-4 w-4 fill-current text-yellow-500" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{formatBRL(Number(p.price))}</p>
                {!p.active && <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs">Rascunho</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
