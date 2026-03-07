export default function StatCard({ title, value, label, icon, trend, trendColor = 'text-emerald-500' }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:scale-110 transition-transform`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        {trend && (
          <span className={`text-xs font-bold uppercase tracking-wider ${trendColor}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-surface-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-black text-surface-900 mt-1">{value}</h3>
        {label && <p className="text-xs text-surface-400 mt-2 font-medium">{label}</p>}
      </div>
    </div>
  );
}
