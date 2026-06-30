-- ========================================================================================
-- STUDIO CONTENT ASSETS
-- Saves FOR U scripts and recorded videos so they can be downloaded later from Studio.
-- ========================================================================================

CREATE TABLE IF NOT EXISTS studio_content_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(220) NOT NULL,
    label VARCHAR(120),
    kind VARCHAR(30) NOT NULL CHECK (kind IN ('script', 'video')),
    content_text TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(120),
    storage_bucket VARCHAR(120),
    storage_path TEXT,
    public_url TEXT,
    source_task_id VARCHAR(120),
    source_copy_id VARCHAR(120),
    status VARCHAR(40) DEFAULT 'saved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_content_assets_created_at
    ON studio_content_assets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_studio_content_assets_kind
    ON studio_content_assets(kind);

ALTER TABLE studio_content_assets ENABLE ROW LEVEL SECURITY;

-- Temporary private-studio policies for the current single-owner launch.
-- Replace these with authenticated-owner policies before opening Studio publicly.
CREATE POLICY "Studio can save content assets"
ON studio_content_assets
FOR INSERT
TO anon, authenticated
WITH CHECK (length(trim(title)) BETWEEN 1 AND 220);

CREATE POLICY "Studio can read content assets"
ON studio_content_assets
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Studio can delete content assets"
ON studio_content_assets
FOR DELETE
TO anon, authenticated
USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('foru-studio-content', 'foru-studio-content', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Studio can upload content files"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'foru-studio-content');

CREATE POLICY "Studio can read content files"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'foru-studio-content');

CREATE POLICY "Studio can update content files"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'foru-studio-content')
WITH CHECK (bucket_id = 'foru-studio-content');

CREATE POLICY "Studio can delete content files"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'foru-studio-content');
