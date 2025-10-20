/*
  # Add admin role to profiles
  
  1. Changes
    - Add `is_admin` column to profiles table (boolean, default false)
    - Update specific user to be admin
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add is_admin column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Set the specified user as admin
UPDATE profiles 
SET is_admin = true 
WHERE id = '3974237e-bd13-42e0-8d01-e536280d4013';