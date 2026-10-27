import React, { useState } from 'react';
import { useTheme } from './ThemeContext';

const MOCK_ADMINS = [
  { id: 1, name: 'Priya Mehta', email: 'priya@sdc.com', avatar: 'PM', role: 'admin', department: 'Frontend', status: 'active' },
  { id: 2, name: 'Vikram Singh', email: 'vikram@sdc.com', avatar: 'VS', role: 'admin', department: 'Backend', status: 'active' },
];

const MOCK_INTERNS = [
  { id: 1, name: 'Arjun Sharma', email: 'arjun@sdc.com', avatar: 'AS', role: 'intern', department: 'Frontend', status: 'active', joinDate: '2024-08-01' },
  { id: 2, name: 'Neha Gupta', email: 'neha@sdc.com', avatar: 'NG', role: 'intern', department: 'Design', status: 'active', joinDate: '2024-08-15' },
  { id: 3, name: 'Rohan Jain', email: 'rohan@sdc.com', avatar: 'RJ', role: 'intern', department: 'Backend', status: 'active', joinDate: '2024-09-01' },
  { id: 4, name: 'Siya Patel', email: 'siya@sdc.com', avatar: 'SP', role: 'intern', department: 'Full Stack', status: 'inactive', joinDate: '2024-07-15' },
];

const MOCK_PROJECTS = [
  { id: 1, name: 'SDC Portal', desc: 'Internal team management platform', status: 'active', progress: 65, team: ['PM', 'AS', 'NG'] },
  { id: 2, name: 'MUJ App', desc: 'Mobile application for MUJ students', status: 'active', progress: 40, team: ['VS', 'RJ'] },
  { id: 3, name: 'Alumni Network', desc: 'Platform connecting MUJ alumni', status: 'planning', progress: 10, team: ['PM', 'SP'] },
];

