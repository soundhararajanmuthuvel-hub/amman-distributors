import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Check } from "lucide-react";
import { useStore, customerOutstanding, money } from "@/lib/store";
import { Card, Btn, Empty, Pill, SectionTitle } from "@/components/kit";

export const Route = createFileRoute("/field/visits")({ component: MyRoute });

function MyRoute() {
  const { state } = useStore();
  const id = state.session?.salesmanId ?? "";
  const shops = state.customers.filter((c) => c.salesmanId === id && c.active);
  const visited = new Set(
    state.sales
      .filter((s) => s.date === state.today && s.salesmanId === id)
      .map((s) => s.customerId),
  );

  return (
    <div className="space-y-4">
      <SectionTitle
        action={<Pill tone="primary">{`${visited.size}/${shops.length} visited`}</Pill>}
      >
        Today's shops
      </SectionTitle>
      {shops.length === 0 ? (
        <Empty title="No shops assigned" sub="Ask the admin to assign shops to your route." />
      ) : (
        <div className="space-y-2">
          {shops.map((c) => {
            const done = visited.has(c.id);
            const due = customerOutstanding(state, c.id);
            return (
              <Card key={c.id} className={done ? "border-success/40 bg-success/5" : ""}>
                <div className="flex items-start gap-3">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                      done ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {done ? <Check className="size-5" /> : <MapPin className="size-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-foreground">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.address}</p>
                    {due > 0 && (
                      <p className="mt-1 text-xs font-semibold text-danger">Due {money(due)}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <a href={`tel:${c.phone}`} className="flex-1">
                    <Btn size="sm" variant="outline" className="w-full">
                      <Phone className="size-4" /> Call
                    </Btn>
                  </a>
                  <Link to="/field/sales" search={{ customerId: c.id }} className="flex-1">
                    <Btn size="sm" className="w-full">
                      {done ? "New bill" : "Bill shop"}
                    </Btn>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
