-- ============================================================================
-- SDC PORTAL — SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Run this entire file in the Supabase SQL Editor (Dashboard → SQL Editor)
-- This creates all tables, RLS policies, triggers, functions, and seed data
-- needed for the SDC Team Portal.
-- ============================================================================


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  1. ENUMS (Custom Types)                                               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- User roles
CREATE TYPE user_role AS ENUM ('intern', 'admin', 'super_admin');

-- User account status
CREATE TYPE user_status AS ENUM ('active', 'inactive');

-- Project status
CREATE TYPE project_status AS ENUM ('planning', 'active', 'completed', 'archived');

-- Task status
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');

-- Task priority
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  2. TABLES                                                             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ─────────────────────────────────────────────────────────────────────────────
-- 2.1  PROFILES — Extends Supabase auth.users
-- ─────────────────────────────────────────────────────────────────────────────
-- The `id` references auth.users so every signed-up user gets a profile row.
-- LoginPage.jsx reads: profiles.select('role, name').eq('id', session.user.id)
-- main.jsx reads:       profiles.select('role, name').eq('id', session.user.id)

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        user_role NOT NULL DEFAULT 'intern',
  department  TEXT,                                   -- e.g. 'Frontend', 'Backend', 'Design', 'Full Stack'
  status      user_status NOT NULL DEFAULT 'active',
  avatar_url  TEXT,                                   -- Optional profile picture URL (Supabase Storage)
  phone       TEXT,
  bio         TEXT,
  join_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_profiles_role   ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_email  ON profiles(email);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth. Each auth.users row maps 1:1 to a profile.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.2  PROJECTS
-- ─────────────────────────────────────────────────────────────────────────────
-- Maps to MOCK_PROJECTS in SuperAdminDashboard.jsx
-- Fields: name, desc, status, progress

CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  status      project_status NOT NULL DEFAULT 'planning',
  progress    INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);

COMMENT ON TABLE projects IS 'All SDC projects — SDC Portal, MUJ App, Alumni Network, etc.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.3  PROJECT_MEMBERS — Junction table (many-to-many)
-- ─────────────────────────────────────────────────────────────────────────────
-- Maps to the `team` array in MOCK_PROJECTS (e.g. ['PM', 'AS', 'NG'])
-- Tracks which members are assigned to which projects and their role in it.

CREATE TABLE project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'member',                 -- 'lead', 'member', 'reviewer'
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(project_id, user_id)                        -- One entry per user per project
);

CREATE INDEX idx_pm_project ON project_members(project_id);
CREATE INDEX idx_pm_user    ON project_members(user_id);

COMMENT ON TABLE project_members IS 'Many-to-many mapping of users to projects.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.4  TASKS
-- ─────────────────────────────────────────────────────────────────────────────
-- Maps to MOCK_TASKS in AdminDashboard.jsx & INITIAL_TASKS in InternDashboard.jsx
-- Fields: title, project, status, priority, assignee, assignedBy, dueDate

CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  status       task_status NOT NULL DEFAULT 'todo',
  priority     task_priority NOT NULL DEFAULT 'medium',
  assignee_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,    -- Intern doing the task
  assigned_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,    -- Admin/SuperAdmin who assigned
  due_date     DATE,
  completed_at TIMESTAMPTZ,                                        -- Set when status → 'done'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project  ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status   ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

COMMENT ON TABLE tasks IS 'Tasks assigned to members. Admins create, interns update status.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.5  TASK_COMMENTS — Discussion on tasks
-- ─────────────────────────────────────────────────────────────────────────────
-- Future feature: allows team members to comment on tasks.

CREATE TABLE task_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_comments_task ON task_comments(task_id);

COMMENT ON TABLE task_comments IS 'Comments/discussion threads on tasks.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.6  NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
-- For the 🔔 notification bell in the top bar.

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT,
  type        TEXT DEFAULT 'info',                   -- 'info', 'task', 'project', 'alert'
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  link        TEXT,                                  -- Optional deep-link (e.g. '/tasks/123')
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

COMMENT ON TABLE notifications IS 'User notifications shown in the topbar bell icon.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2.7  ACTIVITY_LOG — Audit trail
-- ─────────────────────────────────────────────────────────────────────────────
-- Tracks important actions for the Analytics page.

