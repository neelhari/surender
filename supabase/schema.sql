-- ==============================================================================
-- EDUEME RESEARCH LABS — SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. App Store Table (General Key-Value Store for all collections)
CREATE TABLE IF NOT EXISTS public.edueme_store (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.edueme_store ENABLE ROW LEVEL SECURITY;

-- Allow public read access to edueme_store
CREATE POLICY "Public read edueme_store" 
ON public.edueme_store 
FOR SELECT 
USING (true);

-- Allow service role / anon write to edueme_store
CREATE POLICY "Public insert/update edueme_store" 
ON public.edueme_store 
FOR ALL 
USING (true) 
WITH CHECK (true);


-- 2. Leads / Inquiries Table
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    source_type TEXT NOT NULL,
    course_name TEXT,
    service_name TEXT,
    sub_service_name TEXT,
    message TEXT,
    status TEXT DEFAULT 'New',
    priority TEXT DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow update leads" ON public.leads FOR UPDATE USING (true);


-- 3. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    short_description TEXT,
    description TEXT,
    duration TEXT,
    level TEXT,
    mode TEXT,
    image TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow all courses" ON public.courses FOR ALL USING (true);


-- 4. Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT,
    icon TEXT,
    image TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow all services" ON public.services FOR ALL USING (true);


-- 5. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global_settings',
    site_name TEXT DEFAULT 'Edueme Research Labs',
    alert_whatsapp TEXT,
    alert_email TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow all settings" ON public.settings FOR ALL USING (true);


-- 6. Storage Bucket for uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('edueme_uploads', 'edueme_uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS policy to allow public access to images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'edueme_uploads');

CREATE POLICY "Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'edueme_uploads');

CREATE POLICY "Public Updates" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'edueme_uploads');

CREATE POLICY "Public Deletes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'edueme_uploads');
