import { createFileRoute } from "@tanstack/react-router";
import { useStore, productById, customerName } from "@/lib/store";
import { Card, Empty, SectionTitle, Pill } from "@/components/kit";

export const Route = createFileRoute("/admin/returns")({ component: AdminReturns });

function AdminReturns() {
  const { state } = useStore();
  const rows = state.returns.slice().reverse();

  return (
    <div className="space-y-4">
      <SectionTitle action={<Pill tone="warning">{`${rows.reduce((a, b) => a + b.qty, 0)} units`}</Pill>}>
        Route returns
      </SectionTitle>
      {rows.length === 0 ? (
        <Empty title="No returns recorded" sub="Damaged or unsold stock returned from routes shows here." />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{productById(state, r.productId)?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.date} · {state.salesmen.find((s) => s.id === r.salesmanId)?.name}
                    {r.customerId ? ` · ${customerName(state, r.customerId)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Reason: {r.reason}</p>
                </div>
                <span className="shrink-0 font-bold tabular-nums text-warning">{r.qty} u</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
