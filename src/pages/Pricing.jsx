import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-surface-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-600 mb-6">
          Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-surface-900">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-lg text-surface-700/70 max-w-2xl mx-auto">
          Plans designed for businesses of every size. Pricing details will be
          available soon — start with our free demo in the meantime.
        </p>
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
