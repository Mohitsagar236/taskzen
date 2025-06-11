-- Create subscription_plan type
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'team');

-- Create subscription_status type
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'incomplete');

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE (user_id)
);

-- Create subscription_features table
CREATE TABLE IF NOT EXISTS subscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan subscription_plan NOT NULL,
  feature text NOT NULL,
  max_value integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE (plan, feature)
);

-- Create subscription_usage table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  feature text NOT NULL,
  used integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (subscription_id, feature, period_start, period_end)
);

-- Add default subscription features
INSERT INTO subscription_features (plan, feature, max_value) VALUES
  ('free', 'max_tasks', 100),
  ('free', 'max_projects', 1),
  ('free', 'max_team_members', 0),
  ('free', 'file_storage_mb', 100),
  ('pro', 'max_tasks', NULL),
  ('pro', 'max_projects', NULL),
  ('pro', 'max_team_members', 5),
  ('pro', 'file_storage_mb', 1000),
  ('team', 'max_tasks', NULL),
  ('team', 'max_projects', NULL),
  ('team', 'max_team_members', NULL),
  ('team', 'file_storage_mb', 5000);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view subscription features"
  ON subscription_features
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own usage"
  ON subscription_usage
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM subscriptions
    WHERE subscriptions.id = subscription_usage.subscription_id
    AND subscriptions.user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscription_usage_subscription_id ON subscription_usage(subscription_id);
CREATE INDEX idx_subscription_usage_period ON subscription_usage(period_start, period_end);

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  user_id uuid,
  feature text,
  increment integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan subscription_plan;
  feature_max_value integer;
  current_usage integer;
BEGIN
  -- Get user's plan
  SELECT plan INTO user_plan
  FROM subscriptions
  WHERE subscriptions.user_id = check_subscription_limit.user_id
  AND status = 'active';

  -- Get feature max_value for the plan
  SELECT max_value INTO feature_max_value
  FROM subscription_features
  WHERE subscription_features.plan = user_plan
  AND subscription_features.feature = check_subscription_limit.feature;

  -- If no max_value (NULL) or no feature found, allow
  IF feature_max_value IS NULL THEN
    RETURN true;
  END IF;

  -- Get current usage
  SELECT used INTO current_usage
  FROM subscription_usage su
  JOIN subscriptions s ON s.id = su.subscription_id
  WHERE s.user_id = check_subscription_limit.user_id
  AND su.feature = check_subscription_limit.feature
  AND now() BETWEEN su.period_start AND su.period_end;

  -- If no usage record found, assume 0
  IF current_usage IS NULL THEN
    current_usage := 0;
  END IF;

  -- Check if increment would exceed max_value
  RETURN (current_usage + increment) <= feature_max_value;
END;
$$;

-- Create function to update usage
CREATE OR REPLACE FUNCTION update_subscription_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_id uuid;
BEGIN
  -- Get subscription ID
  SELECT id INTO subscription_id
  FROM subscriptions
  WHERE user_id = auth.uid()
  AND status = 'active';

  -- Update or insert usage record
  INSERT INTO subscription_usage (
    subscription_id,
    feature,
    used,
    period_start,
    period_end
  )
  VALUES (
    subscription_id,
    TG_ARGV[0],
    1,
    date_trunc('month', now()),
    (date_trunc('month', now()) + interval '1 month' - interval '1 second')
  )
  ON CONFLICT (subscription_id, feature, period_start, period_end)
  DO UPDATE SET
    used = subscription_usage.used + 1,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Create triggers for usage tracking
CREATE TRIGGER track_task_usage
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_usage('max_tasks');

CREATE TRIGGER track_project_usage
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_usage('max_projects');

CREATE TRIGGER track_team_member_usage
  AFTER INSERT ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_usage('max_team_members');