import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateOnly, formatTimeOnly } from '../../utils/dateUtils';

export default function QuotationTable({ quotations, loading }) {
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 bg-surface-50 rounded-full flex items-center justify-center text-surface-200 mb-4 text-2xl">📄</div>
        <p className="text-surface-500 font-medium">{t('No quotations found.')} <br/>{t('Start by creating your first quotation.')}</p>
        <Link 
          to="/dashboard/sales/create-quotation" 
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-md active:scale-95"
        >
          {t('+ Create First Quotation')}
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 lg:mx-0">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-surface-100 bg-surface-50/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Quotation No.')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Customer')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Date')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Time')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Amount')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Status')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400 text-right">{t('Actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {quotations.map((quotation) => (
            <tr key={quotation.id} className="hover:bg-surface-50/50 transition-colors group">
              <td className="px-6 py-4">
                <span className="font-mono font-bold text-surface-900">QTN-{quotation.id.slice(-6).toUpperCase()}</span>
              </td>
              <td className="px-6 py-4 font-medium text-surface-700">{quotation.customerName}</td>
              <td className="px-6 py-4 text-surface-500 text-sm">
                {formatDateOnly(quotation.createdAt || quotation.date)}
              </td>
              <td className="px-6 py-4 text-surface-500 text-sm font-mono">
                {formatTimeOnly(quotation.createdAt || quotation.date)}
              </td>
              <td className="px-6 py-4 font-bold text-surface-900">₹{quotation.totalAmount.toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                  quotation.status === 'Draft' 
                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${quotation.status === 'Draft' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                  {t(quotation.status)}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Link 
                  to={`/dashboard/sales/quotations/${quotation.id}`}
                  className="text-primary-600 font-bold text-xs hover:underline"
                >
                  {t('View')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
