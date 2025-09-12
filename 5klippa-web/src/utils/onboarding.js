// 5klippa-web/src/utils/onboarding.js
import { doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

/** Linear flow with a terminal state */
export const STEP_ORDER = ['identity', 'contact', 'financial', 'roles', 'done'];

// tiny safe getter
const hasPath = (obj, path) => {
  try {
    const v = path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), obj);
    return v !== undefined && v !== null && String(v).trim().length > 0;
  } catch {
    return false;
  }
};

// normalize any legacy/current values to the canonical set
function normalizeStep(s) {
  if (s === 'complete') return 'done';   // <- important: old data becomes "done"
  return s;
}

/**
 * Decide what the next step should be based on the user doc.
 * 1) Respect onboarding.currentStep when present (including 'done')
 * 2) Otherwise infer from required data
 */
export function nextOnboardingStep(uDoc = {}) {
  const ob = uDoc.onboarding || {};
  const cur = normalizeStep(ob.currentStep);

  // Respect explicit currentStep (including 'done')
  if (typeof cur === 'string' && STEP_ORDER.includes(cur)) {
    return cur;
  }

  // Infer from required data (identity → contact → financial → roles → done)
  if (!(hasPath(uDoc, 'fullName') && hasPath(uDoc, 'idNumber'))) return 'identity';
  if (!(hasPath(uDoc, 'phone') && hasPath(uDoc, 'addressLine1'))) return 'contact';
  if (!hasPath(uDoc, 'bank.accountNumber')) return 'financial';

  // Consent is stored as top-level creditConsent === true
  if (uDoc.creditConsent !== true) return 'roles';

  return 'done';
}

/** Map a step to a concrete route */
export function stepPath(step) {
  switch (step) {
    case 'identity':  return '/onboarding/identity';
    case 'contact':   return '/onboarding/contact';
    case 'financial': return '/onboarding/financial';
    case 'roles':     return '/onboarding/roles';
    case 'done':      return '/onboarding/done'; // change to '/dashboard' if you prefer skipping "done"
    default:          return '/onboarding';      // account shell/first page
  }
}

/**
 * Persist onboarding progress after a step is successfully saved.
 * Pass the step you just completed; next is auto-computed unless you override.
 */
const NEXT_BY_COMPLETED = {
  identity:  'contact',
  contact:   'financial',
  financial: 'roles',
  roles:     'done',
};

export async function markStepComplete(db, uid, justCompleted, explicitNext) {
  const goNext = explicitNext || NEXT_BY_COMPLETED[justCompleted] || 'done';
  await setDoc(
    doc(db, 'users', uid),
    {
      onboarding: {
        currentStep: goNext,
        completed: arrayUnion(justCompleted),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
