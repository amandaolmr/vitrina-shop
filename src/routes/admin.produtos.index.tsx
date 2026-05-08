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
import { Card, CardContent } from "@/components/ui/card";

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
        .select("*, product_images(url, position), product_variants(id)")
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seu inventário e catálogo de produtos.</p>
        </div>
        <Button onClick={createProduct} className="rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
          <Plus className="mr-2 h-4 w-4" /> Novo produto
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="flex flex-col border-b border-border/40 bg-muted/20 p-4 gap-4 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl border-border/40 bg-white focus-visible:ring-primary/20 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] h-10 rounded-xl border-border/40 bg-white">
                  <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40 shadow-xl shadow-black/5">
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
                <SelectTrigger className="w-[160px] h-10 rounded-xl border-border/40 bg-white">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40 shadow-xl shadow-black/5">
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
                  className="h-10 px-3 text-xs font-semibold text-muted-foreground hover:bg-muted/80 rounded-xl transition-colors"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="w-[100px] py-4 font-bold text-[11px] uppercase tracking-wider">Imagem</TableHead>
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-wider">Produto</TableHead>
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-wider">Preço</TableHead>
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right py-4 font-bold text-[11px] uppercase tracking-wider">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40 animate-pulse">
                      <TableCell colSpan={6} className="py-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-muted/50" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-1/3 rounded bg-muted/50" />
                            <div className="h-3 w-1/4 rounded bg-muted/50" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center mb-2">
                          <Search className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <p className="font-bold text-foreground/80">Nenhum produto encontrado</p>
                        <p className="text-sm text-muted-foreground">Tente ajustar seus filtros ou busca.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p: any) => {
                    const cover = p.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url;
                    const totalStock = p.has_variations 
                      ? (p.product_variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0)
                      : (p.stock || 0);
                    
                    return (
                      <TableRow key={p.id} className="border-border/40 hover:bg-muted/5 group transition-colors">
                        <TableCell className="py-4">
                          <div className="aspect-square w-14 overflow-hidden rounded-xl border border-border/40 bg-white p-1 shadow-sm group-hover:scale-105 transition-transform duration-300">
                            {cover ? (
                              <img src={cover} alt={p.name} className="h-full w-full object-contain" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted/30 rounded-lg">
                                <Package className="h-5 w-5 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col max-w-[250px]">
                            <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">{p.name}</span>
                            <span className="text-[10px] font-medium text-muted-foreground tracking-tight">ID: {p.id.slice(0, 8)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="font-bold text-sm text-foreground">{formatBRL(Number(p.price))}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-sm font-bold ${totalStock <= 5 ? 'text-destructive' : 'text-foreground'}`}>
                              {totalStock} un
                            </span>
                            {p.product_variants?.length > 0 && (
                              <span className="text-[10px] font-medium text-muted-foreground">
                                {p.product_variants.length} variações
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {p.active ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/60 h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted text-muted-foreground border-border/60 h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider">
                                Rascunho
                              </Badge>
                            )}
                            {p.featured && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200/60 h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider">
                                Destaque
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-muted/80">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] rounded-xl border-border/40 shadow-xl shadow-black/5 p-1">
                              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-border/40" />
                              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-medium text-sm" onClick={() => navigate({ to: "/admin/produtos/$id", params: { id: p.id } })}>
                                <Pencil className="h-4 w-4 text-muted-foreground" /> Editar Produto
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer font-medium text-sm" onClick={() => duplicateProduct(p)}>
                                <Copy className="h-4 w-4 text-muted-foreground" /> Duplicar Item
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="rounded-lg gap-2 cursor-pointer font-medium text-sm">
                                <a href={`/loja/${store.slug}/produto/${p.id}`} target="_blank" rel="noreferrer">
                                  <Eye className="h-4 w-4 text-muted-foreground" /> Ver Vitrine
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border/40" />
                              <DropdownMenuItem 
                                className="rounded-lg gap-2 cursor-pointer font-medium text-sm text-destructive focus:text-destructive focus:bg-destructive/5" 
                                onClick={() => deleteProduct(p.id)}
                              >
                                <Trash2 className="h-4 w-4" /> Excluir Permanentemente
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
        </CardContent>
      </Card>
    </div>
  );
}
