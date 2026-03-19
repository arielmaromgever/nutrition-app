import React, { useState, useEffect } from 'react';
import { auth, registerUser, loginUser, logout } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const TRANSLATIONS = {
  he: {
    title: "מנתח תזונה AI",
    subtitle: "מעקב קלוריות וחלבון עם בינה מלאכותית",
    email: "אימייל",
    password: "סיסמה",
    signIn: "התחבר",
    signUp: "הרשם",
    logout: "התנתק",
    analyze: "נתח ארוחה",
    diary: "יומן שבועי",
    addFood: "מה אכלת היום? (למשל: חזה עוף ואורז)",
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  const handleAuth = async (type) => {
    if (!email || !password) return alert("נא למלא אימייל וסיסמה");
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

  const t = TRANSLATIONS.he;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center" dir="rtl">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
          <h1 className="text-3xl font-bold mb-2 text-blue-400 text-center">{t.title}</h1>
          <p className="text-slate-400 mb-8 text-center">{t.subtitle}</p>
          <div className="space-y-4">
            <input 
              type="email" placeholder={t.email} 
              className="w-full p-4 rounded-xl bg-slate-700 border border-slate-600 focus:ring-2 ring-blue-500 outline-none text-right"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder={t.password} 
              className="w-full p-4 rounded-xl bg-slate-700 border border-slate-600 focus:ring-2 ring-blue-500 outline-none text-right"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => handleAuth('login')} className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-bold transition">
              {loading ? "טוען..." : t.signIn}
            </button>
            <button onClick={() => handleAuth('signup')} className="w-full border border-slate-600 hover:bg-slate-700 p-4 rounded-xl font-bold transition">
              {t.signUp}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24" dir="rtl">
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center sticky top-0 z-50">
        <div className="text-right">
          <h1 className="text-xl font-bold text-blue-400">{t.title}</h1>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <button onClick={logout} className="text-sm text-red-400 bg-red-400/10 px-3 py-1 rounded-lg">
          {t.logout}
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 text-right">
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4">{t.analyze}</h2>
          <textarea 
            className="w-full p-4 bg-slate-700 rounded-2xl focus:ring-2 ring-blue-500 outline-none text-right"
            placeholder={t.addFood} rows="3"
          ></textarea>
          <button className="w-full mt-4 bg-blue-600 p-4 rounded-2xl font-bold shadow-lg shadow-blue-900/40">
            {t.analyze}
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-md border-t border-slate-700 flex justify-around p-4">
        <button className="flex flex-col items-center text-blue-400">
          <span className="text-xs font-bold">{t.analyze}</span>
        </button>
        <button className="flex flex-col items-center text-slate-500">
          <span className="text-xs font-bold">{t.diary}</span>
        </button>
      </nav>
    </div>
  );
}
