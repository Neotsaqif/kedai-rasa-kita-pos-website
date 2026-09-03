-- Seed SQL Script for Supabase SQL Editor
-- Creates Admin and Cashier user accounts in auth.users and public.profiles

-- Enable pgcrypto extension for password hashing if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_uid UUID := gen_random_uuid();
  cashier_uid UUID := gen_random_uuid();
BEGIN

  --------------------------------------------------------------------------------
  -- 1. ADMIN USER: admin@rasakita.id / password123
  --------------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@rasakita.id') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'admin@rasakita.id',
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Owner / Manager Admin","role":"admin"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );

    -- Insert or update matching profile
    INSERT INTO public.profiles (id, name, role, is_active)
    VALUES (admin_uid, 'Owner / Manager Admin', 'admin', true)
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', name = 'Owner / Manager Admin', is_active = true;
  END IF;

  --------------------------------------------------------------------------------
  -- 2. CASHIER USER: kasir@rasakita.id / password123
  --------------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kasir@rasakita.id') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      cashier_uid,
      '00000000-0000-0000-0000-000000000000',
      'kasir@rasakita.id',
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Kasir Utama","role":"cashier"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );

    -- Insert or update matching profile
    INSERT INTO public.profiles (id, name, role, is_active)
    VALUES (cashier_uid, 'Kasir Utama', 'cashier', true)
    ON CONFLICT (id) DO UPDATE
    SET role = 'cashier', name = 'Kasir Utama', is_active = true;
  END IF;

END $$;
