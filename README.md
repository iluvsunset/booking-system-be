# 🏨 Booking System — Backend & Cloudflare Worker API

Production-grade, high-performance Cloudflare Worker backend and microservices supporting the Booking & Property Management System.

---

## ⚡ Core Architecture

- **Runtime**: Cloudflare Worker (V8 Edge Compute) & Node.js Express fallback.
- **File Storage**: Google Drive API v3 with automatic OAuth 2.0 token auto-refresh and folder hierarchy resolution.
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) and Realtime subscriptions.
- **Email Delivery**: Gmail SMTP over TLS / REST Relay with HTML designer templates and dynamic CC routing.
- **Security & Privacy**: Restricted access control (`X-Is-Private: true`) for sensitive tenant identification documents (CCCD/Passport).

---

## 📁 Google Drive Multi-Tier Folder Architecture

All files uploaded through the backend are automatically routed and organized in Google Drive under a structured hierarchy:

```text
My Drive / Booking System Drive /
├── Tenants /
│   └── [Tenant Name] - [Phone] - [Email] /
│       ├── Identification /
│       │   └── cccd_front_*.jpg / cccd_back_*.jpg   (Restricted Access)
│       ├── Contracts /
│       │   └── [Contract_Number] /
│       │       └── HopDong_*.pdf
│       ├── Maintenance /
│       │   └── [Incident Category] - [DD-MM-YYYY] /
│       │       ├── incident_*.jpg
│       │       └── incident_*.png
│       └── Payments /
│           └── [Payment_Period] /
│               └── Images /
│                   └── receipt_*.jpg
└── Properties /
    └── [Property Name] /
        └── Images /
            └── photo_*.jpg
```

---

## 🚀 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` or `/docs` | Interactive GitBook / VietQR style API Documentation Portal |
| `POST` | `/api/upload` | Direct binary streaming upload to Google Drive with automatic multi-tier folder creation |
| `GET` | `/api/drive/file/:fileId` | Resilient byte-range file streaming proxy |
| `GET` | `/api/drive/thumbnail/:fileId` | Dynamic resizing thumbnail proxy (`sz=s120`, `sz=s400`, `sz=s800`) |
| `POST` | `/api/drive/delete` | Batch deletion of files and entire entity directories |
| `POST` | `/api/send-email` | Gmail SMTP email dispatch with HTML templates and CC support |
| `POST` | `/api/otp/send` | Server-side OTP code generation (SMS/Email) |
| `POST` | `/api/otp/verify` | HMAC-SHA256 cryptographically secure OTP validation |

---

## 🛠️ Upload Request Headers (`POST /api/upload`)

```http
POST /api/upload HTTP/1.1
Host: booking-system-be.iluvsunset.workers.dev
Content-Type: image/jpeg
X-File-Name: photo_01.jpg
X-Category: tenants
X-Sub-Category: maintenance
X-Entity-Id: Dieu_hoa_khong_mat_-_24-08-2026
X-Folder-Path: ["Tenants", "Lý Gia Bảo - 0559015719 - sunsetmyfav@gmail.com", "Maintenance", "Điều hòa không mát - 24-08-2026", "Images"]
```

### Response (200 OK)
```json
{
  "success": true,
  "fileId": "1g9K8x_XYZ9876",
  "fileName": "photo_01.jpg",
  "url": "https://lh3.googleusercontent.com/d/1g9K8x_XYZ9876",
  "proxyUrl": "https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1g9K8x_XYZ9876",
  "thumbnailUrl": "https://booking-system-be.iluvsunset.workers.dev/api/drive/thumbnail/1g9K8x_XYZ9876"
}
```

---

## 📦 Deployment

### Cloudflare Worker
```bash
npm run deploy
# or wrangler deploy
```

### Local Development
```bash
npm install
npm run dev
```
