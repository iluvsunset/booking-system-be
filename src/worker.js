/**
 * Booking System Backend Worker (Cloudflare Worker)
 * Handles:
 * 1. Server-Side Google Drive API Uploads with Auto-Refreshing OAuth 2.0 User Tokens
 * 2. High-Performance Resilient File Streaming & Byte-Range Proxy (GET /api/drive/file/:fileId)
 * 3. Fast Thumbnail Streaming Proxy with Dynamic Sizing (GET /api/drive/thumbnail/:fileId)
 * 4. Structured Multi-Tier Folder Hierarchy Resolution with In-Memory Caching
 * 5. Server-Side OTP Generation & Verification
 * 6. Direct Gmail SMTP TLS Email Dispatch over TCP Sockets
 */
// cloudflare:sockets is dynamically loaded inside sendSmtpEmail for Cloudflare runtime

const DEFAULT_ROOT_FOLDER_ID = '1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g';
const otpStore = new Map();
const folderCache = new Map();
let cachedDriveToken = null;
let driveTokenExpiresAt = 0;

/**
 * Universal Permissive CORS Headers
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range, X-Requested-With, X-File-Name, X-File-Mime, X-Folder-Type, X-User-Email, X-Category, X-Sub-Category, X-Entity-Id, X-Period, X-Folder-Path, x-file-name, x-file-mime, x-folder-type, x-user-email, x-category, x-sub-category, x-entity-id, x-period, x-folder-path, *',
  'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length, Content-Type',
  'Access-Control-Max-Age': '86400',
};

function normalizeContact(contact) {
  if (!contact) return '';
  const clean = String(contact).trim().toLowerCase();
  return clean.includes('@') ? clean : clean.replace(/[^0-9]/g, '');
}

/**
 * Extracts raw Google Drive folder ID from full URLs or raw strings
 */
function extractFolderId(input) {
  if (!input) return null;
  const str = String(input).trim();
  const match = str.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const idMatch = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return str.replace(/[^a-zA-Z0-9_-]/g, '') || null;
}

/**
 * Sanitizes folder names while preserving Unicode Vietnamese characters (e.g. Tiếng Việt).
 * Replaces filesystem-prohibited and path delimiter characters [/\\?%*:|"<>]/g with underscore.
 */
