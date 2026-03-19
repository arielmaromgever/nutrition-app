import React, { useState, useEffect } from 'react';
import { auth, loginUser, registerUser, logout } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// אריאל, הקוד הזה כולל עיצוב בהיר מובנה ועברית מלאה
export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState({ weight: '', height: '', age: '', goal: 'maintain' });
  const [results, setResults] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleAuth = async (type) => {
    try {
      if (type === 'login') await loginUser(email, password);
      else await registerUser(email, password);
    } catch (err) { alert("שגיאת התחברות: " + err.message); }
  };

  const handleCalc = () => {
    const { weight, height, age, goal } = profile;
    if (!weight || !height || !age) return alert("נא למלא את כל השדות");
    
    // נוסחת BMR מקצועית
    let bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) + 5;
    let calories = Math.round(bmr * 1.4); // Activity multiplier
    
    if (goal === 'muscle') calories += 300;
    if (goal === 'lose') calories -= 400;
    
    // 2 גרם חלבון לכל קילו משקל גוף
    const protein = Math.round(Number(weight) * 2); 
    
    setResults({ calories, protein });
  };

  const s = {
    main: { fontFamily: 'sans-serif', textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', direction: 'rtl' },
    card: { maxWidth: '400px', margin: '0 auto', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #eee' },
    input: { width: '100%', padding: '12px', margin: '8px 0', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', textAlign: 'right' },
    btn: { width: '100%', padding: '15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '16px' }
  };

  if (!user) {
    return (
      <div style={s.main} dir="rtl">
        <div style={s.card}>
          <h1 style={{color: '#0070f3', marginBottom: '30px'}}>Nutrition AI 🥗</h1>
          <input style={s.input} type="email" placeholder="אימייל" onChange={e => setEmail(e.target.value)} />
          <input style={s.input} type="password" placeholder="סיסמה" onChange={e => setPassword(e.target.value)} />
          <button style={s.btn} onClick={() => handleAuth('login')}>התחבר</button>
          <button style={{...s.btn, backgroundColor: 'transparent', color: '#0070f3'}} onClick={() => handleAuth('signup')}>צור חשבון</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.main} dir="rtl">
      <div style={{...s.card, maxWidth: '500px'}}>
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
          <h2 style={{color: '#0070f3', margin: 0}}>הגדרות פרופיל 🥗</h2>
          <button onClick={logout} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold'}}>התנתק</button>
        </header>
        <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <label>משקל (ק"ג):</label>
          <input style={s.input} type="number" onChange={e => setProfile({...profile, weight: e.target.value})} />
          <label>גובה (ס"מ):</label>
          <input style={s.input} type="number" onChange={e => setProfile({...profile, height: e.target.value})} />
          <label>גיל:</label>
          <input style={s.input} type="number" onChange={e => setProfile({...profile, age: e.target.value})} />
          <label>מטרה:</label>
          <select style={s.input} onChange={e => setProfile({...profile, goal: e.target.value})}>
            <option value="maintain">שמירה על הקיים</option>
            <option value="muscle">בניית שריר</option>
            <option value="lose">ירידה במשקל</option>
          </select>
          <button style={s.btn} onClick={handleCalc}>חשב יעדים יומיים</button>
        </div>

        {results && (
          <div style={{marginTop: '30px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '15px'}}>
            <h3 style={{margin: '0 0 10px 0'}}>יעדים יומיים:</h3>
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
              <div><small>קלוריות</small><div style={{fontSize: '24px', fontWeight: 'bold'}}>{results.calories}</div></div>
              <div><small>חלבון</small><div style={{fontSize: '24px', fontWeight: 'bold'}}>{results.protein}גרם</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
