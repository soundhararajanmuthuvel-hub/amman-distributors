import { createFileRoute } from "@tanstack/react-router";
import { useStore, mainStock, salesmanStock, sumMap, todayTotals, money } from "@/lib/store";
import { Card, Row, Btn, SectionTitle, Stat, useConfirm, StatusPill } from "@/components/kit";

export const Route = createFileRoute("/admin/closing")({ component: DayClosing });

function DayClosing() {
  const { state, set, closeDay } = useStore();
  const { confirm, confirmNode } = useConfirm();
  const m = mainStock(state);
  const t = todayTotals(state);

  const carryForward = () =>
    confirm(
      "Close the day?",
      `Closing stock of ${sumMap(m.available)} units will be carried forward as tomorrow's opening stock.`,
      () =>
        set((s) => {
          const d = new Date(s.today + "T00:00:00");
          d.setDate(d.getDate() + 1);
          const next = d.toISOString().slice(0, 10);
          return { ...s, openingStock: { ...s.openingStock, [next]: mainStock(s).available } };
        }),
      "Close day",
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sales" value={money(t.salesValue)} tone="primary" />
        <Stat label="Collected" value={money(t.collected)} tone="success" />
        <Stat
          label="Pending"
          value={money(t.pending)}
          tone={t.pending > 0 ? "danger" : "success"}
        />
        <Stat label="Closing stock" value={`${sumMap(m.available)} u`} tone="info" />
      </div>

      <SectionTitle>Salesman day closing</SectionTitle>
      <div className="grid gap-3 lg:grid-cols-2">
        {state.salesmen.map((sm) => {
          const att = state.attendance.find(
            (a) => a.salesmanId === sm.id && a.date === state.today,
          );
          const st = salesmanStock(state, sm.id);
          return (
            <Card key={sm.id}>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-bold text-foreground">{sm.name}</p>
                <StatusPill status={att?.status ?? "absent"} />
              </div>
              <Row left="Received" right={`${sumMap(st.received)} u`} />
              <Row left="Sold" right={`${sumMap(st.sold)} u`} />
              <Row left="In hand" right={`${sumMap(st.current)} u`} strong />
              <Btn
                variant="outline"
                className="mt-3 w-full"
                disabled={!att || att.status === "closed"}
                onClick={() =>
                  confirm(
                    "Close salesman day?",
                    `${sm.name}'s day will be marked closed.`,
                    () => closeDay(sm.id),
                    "Close",
                  )
                }
              >
                {att?.status === "closed" ? "Day closed" : "Close salesman day"}
              </Btn>
            </Card>
          );
        })}
      </div>

      <SectionTitle>Main godown closing</SectionTitle>
      <Card>
        {state.products.map((p) => (
          <Row key={p.id} left={p.name} right={`${m.available[p.id] ?? 0} ${p.unit}`} />
        ))}
        <Btn size="lg" className="mt-3 w-full" onClick={carryForward}>
          Close day & carry forward
        </Btn>
      </Card>
      {confirmNode}
    </div>
  );
}
