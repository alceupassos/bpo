export default function Loading() {
  return (
    <div className="min-h-screen bg-bg p-5 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1700px] gap-6 rounded-[46px] border border-[#1d241f] bg-[#0a0d0a] p-6 lg:grid-cols-[104px_minmax(0,1fr)]">
        <div className="hidden rounded-[28px] border border-border bg-[#111413] lg:block" />
        <div className="space-y-6">
          <div className="h-16 animate-pulse rounded-[28px] border border-border bg-[#111413]" />
          <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-[#111413]" />
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-[24px] border border-border bg-[#111413]" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-[24px] border border-border bg-[#111413]" />
        </div>
      </div>
    </div>
  );
}
