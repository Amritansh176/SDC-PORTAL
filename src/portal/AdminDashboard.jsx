import React, { useState } from 'react';
import { useTheme } from './ThemeContext';

const MOCK_INTERNS = [
  { id: 1, name: 'Arjun Sharma',  email: 'arjun@sdc.com', avatar: 'AS', tasksCompleted: 8,  tasksTotal: 12 },
  { id: 2, name: 'Neha Gupta',    email: 'neha@sdc.com',  avatar: 'NG', tasksCompleted: 5,  tasksTotal: 10 },
  { id: 3, name: 'Rohan Jain',    email: 'rohan@sdc.com', avatar: 'RJ', tasksCompleted: 3,  tasksTotal: 7  },
  { id: 4, name: 'Siya Patel',    email: 'siya@sdc.com',  avatar: 'SP', tasksCompleted: 10, tasksTotal: 10 },
];

const MOCK_TASKS = [
  { id: 1, title: 'Build Login UI',            project: 'SDC Portal', status: 'in_progress', priority: 'high',   assignee: 'Arjun Sharma', dueDate: '2024-10-20' },
  { id: 2, title: 'Write API Documentation',   project: 'SDC Portal', status: 'todo',        priority: 'medium', assignee: 'Neha Gupta',   dueDate: '2024-10-25' },
  { id: 3, title: 'Setup Supabase Auth',       project: 'SDC Portal', status: 'done',        priority: 'high',   assignee: 'Rohan Jain',   dueDate: '2024-10-15' },
  { id: 4, title: 'Design Figma Mockups',      project: 'MUJ App',    status: 'review',      priority: 'low',    assignee: 'Siya Patel',   dueDate: '2024-10-30' },
  { id: 5, title: 'Integrate Payment Gateway', project: 'E-Commerce', status: 'todo',        priority: 'high',   assignee: 'Arjun Sharma', dueDate: '2024-11-05' },
];

