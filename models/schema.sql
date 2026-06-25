-- Reset conflicting assets to create a clean setup
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;

-- Create Core Course Engine Definitions with high-contrast naming keys
CREATE TABLE public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price_inr NUMERIC(10, 2) NOT NULL
);

-- Real-time Active System Enrollment Trackers (Initialized completely empty)
CREATE TABLE public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Advanced Financial Operations Ledger
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_hash TEXT UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    course_id TEXT REFERENCES public.courses(id),
    course_name TEXT NOT NULL,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('UPI', 'Online', 'Cash', 'Bank Transfer')),
    gross_amount NUMERIC(10, 2) NOT NULL,
    transaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert Professional Corporate Reference Course Modules
INSERT INTO public.courses (id, title, price_inr) VALUES
('ds-01', 'DATA SCIENCE BY TS TECH PARK', 4999.00),
('emb-02', 'EMBEDDED SYSTEMS BY TS TECH PARK', 5499.00),
('wd-03', 'WEB DEVELOPMENT BY TS TECH PARK', 3999.00),
('cs-04', 'CYBER SECURITY BY TS TECH PARK', 6000.00);
