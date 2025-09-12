// src/onboarding/getNextStep.js

/**
 * Decide where a signed-in user should land inside /onboarding.
 * Adjust field names here if your user doc changes.
 */
export function getNextOnboardingStep(uDoc) {
  const doc = uDoc || {};

  const has = (v) => v !== undefined && v !== null && String(v).trim().length > 0;

  // REQUIRED fields (keep in sync with your dashboard completeness)
  const needIdentity = !has(doc.fullName) || !has(doc.idNumber);
  if (needIdentity) return 'identity';

  const needContact =
    !has(doc.phone) ||
    !has(doc.addressLine1); // change if you store address differently
  if (needContact) return 'contact';

  const needFinancial =
    !doc.bank || !has(doc.bank.accountNumber); // bank as nested object
  if (needFinancial) return 'financial';

  // Optional/Consent
  if (doc.creditConsent !== true) return 'roles';

  return 'done';
}
