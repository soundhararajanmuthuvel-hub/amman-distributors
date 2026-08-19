import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useStore,
  money,
  salesmanSummary,
  sumMap,
  customerOutstanding,
  productById,
} from "@/lib/store";
import { Card, Segmented, Row, SectionTitle, Empty } from "@/components/kit";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

type Tab = "sales" | "products" | "salesmen" | "outstanding";

function Reports() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>("sales");

  const sales = state.sales.filter((s) => s.date === state.today);

  const byProduct = state.products.map((p) => {
    let qty = 0;
    let value = 0;
    for (const s of sales)
      for (const it of s.items)
        if (it.productId === p.id) {
          qty += it.qty;
          value += it.qty * it.rate;
        }
    return { p, qty, value };
  });

  return (
    <div className="space-y-4">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "sales", label: "Sales" },
          { value: "products", label: "Products" },
          { value: "salesmen", label: "Salesmen" },
          { value: "outstanding", label: "Dues" },
        ]}
      />

      {tab === "sales" && (
        <Card>
          <SectionTitle>Today</SectionTitle>
          <Row left="Bills" right={sales.length} />
          <Row
            left="Units sold"
            right={sales.reduce((a, b) => a + b.items.reduce((q, i) => q + i.qty, 0), 0)}
          />
          <Row left="Collected" right={money(sales.reduce((a, b) => a + b.received, 0))} />
          <Row left="Total value" right={money(sales.reduce((a, b) => a + b.total, 0))} strong />
        </Card>
      )}

      {tab === "products" && (
        <Card>
          {byProduct.every((r) => r.qty === 0) ? (
            <Empty title="No sales today" />
          ) : (
            byProduct
              .filter((r) => r.qty > 0)
              .sort((a, b) => b.value - a.value)
              .map((r) => (
                <Row
                  key={r.p.id}
                  left={`${r.p.name} · ${r.qty} ${r.p.unit}`}
                  right={money(r.value)}
                />
              ))
          )}
        </Card>
      )}

      {tab === "salesmen" && (
        <div className="grid gap-3 lg:grid-cols-2">
          {state.salesmen.map((sm) => {
            const s = salesmanSummary(state, sm.id);
            return (
              <Card key={sm.id}>
                <p className="mb-2 font-bold text-foreground">{sm.name}</p>
                <Row left="Bills" right={s.sales.length} />
                <Row left="Shops visited" right={s.shopsVisited} />
                <Row left="Units sold" right={sumMap(s.stock.sold)} />
                <Row left="Collected" right={money(s.collected)} />
                <Row left="Sales value" right={money(s.salesValue)} strong />
              </Card>
            );
          })}
        </div>
      )}

      {tab === "outstanding" && (
        <Card>
          {state.customers
            .map((c) => ({ c, due: customerOutstanding(state, c.id) }))
            .filter((r) => r.due > 0)
            .sort((a, b) => b.due - a.due)
            .map((r) => (
              <Row key={r.c.id} left={r.c.name} right={money(r.due)} />
            ))}
        </Card>
      )}

      {tab === "products" && sales.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Top seller:{" "}
          {productById(state, byProduct.slice().sort((a, b) => b.qty - a.qty)[0]?.p.id ?? "")
            ?.name ?? "—"}
        </p>
      )}
    </div>
  );
}