export function SuperAdminDashboard({ user, activePage }) {
  const { theme, isDark } = useTheme();
  const [members, setMembers] = useState([...MOCK_ADMINS, ...MOCK_INTERNS]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'intern', department: '' });
  const [projects] = useState(MOCK_PROJECTS);

  const admins = members.filter(m => m.role === 'admin');
  const interns = members.filter(m => m.role === 'intern');

  const addMember = () => {
    if (!newMember.name || !newMember.email) return;
    const initials = newMember.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    setMembers(prev => [...prev, { ...newMember, id: Date.now(), avatar: initials, status: 'active', joinDate: new Date().toISOString().slice(0, 10) }]);
    setNewMember({ name: '', email: '', role: 'intern', department: '' });
    setShowAddModal(false);
  };

  const toggleStatus = (id) => setMembers(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m));
  const removeMember = (id) => setMembers(prev => prev.filter(m => m.id !== id));

  const s = makeStyles(theme, isDark);

  if (activePage === 'team') return <TeamView theme={theme} isDark={isDark} members={members} admins={admins} interns={interns} onAdd={() => setShowAddModal(true)} onToggle={toggleStatus} onRemove={removeMember} showAddModal={showAddModal} setShowAddModal={setShowAddModal} newMember={newMember} setNewMember={setNewMember} addMember={addMember} />;
  if (activePage === 'analytics') return <AnalyticsView theme={theme} isDark={isDark} members={members} projects={projects} />;
  if (activePage === 'projects') return <ProjectsView theme={theme} isDark={isDark} projects={projects} />;

  return (
    <div style={s.page}>
      {/* Welcome */}
      <div style={s.welcome}>
        <div>
          <h2 style={s.welcomeTitle}>Super Admin Control 🎯</h2>
          <p style={s.welcomeSub}>Full platform oversight — team, tasks, and analytics</p>
        </div>
        <button id="add-member-btn" onClick={() => setShowAddModal(true)} style={s.createBtn}>
          ＋ Add Member
        </button>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { label: 'Total Members', value: members.length, icon: '👥', color: '#C64B47' },
          { label: 'Admins', value: admins.length, icon: '🛡', color: '#f59e0b' },
          { label: 'Interns', value: interns.length, icon: '🎓', color: '#3b82f6' },
          { label: 'Projects', value: projects.length, icon: '📁', color: '#10b981' },
        ].map(st => (
          <div key={st.label} style={{ ...s.statCard, borderTop: `3px solid ${st.color}` }}>
            <span style={{ fontSize: '1.75rem' }}>{st.icon}</span>
            <div>
              <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick overview: Projects */}
      <div style={s.twoCol}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Active Projects</h3>
          <div style={s.projectList}>
            {projects.map(proj => (
              <div key={proj.id} style={s.projectItem}>
                <div style={s.projectHeader}>
                  <span style={s.projectName}>{proj.name}</span>
                  <span style={{ ...s.projStatus, background: proj.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: proj.status === 'active' ? '#10b981' : '#6b7280' }}>
                    {proj.status}
                  </span>
                </div>
                <p style={s.projectDesc}>{proj.desc}</p>
                <div style={s.progressRow}>
                  <div style={s.projBar}>
                    <div style={{ ...s.projBarFill, width: `${proj.progress}%` }} />
                  </div>
                  <span style={s.projPct}>{proj.progress}%</span>
                </div>
                <div style={s.teamAvatars}>
                  {proj.team.map(av => (
                    <div key={av} style={s.teamAv} title={av}>{av}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.card}>
          <h3 style={s.cardTitle}>Team Overview</h3>
          <div style={s.memberList}>
            {members.slice(0, 6).map(m => (
              <div key={m.id} style={s.memberRow}>
                <div style={{ ...s.memberAv, background: m.role === 'admin' ? '#f59e0b22' : '#3b82f622', color: m.role === 'admin' ? '#f59e0b' : '#3b82f6' }}>{m.avatar}</div>
                <div style={s.memberInfo}>
                  <span style={s.memberName}>{m.name}</span>
                  <span style={s.memberRole}>{m.role === 'super_admin' ? 'Super Admin' : m.role === 'admin' ? 'Admin' : 'Intern'}</span>
                </div>
                <span style={{ ...s.statusDot, background: m.status === 'active' ? '#10b981' : '#6b7280' }} title={m.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && <AddMemberModal theme={theme} isDark={isDark} newMember={newMember} setNewMember={setNewMember} onAdd={addMember} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function TeamView({ theme, isDark, members, admins, interns, onAdd, onToggle, onRemove, showAddModal, setShowAddModal, newMember, setNewMember, addMember }) {
  const [tab, setTab] = useState('all');
  const filtered = tab === 'all' ? members : tab === 'admin' ? admins : interns;
  const tabColor = { all: '#C64B47', admin: '#f59e0b', intern: '#3b82f6' };
  const s = makeStyles(theme, isDark);

  return (
    <div style={s.page}>
      <div style={s.welcome}>
        <div>
          <h2 style={s.welcomeTitle}>Team Management</h2>
          <p style={s.welcomeSub}>Manage all admins and interns</p>
        </div>
        <button id="add-member-team-btn" onClick={onAdd} style={s.createBtn}>＋ Add Member</button>
      </div>
      <div style={s.tabRow}>
        {[{ key: 'all', label: `All (${members.length})` }, { key: 'admin', label: `Admins (${admins.length})` }, { key: 'intern', label: `Interns (${interns.length})` }].map(t => (
          <button key={t.key} id={`tab-${t.key}`} onClick={() => setTab(t.key)} style={{
            ...s.tabBtn,
            background: tab === t.key ? tabColor[t.key] : theme.cardBg,
            color: tab === t.key ? '#fff' : theme.textSecondary,
            border: `1px solid ${tab === t.key ? tabColor[t.key] : theme.border}`,
          }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={s.memberGrid}>
        {filtered.map(m => {
          const roleColor = m.role === 'admin' ? '#f59e0b' : '#3b82f6';
          return (
            <div key={m.id} style={s.memberCard}>
              <div style={{ ...s.bigMemberAv, background: roleColor + '22', color: roleColor }}>{m.avatar}</div>
              <h4 style={s.mcName}>{m.name}</h4>
              <p style={s.mcEmail}>{m.email}</p>
              <div style={s.mcMeta}>
                <span style={{ ...s.roleBadge, background: roleColor + '22', color: roleColor }}>{m.role === 'admin' ? 'Admin' : 'Intern'}</span>
                <span style={{ ...s.statusPill, background: m.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: m.status === 'active' ? '#10b981' : '#6b7280' }}>{m.status}</span>
              </div>
              {m.department && <p style={s.mcDept}>{m.department}</p>}
              <div style={s.mcActions}>
                <button onClick={() => onToggle(m.id)} style={s.mcToggleBtn}>
                  {m.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => onRemove(m.id)} style={s.mcDeleteBtn}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>
      {showAddModal && <AddMemberModal theme={theme} isDark={isDark} newMember={newMember} setNewMember={setNewMember} onAdd={addMember} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AnalyticsView({ theme, isDark, members, projects }) {
  const active = members.filter(m => m.status === 'active').length;
  const pct = members.length ? Math.round((active / members.length) * 100) : 0;
  const s = makeStyles(theme, isDark);

  return (
    <div style={s.page}>
      <div style={s.welcome}>
        <div>
          <h2 style={s.welcomeTitle}>Analytics Overview 📊</h2>
          <p style={s.welcomeSub}>Platform metrics and insights</p>
        </div>
      </div>
      <div style={s.statsGrid}>
        {[
          { label: 'Active Members', value: active, icon: '✅', color: '#10b981' },
          { label: 'Active Rate', value: `${pct}%`, icon: '📈', color: '#3b82f6' },
          { label: 'Ongoing Projects', value: projects.filter(p => p.status === 'active').length, icon: '🚀', color: '#C64B47' },
          { label: 'Avg. Progress', value: `${Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length)}%`, icon: '⚡', color: '#f59e0b' },
        ].map(st => (
          <div key={st.label} style={{ ...s.statCard, borderTop: `3px solid ${st.color}` }}>
            <span style={{ fontSize: '1.75rem' }}>{st.icon}</span>
            <div>
              <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <h3 style={s.cardTitle}>Project Progress Breakdown</h3>
        <div style={s.analyticsProjects}>
          {projects.map(proj => (
            <div key={proj.id} style={s.analyticsRow}>
              <span style={s.analyticsName}>{proj.name}</span>
              <div style={s.analyticsBar}>
                <div style={{ ...s.analyticsBarFill, width: `${proj.progress}%`, background: proj.progress >= 60 ? '#10b981' : proj.progress >= 30 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <span style={s.analyticsPct}>{proj.progress}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={s.twoCol}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Members by Role</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Admins', count: members.filter(m => m.role === 'admin').length, color: '#f59e0b' },
              { label: 'Interns', count: members.filter(m => m.role === 'intern').length, color: '#3b82f6' },
            ].map(r => (
              <div key={r.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: theme.textSecondary, fontSize: '0.88rem' }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: 700 }}>{r.count}</span>
                </div>
                <div style={s.analyticsBar}>
                  <div style={{ ...s.analyticsBarFill, width: `${(r.count / members.length) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Activity Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Active', count: members.filter(m => m.status === 'active').length, color: '#10b981' },
              { label: 'Inactive', count: members.filter(m => m.status === 'inactive').length, color: '#6b7280' },
            ].map(r => (
              <div key={r.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: theme.textSecondary, fontSize: '0.88rem' }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: 700 }}>{r.count}</span>
                </div>
                <div style={s.analyticsBar}>
                  <div style={{ ...s.analyticsBarFill, width: `${(r.count / members.length) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsView({ theme, isDark, projects }) {
  const s = makeStyles(theme, isDark);

  return (
    <div style={s.page}>
      <div style={s.welcome}>
        <div>
          <h2 style={s.welcomeTitle}>All Projects</h2>
          <p style={s.welcomeSub}>Overview of all ongoing and planned projects</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {projects.map(proj => (
          <div key={proj.id} style={s.bigProjectCard}>
            <div style={s.projectHeader}>
              <span style={s.projectName}>{proj.name}</span>
              <span style={{ ...s.projStatus, background: proj.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: proj.status === 'active' ? '#10b981' : '#6b7280' }}>
                {proj.status}
              </span>
            </div>
            <p style={s.projectDesc}>{proj.desc}</p>
            <div style={s.progressRow}>
              <span style={{ color: theme.textMuted, fontSize: '0.8rem' }}>Progress</span>
              <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>{proj.progress}%</span>
            </div>
            <div style={s.projBar}>
              <div style={{ ...s.projBarFill, width: `${proj.progress}%` }} />
            </div>
            <div style={{ ...s.teamAvatars, marginTop: '1rem' }}>
              {proj.team.map(av => <div key={av} style={s.teamAv} title={av}>{av}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddMemberModal({ theme, isDark, newMember, setNewMember, onAdd, onClose }) {
  const s = makeStyles(theme, isDark);

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Add Team Member</h3>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>
        <div style={s.modalBody}>
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Arjun Sharma' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'e.g. arjun@sdc.com' },
            { label: 'Department', key: 'department', type: 'text', placeholder: 'e.g. Frontend, Backend, Design' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={s.inputGroup}>
              <label style={s.inputLabel}>{label}</label>
              <input
                id={`member-${key}`}
                type={type}
                value={newMember[key]}
                onChange={e => setNewMember(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                style={s.input}
              />
            </div>
          ))}
          <div style={s.inputGroup}>
            <label style={s.inputLabel}>Role</label>
            <select id="member-role" value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))} style={s.input}>
              <option value="intern">Intern</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button id="add-member-submit" onClick={onAdd} style={s.createBtn}>Add Member</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Theme-aware styles factory ─── */
function makeStyles(theme, isDark) {
  const barBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return {
    page: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    welcome: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: isDark ? 'rgba(198,75,71,0.08)' : 'rgba(198,75,71,0.06)',
      border: `1px solid ${isDark ? 'rgba(198,75,71,0.15)' : 'rgba(198,75,71,0.18)'}`,
      borderRadius: 16, padding: '1.5rem 2rem', flexWrap: 'wrap', gap: '1rem',
    },
    welcomeTitle: { fontSize: '1.4rem', fontWeight: 700, color: theme.textPrimary, margin: 0, fontFamily: "'Outfit', sans-serif" },
    welcomeSub: { color: theme.textMuted, fontSize: '0.9rem', marginTop: '0.25rem' },
    createBtn: {
      background: 'linear-gradient(90deg, #C64B47, #E68A2E)', color: '#fff',
      border: 'none', borderRadius: 10, padding: '0.7rem 1.4rem',
      fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' },
    statCard: {
      background: theme.cardBg, border: `1px solid ${theme.border}`,
      borderRadius: 14, padding: '1.25rem 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      boxShadow: isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
    },
    statValue: { fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" },
    statLabel: { fontSize: '0.78rem', color: theme.textMuted, marginTop: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' },
    card: {
      background: theme.cardBg, border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: '1.5rem',
      boxShadow: isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
    },
    cardTitle: { fontSize: '1rem', fontWeight: 700, color: theme.textPrimary, marginBottom: '1.25rem', marginTop: 0 },
    projectList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    projectItem: {
      padding: '1rem', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: 12, border: `1px solid ${theme.border}`,
    },
    projectHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' },
    projectName: { fontSize: '0.9rem', fontWeight: 700, color: theme.textPrimary },
    projectDesc: { fontSize: '0.78rem', color: theme.textMuted, margin: '0.3rem 0 0.5rem' },
    projStatus: { padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 },
    progressRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' },
    projBar: { height: 5, background: barBg, borderRadius: 100, overflow: 'hidden', flex: 1 },
    projBarFill: { height: '100%', background: 'linear-gradient(90deg, #C64B47, #E68A2E)', borderRadius: 100 },
    projPct: { fontSize: '0.78rem', color: theme.textMuted, marginLeft: '0.5rem' },
    teamAvatars: { display: 'flex', gap: '0.3rem', marginTop: '0.5rem' },
    teamAv: {
      width: 24, height: 24, borderRadius: '50%',
      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      color: theme.textSecondary,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700,
    },
    memberList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    memberRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    memberAv: { width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 },
    memberInfo: { flex: 1 },
    memberName: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: theme.textPrimary },
    memberRole: { fontSize: '0.72rem', color: theme.textMuted, textTransform: 'capitalize' },
    statusDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
    tabRow: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
    tabBtn: { padding: '0.45rem 1rem', borderRadius: 100, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 600 },
    memberGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
    memberCard: {
      background: theme.cardBg, border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: '1.5rem', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
      boxShadow: isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
    },
    bigMemberAv: { width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' },
    mcName: { fontSize: '0.95rem', fontWeight: 700, color: theme.textPrimary, margin: 0 },
    mcEmail: { fontSize: '0.75rem', color: theme.textMuted, margin: 0 },
    mcMeta: { display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.3rem' },
    roleBadge: { padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 },
    statusPill: { padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 },
    mcDept: { fontSize: '0.78rem', color: theme.textMuted, margin: 0 },
    mcActions: { display: 'flex', gap: '0.4rem', marginTop: '0.75rem' },
    mcToggleBtn: {
      flex: 1, padding: '0.45rem 0.5rem',
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      border: `1px solid ${theme.border}`,
      color: theme.textSecondary, borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif",
    },
    mcDeleteBtn: {
      flex: 1, padding: '0.45rem 0.5rem',
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
      color: '#f87171', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif",
    },
    analyticsProjects: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    analyticsRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
    analyticsName: { width: 140, fontSize: '0.85rem', color: theme.textSecondary, flexShrink: 0 },
    analyticsBar: { flex: 1, height: 8, background: barBg, borderRadius: 100, overflow: 'hidden' },
    analyticsBarFill: { height: '100%', borderRadius: 100 },
    analyticsPct: { width: 36, textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, flexShrink: 0 },
    bigProjectCard: {
      background: theme.cardBg, border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: '1.5rem',
      boxShadow: isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
    },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' },
    modal: {
      background: theme.modalBg, border: `1px solid ${theme.border}`,
      borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: `1px solid ${theme.border}` },
    modalTitle: { fontSize: '1.1rem', fontWeight: 700, color: theme.textPrimary, margin: 0 },
    closeBtn: { background: 'none', border: 'none', color: theme.textMuted, fontSize: '1.1rem', cursor: 'pointer' },
    modalBody: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    inputLabel: { fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: {
      background: theme.inputBg, border: `1px solid ${theme.borderInput}`,
      color: theme.textPrimary, borderRadius: 10, padding: '0.7rem 1rem',
      fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', outline: 'none',
    },
  };
}
