export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative group max-w-sm w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-11 pr-4 py-3 bg-white border border-surface-200 rounded-2xl text-sm font-bold text-surface-900 placeholder-surface-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all shadow-sm group-hover:border-surface-300"
        placeholder={placeholder}
      />
    </div>
  );
}
