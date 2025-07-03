-- Initial schema for Discord Bot
-- PostgreSQL compatible

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migrations tracking table
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guilds table
CREATE TABLE IF NOT EXISTS guilds (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  settings JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for guild settings
CREATE INDEX IF NOT EXISTS idx_guilds_settings ON guilds USING GIN (settings);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(20) PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  discriminator VARCHAR(4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table with improved constraints
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  channel_id VARCHAR(20) UNIQUE NOT NULL,
  guild_id VARCHAR(20) NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by VARCHAR(20),
  active BOOLEAN DEFAULT TRUE,
  reason TEXT,
  transcript_url TEXT,
  metadata JSONB DEFAULT '{}',
  CONSTRAINT unique_active_ticket UNIQUE(user_id, guild_id, active) WHERE active = true,
  CONSTRAINT valid_closure CHECK (
    (active = true AND closed_at IS NULL) OR
    (active = false AND closed_at IS NOT NULL)
  )
);

-- Indexes for tickets
CREATE INDEX IF NOT EXISTS idx_tickets_user_active ON tickets(user_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel_id);
CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id);
CREATE INDEX IF NOT EXISTS idx_tickets_opened_at ON tickets(opened_at);
CREATE INDEX IF NOT EXISTS idx_tickets_closed_at ON tickets(closed_at) WHERE closed_at IS NOT NULL;

-- Cooldowns table for persistent cooldowns
CREATE TABLE IF NOT EXISTS cooldowns (
  user_id VARCHAR(20) NOT NULL,
  command VARCHAR(100) NOT NULL,
  guild_id VARCHAR(20),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (user_id, command, guild_id)
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_cooldowns_expires ON cooldowns(expires_at);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL,
  user_id VARCHAR(20) NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(20),
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_guild ON audit_logs(guild_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON guilds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert migration record
INSERT INTO migrations (name) VALUES ('001_initial_schema.sql')
ON CONFLICT (name) DO NOTHING;
