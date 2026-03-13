import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-surface-950 via-primary-950 to-surface-900 pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-500/10 px-4 py-1.5 mb-8">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-primary-200">Now in Early Access</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Digitize Your SME Operations
          <br />
          <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Without Complexity
          </span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-200/80 leading-relaxed">
          UDAAN-SME helps small and medium businesses move from paper registers,
          scattered spreadsheets, and WhatsApp-based workflows to a simple,
          unified digital toolkit — one module at a time.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            id="hero-cta-get-started"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            Get Started
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center rounded-xl border border-surface-200/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur hover:bg-white/10 transition-all"
          >
            Explore Features
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-surface-200/50">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            5-minute setup
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Built for Indian SMEs
          </span>
        </div>
      </div>
    </section>
  );
}
