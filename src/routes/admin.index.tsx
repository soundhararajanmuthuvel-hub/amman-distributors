import { createFileRoute, Link } from "@tanstack/react-router";
import {
  IndianRupee,
  PackagePlus,
  Boxes,
  Undo2,
  Users,
  Store,
  AlertTriangle,
  ShoppingCart,
  Clock,
  ChevronRight,
  TruckIcon,
} from "lucide-react";
import { useStore, todayTotals, salesmanSummary, dropAlerts, money, sumMap } from "@/lib/store";
import { Card, SectionTitle, Stat, Pill, Btn, StatusPill } from "@/components/kit";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  const { state } = useStore();
  const t = todayTotals(state);
  const alerts = dropAlerts(state);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Today's Sales" value={money(t.salesValue)} sub={`${t.billCount} bills`} tone="primary" icon={<ShoppingCart className="size-4" />} />
        <Stat label="Cash Collected" value={money(t.collected)} tone="success" icon={<IndianRupee className="size-4" />} />
        <Stat label="Pending" value={money(t.pending)} tone={t.pending > 0 ? "danger" : "success"} icon={<Clock className="size-4" />} />
        <Stat label="Total Stock" value={`${t.available} u`} sub={`Opening ${t.opening}`} tone="info" icon={<Boxes className="size-4" />} />
        <Stat label="New Stock" value={`${t.incoming} u`} sub="Purchased today" tone="info" icon={<PackagePlus className="size-4" />} />
        <Stat label="Returns" value={`${t.returns} u`} tone="warning" icon={<Undo2 className="size-4" />} />
        <Stat label="Active Salesmen" value={t.activeSalesmen} sub={`of ${state.salesmen.length}`} tone="success" icon={<Users className="size-4" />} />
        <Stat label="Shops Visited" value={t.shopsVisited} sub={`of ${state.customers.length}`} tone="primary" icon={<Store className="size-4" />} />
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Link to="/admin/purchase"><Btn variant="soft" className="w-full">Purchase Entry</Btn></Link>
        <Link to="/admin/allocate"><Btn variant="soft" className="w-full">Allocate Stock</Btn></Link>
        <Link to="/admin/closing"><Btn variant="soft" className="w-full">Day Closing</Btn></Link>
        <Link to="/admin/reports"><Btn variant="soft" className="w-full">Reports</Btn></Link>
      </div>

      {alerts.length > 0 && (
        <div>
          <SectionTitle>Alerts</SectionTitle>
          <div className="space-y-2">
            {alerts.map((a) => (
              <Card key={a.customerId} className="border-warning/40 bg-warning/5">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warning/20 text-warning">
                    <AlertTriangle className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">Customer purchase drop — {a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Normal {a.normal} u/day · Recent {a.recent} u/day · Drop {a.dropPct}% over {a.days} days
                    </p>
                    <Link to="/admin/customer/$id" params={{ id: a.customerId }}>
                      <Btn size="sm" variant="outline" className="mt-2">Ask salesman to check</Btn>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle action={<Pill tone="neutral">{`Salesman stock ${t.salesmanStockQty} u`}</Pill>}>
          Live Salesman Status
        </SectionTitle>
        <div className="grid gap-3 lg:grid-cols-2">
          {state.salesmen.map((sm) => {
            const s = salesmanSummary(state, sm.id);
            return (
              <Link key={sm.id} to="/admin/salesman/$id" params={{ id: sm.id }}>
                <Card className="transition hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <TruckIcon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold text-foreground">{sm.name}</p>
                        <StatusPill status={s.attendance?.status ?? "absent"} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{sm.routeName}</p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <Metric label="Received" value={`${sumMap(s.stock.received)}`} />
                    <Metric label="Sold" value={`${sumMap(s.stock.sold)}`} />
                    <Metric label="In hand" value={`${sumMap(s.stock.current)}`} />
                    <Metric label="Returns" value={`${s.returnsQty}`} />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <Metric label="Sales" value={money(s.salesValue)} tone="text-foreground" />
                    <Metric label="Cash" value={money(s.collected)} tone="text-success" />
                    <Metric label="Pending" value={money(s.pending)} tone="text-danger" />
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">Last activity: {s.lastActivity}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone = "text-foreground" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-1 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
