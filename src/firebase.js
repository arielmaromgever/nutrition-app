import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQcHrWW0lI-f8aGHxGdSa7uEwVrcY4Exg",
  authDomain: "nutrition-app-819ce.firebaseapp.com",
  projectId: "nutrition-app-819ce",
  storageBucket: "nutrition-app-819ce.firebasestorage.app",
  messagingSenderId: "500455184886",
  appId: "1:500455184886:web:52559b6bb2b8bc54398fd7",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function registerUser(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function loginUser(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function logout() {
  await signOut(auth);
}

export async function saveUserData(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function loadUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}
