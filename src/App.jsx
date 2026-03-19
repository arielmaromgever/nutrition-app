import React, { useState, useEffect, useRef } from 'react';
import { auth, registerUser, loginUser, logout, saveUserData, loadUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// --- constants and translations ---
const TRANSLATIONS = {
  en: {
    title: "AI Meal Nutrition Analyzer",
    subtitle: "Track calories & protein with AI",
    calcTitle: "Daily Calorie Target",
    targets: "Targets",
    meals: "Meals",
    diary: "Week Diary",
    login: "Login / Sign Up",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    logout: "Logout",
    analyze: "Analyze Meal",
    calculating: "Analyzing...",
    addFood: "Add more food (e.g. rice, salad)",
    dailySummary: "Daily Summary",
    weeklySummary: "Weekly Summary",
    overTarget: "Over Target",
    underTarget: "Under Target",
    onTrack: "On Track",
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    grams: "g",
    kcal: "kcal",
    weight: "Weight (kg)",
    height: "Height (cm)",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    activity: "Activity Level",
    goal: "Your Goals",
    calculate: "Calculate Target",
    addMeal: "Add to Diary",
    lookUp: "Look up nutrition",
    noData: "No data for this day",
    confirmAdd: "Add this to your log?",
    exceeded: "Exceeded by",
    customGoal: "Describe custom goal...",
  },
  he: {
    title: "מנתח תזונה AI",
    subtitle: "מעקב קלוריות וחלבון עם בינה מלאכותית",
    calcTitle: "יעד קלוריות יומי",
    targets: "יעדים",
    meals: "ארוחות",
    diary: "יומן שבועי",
    login: "התחברות / הרשמה",
    email: "אימייל",
    password: "סיסמה",
    signIn: "התחבר",
    signUp: "הרשם",
    logout: "התנתק",
    analyze: "נתח ארוחה",
    calculating: "מנתח...",
    addFood: "הוסף עוד אוכל (למשל אורז, סלט)",
    dailySummary: "סיכום יומי",
    weeklySummary: "סיכום שבועי",
    overTarget: "מעל היעד",
    underTarget: "מתחת ליעד",
    onTrack: "במסלול",
    calories: "קלוריות",
    protein: "חלבון",
    carbs: "פחמימות",
    fat: "שומן",
    grams: "גרם",
    kcal: "קק\"ל",
    weight: "משקל (ק\"ג)",
    height: "גובה (ס\"מ)",
    age: "גיל",
    gender: "מין",
    male: "זכר",
    female: "נקבה",
    activity: "רמת פעילות",
    goal: "המטרות שלך",
    calculate: "חשב יעד",
    addMeal: "הוסף ליומן",
    lookUp: "בדוק ערכים",
    noData: "אין נתונים ליום זה",
    confirmAdd: "להוסיף ליומן שלך?",
    exceeded: "חריגה של",
    customGoal: "תאר מטרה אישית...",
  }
};

const GOALS = [
  { id: 'lose_fast', en: 'Lose weight fast', he: 'ירידה מהירה במשקל', factor: 0.8 },
  { id: 'lose_slow', en: 'Lose weight gradually', he: 'ירידה הדרגתית', factor: 0.9 },
  { id: 'maintain', en: 'Maintain weight', he: 'שמירה על משקל', factor: 1.0 },
  { id: 'lean_bulk', en: 'Lean bulk', he: 'עלייה נקייה בשריר', factor: 1.05 },
  { id: 'bulk', en: 'Bulk', he: 'עלייה במסה', factor: 1.15 },
  { id: 'performance', en: 'Athletic performance', he: 'ביצועים ספורטיביים', factor: 1.1 },
  { id: 'keto', en: 'Ketogenic / Low carb', he: 'קיטו / דל פחמימה', factor: 1.0 },
  { id: 'heart', en: 'Heart healthy', he: 'בריאות הלב', factor: 0.95 },
  { id: 'sugar', en: 'Blood sugar control', he: 'איזון סוכר', factor: 0.95 },
  { id: 'endurance', en: 'Endurance training', he: 'אימוני סיבולת', factor: 1.2 },
  { id: 'custom', en: 'Custom goal', he: 'מטרה מותאמת אישית', factor: 1.0 },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_HE = ['שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת', 'ראשון'];

// --- Main App Component ---
export default function App() {
  const [lang, setLang] = useState('he');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [loading, setLoading] = useState(false);
  
  // Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const data = await loadUserData(u.uid);
        if (data) {
          // Load user's saved goals/diary here if needed
        }
      }
    });
    return unsub;
  }, []);

  const handleAuth = async (type) => {
    try {
      setLoading(true);
      if (type === 'login') await loginUser(email, password);
      else await registerUser(email, password);
    } catch (err) {
      alert(lang === 'he' ? "שגיאה: " + err.message : "Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const t = TRANSLATIONS[lang];

  if (!user) {
    return (
      <div className={`min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center ${lang === 'he' ? 'rtl' : 'ltr'}`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl">
          <button onClick={() => setLang(lang === 'he' ? 'en' : 'he')} className="mb-4 text-blue-400">
            {lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
          </button>
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-slate-400 mb-8">{t.subtitle}</p>
          
          <div className="space-y-4">
            <input 
              type="email" placeholder={t.email} 
              className="w-full p-3 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder={t.password} 
              className="w-full p-3 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => handleAuth('login')} disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition disabled:opacity-50"
              >
                {t.signIn}
              </button>
              <button 
                onClick={() => handleAuth('signup')} disabled={loading}
                className="flex-1 border border-blue-600 text-blue-400 hover:bg-blue-600/10 p-3 rounded font-bold transition disabled:opacity-50"
              >
                {t.signUp}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-900 text-white font-sans pb-24 ${lang === 'he' ? 'rtl' : 'ltr'}`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold text-blue-400">{t.title}</h1>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setLang(lang === 'he' ? 'en' : 'he')} className="text-sm bg-slate-700 px-3 py-1 rounded">
            {lang === 'he' ? 'EN' : 'עב'}
          </button>
          <button onClick={logout} className="text-sm text-red-400 bg-red-400/10 px-3 py-1 rounded">
            {t.logout}
          </button>
        </div>
      </header>

      {/* Main Content Tabs */}
      <main className="max-w-4xl mx-auto p-4">
        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
               <h2 className="text-xl font-bold mb-4">{t.analyze}</h2>
               <div className="p-8 border-2 border-dashed border-slate-600 rounded-xl text-center hover:border-blue-500 transition cursor-pointer">
                 <p className="text-slate-400">צלם תמונה או גרור לכאן</p>
               </div>
               <textarea 
                 className="w-full mt-4 p-3 bg-slate-700 rounded-xl focus:outline-none focus:ring-2 ring-blue-500"
                 placeholder={t.addFood}
                 rows="3"
               ></textarea>
               <button className="w-full mt-4 bg-blue-600 p-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition">
                 {t.analyze}
               </button>
            </div>
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="bg-slate-800 p-4 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">{t.diary}</h2>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {(lang === 'he' ? DAYS_HE : DAYS).map((d, i) => (
                <button key={i} className="bg-slate-700 p-2 rounded text-xs text-center hover:bg-blue-600 transition">
                  {d}
                </button>
              ))}
            </div>
            <div className="text-center py-10 text-slate-500">
              {t.noData}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-slate-700 flex justify-around p-3">
        <button onClick={() => setActiveTab('targets')} className={`flex flex-col items-center gap-1 ${activeTab === 'targets' ? 'text-blue-400' : 'text-slate-500'}`}>
          <span className="text-xs">{t.targets}</span>
        </button>
        <button onClick={() => setActiveTab('meals')} className={`flex flex-col items-center gap-1 ${activeTab === 'meals' ? 'text-blue-400' : 'text-slate-500'}`}>
          <span className="text-xs">{t.meals}</span>
        </button>
        <button onClick={() => setActiveTab('diary')} className={`flex flex-col items-center gap-1 ${activeTab === 'diary' ? 'text-blue-400' : 'text-slate-500'}`}>
          <span className="text-xs">{t.diary}</span>
        </button>
      </nav>
    </div>
  );
}
