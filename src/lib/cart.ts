import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;
  image?: string;
  qty: number;
};

const key = (slug: string) => `cart:${slug}`;

function read(slug: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key(slug)) || "[]");
  } catch {
    return [];
  }
}

export function useCart(slug: string) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read(slug));
    const onStorage = (e: StorageEvent) => {
      if (e.key === key(slug)) setItems(read(slug));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [slug]);

  const persist = useCallback(
    (next: CartItem[]) => {
      setItems(next);
      localStorage.setItem(key(slug), JSON.stringify(next));
    },
    [slug],
  );

  const add = useCallback(
    (item: CartItem) => {
      const current = read(slug);
      const idx = current.findIndex((i) => i.variantId === item.variantId);
      if (idx >= 0) current[idx].qty += item.qty;
      else current.push(item);
      persist(current);
    },
    [slug, persist],
  );

  const updateQty = useCallback(
    (variantId: string, qty: number) => {
      const next = read(slug)
        .map((i) => (i.variantId === variantId ? { ...i, qty } : i))
        .filter((i) => i.qty > 0);
      persist(next);
    },
    [slug, persist],
  );

  const remove = useCallback(
    (variantId: string) => {
      persist(read(slug).filter((i) => i.variantId !== variantId));
    },
    [slug, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return { items, add, updateQty, remove, clear, total, count };
}

export function buildWhatsappMessage(
  storeName: string,
  items: CartItem[],
  total: number,
) {
  const lines = [
    `*Novo pedido — ${storeName}*`,
    "",
    ...items.map(
      (i) =>
        `• ${i.name} (${i.variantLabel}) — ${i.qty}x ${i.price.toLocaleString(
          "pt-BR",
          { style: "currency", currency: "BRL" },
        )}`,
    ),
    "",
    `*Total: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}*`,
  ];
  return lines.join("\n");
}

export function whatsappLink(phone: string, message: string) {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
