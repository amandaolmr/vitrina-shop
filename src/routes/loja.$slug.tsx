import { createFileRoute, Outlet, notFound, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreHeader } from "@/components/store-header";
import { StoreCtx, useStore } from "@/lib/store-context";
import { trackStoreVisit } from "@/lib/store-analytics";

export { useStore };

export const Route = createFileRoute("/loja/$slug")({
  component: StoreLayout,
});

function StoreLayout() {
  const { slug } = Route.useParams();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const {
    data: store,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["store", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  // Track a store visit on every in-store page navigation
  useEffect(() => {
    if (store?.id) trackStoreVisit(store.id);
  }, [path, store?.id]);

  if (isLoading)
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando…</div>
    );
  if (error || !store)
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        Loja não encontrada
      </div>
    );

  return (
    <StoreCtx.Provider value={store as any}>
      <div className="min-h-screen bg-background overflow-x-hidden w-full">
        <StoreHeader store={store} />
        <Outlet />
        <footer className="mt-16 border-t border-border py-8 text-center text-xs text-muted-foreground">
          Powered by Amanda
        </footer>
      </div>
    </StoreCtx.Provider>
  );
}
