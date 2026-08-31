-- db/migrations/002_migrate_to_new_booking_schema.sql
-- Safe, idempotent migration to evolve legacy schema into the new canonical booking model.
-- Adds missing columns, creates services table if missing, adds indexes, unique booking_ref (only if safe), foreign key, and RLS policies.
-- This migration will NOT drop existing columns or tables. It is designed to be safe to run multiple times.

-- Ensure pgcrypto (for gen_random_uuid) is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === Bookings table evolution ===
-- Add canonical columns if missing. We do not remove legacy columns like service_type, preferred_date, location, etc.
ALTER TABLE IF EXISTS public.bookings
  ADD COLUMN IF NOT EXISTS service_id uuid,
  ADD COLUMN IF NOT EXISTS date date,
  ADD COLUMN IF NOT EXISTS time text,
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Africa/Lagos',
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS booking_ref text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- Ensure created_at exists (many legacy rows use created_at already)
ALTER TABLE IF EXISTS public.bookings
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Populate updated_at for existing rows if null (set to created_at)
UPDATE public.bookings SET updated_at = COALESCE(updated_at, created_at) WHERE EXISTS (SELECT 1 FROM public.bookings) AND updated_at IS NULL;

-- If there is an existing legacy column named preferred_date/preferred_time/service_type/location, keep them. We added new canonical columns above.

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON public.bookings (created_at);
CREATE INDEX IF NOT EXISTS bookings_service_id_idx ON public.bookings (service_id);

-- Add unique constraint for booking_ref only if values are non-NULL and unique
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='booking_ref') = 1 THEN
    PERFORM 1 FROM pg_class WHERE relname = 'bookings_booking_ref_key';
    IF NOT FOUND THEN
      -- Ensure there are no duplicate non-null booking_ref values before creating unique constraint
      IF (SELECT COUNT(*) FROM (SELECT booking_ref FROM public.bookings WHERE booking_ref IS NOT NULL GROUP BY booking_ref HAVING COUNT(*) > 1) AS dup) = 0 THEN
        ALTER TABLE public.bookings ADD CONSTRAINT bookings_booking_ref_key UNIQUE (booking_ref);
      ELSE
        RAISE NOTICE 'Not creating unique constraint bookings_booking_ref_key: duplicate booking_ref values exist.';
      END IF;
    END IF;
  END IF;
END$$;

-- === Services table ===
-- Create services table if it does not exist. Use uuid id for new services.
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  price text,
  requires_address boolean DEFAULT false,
  requires_quote boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Ensure created_at populated for existing services rows (if any)
UPDATE public.services SET created_at = now() WHERE created_at IS NULL;

-- Index on active
CREATE INDEX IF NOT EXISTS services_active_idx ON public.services (active);

-- === Foreign key from bookings.service_id -> services.id ===
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='bookings' AND column_name='service_id') THEN
    -- Add FK only if services table exists and FK not already present
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services') THEN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema, table_name)
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'bookings' AND kcu.column_name = 'service_id'
      ) THEN
        BEGIN
          ALTER TABLE public.bookings
            ADD CONSTRAINT bookings_service_fk FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Could not add foreign key bookings_service_fk: %', SQLERRM;
        END;
      END IF;
    END IF;
  END IF;
END$$;

-- === Row Level Security ===
-- Enable RLS (if not already) on bookings and services
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;

-- Helper: admin email used in policies. Policies in Postgres cannot read environment variables, so we set the admin email literal here.
-- If you need a different admin email, update the policies manually in Supabase (or run a follow-up migration to ALTER POLICY).

-- NOTE: Replace 'spotlesssorted2@gmail.com' in these policies if your admin email is different.

-- Bookings: allow anonymous inserts (public customers)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'bookings_allow_insert_anon') THEN
    CREATE POLICY bookings_allow_insert_anon ON public.bookings
      FOR INSERT TO anon, authenticated
      WITH CHECK (true);
  END IF;
END$$;

-- Bookings: restrict SELECT to admin only
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'bookings_admin_select') THEN
    CREATE POLICY bookings_admin_select ON public.bookings
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'spotlesssorted2@gmail.com'
        )
      );
  END IF;
END$$;

-- Bookings: allow admin updates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'bookings_admin_update') THEN
    CREATE POLICY bookings_admin_update ON public.bookings
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'spotlesssorted2@gmail.com'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'spotlesssorted2@gmail.com'
        )
      );
  END IF;
END$$;

-- Bookings: allow admin delete
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'bookings_admin_delete') THEN
    CREATE POLICY bookings_admin_delete ON public.bookings
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'spotlesssorted2@gmail.com'
        )
      );
  END IF;
END$$;

-- Services: public can SELECT only active services
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'services_public_select_active') THEN
    CREATE POLICY services_public_select_active ON public.services
      FOR SELECT TO anon, authenticated
      USING (active = true);
  END IF;
END$$;

-- Services: admin manage policies (select/insert/update/delete)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'services_admin_select') THEN
    CREATE POLICY services_admin_select ON public.services
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'spotlesssorted2@gmail.com'
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'services_admin_insert') THEN
    CREATE POLICY services_admin_insert ON public.services
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'spotlesssorted2@gmail.com'
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'services_admin_update') THEN
    CREATE POLICY services_admin_update ON public.services
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'spotlesssorted2@gmail.com'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'spotlesssorted2@gmail.com'
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'services_admin_delete') THEN
    CREATE POLICY services_admin_delete ON public.services
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.email = 'spotlesssorted2@gmail.com'
        )
      );
  END IF;
END$$;

-- End of migration
