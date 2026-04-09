import React, { useState } from 'react';
import axios from 'axios';

const URGENCY_COLOR = { Emergency: '#dc2626', Urgent: '#ea580c', Moderate: '#d97706', Routine: '#0284c7' };
const PROB_COLOR = { High: '#dc2626', Medium: '#d97706', Low: '#0284c7' };

export default function Diagnosis({ user, onLogout }) {
  const [form, setForm] = useState({ symptoms: '', age: '', gender: '', duration: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('medi_token');
      const BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

const { data } = await axios.post(`${BASE_URL}/api/diagnosis/analyze`, form, { 
  headers: { Authorization: `Bearer ${token}` } 
});
      setResult(data.diagnosis);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  const s = {
    page: { minHeight: '100vh', background: '#eef2f7', fontFamily: 'Segoe UI, Arial, sans-serif' },
    nav: { background: '#3b6ff0', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    navTitle: { fontWeight: 'bold', fontSize: '18px' },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' },
    logoutBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' },
    main: { maxWidth: '1100px', margin: '30px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' },
    card: { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
    cardTitle: { fontWeight: 'bold', fontSize: '16px', marginBottom: '20px', color: '#3b6ff0', borderBottom: '2px solid #e8f0ff', paddingBottom: '10px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#444' },
    input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', marginBottom: '14px', background: '#fafafa', outline: 'none' },
    textarea: { width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', marginBottom: '14px', minHeight: '100px', resize: 'vertical', background: '#fafafa', outline: 'none' },
    select: { width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', marginBottom: '14px', background: '#fafafa' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    btn: { width: '100%', padding: '12px', background: '#3b6ff0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
    empty: { textAlign: 'center', padding: '60px 20px', color: '#aaa' },
    emptyIcon: { fontSize: '48px', marginBottom: '12px' },
    error: { background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: '8px', padding: '12px', color: '#cc3333' },
    urgencyBadge: (u) => ({ display: 'inline-block', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#fff', background: URGENCY_COLOR[u] || '#888', marginBottom: '16px' }),
    mlBox: { background: '#f0f4ff', border: '1px solid #c5d5fb', borderRadius: '10px', padding: '16px', marginBottom: '16px' },
    mlTitle: { fontWeight: '700', color: '#3b6ff0', fontSize: '14px', marginBottom: '10px' },
    mlRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '6px' },
    mlValue: { fontWeight: '600', color: '#3b6ff0' },
    aiBox: { background: '#f0f4ff', border: '1px solid #c5d5fb', borderRadius: '10px', padding: '16px', marginBottom: '16px' },
    aiTitle: { fontWeight: '700', color: '#3b6ff0', fontSize: '14px', marginBottom: '8px' },
    condCard: { border: '1px solid #e8f0ff', borderRadius: '10px', padding: '14px', marginBottom: '10px' },
    condHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
    condName: { fontWeight: '700', fontSize: '15px', color: '#1a1a2e' },
    probBadge: (p) => ({ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#fff', background: PROB_COLOR[p] || '#888' }),
    condDesc: { fontSize: '13px', color: '#666', marginBottom: '8px' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    tag: { background: '#e8f0ff', color: '#3b6ff0', padding: '2px 10px', borderRadius: '4px', fontSize: '12px' },
    sectionTitle: { fontWeight: '700', fontSize: '14px', color: '#3b6ff0', marginTop: '16px', marginBottom: '10px' },
    actionItem: { background: '#fafafa', border: '1px solid #eee', borderRadius: '6px', padding: '8px 12px', marginBottom: '6px', fontSize: '13px', color: '#444' },
    adviceBox: { background: '#f0f4ff', border: '1px solid #c5d5fb', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#3b6ff0', marginTop: '8px' },
    warningBox: { background: '#fff3f3', border: '1px solid #ffd0d0', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#cc3333', marginTop: '8px' },
    disclaimer: { background: '#fffbeb', border: '1px solid #ffe082', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#856404', marginTop: '8px' },
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle}> MediAI — AI Symptom Diagnosis</span>
        <div style={s.navRight}>
          <span>👤 {user.name}</span>
          <button style={s.logoutBtn} onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      <div style={s.main}>
        <div style={s.card}>
          <div style={s.cardTitle}>📋 Enter Symptoms</div>
          <form onSubmit={handleSubmit}>
            <label style={s.label}>Symptoms *</label>
            <textarea style={s.textarea} placeholder="Describe your symptoms e.g. headache, fever, sore throat..." value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} required />
            <div style={s.row}>
              <div>
                <label style={s.label}>Age</label>
                <input style={s.input} type="number" placeholder="e.g. 25" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              </div>
              <div>
                <label style={s.label}>Gender</label>
                <select style={s.select} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <label style={s.label}>Duration</label>
            <select style={s.select} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
              <option value="">Select duration</option>
              <option>Less than 24 hours</option>
              <option>1-3 days</option>
              <option>3-7 days</option>
              <option>1-2 weeks</option>
              <option>More than 2 weeks</option>
            </select>
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? '🔬 Analyzing...' : '🔍 Analyze Symptoms'}
            </button>
          </form>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>📊 Diagnosis Results</div>

          {!result && !loading && !error && (
            <div style={s.empty}>
              <div style={s.emptyIcon}>🏥</div>
              <p>Enter your symptoms and click Analyze to get results</p>
            </div>
          )}

          {loading && (
            <div style={s.empty}>
              <div style={s.emptyIcon}>⚙️</div>
              <p>Analyzing your symptoms...</p>
            </div>
          )}

          {error && <div style={s.error}>⚠️ {error}</div>}

          {result && !loading && (
            <div>
              <span style={s.urgencyBadge(result.urgencyLevel)}>
                {result.urgencyLevel === 'Emergency' ? '🚨' : result.urgencyLevel === 'Urgent' ? '⚡' : result.urgencyLevel === 'Moderate' ? '⚠️' : '✅'} {result.urgencyLevel}
              </span>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>{result.urgencyExplanation}</p>

              {/* ML Model Insights */}
              {result.mlInsights && (
                <div style={s.mlBox}>
                  <div style={s.mlTitle}>🤖 ML Model Prediction</div>
                  <div style={s.mlRow}>
                    <span>Top Prediction</span>
                    <span style={s.mlValue}>{result.mlInsights.prediction}</span>
                  </div>
                  <div style={s.mlRow}>
                    <span>Confidence</span>
                    <span style={s.mlValue}>{result.mlInsights.confidence}%</span>
                  </div>
                  {result.mlInsights.symptomsMatched?.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Matched symptoms:</div>
                      <div style={s.tags}>
                        {result.mlInsights.symptomsMatched.map((s, i) => (
                          <span key={i} style={{ background: '#e8f0ff', color: '#3b6ff0', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gemini AI Insights */}
              {result.aiInsights && (
                <div style={s.aiBox}>
                  <div style={s.aiTitle}>🧠 Gemini AI Insights</div>
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>{result.aiInsights.aiSummary}</p>
                  {result.aiInsights.keyWarning && (
                    <p style={{ fontSize: '13px', color: '#cc3333', marginTop: '8px', fontWeight: '600' }}>⚠️ {result.aiInsights.keyWarning}</p>
                  )}
                </div>
              )}

              {/* Possible Conditions */}
              {result.possibleConditions?.length > 0 && (
                <>
                  <div style={s.sectionTitle}>🩺 Possible Conditions</div>
                  {result.possibleConditions.map((c, i) => (
                    <div key={i} style={s.condCard}>
                      <div style={s.condHeader}>
                        <span style={s.condName}>{c.name}</span>
                        <span style={s.probBadge(c.probability)}>{c.probability}</span>
                      </div>
                      <p style={s.condDesc}>{c.description}</p>
                      <div style={s.tags}>
                        {c.matchingSymptoms?.map((sym, j) => <span key={j} style={s.tag}>{sym}</span>)}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {result.recommendedActions?.length > 0 && (
                <>
                  <div style={s.sectionTitle}>✅ Recommended Actions</div>
                  {result.recommendedActions.map((a, i) => <div key={i} style={s.actionItem}>• {a}</div>)}
                </>
              )}

              {result.generalAdvice && <div style={s.adviceBox}>💡 {result.generalAdvice}</div>}
              {result.whenToSeekImmediateCare && <div style={s.warningBox}>🚑 <strong>Seek Care If:</strong> {result.whenToSeekImmediateCare}</div>}
              <div style={s.disclaimer}>⚕️ {result.disclaimer}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