CREATE TABLE activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,                         -- 'task_created', 'status_changed', 'member_added', etc.
  entity_type TEXT,                                  -- 'task', 'project', 'member'
  entity_id   UUID,                                  -- ID of the affected entity
  metadata    JSONB DEFAULT '{}',                    -- Extra context (e.g. { "old_status": "todo", "new_status": "done" })
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user      ON activity_log(user_id);
CREATE INDEX idx_activity_entity    ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created   ON activity_log(created_at DESC);

COMMENT ON TABLE activity_log IS 'Audit log for all important actions in the portal.';


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  3. AUTO-UPDATE TRIGGERS                                               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Function: auto-set `updated_at` on UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─────────────────────────────────────────────────────────────────────────────
-- Function: Auto-set `completed_at` when task status changes to 'done'
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_completion
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION handle_task_completion();


-- ─────────────────────────────────────────────────────────────────────────────
-- Function: Auto-create profile when a new user signs up via Supabase Auth
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'intern'),
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  4. ROW LEVEL SECURITY (RLS)                                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Enable RLS on all tables
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log    ENABLE ROW LEVEL SECURITY;


-- ─────────── Helper: Get current user's role ───────────
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ═══════════════ PROFILES POLICIES ═══════════════

-- Everyone can read all profiles (needed for team overview, avatars, etc.)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Super admins can update anyone's profile (change role, status, department)
CREATE POLICY "profiles_update_super_admin"
  ON profiles FOR UPDATE
  USING (get_user_role() = 'super_admin');

-- Super admins can delete profiles (remove members)
CREATE POLICY "profiles_delete_super_admin"
  ON profiles FOR DELETE
  USING (get_user_role() = 'super_admin');


-- ═══════════════ PROJECTS POLICIES ═══════════════

-- Everyone can view projects
CREATE POLICY "projects_select_all"
  ON projects FOR SELECT
  USING (true);

-- Admins and super_admins can create projects
CREATE POLICY "projects_insert_admin"
  ON projects FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'super_admin'));

-- Admins and super_admins can update projects
CREATE POLICY "projects_update_admin"
  ON projects FOR UPDATE
  USING (get_user_role() IN ('admin', 'super_admin'));

-- Only super_admins can delete projects
CREATE POLICY "projects_delete_super_admin"
  ON projects FOR DELETE
  USING (get_user_role() = 'super_admin');


-- ═══════════════ PROJECT_MEMBERS POLICIES ═══════════════

-- Everyone can see project members
CREATE POLICY "pm_select_all"
  ON project_members FOR SELECT
  USING (true);

-- Admins+ can manage project members
CREATE POLICY "pm_insert_admin"
  ON project_members FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "pm_delete_admin"
  ON project_members FOR DELETE
  USING (get_user_role() IN ('admin', 'super_admin'));


-- ═══════════════ TASKS POLICIES ═══════════════

-- Everyone can view tasks
CREATE POLICY "tasks_select_all"
  ON tasks FOR SELECT
  USING (true);

-- Admins+ can create tasks (assign tasks to interns)
CREATE POLICY "tasks_insert_admin"
  ON tasks FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'super_admin'));

-- Interns can update tasks assigned to them (change status)
-- Admins+ can update any task
CREATE POLICY "tasks_update_assignee_or_admin"
  ON tasks FOR UPDATE
  USING (
    assignee_id = auth.uid()
    OR get_user_role() IN ('admin', 'super_admin')
  );

-- Admins+ can delete tasks
CREATE POLICY "tasks_delete_admin"
  ON tasks FOR DELETE
  USING (get_user_role() IN ('admin', 'super_admin'));


-- ═══════════════ TASK_COMMENTS POLICIES ═══════════════

-- Everyone can view comments
CREATE POLICY "comments_select_all"
  ON task_comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "comments_insert_auth"
  ON task_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own comments
CREATE POLICY "comments_delete_own"
  ON task_comments FOR DELETE
  USING (user_id = auth.uid());


-- ═══════════════ NOTIFICATIONS POLICIES ═══════════════

-- Users can only see their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- System/admins can create notifications (using service_role key or triggers)
CREATE POLICY "notifications_insert_admin"
  ON notifications FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'super_admin'));

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());


