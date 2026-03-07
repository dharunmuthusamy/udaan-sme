import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QUESTIONS, calculateResults } from '../services/assessmentLogic';
import { saveAssessment } from '../services/assessmentService';

export default function Assessment() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0 to QUESTIONS.length - 1
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  function handleSelect(optionIdx) {
    const newAnswers = { ...answers, [currentQuestion.id]: optionIdx };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish(newAnswers);
    }
  }

  async function handleFinish(finalAnswers) {
    setIsSubmitting(true);
    const auditRes = calculateResults(finalAnswers);
    setResult(auditRes);

    if (user) {
      try {
        await saveAssessment(user.uid, userData?.businessId || user.uid, {
          answers: finalAnswers,
          ...auditRes,
        });
      } catch (err) {
        console.error('[Assessment] Failed to save:', err);
      }
    }
    setIsSubmitting(false);
  }

  // 1. Loading / Submitting State
  if (isSubmitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-lg font-medium text-surface-900">Analyzing your business readiness...</p>
        </div>
      </div>
    );
  }

  // 2. Result View
  if (result) {
    return (
      <div className="min-h-screen bg-surface-50 pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-3xl bg-white p-8 shadow-xl border border-surface-200">
            <div className="text-center mb-10">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-600 uppercase tracking-wider mb-3">
                Assessment Complete
              </span>
              <h1 className="text-3xl font-bold text-surface-900">Your Digital Readiness</h1>
              <div className="mt-6 flex flex-col items-center">
                <div className="text-6xl font-black text-primary-600">{result.score}<span className="text-2xl text-surface-400">/15</span></div>
                <div className={`mt-2 text-xl font-bold ${result.categoryColor}`}>{result.category}</div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-lg font-semibold text-surface-900 border-b border-surface-100 pb-3 mb-5">Recommended Modules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.recommendedModules.map((mod) => (
                  <div key={mod.id} className="flex items-start gap-4 p-4 rounded-2xl border border-surface-100 bg-surface-50/50">
                    <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${mod.color.replace('bg-', 'bg-')}`} />
                    <div>
                      <h3 className="font-bold text-surface-900 text-sm">{mod.title}</h3>
                      <p className="text-xs text-surface-700/60 mt-0.5">Prioritize this to digitize your operations.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full rounded-2xl bg-gradient-to-r from-primary-600 to-accent-500 py-4 text-center font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
            >
              Go to Dashboard & Activate Modules
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Questionnaire View
  return (
    <div className="min-h-screen bg-surface-50 pt-24 pb-12">
      <div className="mx-auto max-w-2xl px-4">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-bold text-surface-400 uppercase tracking-widest mb-3">
            <span>Step {step + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-200 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl border border-surface-200">
          <h1 className="text-2xl font-bold text-surface-900 mb-2">SME Digital Readiness</h1>
          <p className="text-surface-700/60 mb-8 border-b border-surface-100 pb-4">
            Helping you understand which digital tools to adopt first.
          </p>

          <h2 className="text-xl font-semibold text-surface-900 mb-6">{currentQuestion.question}</h2>

          <div className="space-y-4">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className="w-full flex items-center justify-between text-left p-5 rounded-2xl border-2 border-surface-100 bg-surface-50/30 hover:border-primary-500 hover:bg-primary-50/30 transition-all group"
              >
                <span className="font-medium text-surface-800 group-hover:text-primary-700">{opt.label}</span>
                <div className="h-6 w-6 rounded-full border-2 border-surface-200 bg-white group-hover:border-primary-500 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary-600 opacity-0 group-active:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between text-sm">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-4 py-2 font-medium text-surface-500 hover:text-primary-600 disabled:opacity-0 transition-all flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
