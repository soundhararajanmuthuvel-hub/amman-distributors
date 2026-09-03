import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import {
  Home,
  ShoppingCart,
  Boxes,
  Store,
  MoreHorizontal,
  Route as RouteIcon,
  LogOut,
  Milk,
  Languages,
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
  { to: "/field/visits", label: "Route", icon: <RouteIcon className="size-5" /> },
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
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const isActive = (to: string) =>
    to.endsWith("/admin") || to.endsWith("/field") ? pathname === to : pathname.startsWith(to);

  const signOut = () => {
    logout();
    navigate({ to: "/" });
  };

  // Translate default navigation labels dynamically
  const translatedNav = nav.map((item) => {
    let lbl = item.label;
    if (item.to.endsWith("/admin") || item.to.endsWith("/field")) lbl = t.navHome;
    else if (item.to.includes("sales")) lbl = t.navSales;
    else if (item.to.includes("stock")) lbl = t.navStock;
    else if (item.to.includes("customers")) lbl = t.navCustomers;
    else if (item.to.includes("visits")) lbl = t.navVisits;
    else if (item.to.includes("more")) lbl = t.navMore;
    return { ...item, label: lbl };
  });

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-border">
            <img src="/logo.png" alt="AK Foods Products" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black leading-tight text-foreground">{t.brandName}</p>
            <p className="truncate text-[11px] font-medium text-muted-foreground">{t.brandSubtitle}</p>
          </div>
        </div>

        {/* Language Switcher Button in Sidebar */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={toggleLang}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <span className="flex items-center gap-2">
              <Languages className="size-4 text-primary" />
              <span>{lang === "en" ? "English" : "தமிழ்"}</span>
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {lang === "en" ? "தமிழ்" : "EN"}
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {translatedNav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                isActive(n.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
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
          <LogOut className="size-5" /> {t.signOut}
        </button>
      </aside>

      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white p-0.5 shadow-sm border border-border lg:hidden">
                <img src="/logo.png" alt="AK Logo" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base lg:text-lg font-bold leading-tight text-foreground">{title}</h1>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Header Language Toggle Pill for Mobile & Desktop */}
              <button
                type="button"
                onClick={toggleLang}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition"
                title="Switch Language / மொழியை மாற்றவும்"
              >
                <Languages className="size-3.5 text-primary" />
                <span>{lang === "en" ? "தமிழ்" : "English"}</span>
              </button>
              {right}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-4 lg:pb-10">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg">
            {translatedNav.map((n) => (
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
