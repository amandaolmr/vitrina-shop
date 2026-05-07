import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/produtos")({
  component: () => <Outlet />,
});

export function ProductsBreadcrumb() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Link to="/admin/produtos" className="text-sm text-muted-foreground hover:text-foreground">
      ← Produtos {path}
    </Link>
  );
}
