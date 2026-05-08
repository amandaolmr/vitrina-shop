import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/produtos/")({
  component: ProductsList,
});

function ProductsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterDept, setFilterDept] = useState<string>("");
  const [filterCat, setFilterCat] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: store } = useQuery({
    queryKey: ["my-store", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("stores").select("*").eq("owner_id", user!.id).maybeSingle()).data,
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories", store?.id],
    enabled: !!store,
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, parent_id")
        .eq("store_id", store!.id)
        .order("name");
      return data ?? [];
    },
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

  const departments = useMemo(() => {
    return (categories ?? []).filter((c: any) => !c.parent_id);
  }, [categories]);

  const subcategories = useMemo(() => {
    if (!filterDept) return [];
    return (categories ?? []).filter((c: any) => c.parent_id === filterDept);
  }, [categories, filterDept]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((p: any) => {
      // Filtro por status
      if (filterStatus === "active" && !p.active) return false;
      if (filterStatus === "inactive" && p.active) return false;
      if (filterStatus === "featured" && !p.featured) return false;

      // Filtro por categoria
      if (filterCat) {
        if (p.category_id !== filterCat) return false;
      } else if (filterDept) {
        // Se selecionou departamento mas não categoria, mostrar todos do departamento
        const productCategory = (categories ?? []).find((c: any) => c.id === p.category_id);
        if (!productCategory || productCategory.parent_id !== filterDept) return false;
      }

      return true;
    });
  }, [products, filterDept, filterCat, filterStatus, categories]);

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
        <Button onClick={createProduct}>
          <Plus className="mr-2 h-4 w-4" /> Novo produto
        </Button>
      </div>

      {/* Filtros */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border bg-card p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Departamento</label>
          <Select
            value={filterDept || "all"}
            onValueChange={(v) => {
              setFilterDept(v === "all" ? "" : v);
              setFilterCat(""); // Limpar categoria ao trocar departamento
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {departments.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria</label>
          <Select
            value={filterCat || "all"}
            onValueChange={(v) => setFilterCat(v === "all" ? "" : v)}
            disabled={!filterDept}
          >
            <SelectTrigger>
              <SelectValue placeholder={filterDept ? "Todas" : "Selecione departamento"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {subcategories.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="featured">Em destaque</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setFilterDept("");
              setFilterCat("");
              setFilterStatus("all");
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mt-4 text-sm text-muted-foreground">
        {filteredProducts.length}{" "}
        {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
      </div>

      {filteredProducts?.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          {products?.length === 0
            ? "Nenhum produto ainda. Clique em Novo produto para começar."
            : "Nenhum produto encontrado com os filtros selecionados."}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts?.map((p: any) => {
          const cover = p.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url;
          return (
            <Link
              key={p.id}
              to="/admin/produtos/$id"
              params={{ id: p.id }}
              className="overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
            >
              <div className="aspect-square bg-white overflow-hidden flex items-center justify-center">
                {cover ? (
                  <img src={cover} alt={p.name} className="h-full w-full object-contain p-4" />
                ) : null}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-medium">{p.name}</h3>
                  {p.featured && <Star className="h-4 w-4 fill-current text-yellow-500" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{formatBRL(Number(p.price))}</p>
                {!p.active && (
                  <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs">
                    Rascunho
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
