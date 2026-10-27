import React, { useState } from 'react';

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

  if (activePage === 'team') return <TeamView members={members} admins={admins} interns={interns} onAdd={() => setShowAddModal(true)} onToggle={toggleStatus} onRemove={removeMember} showAddModal={showAddModal} setShowAddModal={setShowAddModal} newMember={newMember} setNewMember={setNewMember} addMember={addMember} />;
  if (activePage === 'analytics') return <AnalyticsView members={members} projects={projects} />;
  if (activePage === 'projects') return <ProjectsView projects={projects} />;

  return (
    <div style={styles.page}>
      {/* Welcome */}
      <div style={styles.welcome}>
        <div>
          <h2 style={styles.welcomeTitle}>Super Admin Control 🎯</h2>
          <p style={styles.welcomeSub}>Full platform oversight — team, tasks, and analytics</p>
        </div>
        <button id="add-member-btn" onClick={() => setShowAddModal(true)} style={styles.createBtn}>
          ＋ Add Member
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Members', value: members.length, icon: '👥', color: '#C64B47' },
          { label: 'Admins', value: admins.length, icon: '🛡', color: '#f59e0b' },
          { label: 'Interns', value: interns.length, icon: '🎓', color: '#3b82f6' },
          { label: 'Projects', value: projects.length, icon: '📁', color: '#10b981' },
        ].map(s => (
          <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
            <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
            <div>
              <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick overview: Projects */}
      <div style={styles.twoCol}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Active Projects</h3>
          <div style={styles.projectList}>
            {projects.map(proj => (
              <div key={proj.id} style={styles.projectItem}>
                <div style={styles.projectHeader}>
                  <span style={styles.projectName}>{proj.name}</span>
                  <span style={{ ...styles.projStatus, background: proj.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: proj.status === 'active' ? '#10b981' : '#6b7280' }}>
                    {proj.status}
                  </span>
                </div>
                <p style={styles.projectDesc}>{proj.desc}</p>
                <div style={styles.progressRow}>
                  <div style={styles.projBar}>
                    <div style={{ ...styles.projBarFill, width: `${proj.progress}%` }} />
                  </div>
                  <span style={styles.projPct}>{proj.progress}%</span>
                </div>
                <div style={styles.teamAvatars}>
                  {proj.team.map(av => (
                    <div key={av} style={styles.teamAv} title={av}>{av}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Team Overview</h3>
          <div style={styles.memberList}>
            {members.slice(0, 6).map(m => (
              <div key={m.id} style={styles.memberRow}>
                <div style={{ ...styles.memberAv, background: m.role === 'admin' ? '#f59e0b22' : '#3b82f622', color: m.role === 'admin' ? '#f59e0b' : '#3b82f6' }}>{m.avatar}</div>
                <div style={styles.memberInfo}>
                  <span style={styles.memberName}>{m.name}</span>
                  <span style={styles.memberRole}>{m.role === 'super_admin' ? 'Super Admin' : m.role === 'admin' ? 'Admin' : 'Intern'}</span>
                </div>
                <span style={{ ...styles.statusDot, background: m.status === 'active' ? '#10b981' : '#6b7280' }} title={m.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && <AddMemberModal newMember={newMember} setNewMember={setNewMember} onAdd={addMember} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function TeamView({ members, admins, interns, onAdd, onToggle, onRemove, showAddModal, setShowAddModal, newMember, setNewMember, addMember }) {
  const [tab, setTab] = useState('all');
  const filtered = tab === 'all' ? members : tab === 'admin' ? admins : interns;
  const tabColor = { all: '#C64B47', admin: '#f59e0b', intern: '#3b82f6' };

  return (
    <div style={styles.page}>
      <div style={styles.welcome}>
        <div>
          <h2 style={styles.welcomeTitle}>Team Management</h2>
          <p style={styles.welcomeSub}>Manage all admins and interns</p>
        </div>
        <button id="add-member-team-btn" onClick={onAdd} style={styles.createBtn}>＋ Add Member</button>
      </div>
      <div style={styles.tabRow}>
        {[{ key: 'all', label: `All (${members.length})` }, { key: 'admin', label: `Admins (${admins.length})` }, { key: 'intern', label: `Interns (${interns.length})` }].map(t => (
          <button key={t.key} id={`tab-${t.key}`} onClick={() => setTab(t.key)} style={{ ...styles.tabBtn, background: tab === t.key ? tabColor[t.key] : 'rgba(255,255,255,0.05)', color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.4)', border: `1px solid ${tab === t.key ? tabColor[t.key] : 'rgba(255,255,255,0.08)'}` }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={styles.memberGrid}>
        {filtered.map(m => {
          const roleColor = m.role === 'admin' ? '#f59e0b' : '#3b82f6';
          return (
            <div key={m.id} style={styles.memberCard}>
              <div style={{ ...styles.bigMemberAv, background: roleColor + '22', color: roleColor }}>{m.avatar}</div>
              <h4 style={styles.mcName}>{m.name}</h4>
              <p style={styles.mcEmail}>{m.email}</p>
              <div style={styles.mcMeta}>
                <span style={{ ...styles.roleBadge, background: roleColor + '22', color: roleColor }}>{m.role === 'admin' ? 'Admin' : 'Intern'}</span>
                <span style={{ ...styles.statusPill, background: m.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: m.status === 'active' ? '#10b981' : '#6b7280' }}>{m.status}</span>
              </div>
              {m.department && <p style={styles.mcDept}>{m.department}</p>}
              <div style={styles.mcActions}>
                <button onClick={() => onToggle(m.id)} style={styles.mcToggleBtn}>
                  {m.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => onRemove(m.id)} style={styles.mcDeleteBtn}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>
      {showAddModal && <AddMemberModal newMember={newMember} setNewMember={setNewMember} onAdd={addMember} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AnalyticsView({ members, projects }) {
  const active = members.filter(m => m.status === 'active').length;
  const pct = members.length ? Math.round((active / members.length) * 100) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.welcome}>
        <div>
          <h2 style={styles.welcomeTitle}>Analytics Overview 📊</h2>
          <p style={styles.welcomeSub}>Platform metrics and insights</p>
        </div>
      </div>
      <div style={styles.statsGrid}>
        {[
          { label: 'Active Members', value: active, icon: '✅', color: '#10b981' },
          { label: 'Active Rate', value: `${pct}%`, icon: '📈', color: '#3b82f6' },
          { label: 'Ongoing Projects', value: projects.filter(p => p.status === 'active').length, icon: '🚀', color: '#C64B47' },
          { label: 'Avg. Progress', value: `${Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length)}%`, icon: '⚡', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
            <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
            <div>
              <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Project Progress Breakdown</h3>
        <div style={styles.analyticsProjects}>
          {projects.map(proj => (
            <div key={proj.id} style={styles.analyticsRow}>
              <span style={styles.analyticsName}>{proj.name}</span>
              <div style={styles.analyticsBar}>
                <div style={{ ...styles.analyticsBarFill, width: `${proj.progress}%`, background: proj.progress >= 60 ? '#10b981' : proj.progress >= 30 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <span style={styles.analyticsPct}>{proj.progress}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.twoCol}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Members by Role</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Admins', count: members.filter(m => m.role === 'admin').length, color: '#f59e0b' },
              { label: 'Interns', count: members.filter(m => m.role === 'intern').length, color: '#3b82f6' },
            ].map(r => (
              <div key={r.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: 700 }}>{r.count}</span>
                </div>
                <div style={styles.analyticsBar}>
                  <div style={{ ...styles.analyticsBarFill, width: `${(r.count / members.length) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Activity Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Active', count: members.filter(m => m.status === 'active').length, color: '#10b981' },
              { label: 'Inactive', count: members.filter(m => m.status === 'inactive').length, color: '#6b7280' },
            ].map(r => (
              <div key={r.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: 700 }}>{r.count}</span>
                </div>
                <div style={styles.analyticsBar}>
                  <div style={{ ...styles.analyticsBarFill, width: `${(r.count / members.length) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsView({ projects }) {
  return (
    <div style={styles.page}>
      <div style={styles.welcome}>
        <div>
          <h2 style={styles.welcomeTitle}>All Projects</h2>
          <p style={styles.welcomeSub}>Overview of all ongoing and planned projects</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {projects.map(proj => (
          <div key={proj.id} style={styles.bigProjectCard}>
            <div style={styles.projectHeader}>
              <span style={styles.projectName}>{proj.name}</span>
              <span style={{ ...styles.projStatus, background: proj.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)', color: proj.status === 'active' ? '#10b981' : '#6b7280' }}>
                {proj.status}
              </span>
            </div>
            <p style={styles.projectDesc}>{proj.desc}</p>
            <div style={styles.progressRow}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Progress</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{proj.progress}%</span>
            </div>
            <div style={styles.projBar}>
              <div style={{ ...styles.projBarFill, width: `${proj.progress}%` }} />
            </div>
            <div style={{ ...styles.teamAvatars, marginTop: '1rem' }}>
              {proj.team.map(av => <div key={av} style={styles.teamAv} title={av}>{av}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddMemberModal({ newMember, setNewMember, onAdd, onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Add Team Member</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.modalBody}>
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Arjun Sharma' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'e.g. arjun@sdc.com' },
            { label: 'Department', key: 'department', type: 'text', placeholder: 'e.g. Frontend, Backend, Design' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={styles.inputGroup}>
              <label style={styles.inputLabel}>{label}</label>
              <input
                id={`member-${key}`}
                type={type}
                value={newMember[key]}
                onChange={e => setNewMember(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                style={styles.input}
              />
            </div>
          ))}
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Role</label>
            <select id="member-role" value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))} style={styles.input}>
              <option value="intern">Intern</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button id="add-member-submit" onClick={onAdd} style={styles.createBtn}>Add Member</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  welcome: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(198,75,71,0.08)', border: '1px solid rgba(198,75,71,0.15)',
    borderRadius: 16, padding: '1.5rem 2rem', flexWrap: 'wrap', gap: '1rem',
  },
  welcomeTitle: { fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Outfit', sans-serif" },
  welcomeSub: { color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '0.25rem' },
  createBtn: {
    background: 'linear-gradient(90deg, #C64B47, #E68A2E)', color: '#fff',
    border: 'none', borderRadius: 10, padding: '0.7rem 1.4rem',
    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' },
  statCard: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14, padding: '1.25rem 1.5rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  statValue: { fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" },
  statLabel: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' },
  card: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: '1.5rem',
  },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', marginTop: 0 },
  projectList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  projectItem: { padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' },
  projectHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' },
  projectName: { fontSize: '0.9rem', fontWeight: 700, color: '#fff' },
  projectDesc: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', margin: '0.3rem 0 0.5rem' },
  projStatus: { padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 },
  progressRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' },
  projBar: { height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' },
  projBarFill: { height: '100%', background: 'linear-gradient(90deg, #C64B47, #E68A2E)', borderRadius: 100 },
  projPct: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' },
  teamAvatars: { display: 'flex', gap: '0.3rem', marginTop: '0.5rem' },
  teamAv: { width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700 },
  memberList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  memberRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  memberAv: { width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 },
  memberInfo: { flex: 1 },
  memberName: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#fff' },
  memberRole: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' },
  statusDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  tabRow: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  tabBtn: { padding: '0.45rem 1rem', borderRadius: 100, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 600 },
  memberGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  memberCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' },
  bigMemberAv: { width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' },
  mcName: { fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 },
  mcEmail: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 },
  mcMeta: { display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.3rem' },
  roleBadge: { padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 },
  statusPill: { padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 },
  mcDept: { fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', margin: 0 },
  mcActions: { display: 'flex', gap: '0.4rem', marginTop: '0.75rem' },
  mcToggleBtn: { flex: 1, padding: '0.45rem 0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif" },
  mcDeleteBtn: { flex: 1, padding: '0.45rem 0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif" },
  analyticsProjects: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  analyticsRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  analyticsName: { width: 140, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', flexShrink: 0 },
  analyticsBar: { flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' },
  analyticsBarFill: { height: '100%', borderRadius: 100 },
  analyticsPct: { width: 36, textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', flexShrink: 0 },
  bigProjectCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' },
  modal: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  modalTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', cursor: 'pointer' },
  modalBody: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  inputLabel: { fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, padding: '0.7rem 1rem', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', outline: 'none' },
};