-- ═══════════════ ACTIVITY_LOG POLICIES ═══════════════

-- Admins+ can view all activity logs (for Analytics page)
CREATE POLICY "activity_select_admin"
  ON activity_log FOR SELECT
  USING (get_user_role() IN ('admin', 'super_admin'));

-- Interns can see their own activity
CREATE POLICY "activity_select_own"
  ON activity_log FOR SELECT
  USING (user_id = auth.uid());

-- Anyone authenticated can insert activity logs
CREATE POLICY "activity_insert_auth"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  5. USEFUL VIEWS (for dashboard queries)                               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ─────────────────────────────────────────────────────────────────────────────
-- 5.1  Intern progress view (used in AdminDashboard intern progress section)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW intern_progress AS
SELECT
  p.id,
  p.name,
  p.email,
  p.department,
  p.status,
  COUNT(t.id)                                     AS tasks_total,
  COUNT(t.id) FILTER (WHERE t.status = 'done')    AS tasks_completed,
  CASE
    WHEN COUNT(t.id) > 0
    THEN ROUND((COUNT(t.id) FILTER (WHERE t.status = 'done')::DECIMAL / COUNT(t.id)) * 100)
    ELSE 0
  END                                              AS completion_pct
FROM profiles p
LEFT JOIN tasks t ON t.assignee_id = p.id
WHERE p.role = 'intern'
GROUP BY p.id, p.name, p.email, p.department, p.status;

COMMENT ON VIEW intern_progress IS 'Aggregated task completion stats for each intern. Used in AdminDashboard.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 5.2  Project overview with team members (used in SuperAdminDashboard)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW project_overview AS
SELECT
  pr.id,
  pr.name,
  pr.description,
  pr.status,
  pr.progress,
  pr.start_date,
  pr.end_date,
  pr.created_at,
  COALESCE(
    json_agg(
      json_build_object(
        'user_id', p.id,
        'name',    p.name,
        'avatar',  UPPER(LEFT(split_part(p.name, ' ', 1), 1) || LEFT(split_part(p.name, ' ', 2), 1)),
        'role',    pm.role
      )
    ) FILTER (WHERE p.id IS NOT NULL),
    '[]'::json
  ) AS team
FROM projects pr
LEFT JOIN project_members pm ON pm.project_id = pr.id
LEFT JOIN profiles p ON p.id = pm.user_id
GROUP BY pr.id, pr.name, pr.description, pr.status, pr.progress, pr.start_date, pr.end_date, pr.created_at;

