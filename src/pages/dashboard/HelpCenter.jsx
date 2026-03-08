import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const tutorials = [
  {
    id: 'invoice',
    titleKey: 'How to Create an Invoice',
    descKey: 'Learn how to generate professional invoices for your customers in seconds.',
    steps: [
      { stepKey: 'Go to Sales & Invoicing from the sidebar', icon: '🧭' },
      { stepKey: 'Click the "New Invoice" button', icon: '➕' },
      { stepKey: 'Select a customer and the invoice date', icon: '👤' },
      { stepKey: 'Add line items by selecting products', icon: '🛒' },
      { stepKey: 'Set tax rate and payment status, then click Save', icon: '✅' },
    ],
    color: 'from-primary-500 to-indigo-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-100',
    textColor: 'text-primary-700',
    iconBg: 'bg-primary-100',
    badgeColor: 'bg-primary-600',
    link: '/dashboard/sales/create',
    linkLabelKey: 'Create Invoice →',
    emoji: '🧾',
    thumbnailColor: 'from-primary-400 to-indigo-600',
  },
  {
    id: 'product',
    titleKey: 'How to Add Products',
    descKey: 'Understand how to manage your product catalog and keep stock information up to date.',
    steps: [
      { stepKey: 'Navigate to Inventory from the sidebar', icon: '📦' },
      { stepKey: 'Click "Add Product" button at the top right', icon: '➕' },
      { stepKey: 'Fill in the product name, SKU, and category', icon: '✏️' },
      { stepKey: 'Set the price and initial stock quantity', icon: '💰' },
      { stepKey: 'Click Save — the product is now in your catalog', icon: '✅' },
    ],
    color: 'from-accent-500 to-teal-600',
    bgColor: 'bg-accent-50',
    borderColor: 'border-accent-100',
    textColor: 'text-accent-700',
    iconBg: 'bg-accent-100',
    badgeColor: 'bg-accent-600',
    link: '/dashboard/inventory/add',
    linkLabelKey: 'Add Product →',
    emoji: '📦',
    thumbnailColor: 'from-accent-400 to-teal-600',
  },
  {
    id: 'inventory',
    titleKey: 'How to Track Inventory',
    descKey: 'Monitor your stock levels, spot low-stock items, and restock efficiently using the Inventory module.',
    steps: [
      { stepKey: 'Go to Inventory from the main sidebar', icon: '🧭' },
      { stepKey: 'Browse your products — low stock is highlighted in red', icon: '🔴' },
      { stepKey: 'Use the search bar or category filters to narrow down items', icon: '🔍' },
      { stepKey: 'Record a purchase to restock a product', icon: '🛍️' },
      { stepKey: 'Export your inventory to CSV for reporting', icon: '📊' },
    ],
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    textColor: 'text-amber-700',
    iconBg: 'bg-amber-100',
    badgeColor: 'bg-amber-500',
    link: '/dashboard/inventory',
    linkLabelKey: 'View Inventory →',
    emoji: '📊',
    thumbnailColor: 'from-amber-400 to-orange-500',
  },
];

const faqs = [
  {
    q: 'What happens when I create an invoice?',
    a: 'Inventory is automatically updated (stock reduced) and the invoice is saved to your records.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes! Sales, Inventory, and CRM pages all have an "Export CSV" button in the top-right area.',
  },
  {
    q: 'How do I add a new customer?',
    a: 'Go to CRM & Customers, click "Add Customer", and fill in the details.',
  },
  {
    q: 'Where can I see low-stock alerts?',
    a: 'The Analytics Overview page and the Inventory page both highlight products with 10 or fewer units with a red badge.',
  },
];

