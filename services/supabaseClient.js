import { createClient } from '@supabase/supabase-js';

// Environment credentials for Supabase Cloud Service
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-url')
);

// Singleton Supabase Client pattern (eliminates duplicate GoTrueClient warnings during Vite HMR)
const getSupabaseInstance = () => {
  if (!isSupabaseConfigured) return null;
  if (!globalThis._supabaseInstance) {
    globalThis._supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  return globalThis._supabaseInstance;
};

export const supabase = getSupabaseInstance();

// ================================================================
// DATA SERVICE CONTROLLER (CRUD OPERATIONS & DB SYNC)
// ================================================================
export const SupabaseService = {
  // Properties
  async getProperties() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('properties').select('*');
      if (error || !data) return null;
      return data.map((p) => ({
        ...p,
        id: p.id,
        name: p.name,
        address: p.address,
        propertyType: p.property_type || p.propertyType || 'apartment',
        rentalType: p.rental_type || p.rentalType || 'both',
        areaSqm: Number(p.area_sqm || p.areaSqm || 0),
        bedrooms: p.bedrooms || 1,
        bathrooms: p.bathrooms || 1,
        referencePrice: Number(p.reference_price || p.referencePrice || 0),
        status: p.status || 'vacant',
        description: p.description || '',
        photos: p.photos || [],
        icon: p.icon || 'building',
        amenities: p.amenities || [
          '🔑 Khóa cửa phòng riêng',
          '📶 Wifi tốc độ cao',
          '💼 Không gian làm việc riêng',
          '🅿️ Bãi đỗ xe miễn phí',
          '📺 TV màn hình lớn',
          '❄️ Điều hòa 2 chiều',
          '🏊 Hồ bơi',
          '🍳 Bếp ăn trang bị đầy đủ'
        ]
      }));
    } catch {
      return null;
    }
  },

  async createProperty(propertyData) {
    if (!isSupabaseConfigured) return null;
    try {
      const payload = {
        name: propertyData.name,
        address: propertyData.address,
        property_type: propertyData.property_type || propertyData.propertyType,
        rental_type: propertyData.rental_type || propertyData.rentalType,
        area_sqm: propertyData.area_sqm || propertyData.areaSqm,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        reference_price: propertyData.reference_price || propertyData.referencePrice,
        description: propertyData.description,
        status: propertyData.status || 'vacant',
        photos: propertyData.photos || []
      };
      const { data, error } = await supabase.from('properties').insert([payload]).select();
      if (error) {
        console.warn("Supabase create property notice:", error.message);
        return null;
      }
      return data?.[0] || null;
    } catch (err) {
      console.warn("Supabase create property exception:", err);
      return null;
    }
  },

  async updateProperty(propertyId, propertyData) {
    if (!isSupabaseConfigured || !propertyId) return null;
    try {
      const payload = {};
      if (propertyData.name !== undefined) payload.name = propertyData.name;
      if (propertyData.address !== undefined) payload.address = propertyData.address;
      if (propertyData.propertyType !== undefined) payload.property_type = propertyData.propertyType;
      if (propertyData.rentalType !== undefined) payload.rental_type = propertyData.rentalType;
      if (propertyData.areaSqm !== undefined) payload.area_sqm = propertyData.areaSqm;
      if (propertyData.bedrooms !== undefined) payload.bedrooms = propertyData.bedrooms;
      if (propertyData.bathrooms !== undefined) payload.bathrooms = propertyData.bathrooms;
      if (propertyData.referencePrice !== undefined) payload.reference_price = propertyData.referencePrice;
      if (propertyData.description !== undefined) payload.description = propertyData.description;
      if (propertyData.status !== undefined) payload.status = propertyData.status;

      const { data, error } = await supabase.from('properties').update(payload).eq('id', propertyId).select();
      if (error) {
        console.warn("Supabase update property notice:", error.message);
        return null;
      }
      return data?.[0] || null;
    } catch (err) {
      console.warn("Supabase update property exception:", err);
      return null;
    }
  },

  // Tenants
  async getTenants() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('tenants').select('*');
      if (error || !data) return null;
      return data.map((t) => {
        let cccdFront = t.id_card_front || t.idCardFront || '';
        let cccdBack = t.id_card_back || t.idCardBack || '';

        if (t.notes) {
          try {
            if (t.notes.startsWith('{')) {
              const parsed = JSON.parse(t.notes);
              if (parsed.idCardFront) cccdFront = parsed.idCardFront;
              if (parsed.idCardBack) cccdBack = parsed.idCardBack;
            }
          } catch {
            // ignore
          }
        }

        return {
          ...t,
          id: t.id,
          fullName: t.full_name || t.fullName,
          phone: t.phone,
          email: t.email,
          idNumber: t.id_number || t.idNumber,
          permanentAddress: t.permanent_address || t.permanentAddress,
          idCardFront: cccdFront,
          idCardBack: cccdBack,
          notes: t.notes
        };
      });
    } catch {
      return null;
    }
  },

  async createTenant(tenantData) {
    if (!isSupabaseConfigured) return null;
    try {
      let cleanIdNum = (tenantData.idNumber || tenantData.id_number || '').trim();
      if (!cleanIdNum || cleanIdNum === 'Chưa bổ sung') {
        cleanIdNum = null;
      }

      let notesValue = tenantData.notes || '';
      if (tenantData.idCardFront || tenantData.idCardBack) {
        notesValue = JSON.stringify({
          idCardFront: tenantData.idCardFront || '',
          idCardBack: tenantData.idCardBack || ''
        });
      }

      const payload = {
        full_name: tenantData.fullName || tenantData.full_name || 'Khách mới',
        phone: tenantData.phone || '',
        email: tenantData.email || '',
        permanent_address: tenantData.permanentAddress || tenantData.permanent_address || ''
      };
      if (cleanIdNum) {
        payload.id_number = cleanIdNum;
      }
      if (notesValue) {
        payload.notes = notesValue;
      }

      // Check if tenant with same phone or id_number already exists in DB to prevent 409 Conflict
      if (payload.phone) {
        const { data: existingPhone } = await supabase.from('tenants').select('*').eq('phone', payload.phone).limit(1);
        if (existingPhone && existingPhone.length > 0) {
          return existingPhone[0];
        }
      }
      if (payload.id_number) {
        const { data: existingId } = await supabase.from('tenants').select('*').eq('id_number', payload.id_number).limit(1);
        if (existingId && existingId.length > 0) {
          return existingId[0];
        }
      }

      const { data, error } = await supabase.from('tenants').insert([payload]).select().single();
      if (error) {
        console.warn("Supabase createTenant notice:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("Supabase createTenant exception:", err);
      return null;
    }
  },

  async updateTenant(tenantId, tenantData) {
    if (!isSupabaseConfigured || !tenantId) return null;
    try {
      const payload = {};
      if (tenantData.fullName || tenantData.full_name) payload.full_name = tenantData.fullName || tenantData.full_name;
      if (tenantData.phone) payload.phone = tenantData.phone;
      if (tenantData.email) payload.email = tenantData.email;
      if (tenantData.idNumber || tenantData.id_number) payload.id_number = tenantData.idNumber || tenantData.id_number;
      if (tenantData.permanentAddress || tenantData.permanent_address) payload.permanent_address = tenantData.permanentAddress || tenantData.permanent_address;

      if (tenantData.idCardFront || tenantData.idCardBack || tenantData.notes) {
        let existingNotes = tenantData.notes || '';
        try {
          let parsed = {};
          if (existingNotes && existingNotes.startsWith('{')) {
            parsed = JSON.parse(existingNotes);
          }
          if (tenantData.idCardFront) parsed.idCardFront = tenantData.idCardFront;
          if (tenantData.idCardBack) parsed.idCardBack = tenantData.idCardBack;
          payload.notes = JSON.stringify(parsed);
        } catch {
          payload.notes = JSON.stringify({ idCardFront: tenantData.idCardFront, idCardBack: tenantData.idCardBack });
        }
      }

      if (tenantId.length > 20) {
        const { data, error } = await supabase.from('tenants').update(payload).eq('id', tenantId).select().single();
        if (error) console.warn("Supabase updateTenant notice:", error.message);
        return data;
      }
      return null;
    } catch (err) {
      console.warn("Supabase updateTenant exception:", err);
      return null;
    }
  },

  // Contracts
  async getContracts() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('contracts').select('*, properties(id, name), tenants(id, full_name)');
      if (error || !data) return null;
      return data.map((c) => ({
        ...c,
        id: c.id,
        contractNumber: c.contract_number || c.contractNumber,
        propertyId: c.property_id || c.propertyId,
        tenantId: c.tenant_id || c.tenantId,
        propertyName: c.properties?.name || c.property_name || c.propertyName || 'Căn hộ',
        tenantName: c.tenants?.full_name || c.tenant_name || c.tenantName || 'Khách thuê',
        startDate: c.start_date || c.startDate,
        endDate: c.end_date || c.endDate,
        monthlyRent: Number(c.monthly_rent || c.monthlyRent || 0),
        depositAmount: Number(c.deposit_amount || c.deposit || c.depositAmount || 0),
        paymentDay: c.payment_day || c.paymentDay || 5,
        status: c.status || 'active',
        version: c.version || 1
      }));
    } catch {
      return null;
    }
  },

  async createContract(contractData) {
    if (!isSupabaseConfigured) return null;
    try {
      const payload = {
        contract_number: contractData.contractNumber,
        start_date: contractData.startDate,
        end_date: contractData.endDate,
        monthly_rent: Number(contractData.monthlyRent || 0),
        payment_day: Number(contractData.paymentDay || 5),
        status: contractData.status || 'active',
        version: contractData.version || 1
      };
      if (contractData.propertyId && contractData.propertyId.length > 20) {
        payload.property_id = contractData.propertyId;
      }
      if (contractData.tenantId && contractData.tenantId.length > 20) {
        payload.tenant_id = contractData.tenantId;
      }

      // Try inserting with deposit primary field, fallback to deposit_amount if needed
      const attemptPayload = {
        ...payload,
        deposit: Number(contractData.depositAmount || 0)
      };

      let { data, error } = await supabase.from('contracts').insert([attemptPayload]).select().single();
      if (error && error.message && (error.message.includes('deposit') || error.message.includes('column'))) {
        delete attemptPayload.deposit;
        attemptPayload.deposit_amount = Number(contractData.depositAmount || 0);
        const retry = await supabase.from('contracts').insert([attemptPayload]).select().single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.warn("Supabase createContract notice:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("Supabase createContract exception:", err);
      return null;
    }
  },

  async terminateContract(contractId) {
    if (!isSupabaseConfigured || !contractId) return false;
    try {
      if (contractId.length > 20) {
        await supabase.from('contracts').update({ status: 'terminated' }).eq('id', contractId);
      }
      return true;
    } catch {
      return false;
    }
  },

  async deleteContract(contractId) {
    if (!isSupabaseConfigured || !contractId) return false;
    try {
      if (contractId.length > 20) {
        await supabase.from('contracts').delete().eq('id', contractId);
      }
      return true;
    } catch {
      return false;
    }
  },

  async createPaymentScheduleBatch(schedules) {
    if (!isSupabaseConfigured || !schedules || schedules.length === 0) return null;
    try {
      const payloads = schedules.map(ps => ({
        contract_id: (ps.contractId && ps.contractId.length > 20) ? ps.contractId : null,
        period_month: ps.periodMonth,
        period_year: ps.periodYear,
        amount_due: Number(ps.amountDue || 0),
        due_date: ps.dueDate,
        status: ps.status || 'pending'
      }));
      const { data, error } = await supabase.from('payment_schedules').insert(payloads).select();
      if (error) {
        console.warn("Supabase createPaymentScheduleBatch notice:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("Supabase createPaymentScheduleBatch exception:", err);
      return null;
    }
  },

  // Payment Schedules
  async getPaymentSchedules() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('payment_schedules').select('*, contracts(id, property_id, tenant_id, properties(id, name), tenants(id, full_name))');
      if (error || !data) return null;
      return data.map((ps) => {
        const propName = ps.contracts?.properties?.name || ps.properties?.name || ps.propertyName || 'Căn hộ';
        const tenName = ps.contracts?.tenants?.full_name || ps.tenants?.full_name || ps.tenantName || 'Khách thuê';
        return {
          ...ps,
          id: ps.id,
          contractId: ps.contract_id || ps.contractId,
          propertyName: propName,
          tenantName: tenName,
          periodMonth: ps.period_month || ps.periodMonth,
          periodYear: ps.period_year || ps.periodYear,
          amountDue: Number(ps.amount_due || ps.amountDue || 0),
          dueDate: ps.due_date || ps.dueDate,
          status: ps.status || 'pending',
          paidDate: ps.paid_date || ps.paidDate,
          paidAmount: Number(ps.paid_amount || ps.paidAmount || 0),
          paymentMethod: ps.payment_method || ps.paymentMethod
        };
      });
    } catch {
      return null;
    }
  },

  async recordPayment(scheduleId, paymentData) {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('payment_schedules')
        .update({
          status: 'paid',
          paid_date: paymentData.paidDate,
          paid_amount: paymentData.paidAmount,
          payment_method: paymentData.paymentMethod
        })
        .eq('id', scheduleId)
        .select();
      if (error) return null;
      return data?.[0] || null;
    } catch {
      return null;
    }
  },

  // Bookings
  async getBookings() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('bookings').select('*, properties(id, name, address, photos, area_sqm, bedrooms, bathrooms)');
      if (error || !data) return null;
      return data.map((b) => ({
        ...b,
        id: b.id,
        bookingNumber: b.booking_number || b.bookingNumber,
        propertyId: b.property_id || b.propertyId,
        propertyName: b.properties?.name || b.property_name || b.propertyName || 'Căn hộ',
        propertyAddress: b.properties?.address || b.property_address || b.propertyAddress || '',
        propertyPhoto: b.properties?.photos?.[0] || b.propertyPhoto || '',
        areaSqm: b.properties?.area_sqm || b.areaSqm || 0,
        bedrooms: b.properties?.bedrooms || b.bedrooms || 1,
        bathrooms: b.properties?.bathrooms || b.bathrooms || 1,
        guestName: b.guest_name || b.guestName,
        guestPhone: b.guest_phone || b.guestPhone,
        checkInDate: b.check_in_date || b.checkInDate,
        checkOutDate: b.check_out_date || b.checkOutDate,
        nights: b.nights || 1,
        agreedPrice: Number(b.agreed_price || b.agreedPrice || 0),
        depositAmount: Number(b.deposit_amount || b.depositAmount || 0),
        status: b.status || 'pending',
        notes: b.notes || ''
      }));
    } catch {
      return null;
    }
  },

  async createBooking(bookingData) {
    if (!isSupabaseConfigured) return null;
    try {
      const payload = { ...bookingData };
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(payload.property_id || ''));
      if (!isUuid && payload.property_id) {
        const { data: props } = await supabase.from('properties').select('id').limit(1);
        if (props?.[0]?.id) {
          payload.property_id = props[0].id;
        } else {
          delete payload.property_id;
        }
      }

      // Ensure valid ISO date format for check_in_date and check_out_date
      const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ''));
      const inDate = isValidDate(payload.check_in_date) ? payload.check_in_date : new Date().toISOString().split('T')[0];
      payload.check_in_date = inDate;

      if (!isValidDate(payload.check_out_date)) {
        const d = new Date(inDate);
        d.setFullYear(d.getFullYear() + 1);
        payload.check_out_date = d.toISOString().split('T')[0];
      }

      const { data, error } = await supabase.from('bookings').insert([payload]).select();
      if (error) {
        console.warn("Supabase createBooking notice:", error.message);
        return null;
      }
      return data?.[0] || null;
    } catch (err) {
      console.warn("Supabase createBooking exception:", err);
      return null;
    }
  },

  async updateBookingStatus(id, status) {
    if (!isSupabaseConfigured || !id) return null;
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));

      // Map frontend 'accepted' to Postgres enum 'confirmed'
      const dbStatus = status === 'accepted' ? 'confirmed' : status;

      let query = supabase.from('bookings').update({ status: dbStatus });

      if (isUuid) {
        query = query.eq('id', id);
      } else {
        query = query.eq('booking_number', id);
      }

      const { data, error } = await query.select();
      if (error) {
        console.warn("Supabase updateBookingStatus notice:", error.message);
        return null;
      }
      return data?.[0] || null;
    } catch {
      return null;
    }
  },

  // Temporary Residence CT01 / CT07
  async getTempResidences() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('temp_residences').select('*');
      if (error || !data) return null;
      return data.map((tr) => ({
        ...tr,
        id: tr.id,
        bookingId: tr.booking_id || tr.bookingId,
        propertyName: tr.property_name || tr.propertyName,
        guestName: tr.guest_name || tr.guestName,
        idNumber: tr.id_number || tr.idNumber,
        permanentAddress: tr.permanent_address || tr.permanentAddress,
        formType: tr.form_type || tr.formType || 'CT01',
        status: tr.status || 'unsubmitted',
        submittedDate: tr.submitted_date || tr.submittedDate,
        policeStation: tr.police_station || tr.policeStation
      }));
    } catch {
      return null;
    }
  },

  async createTempResidence(formData) {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('temp_residences').insert([formData]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  // Notifications
  async getNotifications() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false });
      if (error || !data) return null;
      return data.map((n) => ({
        ...n,
        id: n.id,
        recipientName: n.recipient_ref || n.recipientName || 'Chủ nhà',
        channel: n.channel || 'in_app',
        type: n.notification_type || n.type || 'booking_request',
        subject: n.subject || n.title || 'Thông báo mới',
        content: n.content || n.message || '',
        status: n.status || 'sent',
        sentAt: n.sent_at || n.sentAt || new Date().toISOString()
      }));
    } catch {
      return null;
    }
  },

  async createNotification(notifData) {
    if (!isSupabaseConfigured) return null;
    try {
      const rawType = (notifData.type || notifData.notification_type || '').toLowerCase();
      // Remote Supabase Postgres ENUM values: 'payment_received', 'booking_confirmed'
      const mappedType = rawType.includes('booking') ? 'booking_confirmed' : 'payment_received';

      const payload = {
        recipient_ref: notifData.recipientName || notifData.recipient_ref || 'Chủ nhà',
        channel: notifData.channel || 'in_app',
        notification_type: mappedType,
        subject: notifData.subject || notifData.title || 'Thông báo mới',
        content: notifData.content || notifData.message || '',
        status: notifData.status || 'sent',
        sent_at: notifData.sentAt || notifData.sent_at || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([payload])
        .select()
        .maybeSingle();

      if (error) {
        console.warn("Supabase createNotification notice:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("Supabase createNotification exception:", err);
      return null;
    }
  },

  // Staff Account Users (RBAC)
  async getUsers() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error || !data) return null;
      return data.map((u) => ({
        ...u,
        id: u.id,
        fullName: u.full_name || u.fullName,
        phone: u.phone,
        email: u.email,
        role: u.role || 'guest',
        roleName: u.role === 'owner' ? 'Chủ nhà' : u.role === 'manager' ? 'Quản lý phòng' : u.role === 'sale' ? 'Nhân viên Sale' : u.role === 'admin' ? 'System Admin' : 'Khách',
        status: u.status || (u.is_active !== false ? 'active' : 'inactive'),
        createdAt: u.created_at?.split('T')[0] || u.createdAt
      }));
    } catch {
      return null;
    }
  },

  async createUser(userData) {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('users').insert([userData]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async updateUser(userId, userData) {
    if (!isSupabaseConfigured || !userId) return null;
    try {
      const { data, error } = await supabase.from('users').update(userData).eq('id', userId).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  }
};
