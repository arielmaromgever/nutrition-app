import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQcHrWW0lI-f8aGHxGdSa7uEwVrcY4Exg",
  authDomain: "nutrition-app-819ce.firebaseapp.com",
  projectId: "nutrition-app-819ce",
  storageBucket: "nutrition-app-819ce.firebasestorage.app",
  messagingSenderId: "500455184886",
  appId: "1:500455184886:web:52559b6bb2b8bc54398fd7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Core Authentication and Database Functions
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const saveUserData = (uid, data) => setDoc(doc(db, "users", uid), data, { merge: true });
export const getUserData = (uid) => getDoc(doc(db, "users", uid)).then(s => s.exists() ? s.data() : null);
