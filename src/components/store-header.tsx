import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { ShoppingBag } from "lucide-react";

export function StoreHeader({ store }: { store: any }) {
  const { count } = useCart(store.slug);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/loja/$slug" params={{ slug: store.slug }} className="flex items-center gap-2">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-bold">
              {store.name.charAt(0)}
            </span>
          )}
          <span className="font-semibold">{store.name}</span>
        </Link>
        <Link
          to="/loja/$slug/carrinho"
          params={{ slug: store.slug }}
          className="relative grid h-10 w-10 place-items-center rounded-full bg-secondary hover:bg-accent"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
