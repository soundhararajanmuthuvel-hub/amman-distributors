import { createFileRoute } from "@tanstack/react-router";
import { useStore, salesmanStock, sumMap } from "@/lib/store";
import { Card, Row, Stat, SectionTitle, Empty } from "@/components/kit";

export const Route = createFileRoute("/field/stock")({ component: MyStock });

function MyStock() {
  const { state } = useStore();
  const id = state.session?.salesmanId ?? "";
  const st = salesmanStock(state, id);
  const loaded = state.products.filter((p) => (st.received[p.id] ?? 0) > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Loaded" value={`${sumMap(st.received)} u`} tone="info" />
        <Stat label="Sold" value={`${sumMap(st.sold)} u`} tone="success" />
        <Stat label="In hand" value={`${sumMap(st.current)} u`} tone="primary" />
      </div>

      <SectionTitle>Product wise</SectionTitle>
      {loaded.length === 0 ? (
        <Empty title="No stock loaded today" sub="Ask the supervisor to allocate stock to your route." />
      ) : (
        <Card>
          {loaded.map((p) => (
            <Row
              key={p.id}
              left={p.name}
              right={`${st.received[p.id] ?? 0} loaded · ${st.sold[p.id] ?? 0} sold · ${st.current[p.id] ?? 0} left`}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