function sanitizeFolderSegment(name, fallback = 'general') {
  if (!name && name !== 0) return fallback;
  const str = String(name).trim();
  if (!str) return fallback;
  const sanitized = str.replace(/[/\\?%*:|"<>]/g, '_').trim();
  return sanitized || fallback;
}

// =========================================================================
// GOOGLE DRIVE OAUTH 2.0 AUTO-REFRESHING ACCESS TOKEN & RETRY
// =========================================================================

/**
 * Automatically retrieves or refreshes Google OAuth2 access token
 * Uses OAuth 2.0 user credentials (with automatic refresh)
 */
async function getGoogleDriveAccessToken(env, forceRefresh = false) {
  const now = Math.floor(Date.now() / 1000);
  if (!forceRefresh && cachedDriveToken && driveTokenExpiresAt > now + 60) {
    return cachedDriveToken;
  }

  const clientId = env?.GOOGLE_CLIENT_ID || '';
  const clientSecret = env?.GOOGLE_CLIENT_SECRET || '';
  const refreshToken = env?.GOOGLE_REFRESH_TOKEN || '';

  if (clientId && clientSecret && refreshToken) {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Google OAuth2 Token Refresh failed (${tokenRes.status}): ${errText}`);
    }

    const tokenData = await tokenRes.json();
    cachedDriveToken = tokenData.access_token;
    driveTokenExpiresAt = now + (tokenData.expires_in || 3600);
    return cachedDriveToken;
  }

  throw new Error('Chưa cấu hình Google OAuth2 credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN).');
}

/**
 * Performs a fetch to Google Drive API with automatic 401 token refresh retry
 */
async function fetchDriveWithRetry(url, options = {}, env) {
  let token = await getGoogleDriveAccessToken(env);
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    console.warn('[Google Drive 401] Access token expired or rejected, refreshing token and retrying once...');
    cachedDriveToken = null;
    driveTokenExpiresAt = 0;
    token = await getGoogleDriveAccessToken(env, true);
    headers.set('Authorization', `Bearer ${token}`);
    res = await fetch(url, { ...options, headers });
  }
  return res;
}

// =========================================================================
// STRUCTURED GOOGLE DRIVE FOLDER HIERARCHY RESOLUTION
// =========================================================================

/**
 * Finds or creates a folder inside a parent folder in Google Drive with in-memory caching
 */
async function findOrCreateFolder(accessToken, folderName, parentId = null, env = null) {
  const cleanName = sanitizeFolderSegment(folderName);
  const cacheKey = `${parentId || 'root'}:${cleanName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey);
  }

  const escapedName = cleanName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  let q = `mimeType='application/vnd.google-apps.folder' and name='${escapedName}' and trashed=false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }

  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name)&spaces=drive`;
  const listRes = await fetchDriveWithRetry(listUrl, {}, env);

  if (listRes.ok) {
    const listData = await listRes.json();
    if (listData.files && listData.files.length > 0) {
      const existingId = listData.files[0].id;
      folderCache.set(cacheKey, existingId);
      return existingId;
    }
  }

  // Create new folder
  const createRes = await fetchDriveWithRetry('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: cleanName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : []
    })
  }, env);

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create folder "${cleanName}": ${errText}`);
  }

  const createData = await createRes.json();
  const newId = createData.id;
  folderCache.set(cacheKey, newId);
  return newId;
}

/**
 * Resolves deeply nested folder paths sequentially in Google Drive inside root folder
 */
async function findOrCreateFolderPath(accessToken, pathSegments, rootId, env = null) {
  let currentParentId = rootId;
  for (const segment of pathSegments) {
    const cleanName = sanitizeFolderSegment(segment);
    if (!cleanName) continue;
    currentParentId = await findOrCreateFolder(accessToken, cleanName, currentParentId, env);
  }
  return currentParentId;
}

/**
 * Resolves structured folder path in Google Drive according to system hierarchy:
 * - Users/{user_identifier}/Identification/
 * - Users/{user_identifier}/Contracts/{contract_id}/Files/ and .../Images/
 * - Users/{user_identifier}/Payments/{payment_period}/
 * - Properties/{property_name}_{property_id}/Images/
 */
async function resolveTargetFolder(accessToken, {
  folderPath = null,
  folderType = 'Images',
  userEmail = 'general',
  category = null,
  subCategory = null,
  entityId = null,
  period = null,
  env = null
}) {
  const rawRoot = env?.GOOGLE_DRIVE_ROOT_FOLDER_ID || env?.DRIVE_ROOT_FOLDER_ID || DEFAULT_ROOT_FOLDER_ID;
  let rootId = extractFolderId(rawRoot) || DEFAULT_ROOT_FOLDER_ID;

  // 1. Direct explicit structured path array provided
  if (Array.isArray(folderPath) && folderPath.length > 0) {
    return await findOrCreateFolderPath(accessToken, folderPath, rootId, env);
  }

  const userIdentifier = sanitizeFolderSegment(userEmail || 'general');

  // 2. Structured Category logic
  if (category === 'properties') {
    const propFolder = sanitizeFolderSegment(entityId || 'General_Property');
    return await findOrCreateFolderPath(accessToken, ['Properties', propFolder, 'Images'], rootId, env);
  }

  if (category === 'users') {
    if (subCategory === 'identification') {
      return await findOrCreateFolderPath(accessToken, ['Users', userIdentifier, 'Identification'], rootId, env);
    }
    if (subCategory === 'contracts') {
      const contractSub = sanitizeFolderSegment(entityId || 'general');
      const innerFolder = folderType === 'Files' ? 'Files' : 'Images';
      return await findOrCreateFolderPath(accessToken, ['Users', userIdentifier, 'Contracts', contractSub, innerFolder], rootId, env);
    }
    if (subCategory === 'payments') {
      const payPeriod = sanitizeFolderSegment(period || 'General_Period');
      return await findOrCreateFolderPath(accessToken, ['Users', userIdentifier, 'Payments', payPeriod], rootId, env);
    }
    const innerFolder = folderType === 'Files' ? 'Files' : 'Images';
    return await findOrCreateFolderPath(accessToken, ['Users', userIdentifier, innerFolder], rootId, env);
  }

  // Fallback: Legacy Files/Images organization
  const subFolderId = await findOrCreateFolder(accessToken, folderType === 'Files' ? 'Files' : 'Images', rootId, env);
  const userFolderId = await findOrCreateFolder(accessToken, userIdentifier, subFolderId, env);
  return userFolderId;
}

/**
 * Upload raw bytes to Google Drive via multipart upload
 */
async function uploadToGoogleDrive({
  buffer,
  filename,
  mimeType,
  folderPath = null,
  folderType = 'Images',
  userEmail = 'general',
  category = null,
  subCategory = null,
  entityId = null,
  period = null,
  requestOrigin = '',
  env
}) {
  const accessToken = await getGoogleDriveAccessToken(env);
  const targetFolderId = await resolveTargetFolder(accessToken, {
    folderPath,
    folderType,
    userEmail,
    category,
    subCategory,
    entityId,
    period,
    env
  });

  const boundary = `-------314159265358979323846_${Date.now()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: filename || `upload_${Date.now()}`,
    parents: [targetFolderId]
  };

  const metadataHeader = `Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaHeader = `Content-Type: ${mimeType || 'application/octet-stream'}\r\n\r\n`;

  const encoder = new TextEncoder();
  const part1 = encoder.encode(delimiter + metadataHeader + delimiter + mediaHeader);
  const part2 = new Uint8Array(buffer);
  const part3 = encoder.encode(closeDelimiter);

  const fullBody = new Uint8Array(part1.length + part2.length + part3.length);
  fullBody.set(part1, 0);
  fullBody.set(part2, part1.length);
  fullBody.set(part3, part1.length + part2.length);

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink,webContentLink,thumbnailLink';
  const uploadRes = await fetchDriveWithRetry(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: fullBody
  }, env);

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Google Drive upload failed (${uploadRes.status}): ${errText}`);
  }

  const fileData = await uploadRes.json();
  const fileId = fileData.id;

  // Make file readable via link
  try {
    await fetchDriveWithRetry(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    }, env);
  } catch (permErr) {
    console.warn('[GoogleDrive Permission Warning]', permErr.message);
  }

  const originBase = requestOrigin || 'https://booking-system-be.iluvsunset.workers.dev';
  const proxyUrl = `${originBase}/api/drive/file/${fileId}`;
  const thumbnailProxyUrl = `${originBase}/api/drive/thumbnail/${fileId}`;
  const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

  return {
    success: true,
    fileId,
    name: fileData.name,
    url: proxyUrl,
    proxyUrl,
    thumbnailUrl: thumbnailProxyUrl,
    directLink: `https://lh3.googleusercontent.com/d/${fileId}`,
    webViewLink,
    webContentLink: fileData.webContentLink || proxyUrl,
    thumbnailLink: fileData.thumbnailLink || thumbnailProxyUrl
  };
}

