-- ========================================================================================
-- DIGITAL WORLD DRAFTS
-- Stores the AI-guided onboarding output before it becomes a full business profile.
-- ========================================================================================

CREATE TABLE IF NOT EXISTS digital_world_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id UUID,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,

    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(80) NOT NULL,
    business_title VARCHAR(255),
    tone VARCHAR(80),
    main_goal TEXT,
    generated_pitch TEXT,
    primary_cta VARCHAR(160),
    world_blocks JSONB DEFAULT '[]',
    next_steps JSONB DEFAULT '[]',
    ai_questions JSONB DEFAULT '[]',
    diagnosis JSONB DEFAULT '{}',
    clarity_score INTEGER,
    priority TEXT,
    payload JSONB DEFAULT '{}',

    status VARCHAR(40) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_world_drafts_user_id
    ON digital_world_drafts(user_id);

CREATE INDEX IF NOT EXISTS idx_digital_world_drafts_session_id
    ON digital_world_drafts(session_id);

ALTER TABLE digital_world_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can create draft worlds"
ON digital_world_drafts
FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Owners can view their draft worlds"
ON digital_world_drafts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Owners can update their draft worlds"
ON digital_world_drafts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete their draft worlds"
ON digital_world_drafts
FOR DELETE
USING (auth.uid() = user_id);
