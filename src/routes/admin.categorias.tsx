import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categorias")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");

  const { data: store } = useQuery({
    queryKey: ["my-store", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("stores").select("*").eq("owner_id", user!.id).maybeSingle()).data,
  });

  const { data: cats, refetch } = useQuery({
    queryKey: ["categories", store?.id],
    enabled: !!store,
    queryFn: async () => (await supabase.from("categories").select("*").eq("store_id", store!.id).order("position")).data ?? [],
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !store) return;
    const { error } = await supabase.from("categories").insert({ store_id: store.id, name: name.trim() });
    if (error) toast.error(error.message);
    else { setName(""); refetch(); }
  }

  async function remove(id: string) {
    if (!confirm("Excluir categoria?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else refetch();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Categorias</h1>
      <form onSubmit={add} className="mt-6 flex gap-2">
        <Input placeholder="Nova categoria (ex: Vestidos)" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">Adicionar</Button>
      </form>
      <div className="mt-6 divide-y rounded-2xl border border-border bg-card">
        {cats?.length === 0 && <p className="p-6 text-sm text-muted-foreground">Nenhuma categoria ainda.</p>}
        {cats?.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <span>{c.name}</span>
            <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
