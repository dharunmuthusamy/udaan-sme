import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { updateUserProfile } from '../../services/dbService';
import { QUESTIONS, calculateResults } from '../../services/assessmentLogic';
import { saveAssessment } from '../../services/assessmentService';

export default function Onboarding() {
  const { user, userData, businessData, logout } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (userData?.role !== 'owner') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-surface-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-surface-200 text-center">
          <div className="mx-auto w-16 h-16 bg-primary-100 text-primary-600 flex items-center justify-center rounded-full mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-4">Waiting for Approval</h2>
          <p className="text-surface-600 mb-6">
            Your request to join the business is currently pending. Please wait for the business owner to review and approve your request.
          </p>
          <button 
            onClick={async () => { await logout(); navigate('/login'); }} 
            className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700 w-full transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Assessment State
  const [assessmentStep, setAssessmentStep] = useState(0); // 0 to QUESTIONS.length - 1
  const [answers, setAnswers] = useState({});
  const currentQuestion = QUESTIONS[assessmentStep];

  // Step 2 & 3: Forms State
  const [productForm, setProductForm] = useState({ name: '', price: '', stockQuantity: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '' });

  // ─── Step Handlers ───
  const handleAssessmentSelect = async (optionIdx) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionIdx };
    setAnswers(newAnswers);

    if (assessmentStep < QUESTIONS.length - 1) {
      setAssessmentStep(assessmentStep + 1);
    } else {
      // Finish assessment
      setLoading(true);
      setError('');
      try {
        const auditRes = calculateResults(newAnswers);
        await saveAssessment(user.uid, businessData.id, {
          answers: newAnswers,
          ...auditRes,
        });
        setStep(2); // Proceed to Product step
      } catch (err) {
         console.error('[Onboarding] Failed to save assessment:', err);
         setError("Failed to save assessment. " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stockQuantity) return;
    setLoading(true);
    setError('');
    try {
      await productService.create(businessData.id, {
        name: productForm.name,
        price: parseFloat(productForm.price),
        stockQuantity: parseInt(productForm.stockQuantity),
        category: 'Services',
        createdBy: user.uid
      });
      setStep(3); // Proceed to Customer step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) return;
    setLoading(true);
    setError('');
    try {
      await customerService.create(businessData.id, {
        name: customerForm.name,
        phone: customerForm.phone,
        createdBy: user.uid
      });
      
      // Mark setup as complete
      await updateUserProfile(user.uid, { setupCompleted: true });
      navigate('/dashboard');
      window.location.reload(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await updateUserProfile(user.uid, { setupCompleted: true });
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!businessData) return null;

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-surface-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 p-8 text-center text-white relative">
            <button 
               onClick={handleSkip}
               className="absolute top-4 right-6 text-primary-100 hover:text-white text-sm font-medium transition-colors"
            >
               Skip Setup
            </button>
            <h1 className="text-2xl font-black mb-2">Welcome to UDAAN-SME!</h1>
            <p className="text-primary-100">Let's get your business up and running in 3 simple steps.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex border-b border-surface-100">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 text-center py-4 text-sm font-bold border-b-2 transition-colors ${step === s ? 'border-primary-600 text-primary-600' : step > s ? 'border-green-500 text-green-500' : 'border-transparent text-surface-300'}`}>
              Step {s}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          {step === 1 && (
             <div className="anime-fade-in">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold text-surface-900">1. SME Digital Readiness</h2>
                   <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">{assessmentStep + 1} of {QUESTIONS.length}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-surface-900 mb-6">{currentQuestion.question}</h3>
                
                {loading ? (
                    <div className="text-center py-10 opacity-50">Saving Assessment...</div>
                ) : (
                    <div className="space-y-4">
                      {currentQuestion.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAssessmentSelect(idx)}
                          className="w-full flex items-center justify-between text-left p-5 rounded-2xl border-2 border-surface-100 bg-surface-50/30 hover:border-primary-500 hover:bg-primary-50/30 transition-all group"
                        >
                          <span className="font-medium text-surface-800 xl:text-sm group-hover:text-primary-700">{opt.label}</span>
                          <div className="h-6 w-6 ml-4 shrink-0 rounded-full border-2 border-surface-200 bg-white group-hover:border-primary-500 flex items-center justify-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary-600 opacity-0 group-active:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                )}
                
                {assessmentStep > 0 && !loading && (
                    <button
                      onClick={() => setAssessmentStep(assessmentStep - 1)}
                      className="mt-6 px-4 py-2 font-medium text-surface-500 hover:text-primary-600 transition-all flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous Question
                    </button>
                )}
             </div>
          )}

          {step === 2 && (
            <form onSubmit={handleProductSubmit} className="space-y-5 anime-fade-in">
              <h2 className="text-xl font-bold text-surface-900 mb-6">2. Add your first Product</h2>
              
              <div>
                <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Product Name</label>
                <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all" placeholder="E.g. Consultation Service" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Price (₹)</label>
                  <input required type="number" min="0" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all" placeholder="500" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Initial Stock</label>
                  <input required type="number" min="1" value={productForm.stockQuantity} onChange={e => setProductForm({...productForm, stockQuantity: e.target.value})} className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all" placeholder="100" />
                </div>
              </div>

              <button disabled={loading} type="submit" className="mt-8 w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all disabled:opacity-50">
                {loading ? 'Saving...' : 'Continue →'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleCustomerSubmit} className="space-y-5 anime-fade-in">
              <h2 className="text-xl font-bold text-surface-900 mb-6">3. Add your first Customer</h2>
              
              <div>
                <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Customer Name</label>
                <input required type="text" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all" placeholder="E.g. Acme Corp" />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase text-surface-400 mb-2 ml-1">Phone Number</label>
                <input required type="tel" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all" placeholder="+91 99999 99999" />
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setStep(2)} className="w-[100px] py-4 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl font-bold transition-all">Back</button>
                <button disabled={loading} type="submit" className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-green-500/30 disabled:opacity-50">
                   {loading ? 'Processing...' : 'Complete Setup & Go to Dashboard 🚀'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
