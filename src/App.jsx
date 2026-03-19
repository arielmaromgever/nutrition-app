import React, { useState, useEffect } from 'react';
import { auth, loginUser, registerUser, logout, saveUserData, loadUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const TRANSLATIONS = {
  en: { title: "Nutrition AI", signin: "Log In", signup: "Register", email: "Email", pass: "Password", weight: "Weight (kg)", height: "Height (cm)", age: "Age", goal: "Goal", calculate: "Calculate & Save", lang: "עברית", muscle: "Build Muscle", maintain: "Maintain", lose: "Lose Weight" },
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
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    document.head.appendChild(link);
    document.body.style.backgroundColor = "#ffffff";

    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const data = await loadUserData(u.uid);
        if (data && data.calculated) setResults(data.calculated);
      }
    });
  }, []);

  const handleAuth = async (type) => {
    if (!email || !password) return alert("Please fill email and password");
    try {
      if (type === 'login') await loginUser(email, password);
      else await registerUser(email, password);
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleCalc = async () => {
    const { weight, height, age, goal } = profile;
    if (!weight || !height || !age) return alert("Please fill all fields");
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    let calories = Math.round(bmr * 1.4);
    if (goal === 'muscle') calories += 300;
    if (goal === 'lose') calories -= 400;
    const protein = Math.round(weight * 2);
    const calculated = { calories, protein };
    setResults(calculated);
    await saveUserData(user.uid, { profile, calculated });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center" dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <button onClick={() => setLang(lang === 'en' ? 'he' : 'en')} className="absolute top-5 right-5 border border-gray-200 p-2 rounded-xl text-sm font-bold bg-gray-50">{t.lang}</button>
        <div className="text-8xl mb-6">🥗</div>
        <h1 className="text-4xl font-black mb-10 text-gray-900">{t.title}</h1>
        <div className="w-full max-w-sm space-y-4">
          <input type="email" placeholder={t.email} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder={t.pass} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none" onChange={e => setPassword(e.target.value)} />
          <button onClick={() => handleAuth('login')} className="w-full bg-blue-600 text-white p-5 rounded-3xl font-bold text-xl shadow-xl">Log In</button>
          <button onClick={() => handleAuth('signup')} className="w-full text-blue-500 font-bold py-2">Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <header className="flex justify-between items-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600">🥗 {t.title}</h1>
        <button onClick={logout} className="text-red-500 font-bold bg-white border border-red-50 px-5 py-2 rounded-2xl">Log out</button>
      </header>
      <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-2xl space-y-8 border border-gray-50 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t.goal}</h2>
        <div className="space-y-4">
          <input type="number" placeholder={t.weight} className="w-full p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setProfile({...profile, weight: e.target.value})} />
          <input type="number" placeholder={t.height} className="w-full p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setProfile({...profile, height: e.target.value})} />
          <input type="number" placeholder={t.age} className="w-full p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setProfile({...profile, age: e.target.value})} />
          <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" onChange={e => setProfile({...profile, goal: e.target.value})}>
            <option value="maintain">{t.maintain}</option>
            <option value="muscle">{t.muscle}</option>
            <option value="lose">{t.lose}</option>
          </select>
          <button onClick={handleCalc} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold text-lg shadow-lg">Calculate</button>
        </div>
        {results && (
          <div className="mt-8 p-8 bg-blue-600 rounded-3xl text-white text-center grid grid-cols-2 gap-4 shadow-xl">
            <div className="border-r border-blue-400">
              <p className="text-xs uppercase tracking-wider opacity-80">Calories</p>
              <p className="text-3xl font-black">{results.calories}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">Protein</p>
              <p className="text-3xl font-black">{results.protein}g</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
