import { Link } from 'react-router-dom';

export default function AddButton({ to, label, icon }) {
  return (
    <Link 
      to={to}
      className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:scale-95"
    >
      {icon ? (
        <span className="h-5 w-5">{icon}</span>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )}
      {label}
    </Link>
  );
}
