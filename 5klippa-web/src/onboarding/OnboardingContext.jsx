import { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext(null);

export const OnboardingProvider = ({ children }) => {
  const [data, setData] = useState({
    email: '',
    password: '',
    referraCode: '',
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    phone: '',
    address: { line1: '', city: '', state: '', postalCode: '', country: '' },
    employmentStatus: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    borrowerEnabled: true,
    lenderEnabled: true,
    creditDataConsent: false,
    termsAccepted: false,
  });

  const update = (patch) => setData((p) => ({ ...p, ...patch }));
  const updateAddress = (patch) =>
    setData((p) => ({ ...p, address: { ...p.address, ...patch } }));

  return (
    <OnboardingContext.Provider value={{ data, update, updateAddress }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