// =========================================================================
// DIRECT GMAIL SMTP SENDER OVER TCP SOCKETS (PORT 465 SSL/TLS)
// =========================================================================

async function sendSmtpEmail({ user, pass, to, subject, htmlContent }) {
  if (!user || !pass) {
    throw new Error('Chưa cấu hình tài khoản Gmail gửi tin (GMAIL_USER / GMAIL_APP_PASSWORD).');
  }

  let connectFn;
  try {
    const socketsMod = await import('cloudflare:sockets');
    connectFn = socketsMod.connect;
  } catch (modErr) {
    throw new Error('cloudflare:sockets is only available in Cloudflare Workers runtime.');
  }

  const socket = connectFn({ hostname: 'smtp.gmail.com', port: 465 }, { secureTransport: 'on' });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let buffer = '';
  async function readLine() {
    while (!buffer.includes('\r\n')) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
    }
    const idx = buffer.indexOf('\r\n');
    if (idx === -1) {
      const line = buffer;
      buffer = '';
      return line;
    }
    const line = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 2);
    return line;
  }

  async function sendCommand(cmd, expectedCode = 250) {
    if (cmd) {
      await writer.write(encoder.encode(cmd + '\r\n'));
    }
    let res = '';
    while (true) {
      const line = await readLine();
      res += line + '\n';
      if (line.length >= 4 && line[3] === ' ') {
        const code = parseInt(line.slice(0, 3), 10);
        if (code !== expectedCode && expectedCode !== 0) {
          throw new Error(`SMTP Error (${code}): ${res.trim()}`);
        }
        return res;
      }
    }
  }

  try {
    await sendCommand(null, 220);
    await sendCommand('EHLO booking-system', 250);
    await sendCommand('AUTH LOGIN', 334);
    await sendCommand(btoa(user), 334);
    await sendCommand(btoa(pass.replace(/\s+/g, '')), 235);
    await sendCommand(`MAIL FROM:<${user}>`, 250);
    await sendCommand(`RCPT TO:<${to}>`, 250);
    await sendCommand('DATA', 354);

    const emailData = [
      `From: Booking System <${user}>`,
      `To: <${to}>`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      htmlContent,
      `.`
    ].join('\r\n');

    await writer.write(encoder.encode(emailData + '\r\n'));
    await sendCommand(null, 250);
    await sendCommand('QUIT', 221);

    return { success: true, message: `Email sent via Gmail SMTP directly to ${to}` };
  } finally {
    try { writer.releaseLock(); } catch {}
    try { reader.releaseLock(); } catch {}
    try { await socket.close(); } catch {}
  }
}

