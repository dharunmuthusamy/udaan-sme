export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="group relative rounded-2xl border border-surface-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300">
      {/* Gradient glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
        {icon}
      </div>

      {/* Content */}
      <h3 className="mt-4 text-lg font-semibold text-surface-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-surface-700/70">{description}</p>

      {/* Learn more link */}
      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Learn more
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
