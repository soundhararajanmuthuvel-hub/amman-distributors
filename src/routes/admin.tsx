import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell, adminNav } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Pill } from "@/components/kit";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

const titles: Record<string, { t: string; s: string }> = {
  "/admin": { t: "Today's Overview", s: "Live business position" },
  "/admin/sales": { t: "Sales", s: "All bills and collections" },
  "/admin/stock": { t: "Stock", s: "Main godown & salesman stock" },
  "/admin/customers": { t: "Shops", s: "Customer master & outstanding" },
  "/admin/more": { t: "More", s: "Management & settings" },
  "/admin/purchase": { t: "Purchase Entry", s: "Incoming stock bill" },
  "/admin/allocate": { t: "Allocate Stock", s: "Distribute to salesmen" },
  "/admin/products": { t: "Products", s: "Product master" },
  "/admin/reports": { t: "Reports", s: "Sales, stock, payments, salesmen" },
  "/admin/returns": { t: "Returns", s: "Route returns" },
  "/admin/closing": { t: "Day Closing", s: "Closing stock & carry forward" },
};

function AdminLayout() {
  const { state } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!state.session) navigate({ to: "/" });
  }, [state.session, navigate]);

  const meta =
    titles[pathname] ??
    (pathname.startsWith("/admin/salesman")
      ? { t: "Salesman", s: "Live status" }
      : pathname.startsWith("/admin/customer")
        ? { t: "Shop", s: "History & pricing" }
        : { t: "Admin", s: "" });

  return (
    <AppShell
      nav={adminNav}
      title={meta.t}
      subtitle={meta.s}
      right={<Pill tone="info">{state.session?.role === "supervisor" ? "Supervisor" : "Owner"}</Pill>}
    >
      <Outlet />
    </AppShell>
  );
}
