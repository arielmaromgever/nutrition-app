import React, { useState, useEffect } from 'react';
import { auth, login, register, logout, saveUserData, getUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// 1. Translation System (The only place with Hebrew)
const dictionary = {
  en: {
    welcome: "Nutrition AI",
    tagline: "Smart Fitness Tracking",
    email: "Email Address",
    password: "Password",
    login: "Log In",
    register: "Create Account",
    toggleLang: "עברית",
    weight: "Weight (kg)",
    height: "Height (cm)",
    age: "Age",
    goalLabel: "Select Your Goal",
    goalMuscle: "Build Muscle (Bulk)",
    goalLose: "Weight Loss (Cut)",
    goalMaintain: "Maintenance",
    calculate: "Update & Sync My Plan",
    resultsTitle: "Personal Targets",
    calories: "Daily Calories",
    protein: "Daily Protein",
    logout: "Log Out"
  },
  he: {
    welcome: "מנתח תזונה AI",
    tagline: "מעקב כושר חכם",
    email: "כתובת אימייל",
    password: "סיסמה",
    login: "התחברות",
    register: "הרשמה למערכת",
    toggleLang: "English",
    weight: "משקל (ק״ג)",
    height: "גובה (ס״מ)",
    age: "גיל",
    goalLabel: "בחר את המטרה שלך",
    goalMuscle: "בניית מסת שריר",
    goalLose: "ירידה במשקל / חיטוב",
    goalMaintain: "שמירה על הקיים",
    calculate: "חשב וסנכרן תוכנית",
    resultsTitle: "היעדים האישיים שלך",
    calories: "קלוריות ליום",
    protein: "חלבון ליום",
    logout: "התנתק"
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState({ weight: '', height: '', age: '', goal: 'goalMaintain' });
  const [results, setResults] = useState(null);

  const t = dictionary[lang];
  const isRtl = lang === 'he';

  // 2. Authentication and Data Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const stored = await getUserData(u.uid);
        if (stored) {
          setProfile(stored.profile || { weight: '', height: '', age: '', goal: 'goalMaintain' });
          setResults(stored.results || null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. The Calculator Logic (Mifflin-St Jeor)
  const calculateNutrition = async () => {
    const { weight, height, age, goal } = profile;
    if (!weight || !height || !age) return;

    // Basal Metabolic Rate (BMR) for males
    let bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) + 5;
    let tdee = bmr * 1.4; // Activity factor (moderate)

    // Goal Adjustments
    let targetCals = Math.round(tdee);
    if (goal === 'goalMuscle') targetCals += 400;
    if (goal === 'goalLose') targetCals -= 500;

    // Protein Calculation (2.2g per kg)
    const targetPro = Math.round(Number(weight) * 2.2);

    const data = { calories: targetCals, protein: targetPro };
    setResults(data);

    if (user) {
      await saveUserData(user.uid, { profile, results: data });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
        <button onClick={() => setLang(lang === 'en' ? 'he' : 'en')} className="fixed top-8 right-8 border-2 border-blue-500 text-blue-600 font-black px-6 py-2 rounded-2xl hover:bg-blue-50 transition">
          {t.toggleLang}
        </button>
        <div className="max-w-md w-full text-center">
          <div className="text-[180px] mb-6 drop-shadow-xl animate-bounce">🥗</div>
          <h1 className="text-6xl font-black text-gray-900 mb-2 tracking-tighter">{t.welcome}</h1>
          <p className="text-xl text-gray-400 mb-12">{t.tagline}</p>
          <div className="space-y-4">
            <input type="email" placeholder={t.email} className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-[30px] focus:border-blue-500 outline-none text-xl transition-all" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder={t.password} className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-[30px] focus:border-blue-500 outline-none text-xl transition-all" onChange={e => setPassword(e.target.value)} />
            <button onClick={() => login(email, password)} className="w-full bg-blue-600 text-white p-6 rounded-[30px] font-black text-2xl shadow-2xl hover:bg-blue-700 transform active:scale-95 transition-all">{t.login}</button>
            <button onClick={() => register(email, password)} className="w-full text-blue-500 font-bold mt-4 hover:underline">{t.register}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-20 border-b border-gray-50 pb-8">
        <h1 className="text-4xl font-black text-blue-600">NutritionAI 🥗</h1>
        <div className="flex gap-4">
          <button onClick={() => setLang(lang === 'en' ? 'he' : 'en')} className="bg-gray-100 px-6 py-2 rounded-2xl font-bold">{t.toggleLang}</button>
          <button onClick={logout} className="text-red-500 font-bold bg-red-50 px-6 py-2 rounded-2xl hover:bg-red-100">{t.logout}</button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-16">
        <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-gray-50">
          <h2 className="text-4xl font-black mb-12 text-center text-gray-800">{t.goalLabel}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <input type="number" placeholder={t.weight} value={profile.weight} className="p-6 bg-gray-50 rounded-[25px] border-2 border-transparent focus:border-blue-500 outline-none font-black text-2xl text-center" onChange={e => setProfile({...profile, weight: e.target.value})} />
            <input type="number" placeholder={t.height} value={profile.height} className="p-6 bg-gray-50 rounded-[25px] border-2 border-transparent focus:border-blue-500 outline-none font-black text-2xl text-center" onChange={e => setProfile({...profile, height: e.target.value})} />
            <input type="number" placeholder={t.age} value={profile.age} className="p-6 bg-gray-50 rounded-[25px] border-2 border-transparent focus:border-blue-500 outline-none font-black text-2xl text-center" onChange={e => setProfile({...profile, age: e.target.value})} />
            <select className="p-6 bg-gray-50 rounded-[25px] border-2 border-transparent focus:border-blue-500 outline-none font-black text-2xl text-center appearance-none" value={profile.goal} onChange={e => setProfile({...profile, goal: e.target.value})}>
              <option value="goalMaintain">{t.goalMaintain}</option>
              <option value="goalMuscle">{t.goalMuscle}</option>
              <option value="goalLose">{t.goalLose}</option>
            </select>
          </div>
          <button onClick={calculateNutrition} className="w-full bg-gray-900 text-white p-8 rounded-[40px] font-black text-3xl shadow-2xl hover:bg-black transition-all">
            {t.calculate}
          </button>
        </div>

        {results && (
          <div className="bg-blue-600 text-white p-16 rounded-[60px] shadow-2xl text-center transform scale-105 transition-all">
            <h3 className="text-2xl font-bold opacity-80 mb-10 uppercase tracking-widest">{t.resultsTitle}</h3>
            <div className="grid grid-cols-2 gap-12">
              <div className="bg-white/10 p-10 rounded-[40px] backdrop-blur-md">
                <p className="text-sm font-bold opacity-60 mb-2 uppercase">{t.calories}</p>
                <p className="text-7xl font-black tracking-tighter">{results.calories}</p>
              </div>
              <div className="bg-white/10 p-10 rounded-[40px] backdrop-blur-md">
                <p className="text-sm font-bold opacity-60 mb-2 uppercase">{t.protein}</p>
                <p className="text-7xl font-black tracking-tighter">{results.protein}g</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
