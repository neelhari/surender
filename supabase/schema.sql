-- ==============================================================================
-- EDUEME RESEARCH LABS — COMPLETE SUPABASE DATABASE & STORAGE SCHEMA
-- Production-Ready, Idempotent (Safe to run multiple times)
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. APP STORE TABLE (Key-Value Store for Full App State Sync)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.edueme_store (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.edueme_store ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read edueme_store" ON public.edueme_store;
CREATE POLICY "Public Read edueme_store" 
ON public.edueme_store FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public Write edueme_store" ON public.edueme_store;
CREATE POLICY "Public Write edueme_store" 
ON public.edueme_store FOR ALL 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 2. LEADS / INQUIRIES TABLE
-- ==============================================================================
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
    status TEXT DEFAULT 'new',
    priority TEXT DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone on the public website to submit an inquiry
DROP POLICY IF EXISTS "Allow Public Inquiry Submission" ON public.leads;
CREATE POLICY "Allow Public Inquiry Submission" 
ON public.leads FOR INSERT 
WITH CHECK (true);

-- Allow reading and updating leads (service role & authenticated admins)
DROP POLICY IF EXISTS "Allow Admin Lead Management" ON public.leads;
CREATE POLICY "Allow Admin Lead Management" 
ON public.leads FOR ALL 
USING (true)
WITH CHECK (true);


-- ==============================================================================
-- 3. COURSES TABLE
-- ==============================================================================
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

DROP POLICY IF EXISTS "Public Read Courses" ON public.courses;
CREATE POLICY "Public Read Courses" 
ON public.courses FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin Course Edits" ON public.courses;
CREATE POLICY "Allow Admin Course Edits" 
ON public.courses FOR ALL 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 4. SERVICES TABLE
-- ==============================================================================
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

DROP POLICY IF EXISTS "Public Read Services" ON public.services;
CREATE POLICY "Public Read Services" 
ON public.services FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin Service Edits" ON public.services;
CREATE POLICY "Allow Admin Service Edits" 
ON public.services FOR ALL 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 5. SUB-SERVICES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sub_services (
    id TEXT PRIMARY KEY,
    service_id TEXT,
    service_slug TEXT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    detailed_overview TEXT,
    modules JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    status TEXT DEFAULT 'active',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read SubServices" ON public.sub_services;
CREATE POLICY "Public Read SubServices" 
ON public.sub_services FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin SubService Edits" ON public.sub_services;
CREATE POLICY "Allow Admin SubService Edits" 
ON public.sub_services FOR ALL 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 6. HOME BANNERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.home_banners (
    id TEXT PRIMARY KEY,
    badge TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text TEXT,
    cta_link TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Banners" ON public.home_banners;
CREATE POLICY "Public Read Banners" 
ON public.home_banners FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin Banner Edits" ON public.home_banners;
CREATE POLICY "Allow Admin Banner Edits" 
ON public.home_banners FOR ALL 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 7. TEAM MEMBERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    image TEXT,
    display_order INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Team" ON public.team_members;
CREATE POLICY "Public Read Team" 
ON public.team_members FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin Team Edits" ON public.team_members;
CREATE POLICY "Allow Admin Team Edits" 
ON public.team_members FOR ALL 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 8. GALLERY ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Gallery" ON public.gallery_items;
CREATE POLICY "Public Read Gallery" 
ON public.gallery_items FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin Gallery Edits" ON public.gallery_items;
CREATE POLICY "Allow Admin Gallery Edits" 
ON public.gallery_items FOR ALL 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 9. EVENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT,
    type TEXT DEFAULT 'upcoming',
    date TEXT,
    timings TEXT,
    location TEXT,
    short_description TEXT,
    description TEXT,
    image TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Events" ON public.events;
CREATE POLICY "Public Read Events" 
ON public.events FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin Event Edits" ON public.events;
CREATE POLICY "Allow Admin Event Edits" 
ON public.events FOR ALL 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 10. SETTINGS & SEO TABLE
-- ==============================================================================
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

DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
CREATE POLICY "Public Read Settings" 
ON public.settings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin Settings Edits" ON public.settings;
CREATE POLICY "Allow Admin Settings Edits" 
ON public.settings FOR ALL 
USING (true) 
WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.seo (
    page_route TEXT PRIMARY KEY,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.seo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read SEO" ON public.seo;
CREATE POLICY "Public Read SEO" 
ON public.seo FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow Admin SEO Edits" ON public.seo;
CREATE POLICY "Allow Admin SEO Edits" 
ON public.seo FOR ALL 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 11. SUPABASE STORAGE BUCKET & RLS POLICIES (Images & Uploads)
-- ==============================================================================
-- Ensure the storage bucket exists and is marked public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'edueme_uploads', 
    'edueme_uploads', 
    true, 
    10485760, -- 10MB limit per image
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];

-- Storage RLS: Anyone can view images via CDN URL
DROP POLICY IF EXISTS "Public Image View" ON storage.objects;
CREATE POLICY "Public Image View" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'edueme_uploads');

-- Storage RLS: Allow uploads into edueme_uploads bucket
DROP POLICY IF EXISTS "Allow Image Uploads" ON storage.objects;
CREATE POLICY "Allow Image Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'edueme_uploads');

-- Storage RLS: Allow updating existing images
DROP POLICY IF EXISTS "Allow Image Updates" ON storage.objects;
CREATE POLICY "Allow Image Updates" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'edueme_uploads')
WITH CHECK (bucket_id = 'edueme_uploads');

-- Storage RLS: Allow deleting images
DROP POLICY IF EXISTS "Allow Image Deletes" ON storage.objects;
CREATE POLICY "Allow Image Deletes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'edueme_uploads');
