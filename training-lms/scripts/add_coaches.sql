-- Add Izzuddin and Mike as coaches
-- This will update their role if they've already signed in,
-- or create a profile entry that will be linked when they first sign in

-- Update existing profiles or insert new ones
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'izzuddin.azizol@storehub.com', 'Izzuddin Azizol', 'coach', now(), now()),
  (gen_random_uuid(), 'mike.koh@storehub.com', 'Mike Koh', 'coach', now(), now())
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'coach',
  updated_at = now();
