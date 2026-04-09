import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      
      const BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

const url = mode === 'login' 
  ? `${BASE_URL}/api/auth/login` 
  : `${BASE_URL}/api/auth/register`;

const { data } = await axios.post(url, form);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    box: { background: '#fff', padding: '40px', borderRadius: '10px', boxShadow: '0 2px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
    title: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px', color: '#3b6ff0' },
    sub: { textAlign: 'center', color: '#888', marginBottom: '24px', fontSize: '14px' },
    tabs: { display: 'flex', marginBottom: '24px', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' },
    tab: (active) => ({ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontWeight: '600', background: active ? '#3b6ff0' : '#fff', color: active ? '#fff' : '#555' }),
    label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#555' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', outline: 'none' },
    btn: { width: '100%', padding: '12px', background: '#3b6ff0', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
    error: { background: '#fee', border: '1px solid #fcc', borderRadius: '6px', padding: '10px', color: '#c33', fontSize: '13px', marginBottom: '16px' },
  };

  return (
    <div style={s.page}>
      <div style={s.box}>
        <h2 style={s.title}>🧬 MediAI</h2>
        <p style={s.sub}>AI Symptom Diagnosis System</p>
        <div style={s.tabs}>
          <button style={s.tab(mode === 'login')} onClick={() => setMode('login')}>Sign In</button>
          <button style={s.tab(mode === 'register')} onClick={() => setMode('register')}>Register</button>
        </div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label style={s.label}>Full Name</label>
              <input style={s.input} type="text" placeholder="John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </>
          )}
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}