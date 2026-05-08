import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Copy, 
  Eye, 
  Filter,
  Package,
  Star
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/produtos/")({
  component: ProductsList,
});

function ProductsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("");
  const [filterCat, setFilterCat] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: store } = useQuery({
    queryKey: ["my-store", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").eq("owner_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
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

  const { data: products, refetch, isLoading } = useQuery({
    queryKey: ["admin-products", store?.id],
    enabled: !!store,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url, position), product_variants(stock)")
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
      // Filtro por busca
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;

      // Filtro por status
      if (filterStatus === "active" && !p.active) return false;
      if (filterStatus === "inactive" && p.active) return false;
      if (filterStatus === "featured" && !p.featured) return false;

      // Filtro por categoria
      if (filterCat) {
        if (p.category_id !== filterCat) return false;
      } else if (filterDept) {
        const productCategory = (categories ?? []).find((c: any) => c.id === p.category_id);
        if (!productCategory || productCategory.parent_id !== filterDept) return false;
      }

      return true;
    });
  }, [products, search, filterDept, filterCat, filterStatus, categories]);

  async function createProduct() {
    if (!store) return;
    navigate({ to: "/admin/produtos/novo" });
  }

  async function deleteProduct(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Produto excluído");
    refetch();
  }

  async function duplicateProduct(product: any) {
    const { data: newProduct, error } = await supabase
      .from("products")
      .insert({
        store_id: store!.id,
        name: `${product.name} (Cópia)`,
        description: product.description,
        price: product.price,
        compare_at_price: product.compare_at_price,
        category_id: product.category_id,
        active: false,
      })
      .select()
      .single();

    if (error) return toast.error(error.message);
    
    // Copiar imagens
    if (product.product_images?.length) {
      await supabase.from("product_images").insert(
        product.product_images.map((img: any) => ({
          product_id: newProduct.id,
          url: img.url,
          position: img.position
        }))
      );
    }

    toast.success("Produto duplicado");
    refetch();
    navigate({ to: "/admin/produtos/$id", params: { id: newProduct.id } });
  }

  if (!store && !user) return null; // Let AdminLayout handle auth redirect
  
  if (!store) return <div className="grid min-h-[50vh] place-items-center text-muted-foreground">Carregando loja…</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={createProduct}>
          <Plus className="mr-2 h-4 w-4" /> Novo produto
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="featured">Em destaque</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterDept || "all"}
            onValueChange={(v) => {
              setFilterDept(v === "all" ? "" : v);
              setFilterCat("");
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Deptos</SelectItem>
              {departments.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterDept || filterCat || filterStatus !== "all" || search) && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearch("");
                setFilterDept("");
                setFilterCat("");
                setFilterStatus("all");
              }}
              className="h-9 px-2 text-xs text-muted-foreground"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagem</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Carregando produtos...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p: any) => {
                const cover = p.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url;
                const totalStock = p.product_variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
                
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="aspect-square w-12 overflow-hidden rounded-lg border border-border bg-white p-1">
                        {cover ? (
                          <img src={cover} alt={p.name} className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">ID: {p.id.slice(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{formatBRL(Number(p.price))}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm ${totalStock <= 5 ? 'font-semibold text-destructive' : ''}`}>
                          {totalStock} un
                        </span>
                        {p.product_variants?.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {p.product_variants.length} variações
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.active ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                            Rascunho
                          </Badge>
                        )}
                        {p.featured && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Destaque
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate({ to: "/admin/produtos/$id", params: { id: p.id } })}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateProduct(p)}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/loja/${store.slug}/produto/${p.id}`} target="_blank" rel="noreferrer">
                              <Eye className="mr-2 h-4 w-4" /> Ver na loja
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => deleteProduct(p.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
