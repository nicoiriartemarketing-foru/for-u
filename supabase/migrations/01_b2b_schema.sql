-- ========================================================================================
-- SCHEMA INITIALIZATION FOR FOR U B2B SAAS
-- ========================================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE business_type_enum AS ENUM ('experiencia', 'hospedaje', 'alimentos');
CREATE TYPE status_enum AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE subscription_enum AS ENUM ('trial', 'active', 'past_due', 'cancelled');

CREATE TYPE experience_category_enum AS ENUM ('tour_aventura', 'tour_cultural', 'taller_artesanal', 'tour_gastronomico', 'retiro_wellness', 'deporte_extremo');
CREATE TYPE difficulty_level_enum AS ENUM ('facil', 'moderado', 'avanzado', 'extremo');
CREATE TYPE cancellation_policy_enum AS ENUM ('flexible', 'moderada', 'estricta');

CREATE TYPE accommodation_type_enum AS ENUM ('hotel', 'hostal', 'airbnb', 'glamping', 'casa_rural', 'resort');

CREATE TYPE restaurant_category_enum AS ENUM ('fine_dining', 'casual', 'fast_food', 'cafe', 'bar', 'food_truck');
CREATE TYPE price_range_enum AS ENUM ('economico', 'medio', 'alto', 'lujo');
CREATE TYPE dress_code_enum AS ENUM ('casual', 'smart_casual', 'formal', 'none');

CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'deposit_paid', 'fully_paid');

CREATE TYPE analytics_event_type_enum AS ENUM ('profile_view', 'menu_view', 'booking_request', 'whatsapp_click', 'phone_click', 'direction_request');
CREATE TYPE analytics_source_enum AS ENUM ('direct', 'search', 'social', 'qr_code');

-- ==========================================
-- 2. CORE TABLES
-- ==========================================

-- Businesses Table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- references auth.users in Supabase
    business_type business_type_enum NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status status_enum DEFAULT 'pending',
    subscription_status subscription_enum DEFAULT 'trial',
    setup_step INTEGER DEFAULT 1 CHECK (setup_step BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Profiles Table
-- Holds both common and specific fields as JSONB or separate columns
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

    -- Common Fields
    logo_url TEXT,
    cover_image_url TEXT,
    description TEXT,
    phone_whatsapp VARCHAR(50),
    email_contact VARCHAR(255),
    address_full TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    social_instagram VARCHAR(255),
    social_facebook VARCHAR(255),
    social_tiktok VARCHAR(255),
    hours_operation JSONB DEFAULT '{}', -- { "lunes": { "open": "09:00", "close": "18:00" } }
    payment_methods JSONB DEFAULT '[]', -- ["cash", "visa"]
    languages JSONB DEFAULT '[]', -- ["español", "english"]
    custom_features JSONB DEFAULT '[]', -- User defined features [{name: 'Wifi', icon: 'wifi'}]

    -- Vertical Specific Fields
    -- We use nullable columns to support the different verticals flexibly within the same table,
    -- or we could use a single JSONB column `specific_data`. We'll use structured columns for major queries.

    -- Experiencias
    exp_category experience_category_enum,
    exp_duration_minutes INTEGER,
    exp_max_participants INTEGER,
    exp_min_participants INTEGER,
    exp_difficulty difficulty_level_enum,
    exp_age_min INTEGER,
    exp_age_max INTEGER,
    exp_includes JSONB DEFAULT '[]',
    exp_meeting_point TEXT,
    exp_what_to_bring TEXT,
    exp_cancellation_policy cancellation_policy_enum,
    exp_price_per_person_soles DECIMAL(10, 2),
    exp_price_includes_group BOOLEAN DEFAULT false,
    exp_group_discount_percentage DECIMAL(5, 2),
    exp_available_days JSONB DEFAULT '[]',
    exp_time_slots JSONB DEFAULT '[]',
    exp_instant_booking BOOLEAN DEFAULT false,
    exp_requires_approval BOOLEAN DEFAULT true,

    -- Hospedaje
    acc_type accommodation_type_enum,
    acc_star_rating INTEGER CHECK (acc_star_rating BETWEEN 1 AND 5),
    acc_total_rooms INTEGER,
    acc_room_types JSONB DEFAULT '[]',
    acc_amenities JSONB DEFAULT '[]',
    acc_check_in_time TIME,
    acc_check_out_time TIME,
    acc_min_nights_stay INTEGER,
    acc_max_guests_per_room INTEGER,
    acc_pet_friendly BOOLEAN DEFAULT false,
    acc_smoking_allowed BOOLEAN DEFAULT false,
    acc_cancellation_policy_days INTEGER,
    acc_price_low_season_soles DECIMAL(10, 2),
    acc_price_high_season_soles DECIMAL(10, 2),
    acc_seasonal_rates JSONB DEFAULT '[]',
    acc_accepts_reservations BOOLEAN DEFAULT true,
    acc_instant_confirmation BOOLEAN DEFAULT false,

    -- Alimentos
    food_cuisine_type JSONB DEFAULT '[]',
    food_category restaurant_category_enum,
    food_price_range price_range_enum,
    food_seating_capacity INTEGER,
    food_has_delivery BOOLEAN DEFAULT false,
    food_has_takeout BOOLEAN DEFAULT false,
    food_has_terrace BOOLEAN DEFAULT false,
    food_has_private_events BOOLEAN DEFAULT false,
    food_menu_sections JSONB DEFAULT '[]',
    food_menu_items JSONB DEFAULT '[]',
    food_happy_hour JSONB DEFAULT '{"active": false}',
    food_reservations_required BOOLEAN DEFAULT false,
    food_accepts_walk_ins BOOLEAN DEFAULT true,
    food_average_service_time_minutes INTEGER,
    food_dress_code dress_code_enum,
    food_parking_available BOOLEAN DEFAULT false,
    food_wheelchair_accessible BOOLEAN DEFAULT false,

    -- Design Customizations
    theme_color VARCHAR(10) DEFAULT '#2D5A4A',
    theme_template VARCHAR(50) DEFAULT 'default',
    gallery_images JSONB DEFAULT '[]',
    show_prices BOOLEAN DEFAULT true,
    enable_online_booking BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital Menus (Restaurants only)
CREATE TABLE digital_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    qr_code_url TEXT,
    menu_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    theme_color VARCHAR(10),
    show_prices BOOLEAN DEFAULT true,
    show_nutritional_info BOOLEAN DEFAULT false,
    multi_language BOOLEAN DEFAULT false,
    languages_available JSONB DEFAULT '["es"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking System
CREATE TABLE booking_system (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    number_of_guests INTEGER DEFAULT 1,
    total_price DECIMAL(10, 2),
    status booking_status_enum DEFAULT 'pending',
    special_requests TEXT,
    payment_status payment_status_enum DEFAULT 'unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    event_type analytics_event_type_enum NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_hash VARCHAR(255),
    source analytics_source_enum DEFAULT 'direct'
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID, -- Optional: references auth.users if customers are logged in
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    response_from_business TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. RLS POLICIES (Row Level Security)
-- ==========================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Examples of RLS (You would adjust these based on your exact auth requirements)
-- Allow public to read active businesses
CREATE POLICY "Public can view active businesses" ON businesses FOR SELECT USING (status = 'active');
-- Allow business owner to manage their own business
CREATE POLICY "Owners can manage their businesses" ON businesses FOR ALL USING (auth.uid() = user_id);

-- Similarly for profiles
CREATE POLICY "Public can view profiles of active businesses" ON business_profiles FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE status = 'active')
);
CREATE POLICY "Owners can manage their business profiles" ON business_profiles FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
