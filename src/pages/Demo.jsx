import { Link } from 'react-router-dom';

export default function Demo() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-surface-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-600 mb-6">
          Demo
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-surface-900">
          Try UDAAN-SME — Free Demo
        </h1>
        <p className="mt-4 text-lg text-surface-700/70 max-w-2xl mx-auto">
          The interactive demo dashboard is being built. Soon you'll be able to
          explore invoicing, inventory, CRM, and more — no signup required.
        </p>
        <div className="mt-10 rounded-2xl border-2 border-dashed border-surface-200 bg-white p-12 text-surface-700/40 text-sm">
          Demo Dashboard will be rendered here
        </div>
        <Link
          to="/"
          className="mt-8 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
