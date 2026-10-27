import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LoginPage from './auth/LoginPage.jsx'
import Portal from './portal/Portal.jsx'
import { supabase } from './supabaseClient.js'
import './index.css'

// Inject global keyframe animations for login spinner and orbs
const globalStyles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, 30px) scale(1.05); }
    100% { transform: translate(-30px, -15px) scale(0.95); }
  }
  input:focus { border-color: #E68A2E !important; }
  select option { background: #1a1a1a; color: #fff; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 100px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
`
const styleEl = document.createElement('style')
styleEl.textContent = globalStyles
document.head.appendChild(styleEl)

function Root() {
  // 'public' | 'login' | 'portal'
  const [view, setView] = useState('public')
  const [user, setUser] = useState(null)

  // Check for existing Supabase session on mount
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('profiles').select('role, name').eq('id', session.user.id).single().then(({ data }) => {
          if (data) {
            setUser({ ...session.user, ...data })
            setView('portal')
          }
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setView('public')
      }
    })
    return () => subscription?.unsubscribe()
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setView('portal')
  }

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setView('public')
  }

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} onBack={() => setView('public')} />
  }

  if (view === 'portal' && user) {
    return <Portal user={user} onLogout={handleLogout} />
  }

  // Public website - pass portal access button handler
  return <App onPortalClick={() => setView('login')} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)

