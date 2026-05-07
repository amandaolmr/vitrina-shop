import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/loja")({
  component: StoreSettings,
});

function StoreSettings() {
  const { user } = useAuth();
  const { data: store, refetch } = useQuery({
    queryKey: ["my-store", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("*").eq("owner_id", user!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (store) setForm(store); }, [store]);

  if (!form) return <p className="text-muted-foreground">Carregando…</p>;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("stores")
      .update({
        name: form.name,
        description: form.description,
        whatsapp: form.whatsapp,
        logo_url: form.logo_url,
        banner_url: form.banner_url,
        theme_color: form.theme_color,
      })
      .eq("id", form.id);
    if (error) toast.error(error.message);
    else { toast.success("Loja atualizada"); refetch(); }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Minha Loja</h1>
      <form onSubmit={save} className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Logo</Label>
            <ImageUpload value={form.logo_url} onChange={(u) => setForm({ ...form, logo_url: u })} label="Logo" />
          </div>
          <div className="space-y-2">
            <Label>Banner</Label>
            <ImageUpload value={form.banner_url} onChange={(u) => setForm({ ...form, banner_url: u })} label="Banner" />
          </div>
        </div>
        <div className="space-y-2"><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>WhatsApp (com DDD)</Label><Input value={form.whatsapp ?? ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="11999998888" /></div>
          <div className="space-y-2"><Label>Cor do tema</Label><Input type="color" value={form.theme_color ?? "#0f172a"} onChange={(e) => setForm({ ...form, theme_color: e.target.value })} /></div>
        </div>
        <div className="space-y-2">
          <Label>Slug (URL pública)</Label>
          <p className="text-sm text-muted-foreground">/loja/<strong>{form.slug}</strong></p>
        </div>
        <Button type="submit">Salvar alterações</Button>
      </form>
    </div>
  );
}
