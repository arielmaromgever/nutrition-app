import React, { useState, useEffect } from 'react';
import { auth, registerUser, loginUser, logout, saveUserData, loadUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  // האזנה למצב המשתמש (מחובר/מנותק)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegistering) {
        await registerUser(email, password);
        alert("נרשמת בהצלחה!");
      } else {
        await loginUser(email, password);
        alert("התחברת בהצלחה!");
      }
    } catch (err) {
      let friendlyError = "קרתה שגיאה";
      if (err.code === "auth/weak-password") friendlyError = "הסיסמה חלשה מדי (לפחות 6 תווים)";
      if (err.code === "auth/email-already-in-out") friendlyError = "האימייל הזה כבר רשום";
      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found") friendlyError = "אימייל או סיסמה לא נכונים";
      setError(friendlyError);
    }
  };

  // מסך כניסה/הרשמה
  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#2e7d32' }}>{isRegistering ? "יצירת חשבון חדש" : "כניסה לאפליקציית תזונה"}</h1>
        <div style={{ display: 'inline-block', textAlign: 'right', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#f9f9f9' }}>
          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>אימייל:</label><br/>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                style={{ width: '250px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px' }}/>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>סיסמה:</label><br/>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                style={{ width: '250px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px' }}/>
            </div>
            <button type="submit" style={{ width: '100%', backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
              {isRegistering ? "הירשם עכשיו" : "התחבר למערכת"}
            </button>
            {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>{error}</p>}
          </form>
          <p style={{ marginTop: '20px', fontSize: '14px' }}>
            {isRegistering ? "כבר יש לך חשבון?" : "אין לך חשבון עדיין?"} 
            <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline', marginRight: '5px' }}>
              {isRegistering ? "התחבר כאן" : "הירשם כאן"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // מסך האפליקציה (אחרי התחברות)
  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '10px' }}>
        <h2 style={{ margin: 0, color: '#2e7d32' }}>שלום, {user.email} 👋</h2>
        <button onClick={logout} style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>התנתק</button>
      </header>
      
      <main style={{ marginTop: '30px' }}>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fff', textAlign: 'center' }}>
          <h3>ברוך הבא למערכת המעקב האישית שלך!</h3>
          <p>הכניסה עובדת! עכשיו הנתונים שלך יישמרו בבסיס הנתונים (Firestore).</p>
          <p style={{ fontSize: '14px', color: '#666' }}>בשלב הבא נחזיר לכאן את כל כלי ניתוח האוכל והיומן השבועי.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
