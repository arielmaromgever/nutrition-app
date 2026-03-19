import React, { useState, useEffect } from 'react';
import { auth, loginUser, registerUser, logout, saveUserData, loadUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const TRANSLATIONS = {
  en: { title: "Nutrition AI", signin: "Sign In", signup: "Sign Up", email: "Email", pass: "Password", weight: "Weight (kg)", height: "Height (cm)", age: "Age", goal: "Goal", calculate: "Calculate & Save", lang: "עברית", muscle: "Build Muscle", maintain: "Maintain", lose: "Lose Weight" },
  he: { title: "מנתח תזונה AI", signin: "התחבר", signup: "הרשם", email: "אימייל", pass: "סיסמה", weight: "משקל (קג)", height: "גובה (סמ)", age: "גיל", goal: "מטרה", calculate: "חשב ושמור", lang: "English", muscle: "בניית שריר", maintain: "שמירה", lose: "ירידה במשקל" }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState({ weight: '', height: '', age: '', goal: 'maintain' });
  const [results, setResults] = useState(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const data = await loadUserData(u.uid);
        if (data) setResults(data.calculated);
      }
    });
    return unsub;
  }, []);

  const handleCalc = async () => {
    const { weight, height, age, goal } = profile;
    // BMR Calculation (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    let calories = Math.round(bmr * 1.4); // Activity multiplier
    if (goal === 'muscle') calories += 300;
    if (goal === 'lose') calories -= 400;
    
    const protein = Math.round(weight * 2); // 2g per kg
    const calculated = { calories, protein };
    
    setResults(calculated);
    await saveUserData(user.uid, { profile, calculated });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <button onClick={() => setLang(lang === 'en' ? 'he' : 'en')} className="absolute top-5 right-5 bg-white shadow px-4 py-2 rounded-xl font-bold">{t.lang}</button>
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-100">
          <div className="text-7xl mb-4">🥗</div>
          <h1 className="text-3xl font-black text-blue-600 mb-8">{t.title}</h1>
          <input type="email" placeholder={t.email} className="w-full p-4 mb-4 bg-slate-100 rounded-xl outline-none" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder={t.pass} className="w-full p-4 mb-6 bg-slate-100 rounded-xl outline-none" onChange={e => setPassword(e.target.value)} />
          <button onClick={() => loginUser(email, password)} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold mb-3">{t.signin}</button>
          <button onClick={() => registerUser(email, password)} className="w-full text-blue-600 font-bold">{t.signup}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <header className="flex justify-between mb-10">
        <h1 className="text-2xl font-bold text-blue-600">🥗 {t.title}</h1>
        <div className="flex gap-2">
          <button onClick={() => setLang(lang === 'en' ? 'he' : 'en')} className="bg-white shadow px-3 py-1 rounded-lg">{t.lang}</button>
          <button onClick={logout} className="text-red-500 font-bold">Log out</button>
        </div>
      </header>

      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold mb-4 text-slate-800">{t.goal}</h2>
          <div className="grid grid-cols-1 gap-4">
            <input type="number" placeholder={t.weight} className="p-4 bg-slate-100 rounded-xl" onChange={e => setProfile({...profile, weight: e.target.value})} />
            <input type="number" placeholder={t.height} className="p-4 bg-slate-100 rounded-xl" onChange={e => setProfile({...profile, height: e.target.value})} />
            <input type="number" placeholder={t.age} className="p-4 bg-slate-100 rounded-xl" onChange={e => setProfile({...profile, age: e.target.value})} />
            <select className="p-4 bg-slate-100 rounded-xl" onChange={e => setProfile({...profile, goal: e.target.value})}>
              <option value="maintain">{t.maintain}</option>
              <option value="muscle">{t.muscle}</option>
              <option value="lose">{t.lose}</option>
            </select>
            <button onClick={handleAuth} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold mt-2" onClick={handleCalc}>{t.calculate}</button>
          </div>
        </div>

        {results && (
          <div className="bg-blue-600 p-8 rounded-3xl shadow-lg text-white text-center">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm opacity-80">Calories</p><p className="text-3xl font-black">{results.calories}</p></div>
              <div><p className="text-sm opacity-80">Protein</p><p className="text-3xl font-black">{results.protein}g</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
