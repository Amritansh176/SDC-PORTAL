import React, { useState } from 'react';
import { useTheme } from './ThemeContext';

const INITIAL_TASKS = [
  { id: 1, title: 'Build Login UI', project: 'SDC Portal', status: 'in_progress', priority: 'high', dueDate: '2024-10-20', assignedBy: 'Priya Mehta' },
  { id: 2, title: 'Write API Documentation', project: 'SDC Portal', status: 'todo', priority: 'medium', dueDate: '2024-10-25', assignedBy: 'Priya Mehta' },
  { id: 3, title: 'Setup Supabase Auth', project: 'SDC Portal', status: 'done', priority: 'high', dueDate: '2024-10-15', assignedBy: 'Rahul Verma' },
  { id: 4, title: 'Design Figma Mockups', project: 'MUJ App', status: 'review', priority: 'low', dueDate: '2024-10-30', assignedBy: 'Priya Mehta' },
];

const STATUS_META = {
  todo:        { label: 'To Do',      color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
  in_progress: { label: 'In Progress',color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  review:      { label: 'In Review',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  done:        { label: 'Done',       color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
};

const PRIORITY_META = {
  high:   { label: 'High',   color: '#ef4444' },
  medium: { label: 'Medium', color: '#f59e0b' },
  low:    { label: 'Low',    color: '#10b981' },
};

export function InternDashboard({ user }) {
  const { theme, isDark } = useTheme();
  const [tasks, setTasks]   = useState(INITIAL_TASKS);
  const [filter, setFilter] = useState('all');

  const stats = {
    total:      tasks.length,
    done:       tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo:       tasks.filter(t => t.status === 'todo').length,
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const updateStatus  = (id, s) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: s } : t));
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  const card = {
    background: theme.cardBg, border: `1px solid ${theme.border}`,
    borderRadius: 14,
    boxShadow: isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
    transition: 'background 0.25s ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome banner */}
      <div style={{
        ...card,
        background: theme.welcomeBg('#3b82f6'),
        border: `1px solid ${theme.welcomeBorder('#3b82f6')}`,
        borderRadius: 16, padding: '1.5rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: theme.textPrimary, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Welcome back, {user.name?.split(' ')[0] || 'Intern'} 👋
          </h2>
          <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Here's your task overview for today
          </p>
        </div>
        <div style={{
          color: theme.textMuted, fontSize: '0.85rem',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          padding: '0.4rem 0.8rem', borderRadius: 8,
        }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Tasks',  value: stats.total,      icon: '📋', color: '#3b82f6' },
          { label: 'In Progress',  value: stats.inProgress, icon: '⚡', color: '#f59e0b' },
          { label: 'Completed',    value: stats.done,       icon: '✅', color: '#10b981' },
          { label: 'Pending',      value: stats.todo,       icon: '⏳', color: '#6b7280' },
        ].map(s => (
          <div key={s.label} style={{ ...card, borderTop: `3px solid ${s.color}`, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: "'Outfit', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: theme.textMuted, marginTop: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ ...card, padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.textSecondary }}>Overall Progress</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 100, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.textPrimary, margin: 0 }}>My Tasks</h3>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['all', 'todo', 'in_progress', 'review', 'done'].map(f => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.35rem 0.85rem', borderRadius: 100, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 600,
                  background: filter === f ? '#3b82f6' : theme.cardBg,
                  color:      filter === f ? '#fff' : theme.textSecondary,
                  border: `1px solid ${filter === f ? '#3b82f6' : theme.border}`,
                  transition: 'all 0.15s ease',
                }}
              >
                {f === 'all' ? 'All' : STATUS_META[f]?.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTasks.map(task => (
            <div key={task.id} style={{
              ...card, padding: '1.1rem 1.4rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_META[task.priority]?.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {task.project}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: theme.textPrimary, margin: '0 0 0.4rem' }}>{task.title}</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: theme.textMuted }}>
                  <span>📅 Due: {task.dueDate}</span>
                  <span>👤 Assigned by: {task.assignedBy}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                <span style={{ padding: '0.25rem 0.7rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, background: STATUS_META[task.status]?.bg, color: STATUS_META[task.status]?.color }}>
                  {STATUS_META[task.status]?.label}
                </span>
                <select
                  id={`task-status-${task.id}`}
                  value={task.status}
                  onChange={e => updateStatus(task.id, e.target.value)}
                  style={{
                    background: theme.inputBg, border: `1px solid ${theme.borderInput}`,
                    color: theme.textPrimary, borderRadius: 8,
                    padding: '0.3rem 0.5rem', fontSize: '0.78rem',
                    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {Object.entries(STATUS_META).map(([val, meta]) => (
                    <option key={val} value={val}>{meta.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: theme.textMuted, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>🎉</span>
              <p>No tasks in this category!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
