import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell, fieldNav } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Pill } from "@/components/kit";

export const Route = createFileRoute("/field")({
  ssr: false,
  component: FieldLayout,
});

const titles: Record<string, { t: string; s: string }> = {
  "/field": { t: "My Day", s: "Attendance, stock & targets" },
  "/field/visits": { t: "My Route", s: "Shops to visit today" },
  "/field/sales": { t: "New Sale", s: "Bill a shop" },
  "/field/stock": { t: "My Stock", s: "Loaded, sold & in hand" },
  "/field/more": { t: "More", s: "Returns, payments & settings" },
};

function FieldLayout() {
  const { state } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!state.session) navigate({ to: "/" });
  }, [state.session, navigate]);

  const me = state.salesmen.find((s) => s.id === state.session?.salesmanId);
  const meta = titles[pathname] ?? { t: "Field", s: "" };

  return (
    <AppShell nav={fieldNav} title={meta.t} subtitle={meta.s} right={<Pill tone="primary">{me?.name ?? "Salesman"}</Pill>}>
      <Outlet />
    </AppShell>
  );
}
