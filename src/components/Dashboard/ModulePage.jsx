export default function ModulePage({ title, description, icon }) {
  return (
    <div className="max-w-6xl mx-auto anime-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-surface-900">{title}</h1>
          <p className="text-surface-500 font-medium mt-1">{description}</p>
        </div>
        <button className="rounded-xl bg-primary-600 px-6 py-3 font-bold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
          + Add New
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl border-2 border-dashed border-surface-200 bg-white/50 p-12 text-center">
        <div className="h-20 w-20 rounded-2xl bg-surface-100 flex items-center justify-center text-surface-300 mb-6">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">No {title} Data found</h2>
        <p className="max-w-md text-surface-500 mb-8 leading-relaxed">
          It looks like you haven't added any {title.toLowerCase()} records yet. 
          Start by adding your first entry to generate reports and analytics.
        </p>
        <button className="text-primary-600 font-bold hover:underline">
          View Documentation →
        </button>
      </div>
    </div>
  );
}
