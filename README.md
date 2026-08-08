# ⚡ Booking System — Supabase & PostgreSQL Backend Engine

> Official backend repository for the **Booking System** real estate and rental property management application. Built with **Supabase**, **PostgreSQL**, **Row Level Security (RLS)**, and **Multi-Role RBAC**.

[![GitHub Repository](https://img.shields.io/badge/GitHub-booking--system--be-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/iluvsunset/booking-system-be)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_15-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Production Links & Connected Repositories

* **🚀 Live Frontend App (Cloudflare):** [https://booking-system.iluvsunset.workers.dev](https://booking-system.iluvsunset.workers.dev)
* **💻 Frontend GitHub Repository:** [https://github.com/iluvsunset/booking-system-fe](https://github.com/iluvsunset/booking-system-fe)
* **🗄️ Backend GitHub Repository:** [https://github.com/iluvsunset/booking-system-be](https://github.com/iluvsunset/booking-system-be)

---

## ✨ Database Architecture & Specs (`04_Database-Design.md`)

The backend is built on **PostgreSQL 15** with strict relational integrity, UUID primary keys, and Row Level Security policies.

### 12 Master Relational Tables

| Table Name | Description | RLS Policy |
|---|---|---|
| **`users`** | Admin, Owner, Manager, Sale, Tenant, and Guest user accounts | Strict RBAC management |
| **`properties`** | Apartments, villas, rooms, and availability status | Public view for vacant, staff write |
| **`tenants`** | Long-term tenant profiles & CCCD identity records | Authenticated staff only |
| **`contracts`** | Lease agreements, terms, and version tracking | Authenticated staff only |
| **`payment_schedules`** | Monthly rental dues & due date tracking | Authenticated staff only |
| **`payments`** | Recorded payments & payment methods (*MoMo*, *Bank*, *Cash*) | Authenticated staff only |
| **`bookings`** | Short-term reservations & public rental requests | Public insert, staff manage |
| **`temp_residences`** | Police CT01 / CT07 residence declarations (*Công an Phường*) | Authenticated staff only |
| **`documents`** | AES-256 encrypted scans (CCCD ID cards & PDFs) | Authenticated staff with 15m Signed URLs |
| **`notifications`** | Multi-channel dispatch history (*Zalo ZNS*, *SMS*, *Email*, *In-App*) | Authenticated staff only |
| **`audit_logs`** | Security tracking logs for all key operations | Authenticated staff only |

---

## 🔒 Multi-Role Security & Row Level Security (RLS) Matrix

| Permission / Action | Admin | Owner | Manager | Sale | Tenant | Guest |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **View All Properties** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Add / Edit Properties** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Contracts** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create / Edit / Renew Contracts** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **View & Create Bookings** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Record Tenant Payments** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **View Financial Reports** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Users (Create/Delete Staff)** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Personal Room & Pay Dues** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Browse Vacant Properties & Inquiry** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 📁 Repository Directory Structure

```
booking-system-be/
├── supabase/
│   ├── migrations/
│   │   └── 20260808000000_initial_schema.sql  # Versioned Supabase migration script
│   └── schema.sql                             # Complete standalone PostgreSQL schema & seed script
├── .gitignore                                 # Git ignore configuration
└── README.md                                  # Backend documentation & setup guide
```

---

## 🛠️ Quick Supabase Database Deployment (3 Steps)

### Step 1: Create a Free Supabase Project
1. Go to [Supabase.com](https://supabase.com) and click **"New Project"**.
2. Name your project `booking-system-be` and choose your region.

### Step 2: Run PostgreSQL Schema SQL
1. Open the Supabase Dashboard → **SQL Editor**.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Click **"Run"** (`Cmd+Enter` / `Ctrl+Enter`).

### Step 3: Connect Frontend Application
In your frontend project (`booking-system-fe`), set the `.env` variables:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
