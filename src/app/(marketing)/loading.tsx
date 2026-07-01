export default function MarketingLoading() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-emerald-500 border-t-transparent" />
      <p className="mt-4 text-sm text-slate-500">Loading...</p>
    </div>
  );
}
