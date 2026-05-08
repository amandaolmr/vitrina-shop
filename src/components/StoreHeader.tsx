import { Link } from "@tanstack/react-router";
import { Instagram, Info, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-context";

export function StoreHeader() {
  const store = useStore();

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/loja/$slug" 
            params={{ slug: store.slug }} 
            className="flex-shrink-0 group"
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 uppercase transition-transform group-hover:scale-105">
              {store.name}
            </h1>
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
              title="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
              title="Informações"
            >
              <Info className="h-5 w-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
              title="Favoritos"
            >
              <Heart className="h-5 w-5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full relative text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
              title="Carrinho"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                0
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