COMMENT ON VIEW project_overview IS 'Projects with aggregated team member info. Used in SuperAdmin dashboard.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 5.3  Dashboard stats view (used in all dashboards)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles)                                        AS total_members,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin')                   AS total_admins,
  (SELECT COUNT(*) FROM profiles WHERE role = 'intern')                  AS total_interns,
  (SELECT COUNT(*) FROM profiles WHERE status = 'active')                AS active_members,
  (SELECT COUNT(*) FROM projects)                                        AS total_projects,
  (SELECT COUNT(*) FROM projects WHERE status = 'active')                AS active_projects,
  (SELECT COUNT(*) FROM tasks)                                           AS total_tasks,
  (SELECT COUNT(*) FROM tasks WHERE status = 'done')                     AS completed_tasks,
  (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress')              AS in_progress_tasks,
  (SELECT COUNT(*) FROM tasks WHERE status = 'todo')                     AS todo_tasks,
  (SELECT COALESCE(AVG(progress), 0) FROM projects)::INT                 AS avg_project_progress;

COMMENT ON VIEW dashboard_stats IS 'Aggregated counts for dashboard stat cards.';


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  6. DATABASE FUNCTIONS (for frontend to call via supabase.rpc())       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ─────────────────────────────────────────────────────────────────────────────
-- 6.1  Toggle member status (active ↔ inactive)
-- ─────────────────────────────────────────────────────────────────────────────
-- Usage: supabase.rpc('toggle_member_status', { member_id: '...' })
CREATE OR REPLACE FUNCTION toggle_member_status(member_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET status = CASE WHEN status = 'active' THEN 'inactive'::user_status ELSE 'active'::user_status END
  WHERE id = member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6.2  Get task stats for a specific user
-- ─────────────────────────────────────────────────────────────────────────────
-- Usage: supabase.rpc('get_my_task_stats')
CREATE OR REPLACE FUNCTION get_my_task_stats()
RETURNS JSON AS $$
  SELECT json_build_object(
    'total',       COUNT(*),
    'done',        COUNT(*) FILTER (WHERE status = 'done'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'todo',        COUNT(*) FILTER (WHERE status = 'todo'),
    'review',      COUNT(*) FILTER (WHERE status = 'review')
  )
  FROM tasks
  WHERE assignee_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6.3  Update project progress (auto-calculate from task completion)
-- ─────────────────────────────────────────────────────────────────────────────
-- Usage: supabase.rpc('recalculate_project_progress', { p_id: '...' })
CREATE OR REPLACE FUNCTION recalculate_project_progress(p_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET progress = (
    SELECT COALESCE(
      ROUND((COUNT(*) FILTER (WHERE status = 'done')::DECIMAL / NULLIF(COUNT(*), 0)) * 100),
      0
    )
    FROM tasks WHERE project_id = p_id
  )
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  7. SEED DATA (Demo/Test Data)                                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- ⚠️  Run this AFTER creating users via Supabase Auth (Dashboard → Auth → Users)
--     OR use the `handle_new_user` trigger by creating users with metadata.
--
--     To create demo users, go to Supabase Dashboard → Authentication → Users
--     and create these users:
--
--     Email                  | Password  | User Metadata (JSON)
--     -----------------------|-----------|---------------------------------------------
--     superadmin@sdc.com     | demo123   | { "name": "Rahul Verma", "role": "super_admin" }
--     admin@sdc.com          | demo123   | { "name": "Priya Mehta", "role": "admin" }
--     vikram@sdc.com         | demo123   | { "name": "Vikram Singh", "role": "admin" }
--     intern@sdc.com         | demo123   | { "name": "Arjun Sharma", "role": "intern" }
--     neha@sdc.com           | demo123   | { "name": "Neha Gupta", "role": "intern" }
--     rohan@sdc.com          | demo123   | { "name": "Rohan Jain", "role": "intern" }
--     siya@sdc.com           | demo123   | { "name": "Siya Patel", "role": "intern" }
--
--     The `handle_new_user` trigger will auto-create profile rows.
--
--     After users are created, run the seed data below:
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 7.1  Seed: Update department info for profiles (after users are created)
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE profiles SET department = 'Frontend'   WHERE email = 'priya@sdc.com';    -- PM
-- UPDATE profiles SET department = 'Backend'    WHERE email = 'vikram@sdc.com';   -- VS
-- UPDATE profiles SET department = 'Frontend'   WHERE email = 'intern@sdc.com';   -- AS
-- UPDATE profiles SET department = 'Design'     WHERE email = 'neha@sdc.com';     -- NG
-- UPDATE profiles SET department = 'Backend'    WHERE email = 'rohan@sdc.com';    -- RJ
-- UPDATE profiles SET department = 'Full Stack' WHERE email = 'siya@sdc.com';     -- SP
-- UPDATE profiles SET status = 'inactive'       WHERE email = 'siya@sdc.com';


-- ─────────────────────────────────────────────────────────────────────────────
-- 7.2  Seed: Projects
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO projects (id, name, description, status, progress) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'SDC Portal',      'Internal team management platform',   'active',   65),
  ('a1000000-0000-0000-0000-000000000002', 'MUJ App',         'Mobile application for MUJ students', 'active',   40),
  ('a1000000-0000-0000-0000-000000000003', 'Alumni Network',  'Platform connecting MUJ alumni',      'planning', 10);


-- ─────────────────────────────────────────────────────────────────────────────
-- 7.3  Seed: Project Members (run after users are created via Auth)
-- ─────────────────────────────────────────────────────────────────────────────
-- Uncomment and replace UUIDs with actual user IDs from profiles table:
--
-- INSERT INTO project_members (project_id, user_id, role) VALUES
--   -- SDC Portal team: PM, AS, NG
--   ('a1000000-0000-0000-0000-000000000001', '<priya_uuid>',  'lead'),
--   ('a1000000-0000-0000-0000-000000000001', '<arjun_uuid>',  'member'),
--   ('a1000000-0000-0000-0000-000000000001', '<neha_uuid>',   'member'),
--   -- MUJ App team: VS, RJ
--   ('a1000000-0000-0000-0000-000000000002', '<vikram_uuid>', 'lead'),
--   ('a1000000-0000-0000-0000-000000000002', '<rohan_uuid>',  'member'),
--   -- Alumni Network team: PM, SP
--   ('a1000000-0000-0000-0000-000000000003', '<priya_uuid>',  'lead'),
--   ('a1000000-0000-0000-0000-000000000003', '<siya_uuid>',   'member');


-- ─────────────────────────────────────────────────────────────────────────────
-- 7.4  Seed: Tasks (run after users & projects are created)
-- ─────────────────────────────────────────────────────────────────────────────
-- Uncomment and replace UUIDs with actual user IDs:
--
-- INSERT INTO tasks (title, description, project_id, status, priority, assignee_id, assigned_by, due_date) VALUES
--   ('Build Login UI',            'Create the login page with Supabase Auth integration',
--     'a1000000-0000-0000-0000-000000000001', 'in_progress', 'high',   '<arjun_uuid>',  '<priya_uuid>',  '2024-10-20'),
--   ('Write API Documentation',   'Document all REST API endpoints for the portal',
--     'a1000000-0000-0000-0000-000000000001', 'todo',        'medium', '<neha_uuid>',   '<priya_uuid>',  '2024-10-25'),
--   ('Setup Supabase Auth',       'Configure authentication with email/password and OAuth',
--     'a1000000-0000-0000-0000-000000000001', 'done',        'high',   '<rohan_uuid>',  '<rahul_uuid>',  '2024-10-15'),
--   ('Design Figma Mockups',      'Create UI/UX mockups for the MUJ mobile app',
--     'a1000000-0000-0000-0000-000000000002', 'review',      'low',    '<siya_uuid>',   '<priya_uuid>',  '2024-10-30'),
--   ('Integrate Payment Gateway', 'Add Razorpay payment integration for the E-Commerce project',
--     NULL,                                   'todo',        'high',   '<arjun_uuid>',  '<priya_uuid>',  '2024-11-05');


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  8. STORAGE BUCKET (for profile pictures / project assets)             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Run this in the SQL editor to create a public storage bucket for avatars.

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
CREATE POLICY "avatars_upload_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to update/delete their own avatar
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  9. REALTIME (Enable for live updates)                                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Enable realtime on tables where you want live subscription updates.
-- Go to Supabase Dashboard → Database → Replication and enable these tables,
-- OR run the following:

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;


-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  ✅ DONE! Your Supabase database is ready for SDC Portal.             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- QUICK REFERENCE — Frontend Supabase Queries:
--
-- // Login (already in LoginPage.jsx):
-- const { data } = await supabase.auth.signInWithPassword({ email, password })
-- const { data: profile } = await supabase.from('profiles').select('role, name').eq('id', data.user.id).single()
--
-- // Fetch all members (SuperAdmin):
-- const { data } = await supabase.from('profiles').select('*').order('created_at')
--
-- // Fetch tasks for current user (Intern):
-- const { data } = await supabase.from('tasks').select('*, projects(name)').eq('assignee_id', userId)
--
-- // Fetch all tasks (Admin):
-- const { data } = await supabase.from('tasks').select('*, assignee:profiles!assignee_id(name, email), project:projects(name)')
--
-- // Fetch projects with team (SuperAdmin):
-- const { data } = await supabase.from('project_overview').select('*')
--
-- // Fetch dashboard stats:
-- const { data } = await supabase.from('dashboard_stats').select('*').single()
--
-- // Update task status (Intern):
-- await supabase.from('tasks').update({ status: 'done' }).eq('id', taskId)
--
-- // Add new member (SuperAdmin):
-- const { data } = await supabase.auth.admin.createUser({ email, password, user_metadata: { name, role } })
--
-- // Toggle member status:
-- await supabase.rpc('toggle_member_status', { member_id: userId })
--
-- // Get intern progress:
-- const { data } = await supabase.from('intern_progress').select('*')
--
-- // Fetch notifications:
-- const { data } = await supabase.from('notifications').select('*').eq('is_read', false).order('created_at', { ascending: false })
