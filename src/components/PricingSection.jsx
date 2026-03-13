import React from 'react';
import { Link } from 'react-router-dom';

export default function PricingSection() {
  const plans = [
    {
      name: 'Free Starter',
      price: '₹0',
      description: 'Ideal for small shops and individuals starting their digital journey.',
      features: [
        'Up to 100 Invoices/month',
        'Basic Inventory Tracking',
        'Single User Access',
        'Community Support',
        'UDAAN Branding',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'SME Premium',
      price: '₹499',
      period: '/month',
      description: 'Everything you need to scale your business professionally.',
      features: [
        'Unlimited Invoices',
        'Advanced Analytics',
        'Up to 5 Staff Users',
        'Custom Business Branding',
        'Priority Phone Support',
        'GST Filing Export',
      ],
      cta: 'Upgrade Now',
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="bg-white py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-sm font-bold text-primary-600 mb-6 tracking-wide uppercase">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-surface-900 leading-[1.1]">
            Start Free, <span className="text-accent-500">Scale Effortlessly</span>
          </h2>
          <p className="mt-8 text-lg sm:text-xl leading-relaxed text-surface-600 font-medium">
            Join thousands of SMEs who transformed their business with UDAAN. No hidden charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative rounded-[3rem] p-10 flex flex-col h-full border-2 transition-all hover:scale-[1.02] ${
                plan.popular 
                  ? 'border-primary-500 bg-white shadow-2xl shadow-primary-500/10' 
                  : 'border-surface-200 bg-surface-50/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-surface-900 uppercase tracking-tight">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-surface-900">{plan.price}</span>
                  {plan.period && <span className="text-surface-500 font-bold">{plan.period}</span>}
                </div>
                <p className="mt-4 text-surface-600 font-medium leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-primary-100 text-primary-600' : 'bg-surface-200 text-surface-500'}`}>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-surface-700 font-bold">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to={plan.cta.includes('Upgrade') ? '/signup' : '/signup'}
                className={`w-full py-4 px-6 rounded-2xl text-center font-black text-sm transition-all active:scale-95 ${
                  plan.popular 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700' 
                    : 'bg-surface-900 text-white hover:bg-black'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
