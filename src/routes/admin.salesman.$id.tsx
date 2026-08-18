import { createFileRoute } from "@tanstack/react-router";
import { useStore, salesmanSummary, sumMap, money, customerName } from "@/lib/store";
import { Card, Row, Stat, SectionTitle, StatusPill, Empty } from "@/components/kit";

export const Route = createFileRoute("/admin/salesman/$id")({ component: SalesmanDetail });

function SalesmanDetail() {
  const { id } = Route.useParams();
  const { state } = useStore();
  const sm = state.salesmen.find((s) => s.id === id);
  if (!sm) return <Empty title="Salesman not found" />;
  const s = salesmanSummary(state, sm.id);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">{sm.name}</p>
            <p className="text-xs text-muted-foreground">
              {sm.routeName} · {sm.phone}
            </p>
          </div>
          <StatusPill status={s.attendance?.status ?? "absent"} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sales" value={money(s.salesValue)} tone="primary" />
        <Stat label="Collected" value={money(s.collected)} tone="success" />
        <Stat label="Pending" value={money(s.pending)} tone={s.pending > 0 ? "danger" : "success"} />
        <Stat label="In hand" value={`${sumMap(s.stock.current)} u`} tone="info" />
      </div>

      <SectionTitle>Stock today</SectionTitle>
      <Card>
        {state.products
          .filter((p) => (s.stock.received[p.id] ?? 0) > 0)
          .map((p) => (
            <Row
              key={p.id}
              left={p.name}
              right={`${s.stock.received[p.id] ?? 0} loaded · ${s.stock.sold[p.id] ?? 0} sold · ${s.stock.current[p.id] ?? 0} left`}
            />
          ))}
        {sumMap(s.stock.received) === 0 && <p className="text-sm text-muted-foreground">No stock allocated today.</p>}
      </Card>

      <SectionTitle>Bills</SectionTitle>
      {s.sales.length === 0 ? (
        <Empty title="No bills yet today" />
      ) : (
        <Card>
          {s.sales.map((b) => (
            <Row key={b.id} left={`${b.time} · ${customerName(state, b.customerId)}`} right={money(b.total)} />
          ))}
        </Card>
      )}
    </div>
  );
}
