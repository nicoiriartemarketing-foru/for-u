-- ========================================================================================
-- EXPAND BUSINESS TYPES
-- Keeps the original three verticals and adds the common business categories used by the
-- conversational onboarding.
-- ========================================================================================

ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'restaurante';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'experiencias';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'belleza';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'bienestar';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'servicios';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'educacion';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'tienda';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'eventos';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'salud';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'inmobiliaria';
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'creativo';
