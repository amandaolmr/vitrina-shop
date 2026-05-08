import { Link } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-context";

export function StoreHeader() {
  const store = useStore();

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/70 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/loja/$slug" params={{ slug: store.slug }} className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 uppercase">
              {store.name}
            </h1>
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {["Início", "Produtos", "Categorias", "Sobre nós", "Contato"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:bg-slate-100/50">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full text-slate-600 hover:bg-slate-100/50">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full text-slate-600 hover:bg-slate-100/50">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full relative text-slate-600 hover:bg-slate-100/50">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                0
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden rounded-full text-slate-600">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
