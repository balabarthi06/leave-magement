-- =============================================================================
-- LEAVE MANAGEMENT SYSTEM - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Table: leave_balances
-- Description: Stores leave balances for employees with gender-based defaults,
--              foreign keys, constraints, indexes, default values, and relationships.
-- =============================================================================

-- 1. Create or Alter Table `users`
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Employee',
    gender VARCHAR(20) NOT NULL DEFAULT 'Male',
    photo TEXT,
    designation VARCHAR(100) DEFAULT 'Software Associate',
    department VARCHAR(100) DEFAULT 'Engineering',
    employee_id VARCHAR(50) UNIQUE,
    joined_date DATE DEFAULT CURRENT_DATE,
    leave_balances JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Table `leave_balances`
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    casual_leave INT NOT NULL DEFAULT 12 CONSTRAINT chk_casual_leave CHECK (casual_leave >= 0),
    sick_leave INT NOT NULL DEFAULT 12 CONSTRAINT chk_sick_leave CHECK (sick_leave >= 0),
    vacation_leave INT NOT NULL DEFAULT 15 CONSTRAINT chk_vacation_leave CHECK (vacation_leave >= 0),
    maternity_leave INT NOT NULL DEFAULT 0 CONSTRAINT chk_maternity_leave CHECK (maternity_leave >= 0),
    paternity_leave INT NOT NULL DEFAULT 0 CONSTRAINT chk_paternity_leave CHECK (paternity_leave >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe Alter Table additions (if leave_balances table already exists)
ALTER TABLE leave_balances ADD COLUMN IF NOT EXISTS casual_leave INT NOT NULL DEFAULT 12;
ALTER TABLE leave_balances ADD COLUMN IF NOT EXISTS sick_leave INT NOT NULL DEFAULT 12;
ALTER TABLE leave_balances ADD COLUMN IF NOT EXISTS vacation_leave INT NOT NULL DEFAULT 15;
ALTER TABLE leave_balances ADD COLUMN IF NOT EXISTS maternity_leave INT NOT NULL DEFAULT 0;
ALTER TABLE leave_balances ADD COLUMN IF NOT EXISTS paternity_leave INT NOT NULL DEFAULT 0;

-- 3. Indexes for High-Performance Lookups
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_id ON leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. Function & Trigger for Automatic Timestamp Updates
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_leave_balances_updated_at ON leave_balances;
CREATE TRIGGER trg_update_leave_balances_updated_at
BEFORE UPDATE ON leave_balances
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- 5. Function & Trigger: Automatically Create Gender-Based Leave Balances on User Registration
-- Gender Logic: Male → Paternity Leave: 15 days | Female → Maternity Leave: 180 days
CREATE OR REPLACE FUNCTION auto_create_user_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.gender = 'Female' THEN
        INSERT INTO leave_balances (
            user_id, casual_leave, sick_leave, vacation_leave, maternity_leave, paternity_leave
        ) VALUES (
            NEW.id, 12, 12, 15, 180, 0
        ) ON CONFLICT (user_id) DO UPDATE SET
            maternity_leave = EXCLUDED.maternity_leave,
            updated_at = NOW();
    ELSE
        INSERT INTO leave_balances (
            user_id, casual_leave, sick_leave, vacation_leave, maternity_leave, paternity_leave
        ) VALUES (
            NEW.id, 12, 12, 15, 0, 15
        ) ON CONFLICT (user_id) DO UPDATE SET
            paternity_leave = EXCLUDED.paternity_leave,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_create_leave_balance ON users;
CREATE TRIGGER trg_auto_create_leave_balance
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION auto_create_user_leave_balance();

-- 6. Table `leave_requests` & Indexes
CREATE TABLE IF NOT EXISTS leave_requests (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_photo TEXT,
    designation VARCHAR(100),
    leave_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC NOT NULL CHECK (total_days > 0),
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    is_emergency BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'Normal',
    applied_on DATE DEFAULT CURRENT_DATE,
    reviewed_at DATE,
    reviewed_by VARCHAR(255),
    admin_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe Alter Table additions (if leave_requests table already exists)
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Normal';

-- Index for Overlapping Leave Validation performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_overlap ON leave_requests(user_id, status, start_date, end_date);

