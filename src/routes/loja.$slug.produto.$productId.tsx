import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { colorToCss } from "@/lib/color-map";

export const Route = createFileRoute("/loja/$slug/produto/$productId")({
  component: ProductPage,
});

function ProductPage() {
  const { productId, slug } = Route.useParams();
  const store = useStore();
  const cart = useCart(slug);
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["public-product", productId],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_variants(*)")
        .eq("id", productId)
        .eq("active", true)
        .maybeSingle();
      return data;
    },
  });

  const images = useMemo(() => (product?.product_images ?? []).sort((a: any, b: any) => a.position - b.position), [product]);
  const variants: any[] = product?.product_variants ?? [];
  const hasVariants = variants.length > 0;

  // Distinct colors with stock info
  const colors = useMemo(() => {
    const map = new Map<string, { color: string; totalStock: number }>();
    for (const v of variants) {
      const c = (v.color ?? "").trim();
      if (!c) continue;
      const cur = map.get(c) ?? { color: c, totalStock: 0 };
      cur.totalStock += v.stock ?? 0;
      map.set(c, cur);
    }
    return Array.from(map.values());
  }, [variants]);

  const hasColors = colors.length > 0;

  // Sizes (ou numerações) disponíveis para a cor selecionada
  const sizesForColor = useMemo(() => {
    const list = hasColors
      ? variants.filter((v) => (v.color ?? "").trim() === selectedColor)
      : variants;
    return list
      .map((v) => ({
        key: v.id,
        label: v.size || v.numbering || "Único",
        stock: v.stock ?? 0,
      }))
      .filter((s) => s.label);
  }, [variants, selectedColor, hasColors]);

  const selectedVariant = variants.find((v) => {
    const colorOk = hasColors ? (v.color ?? "").trim() === selectedColor : true;
    const sizeOk = (v.size || v.numbering || "Único") === selectedSize;
    return colorOk && sizeOk;
  });

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Carregando…</div>;
  if (!product) return <div className="p-12 text-center text-muted-foreground">Produto não encontrado</div>;

  function variantLabel(v: any) {
    return [v.size && `Tam ${v.size}`, v.color, v.numbering && `Nº ${v.numbering}`].filter(Boolean).join(" • ");
  }

  function addToCart(then?: "cart") {
    if (!product) return;
    if (hasVariants) {
      if (hasColors && !selectedColor) { toast.error("Selecione uma cor"); return; }
      if (sizesForColor.length > 0 && !selectedSize) { toast.error("Selecione um tamanho"); return; }
      if (!selectedVariant) { toast.error("Combinação indisponível"); return; }
    }
    const v = selectedVariant ?? { id: `single-${product.id}`, size: null, color: null, numbering: null };
    cart.add({
      productId: product.id,
      variantId: v.id,
      name: product.name,
      variantLabel: hasVariants ? variantLabel(v) : "Único",
      price: Number(product.price),
      image: images[0]?.url,
      qty: 1,
    });
    toast.success("Adicionado ao carrinho");
    if (then === "cart") navigate({ to: "/loja/$slug/carrinho", params: { slug } });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Link to="/loja/$slug" params={{ slug }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
            {images[imgIdx] ? (
              <>
                <img src={images[imgIdx].url} alt={product.name} className="h-full w-full object-cover" />
                {selectedColor && colorToCss(selectedColor) && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 mix-blend-multiply transition-colors duration-300"
                    style={{ backgroundColor: colorToCss(selectedColor)!, opacity: 0.45 }}
                  />
                )}
              </>
            ) : (
              <div className="grid h-full w-full place-items-center text-muted-foreground">Sem imagem</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setImgIdx(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${imgIdx === i ? "border-foreground" : "border-transparent"}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatBRL(Number(product.price))}</span>
            {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
              <span className="text-muted-foreground line-through">{formatBRL(Number(product.compare_at_price))}</span>
            )}
          </div>

          {product.description && <p className="mt-4 whitespace-pre-line text-muted-foreground">{product.description}</p>}

          {hasColors && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">Cores disponíveis:</p>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => {
                  const out = c.totalStock <= 0;
                  const css = colorToCss(c.color);
                  const active = selectedColor === c.color;
                  return (
                    <button
                      key={c.color}
                      type="button"
                      disabled={out}
                      onClick={() => { setSelectedColor(c.color); setSelectedSize(null); }}
                      title={c.color}
                      className={`flex flex-col items-center gap-1 ${out ? "opacity-40" : ""}`}
                    >
                      <span
                        className={`grid h-14 w-14 place-items-center overflow-hidden rounded-full border-2 transition ${
                          active ? "border-foreground ring-2 ring-foreground/20" : "border-border hover:border-foreground"
                        }`}
                        style={css ? { backgroundColor: css } : undefined}
                      >
                        {!css && <span className="text-[10px] font-medium">{c.color.slice(0, 3)}</span>}
                      </span>
                      <span className="max-w-16 truncate text-[11px] text-muted-foreground">{c.color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasVariants && (hasColors ? selectedColor : true) && sizesForColor.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {sizesForColor.map((s) => {
                  const out = s.stock <= 0;
                  const active = selectedSize === s.label;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      disabled={out}
                      onClick={() => setSelectedSize(s.label)}
                      className={`min-w-14 rounded-md border px-4 py-2 text-sm font-medium transition ${
                        active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                      } ${out ? "cursor-not-allowed text-muted-foreground line-through" : ""}`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => addToCart()} variant="outline" className="flex-1"><ShoppingBag className="mr-2 h-4 w-4" /> Adicionar</Button>
            <Button onClick={() => addToCart("cart")} className="flex-1">Comprar agora</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
