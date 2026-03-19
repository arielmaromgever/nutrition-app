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
    try {
      if (type === 'login') await loginUser(email, password);
      else await registerUser(email, password);
    } catch (err) { alert("Auth Error: " + err.message); }
  };

  const handleCalc = async () => {
    const { weight, height, age, goal } = profile;
    let bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) + 5;
    let calories = Math.round(bmr * 1.4);
    if (goal === 'muscle') calories += 300;
    if (goal === 'lose') calories -= 400;
    const protein = Math.round(Number(weight) * 2);
    const calculated = { calories, protein };
    setResults(calculated);
    await saveUserData(user.uid, { profile, calculated });
  };

  const style = {
    main: { fontFamily: 'sans-serif', textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh' },
    card: { maxWidth: '400px', margin: '0 auto', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #eee' },
    input: { width: '100%', padding: '12px', margin: '8px 0', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }
  };

  if (!user) {
    return (
      <div style={style.main}>
        <div style={style.card}>
          <h1 style={{color: '#0070f3'}}>Nutrition AI 🥗</h1>
          <input style={style.input} type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input style={style.input} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button style={style.btn} onClick={() => handleAuth('login')}>Log In</button>
          <button style={{...style.btn, backgroundColor: 'transparent', color: '#0070f3'}} onClick={() => handleAuth('signup')}>Create Account</button>
        </div>
      </div>
    );
  }

  return (
    <div style={style.main}>
      <div style={{...style.card, maxWidth: '500px'}}>
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <h2 style={{color: '#0070f3', margin: 0}}>Settings 🥗</h2>
          <button onClick={logout} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}>Logout</button>
        </header>
        <div style={{textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <label>Weight (kg):</label>
          <input style={style.input} type="number" onChange={e => setProfile({...profile, weight: e.target.value})} />
          <label>Height (cm):</label>
          <input style={style.input} type="number" onChange={e => setProfile({...profile, height: e.target.value})} />
          <label>Age:</label>
          <input style={style.input} type="number" onChange={e => setProfile({...profile, age: e.target.value})} />
          <label>Goal:</label>
          <select style={style.input} onChange={e => setProfile({...profile, goal: e.target.value})}>
            <option value="maintain">Maintain</option>
            <option value="muscle">Build Muscle</option>
            <option value="lose">Lose Weight</option>
          </select>
          <button style={style.btn} onClick={handleCalc}>Calculate & Save</button>
        </div>

        {results && (
          <div style={{marginTop: '30px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '15px'}}>
            <h3 style={{margin: '0 0 10px 0'}}>Daily Targets</h3>
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
              <div><small>Calories</small><div style={{fontSize: '24px', fontWeight: 'bold'}}>{results.calories}</div></div>
              <div><small>Protein</small><div style={{fontSize: '24px', fontWeight: 'bold'}}>{results.protein}g</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
