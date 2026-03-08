import { useLanguage } from '../../context/LanguageContext';

export default function PurchaseTable({ purchases }) {
  const { t } = useLanguage();
  if (purchases.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-surface-200">
        <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-surface-500 font-bold">{t('No purchases recorded yet.')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-surface-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50/50 border-b border-surface-200">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Date')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Vendor')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Product')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400 text-right">{t('Quantity')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400 text-right">{t('Price')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400 text-right">{t('Total')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-surface-50/50 transition-colors group">
                <td className="px-6 py-4 text-sm font-bold text-surface-900">
                  {new Date(purchase.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-surface-900">{purchase.vendorName}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-surface-600">{purchase.productName}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="px-3 py-1 bg-surface-100 text-surface-700 rounded-lg text-xs font-black">
                    {purchase.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-bold text-surface-900">₹{Number(purchase.price).toLocaleString()}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-black text-primary-600">₹{(purchase.quantity * purchase.price).toLocaleString()}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
