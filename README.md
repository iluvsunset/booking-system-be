# Booking System - Backend Architecture & Services

This directory contains the entire backend implementation, database schema definitions, and API service integration.

## Directory Structure

```
backend/
├── database/
│   └── schema.sql         # Supabase PostgreSQL Database DDL Schema & Initial Seed Data
├── services/
│   └── supabaseClient.js  # Supabase client connector & Backend CRUD Data Services
└── README.md
```

## Database Tables (`backend/database/schema.sql`)

- **`properties`**: Real estate property listings (supports `photos text[]` array format, pricing, area specs, and status).
- **`tenants`**: Tenant profiles and contact info.
- **`contracts`**: Rental lease agreements and version tracking.
- **`payment_schedules`**: Monthly rent payment schedules, status tracking, and receipt logs.
- **`bookings`**: Short-term and long-term rental reservations.
- **`temp_residences`**: Government CT01 & CT07 temporary residence declarations for local police registration.
- **`notifications`**: System notifications and tenant request alerts.
- **`users`**: Staff user accounts with Role-Based Access Control (`owner`, `manager`, `sale`, `tenant`, `guest`, `admin`).

## Setup Instructions

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Copy the contents of [`backend/database/schema.sql`](file:///Users/iluvsunset/Booking%20System/backend/database/schema.sql).
3. Click **Run** to execute the script and populate the database tables and seed data.
