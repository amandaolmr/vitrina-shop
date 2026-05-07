import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  className?: string;
};

export function ImageUpload({ value, onChange, label = "Imagem", className }: Props) {
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("store-assets").upload(path, file, { upsert: false });
    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from("store-assets").getPublicUrl(path);
    onChange(data.publicUrl);
    setBusy(false);
  }

  return (
    <div className={className}>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt={label} className="h-32 w-32 rounded-lg border object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition hover:bg-accent">
          <Upload className="h-5 w-5" />
          {busy ? "Enviando…" : label}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>
      )}
    </div>
  );
}

export function MultiImageUpload({
  values,
  onChange,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function uploadAll(files: FileList) {
    setBusy(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("store-assets").upload(path, file);
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data } = supabase.storage.from("store-assets").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    onChange([...values, ...urls]);
    setBusy(false);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const next = [...values];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {values.map((url, i) => (
          <div key={url} className="relative">
            <img src={url} alt="" className="h-24 w-24 rounded-lg border object-cover" />
            <span className="absolute left-1 top-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold">
              {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between rounded-b-lg bg-background/80">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="grid h-6 w-1/2 place-items-center disabled:opacity-30"
                aria-label="Mover para esquerda"
              >
                <ArrowLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === values.length - 1}
                className="grid h-6 w-1/2 place-items-center disabled:opacity-30"
                aria-label="Mover para direita"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground transition hover:bg-accent">
          <Upload className="h-4 w-4" />
          {busy ? "Enviando…" : "Adicionar"}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && uploadAll(e.target.files)}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">A primeira imagem é a capa. Use as setas para reordenar.</p>
    </div>
  );
}
