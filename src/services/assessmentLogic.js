// ─── Assessment Questions & Scoring Logic ───

export const QUESTIONS = [
  {
    id: 'invoicing',
    question: 'How do you currently generate invoices?',
    options: [
      { label: 'Paper invoices', score: 0 },
      { label: 'Excel spreadsheets', score: 2 },
      { label: 'Accounting software', score: 3 },
      { label: 'Fully automated system', score: 3 },
    ],
  },
  {
    id: 'inventory',
    question: 'How do you track inventory?',
    options: [
      { label: 'Not tracked', score: 0 },
      { label: 'Manual notebook', score: 1 },
      { label: 'Excel sheet', score: 2 },
      { label: 'Inventory software', score: 3 },
    ],
  },
  {
    id: 'crm',
    question: 'How do you manage customer follow-ups?',
    options: [
      { label: 'No system', score: 0 },
      { label: 'Phone/WhatsApp reminders', score: 1 },
      { label: 'Excel list', score: 2 },
      { label: 'CRM software', score: 3 },
    ],
  },
  {
    id: 'tasks',
    question: 'How do you manage tasks or production work?',
    options: [
      { label: 'Verbal instructions', score: 0 },
      { label: 'WhatsApp messages', score: 1 },
      { label: 'Task list in spreadsheet', score: 2 },
      { label: 'Digital task system', score: 3 },
    ],
  },
  {
    id: 'analytics',
    question: 'Do you currently analyze sales performance?',
    options: [
      { label: 'No analysis', score: 0 },
      { label: 'Occasional manual review', score: 1 },
      { label: 'Excel reports', score: 2 },
      { label: 'Dashboard analytics', score: 3 },
    ],
  },
];

/**
 * Calculate assessment results based on chosen option indices
 * @param {Object} answers - e.g. { invoicing: 0, inventory: 1, ... }
 */
export function calculateResults(answers) {
  let totalScore = 0;
  const recommendedModules = [];

  // 1. Calculate Score
  QUESTIONS.forEach((q) => {
    const selectedIdx = answers[q.id];
    const option = q.options[selectedIdx];
    totalScore += option.score;

    // 2. Logic-based Recommendations
    if (q.id === 'invoicing' && option.score <= 1) {
      recommendedModules.push({ id: 'sales', title: 'Sales & Invoicing', color: 'bg-emerald-500' });
    }
    if (q.id === 'inventory' && option.score <= 1) {
      recommendedModules.push({ id: 'inventory', title: 'Inventory Management', color: 'bg-blue-500' });
    }
    if (q.id === 'crm' && option.score <= 1) {
      recommendedModules.push({ id: 'crm', title: 'CRM & Follow-ups', color: 'bg-violet-500' });
    }
    if (q.id === 'tasks' && option.score <= 1) {
      recommendedModules.push({ id: 'tasks', title: 'Task Tracking', color: 'bg-amber-500' });
    }
  });

  // Always recommend Analytics if score is low
  if (totalScore < 10) {
    recommendedModules.push({ id: 'analytics', title: 'Analytics Dashboard', color: 'bg-rose-500' });
  }

  // 3. Determine Category
  let category = 'Beginner';
  let color = 'text-red-600';
  if (totalScore >= 11) {
    category = 'Digitally Aware';
    color = 'text-emerald-600';
  } else if (totalScore >= 6) {
    category = 'Emerging';
    color = 'text-amber-600';
  }

  return {
    score: totalScore,
    category,
    categoryColor: color,
    recommendedModules,
  };
}