function VideoPlaceholder({ card }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br ${card.thumbnailColor} aspect-video group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fake video overlay with grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Emoji watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-6xl opacity-20 select-none">{card.emoji}</span>
      </div>

      {/* Play button */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 ${hovered ? 'scale-105' : ''}`}>
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 shadow-xl group-hover:bg-white/30 transition-all group-hover:scale-110">
          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span className="mt-3 text-white/80 text-xs font-bold tracking-widest uppercase">Watch Tutorial</span>
      </div>

      {/* Duration badge */}
      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-[10px] font-bold">
        ~2 min
      </div>

      {/* Coming soon tag */}
      <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] font-black uppercase tracking-wider">
        Video Coming Soon
      </div>
    </div>
  );
}

export default function HelpCenter() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-5xl mx-auto anime-fade-in pb-20 space-y-14">

      {/* Header */}
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 text-3xl mb-4">
          🎓
        </div>
        <h1 className="text-4xl font-black text-surface-900 tracking-tight">{t('Help Center')}</h1>
        <p className="mt-3 text-surface-500 font-medium max-w-xl mx-auto leading-relaxed">
          {t('Step-by-step guides to help you get the most out of UDAAN-SME.')}
        </p>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {tutorials.map((card) => (
            <a
              key={card.id}
              href={`#${card.id}`}
              className={`px-4 py-2 ${card.bgColor} ${card.textColor} ${card.borderColor} border rounded-xl text-sm font-bold transition-all hover:shadow-md hover:-translate-y-0.5`}
            >
              {card.emoji} {t(card.titleKey)}
            </a>
          ))}
        </div>
      </div>

      {/* Tutorial Cards */}
      {tutorials.map((card, idx) => (
        <div
          key={card.id}
          id={card.id}
          className="bg-white rounded-[2rem] border border-surface-200 shadow-sm overflow-hidden scroll-mt-24"
        >
          {/* Card header gradient strip */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${card.color}`} />

          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: steps */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white ${card.badgeColor}`}>
                  Tutorial {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              <h2 className="text-2xl font-black text-surface-900 mb-2">{t(card.titleKey)}</h2>
              <p className="text-surface-500 font-medium mb-8 leading-relaxed">{t(card.descKey)}</p>

              <ol className="space-y-4">
                {card.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center text-base`}>
                      {step.icon}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black ${card.textColor} opacity-70`}>Step {i + 1}</span>
                        <div className="flex-1 h-px bg-surface-100" />
                      </div>
                      <p className="text-sm font-bold text-surface-700 mt-0.5">{t(step.stepKey)}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <Link
                to={card.link}
                className={`inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-xl bg-gradient-to-r ${card.color} text-white text-sm font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all`}
              >
                {t(card.linkLabelKey)}
              </Link>
            </div>

            {/* Right: video placeholder */}
            <div className="space-y-4">
              <VideoPlaceholder card={card} />
              <div className={`p-4 ${card.bgColor} border ${card.borderColor} rounded-2xl`}>
                <p className={`text-xs font-bold ${card.textColor} flex items-center gap-2`}>
                  <span>💡</span>
                  {t('Pro Tip')}:&nbsp;
                  <span className="font-medium text-surface-600">
                    {t(`tip_${card.id}`) !== `tip_${card.id}`
                      ? t(`tip_${card.id}`)
                      : card.id === 'invoice'
                      ? t('You can convert a Quotation directly into an Invoice from the Quotations page.')
                      : card.id === 'product'
                      ? t('Use the SKU field to track barcodes or manufacturer codes for easy lookup.')
                      : t('Set a low-stock alert by keeping an eye on products with fewer than 10 units.')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-black text-surface-900 mb-6 flex items-center gap-3">
          <span className="text-2xl">❓</span>
          {t('Frequently Asked Questions')}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-surface-50 transition-colors"
              >
                <span className="font-bold text-surface-900 text-sm">{t(faq.q)}</span>
                <svg
                  className={`w-5 h-5 text-surface-400 flex-shrink-0 ml-4 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40' : 'max-h-0'}`}>
                <p className="px-6 pb-5 text-sm text-surface-500 font-medium leading-relaxed border-t border-surface-100 pt-4">
                  {t(faq.a)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support footer */}
      <div className="bg-gradient-to-br from-surface-900 to-surface-800 rounded-[2rem] p-10 text-white text-center shadow-xl">
        <div className="text-4xl mb-4">🤝</div>
        <h3 className="text-xl font-black mb-2">{t('Still need help?')}</h3>
        <p className="text-white/60 font-medium mb-6 max-w-md mx-auto">
          {t('Our support team is here for you. Reach out any time.')}
        </p>
        <a
          href="mailto:support@udaansme.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-surface-900 rounded-2xl font-bold text-sm hover:bg-primary-50 transition-all hover:-translate-y-0.5 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          support@udaansme.com
        </a>
      </div>

    </div>
  );
}
