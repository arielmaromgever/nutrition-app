import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQcHrWW0lI-f8aGHxGdSa7uEwVrcY4Exg",
  authDomain: "nutrition-app-819ce.firebaseapp.com",
  projectId: "nutrition-app-819ce",
  storageBucket: "nutrition-app-819ce.firebasestorage.app",
  messagingSenderId: "500455184886",
  appId: "1:500455184886:web:52559b6bb2b8bc54398fd7"
};

// אתחול האפליקציה עם בדיקה שהמפתח קיים
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// פונקציות עזר שיוצאות החוצה לקובץ App.jsx
export const loginUser = (email, password) => import("firebase/auth").then(m => m.signInWithEmailAndPassword(auth, email, password));
export const registerUser = (email, password) => import("firebase/auth").then(m => m.createUserWithEmailAndPassword(auth, email, password));
export const logout = () => import("firebase/auth").then(m => m.signOut(auth));
