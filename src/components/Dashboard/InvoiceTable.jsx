import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateOnly, formatTimeOnly } from '../../utils/dateUtils';

export default function InvoiceTable({ invoices, loading }) {
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 bg-surface-50 rounded-full flex items-center justify-center text-surface-200 mb-4 text-2xl">📄</div>
        <p className="text-surface-500 font-medium">{t('No invoices found.')} <br/>{t('Start by creating your first invoice.')}</p>
        <Link 
          to="/dashboard/sales/create" 
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-all shadow-md active:scale-95"
        >
          {t('+ Create First Invoice')}
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 lg:mx-0">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-surface-100 bg-surface-50/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Invoice No.')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Customer')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Date')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Time')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Amount')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400">{t('Status')}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-surface-400 text-right">{t('Actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-surface-50/50 transition-colors group">
              <td className="px-6 py-4">
                <span className="font-mono font-bold text-surface-900">INV-{invoice.id.slice(-6).toUpperCase()}</span>
              </td>
              <td className="px-6 py-4 font-medium text-surface-700">{invoice.customerName}</td>
              <td className="px-6 py-4 text-surface-500 text-sm">
                {formatDateOnly(invoice.createdAt || invoice.invoiceDate)}
              </td>
              <td className="px-6 py-4 text-surface-500 text-sm font-mono">
                {formatTimeOnly(invoice.createdAt || invoice.invoiceDate)}
              </td>
              <td className="px-6 py-4 font-bold text-surface-900">₹{invoice.totalAmount.toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                  invoice.status === 'Paid' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${invoice.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  {t(invoice.status)}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Link 
                  to={`/dashboard/sales/${invoice.id}`}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
