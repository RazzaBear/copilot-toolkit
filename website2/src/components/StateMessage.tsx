interface StateMessageProps {
  title: string;
  detail?: string;
}

export function StateMessage({ title, detail }: StateMessageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        {detail ? <p className="mt-2 text-sm text-muted">{detail}</p> : null}
      </div>
    </div>
  );
}
