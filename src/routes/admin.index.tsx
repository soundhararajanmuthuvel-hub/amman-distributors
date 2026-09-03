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
import { useLang } from "@/lib/i18n";
import { Card, SectionTitle, Stat, Pill, Btn, StatusPill } from "@/components/kit";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  const { state, set } = useStore();
  const { t: tr, lang } = useLang();
  const t = todayTotals(state);
  const alerts = dropAlerts(state);

  const adminAttendance = state.attendance.find(
    (a) => (a.userId === "admin" || a.salesmanId === "admin") && a.date === state.today,
  );

  const punchIn = () => {
    const time = new Date().toTimeString().slice(0, 5);
    set((s) => {
      if (s.attendance.some((a) => (a.userId === "admin" || a.salesmanId === "admin") && a.date === s.today)) return s;
      return {
        ...s,
        attendance: [
          ...s.attendance,
          {
            id: `att_admin_${s.today}`,
            salesmanId: "admin",
            userId: "admin",
            date: s.today,
            checkIn: time,
            status: "present",
          },
        ],
      };
    });
  };

  const punchOut = () => {
    const time = new Date().toTimeString().slice(0, 5);
    set((s) => {
      const existing = s.attendance.find((a) => (a.userId === "admin" || a.salesmanId === "admin") && a.date === s.today);
      let duration = "";
      if (existing) {
        const startSplit = (existing.checkIn || "").split(":");
        const startH = Number(startSplit[0] || 0);
        const startM = Number(startSplit[1] || 0);
        const endSplit = time.split(":");
        const endH = Number(endSplit[0] || 0);
        const endM = Number(endSplit[1] || 0);
        const diffMinutes = endH * 60 + endM - (startH * 60 + startM);
        if (diffMinutes >= 0) {
          const h = Math.floor(diffMinutes / 60);
          const m = diffMinutes % 60;
          duration = `${h}h ${m}m`;
        }
      }
      return {
        ...s,
        attendance: s.attendance.map((a) =>
          (a.userId === "admin" || a.salesmanId === "admin") && a.date === s.today
            ? { ...a, status: "closed", closedAt: time, workingDuration: duration }
            : a,
        ),
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Admin Self-Attendance module */}
      <Card className="border-primary/20 bg-primary/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">{tr.managerSelfAtt}</p>
            <p className="text-xs text-muted-foreground">
              {tr.logShiftPresence}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!adminAttendance && (
              <Btn onClick={punchIn} variant="primary">
                {tr.punchIn}
              </Btn>
            )}
            {adminAttendance && adminAttendance.status === "present" && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-success bg-success/15 px-2.5 py-1 rounded-full">
                  {tr.presentIn} {adminAttendance.checkIn}
                </span>
                <Btn onClick={punchOut} variant="outline">
                  {tr.punchOut}
                </Btn>
              </div>
            )}
            {adminAttendance && adminAttendance.status === "closed" && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {tr.attendanceCompleted}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  In: {adminAttendance.checkIn} · Out: {adminAttendance.closedAt} · {adminAttendance.workingDuration}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Cash Flow & Financial Health Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5 p-4">
          <p className="text-xs uppercase font-bold text-muted-foreground">{tr.currentCashInHand}</p>
          <p className="mt-1 text-2xl font-black text-foreground">
            {money(t.collected + 15000 - (state.purchases || []).reduce((acc, p) => acc + (p.paidAmount ?? 0), 0))}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {tr.openingCash}: {money(15000)} · {tr.collections}: +{money(t.collected)}
          </p>
        </Card>

        <Card className="border-warning/20 bg-warning/5 p-4">
          <p className="text-xs uppercase font-bold text-muted-foreground">{tr.totalSupplierDue}</p>
          <p className="mt-1 text-2xl font-black text-warning">
            {money((state.suppliers || []).reduce((acc, s) => acc + (s.currentPayable ?? 0), 0))}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {(state.suppliers || []).length} {tr.activeSuppliers}
          </p>
        </Card>

        <Card className="border-success/20 bg-success/5 p-4">
          <p className="text-xs uppercase font-bold text-muted-foreground">{tr.godownStockVal}</p>
          <p className="mt-1 text-2xl font-black text-success">
            {money(
              (state.products || []).reduce((acc, p) => {
                return acc + (p.currentPurchasePrice ?? p.rate ?? 0) * 15;
              }, 0)
            )}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {(state.products || []).length} {tr.catalogLines}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={tr.todaysSales}
          value={money(t.salesValue)}
          sub={`${t.billCount} bills`}
          tone="primary"
          icon={<ShoppingCart className="size-4" />}
        />
        <Stat
          label={tr.cashCollected}
          value={money(t.collected)}
          tone="success"
          icon={<IndianRupee className="size-4" />}
        />
        <Stat
          label={tr.customerDues}
          value={money(t.pending)}
          tone={t.pending > 0 ? "danger" : "success"}
          icon={<Clock className="size-4" />}
        />
        <Stat
          label={tr.godownStock}
          value={`${t.available} u`}
          sub={`Opening ${t.opening}`}
          tone="info"
          icon={<Boxes className="size-4" />}
        />
        <Stat
          label={tr.newStock}
          value={`${t.incoming} u`}
          sub={tr.purchasedToday}
          tone="info"
          icon={<PackagePlus className="size-4" />}
        />
        <Stat
          label={tr.returns}
          value={`${t.returns} u`}
          tone="warning"
          icon={<Undo2 className="size-4" />}
        />
        <Stat
          label={tr.activeSalesmen}
          value={t.activeSalesmen}
          sub={`of ${state.salesmen.length}`}
          tone="success"
          icon={<Users className="size-4" />}
        />
        <Stat
          label={tr.shopsVisited}
          value={t.shopsVisited}
          sub={`of ${state.customers.length}`}
          tone="primary"
          icon={<Store className="size-4" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Link to="/admin/purchase">
          <Btn variant="soft" className="w-full">
            {tr.purchaseEntry}
          </Btn>
        </Link>
        <Link to="/admin/allocate">
          <Btn variant="soft" className="w-full">
            {tr.allocateStock}
          </Btn>
        </Link>
        <Link to="/admin/closing">
          <Btn variant="soft" className="w-full">
            {tr.dayClosing}
          </Btn>
        </Link>
        <Link to="/admin/reports">
          <Btn variant="soft" className="w-full">
            {tr.reportsCashFlow}
          </Btn>
        </Link>
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
                    <p className="text-sm font-bold text-foreground">
                      Customer purchase drop — {a.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Normal {a.normal} u/day · Recent {a.recent} u/day · Drop {a.dropPct}% over{" "}
                      {a.days} days
                    </p>
                    <Link to="/admin/customer/$id" params={{ id: a.customerId }}>
                      <Btn size="sm" variant="outline" className="mt-2">
                        Ask salesman to check
                      </Btn>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle
          action={<Pill tone="neutral">{`Salesman stock ${t.salesmanStockQty} u`}</Pill>}
        >
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
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    Last activity: {s.lastActivity}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "text-foreground",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/60 px-1 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`text-sm font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
