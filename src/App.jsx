import React, { useState, useEffect } from 'react';
import { auth, loginUser, registerUser, logout, saveUserData, loadUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState({ weight: '', height: '', age: '', goal: 'maintain' });
  const [results, setResults] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const data = await loadUserData(u.uid);
        if (data && data.calculated) setResults(data.calculated);
      }
    });
  }, []);

  const handleAuth = async (type) => {
    if (!email || !password) return alert("Please fill all details");
    try {
      if (type === 'login') await loginUser(email, password);
      else await registerUser(email, password);
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleCalc = async () => {
    const { weight, height, age, goal } = profile;
    if (!weight || !height || !age) return alert("Please fill details");
    let bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) + 5;
    let calories = Math.round(bmr * 1.4);
    if (goal === 'muscle') calories += 300;
    if (goal === 'lose') calories -= 400;
    const protein = Math.round(Number(weight) * 2);
    setResults({ calories, protein });
    await saveUserData(user.uid, { profile, calculated: { calories, protein } });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center" style={{fontFamily: 'sans-serif'}}>
        <h1 className="text-4xl font-bold mb-8 text-blue-600">Nutrition AI 🥗</h1>
        <div className="w-full max-w-sm space-y-4">
          <input className="w-full p-4 border rounded-2xl" placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input className="w-full p-4 border rounded-2xl" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold" onClick={() => handleAuth('login')}>Log In</button>
          <button className="w-full text-blue-600" onClick={() => handleAuth('signup')}>Create Account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{fontFamily: 'sans-serif'}}>
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-lg">
        <div className="flex justify-between mb-8">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={logout} className="text-red-500">Logout</button>
        </div>
        <div className="space-y-4 text-left">
          <label className="block font-bold">Weight (kg)</label>
          <input className="w-full p-3 bg-gray-100 rounded-xl" type="number" onChange={e => setProfile({...profile, weight: e.target.value})} />
          <label className="block font-bold">Height (cm)</label>
          <input className="w-full p-3 bg-gray-100 rounded-xl" type="number" onChange={e => setProfile({...profile, height: e.target.value})} />
          <label className="block font-bold">Age</label>
          <input className="w-full p-3 bg-gray-100 rounded-xl" type="number" onChange={e => setProfile({...profile, age: e.target.value})} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold mt-4" onClick={handleCalc}>Calculate Target</button>
        </div>
        {results && (
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl text-center">
            <p className="font-bold">Target: {results.calories} kcal | {results.protein}g Protein</p>
          </div>
        )}
      </div>
    </div>
  );
}
