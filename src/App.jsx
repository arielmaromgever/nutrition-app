import React, { useState, useEffect } from 'react';
import { auth, login, register, logout, saveUserData, getUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// CSS Force White Theme
const injectPureWhiteTheme = () => {
  if (document.getElementById('pure-white-theme')) return;
  const style = document.createElement('style');
  style.id = 'pure-white-theme';
  style.textContent = `
    @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
    body, html, #root { background-color: #ffffff !important; margin: 0; padding: 0; min-height: 100vh; }
    input, select { background-color: #ffffff !important; border: 2px solid #f3f4f6 !important; }
    .bright-card { background-color: #ffffff; border: 1px solid #f9fafb; box-shadow: 0 10px 50px rgba(0,0,0,0.03); }
  `;
  document.head.appendChild(style);
};

const TRANSLATIONS = {
  en: {
    welcome: "Nutrition AI",
    email: "Email",
    pass: "Password",
    login: "Log In",
    signup: "Register",
    lang: "עברית",
    weight: "Weight (kg)",
    height: "Height (cm)",
    age: "Age",
    goal: "Target Goal",
    muscle: "Gain Muscle",
    lose: "Lose Weight",
    maintain: "Maintenance",
    calc: "Calculate & Sync",
    cals: "Calories",
    pro: "Protein",
    logout: "Log Out"
  },
  he: {
    welcome: "מנתח תזונה AI",
    email: "אימייל",
    pass: "סיסמה",
    login: "התחברות",
    signup: "הרשמה",
    lang: "English",
    weight: "משקל (ק״ג)",
    height: "גובה (ס״מ)",
    age: "גיל",
    goal: "מטרה",
    muscle: "בניית שריר",
    lose: "ירידה במשקל",
    maintain: "שמירה על הקיים",
    calc: "חשב וסנכרן תוכנית",
    cals: "קלוריות",
    pro: "חלבון",
    logout: "התנתק"
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState({ weight: '', height: '', age: '', goal: 'maintain' });
  const [targets, setTargets] = useState(null);

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'he';

  useEffect(() => {
    injectPureWhiteTheme();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const data = await getUserData(u.uid);
        if (data) {
          setProfile(data.profile);
          setTargets(data.targets);
        }
      }
    });
  }, []);

  const handleCalculation = async () => {
    const { weight, height, age, goal } = profile;
    if (!weight || !height || !age) return;

    // BMR + Activity logic
    let bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) + 5;
    let tdee = bmr * 1.4;

    if (goal === 'muscle') tdee += 450;
    if (goal === 'lose') tdee -= 500;

    const protein = Math.round(Number(weight) * 2.2);
    const resultData = { calories: Math.round(tdee), protein };

    setTargets(resultData);
    if (user) await saveUserData(user.uid, { profile, targets: resultData });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <button onClick={() => setLang(lang === 'en' ? 'he' : 'en')} className="fixed top-8 right-8 border-2 border-blue-600 text-blue-600 font-black px-6 py-2 rounded-2xl">{t.lang}</button>
        <div className="max-w-md w-full text-center">
          <div className="text-[180px] mb-8">🥗</div>
          <h1 className="text-6xl font-black text-black mb-12 tracking-tighter">{t.welcome}</h1>
          <div className="space-y-4">
            <input type="email" placeholder={t.email} className="w-full p-6 rounded-[30px] outline-none focus:border-blue-500 text-xl" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder={t.pass} className="w-full p-6 rounded-[30px] outline-none focus:border-blue-500 text-xl" onChange={e => setPassword(e.target.value)} />
            <button onClick={() => login(email, password)} className="w-full bg-blue-600 text-white p-6 rounded-[30px] font-black text-2xl shadow-xl hover:bg-blue-700 transition transform active:scale-95">{t.login}</button>
            <button onClick={() => register(email, password)} className="w-full text-blue-500 font-bold mt-4">{t.signup}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-10 flex flex-col items-center" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="w-full max-w-5xl flex justify-between items-center mb-24 border-b border-gray-100 pb-10">
        <h1 className="text-4xl font-black text-blue-600">NutritionAI 🥗</h1>
        <div className="flex gap-4">
          <button onClick={() => setLang(lang === 'en' ? 'he' : 'en')} className="bg-white border px-6 py-2 rounded-2xl font-bold">{t.lang}</button>
          <button onClick={logout} className="text-red-500 font-bold px-6 py-2 rounded-2xl border border-red-100">{t.logout}</button>
        </div>
      </header>

      <main className="w-full max-w-2xl space-y-16">
        <div className="bright-card p-12 rounded-[60px] text-center">
          <h2 className="text-4xl font-black mb-12 text-black">{t.goal}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <input type="number" placeholder={t.weight} value={profile.weight} className="p-6 rounded-3xl outline-none font-black text-2xl text-center" onChange={e => setProfile({...profile, weight: e.target.value})} />
            <input type="number" placeholder={t.height} value={profile.height} className="p-6 rounded-3xl outline-none font-black text-2xl text-center" onChange={e => setProfile({...profile, height: e.target.value})} />
            <input type="number" placeholder={t.age} value={profile.age} className="p-6 rounded-3xl outline-none font-black text-2xl text-center" onChange={e => setProfile({...profile, age: e.target.value})} />
            <select className="p-6 rounded-3xl outline-none font-black text-2xl text-center" value={profile.goal} onChange={e => setProfile({...profile, goal: e.target.value})}>
              <option value="maintain">{t.maintain}</option>
              <option value="muscle">{t.muscle}</option>
              <option value="lose">{t.lose}</option>
            </select>
          </div>
          <button onClick={handleCalculation} className="w-full bg-black text-white p-8 rounded-[40px] font-black text-3xl shadow-2xl transition hover:opacity-90">
            {t.calc}
          </button>
        </div>

        {targets && (
          <div className="bg-blue-600 text-white p-16 rounded-[60px] shadow-2xl text-center transform scale-105 transition-all">
            <div className="grid grid-cols-2 gap-10">
              <div className="bg-white/10 p-10 rounded-[40px]">
                <p className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">{t.cals}</p>
                <p className="text-7xl font-black">{targets.calories}</p>
              </div>
              <div className="bg-white/10 p-10 rounded-[40px]">
                <p className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">{t.pro}</p>
                <p className="text-7xl font-black">{targets.protein}g</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
