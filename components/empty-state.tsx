export function EmptyState({
  title = "Nada por aqui ainda",
  copy = "Quando houver dados, eles aparecem nesta área."
}: {
  title?: string;
  copy?: string;
}) {
  return (
    <div className="grid place-items-center rounded-[22px] border border-dashed border-border bg-[#111413] px-6 py-12 text-center">
      <div className="text-sm font-medium text-white">{title}</div>
      <p className="mt-1 max-w-sm text-xs text-text-soft">{copy}</p>
    </div>
  );
}
