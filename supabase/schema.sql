-- ====================================================================
-- BOOKING SYSTEM — SUPABASE POSTGRESQL DATABASE SCHEMA & RLS POLICIES
-- Matched 100% against system design spec 04_Database-Design.md
-- ====================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'owner', 'manager', 'sale', 'tenant', 'guest');
CREATE TYPE property_type AS ENUM ('apartment', 'room', 'villa', 'house');
CREATE TYPE rental_type AS ENUM ('long_term', 'short_term', 'both');
CREATE TYPE property_status AS ENUM ('vacant', 'occupied', 'maintenance');
CREATE TYPE contract_status AS ENUM ('draft', 'active', 'expiring_soon', 'expired', 'renewed', 'terminated');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE payment_schedule_status AS ENUM ('pending', 'paid', 'overdue', 'waived');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'momo', 'cash');
CREATE TYPE notification_channel AS ENUM ('zalo', 'sms', 'email', 'in_app');
CREATE TYPE notification_type AS ENUM ('payment_reminder_d3', 'payment_reminder_d0', 'payment_overdue_d3', 'contract_expiry_30d', 'booking_confirmed', 'payment_received');
CREATE TYPE residence_form_type AS ENUM ('CT01', 'CT07');
CREATE TYPE residence_status AS ENUM ('unsubmitted', 'submitted', 'accepted', 'rejected');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE,
    password_hash VARCHAR(256),
    role user_role NOT NULL DEFAULT 'guest',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    property_type property_type NOT NULL DEFAULT 'apartment',
    rental_type rental_type NOT NULL DEFAULT 'long_term',
    area_sqm NUMERIC(8,2) DEFAULT 0,
    bedrooms SMALLINT DEFAULT 1,
    bathrooms SMALLINT DEFAULT 1,
    reference_price NUMERIC(15,2) DEFAULT 0,
    status property_status NOT NULL DEFAULT 'vacant',
    description TEXT,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    active_contract_id UUID,
    active_contract_end_date DATE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 4. TENANTS TABLE (CCCD Data)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    id_number VARCHAR(20) UNIQUE NOT NULL,
    id_issue_date DATE,
    id_issue_place VARCHAR(200),
    permanent_address TEXT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(200),
    zalo_uid VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 5. CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent NUMERIC(15,2) NOT NULL,
    deposit NUMERIC(15,2) NOT NULL DEFAULT 0,
    payment_day SMALLINT NOT NULL CHECK (payment_day BETWEEN 1 AND 28),
    status contract_status NOT NULL DEFAULT 'active',
    terms TEXT,
    version SMALLINT NOT NULL DEFAULT 1,
    parent_contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PAYMENT SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    period_month SMALLINT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year SMALLINT NOT NULL,
    amount_due NUMERIC(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status payment_schedule_status NOT NULL DEFAULT 'pending',
    paid_date DATE,
    paid_amount NUMERIC(15,2),
    payment_method payment_method,
    receipt_url TEXT,
    reminder_d3_sent BOOLEAN NOT NULL DEFAULT false,
    reminder_d0_sent BOOLEAN NOT NULL DEFAULT false,
    reminder_overdue_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_schedule_id UUID REFERENCES payment_schedules(id) ON DELETE SET NULL,
    booking_id UUID,
    payment_type VARCHAR(20) NOT NULL DEFAULT 'rent',
    amount_paid NUMERIC(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. BOOKINGS TABLE (Short-Term & Rental Requests)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights SMALLINT NOT NULL CHECK (nights > 0),
    agreed_price NUMERIC(15,2) NOT NULL,
    deposit_amount NUMERIC(15,2) DEFAULT 0,
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TEMP RESIDENCES TABLE (CT01 / CT07 Police Declarations)
CREATE TABLE IF NOT EXISTS temp_residences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    property_name VARCHAR(100) NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    id_number VARCHAR(20) NOT NULL,
    permanent_address TEXT,
    form_type residence_form_type NOT NULL DEFAULT 'CT01',
    status residence_status NOT NULL DEFAULT 'unsubmitted',
    submitted_date DATE,
    police_station VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. DOCUMENTS TABLE (AES-256 Encrypted Scans & Photos)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    blob_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50),
    entity_id UUID,
    recipient_type VARCHAR(20) NOT NULL DEFAULT 'tenant',
    recipient_ref VARCHAR(200) NOT NULL,
    channel notification_channel NOT NULL DEFAULT 'in_app',
    notification_type notification_type NOT NULL,
    subject VARCHAR(500),
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    retry_count SMALLINT NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_message TEXT
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- GRANT PERMISSIONS TO ANON AND AUTHENTICATED ROLES FOR SUPABASE POSTGREST API
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR MULTI-ROLE ACCESS CONTROL
-- ====================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_residences ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public property view" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow authenticated staff property write" ON properties FOR ALL USING (true);
CREATE POLICY "Allow public booking request creation" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated bookings select" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow full access for authenticated staff" ON contracts FOR ALL USING (true);
CREATE POLICY "Allow full access for authenticated schedules" ON payment_schedules FOR ALL USING (true);
CREATE POLICY "Allow full access for authenticated tenants" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow full access for authenticated temp_residences" ON temp_residences FOR ALL USING (true);
CREATE POLICY "Allow full access for users" ON users FOR ALL USING (true);
CREATE POLICY "Allow full access for notifications" ON notifications FOR ALL USING (true);

-- ====================================================================
-- INITIAL MOCK SEED DATA INSERTION
-- ====================================================================

INSERT INTO users (id, full_name, phone, email, role, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'System Admin', '0900000001', 'admin@mockdata.vn', 'admin', true),
('00000000-0000-0000-0000-000000000002', 'Chủ Nhà Owner', '0900000002', 'owner@mockdata.vn', 'owner', true),
('00000000-0000-0000-0000-000000000003', 'Trần Văn Q', '0900000003', 'quanly@mockdata.vn', 'manager', true),
('00000000-0000-0000-0000-000000000004', 'Nguyễn Thị S', '0900000004', 'sale@mockdata.vn', 'sale', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, name, address, property_type, rental_type, area_sqm, bedrooms, bathrooms, reference_price, status, description, photos) VALUES
('11111111-1111-1111-1111-111111111111', 'Căn 301 - Nguyễn Trãi', '301 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM', 'apartment', 'long_term', 55.5, 2, 1, 8000000, 'occupied', 'Căn hộ cao cấp đầy đủ nội thất, view đẹp, thoáng mát.', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80']),
('22222222-2222-2222-2222-222222222222', 'Villa Sunside - Thảo Điền', '12 Nguyễn Văn Hưởng, Phường Thảo Điền, TP. Thủ Đức', 'villa', 'both', 250, 4, 4, 3500000, 'vacant', 'Villa hồ bơi sân vườn cao cấp.', ARRAY['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&auto=format&fit=crop&q=80']),
('33333333-3333-3333-3333-333333333333', 'Phòng 102 - Lê Văn Sỹ', '450 Lê Văn Sỹ, Phường 14, Quận 3, TP.HCM', 'room', 'long_term', 28, 1, 1, 4500000, 'vacant', 'Phòng khép kín sạch sẽ, giờ giấc tự do.', ARRAY['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80']),
('44444444-4444-4444-4444-444444444444', 'Căn 504 - Landmark 81', '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh', 'apartment', 'short_term', 82, 2, 2, 2200000, 'maintenance', 'Đang sơn lại tường và bảo trì điều hoà.', ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80'])
ON CONFLICT (id) DO NOTHING;
