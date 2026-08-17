import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  Home,
  ShoppingCart,
  Boxes,
  Store,
  MoreHorizontal,
  Route as RouteIcon,
  LogOut,
  Milk,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Home", icon: <Home className="size-5" /> },
  { to: "/admin/sales", label: "Sales", icon: <ShoppingCart className="size-5" /> },
  { to: "/admin/stock", label: "Stock", icon: <Boxes className="size-5" /> },
  { to: "/admin/customers", label: "Customers", icon: <Store className="size-5" /> },
  { to: "/admin/more", label: "More", icon: <MoreHorizontal className="size-5" /> },
];

export const fieldNav: NavItem[] = [
  { to: "/field", label: "Home", icon: <Home className="size-5" /> },
  { to: "/field/route", label: "Route", icon: <RouteIcon className="size-5" /> },
  { to: "/field/sales", label: "Sales", icon: <ShoppingCart className="size-5" /> },
  { to: "/field/stock", label: "Stock", icon: <Boxes className="size-5" /> },
  { to: "/field/more", label: "More", icon: <MoreHorizontal className="size-5" /> },
];

export function AppShell({
  nav,
  title,
  subtitle,
  right,
  children,
}: {
  nav: NavItem[];
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout } = useStore();
  const navigate = useNavigate();

  const isActive = (to: string) => (to.endsWith("/admin") || to.endsWith("/field") ? pathname === to : pathname.startsWith(to));

  const signOut = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Milk className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight text-foreground">Amrith Dairy</p>
            <p className="text-xs text-muted-foreground">Distribution System</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive(n.to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {n.icon}
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          <LogOut className="size-5" /> Sign out
        </button>
      </aside>

      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold leading-tight text-foreground">{title}</h1>
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">{right}</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-4 lg:pb-10">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition",
                  isActive(n.to) ? "text-primary" : "text-muted-foreground",
                )}
              >
                {n.icon}
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
