import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        // Demo mode - simulate login with mock roles
        const demoUsers = {
          'intern@sdc.com': { role: 'intern', name: 'Arjun Sharma' },
          'admin@sdc.com': { role: 'admin', name: 'Priya Mehta' },
          'superadmin@sdc.com': { role: 'super_admin', name: 'Rahul Verma' },
        };
        const demoUser = demoUsers[email.toLowerCase()];
        if (demoUser && password === 'demo123') {
          onLogin({ email, ...demoUser, id: Math.random().toString(36) });
        } else {
          setError('Demo credentials: intern@sdc.com / admin@sdc.com / superadmin@sdc.com  (password: demo123)');
        }
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      // Fetch user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;
      onLogin({ ...data.user, ...profile });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoBars}>
            <div style={{ ...styles.bar, background: '#C64B47' }} />
            <div style={{ ...styles.bar, background: '#C99E10' }} />
            <div style={{ ...styles.bar, background: '#E68A2E' }} />
          </div>
          <span style={styles.logoText}>SDC</span>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h1 style={styles.cardTitle}>Team Portal</h1>
            <p style={styles.cardSubtitle}>Software Development Centre · MUJ</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>✉</span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@muj.manipal.edu"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={styles.showPassBtn}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={styles.spinnerRow}>
                  <span style={styles.spinner} /> Signing in...
                </span>
              ) : 'Sign In to Portal'}
            </button>
          </form>

          <div style={styles.demoHint}>
            <p style={styles.demoTitle}>Demo Access</p>
            <div style={styles.demoGrid}>
              {[
                { role: 'Intern', email: 'intern@sdc.com', color: '#3b82f6' },
                { role: 'Admin', email: 'admin@sdc.com', color: '#8b5cf6' },
                { role: 'Super Admin', email: 'superadmin@sdc.com', color: '#C64B47' },
              ].map(({ role, email: demoEmail, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setEmail(demoEmail); setPassword('demo123'); }}
                  style={{ ...styles.demoChip, borderColor: color, color }}
                >
                  {role}
                </button>
              ))}
            </div>
            <p style={styles.demoPass}>Password: <code style={styles.demoCode}>demo123</code></p>
          </div>
        </div>

        <p style={styles.footer}>© 2024 SDC, Manipal University Jaipur · All rights reserved</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '2rem',
  },
  orb1: {
    position: 'absolute', top: '-10%', right: '-5%',
    width: 500, height: 500, borderRadius: '50%',
    background: '#C64B47', filter: 'blur(130px)', opacity: 0.15,
    animation: 'float 20s infinite alternate ease-in-out',
  },
  orb2: {
    position: 'absolute', bottom: '5%', left: '-5%',
    width: 400, height: 400, borderRadius: '50%',
    background: '#E68A2E', filter: 'blur(130px)', opacity: 0.12,
  },
  orb3: {
    position: 'absolute', top: '40%', left: '40%',
    width: 300, height: 300, borderRadius: '50%',
    background: '#C99E10', filter: 'blur(100px)', opacity: 0.08,
  },
  container: {
    width: '100%', maxWidth: 440,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
    position: 'relative', zIndex: 2,
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
  },
  logoBars: {
    display: 'flex', gap: 4, height: 36,
  },
  bar: {
    width: 8, height: '100%', borderRadius: 2,
  },
  logoText: {
    fontSize: '2.5rem', fontWeight: 900, color: '#fff',
    letterSpacing: '-1px', fontFamily: "'Outfit', sans-serif",
  },
  card: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '2.5rem',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  cardHeader: {
    textAlign: 'center', marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: '1.75rem', fontWeight: 700,
    color: '#fff', margin: 0, fontFamily: "'Outfit', sans-serif",
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.4rem',
  },
  errorBox: {
    background: 'rgba(198,75,71,0.15)', border: '1px solid rgba(198,75,71,0.3)',
    borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '1.5rem',
    color: '#f87171', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
  },
  errorIcon: { flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '0.85rem', fontSize: '1rem', pointerEvents: 'none', opacity: 0.6 },
  input: {
    width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif", outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  showPassBtn: {
    position: 'absolute', right: '0.85rem',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.6,
  },
  submitBtn: {
    width: '100%', padding: '0.95rem',
    background: 'linear-gradient(90deg, #C64B47, #E68A2E)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '0.5rem',
  },
  spinnerRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
  spinner: {
    display: 'inline-block', width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
  demoHint: {
    marginTop: '1.75rem', paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    textAlign: 'center',
  },
  demoTitle: { color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' },
  demoGrid: { display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' },
  demoChip: {
    padding: '0.35rem 0.85rem', borderRadius: 100,
    background: 'transparent', border: '1px solid',
    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  demoPass: { color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' },
  demoCode: { background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: 4, color: '#C99E10' },
  footer: { color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', textAlign: 'center' },
};
