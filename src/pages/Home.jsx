import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import SolutionSection from '../components/SolutionSection';
import PricingSection from '../components/PricingSection';
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v-.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section #home */}
        <HeroSection />

        {/* Problem Section #problem */}
        <ProblemSection />

        {/* Solution Section #solution */}
        <SolutionSection />

        {/* Features Grid #features */}
        <section id="features" className="bg-surface-50 py-24 sm:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-20">
              <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-sm font-bold text-primary-700 mb-6 tracking-wide uppercase">
                Powerful Features
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-surface-900 leading-tight">
                Everything You Need to <span className="text-primary-600">Run Your Business</span>
              </h2>
              <p className="mt-8 text-lg sm:text-xl text-surface-600 font-medium leading-relaxed">
                UDAAN-SME simplifies complex workflows into easy-to-use digital tools for your everyday SME needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Comparison #pricing */}
        <PricingSection />

        {/* CTA Section */}
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
