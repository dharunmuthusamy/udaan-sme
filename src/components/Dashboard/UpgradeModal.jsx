import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function UpgradeModal({ isOpen, onClose, message, limitType }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-primary-100"
        >
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
              🚀
            </div>
            
            <h3 className="text-2xl font-black text-surface-900 mb-3 tracking-tight">
              {t('Time to Upgrade!')}
            </h3>
            
            <p className="text-surface-500 font-medium leading-relaxed mb-8 px-4">
              {message || t('You have reached the limit of the Free plan. Upgrade to Premium to unlock unlimited usage and advanced features.')}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  // In a real app, this would redirect to a checkout page
                  alert(t('Checkout page coming soon!'));
                  onClose();
                }}
                className="w-full py-4 rounded-2xl bg-primary-600 text-white font-black shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
              >
                {t('Upgrade Now')} — ₹199/mo
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-surface-50 text-surface-400 font-black hover:bg-surface-100 transition-all active:scale-95"
              >
                {t('Maybe Later')}
              </button>
            </div>
          </div>
          
          <div className="bg-primary-50 py-4 px-8 border-t border-primary-100 italic">
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest text-center">
              {t('Unlock Analytics • Unlimited Invoices • Priority Support')}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
