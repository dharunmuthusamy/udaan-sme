import { useLanguage } from '../../context/LanguageContext';

export default function VendorTable({ vendors }) {
  const { t } = useLanguage();
  if (vendors.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-surface-200">
        <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p className="text-surface-500 font-bold">{t('No vendors found.')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-surface-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50/50 border-b border-surface-200">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Vendor Name')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Phone')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-surface-400">{t('Address')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-surface-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{vendor.name}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-surface-600 font-mono text-sm">{vendor.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-surface-500 line-clamp-1">{vendor.address}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
