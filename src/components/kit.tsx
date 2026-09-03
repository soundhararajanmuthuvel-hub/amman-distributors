import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-card", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}

type Tone = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

const toneBg: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/12 text-danger",
  info: "bg-info/12 text-info",
  neutral: "bg-muted text-muted-foreground",
};

export function Stat({
  label,
  value,
  sub,
  tone = "neutral",
  icon,
  onClick,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "rounded-2xl border border-border bg-card p-3 text-left shadow-card transition",
        onClick && "active:scale-[0.98] hover:border-primary/40",
      )}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className={cn("grid size-7 place-items-center rounded-lg", toneBg[tone])}>
            {icon}
          </span>
        )}
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 text-xl font-bold tabular-nums text-foreground">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </button>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", toneBg[tone])}>
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, Tone> = {
    paid: "success",
    partial: "warning",
    pending: "danger",
    present: "success",
    closed: "info",
    absent: "danger",
  };
  return <Pill tone={map[status] ?? "neutral"}>{status.toUpperCase()}</Pill>;
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "soft" | "outline" | "ghost" | "success" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    soft: "bg-primary/10 text-primary hover:bg-primary/20",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
    ghost: "text-muted-foreground hover:bg-muted",
    success: "bg-success text-success-foreground hover:brightness-105",
    danger: "bg-danger text-danger-foreground hover:brightness-105",
    warning: "bg-warning text-warning-foreground hover:brightness-105",
  };
  const sizes: Record<string, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-14 px-5 text-base",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "h-12 w-full rounded-xl border border-input bg-card px-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, "appearance-none pr-8", props.className)} />;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
            value === o.value ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function QtyStepper({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="size-10 rounded-xl border border-border bg-card text-lg font-bold text-foreground active:scale-95"
      >
        −
      </button>
      <input
        inputMode="numeric"
        value={value === 0 ? "" : String(value)}
        placeholder="0"
        onChange={(e) => {
          const v = Number(e.target.value.replace(/[^0-9.]/g, ""));
          onChange(Number.isFinite(v) ? (max !== undefined ? Math.min(max, v) : v) : 0);
        }}
        className="h-10 w-14 rounded-xl border border-border bg-card text-center text-base font-bold tabular-nums outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        className="size-10 rounded-xl bg-primary text-lg font-bold text-primary-foreground active:scale-95"
      >
        +
      </button>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0" onClick={onClose} role="presentation" />
      <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-3xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
        {footer && <div className="mt-5 flex gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    body: ReactNode;
    onOk?: () => void;
    okLabel?: string;
  }>({ open: false, title: "", body: null });

  const confirm = (title: string, body: ReactNode, onOk: () => void, okLabel = "Confirm") =>
    setState({ open: true, title, body, onOk, okLabel });

  const node = (
    <Modal
      open={state.open}
      onClose={() => setState((s) => ({ ...s, open: false }))}
      title={state.title}
      footer={
        <>
          <Btn
            variant="outline"
            className="flex-1"
            onClick={() => setState((s) => ({ ...s, open: false }))}
          >
            Cancel
          </Btn>
          <Btn
            className="flex-1"
            onClick={() => {
              state.onOk?.();
              setState((s) => ({ ...s, open: false }));
            }}
          >
            {state.okLabel}
          </Btn>
        </>
      }
    >
      <div className="text-sm text-muted-foreground">{state.body}</div>
    </Modal>
  );

  return { confirm, confirmNode: node };
}

export function Empty({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Row({
  left,
  right,
  strong,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-1.5 text-sm",
        strong && "border-t border-border pt-2 text-base font-bold text-foreground",
        className,
      )}
    >
      <span className={cn(!strong && "text-muted-foreground")}>{left}</span>
      <span className="tabular-nums">{right}</span>
    </div>
  );
}
