import React from 'react';

export default function SolutionSection() {
  const modules = [
    { title: 'Sales Management', desc: 'GST-compliant invoices and order tracking.', icon: '💰' },
    { title: 'Inventory Tracking', desc: 'Real-time stock levels and low-stock alerts.', icon: '📦' },
    { title: 'CRM & Follow-ups', desc: 'Customer history and automated reminders.', icon: '🤝' },
    { title: 'Staff Dashboard', desc: 'Assign tasks and track team performance.', icon: '👥' },
    { title: 'Business Analytics', desc: 'Visual insights into profit and cashflow.', icon: '📈' },
    { title: 'Cloud Sync', desc: 'Access your business from any device, anywhere.', icon: '☁️' },
  ];

  return (
    <section id="solution" className="bg-surface-50 py-24 sm:py-32 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary-200/20 blur-[120px] rounded-full" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-600 mb-6 tracking-wide uppercase">
            The Solution
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-surface-900 leading-[1.1]">
            A Unified Digital Toolkit <span className="text-primary-600">Built for Growth</span>
          </h2>
          <p className="mt-8 text-lg sm:text-xl leading-relaxed text-surface-600 font-medium">
            Trade complexity for clarity. UDAAN-SME gives you the power of an ERP with the simplicity of a mobile app.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((item) => (
            <div 
              key={item.title} 
              className="bg-white rounded-[2rem] p-8 border border-surface-200/50 shadow-sm transition-all hover:shadow-xl hover:shadow-primary-500/5 hover:border-primary-100 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-surface-50 flex items-center justify-center text-2xl group-hover:bg-primary-50 group-hover:scale-110 transition-all">
                {item.icon}
              </div>
              <h3 className="mt-6 text-xl font-bold text-surface-900">{item.title}</h3>
              <p className="mt-3 text-base text-surface-600 font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
