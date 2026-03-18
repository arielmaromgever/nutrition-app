import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
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
const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  await signInWithRedirect(auth, provider);
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (e) {
    console.error(e);
    return null;
  }
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
