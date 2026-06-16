import clsx from "clsx";

export function StatusBadge({
  label,
  tone = "neutral"
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        tone === "neutral" && "border-border bg-surface-muted text-text-soft",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-success",
        tone === "warning" && "border-amber-200 bg-amber-50 text-warning",
        tone === "danger" && "border-rose-200 bg-rose-50 text-danger",
        tone === "info" && "border-blue-200 bg-blue-50 text-accent"
      )}
    >
      {label}
    </span>
  );
}
