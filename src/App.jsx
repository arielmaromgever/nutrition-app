import React, { useState, useEffect } from 'react';
import { auth, loginUser, registerUser, logout } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleAuth = async (type) => {
    if (!email || !password) return alert("Please enter email and password");
    setLoading(true);
    try {
      if (type === 'login') await loginUser(email, password);
      else await registerUser(email, password);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6" style={{fontFamily: 'sans-serif'}}>
        <div className="text-8xl mb-6">🥗</div>
        <h1 className="text-4xl font-bold mb-8">Nutrition AI</h1>
        <div className="w-full max-w-sm space-y-4">
          <input type="email" placeholder="Email" className="w-full p-4 border rounded-2xl bg-gray-50 outline-none" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-4 border rounded-2xl bg-gray-50 outline-none" onChange={e => setPassword(e.target.value)} />
          <button onClick={() => handleAuth('login')} disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold text-xl shadow-lg">
            {loading ? "Connecting..." : "Log In"}
          </button>
          <button onClick={() => handleAuth('signup')} className="w-full text-blue-600 font-bold">Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-10">Welcome Back! 🥗</h1>
      <button onClick={logout} className="bg-red-500 text-white px-6 py-2 rounded-xl">Logout</button>
    </div>
  );
}
