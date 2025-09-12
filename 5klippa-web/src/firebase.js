import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWHH4e3YVQf-v74GouEDSRuPMBT7ubSYg",
  authDomain: "klippa-24948.firebaseapp.com",
  projectId: "klippa-24948",
  storageBucket: "klippa-24948.firebasestorage.app",
  messagingSenderId: "79385704540",
  appId: "1:79385704540:web:a362f16adf379e82e5ce99"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
