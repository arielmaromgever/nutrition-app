import React, { useState, useEffect } from 'react';
import { auth, loginUser, registerUser, logout, saveUserData, loadUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// --- Translations Dictionary ---
const translations = {
  en: {
    settings: "Settings",
    logout: "Logout",
    weight: "Weight (kg)",
    height: "Height (cm)",
    age: "Age",
    goals: "Select Your Goals",
    customGoal: "Or write a custom goal...",
    calcTarget: "Calculate Target",
    target: "Daily Target",
    protein: "Protein",
    cals: "kcal",
    goalMuscle: "Build Muscle",
    goalLose: "Lose Weight",
    goalMaintain: "Maintain Weight",
    foodRecs: "Recommended Foods based on goals:",
    diaryTitle: "Weekly Diary",
    daySelect: "Select Day",
    foodInputDesc: "Describe what you ate (e.g., 200g chicken breast) or upload photo",
    addFood: "Add to Diary",
    totalToday: "Total Today:",
    remaining: "Remaining:",
    login: "Log In",
    signup: "Create Account",
    email: "Email",
    password: "Password",
    fillDetails: "Please fill all details",
    switchTo: "עבור לעברית"
  },
  he: {
    settings: "הגדרות",
    logout: "התנתק",
    weight: "משקל (ק״ג)",
    height: "גובה (ס״מ)",
    age: "גיל",
    goals: "בחר מטרות",
    customGoal: "או כתוב מטרה אישית...",
    calcTarget: "חשב יעד",
    target: "יעד יומי",
    protein: "חלבון",
    cals: "קלוריות",
    goalMuscle: "עלייה במסת שריר",
    goalLose: "ירידה במשקל",
    goalMaintain: "שמירה על המשקל",
    foodRecs: "מאכלים מומלצים למטרות שלך:",
    diaryTitle: "יומן שבועי",
    daySelect: "בחר יום",
    foodInputDesc: "תאר מה אכלת (למשל: 200 גרם חזה עוף) או צלם",
    addFood: "הוסף ליומן",
    totalToday: "סה״כ היום:",
    remaining: "נשאר:",
    login: "התחבר",
    signup: "הרשם",
    email: "אימייל",
    password: "סיסמה",
    fillDetails: "אנא מלא את כל הפרטים",
    switchTo: "Switch to English"
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // App State
  const [lang, setLang] = useState('en');
  const [profile, setProfile] = useState({ weight: '', height: '', age: '', goals: [], customGoal: '' });
  const [results, setResults] = useState(null);
  
  // Diary State
  const [diary, setDiary] = useState({ Sunday: [], Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] });
  const [selectedDay, setSelectedDay] = useState('Sunday');
  const [foodText, setFoodText] = useState('');
  
  const t = translations[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const data = await loadUserData(u.uid);
        if (data && data.calculated) setResults(data.calculated);
        if (data && data.profile) setProfile(data.profile);
        if (data && data.diary) setDiary(data.diary);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (type) => {
    if (!email || !password) return alert(t.fillDetails);
    try {
      if (type === 'login') await loginUser(email, password);
      else await registerUser(email, password);
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleGoalChange = (goalObj) => {
    let updatedGoals = [...profile.goals];
    if (updatedGoals.includes(goalObj)) {
      updatedGoals = updatedGoals.filter(g => g !== goalObj);
    } else {
      updatedGoals.push(goalObj);
    }
    setProfile({ ...profile, goals: updatedGoals });
  };

  const handleCalc = async () => {
    const { weight, height, age, goals } = profile;
    if (!weight || !height || !age) return alert(t.fillDetails);
    
    // Basic BMR Formula
    let bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) + 5;
    let calories = Math.round(bmr * 1.4); // Activity multiplier
    
    // Adjust based on multiple goals
    if (goals.includes('muscle')) calories += 300;
    if (goals.includes('lose')) calories -= 400;
    
    const protein = Math.round(Number(weight) * 2.2); // Protein multiplier
    
    const calculated = { calories, protein };
    setResults(calculated);
    
    if (user) {
      await saveUserData(user.uid, { profile, calculated, diary });
    }
  };

  // MOCK: AI Food Analysis (Requires 3rd party API later)
  const handleAddFood = async () => {
    if (!foodText) return;
    
    // TODO: Replace this logic with OpenAI/Gemini API call to parse foodText into Cals/Protein
    const mockCals = Math.floor(Math.random() * 300) + 100; 
    const mockProtein = Math.floor(Math.random() * 30) + 5;
    
    const newFoodItem = { name: foodText, calories: mockCals, protein: mockProtein };
    
    const updatedDiary = { ...diary };
    updatedDiary[selectedDay].push(newFoodItem);
    
    setDiary(updatedDiary);
    setFoodText('');
    
    if (user) {
      await saveUserData(user.uid, { diary: updatedDiary });
    }
  };

  const getDayTotals = (day) => {
    return diary[day].reduce((acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      return acc;
    }, { calories: 0, protein: 0 });
  };

  // UI rendering based on Auth State
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-4xl font-bold mb-8 text-blue-600">Nutrition AI</h1>
        <div className="w-full max-w-sm space-y-4 bg-white p-8 rounded-3xl shadow-lg">
          <input className="w-full p-4 border rounded-2xl bg-gray-100 text-gray-800" placeholder={t.email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full p-4 border rounded-2xl bg-gray-100 text-gray-800" type="password" placeholder={t.password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold" onClick={() => handleAuth('login')}>{t.login}</button>
          <button className="w-full text-blue-600 font-semibold mt-2" onClick={() => handleAuth('signup')}>{t.signup}</button>
        </div>
      </div>
    );
  }

  const currentTotals = getDayTotals(selectedDay);

  return (
    <div className={`min-h-screen bg-gray-50 p-6 font-sans ${lang === 'he' ? 'rtl text-right' : 'ltr text-left'}`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-lg text-gray-800">
        
        {/* Header & Settings */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-2xl font-bold text-blue-600">{t.settings}</h2>
          <div className="space-x-4">
            <button onClick={() => setLang(lang === 'en' ? 'he' : 'en')} className="text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-700 font-semibold mx-2">
              {t.switchTo}
            </button>
            <button onClick={logout} className="text-red-500 font-semibold">{t.logout}</button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-600 mb-1">{t.weight}</label>
              <input value={profile.weight} className="w-full p-3 bg-gray-100 rounded-xl outline-none" type="number" onChange={e => setProfile({...profile, weight: e.target.value})} />
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-1">{t.height}</label>
              <input value={profile.height} className="w-full p-3 bg-gray-100 rounded-xl outline-none" type="number" onChange={e => setProfile({...profile, height: e.target.value})} />
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-1">{t.age}</label>
              <input value={profile.age} className="w-full p-3 bg-gray-100 rounded-xl outline-none" type="number" onChange={e => setProfile({...profile, age: e.target.value})} />
            </div>
          </div>

          {/* Multiple Goals */}
          <label className="block font-bold text-gray-600 mt-4">{t.goals}</label>
          <div className="flex flex-wrap gap-3">
            {['muscle', 'lose', 'maintain'].map(goalKey => (
              <label key={goalKey} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border cursor-pointer">
                <input type="checkbox" checked={profile.goals.includes(goalKey)} onChange={() => handleGoalChange(goalKey)} className="w-5 h-5 ml-2" />
                <span>{goalKey === 'muscle' ? t.goalMuscle : goalKey === 'lose' ? t.goalLose : t.goalMaintain}</span>
              </label>
            ))}
          </div>
          <input 
            placeholder={t.customGoal} 
            value={profile.customGoal} 
            onChange={e => setProfile({...profile, customGoal: e.target.value})}
            className="w-full p-3 mt-2 bg-gray-100 rounded-xl outline-none" 
          />

          <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold mt-6 shadow-md" onClick={handleCalc}>{t.calcTarget}</button>
        </div>

        {/* Results & Recommendations */}
        {results && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-2xl text-center">
            <h3 className="font-bold text-xl text-blue-800 mb-2">{t.target}</h3>
            <p className="text-lg text-gray-700"><span className="font-bold text-2xl text-blue-600">{results.calories}</span> {t.cals} | <span className="font-bold text-2xl text-blue-600">{results.protein}g</span> {t.protein}</p>
            
            <div className="mt-4 text-sm text-gray-600 text-left (lang === 'he' ? 'text-right' : 'text-left')">
              <p className="font-bold">{t.foodRecs}</p>
              <ul className="list-disc list-inside mt-2">
                {profile.goals.includes('muscle') && <li>Chicken Breast, Eggs, Greek Yogurt, Tuna</li>}
                {profile.goals.includes('lose') && <li>Broccoli, Cucumber, Lean Fish, Leafy Greens</li>}
                {(!profile.goals.includes('muscle') && !profile.goals.includes('lose')) && <li>Balanced diet: Lean proteins, complex carbs</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Weekly Diary Feature */}
        {results && (
          <div className="mt-10 border-t pt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t.diaryTitle}</h3>
            
            <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl font-bold mb-4 outline-none text-gray-700">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>

            <div className="flex gap-2 mb-6">
              <input 
                value={foodText} 
                onChange={e => setFoodText(e.target.value)} 
                placeholder={t.foodInputDesc} 
                className="flex-1 p-3 bg-gray-100 rounded-xl outline-none" 
              />
              <button onClick={handleAddFood} className="bg-green-500 text-white px-6 font-bold rounded-xl shadow-md">{t.addFood}</button>
            </div>

            {/* Daily Summary */}
            <div className="bg-gray-50 p-4 rounded-xl mb-4 shadow-inner">
              <h4 className="font-bold mb-2">{t.totalToday}</h4>
              <p className="text-gray-700">Calories: {currentTotals.calories} / {results.calories} {t.cals}</p>
              <p className="text-gray-700">Protein: {currentTotals.protein} / {results.protein}g</p>
              
              <div className="mt-2 text-sm">
                <span className={results.calories - currentTotals.calories >= 0 ? "text-green-600" : "text-red-500"}>
                  {t.remaining} Calories: {results.calories - currentTotals.calories}
                </span>
              </div>
            </div>

            {/* List of eaten foods */}
            <div className="space-y-2">
              {diary[selectedDay].map((item, idx) => (
                <div key={idx} className="flex justify-between bg-white border p-3 rounded-lg shadow-sm">
                  <span className="font-semibold text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.calories} {t.cals} | {item.protein}g</span>
                </div>
              ))}
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
