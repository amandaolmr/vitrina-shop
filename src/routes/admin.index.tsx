import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function AdminHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const { data: store, isLoading, refetch } = useQuery({
    queryKey: ["my-store", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("*").eq("owner_id", user!.id).maybeSingle();
      return data;
    },
  });

  async function createStore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name"));
    const slug = slugify(String(fd.get("slug") || name));
    const { data, error } = await supabase
      .from("stores")
      .insert({ owner_id: user!.id, name, slug, whatsapp: String(fd.get("whatsapp") || "") })
      .select()
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Loja criada!");
    await refetch();
    navigate({ to: "/admin/loja" });
    void data;
  }

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;

  if (!store) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">Crie sua loja</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure os dados básicos para começar.</p>
        <form onSubmit={createStore} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2"><Label>Nome da loja</Label><Input name="name" required placeholder="Ex: Boutique Lila" /></div>
          <div className="space-y-2">
            <Label>URL pública (slug)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/loja/</span>
              <Input name="slug" placeholder="boutique-lila" />
            </div>
          </div>
          <div className="space-y-2"><Label>WhatsApp (com DDD)</Label><Input name="whatsapp" placeholder="11999998888" /></div>
          <Button type="submit" className="w-full" disabled={busy}>Criar loja</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{store.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vitrine: <a className="underline" href={`/loja/${store.slug}`} target="_blank" rel="noreferrer">/loja/{store.slug}</a>
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/admin/produtos" className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-md">
          <h3 className="font-semibold">Produtos</h3>
          <p className="mt-1 text-sm text-muted-foreground">Adicione e gerencie itens.</p>
        </Link>
        <Link to="/admin/categorias" className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-md">
          <h3 className="font-semibold">Categorias</h3>
          <p className="mt-1 text-sm text-muted-foreground">Organize seu catálogo.</p>
        </Link>
        <Link to="/admin/loja" className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-md">
          <h3 className="font-semibold">Configurações</h3>
          <p className="mt-1 text-sm text-muted-foreground">Logo, banner e WhatsApp.</p>
        </Link>
      </div>
    </div>
  );
}