const STATUS_META = {
  todo:        { label: 'To Do',       color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  review:      { label: 'In Review',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)'  },
  done:        { label: 'Done',        color: '#10b981', bg: 'rgba(16,185,129,0.15)'  },
};

const PRIORITY_META = {
  high:   { label: 'High',   color: '#ef4444' },
  medium: { label: 'Medium', color: '#f59e0b' },
  low:    { label: 'Low',    color: '#10b981' },
};

/* ─── Shared card style hook ─── */
function useCard(theme, isDark) {
  return {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    boxShadow: isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
    transition: 'background 0.25s ease',
  };
}

/* ═══════════════════════════════ ADMIN DASHBOARD ═══════════════════════════ */
export function AdminDashboard({ user, activePage }) {
  const { theme, isDark } = useTheme();
  const card = useCard(theme, isDark);

  const [tasks, setTasks]             = useState(MOCK_TASKS);
  const [showModal, setShowModal]     = useState(false);
  const [newTask, setNewTask]         = useState({ title: '', project: '', priority: 'medium', assignee: MOCK_INTERNS[0].name, dueDate: '' });

  const stats = {
    total:      tasks.length,
    done:       tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
  };

  const createTask = () => {
    if (!newTask.title || !newTask.project) return;
    setTasks(p => [...p, { ...newTask, id: Date.now(), status: 'todo' }]);
    setNewTask({ title: '', project: '', priority: 'medium', assignee: MOCK_INTERNS[0].name, dueDate: '' });
    setShowModal(false);
  };
  const updateStatus = (id, s) => setTasks(p => p.map(t => t.id === id ? { ...t, status: s } : t));
  const deleteTask   = (id)    => setTasks(p => p.filter(t => t.id !== id));

  if (activePage === 'interns') return <InternsView theme={theme} isDark={isDark} card={card} interns={MOCK_INTERNS} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome */}
      <div style={{ ...card, background: theme.welcomeBg('#8b5cf6'), border: `1px solid ${theme.welcomeBorder('#8b5cf6')}`, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: theme.textPrimary, margin: 0, fontFamily: "'Outfit', sans-serif" }}>Admin Panel 🛠</h2>
          <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginTop: '0.25rem' }}>Manage tasks and monitor intern progress</p>
        </div>
        <button id="create-task-btn" onClick={() => setShowModal(true)} style={primaryBtn('#8b5cf6')}>
          ＋ Assign New Task
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Tasks', value: stats.total,      icon: '📋', color: '#8b5cf6' },
          { label: 'In Progress', value: stats.inProgress, icon: '⚡', color: '#f59e0b' },
          { label: 'Completed',   value: stats.done,       icon: '✅', color: '#10b981' },
          { label: 'Interns',     value: MOCK_INTERNS.length, icon: '👥', color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{ ...card, borderTop: `3px solid ${s.color}`, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: "'Outfit', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Intern progress */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.textPrimary, marginBottom: '1.25rem', marginTop: 0 }}>Intern Progress</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {MOCK_INTERNS.map(intern => {
            const pct   = intern.tasksTotal ? Math.round((intern.tasksCompleted / intern.tasksTotal) * 100) : 0;
            const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
            return (
              <div key={intern.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#8b5cf622', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  {intern.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: theme.textPrimary }}>{intern.name}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 100, overflow: 'hidden', marginBottom: '0.2rem' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: theme.textMuted }}>{intern.tasksCompleted}/{intern.tasksTotal} tasks done</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task table */}
      <div style={{ ...card, padding: '1.5rem', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.textPrimary, marginBottom: '1.25rem', marginTop: 0 }}>All Tasks</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              {['Task', 'Project', 'Assignee', 'Priority', 'Due Date', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${theme.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '0.85rem 1rem', color: theme.textPrimary, fontWeight: 600, fontSize: '0.875rem' }}>{task.title}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
                  <span style={{ background: theme.tagBg, color: theme.tagText, borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}>{task.project}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: theme.textSecondary }}>{task.assignee}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', fontWeight: 600, color: PRIORITY_META[task.priority]?.color }}>
                  ● {PRIORITY_META[task.priority]?.label}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: theme.textSecondary }}>{task.dueDate}</td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ padding: '0.25rem 0.7rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, background: STATUS_META[task.status]?.bg, color: STATUS_META[task.status]?.color }}>
                    {STATUS_META[task.status]?.label}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <select
                      value={task.status}
                      onChange={e => updateStatus(task.id, e.target.value)}
                      style={{ background: theme.inputBg, border: `1px solid ${theme.borderInput}`, color: theme.textPrimary, borderRadius: 8, padding: '0.3rem 0.4rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                    >
                      {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                    </select>
                    <button onClick={() => deleteTask(task.id)} style={{ background: theme.deleteHover, border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 8, padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.85rem' }} title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal theme={theme} isDark={isDark} title="Assign New Task" onClose={() => setShowModal(false)}>
          {[
            { label: 'Task Title', key: 'title',   type: 'text', placeholder: 'e.g. Build REST API endpoints' },
            { label: 'Project',    key: 'project', type: 'text', placeholder: 'e.g. SDC Portal' },
            { label: 'Due Date',   key: 'dueDate', type: 'date', placeholder: '' },
          ].map(({ label, key, type, placeholder }) => (
            <InputGroup key={key} label={label} theme={theme}>
              <input id={`task-${key}`} type={type} value={newTask[key]} onChange={e => setNewTask(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={inputStyle(theme)} />
            </InputGroup>
          ))}
          <InputGroup label="Assign To" theme={theme}>
            <select id="task-assignee" value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} style={inputStyle(theme)}>
              {MOCK_INTERNS.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
            </select>
          </InputGroup>
          <InputGroup label="Priority" theme={theme}>
            <select id="task-priority" value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} style={inputStyle(theme)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </InputGroup>
          <button id="create-task-submit" onClick={createTask} style={{ ...primaryBtn('#8b5cf6'), width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Assign Task
          </button>
        </Modal>
      )}
    </div>
  );
}

function InternsView({ theme, isDark, card, interns }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ ...card, background: theme.welcomeBg('#8b5cf6'), border: `1px solid ${theme.welcomeBorder('#8b5cf6')}`, padding: '1.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: theme.textPrimary, margin: 0, fontFamily: "'Outfit', sans-serif" }}>Interns</h2>
        <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginTop: '0.25rem' }}>Manage intern accounts and view progress</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {interns.map(intern => {
          const pct   = intern.tasksTotal ? Math.round((intern.tasksCompleted / intern.tasksTotal) * 100) : 0;
          const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <div key={intern.id} style={{ ...card, padding: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#8b5cf622', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{intern.avatar}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>{intern.name}</h3>
              <p style={{ fontSize: '0.78rem', color: theme.textMuted, margin: 0 }}>{intern.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                <div style={{ flex: 1, height: 6, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100 }} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{pct}%</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: theme.textMuted, margin: 0 }}>{intern.tasksCompleted} / {intern.tasksTotal} tasks</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Shared micro-components ─── */
function Modal({ theme, isDark, title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}
      onClick={onClose}>
      <div style={{ background: isDark ? '#1a1a1a' : '#ffffff', border: `1px solid ${theme.border}`, borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>{children}</div>
      </div>
    </div>
  );
}

function InputGroup({ label, theme, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = (theme) => ({
  background: theme.inputBg, border: `1px solid ${theme.borderInput}`,
  color: theme.textPrimary, borderRadius: 10, padding: '0.7rem 1rem',
  fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box',
});

const primaryBtn = (color) => ({
  background: color, color: '#fff', border: 'none', borderRadius: 10,
  padding: '0.7rem 1.4rem', fontWeight: 700, fontSize: '0.9rem',
  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
});
