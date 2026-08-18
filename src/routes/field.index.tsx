import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingCart, Boxes, Undo2 } from "lucide-react";
import { useStore, salesmanSummary, sumMap, money } from "@/lib/store";
import { Card, Stat, Btn, SectionTitle, StatusPill, Empty, useConfirm } from "@/components/kit";

export const Route = createFileRoute("/field/")({ component: FieldHome });

function FieldHome() {
  const { state, markAttendance, closeDay } = useStore();
  const { confirm, confirmNode } = useConfirm();
  const id = state.session?.salesmanId ?? state.salesmen[0]?.id ?? "";
  const sm = state.salesmen.find((s) => s.id === id);
  if (!sm) return <Empty title="No salesman selected" />;
  const s = salesmanSummary(state, sm.id);
  const att = s.attendance;

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-foreground">{sm.routeName}</p>
          <p className="text-xs text-muted-foreground">
            {att ? `Checked in at ${att.checkIn}` : "Not checked in yet"}
          </p>
        </div>
        {att ? (
          <StatusPill status={att.status} />
        ) : (
          <Btn onClick={() => markAttendance(sm.id)}>
            <CheckCircle2 className="size-4" /> Check in
          </Btn>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sales" value={money(s.salesValue)} sub={`${s.sales.length} bills`} tone="primary" icon={<ShoppingCart className="size-4" />} />
        <Stat label="Collected" value={money(s.collected)} tone="success" />
        <Stat label="Pending" value={money(s.pending)} tone={s.pending > 0 ? "danger" : "success"} />
        <Stat label="Stock in hand" value={`${sumMap(s.stock.current)} u`} tone="info" icon={<Boxes className="size-4" />} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link to="/field/sales" search={{ customerId: undefined }}><Btn className="w-full">New sale</Btn></Link>
        <Link to="/field/route"><Btn variant="soft" className="w-full">My route</Btn></Link>
        <Link to="/field/stock"><Btn variant="soft" className="w-full">My stock</Btn></Link>
        <Link to="/field/more"><Btn variant="soft" className="w-full"><Undo2 className="size-4" /> Return</Btn></Link>
      </div>

      <SectionTitle>Recent bills</SectionTitle>
      {s.sales.length === 0 ? (
        <Empty title="No bills yet" sub="Start your route and record your first sale." />
      ) : (
        <Card>
          {s.sales
            .slice()
            .reverse()
            .map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                <span className="text-sm text-muted-foreground">
                  {b.time} · {state.customers.find((c) => c.id === b.customerId)?.name}
                </span>
                <span className="flex items-center gap-2 text-sm font-bold tabular-nums">
                  {money(b.total)} <StatusPill status={b.status} />
                </span>
              </div>
            ))}
        </Card>
      )}

      <Btn
        variant="outline"
        className="w-full"
        disabled={!att || att.status === "closed"}
        onClick={() =>
          confirm(
            "Close your day?",
            `Sales ${money(s.salesValue)} · Collected ${money(s.collected)} · Stock in hand ${sumMap(s.stock.current)} u`,
            () => closeDay(sm.id),
            "Close day",
          )
        }
      >
        {att?.status === "closed" ? "Day closed" : "Close my day"}
      </Btn>
      {confirmNode}
    </div>
  );
}
