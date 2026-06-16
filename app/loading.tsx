export default function Loading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-[1700px] gap-5 px-4 py-5 md:px-6 md:py-6">
        <div className="hidden w-[68px] shrink-0 rounded-[28px] border border-border bg-surface lg:block" />
        <div className="min-w-0 flex-1 space-y-6">
          <div className="h-12 animate-pulse rounded-full border border-border bg-surface" />
          <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-surface" />
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-[24px] border border-border bg-surface" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-[28px] border border-border bg-surface" />
        </div>
      </div>
    </div>
  );
}
