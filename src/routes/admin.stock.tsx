import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, mainStock, salesmanStock, sumMap, money, totalStockValue } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { Card, SectionTitle, Segmented, Row, Btn, Stat } from "@/components/kit";
import { AlertTriangle, PackagePlus, ArrowDownRight, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/stock")({ component: AdminStock });

function AdminStock() {
  const { state } = useStore();
  const { t, lang } = useLang();
  const [tab, setTab] = useState<"main" | "salesman">("main");
  const m = mainStock(state);
  const totalVal = totalStockValue(state);

  return (
    <div className="space-y-4">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "main", label: t.mainGodown },
          { value: "salesman", label: t.salesman },
        ]}
      />

      {tab === "main" ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label={t.openingStock} value={`${sumMap(m.opening)} ${t.units}`} tone="neutral" />
            <Stat label={t.purchasedToday} value={`${sumMap(m.incoming)} ${t.units}`} tone="info" />
            <Stat label={t.allocatedToday} value={`${sumMap(m.allocated)} ${t.units}`} tone="warning" />
            <Stat label={t.godownAvailable} value={`${sumMap(m.available)} ${t.units}`} tone="success" />
          </div>

          <Card className="flex flex-col gap-2 bg-primary/5 sm:flex-row sm:items-center sm:justify-between border-primary/20">
            <div>
              <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">
                {lang === "ta" ? "மொத்த சரக்கு மதிப்பு (கொள்முதல் விலை அடிப்படையில்)" : "Total Stock Valuation (Purchase Value)"}
              </p>
              <p className="2xl font-black text-foreground text-2xl">{money(totalVal)}</p>
            </div>
            <Link to="/admin/purchase">
              <Btn size="md" className="gap-2">
                <PackagePlus className="size-4" />
                {t.newPurchaseBill}
              </Btn>
            </Link>
          </Card>

          <SectionTitle>{t.productStockDetails}</SectionTitle>

          <div className="space-y-2">
            {state.products.map((p) => {
              const availableQty = m.available[p.id] ?? 0;
              const minLevel = p.minStock ?? 10;
              const isLowStock = availableQty <= minLevel;
              const purchaseRate = p.currentPurchasePrice ?? p.rate;
              const productStockVal = availableQty * purchaseRate;
              const sup = state.suppliers.find((s) => s.id === p.supplierId);

              return (
                <Card key={p.id} className={`space-y-2 ${isLowStock ? "border-danger/30 bg-danger/5" : ""}`}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{p.name}</span>
                        {p.sku && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                            {p.sku}
                          </span>
                        )}
                        {isLowStock && (
                          <span className="flex items-center gap-1 rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-bold text-danger">
                            <AlertTriangle className="size-3" /> Low Stock
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.category} · {p.packSize} · Supplier: <span className="font-medium text-foreground">{sup?.name || "Standard"}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className={`text-base font-black tabular-nums ${isLowStock ? "text-danger" : "text-foreground"}`}>
                        {availableQty} {p.unit}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Stock Value: <strong className="text-foreground">{money(productStockVal)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted/40 p-2 text-center text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Opening</span>
                      <span className="font-bold text-foreground">{m.opening[p.id] ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Purchased</span>
                      <span className="font-bold text-info">+{m.incoming[p.id] ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Allocated</span>
                      <span className="font-bold text-warning">-{m.allocated[p.id] ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Min Level</span>
                      <span className="font-bold text-muted-foreground">{minLevel}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {state.salesmen.map((sm) => {
            const st = salesmanStock(state, sm.id);
            return (
              <Card key={sm.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-bold text-foreground">{sm.name}</p>
                  <span className="text-sm font-semibold tabular-nums">
                    {sumMap(st.current)} u in hand
                  </span>
                </div>
                {state.products
                  .filter((p) => (st.received[p.id] ?? 0) > 0)
                  .map((p) => (
                    <Row
                      key={p.id}
                      left={p.name}
                      right={`${st.received[p.id] ?? 0} → sold ${st.sold[p.id] ?? 0} · left ${st.current[p.id] ?? 0}`}
                    />
                  ))}
                {sumMap(st.received) === 0 && (
                  <p className="text-sm text-muted-foreground">No stock allocated today.</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
