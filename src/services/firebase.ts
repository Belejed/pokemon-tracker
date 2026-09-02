import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDgGPKX3ptOs9ocUPuorJU0QQfj4PUb6v4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pokemon-manager-b4f59.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pokemon-manager-b4f59",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pokemon-manager-b4f59.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "86287237292",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:86287237292:web:5325da646689db9261df09",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5BZFG1G5R6"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
