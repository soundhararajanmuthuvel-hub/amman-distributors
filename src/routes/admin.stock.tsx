import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, mainStock, salesmanStock, sumMap } from "@/lib/store";
import { Card, SectionTitle, Segmented, Row, Btn, Stat } from "@/components/kit";

export const Route = createFileRoute("/admin/stock")({ component: AdminStock });

function AdminStock() {
  const { state } = useStore();
  const [tab, setTab] = useState<"main" | "salesman">("main");
  const m = mainStock(state);

  return (
    <div className="space-y-4">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "main", label: "Main godown" },
          { value: "salesman", label: "Salesman" },
        ]}
      />

      {tab === "main" ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Opening" value={`${sumMap(m.opening)} u`} tone="neutral" />
            <Stat label="Purchased" value={`${sumMap(m.incoming)} u`} tone="info" />
            <Stat label="Allocated" value={`${sumMap(m.allocated)} u`} tone="warning" />
            <Stat label="Available" value={`${sumMap(m.available)} u`} tone="success" />
          </div>
          <SectionTitle action={<Link to="/admin/purchase"><Btn size="sm" variant="soft">Purchase</Btn></Link>}>
            Product wise
          </SectionTitle>
          <Card>
            {state.products.map((p) => (
              <Row
                key={p.id}
                left={
                  <span>
                    <span className="font-semibold text-foreground">{p.name}</span>{" "}
                    <span className="text-xs">{p.packSize}</span>
                  </span>
                }
                right={
                  <span className={m.available[p.id] ?? 0 <= 0 ? "text-danger" : ""}>
                    {m.available[p.id] ?? 0} {p.unit}
                  </span>
                }
              />
            ))}
          </Card>
        </>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {state.salesmen.map((sm) => {
            const st = salesmanStock(state, sm.id);
            return (
              <Card key={sm.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-bold text-foreground">{sm.name}</p>
                  <span className="text-sm font-semibold tabular-nums">{sumMap(st.current)} u in hand</span>
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
                {sumMap(st.received) === 0 && <p className="text-sm text-muted-foreground">No stock allocated today.</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
