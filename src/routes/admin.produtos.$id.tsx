import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload, MultiImageUpload } from "@/components/image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/produtos/$id")({
  component: ProductEditor,
});

type Variant = { id?: string; size: string; color: string; numbering: string; stock: number; sku: string };

function ProductEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const { data: product, refetch } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*), product_color_images(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: cats } = useQuery({
    queryKey: ["cats-for-product", product?.store_id],
    enabled: !!product?.store_id,
    queryFn: async () => (await supabase.from("categories").select("*").eq("store_id", product!.store_id).order("name")).data ?? [],
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        compare_at_price: product.compare_at_price ?? "",
        category_id: product.category_id ?? "",
        featured: product.featured,
        active: product.active,
      });
      setImages((product.product_images ?? []).sort((a: any, b: any) => a.position - b.position).map((i: any) => i.url));
      setVariants(
        (product.product_variants ?? []).map((v: any) => ({
          id: v.id, size: v.size ?? "", color: v.color ?? "", numbering: v.numbering ?? "", stock: v.stock, sku: v.sku ?? "",
        })),
      );
    }
  }, [product]);

  if (!form) return <p className="text-muted-foreground">Carregando…</p>;

  async function save() {
    setBusy(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: form.name,
        description: form.description,
        price: Number(form.price) || 0,
        compare_at_price: form.compare_at_price === "" ? null : Number(form.compare_at_price),
        category_id: form.category_id || null,
        featured: form.featured,
        active: form.active,
      })
      .eq("id", id);
    if (error) { setBusy(false); return toast.error(error.message); }

    // Sync images: delete all then insert
    await supabase.from("product_images").delete().eq("product_id", id);
    if (images.length) {
      await supabase.from("product_images").insert(images.map((url, i) => ({ product_id: id, url, position: i })));
    }

    // Sync variants
    await supabase.from("product_variants").delete().eq("product_id", id);
    const validVariants = variants.filter((v) => v.size || v.color || v.numbering);
    if (validVariants.length) {
      await supabase.from("product_variants").insert(
        validVariants.map((v) => ({
          product_id: id,
          size: v.size || null,
          color: v.color || null,
          numbering: v.numbering || null,
          stock: Number(v.stock) || 0,
          sku: v.sku || null,
        })),
      );
    }
    setBusy(false);
    toast.success("Produto salvo");
    refetch();
  }

  async function remove() {
    if (!confirm("Excluir produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Excluído");
    navigate({ to: "/admin/produtos" });
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Produtos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Editar produto</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={remove}>Excluir</Button>
          <Button onClick={save} disabled={busy}>Salvar</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 space-y-6 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Descrição</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

          <div className="space-y-2">
            <Label>Imagens</Label>
            <MultiImageUpload values={images} onChange={setImages} />
          </div>

          <VariantsEditor variants={variants} setVariants={setVariants} />
        </section>

        <aside className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2"><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div className="space-y-2"><Label>Preço comparativo</Label><Input type="number" step="0.01" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} placeholder="Opcional" /></div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={form.category_id || "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {cats?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between"><Label>Em destaque</Label><Switch checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: c })} /></div>
          <div className="flex items-center justify-between"><Label>Ativo (visível)</Label><Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} /></div>
        </aside>
      </div>
    </div>
  );
}

const COMMON_SIZES = ["PP", "P", "M", "G", "GG", "XG"];

function VariantsEditor({ variants, setVariants }: { variants: Variant[]; setVariants: (v: Variant[]) => void }) {
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
  const numberOnly = variants.filter((v) => !v.size && (v.numbering || v.color));

  function addSize(size: string) {
    if (!size) return;
    if (sizes.includes(size)) return;
    setVariants([...variants, { size, color: "", numbering: "", stock: 0, sku: "" }]);
  }

  function updateRow(target: Variant, patch: Partial<Variant>) {
    setVariants(variants.map((v) => (v === target ? { ...v, ...patch } : v)));
  }
  function removeRow(target: Variant) {
    setVariants(variants.filter((v) => v !== target));
  }

  function addColorRow(size: string) {
    setVariants([...variants, { size, color: "", numbering: "", stock: 0, sku: "" }]);
  }

  function removeSize(size: string) {
    setVariants(variants.filter((v) => v.size !== size));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Variações por tamanho</Label>
      </div>

      <div className="flex flex-wrap gap-2">
        {COMMON_SIZES.map((s) => (
          <Button
            key={s}
            type="button"
            variant={sizes.includes(s) ? "default" : "outline"}
            size="sm"
            onClick={() => (sizes.includes(s) ? removeSize(s) : addSize(s))}
          >
            {s}
          </Button>
        ))}
        <CustomSizeInput onAdd={addSize} existing={sizes} />
      </div>

      {sizes.length === 0 && numberOnly.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Selecione os tamanhos disponíveis. Para cada tamanho você poderá adicionar cores e estoque.
        </p>
      )}

      <div className="space-y-3">
        {sizes.map((size) => {
          const rows = variants.filter((v) => v.size === size);
          return (
            <div key={size} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-foreground px-3 py-1 text-sm font-semibold text-background">Tam {size}</span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addColorRow(size)}>
                    <Plus className="mr-1 h-4 w-4" /> Cor
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSize(size)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {rows.map((v, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_120px_auto]">
                    <Input placeholder="Cor (ex: Preto)" value={v.color} onChange={(e) => updateRow(v, { color: e.target.value })} />
                    <Input placeholder="Nº (opcional)" value={v.numbering} onChange={(e) => updateRow(v, { numbering: e.target.value })} />
                    <Input type="number" placeholder="Estoque" value={v.stock} onChange={(e) => updateRow(v, { stock: Number(e.target.value) })} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(v)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {numberOnly.length > 0 && (
          <div className="rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Sem tamanho (calçados / numeração)</span>
              <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { size: "", color: "", numbering: "", stock: 0, sku: "" }])}>
                <Plus className="mr-1 h-4 w-4" /> Linha
              </Button>
            </div>
            <div className="space-y-2">
              {numberOnly.map((v, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_120px_auto]">
                  <Input placeholder="Cor" value={v.color} onChange={(e) => updateRow(v, { color: e.target.value })} />
                  <Input placeholder="Nº (ex: 38)" value={v.numbering} onChange={(e) => updateRow(v, { numbering: e.target.value })} />
                  <Input type="number" placeholder="Estoque" value={v.stock} onChange={(e) => updateRow(v, { stock: Number(e.target.value) })} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(v)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {sizes.length === 0 && (
        <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { size: "", color: "", numbering: "", stock: 0, sku: "" }])}>
          <Plus className="mr-1 h-4 w-4" /> Adicionar variação por numeração
        </Button>
      )}
    </div>
  );
}

function CustomSizeInput({ onAdd, existing }: { onAdd: (s: string) => void; existing: string[] }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-1">
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Outro"
        className="h-9 w-24"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (val && !existing.includes(val)) onAdd(val);
            setVal("");
          }
        }}
      />
    </div>
  );
}
