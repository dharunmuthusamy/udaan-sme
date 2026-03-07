import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 py-20 sm:py-28">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Ready to Transform Your Business?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100/80">
          Join hundreds of SMEs who are already simplifying their operations
          with UDAAN-SME. Start with a free demo — no credit card, no commitment.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/demo"
            id="cta-start-demo"
            className="inline-flex items-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary-700 shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            Start Free Demo
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            to="/assessment"
            className="inline-flex items-center rounded-xl border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white backdrop-blur hover:bg-white/10 transition-all"
          >
            Take SME Assessment
          </Link>
        </div>
      </div>
    </section>
  );
}
