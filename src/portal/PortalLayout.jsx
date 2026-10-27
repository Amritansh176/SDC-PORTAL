import React, { useState } from 'react';
import { useTheme } from './ThemeContext';

const ROLE_CONFIG = {
  intern: {
    label: 'Intern',
    color: '#3b82f6',
    nav: [
      { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
      { id: 'tasks', icon: '✅', label: 'My Tasks' },
      { id: 'projects', icon: '📁', label: 'My Projects' },
      { id: 'profile', icon: '👤', label: 'Profile' },
    ],
  },
  admin: {
    label: 'Admin',
    color: '#8b5cf6',
    nav: [
      { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
      { id: 'tasks', icon: '📋', label: 'Task Management' },
      { id: 'projects', icon: '📁', label: 'Projects' },
      { id: 'interns', icon: '👥', label: 'Interns' },
      { id: 'profile', icon: '👤', label: 'Profile' },
    ],
  },
  super_admin: {
    label: 'Super Admin',
    color: '#C64B47',
    nav: [
      { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
      { id: 'tasks', icon: '📋', label: 'Task Management' },
      { id: 'projects', icon: '📁', label: 'All Projects' },
      { id: 'team', icon: '👥', label: 'Team Management' },
      { id: 'analytics', icon: '📊', label: 'Analytics' },
      { id: 'profile', icon: '👤', label: 'Profile' },
    ],
  },
};

export default function PortalLayout({ user, onLogout, children, activePage, setActivePage }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, isDark, toggle } = useTheme();

  const role = user.role || 'intern';
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.intern;
  const initials = (user.name || user.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      background: theme.pageBg,
      fontFamily: "'Inter', sans-serif", overflow: 'hidden',
      transition: 'background 0.25s ease, color 0.25s ease',
    }}>
      {/* ─── Sidebar ─── */}
      <aside style={{
        width: sidebarOpen ? 240 : 72,
        background: theme.sidebarBg,
        borderRight: `1px solid ${theme.border}`,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease, background 0.25s ease',
        flexShrink: 0, overflow: 'hidden',
        boxShadow: isDark ? 'none' : '2px 0 12px rgba(0,0,0,0.06)',
      }}>
        {/* Logo row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          padding: '1.2rem 1rem', borderBottom: `1px solid ${theme.border}`, minHeight: 64,
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', gap: 3, height: 26 }}>
                {['#C64B47', '#C99E10', '#E68A2E'].map(c => (
                  <div key={c} style={{ width: 6, height: '100%', borderRadius: 2, background: c }} />
                ))}
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: theme.textPrimary, letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
                SDC
              </span>
            </div>
          )}
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: theme.cardBg, border: `1px solid ${theme.border}`,
              color: theme.textMuted, borderRadius: 8, width: 28, height: 28,
              cursor: 'pointer', fontSize: '0.65rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div style={{
            margin: '0.75rem 1rem',
            padding: '0.3rem 0.75rem', borderRadius: 100,
            background: theme.roleBadgeBg(cfg.color),
            border: `1px solid ${cfg.color}44`,
            color: cfg.color,
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', width: 'fit-content',
          }}>
            {cfg.label}
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0.5rem', overflowY: 'auto' }}>
          {cfg.nav.map(item => {
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: sidebarOpen ? '0.75rem' : 0,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  padding: '0.65rem 0.75rem', borderRadius: 10,
                  border: 'none', cursor: 'pointer', width: '100%',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 500,
                  transition: 'all 0.15s ease', textAlign: 'left',
                  background: active ? `${cfg.color}1a` : 'transparent',
                  borderLeft: active ? `3px solid ${cfg.color}` : '3px solid transparent',
                  color: active ? cfg.color : theme.textSecondary,
                }}
                title={!sidebarOpen ? item.label : ''}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0, width: 20, textAlign: 'center' }}>{item.icon}</span>
                {sidebarOpen && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom user + logout */}
        <div style={{ borderTop: `1px solid ${theme.border}`, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `${cfg.color}22`, color: cfg.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
              }}>{initials}</div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || 'User'}
                </span>
                <span style={{ fontSize: '0.72rem', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `${cfg.color}22`, color: cfg.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, margin: '0 auto',
            }}>{initials}</div>
          )}

          <button
            id="logout-btn"
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '0.5rem',
              background: theme.logoutBg,
              border: `1px solid ${theme.logoutBorder}`,
              color: '#ef4444', borderRadius: 8,
              padding: '0.5rem 0.75rem',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem', fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            title="Logout"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 2rem',
          borderBottom: `1px solid ${theme.border}`,
          background: theme.topbarBg,
          flexShrink: 0, minHeight: 64,
          boxShadow: isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
          transition: 'background 0.25s ease',
        }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.textPrimary, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              {cfg.nav.find(n => n.id === activePage)?.label || 'Dashboard'}
            </h1>
            <p style={{ fontSize: '0.72rem', color: theme.textMuted, margin: '0.2rem 0 0' }}>
              SDC Portal / {cfg.label} / {cfg.nav.find(n => n.id === activePage)?.label}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Dark/Light toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggle}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
                borderRadius: 10, padding: '0.4rem 0.85rem',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{isDark ? '☀️' : '🌙'}</span>
              <span style={{ color: theme.textSecondary }}>{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Notifications */}
            <button id="topbar-notif" style={{
              background: theme.cardBg, border: `1px solid ${theme.border}`,
              color: theme.textSecondary, borderRadius: 10, width: 36, height: 36,
              cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} title="Notifications">🔔</button>

            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `${cfg.color}22`, color: cfg.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700,
            }}>{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1.5rem 2rem',
          background: theme.pageBg, transition: 'background 0.25s ease',
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}
