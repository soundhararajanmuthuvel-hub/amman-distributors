import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { useStore, customerOutstanding, money } from "@/lib/store";
import { Card, Input, Empty, Pill } from "@/components/kit";

export const Route = createFileRoute("/admin/customers")({ component: AdminCustomers });

function AdminCustomers() {
  const { state } = useStore();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return state.customers.filter(
      (c) =>
        !t ||
        c.name.toLowerCase().includes(t) ||
        c.owner.toLowerCase().includes(t) ||
        c.phone.includes(t),
    );
  }, [state.customers, q]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search shops"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {list.length === 0 ? (
        <Empty title="No shops found" sub="Try a different search term." />
      ) : (
        <div className="space-y-2">
          {list.map((c) => {
            const due = customerOutstanding(state, c.id);
            return (
              <Link key={c.id} to="/admin/customer/$id" params={{ id: c.id }}>
                <Card className="transition hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold text-foreground">{c.name}</p>
                        <Pill tone="neutral">{c.type}</Pill>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.owner} · {c.phone} · {c.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold tabular-nums ${due > 0 ? "text-danger" : "text-success"}`}
                      >
                        {money(due)}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">outstanding</p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
