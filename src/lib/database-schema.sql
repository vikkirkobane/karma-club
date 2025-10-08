-- Create the users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(255),
  organization VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the user_settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  show_on_leaderboard BOOLEAN DEFAULT TRUE,
  share_location BOOLEAN DEFAULT TRUE,
  public_profile BOOLEAN DEFAULT TRUE
);

-- Create the user_stats table
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0
);

-- Create the badges table
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255)
);

-- Create the user_badges table
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, badge_id)
);

-- Create the activity_categories table
CREATE TABLE activity_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Create the activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES activity_categories(id),
  points INTEGER DEFAULT 1
);

-- Create the user_activities table
CREATE TABLE user_activities (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  media_url VARCHAR(255),

  description TEXT
);

-- Create the daily_activities table
CREATE TABLE daily_activities (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  date DATE NOT NULL
);

-- Create the levels table
CREATE TABLE levels (
  level INTEGER PRIMARY KEY,
  points_required INTEGER NOT NULL
);

-- Create the achievements table
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  badge_id INTEGER REFERENCES badges(id)
);

-- Create the organizations table
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  logo_url VARCHAR(255)
);

-- Create the organization_activities table
CREATE TABLE organization_activities (
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  PRIMARY KEY (organization_id, activity_id)
);

-- Create the partner_analytics table
CREATE TABLE partner_analytics (
  organization_id INTEGER PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  total_donations REAL DEFAULT 0,
  total_volunteers INTEGER DEFAULT 0
);

-- Create the organization_users table
CREATE TABLE organization_users (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, organization_id)
);