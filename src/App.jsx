import React, { useState, useEffect } from 'react';
import { auth, registerUser, loginUser, logout, saveUserData, loadUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// הוספת Tailwind דרך הקוד (למקרה שאין קובץ index.html נגיש)
const tailwindCDN = document.createElement("script");
tailwindCDN.src = "https://cdn.tailwindcss.com";
document.head.appendChild(tailwindCDN);

const TRANSLATIONS = {
  he: {
    title: "מנתח תזונה AI",
    subtitle: "הרשמה קלה כדי להתחיל לעקוב",
    email: "אימייל",
    password: "סיסמה",
    signIn: "התחבר",
    signUp: "הרשם",
    logout: "התנתק",
    analyze: "נתח ארוחה",
    diary: "יומן שבועי",
    addFood: "מה אכלת היום? (למשל: חזה עוף ואורז)",
    apiError: "שגיאת חיבור (API Key). נא לבדוק את firebase.js.",
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const t = TRANSLATIONS.he;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u && auth.config.apiKey === "") { // בדיקה פשוטה אם ה-Key חסר
          setErrorMessage(t.apiError);
      } else {
          setErrorMessage(null);
      }
    });
    return unsub;
  }, [t.apiError]);

  const handleAuth = async (type) => {
    if (!email || !password) return alert("נא למלא אימייל וסיסמה");
    if (errorMessage) return alert(errorMessage); // מונע ניסיון התחברות אם יש שגיאת API

    try {
      setLoading(true);
      if (type === 'login') await loginUser(email, password);
      else await registerUser(email, password);
    } catch (err) {
      alert("שגיאה: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (errorMessage) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center rtl p-6" dir="rtl">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">{errorMessage}</h1>
                  <p className="text-slate-600">ודא שהעתקת את ה-apiKey הנכון ב-firebase.js ב-GitHub.</p>
              </div>
          </div>
      );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center rtl p-6" dir="rtl">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center">
          
          {/* לוגו / כותרת */}
          <div className="mb-10 text-center">
              <div className="text-5xl mb-3">🥗</div>
              <h1 className="text-3xl font-extrabold text-blue-600">{t.title}</h1>
              <p className="text-slate-500 mt-2">{t.subtitle}</p>
          </div>

          <div className="space-y-5 w-full">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
                <input 
                  type="email" 
                  placeholder="name@email.com" 
                  className="w-full p-4 rounded-xl bg-slate-100 border border-slate-200 focus:ring-2 ring-blue-500 outline-none text-right"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.password}</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full p-4 rounded-xl bg-slate-100 border border-slate-200 focus:ring-2 ring-blue-500 outline-none text-right"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button onClick={() => handleAuth('login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold transition text-lg shadow-lg shadow-blue-200">
              {t.signIn}
            </button>
            <button onClick={() => handleAuth('signup')} className="w-full border border-slate-300 hover:bg-slate-100 text-slate-700 p-4 rounded-xl font-bold transition">
              {t.signUp}
            </button>
          </div>
          
        </div>
      </div>
    );
  }

  // מסך האפליקציה (גם הוא יהפוך לבהיר)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 rtl" dir="rtl">
      <header className="p-5 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">{t.title}</h1>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <button onClick={logout} className="text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl">
          {t.logout}
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 mt-8 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-slate-800">{t.analyze}</h2>
          <textarea 
            className="w-full p-4 bg-slate-100 rounded-2xl focus:ring-2 ring-blue-500 outline-none text-right"
            placeholder={t.addFood} rows="3"
          ></textarea>
          <button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 text-lg transition">
            {t.analyze}
          </button>
        </div>
      </main>
    </div>
  );
}
