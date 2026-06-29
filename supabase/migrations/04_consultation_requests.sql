-- ========================================================================================
-- CONSULTATION REQUESTS
-- Public landing leads for Mundo Digital FOR U.
-- ========================================================================================

CREATE TABLE IF NOT EXISTS consultation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(160) NOT NULL,
    business_name VARCHAR(180),
    instagram_handle VARCHAR(120),
    email VARCHAR(255),
    phone_whatsapp VARCHAR(50),
    business_type VARCHAR(120),
    goal TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    plan_interest VARCHAR(80),
    source VARCHAR(80) DEFAULT 'mundo_digital_landing',
    status VARCHAR(40) DEFAULT 'scheduled',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at
    ON consultation_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_status
    ON consultation_requests(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_consultation_requests_appointment_slot
    ON consultation_requests(appointment_date, appointment_time)
    WHERE status IN ('scheduled', 'confirmed');

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can request a consultation"
ON consultation_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
    length(trim(full_name)) BETWEEN 2 AND 160
    AND length(trim(goal)) BETWEEN 8 AND 1200
    AND appointment_date >= CURRENT_DATE
);

CREATE POLICY "Authenticated users can review consultation requests"
ON consultation_requests
FOR SELECT
TO authenticated
USING (true);
