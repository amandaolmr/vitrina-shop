import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  content: string;
  className?: string;
}

export function AnalyticsTooltip({ content, className }: Props) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center transition-colors cursor-default shrink-0 ${
              className ?? "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span className="sr-only">Informação</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="max-w-[200px] rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs leading-relaxed text-zinc-300 shadow-xl"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
