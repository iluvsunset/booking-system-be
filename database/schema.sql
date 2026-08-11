-- ================================================================
-- BOOKING SYSTEM - SUPABASE POSTGRESQL DATABASE SCHEMA & MOCK DATA
-- ================================================================

-- 1. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    property_type TEXT DEFAULT 'apartment', -- 'apartment', 'house', 'villa'
    rental_type TEXT DEFAULT 'both',        -- 'long_term', 'short_term', 'both'
    area_sqm NUMERIC(10, 2) DEFAULT 0,
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    reference_price NUMERIC(15, 2) DEFAULT 0,
    status TEXT DEFAULT 'vacant',           -- 'vacant', 'occupied', 'maintenance'
    description TEXT,
    photos TEXT[],                          -- PostgreSQL Array of photo URLs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TENANTS TABLE
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    id_number TEXT,
    permanent_address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT UNIQUE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    property_name TEXT,
    tenant_name TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent NUMERIC(15, 2) NOT NULL,
    deposit_amount NUMERIC(15, 2) DEFAULT 0,
    payment_day INTEGER DEFAULT 5,
    status TEXT DEFAULT 'active',            -- 'active', 'renewed', 'terminated', 'expired'
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENT SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    property_name TEXT,
    tenant_name TEXT,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    amount_due NUMERIC(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending',          -- 'pending', 'paid', 'overdue'
    paid_date DATE,
    paid_amount NUMERIC(15, 2) DEFAULT 0,
    payment_method TEXT,                    -- 'bank_transfer', 'cash', 'zalo_pay', 'vnpay'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number TEXT UNIQUE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER DEFAULT 1,
    agreed_price NUMERIC(15, 2) NOT NULL,
    deposit_amount NUMERIC(15, 2) DEFAULT 0,
    status TEXT DEFAULT 'confirmed',        -- 'confirmed', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TEMPORARY RESIDENCE DECLARATIONS (CT01 / CT07)
CREATE TABLE IF NOT EXISTS public.temp_residences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    property_name TEXT,
    guest_name TEXT NOT NULL,
    id_number TEXT DEFAULT 'Chưa bổ sung',
    permanent_address TEXT DEFAULT 'Chưa bổ sung',
    form_type TEXT DEFAULT 'CT01',          -- 'CT01', 'CT07'
    status TEXT DEFAULT 'unsubmitted',       -- 'unsubmitted', 'submitted', 'verified'
    submitted_date DATE,
    police_station TEXT DEFAULT 'Công an Phường địa bàn',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_ref TEXT DEFAULT 'Chủ nhà',
    channel TEXT DEFAULT 'in_app',          -- 'in_app', 'sms', 'zalo_zns', 'email'
    notification_type TEXT NOT NULL,         -- 'booking_request', 'payment_received', 'contract_expiry', 'system'
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'sent',             -- 'unread', 'read', 'sent'
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. USER ACCOUNTS TABLE (RBAC)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'guest',              -- 'owner', 'manager', 'sale', 'tenant', 'guest', 'admin'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INITIAL SEED DATA
-- ================================================================

-- Insert Mock Luxury Penthouse Property
INSERT INTO public.properties (
    name, address, property_type, rental_type, area_sqm, bedrooms, bathrooms, reference_price, status, description, photos
) VALUES (
    'Penthouse Sun Grand City Panorama',
    'Số 69 Thụy Khuê, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội',
    'apartment',
    'both',
    125,
    3,
    2,
    22000000,
    'vacant',
    'Căn hộ Penthouse đẳng cấp 5 sao góc 2 mặt tiền view panorama toàn cảnh Hồ Tây và sông Hồng. Thiết kế kiến trúc hiện đại chuẩn Châu Âu, nội thất nhập khẩu từ Ý, sàn gỗ tự nhiên, trang bị đầy đủ thiết bị thông minh Smart Home.

✨ Chi tiết tiện nghi nổi bật:
• 03 Phòng ngủ Master tràn ngập ánh sáng tự nhiên với kính Low-E cách âm & chống tia UV.
• Phòng khách thông tầng rộng 45m² sang trọng với sofa da thật & Smart TV 75 inch 4K.
• Bếp đun từ Bosch, tủ lạnh Side-by-Side Hitachi, máy rửa bát tự động & quầy bar mini.
• Ban công thoáng đãng rộng 15m² trồng cây xanh & bộ bàn ghế thư giãn ngắm hoàng hôn Hồ Tây.
• Tiện ích tòa nhà: Hồ bơi vô cực bốn mùa, phòng Gym Technogym, bảo vệ an ninh 24/7, hầm để xe thông minh.',
    ARRAY[
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80'
    ]
);
