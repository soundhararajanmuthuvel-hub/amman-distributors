import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Route as RouteIcon, Store, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, SectionTitle, Btn, Input, Select, Pill, Empty } from "@/components/kit";

export const Route = createFileRoute("/admin/routes")({
  component: RouteSetup,
});

function RouteSetup() {
  const { state, upsertSalesman, upsertCustomer } = useStore();
  const [names, setNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(state.salesmen.map((s) => [s.id, s.routeName])),
  );
  const [q, setQ] = useState("");

  const shops = useMemo(() => {
    const t = q.trim().toLowerCase();
    return state.customers.filter((c) => !t || c.name.toLowerCase().includes(t) || c.address.toLowerCase().includes(t));
  }, [state.customers, q]);

  const countFor = (id: string) => state.customers.filter((c) => c.salesmanId === id).length;

  const saveName = (id: string) => {
    const sm = state.salesmen.find((s) => s.id === id);
    if (!sm) return;
    const routeName = (names[id] ?? "").trim() || sm.routeName;
    upsertSalesman({ ...sm, routeName });
    toast.success(`Route saved for ${sm.name}`);
  };

  return (
    <div className="space-y-4">
      <SectionTitle>Routes</SectionTitle>
      <div className="grid gap-2 sm:grid-cols-2">
        {state.salesmen.map((s) => (
          <Card key={s.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <RouteIcon className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.phone}</p>
              </div>
              <Pill tone="info">{countFor(s.id)} shops</Pill>
            </div>
            <div className="flex gap-2">
              <Input
                value={names[s.id] ?? ""}
                onChange={(e) => setNames((n) => ({ ...n, [s.id]: e.target.value }))}
                placeholder="Route name"
              />
              <Btn variant="soft" onClick={() => saveName(s.id)}>
                <Check className="size-4" />
              </Btn>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>Shop assignment</SectionTitle>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shop or area" />
      <div className="space-y-2">
        {shops.length === 0 && <Empty title="No shops found" sub="Try a different search" />}
        {shops.map((c) => (
          <Card key={c.id} className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Store className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">{c.address}</p>
            </div>
            <Select
              value={c.salesmanId}
              onChange={(e) => {
                upsertCustomer({ ...c, salesmanId: e.target.value });
                toast.success(`${c.name} moved to ${state.salesmen.find((s) => s.id === e.target.value)?.name}`);
              }}
              className="w-40"
            >
              {state.salesmen.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Card>
        ))}
      </div>
    </div>
  );
}
