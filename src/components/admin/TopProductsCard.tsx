import { Link } from "@tanstack/react-router";
import { Eye, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopProducts } from "@/hooks/use-top-products";

interface Props {
  storeId: string | undefined;
}

export function TopProductsCard({ storeId }: Props) {
  const { data: products, isLoading } = useTopProducts(storeId, 3);

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="tracking-tight text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-amber-500" />
          Produtos Mais Vistos
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))
        ) : !products || products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum dado de visualização ainda.
          </p>
        ) : (
          products.map((product, i) => (
            <Link
              key={product.productId}
              to="/admin/produtos/$id"
              params={{ id: product.productId }}
              className="flex items-center gap-3 group/row"
            >
              <div className="h-9 w-9 rounded-lg border border-border/60 bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">img</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate group-hover/row:text-primary transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  <Eye className="inline h-3 w-3 mr-0.5 -mt-px" aria-hidden="true" />
                  {product.views} views
                </p>
              </div>
              {i === 0 ? (
                <span className="text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-600">
                  🔥
                </span>
              ) : (
                <span className="text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                  #{i + 1}
                </span>
              )}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
