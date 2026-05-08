import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { ShoppingBag, Info, MessageCircle, MapPin, Instagram } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function StoreHeader({ store }: { store: any }) {
  const { count } = useCart(store.slug);

  function openWhatsApp() {
    if (!store.whatsapp) return;
    let clean = store.whatsapp.replace(/\D/g, "");
    if (clean.startsWith("0")) clean = clean.substring(1);
    if (clean.length === 10 || clean.length === 11) {
      clean = "55" + clean;
    }
    window.open(`https://wa.me/${clean}`, "_blank");
  }

  function openInstagram() {
    if (!store.instagram) return;
    let url = store.instagram.trim();
    // Se começa com @, remove e monta a URL
    if (url.startsWith("@")) {
      url = `https://instagram.com/${url.substring(1)}`;
    }
    // Se não começa com http, assume que é username
    else if (!url.startsWith("http")) {
      url = `https://instagram.com/${url}`;
    }
    window.open(url, "_blank");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/loja/$slug" params={{ slug: store.slug }} className="flex items-center gap-2">
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-bold">
              {store.name.charAt(0)}
            </span>
          )}
          <span className="font-semibold">{store.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          {store.instagram && (
            <button
              onClick={openInstagram}
              className="grid h-10 w-10 place-items-center rounded-full bg-secondary hover:bg-accent"
              title="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </button>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-secondary hover:bg-accent">
                <Info className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Informações da Loja</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      {store.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{store.name}</h3>
                    {store.description && (
                      <p className="text-sm text-muted-foreground mt-1">{store.description}</p>
                    )}
                  </div>
                </div>

                {(store.address || store.city || store.state) && (
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        {store.address && <p>{store.address}</p>}
                        {(store.city || store.state) && (
                          <p className="text-muted-foreground">
                            {[store.city, store.state].filter(Boolean).join(", ")}
                            {store.zip_code && ` - ${store.zip_code}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(store.whatsapp || store.instagram) && (
                  <div className="border-t pt-4 space-y-2">
                    {store.whatsapp && (
                      <Button
                        onClick={openWhatsApp}
                        className="w-full bg-[#25D366] hover:bg-[#1ebd5b]"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Conversar no WhatsApp
                      </Button>
                    )}
                    {store.instagram && (
                      <Button onClick={openInstagram} variant="outline" className="w-full">
                        <Instagram className="mr-2 h-4 w-4" />
                        Ver no Instagram
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

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
      </div>
    </header>
  );
}
