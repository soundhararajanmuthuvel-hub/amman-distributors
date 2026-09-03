import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell, fieldNav } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { Pill } from "@/components/kit";

export const Route = createFileRoute("/field")({
  ssr: false,
  component: FieldLayout,
});

function FieldLayout() {
  const { state } = useStore();
  const { t } = useLang();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!state.session) navigate({ to: "/" });
  }, [state.session, navigate]);

  const titles: Record<string, { t: string; s: string }> = {
    "/field": { t: t.myDayTitle, s: t.myDaySubtitle },
    "/field/visits": { t: t.myRouteTitle, s: t.myRouteSubtitle },
    "/field/sales": { t: t.newSaleTitle, s: t.newSaleSubtitle },
    "/field/stock": { t: t.myStockTitle, s: t.myStockSubtitle },
    "/field/more": { t: t.moreTitle, s: t.moreSubtitle },
  };

  const me = state.salesmen.find((s) => s.id === state.session?.salesmanId);
  const meta = titles[pathname] ?? { t: t.myDayTitle, s: "" };

  return (
    <AppShell
      nav={fieldNav}
      title={meta.t}
      subtitle={meta.s}
      right={<Pill tone="primary">{me?.name ?? "Salesman"}</Pill>}
    >
      <Outlet />
    </AppShell>
  );
}
