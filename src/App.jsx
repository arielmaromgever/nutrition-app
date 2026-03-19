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
    const injectStyle = document.createElement('link');
    injectStyle.rel = 'stylesheet';
    injectStyle.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    document.head.appendChild(injectStyle);

    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const data = await loadUserData(u.uid);
        if (data && data.calculated) setResults(data.calculated);
      }
    });
  }, []);

  const handleAuth = async (type) => {
    if (!email || !password) return alert("Please enter email and password");
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <button onClick={() => setLang(lang === 'en' ? 'he' : 'en')} className="absolute top-5 right-5 border p-2 rounded-xl text-sm font-bold">{t.lang}</button>
        <div className="text-7xl mb-4">🥗</div>
        <h1 className="text-4xl font-black mb-10 text-gray-800">{t.title}</h1>
        <div className="w-full max-w-sm space-y-4">
          <input type="email" placeholder={t.email} className="w-full p-4 bg-gray-50 border rounded-2xl" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder={t.pass} className="w-full p-4 bg-gray-50 border rounded-2xl" onChange={e => setPassword(e.target.value)} />
          <button onClick={() => handleAuth('login')} className="w-full bg-blue-500 text-white p-4 rounded-2xl font-bold text-lg shadow-lg">Log In</button>
          <button onClick={() => handleAuth('signup')} className="w-full text-blue-500 font-bold">Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-blue-600">🥗 {t.title}</h1>
        <button onClick={logout} className="text-red-500 font-bold border border-red-100 px-4 py-2 rounded-xl">Log out</button>
      </header>
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl space-y-6">
        <h2 className="text-xl font-bold">{t.goal}</h2>
        <input type="number" placeholder={t.weight} className="w-full p-4 bg-gray-50 rounded-xl" onChange={e => setProfile({...profile, weight: e.target.value})} />
        <input type="number" placeholder={t.height} className="w-full p-4 bg-gray-50 rounded-xl" onChange={e => setProfile({...profile, height: e.target.value})} />
        <input type="number" placeholder={t.age} className="w-full p-4 bg-gray-50 rounded-xl" onChange={e => setProfile({...profile, age: e.target.value})} />
        <select className="w-full p-4 bg-gray-50 rounded-xl" onChange={e => setProfile({...profile, goal: e.target.value})}>
          <option value="maintain">{t.maintain}</option>
          <option value="muscle">{t.muscle}</option>
          <option value="lose">{t.lose}</option>
        </select>
        <button onClick={handleCalc} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg">{t.calculate}</button>
        {results && (
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl text-center grid grid-cols-2 gap-4">
            <div><p className="text-xs text-blue-600 font-bold">CALORIES</p><p className="text-2xl font-black">{results.calories}</p></div>
            <div><p className="text-xs text-blue-600 font-bold">PROTEIN</p><p className="text-2xl font-black">{results.protein}g</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