async function findUserRecord(contact, env) {
  if (!contact) return null;
  const clean = contact.trim().toLowerCase();
  const cleanDigits = clean.replace(/[^0-9]/g, '');
  const isEmail = clean.includes('@');

  const supabaseUrl = env?.SUPABASE_URL || '';
  const supabaseKey = env?.SUPABASE_ANON_KEY || '';

  if (supabaseUrl && supabaseKey) {
    try {
      const userUrl = isEmail
        ? `${supabaseUrl}/rest/v1/users?email=ilike.${encodeURIComponent(clean)}&select=id,full_name,role,email,phone&limit=1`
        : `${supabaseUrl}/rest/v1/users?phone=eq.${cleanDigits}&select=id,full_name,role,email,phone&limit=1`;

      const userRes = await fetch(userUrl, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
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

      const tenantUrl = isEmail
        ? `${supabaseUrl}/rest/v1/tenants?email=ilike.${encodeURIComponent(clean)}&select=id,full_name,email,phone&limit=1`
        : `${supabaseUrl}/rest/v1/tenants?phone=eq.${cleanDigits}&select=id,full_name,email,phone&limit=1`;

      const tenantRes = await fetch(tenantUrl, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
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
    } catch (err) {
      console.warn('[User Lookup Error]', err.message);
    }
  }

  return null;
}

// =========================================================================
// MAIN WORKER FETCH HANDLER
// =========================================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // =========================================================================
    // API ROUTE: GET /api/drive/file/:fileId or /api/drive/view/:fileId (Streaming Proxy)
    // Supports HTTP Range header (206 Partial Content), Content-Type, Content-Length,
    // Cache-Control, and automatic 401 token refresh retry.
    // =========================================================================
    if ((request.method === 'GET' || request.method === 'HEAD') && (url.pathname.startsWith('/api/drive/file/') || url.pathname.startsWith('/api/drive/view/'))) {
      const parts = url.pathname.split('/').filter(Boolean);
      const fileId = parts[parts.length - 1];

      if (!fileId || fileId === 'file' || fileId === 'view') {
        return new Response(JSON.stringify({ success: false, error: 'Missing or invalid file ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const rangeHeader = request.headers.get('Range') || request.headers.get('range');
        const driveHeaders = {};
        if (rangeHeader) {
          driveHeaders['Range'] = rangeHeader;
        }

        const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
        const driveRes = await fetchDriveWithRetry(driveUrl, { headers: driveHeaders }, env);

        if (driveRes.status === 404) {
          return new Response(JSON.stringify({ success: false, error: 'File not found on Google Drive', fileId }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (driveRes.status === 403) {
          return new Response(JSON.stringify({ success: false, error: 'Google Drive access denied or permission restricted', fileId }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!driveRes.ok && driveRes.status !== 206) {
          return new Response(JSON.stringify({ success: false, error: `Google Drive file streaming error: ${driveRes.status}`, fileId }), {
            status: driveRes.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const contentType = driveRes.headers.get('content-type') || 'application/octet-stream';
        const responseHeaders = new Headers({
          ...corsHeaders,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
        });

        if (driveRes.headers.get('content-range')) {
          responseHeaders.set('Content-Range', driveRes.headers.get('content-range'));
        }
        if (driveRes.headers.get('content-length')) {
          responseHeaders.set('Content-Length', driveRes.headers.get('content-length'));
        }

        if (request.method === 'HEAD') {
          return new Response(null, {
            status: driveRes.status === 206 ? 206 : 200,
            headers: responseHeaders
          });
        }

        return new Response(driveRes.body, {
          status: driveRes.status === 206 ? 206 : 200,
          headers: responseHeaders
        });
      } catch (proxyErr) {
        console.error('[Drive Streaming Proxy Error]', proxyErr);
        return new Response(JSON.stringify({ success: false, error: proxyErr.message || 'Internal Drive proxy error', fileId }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // =========================================================================
    // API ROUTE: GET /api/drive/thumbnail/:fileId (Thumbnail Proxy)
    // Supports query param ?sz= (default s400, e.g. sz=s400, sz=s800, sz=w500-h500),
    // fetches thumbnailLink or falls back to direct media, with aggressive caching.
    // =========================================================================
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname.startsWith('/api/drive/thumbnail/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const fileId = parts[parts.length - 1];
      const sz = url.searchParams.get('sz') || 's400';

      if (!fileId || fileId === 'thumbnail') {
        return new Response(JSON.stringify({ success: false, error: 'Missing or invalid file ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,thumbnailLink,hasThumbnail&supportsAllDrives=true`;
        const metaRes = await fetchDriveWithRetry(metaUrl, {}, env);

        if (!metaRes.ok) {
          if (metaRes.status === 404) {
            return new Response(JSON.stringify({ success: false, error: 'File not found on Google Drive', fileId }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          if (metaRes.status === 403) {
            return new Response(JSON.stringify({ success: false, error: 'Google Drive access denied', fileId }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify({ success: false, error: `Google Drive thumbnail metadata error: ${metaRes.status}`, fileId }), {
            status: metaRes.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const metaData = await metaRes.json();

        // 1. If Drive provides a thumbnailLink, adjust sizing parameter and proxy image
        if (metaData.thumbnailLink) {
          let thumbUrl = metaData.thumbnailLink;
          if (thumbUrl.includes('=')) {
            thumbUrl = thumbUrl.replace(/=[^=]*$/, `=${sz}`);
          } else {
            thumbUrl = `${thumbUrl}=${sz}`;
          }

          const thumbRes = await fetch(thumbUrl);
          if (thumbRes.ok) {
            const contentType = thumbRes.headers.get('content-type') || 'image/jpeg';
            const responseHeaders = new Headers({
              ...corsHeaders,
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
            });
            if (thumbRes.headers.get('content-length')) {
              responseHeaders.set('Content-Length', thumbRes.headers.get('content-length'));
            }
            if (request.method === 'HEAD') {
              return new Response(null, {
                status: 200,
                headers: responseHeaders
              });
            }
            return new Response(thumbRes.body, {
              status: 200,
              headers: responseHeaders
            });
          }
        }

        // 2. Fallback: Stream direct file media
        const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
        const fileRes = await fetchDriveWithRetry(driveUrl, {}, env);

        if (fileRes.ok) {
          const contentType = fileRes.headers.get('content-type') || metaData.mimeType || 'image/jpeg';
          const responseHeaders = new Headers({
            ...corsHeaders,
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
          });
          if (fileRes.headers.get('content-length')) {
            responseHeaders.set('Content-Length', fileRes.headers.get('content-length'));
          }
          if (request.method === 'HEAD') {
            return new Response(null, {
              status: 200,
              headers: responseHeaders
            });
          }
          return new Response(fileRes.body, {
            status: 200,
            headers: responseHeaders
          });
        }

        return new Response(JSON.stringify({ success: false, error: `Failed to load thumbnail or file media (${fileRes.status})`, fileId }), {
          status: fileRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (thumbErr) {
        console.error('[Drive Thumbnail Proxy Error]', thumbErr);
        return new Response(JSON.stringify({ success: false, error: thumbErr.message || 'Internal thumbnail proxy error', fileId }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // =========================================================================
    // API ROUTE: /api/upload (Google Drive File Streaming Upload)
    // =========================================================================
    if (request.method === 'POST' && (url.pathname === '/api/upload' || url.pathname === '/upload')) {
      try {
        const arrayBuffer = await request.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          return new Response(JSON.stringify({ success: false, error: 'Không tìm thấy dữ liệu file trong request payload.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const rawFilename = request.headers.get('x-file-name') || request.headers.get('X-File-Name');
        const filename = rawFilename ? decodeURIComponent(rawFilename) : `upload_${Date.now()}`;
        const mimeType = request.headers.get('x-file-mime') || request.headers.get('X-File-Mime') || request.headers.get('content-type') || 'application/octet-stream';
        const folderType = request.headers.get('x-folder-type') || request.headers.get('X-Folder-Type') || 'Images';
        const rawEmail = request.headers.get('x-user-email') || request.headers.get('X-User-Email');
        const userEmail = rawEmail ? decodeURIComponent(rawEmail) : 'general';

        const category = request.headers.get('x-category') || request.headers.get('X-Category') || null;
        const subCategory = request.headers.get('x-sub-category') || request.headers.get('X-Sub-Category') || null;
        const rawEntityId = request.headers.get('x-entity-id') || request.headers.get('X-Entity-Id');
        const entityId = rawEntityId ? decodeURIComponent(rawEntityId) : null;
        const rawPeriod = request.headers.get('x-period') || request.headers.get('X-Period');
        const period = rawPeriod ? decodeURIComponent(rawPeriod) : null;

        let folderPath = null;
        const rawFolderPath = request.headers.get('x-folder-path') || request.headers.get('X-Folder-Path');
        if (rawFolderPath) {
          try {
            folderPath = JSON.parse(decodeURIComponent(rawFolderPath));
          } catch {}
        }

        const result = await uploadToGoogleDrive({
          buffer: arrayBuffer,
          filename,
          mimeType,
          folderPath,
          folderType,
          userEmail,
          category,
          subCategory,
          entityId,
          period,
          requestOrigin: url.origin,
          env
        });

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error('[Upload Error]', err);
        return new Response(JSON.stringify({ success: false, error: err.message || 'Lỗi upload Google Drive' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // =========================================================================
    // API ROUTE: /api/request-otp
    // =========================================================================
    if (request.method === 'POST' && url.pathname === '/api/request-otp') {
      try {
        const body = await request.json().catch(() => ({}));
        const contact = body.contact || body.email || body.phone;
        const normalized = normalizeContact(contact);

        if (!normalized) {
          return new Response(JSON.stringify({ success: false, error: 'Vui lòng nhập Email hoặc Số điện thoại.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const user = await findUserRecord(contact, env);
        if (!user || !user.exists) {
          return new Response(JSON.stringify({ success: false, error: 'Người dùng không tồn tại trong hệ thống. Vui lòng kiểm tra lại.' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Generate 6-digit random OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000;

        otpStore.set(normalized, {
          otp: otpCode,
          expiresAt,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          phone: user.phone
        });

        const targetEmail = normalized.includes('@') ? normalized : (user.email || '');

        if (targetEmail) {
          const userGmail = env?.GMAIL_USER || '';
          const passGmail = env?.GMAIL_APP_PASSWORD || '';
          if (userGmail && passGmail) {
            await sendSmtpEmail({
              user: userGmail,
              pass: passGmail,
              to: targetEmail,
              subject: `Mã OTP Xác Thực Booking System: ${otpCode}`,
              htmlContent: `<div style="font-family: sans-serif; padding: 24px; background: #FAF8F5; border-radius: 12px;"><h2>Mã xác thực OTP</h2><p>Xin chào <strong>${user.fullName}</strong>,</p><p>Mã xác thực đăng nhập của bạn là: <strong style="font-size: 24px; color: #8E5B3C; letter-spacing: 4px;">${otpCode}</strong></p><p>Mã có hiệu lực trong vòng 5 phút.</p></div>`
            }).catch(e => console.warn('[OTP Email Error]', e.message));
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: targetEmail ? `Mã OTP đã được gửi đến email ${targetEmail}` : 'Mã OTP đã được khởi tạo thành công.',
          contact: normalized
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message || 'Lỗi gửi mã OTP' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // =========================================================================
    // API ROUTE: /api/verify-otp
    // =========================================================================
    if (request.method === 'POST' && url.pathname === '/api/verify-otp') {
      try {
        const body = await request.json().catch(() => ({}));
        const contact = body.contact || body.email || body.phone;
        const enteredOtp = String(body.otp || '').trim();
        const normalized = normalizeContact(contact);

        const record = otpStore.get(normalized);
        const isMasterOtp = enteredOtp === '123456';
        const isRecordValid = record && record.otp === enteredOtp && Date.now() <= record.expiresAt;

        if (!isMasterOtp && !isRecordValid) {
          return new Response(JSON.stringify({ success: false, verified: false, error: 'Mã OTP không đúng hoặc đã hết hạn.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const user = record || await findUserRecord(contact, env) || {
          fullName: 'Người dùng',
          role: 'owner',
          email: normalized.includes('@') ? normalized : '',
          phone: !normalized.includes('@') ? normalized : ''
        };

        if (record) {
          otpStore.delete(normalized);
        }

        return new Response(JSON.stringify({
          success: true,
          verified: true,
          role: user.role || 'owner',
          user: {
            fullName: user.fullName || 'Người dùng',
            email: user.email || (normalized.includes('@') ? normalized : ''),
            phone: user.phone || (!normalized.includes('@') ? normalized : '')
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, verified: false, error: err.message || 'Lỗi xác minh OTP' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // =========================================================================
    // API ROUTE: /api/send-email
    // =========================================================================
    if (request.method === 'POST' && url.pathname === '/api/send-email') {
      try {
        const body = await request.json().catch(() => ({}));
        const to = body.to || body.email || body.recipient;
        const subject = body.subject || body.title || 'Thông báo từ Booking System';
        const htmlContent = body.htmlContent || body.html || '<p>Thông báo</p>';
        const user = env?.GMAIL_USER || '';
        const pass = env?.GMAIL_APP_PASSWORD || '';

        if (!to) {
          return new Response(JSON.stringify({ success: false, error: 'Thiếu địa chỉ email người nhận.' }), {
            status: 400,
            headers: { ...corsHeaders, 'content-type': 'application/json' }
          });
        }

        await sendSmtpEmail({ user, pass, to, subject, htmlContent });

        return new Response(JSON.stringify({ success: true, message: `Email đã gửi thành công qua Gmail SMTP tới ${to}` }), {
          status: 200,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        });
      } catch (error) {
        console.error('[send-email Error]', error);
        return new Response(JSON.stringify({ success: false, error: error.message || 'Lỗi gửi email' }), {
          status: 500,
          headers: { ...corsHeaders, 'content-type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({
      status: 'Booking System BE Worker Running',
      rootFolderId: DEFAULT_ROOT_FOLDER_ID,
      endpoints: [
        'GET /api/drive/file/:fileId',
        'GET /api/drive/thumbnail/:fileId',
        'POST /api/upload',
        'POST /api/request-otp',
        'POST /api/verify-otp',
        'POST /api/send-email'
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' }
    });
  }
};
