export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PREMIUM: 'premium'
};

export const PLAN_LIMITS = {
  [SUBSCRIPTION_PLANS.FREE]: {
    invoicesPerMonth: 50,
    products: 50,
    customers: 100,
    staff: 3
  },
  [SUBSCRIPTION_PLANS.PREMIUM]: {
    invoicesPerMonth: Infinity,
    products: Infinity,
    customers: Infinity,
    staff: Infinity
  }
};

export const PREMIUM_FEATURES = {
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
  AUTOMATION: 'automation',
  SMART_RECOMMENDATIONS: 'recommendations'
};

/**
 * Check if a plan has access to a specific premium feature
 */
export const hasFeatureAccess = (plan, feature) => {
  if (plan === SUBSCRIPTION_PLANS.PREMIUM) return true;
  return false;
};

/**
 * Check if a plan has reached its limit for a specific metric
 */
export const isLimitReached = (plan, metric, currentCount) => {
  const limit = PLAN_LIMITS[plan]?.[metric];
  if (limit === undefined) return false;
  return currentCount >= limit;
};

export const PRICING = {
  MONTHLY: 199,
  YEARLY: 1999
};
