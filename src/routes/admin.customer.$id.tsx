import { createFileRoute } from "@tanstack/react-router";
import { useStore, customerOutstanding, money, customerRate, productById } from "@/lib/store";
import { Card, Row, Stat, SectionTitle, Empty, StatusPill } from "@/components/kit";

export const Route = createFileRoute("/admin/customer/$id")({ component: CustomerDetail });

function CustomerDetail() {
  const { id } = Route.useParams();
  const { state } = useStore();
  const c = state.customers.find((x) => x.id === id);
  if (!c) return <Empty title="Shop not found" />;

  const bills = state.sales
    .filter((s) => s.customerId === c.id)
    .slice()
    .reverse();
  const due = customerOutstanding(state, c.id);
  const totalQty = bills.reduce((a, b) => a + b.items.reduce((q, i) => q + i.qty, 0), 0);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-lg font-bold text-foreground">{c.name}</p>
        <p className="text-xs text-muted-foreground">
          {c.owner} · {c.phone}
        </p>
        <p className="text-xs text-muted-foreground">{c.address}</p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Outstanding" value={money(due)} tone={due > 0 ? "danger" : "success"} />
        <Stat label="Bills" value={bills.length} tone="primary" />
        <Stat label="Units bought" value={totalQty} tone="info" />
      </div>

      <SectionTitle>Locked prices</SectionTitle>
      <Card>
        {state.products.map((p) => (
          <Row
            key={p.id}
            left={`${p.name}${c.prices[p.id] !== undefined ? "" : " (default)"}`}
            right={money(customerRate(c, p))}
          />
        ))}
      </Card>

      <SectionTitle>Purchase history</SectionTitle>
      {bills.length === 0 ? (
        <Empty title="No bills yet" />
      ) : (
        <div className="space-y-2">
          {bills.map((b) => (
            <Card key={b.id}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {b.date} · {b.time}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-bold tabular-nums">{money(b.total)}</span>
                  <StatusPill status={b.status} />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {b.items
                  .map((i) => `${productById(state, i.productId)?.name} ×${i.qty}`)
                  .join(", ")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
