-- Update task_shares policies
DROP POLICY IF EXISTS "task_share_select" ON task_shares;
DROP POLICY IF EXISTS "task_share_insert" ON task_shares;
DROP POLICY IF EXISTS "task_share_delete" ON task_shares;

-- Improved task shares policies
CREATE POLICY "task_share_select" ON task_shares
    FOR SELECT USING (
        user_id = auth.uid() OR 
        task_id IN (
            SELECT id FROM tasks 
            WHERE created_by = auth.uid() OR
                  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
        )
    );

CREATE POLICY "task_share_insert" ON task_shares
    FOR INSERT WITH CHECK (
        task_id IN (
            SELECT id FROM tasks 
            WHERE created_by = auth.uid() OR
                  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
        )
    );

CREATE POLICY "task_share_delete" ON task_shares
    FOR DELETE USING (
        task_id IN (
            SELECT id FROM tasks 
            WHERE created_by = auth.uid() OR
                  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin')
        )
    );

-- Add notification field
ALTER TABLE task_shares
ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE;

-- Add trigger to notify user when task is shared
CREATE OR REPLACE FUNCTION notify_task_share() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        metadata
    ) VALUES (
        NEW.user_id,
        'task_share',
        'Task Shared With You',
        format('A task has been shared with you with %s permission', NEW.role),
        jsonb_build_object(
            'task_id', NEW.task_id,
            'role', NEW.role
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_share_notification
AFTER INSERT ON task_shares
FOR EACH ROW
EXECUTE FUNCTION notify_task_share();

-- Add notification when task is assigned
CREATE OR REPLACE FUNCTION notify_task_assignment() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != OLD.assigned_to THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            metadata
        ) VALUES (
            NEW.assigned_to,
            'task_assignment',
            'Task Assigned to You',
            'A task has been assigned to you',
            jsonb_build_object(
                'task_id', NEW.id,
                'title', NEW.title,
                'assigned_by', auth.uid()
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_assignment_notification
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION notify_task_assignment();
