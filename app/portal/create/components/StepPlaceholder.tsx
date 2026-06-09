export default function StepPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-sm border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      <div className="mt-6 rounded-sm border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        This step has been separated into its own component and is ready for the
        next implementation pass.
      </div>
    </div>
  );
}
