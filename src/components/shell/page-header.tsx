export function PageHeader({
  section,
  title,
  description,
  children,
}: {
  section: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-[#262A36] pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6366F1]">{section}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#E6E8EF] md:text-[1.75rem]">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#8B91A7]">{description}</p>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function StatGrid({
  items,
}: {
  items: { label: string; value: string; hint?: string }[];
}) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="rounded-xl border border-[#262A36] bg-[#1A1D27] px-4 py-4">
          <p className="text-xs font-medium tracking-wide text-[#8B91A7] uppercase">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#E6E8EF] tabular-nums">{item.value}</p>
          {item.hint ? <p className="mt-1 text-xs text-[#8B91A7]">{item.hint}</p> : null}
        </article>
      ))}
    </div>
  );
}

export function RecordCount({ count }: { count: number }) {
  const label = count === 1 ? "1 registro encontrado" : `${count} registros encontrados`;
  return <p className="mt-3 text-sm text-[#8B91A7]">{label}</p>;
}

export const headClass =
  "h-9 px-3 text-[11px] font-semibold tracking-[0.14em] text-[#8B91A7] uppercase";
export const cellClass = "px-3 py-3 text-[#E6E8EF]";
