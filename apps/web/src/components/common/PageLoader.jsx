export default function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}
