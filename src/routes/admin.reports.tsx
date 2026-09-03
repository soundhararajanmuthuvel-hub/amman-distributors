import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useStore,
  money,
  salesmanSummary,
  sumMap,
  customerOutstanding,
  supplierOutstanding,
  cashFlowSummary,
  productById,
} from "@/lib/store";
import { Card, Segmented, Row, SectionTitle, Empty, Pill } from "@/components/kit";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

type Tab = "sales" | "cashflow" | "prices" | "suppliers" | "products" | "salesmen" | "outstanding";

function Reports() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>("sales");

  const sales = state.sales.filter((s) => s.date === state.today);
  const cf = cashFlowSummary(state, state.today);

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
          { value: "cashflow", label: "Cash Flow" },
          { value: "prices", label: "Price History" },
          { value: "suppliers", label: "Suppliers" },
          { value: "products", label: "Products" },
          { value: "salesmen", label: "Salesmen" },
          { value: "outstanding", label: "Customer Dues" },
        ]}
      />

      {tab === "sales" && (
        <Card>
          <SectionTitle>Today's Sales Summary</SectionTitle>
          <Row left="Total Bills" right={sales.length} />
          <Row
            left="Units Sold"
            right={sales.reduce((a, b) => a + b.items.reduce((q, i) => q + i.qty, 0), 0)}
          />
          <Row left="Cash / UPI Collected" right={money(sales.reduce((a, b) => a + b.received, 0))} />
          <Row left="Total Sales Value" right={money(sales.reduce((a, b) => a + b.total, 0))} strong />
        </Card>
      )}

      {tab === "cashflow" && (
        <div className="space-y-3">
          <Card className="space-y-2">
            <SectionTitle>Today's Cash Flow</SectionTitle>
            <Row left="Opening Cash Balance" right={money(cf.openingCash)} />
            <Row left="(+) Customer Collections" right={money(cf.collections)} className="text-success font-semibold" />
            <Row left="(+) Other Cash Inflows" right={money(cf.otherInflows)} />
            <Row left="(-) Supplier Payments" right={money(cf.supplierPayments)} className="text-danger font-semibold" />
            <Row left="(-) Expenses" right={money(cf.expenses)} className="text-danger" />
            <div className="border-t border-border pt-2">
              <Row left="Current Cash in Hand" right={money(cf.currentCash)} strong className="text-base" />
            </div>
          </Card>

          <Card className="space-y-2">
            <SectionTitle>Purchases vs Cash Outflow</SectionTitle>
            <Row left="Gross Purchase Value" right={money(cf.purchaseValue)} />
            <Row left="Paid Now (Cash Outflow)" right={money(cf.purchasePaid)} className="text-danger" />
            <Row left="Pending to Suppliers" right={money(cf.purchasePending)} className="text-warning font-semibold" />
          </Card>
        </div>
      )}

      {tab === "prices" && (
        <Card className="space-y-3">
          <SectionTitle>Purchase Price Changes & History</SectionTitle>
          {state.supplierPrices.length === 0 ? (
            <Empty title="No price changes recorded yet" />
          ) : (
            <div className="space-y-2">
              {state.supplierPrices.map((sp) => {
                const prd = state.products.find((p) => p.id === sp.productId);
                const sup = state.suppliers.find((s) => s.id === sp.supplierId);
                const isIncreased = sp.diffAmount > 0.001;
                const isDecreased = sp.diffAmount < -0.001;

                return (
                  <div key={sp.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-xs">
                    <div>
                      <p className="font-bold text-foreground text-sm">{prd?.name || sp.productId}</p>
                      <p className="text-muted-foreground">{sup?.name || "Supplier"} · {sp.effectiveDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 font-bold">
                        <span className="text-muted-foreground line-through">{money(sp.previousPrice)}</span>
                        <span>→</span>
                        <span className="text-foreground">{money(sp.purchasePrice)}</span>
                      </div>
                      <div className="mt-0.5">
                        {isIncreased ? (
                          <span className="inline-flex items-center gap-0.5 font-bold text-danger">
                            <TrendingUp className="size-3" /> +{money(sp.diffAmount)} (+{sp.percentageChange.toFixed(1)}%)
                          </span>
                        ) : isDecreased ? (
                          <span className="inline-flex items-center gap-0.5 font-bold text-success">
                            <TrendingDown className="size-3" /> {money(sp.diffAmount)} ({sp.percentageChange.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Unchanged</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {tab === "suppliers" && (
        <Card className="space-y-3">
          <SectionTitle>Supplier Outstanding Payables</SectionTitle>
          {state.suppliers.map((sup) => (
            <div key={sup.id} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="font-bold text-foreground">{sup.name}</p>
                <p className="text-xs text-muted-foreground">Code: {sup.code} · {sup.phone}</p>
              </div>
              <div className="text-right">
                <span className={`font-bold tabular-nums ${sup.currentPayable > 0 ? "text-warning" : "text-success"}`}>
                  {money(sup.currentPayable)}
                </span>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Payable</p>
              </div>
            </div>
          ))}
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
    </div>
  );
}
