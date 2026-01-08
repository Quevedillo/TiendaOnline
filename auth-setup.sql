-- ============================================================================
-- Supabase Auth Integration Setup
-- Run this AFTER setting up database.sql
-- ============================================================================

-- Add profiles table for user metadata
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- Create Admin Users (Run after creating your first user in Supabase Auth)
-- ============================================================================

-- Example: To create an admin, first:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" and create an account
-- 3. Copy the user ID (UUID) and replace YOUR_USER_ID below
-- 4. Run this insert:

-- INSERT INTO admin_users (id, email, full_name, role, is_active)
-- VALUES (
--   'YOUR_USER_ID',
--   'admin@fashionmarket.com',
--   'Admin User',
--   'admin',
--   true
-- );

-- ============================================================================
-- Update existing RLS policies for admin_users to support auth
-- ============================================================================

-- Allow the trigger/service role to insert admin records
CREATE POLICY "Admin users: System can insert admins"
  ON admin_users
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to read admin_users (for verification)
DROP POLICY IF EXISTS "Admin users: Public read (limited)" ON admin_users;

CREATE POLICY "Admin users: Authenticated users can verify admin status"
  ON admin_users
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      -- Users can see their own admin record
      id = auth.uid()
      -- OR admins can see all admin records
      OR EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.is_active = true
      )
    )
  );

-- Admin can insert new admins
DROP POLICY IF EXISTS "Admin users: Admin insert" ON admin_users;

CREATE POLICY "Admin users: Admin insert"
  ON admin_users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
      AND admin_users.role = 'admin'
    )
  );

-- Admin can update admin records
DROP POLICY IF EXISTS "Admin users: Admin update" ON admin_users;

CREATE POLICY "Admin users: Admin update"
  ON admin_users
  FOR UPDATE
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
      AND admin_users.role = 'admin'
    )
  );

-- ============================================================================
-- Trigger to create profile entry and check for admin email when user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_email_constant VARCHAR(255) := 'joseluisgq17@gmail.com';
BEGIN
  -- Create profile for the new user
  INSERT INTO profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario'))
  ON CONFLICT (id) DO NOTHING;
  
  -- If email is the admin email, automatically create admin record
  IF new.email = admin_email_constant THEN
    INSERT INTO admin_users (id, email, full_name, role, is_active)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', 'Admin'),
      'admin',
      true
    )
    ON CONFLICT (email) DO UPDATE
    SET is_active = true, role = 'admin';
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- Notes for Admin Account Creation
-- ============================================================================
-- 
-- AUTOMATIC ADMIN CREATION:
-- When a user registers with email: joseluisgq17@gmail.com
-- They will AUTOMATICALLY be created as an admin!
--
-- HOW TO USE:
-- 1. Execute database.sql in Supabase SQL Editor
-- 2. Execute auth-setup.sql in Supabase SQL Editor
-- 3. Go to http://localhost:3000/auth/login
-- 4. Click "Registrarse"
-- 5. Register with email: joseluisgq17@gmail.com
-- 6. You're now an admin - go to http://localhost:3000/admin/login and login
-- 7. You'll have full admin access!
--
-- To add more admin emails, modify the trigger above with additional conditions.
