import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { orderService } from '../../services/orderService';
import BackButton from '../../components/Common/BackButton';

export default function OrderDetail() {
  const { orderId } = useParams();
  const { businessData } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (businessData?.id && orderId) {
      loadOrder();
    }
  }, [businessData, orderId]);

  async function loadOrder() {
    try {
      const data = await orderService.getById(orderId);
      setOrder(data);
    } catch (err) {
      console.error('[OrderDetail] Load error:', err);
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateInvoice = () => {
    navigate(`/dashboard/sales/create?orderId=${orderId}`);
  };

  if (loading) return <div className="p-12 text-center animate-pulse">{t('Loading...')}</div>;
  if (!order) return <div className="p-12 text-center text-red-500 font-bold">{t('Order not found.')}</div>;

  return (
    <div className="max-w-4xl mx-auto anime-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Order Details')}</h1>
            <p className="text-surface-500 font-mono text-sm">ORD-{orderId.slice(-6).toUpperCase()}</p>
          </div>
        </div>
        
        {order.status !== 'Completed' && (
          <button
            onClick={handleGenerateInvoice}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            {t('Generate Invoice')}
          </button>
        )}

        {order.invoiceId && (
          <Link
            to={`/dashboard/sales/${order.invoiceId}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            {t('View Invoice')}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-surface-200 p-8 shadow-sm">
            <h2 className="font-bold text-surface-900 mb-6 flex items-center gap-2">{t('Client Information')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-black uppercase text-surface-400 mb-1">{t('Customer Name')}</p>
                <p className="font-bold text-surface-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-surface-400 mb-1">{t('Order Date')}</p>
                <p className="font-bold text-surface-900">
                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-surface-200 p-8 shadow-sm">
            <h2 className="font-bold text-surface-900 mb-6 flex items-center gap-2">{t('Items')}</h2>
            <div className="space-y-4">
              {order.products.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-surface-50 rounded-2xl border border-surface-100">
                  <div>
                    <p className="font-bold text-surface-900">{item.name}</p>
                    <p className="text-xs text-surface-500">{item.quantity} x ₹{item.unitPrice.toLocaleString()}</p>
                  </div>
                  <p className="font-black text-surface-900">₹{item.subtotal.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-900 rounded-[2rem] p-8 text-white shadow-xl">
            <h2 className="font-bold text-lg mb-6 border-b border-white/10 pb-4">{t('Order Summary')}</h2>
            <div className="space-y-4 text-sm font-bold">
              <div className="flex justify-between items-center opacity-60">
                <span>{t('Total Amount')}</span>
                <span className="text-xl font-black text-primary-400">₹{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center opacity-60">
                <span>{t('Status')}</span>
                <span className={`px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider ${
                  order.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {order.status}
                </span>
              </div>
              {order.quotationId && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] opacity-40 uppercase mb-1">{t('Source Quotation')}</p>
                  <Link 
                    to={`/dashboard/sales/quotations/${order.quotationId}`}
                    className="text-xs font-mono text-primary-300 hover:underline"
                  >
                    QTN-{order.quotationId.slice(-6).toUpperCase()}
                  </Link>
                </div>
              )}
              {order.invoiceId && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] opacity-40 uppercase mb-1">{t('Generated Invoice')}</p>
                  <Link 
                    to={`/dashboard/sales/${order.invoiceId}`}
                    className="text-xs font-mono text-emerald-400 hover:underline"
                  >
                    INV-{order.invoiceId.slice(-6).toUpperCase()}
                  </Link>
                </div>
              )}
            </div>

            {error && <p className="mt-6 text-red-400 text-xs font-bold animate-shake">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
