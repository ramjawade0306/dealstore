import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Using verified valid key directly to bypass env loading issues
  apiKey: "AIzaSyAoKdNiEFTau5gcBGi7_Atl2WzLJdnE_mg",
  authDomain: "project-amitesh-fab36.firebaseapp.com",
  projectId: "project-amitesh-fab36",
  storageBucket: "project-amitesh-fab36.firebasestorage.app",
  messagingSenderId: "373692702405",
  appId: "1:373692702405:web:70a16b8c0948c80b2b1aac"
};

console.log('Firebase Init - Project ID:', firebaseConfig.projectId);
console.log('Firebase Init - Using verified key logic');

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
export default app;
