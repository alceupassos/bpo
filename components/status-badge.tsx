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
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        tone === "neutral" && "bg-surface-muted text-text-soft",
        tone === "success" && "bg-icon-green-bg text-success",
        tone === "warning" && "bg-icon-orange-bg text-warning",
        tone === "danger" && "bg-icon-red-bg text-danger",
        tone === "info" && "bg-icon-blue-bg text-accent"
      )}
    >
      {label}
    </span>
  );
}
