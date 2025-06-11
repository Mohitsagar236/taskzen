-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'editor', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Team activities table
CREATE TABLE IF NOT EXISTS team_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task shares table
CREATE TABLE IF NOT EXISTS task_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('view', 'edit')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

-- Add team_id to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Add RLS policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_shares ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY team_select ON teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY team_insert ON teams
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Team members policies
CREATE POLICY team_members_select ON team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY team_members_insert ON team_members
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY team_members_update ON team_members
    FOR UPDATE USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY team_members_delete ON team_members
    FOR DELETE USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Team activities policies
CREATE POLICY team_activities_select ON team_activities
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY team_activities_insert ON team_activities
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
    );

-- Task shares policies
CREATE POLICY task_share_select ON task_shares
    FOR SELECT USING (
        user_id = auth.uid() OR 
        task_id IN (
            SELECT id FROM tasks WHERE created_by = auth.uid()
        )
    );

CREATE POLICY task_share_insert ON task_shares
    FOR INSERT WITH CHECK (
        task_id IN (
            SELECT id FROM tasks 
            WHERE created_by = auth.uid() OR 
                  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
        )
    );

CREATE POLICY task_share_delete ON task_shares
    FOR DELETE USING (
        task_id IN (
            SELECT id FROM tasks WHERE created_by = auth.uid()
        )
    );

-- Update tasks policies to handle teams
CREATE POLICY task_select_team ON tasks
    FOR SELECT USING (
        created_by = auth.uid() OR
        assigned_to = auth.uid() OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()) OR
        id IN (SELECT task_id FROM task_shares WHERE user_id = auth.uid())
    );

CREATE POLICY task_insert_team ON tasks
    FOR INSERT WITH CHECK (
        created_by = auth.uid() OR
        (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor')))
    );

CREATE POLICY task_update_team ON tasks
    FOR UPDATE USING (
        created_by = auth.uid() OR
        assigned_to = auth.uid() OR
        (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))) OR
        id IN (SELECT task_id FROM task_shares WHERE user_id = auth.uid() AND role = 'edit')
    );

CREATE POLICY task_delete_team ON tasks
    FOR DELETE USING (
        created_by = auth.uid() OR
        (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin'))
    );
