-- Add blocked column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false;

-- Update existing users to have blocked = false
UPDATE users SET blocked = false WHERE blocked IS NULL;

-- Add comment to the column
COMMENT ON COLUMN users.blocked IS 'Whether the user is blocked from accessing the system'; 