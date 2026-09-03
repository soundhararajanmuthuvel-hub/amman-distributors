import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Milk, ShieldCheck, ClipboardList, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Btn, Card } from "@/components/kit";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Amman Distributors" },
      {
        name: "description",
        content:
          "Sign in as owner, supervisor or salesman to manage dairy stock, routes, sales, payments and closing stock.",
      },
      { property: "og:title", content: "Sign in — Amman Distributors" },
      {
        property: "og:description",
        content: "Role based login for the Amman Distributors dairy distribution management system.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const { state, login } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("salesman");
  const [salesmanId, setSalesmanId] = useState("s1");

  const go = () => {
    if (role === "salesman") {
      login("salesman", salesmanId);
      navigate({ to: "/field" });
    } else {
      login(role);
      navigate({ to: "/admin" });
    }
  };

  const roles: { value: Role; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: "salesman",
      label: "Salesman",
      desc: "Route, sales & collection",
      icon: <Truck className="size-5" />,
    },
    {
      value: "supervisor",
      label: "Supervisor",
      desc: "Stock & allocation",
      icon: <ClipboardList className="size-5" />,
    },
    {
      value: "admin",
      label: "Owner / Admin",
      desc: "Full control & reports",
      icon: <ShieldCheck className="size-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="flex h-20 w-32 items-center justify-center rounded-2xl bg-white p-2 shadow-card border border-border">
            <img src="/logo.png" alt="AK Foods Products" className="h-full w-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
            Amman Distributors
          </h1>
          <p className="text-sm text-muted-foreground">Dairy Distribution Management System</p>
        </div>

        <Card className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Continue as
          </p>
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                role === r.value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <span
                className={`grid size-10 place-items-center rounded-xl ${
                  role === r.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {r.icon}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-foreground">{r.label}</span>
                <span className="block text-xs text-muted-foreground">{r.desc}</span>
              </span>
            </button>
          ))}

          {role === "salesman" && (
            <div className="rounded-xl bg-muted p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Select salesman
              </p>
              <div className="grid grid-cols-2 gap-2">
                {state.salesmen.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSalesmanId(s.id)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      salesmanId === s.id
                        ? "border-primary bg-card text-primary"
                        : "border-transparent bg-card/60 text-muted-foreground"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Btn size="lg" className="w-full" onClick={go}>
            Sign in
          </Btn>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo workspace with realistic products, routes, shops and history.
        </p>
      </div>
    </div>
  );
}
