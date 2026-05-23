interface PageHeaderProps {
  title: string;
  description: string;
  count?: number;
}

export function PageHeader({ title, description, count }: PageHeaderProps) {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-normal text-ink">
              {title}
            </h1>
            <p className="mt-3 text-base leading-7 text-muted">
              {description}
            </p>
          </div>
          {typeof count === "number" ? (
            <div className="border border-lineStrong bg-accentSoft px-4 py-3 text-right">
              <div className="font-mono text-2xl font-semibold text-accentHover">
                {count}
              </div>
              <div className="text-xs uppercase text-muted">items</div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
