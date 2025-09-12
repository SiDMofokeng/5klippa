// src/onboarding/steps/DoneStep.jsx
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

// ... inside your component, when user confirms finish:
const navigate = useNavigate();

async function finishOnboarding(collectedData) {
  const user = auth.currentUser;
  await setDoc(
    doc(db, 'users', user.uid),
    { ...collectedData, profileComplete: true },
    { merge: true }
  );
  navigate('/dashboard');
}
