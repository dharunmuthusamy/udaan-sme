import HeroSection from '../components/HeroSection';
import FeatureCard from '../components/FeatureCard';
import CTASection from '../components/CTASection';

/* ── SVG icon components ── */
const SalesIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

const InventoryIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const CRMIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const TaskIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const features = [
  {
    icon: <SalesIcon />,
    title: 'Sales & Invoicing',
    description:
      'Create GST-compliant invoices, track payments, and manage your sales pipeline — all from one place.',
  },
  {
    icon: <InventoryIcon />,
    title: 'Inventory Management',
    description:
      'Track stock levels in real-time, get low-stock alerts, and manage purchase orders with ease.',
  },
  {
    icon: <CRMIcon />,
    title: 'CRM & Follow-ups',
    description:
      'Keep customer records organized, schedule follow-ups, and never miss a sales opportunity again.',
  },
  {
    icon: <TaskIcon />,
    title: 'Task Tracking',
    description:
      'Assign tasks to your team, set deadlines, and track progress with a simple Kanban-style board.',
  },
  {
    icon: <AnalyticsIcon />,
    title: 'Analytics Dashboard',
    description:
      'Get instant insights into revenue, expenses, and business health with visual dashboards.',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Problem Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 mb-6">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-surface-900">
              Most SMEs Still Run on Paper & WhatsApp
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-surface-700/70">
              Millions of small businesses track sales in notebooks, manage inventory
              on spreadsheets, and coordinate with customers over WhatsApp. Important
              data gets lost, decisions are based on guesswork, and growth is held back
              by manual processes that don't scale.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { emoji: '📓', label: 'Paper Registers', desc: 'Handwritten records prone to errors and loss' },
              { emoji: '📊', label: 'Scattered Spreadsheets', desc: 'No single source of truth for your business' },
              { emoji: '💬', label: 'WhatsApp Workflows', desc: 'Critical orders and follow-ups buried in chats' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-red-100 bg-red-50/50 p-6 text-center">
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="mt-3 text-base font-semibold text-surface-900">{item.label}</h3>
                <p className="mt-1 text-sm text-surface-700/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-surface-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-600 mb-6">
              The Solution
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-surface-900">
              A Modular Toolkit Built for SMEs
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-surface-700/70">
              UDAAN-SME gives you a suite of simple, connected digital tools.
              Start with just invoicing or inventory, then add more modules as
              your business grows. No complex ERP — just the tools you need, when you need them.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🧩', title: 'Modular', desc: 'Pick only the tools you need. Start small, grow at your pace.' },
              { icon: '⚡', title: 'Simple', desc: 'Designed for non-technical users. If you can use WhatsApp, you can use UDAAN.' },
              { icon: '🇮🇳', title: 'Made for India', desc: 'GST, UPI, multi-language — built for how Indian SMEs actually work.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-green-100 bg-white p-6 text-center shadow-sm">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-3 text-base font-semibold text-surface-900">{item.title}</h3>
                <p className="mt-1 text-sm text-surface-700/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-600 mb-6">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-surface-900">
              Everything You Need to Go Digital
            </h2>
            <p className="mt-4 text-lg text-surface-700/70">
              Five powerful modules designed to replace your paper-based processes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </>
  );
}
