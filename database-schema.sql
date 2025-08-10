-- ============================================================================
-- Job Tracker Database Schema
-- ============================================================================

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Job status enum
CREATE TYPE job_status AS ENUM (
  'not_started',
  'completed', 
  'cancelled_by_client',
  'no_parking'
);

-- Priority level enum
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Team role enum
CREATE TYPE team_role AS ENUM ('admin', 'editor');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role DEFAULT 'editor',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status job_status NOT NULL DEFAULT 'not_started',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  priority priority_level DEFAULT 'medium',
  completed_at TIMESTAMPTZ,
  location JSONB, -- {lat: number, lng: number, address?: string}
  recurrence_pattern JSONB -- {type: 'weekly'|'monthly', interval: number}
);

-- Job notes table
CREATE TABLE job_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job audit logs table
CREATE TABLE job_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'completed', etc.
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Jobs indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_jobs_assigned_to ON jobs(assigned_to);
CREATE INDEX idx_jobs_team_id ON jobs(team_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_due_date ON jobs(due_date);

-- Team members indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Job notes indexes
CREATE INDEX idx_job_notes_job_id ON job_notes(job_id);
CREATE INDEX idx_job_notes_user_id ON job_notes(user_id);

-- Job audit logs indexes
CREATE INDEX idx_job_audit_logs_job_id ON job_audit_logs(job_id);
CREATE INDEX idx_job_audit_logs_user_id ON job_audit_logs(user_id);
CREATE INDEX idx_job_audit_logs_created_at ON job_audit_logs(created_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_notes_updated_at BEFORE UPDATE ON job_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log job changes
CREATE OR REPLACE FUNCTION log_job_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO job_audit_logs (job_id, user_id, action, new_values)
        VALUES (NEW.id, NEW.created_by, 'created', to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO job_audit_logs (job_id, user_id, action, old_values, new_values)
        VALUES (NEW.id, auth.uid(), 'updated', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO job_audit_logs (job_id, user_id, action, old_values)
        VALUES (OLD.id, auth.uid(), 'deleted', to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for job audit logging
CREATE TRIGGER log_job_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION log_job_changes();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_audit_logs ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view teams they belong to" ON teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create teams" ON teams
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team admins can update teams" ON teams
    FOR UPDATE USING (
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Team admins can delete teams" ON teams
    FOR DELETE USING (
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Team members policies
CREATE POLICY "Users can view team members of their teams" ON team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Team admins can manage team members" ON team_members
    FOR ALL USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Jobs policies
CREATE POLICY "Users can view jobs from their teams or assigned to them" ON jobs
    FOR SELECT USING (
        created_by = auth.uid() OR
        assigned_to = auth.uid() OR
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create jobs" ON jobs
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update jobs they created or are assigned to" ON jobs
    FOR UPDATE USING (
        created_by = auth.uid() OR
        assigned_to = auth.uid() OR
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete jobs they created or team admins" ON jobs
    FOR DELETE USING (
        created_by = auth.uid() OR
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Job notes policies
CREATE POLICY "Users can view notes for jobs they have access to" ON job_notes
    FOR SELECT USING (
        job_id IN (
            SELECT id FROM jobs WHERE
            created_by = auth.uid() OR
            assigned_to = auth.uid() OR
            team_id IN (
                SELECT team_id FROM team_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create notes for jobs they have access to" ON job_notes
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        job_id IN (
            SELECT id FROM jobs WHERE
            created_by = auth.uid() OR
            assigned_to = auth.uid() OR
            team_id IN (
                SELECT team_id FROM team_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own notes" ON job_notes
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes" ON job_notes
    FOR DELETE USING (user_id = auth.uid());

-- Job audit logs policies
CREATE POLICY "Users can view audit logs for jobs they have access to" ON job_audit_logs
    FOR SELECT USING (
        job_id IN (
            SELECT id FROM jobs WHERE
            created_by = auth.uid() OR
            assigned_to = auth.uid() OR
            team_id IN (
                SELECT team_id FROM team_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for jobs with user and team information
CREATE VIEW jobs_detailed AS
SELECT 
    j.*,
    cu.email as created_by_email,
    au.email as assigned_to_email,
    t.name as team_name,
    (
        SELECT COUNT(*) FROM job_notes 
        WHERE job_id = j.id
    ) as notes_count
FROM jobs j
LEFT JOIN auth.users cu ON j.created_by = cu.id
LEFT JOIN auth.users au ON j.assigned_to = au.id
LEFT JOIN teams t ON j.team_id = t.id;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get user's teams
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE (
    team_id UUID,
    team_name VARCHAR,
    role team_role,
    joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tm.team_id,
        t.name,
        tm.role,
        tm.joined_at
    FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    WHERE tm.user_id = user_uuid;
END;
$$;

-- Function to check if user is team admin
CREATE OR REPLACE FUNCTION is_team_admin(user_uuid UUID, team_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM team_members
        WHERE user_id = user_uuid 
        AND team_id = team_uuid 
        AND role = 'admin'
    );
END;
$$;
