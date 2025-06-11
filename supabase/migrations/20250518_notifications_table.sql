-- migrations/notifications-table.sql

-- Create notifications table for user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_notification_type CHECK (
    type IN ('team_invite', 'team_update', 'team_delete', 'member_added', 'member_removed', 'member_role_updated', 'task_shared', 'task_assignment')
  )
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);

-- Create index on read status for filtering unread notifications
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications (user_id, read) WHERE read = false;

-- Create RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for reading notifications (users can only see their own notifications)
CREATE POLICY notifications_select_policy ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting notifications (authenticated users can create notifications)
CREATE POLICY notifications_insert_policy ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
-- Policy for updating notifications (users can only update their own notifications)
CREATE POLICY notifications_update_policy ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
  
-- Policy for deleting notifications (users can only delete their own notifications)
CREATE POLICY notifications_delete_policy ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for team events

-- Notification trigger for team invitations
CREATE OR REPLACE FUNCTION notify_team_invitation() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata
  ) 
  SELECT
    NEW.user_id,
    'team_invite',
    'Team Invitation',
    format('You have been invited to join team "%s"', (SELECT name FROM teams WHERE id = NEW.team_id)),
    jsonb_build_object(
      'team_id', NEW.team_id,
      'role', NEW.role
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_member_invite_notification
AFTER INSERT ON team_members
FOR EACH ROW
EXECUTE FUNCTION notify_team_invitation();

-- Notification trigger for role updates
CREATE OR REPLACE FUNCTION notify_role_update() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role != NEW.role THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      metadata
    ) VALUES (
      NEW.user_id,
      'member_role_updated',
      'Role Updated',
      format('Your role in team "%s" has been updated to %s', 
        (SELECT name FROM teams WHERE id = NEW.team_id),
        NEW.role
      ),
      jsonb_build_object(
        'team_id', NEW.team_id,
        'role', NEW.role
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_member_role_update_notification
AFTER UPDATE ON team_members
FOR EACH ROW
WHEN (OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION notify_role_update();

-- Notification trigger for team deletion
CREATE OR REPLACE FUNCTION notify_team_deletion() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata
  )
  SELECT 
    user_id,
    'team_delete',
    'Team Deleted',
    format('The team "%s" has been deleted', OLD.name),
    jsonb_build_object(
      'team_id', OLD.id
    )
  FROM 
    team_members
  WHERE 
    team_id = OLD.id AND user_id != auth.uid();
    
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_deletion_notification
BEFORE DELETE ON teams
FOR EACH ROW
EXECUTE FUNCTION notify_team_deletion();

-- Add notification field to team_members
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE;
