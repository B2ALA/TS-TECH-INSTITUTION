-- Enable UUID cryptographic engines
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Identity Profiles Database Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'pending_approval')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Core Curriculum Track Database Table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY, -- e.g., 'ds-01', 'emb-02'
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    price_inr NUMERIC(10, 2) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Live Enrollment Progress Logs (Initialized strictly empty)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- 4. Central Advanced Financial Ledger Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_hash TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    account_name TEXT NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE RESTRICT NOT NULL,
    course_name TEXT NOT NULL,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('UPI', 'Online', 'Cash', 'Bank Transfer')),
    gross_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    transaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert TS TECH PARK Core Course Reference Definitions
INSERT INTO public.courses (id, title, category, description, price_inr, is_premium) VALUES
('ds-01', 'DATA SCIENCE BY TS TECH PARK', 'data-science', 'Complete engineering telemetry pipelines, data analysis matrix configurations, and modern machine learning integration frameworks.', 4999.00, true),
('emb-02', 'EMBEDDED SYSTEMS BY TS TECH PARK', 'embedded', 'Microcontroller register parsing, structural firmware development optimization, and hardware abstract logic validation.', 5499.00, true),
('wd-03', 'WEB DEVELOPMENT BY TS TECH PARK', 'web-dev', 'Constructing robust corporate data hubs, building scalable multi-role interfaces, and deploying cloud tracking architectures.', 3999.00, false),
('cs-04', 'CYBER SECURITY BY TS TECH PARK', 'cyber', 'Securing server entry endpoints, network packet tracing audits, cryptographic signature validation frameworks.', 6000.00, true)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title, 
    description = EXCLUDED.description, 
    price_inr = EXCLUDED.price_inr;
