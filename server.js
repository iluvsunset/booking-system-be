import http from 'http';
import { exec } from 'child_process';
import crypto from 'crypto';
import {
  DEFAULT_ROOT_FOLDER_ID,
  uploadToDrive,
  getFileStream,
  getThumbnailStream,
  shareRootWithGoogleGroup
} from './services/googleDriveService.js';

const PORT = process.env.PORT || 3001;
const GMAIL_USER = process.env.VITE_GMAIL_USER || process.env.GMAIL_USER || '';
const GMAIL_APP_PASS = process.env.VITE_GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// In-Memory OTP Store: Map<contactKey, { otp, expiresAt, attempts, fullName, role, email, phone }>
const otpStore = new Map();

// Helper to clean and normalize contact keys
function normalizeContact(contact) {
  if (!contact) return '';
  const clean = contact.trim().toLowerCase();
  return clean.includes('@') ? clean : clean.replace(/[^0-9]/g, '');
}

// Secure Server-side user & name lookup (never leaked to client browser before auth)
async function findUserRecord(contact) {
  if (!contact) return null;
  const clean = contact.trim().toLowerCase();
  const cleanDigits = clean.replace(/[^0-9]/g, '');
  const isEmail = clean.includes('@');

  try {
    // 1. Check users table
    const userUrl = isEmail
      ? `${SUPABASE_URL}/rest/v1/users?email=ilike.${encodeURIComponent(clean)}&select=id,full_name,role,email,phone&limit=1`
      : `${SUPABASE_URL}/rest/v1/users?phone=eq.${cleanDigits}&select=id,full_name,role,email,phone&limit=1`;
    
    const userRes = await fetch(userUrl, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (userRes.ok) {
      const users = await userRes.json();
      if (users?.[0]) {
        return {
          exists: true,
          fullName: users[0].full_name || 'Người dùng',
          role: users[0].role || 'owner',
          email: users[0].email || clean,
          phone: users[0].phone || cleanDigits
        };
      }
    }

    // 2. Check tenants table
    const tenantUrl = isEmail
      ? `${SUPABASE_URL}/rest/v1/tenants?email=ilike.${encodeURIComponent(clean)}&select=id,full_name,email,phone&limit=1`
      : `${SUPABASE_URL}/rest/v1/tenants?phone=eq.${cleanDigits}&select=id,full_name,email,phone&limit=1`;

    const tenantRes = await fetch(tenantUrl, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (tenantRes.ok) {
      const tenants = await tenantRes.json();
      if (tenants?.[0]) {
        return {
          exists: true,
          fullName: tenants[0].full_name || 'Khách thuê',
          role: 'tenant',
          email: tenants[0].email || clean,
          phone: tenants[0].phone || cleanDigits
        };
      }
    }

    // 3. Check bookings table
    if (!isEmail) {
      const bookingUrl = `${SUPABASE_URL}/rest/v1/bookings?guest_phone=eq.${cleanDigits}&select=id,guest_name,status&limit=1`;
      const bookingRes = await fetch(bookingUrl, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      });
      if (bookingRes.ok) {
        const bookings = await bookingRes.json();
        if (bookings?.[0]) {
          return {
            exists: true,
            fullName: bookings[0].guest_name || 'Khách đặt phòng',
            role: 'guest',
            email: clean,
            phone: cleanDigits
          };
        }
      }
    }
  } catch (err) {
    console.warn('[Server Lookup Warning]', err.message);
  }

  // Whitelist fallback for standard system accounts
  const defaultContacts = ['0559015714', '0559015715', '0912345678', '0987654321', 'admin@bookingsystem.vn', 'sunsetmyfav@gmail.com', 'bao.h0146824@gmail.com'];
  if (defaultContacts.some(c => c.toLowerCase() === clean || c.replace(/[^0-9]/g, '') === cleanDigits)) {
    return {
      exists: true,
      fullName: isEmail ? (clean.split('@')[0].charAt(0).toUpperCase() + clean.split('@')[0].slice(1)) : 'Chủ nhà',
      role: 'owner',
      email: isEmail ? clean : 'sunsetmyfav@gmail.com',
      phone: cleanDigits
    };
  }

  return null;
}

// Generate Cute HTML OTP Email Template
function generateCuteOTPEmail(otp, recipientName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; }
    .card { max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; padding: 32px; box-shadow: 0 8px 24px rgba(124, 92, 56, 0.08); border: 1px solid #F0EAE1; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px dashed #E5DCCF; }
    .logo { font-size: 24px; font-weight: 800; color: #7C5C38; text-decoration: none; }
    .otp-box { background: #FDF9F3; border: 2px dashed #7C5C38; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #8B5A2B; margin: 0; }
    .footer { text-align: center; font-size: 12px; color: #8C8275; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">🏠 Booking System</div>
      <p style="color: #665C51; font-size: 14px; margin-top: 6px;">Mã xác thực tài khoản (OTP Verification)</p>
    </div>
    <div style="margin-top: 20px;">
      <p style="color: #332D27; font-size: 15px;">Xin chào <strong>${recipientName}</strong> 👋,</p>
      <p style="color: #665C51; font-size: 14px; line-height: 1.6;">Dưới đây là mã OTP xác thực của bạn. Mã này có hiệu lực trong vòng <strong>5 phút</strong>:</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
      </div>
      <p style="color: #A3483B; font-size: 13px;">🔒 Vui lòng không chia sẻ mã này cho bất kỳ ai để bảo vệ an toàn tài khoản!</p>
    </div>
    <div class="footer">
      <p>© 2026 Booking System — Cho thuê nhà & Căn hộ cao cấp 💖</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Helper to send email via curl Gmail SMTP
function dispatchEmail({ to, subject, html }) {
  return new Promise((resolve, reject) => {
    const payload = `Subject: ${subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}`;
    const cmd = `curl --ssl-reqd --url 'smtps://smtp.gmail.com:465' --user '${GMAIL_USER}:${GMAIL_APP_PASS}' --mail-from '${GMAIL_USER}' --mail-rcpt '${to}' -T -`;

    const child = exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('[Gmail SMTP Error]', error.message || stderr);
        reject(error);
      } else {
        console.log(`[Gmail SMTP Success] Email dispatched to ${to}`);
        resolve(true);
      }
    });

    if (child.stdin) {
      child.stdin.write(payload);
      child.stdin.end();
    }
  });
}

const server = http.createServer(async (req, res) => {
  // Universal Permissive CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, X-Requested-With, X-File-Name, X-File-Mime, X-Folder-Type, X-User-Email, X-Category, X-Sub-Category, X-Entity-Id, X-Period, X-Folder-Path, x-file-name, x-file-mime, x-folder-type, x-user-email, x-category, x-sub-category, x-entity-id, x-period, x-folder-path, *');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost:3001'}`);

  // =========================================================================
  // 1. GET /api/drive/file/:fileId or /api/drive/view/:fileId (File Streaming Proxy)
  // =========================================================================
  if (req.method === 'GET' && (url.pathname.startsWith('/api/drive/file/') || url.pathname.startsWith('/api/drive/view/'))) {
    const parts = url.pathname.split('/').filter(Boolean);
    const fileId = parts[parts.length - 1];

    if (!fileId || fileId === 'file' || fileId === 'view') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing or invalid file ID' }));
      return;
    }

    try {
      const range = req.headers['range'] || null;
      const fileData = await getFileStream(fileId, range);

      const headers = {
        'Content-Type': fileData.contentType || 'application/octet-stream',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
      };

      if (fileData.contentRange) {
        headers['Content-Range'] = fileData.contentRange;
      }
      if (fileData.contentLength) {
        headers['Content-Length'] = fileData.contentLength;
      }

      res.writeHead(fileData.status || (range ? 206 : 200), headers);
      fileData.stream.pipe(res);
    } catch (err) {
      console.error('[Drive File Streaming Error]', err.message);
      const status = err.code === 404 || err.status === 404 ? 404 : 500;
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message || 'Error streaming file from Google Drive', fileId }));
    }
    return;
  }

  // =========================================================================
  // 2. GET /api/drive/thumbnail/:fileId (Thumbnail Proxy)
  // =========================================================================
  if (req.method === 'GET' && url.pathname.startsWith('/api/drive/thumbnail/')) {
    const parts = url.pathname.split('/').filter(Boolean);
    const fileId = parts[parts.length - 1];
    const sz = url.searchParams.get('sz') || 's400';

    if (!fileId || fileId === 'thumbnail') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing or invalid file ID' }));
      return;
    }

    try {
      const thumbData = await getThumbnailStream(fileId, sz);
      const headers = {
        'Content-Type': thumbData.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
      };

      if (thumbData.contentLength) {
        headers['Content-Length'] = thumbData.contentLength;
      }

      res.writeHead(200, headers);
      thumbData.stream.pipe(res);
    } catch (err) {
      console.error('[Drive Thumbnail Proxy Error]', err.message);
      const status = err.code === 404 || err.status === 404 ? 404 : 500;
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message || 'Error loading thumbnail from Google Drive', fileId }));
    }
    return;
  }

  // =========================================================================
  // 3. MULTIPART FILE UPLOAD: /api/upload
  // =========================================================================
  if (req.method === 'POST' && (url.pathname === '/api/upload' || url.pathname === '/upload')) {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const rawBody = Buffer.concat(chunks);
        if (!rawBody || rawBody.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Không tìm thấy dữ liệu file trong request payload.' }));
          return;
        }

        // Parse metadata from headers
        const rawFilename = req.headers['x-file-name'];
        const filename = rawFilename ? decodeURIComponent(rawFilename) : `upload_${Date.now()}`;
        const mimeType = req.headers['x-file-mime'] || req.headers['content-type'] || 'application/octet-stream';
        const folderType = req.headers['x-folder-type'] || 'Images';
        const rawEmail = req.headers['x-user-email'];
        const userEmail = rawEmail ? decodeURIComponent(rawEmail) : 'general';

        const category = req.headers['x-category'] || null;
        const subCategory = req.headers['x-sub-category'] || null;
        const rawEntityId = req.headers['x-entity-id'];
        const entityId = rawEntityId ? decodeURIComponent(rawEntityId) : null;
        const rawPeriod = req.headers['x-period'];
        const period = rawPeriod ? decodeURIComponent(rawPeriod) : null;

        let folderPath = null;
        const rawFolderPath = req.headers['x-folder-path'];
        if (rawFolderPath) {
          try {
            folderPath = JSON.parse(decodeURIComponent(rawFolderPath));
          } catch {}
        }

        const result = await uploadToDrive({
          buffer: rawBody,
          filename,
          mimeType,
          folderPath,
          folderType,
          userEmail,
          category,
          subCategory,
          entityId,
          period,
          requestOrigin: `http://${req.headers.host || 'localhost:3001'}`
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('[Upload Error]', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      let parsed = {};
      try {
        if (body && body.trim()) {
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = Object.fromEntries(new URLSearchParams(body));
          }
        }
      } catch (e) {
        console.warn('[Body Parse Error]', e.message);
      }

      // =========================================================================
      // 4. ENDPOINT: /api/request-otp (Generates OTP on server & emails it)
      // =========================================================================
      if (url.pathname === '/api/request-otp') {
        const contact = parsed.contact || parsed.to || parsed.email || parsed.phone;
        const normalized = normalizeContact(contact);

        if (!normalized) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Thiếu thông tin Email hoặc Số điện thoại.' }));
          return;
        }

        const user = await findUserRecord(contact);
        if (!user || !user.exists) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Người dùng không tồn tại. Vui lòng kiểm tra lại.' }));
          return;
        }

        // Generate cryptographically secure 6-digit OTP on server
        const otpCode = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL

        // Save in server-side OTP Store
        otpStore.set(normalized, {
          otp: otpCode,
          expiresAt,
          attempts: 0,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          phone: user.phone
        });

        // Determine destination email
        const targetEmail = normalized.includes('@') ? normalized : (user.email || 'sunsetmyfav@gmail.com');
        const subject = '🔑 Mã xác thực OTP đăng nhập — Booking System';
        const html = generateCuteOTPEmail(otpCode, user.fullName);

        try {
          await dispatchEmail({ to: targetEmail, subject, html });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: `Mã OTP đã được gửi tới ${targetEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
            expiresInSeconds: 300
          }));
        } catch (mailErr) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Không thể gửi email OTP qua máy chủ Gmail SMTP.' }));
        }
        return;
      }

      // =========================================================================
      // 5. ENDPOINT: /api/verify-otp (Validates OTP strictly on server)
      // =========================================================================
      if (url.pathname === '/api/verify-otp') {
        const contact = parsed.contact || parsed.to || parsed.email || parsed.phone;
        const enteredOtp = (parsed.otp || parsed.otpCode || '').toString().trim();
        const normalized = normalizeContact(contact);

        if (!normalized || !enteredOtp) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Vui lòng cung cấp đầy đủ liên hệ và mã OTP.' }));
          return;
        }

        const record = otpStore.get(normalized);
        if (!record) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng lấy mã mới.' }));
          return;
        }

        // Check expiration
        if (Date.now() > record.expiresAt) {
          otpStore.delete(normalized);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Mã OTP đã hết hạn (quá 5 phút). Vui lòng lấy mã mới.' }));
          return;
        }

        // Check brute force attempts
        if (record.attempts >= 5) {
          otpStore.delete(normalized);
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Bạn đã nhập sai quá 5 lần. Mã OTP đã bị hủy vì lý do bảo mật.' }));
          return;
        }

        // Compare OTP
        if (record.otp !== enteredOtp) {
          record.attempts += 1;
          const remainingAttempts = 5 - record.attempts;
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: `Mã OTP không đúng. Bạn còn ${remainingAttempts} lần thử.`
          }));
          return;
        }

        // Verification successful — clear OTP from store immediately
        otpStore.delete(normalized);

        console.log(`[OTP Verified Success] Contact: ${normalized}, Name: ${record.fullName}, Role: ${record.role}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          verified: true,
          role: record.role || 'owner',
          user: {
            fullName: record.fullName,
            role: record.role || 'owner',
            email: record.email,
            phone: record.phone
          }
        }));
        return;
      }

      // =========================================================================
      // 6. ENDPOINT: /api/send-email (General Purpose Email Dispatch)
      // =========================================================================
      if (url.pathname === '/api/send-email' || url.pathname === '/send-email') {
        const recipient = parsed.to || parsed.email || parsed.recipient || 'bao.h0146824@gmail.com';
        const mailSubject = parsed.subject || 'Thông báo từ Booking System';
        const user = await findUserRecord(recipient);
        const resolvedName = user?.fullName || 'Quý khách';

        let html = parsed.htmlContent || parsed.html || parsed.content || `<p>Thông báo từ Booking System</p>`;
        html = html.replace(/Xin chào <strong>Người dùng<\/strong>/g, `Xin chào <strong>${resolvedName}</strong>`);
        html = html.replace(/Xin chào <strong>Khách hàng<\/strong>/g, `Xin chào <strong>${resolvedName}</strong>`);

        try {
          await dispatchEmail({ to: recipient, subject: mailSubject, html });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: `Email đã được gửi thành công tới ${recipient}` }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // =========================================================================
      // 7. ENDPOINT: /api/drive/setup (Share root folder with Google Group)
      // =========================================================================
      if (url.pathname === '/api/drive/setup') {
        const groupEmail = parsed.groupEmail;
        const role = parsed.role || 'writer';
        if (!groupEmail) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'groupEmail is required' }));
          return;
        }
        try {
          const result = await shareRootWithGoogleGroup(groupEmail, role);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'Booking System BE Server Running',
      port: PORT,
      rootFolderId: DEFAULT_ROOT_FOLDER_ID,
      endpoints: [
        'GET /api/drive/file/:fileId',
        'GET /api/drive/thumbnail/:fileId',
        'POST /api/upload',
        'POST /api/request-otp',
        'POST /api/verify-otp',
        'POST /api/send-email',
        'POST /api/drive/setup'
      ]
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Booking System BE running on http://localhost:${PORT}`);
});
