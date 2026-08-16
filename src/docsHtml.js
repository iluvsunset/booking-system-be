/**
 * Interactive Professional API Documentation for Booking System Backend
 */
export const API_DOCS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking System API — Developer Documentation & Reference</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0F1115;
      --sidebar-bg: #15181E;
      --card-bg: #1A1D24;
      --card-border: #262B35;
      --accent: #C5A880;
      --accent-hover: #D8BFA0;
      --accent-glow: rgba(197, 168, 128, 0.15);
      --text: #F3F4F6;
      --text-muted: #9CA3AF;
      --text-dim: #6B7280;
      --code-bg: #0B0D11;
      --method-get: #10B981;
      --method-post: #3B82F6;
      --method-delete: #EF4444;
      --method-put: #F59E0B;
      --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-sans);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar Navigation */
    .sidebar {
      width: 320px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--card-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .brand-header {
      padding: 24px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #C5A880, #8E5B3C);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #0F1115;
      font-size: 18px;
      box-shadow: 0 4px 12px var(--accent-glow);
    }

    .brand-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #FFF;
    }

    .brand-badge {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: rgba(197, 168, 128, 0.18);
      color: var(--accent);
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
      margin-left: auto;
    }

    .search-box {
      padding: 16px 20px;
      border-bottom: 1px solid var(--card-border);
    }

    .search-input {
      width: 100%;
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px 14px;
      color: var(--text);
      font-family: var(--font-sans);
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .nav-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 12px;
      list-style: none;
    }

    .nav-group-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-dim);
      letter-spacing: 0.08em;
      padding: 16px 12px 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.15s ease;
    }

    .nav-item:hover, .nav-item.active {
      background: var(--card-bg);
      color: #FFF;
    }

    .nav-item.active {
      border-left: 3px solid var(--accent);
      color: var(--accent);
    }

    .method-pill {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      min-width: 44px;
      text-align: center;
    }

    .method-pill.get { background: rgba(16, 185, 129, 0.15); color: var(--method-get); }
    .method-pill.post { background: rgba(59, 130, 246, 0.15); color: var(--method-post); }
    .method-pill.delete { background: rgba(239, 68, 68, 0.15); color: var(--method-delete); }

    /* Main Content Area */
    .main-content {
      flex: 1;
      overflow-y: auto;
      scroll-behavior: smooth;
      padding: 40px 60px 80px;
    }

    .top-status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--card-border);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--method-get);
      background: rgba(16, 185, 129, 0.1);
      padding: 6px 14px;
      border-radius: 999px;
      font-weight: 500;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--method-get);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--method-get);
    }

    .hero-section {
      margin-bottom: 48px;
    }

    .hero-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 12px;
      color: #FFF;
    }

    .hero-subtitle {
      font-size: 16px;
      color: var(--text-muted);
      max-width: 780px;
      line-height: 1.6;
    }

    .base-url-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px 20px;
      margin-top: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .base-url-label {
      font-size: 11px;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .base-url-val {
      font-family: var(--font-mono);
      font-size: 14px;
      color: #FFF;
      word-break: break-all;
    }

    .copy-btn {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: var(--font-sans);
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .copy-btn:hover {
      background: var(--card-border);
      color: #FFF;
    }

    /* Endpoint Card */
    .endpoint-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 40px;
      scroll-margin-top: 40px;
      transition: border-color 0.2s ease;
    }

    .endpoint-card:hover {
      border-color: rgba(197, 168, 128, 0.4);
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }

    .endpoint-badge {
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .endpoint-badge.get { background: rgba(16, 185, 129, 0.15); color: var(--method-get); }
    .endpoint-badge.post { background: rgba(59, 130, 246, 0.15); color: var(--method-post); }
    .endpoint-badge.delete { background: rgba(239, 68, 68, 0.15); color: var(--method-delete); }

    .endpoint-path {
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: 600;
      color: #FFF;
    }

    .endpoint-desc {
      font-size: 14.5px;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    /* Section Subheadings */
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent);
      margin: 24px 0 12px;
    }

    /* Parameter Table */
    .params-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13.5px;
    }

    .params-table th {
      text-align: left;
      padding: 10px 14px;
      background: var(--code-bg);
      color: var(--text-dim);
      font-weight: 600;
      border-bottom: 1px solid var(--card-border);
      font-size: 12px;
      text-transform: uppercase;
    }

    .params-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--card-border);
      color: var(--text-muted);
    }

    .param-name {
      font-family: var(--font-mono);
      color: #FFF;
      font-weight: 600;
    }

    .param-type {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--accent);
    }

    .param-required {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      background: rgba(239, 68, 68, 0.15);
      color: var(--method-delete);
      margin-left: 6px;
    }

    .param-optional {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      background: rgba(156, 163, 175, 0.15);
      color: var(--text-dim);
      margin-left: 6px;
    }

    /* Code Blocks */
    .code-container {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--card-border);
      font-size: 12px;
      color: var(--text-dim);
      font-weight: 600;
    }

    pre {
      padding: 16px;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 13px;
      color: #E5E7EB;
      line-height: 1.5;
    }

    /* Live Tester Section */
    .tester-card {
      background: rgba(197, 168, 128, 0.04);
      border: 1px dashed var(--accent);
      border-radius: 12px;
      padding: 20px;
      margin-top: 24px;
    }

    .tester-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .tester-title {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--accent);
    }

    .send-req-btn {
      background: var(--accent);
      color: #0F1115;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .send-req-btn:hover {
      background: var(--accent-hover);
    }

    .tester-result {
      margin-top: 14px;
      padding: 12px;
      background: var(--code-bg);
      border-radius: 8px;
      border: 1px solid var(--card-border);
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: #A7F3D0;
      max-height: 200px;
      overflow-y: auto;
      display: none;
    }
  </style>
</head>
<body>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="brand-header">
      <div class="brand-logo">B</div>
      <div>
        <div class="brand-title">Booking System BE</div>
      </div>
      <div class="brand-badge">v2.4</div>
    </div>

    <div class="search-box">
      <input type="text" class="search-input" placeholder="Search endpoints... (Ctrl+K)" id="searchBar">
    </div>

    <ul class="nav-list">
      <div class="nav-group-title">Overview</div>
      <li><a href="#overview" class="nav-item active">Architecture & Overview</a></li>
      <li><a href="#auth-flow" class="nav-item">Stateless Auth & HMAC</a></li>

      <div class="nav-group-title">Google Drive Endpoints</div>
      <li><a href="#endpoint-stream" class="nav-item"><span class="method-pill get">GET</span> /file/:fileId</a></li>
      <li><a href="#endpoint-thumb" class="nav-item"><span class="method-pill get">GET</span> /thumbnail/:fileId</a></li>
      <li><a href="#endpoint-upload" class="nav-item"><span class="method-pill post">POST</span> /api/upload</a></li>
      <li><a href="#endpoint-delete-batch" class="nav-item"><span class="method-pill post">POST</span> /api/drive/delete</a></li>
      <li><a href="#endpoint-delete-single" class="nav-item"><span class="method-pill delete">DEL</span> /file/:fileId</a></li>

      <div class="nav-group-title">Authentication & OTP</div>
      <li><a href="#endpoint-req-otp" class="nav-item"><span class="method-pill post">POST</span> /api/request-otp</a></li>
      <li><a href="#endpoint-ver-otp" class="nav-item"><span class="method-pill post">POST</span> /api/verify-otp</a></li>

      <div class="nav-group-title">Email Dispatch</div>
      <li><a href="#endpoint-send-email" class="nav-item"><span class="method-pill post">POST</span> /api/send-email</a></li>
    </ul>
  </aside>

  <!-- Main Documentation -->
  <main class="main-content">
    <div class="top-status-bar">
      <div class="status-indicator">
        <span class="status-dot"></span> Cloudflare Edge API Operational
      </div>
      <div style="font-size: 13px; color: var(--text-dim); font-family: var(--font-mono);">
        Worker: booking-system-be
      </div>
    </div>

    <!-- Hero / Overview -->
    <section id="overview" class="hero-section">
      <h1 class="hero-title">API Reference & Documentation</h1>
      <p class="hero-subtitle">
        High-performance Cloudflare Workers backend for Booking System. Provides auto-refreshing Google Drive OAuth2 storage, low-latency streaming proxies with byte-range support, stateless HMAC-signed OTP authentication, and direct Gmail SMTP email dispatch.
      </p>

      <div class="base-url-card">
        <div>
          <div class="base-url-label">Production Base URL</div>
          <div class="base-url-val" id="prodBaseUrl">https://booking-system-be.iluvsunset.workers.dev</div>
        </div>
        <button class="copy-btn" onclick="copyText('https://booking-system-be.iluvsunset.workers.dev')">📋 Copy URL</button>
      </div>
    </section>

    <!-- SECTION: GET /api/drive/file/:fileId -->
    <div class="endpoint-card" id="endpoint-stream">
      <div class="endpoint-header">
        <span class="endpoint-badge get">GET / HEAD</span>
        <span class="endpoint-path">/api/drive/file/:fileId</span>
      </div>
      <p class="endpoint-desc">
        Streams full binary content for any file stored in Google Drive directly through the Cloudflare Worker with HTTP 206 Partial Content (Byte-Range) support for video and audio playback.
      </p>

      <div class="section-title">Path Parameters</div>
      <table class="params-table">
        <thead>
          <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="param-name">fileId</span><span class="param-required">Required</span></td>
            <td><span class="param-type">string</span></td>
            <td>Google Drive File ID or alphanumeric ID string</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">Example Request (cURL)</div>
      <div class="code-container">
        <div class="code-header">
          <span>cURL</span>
          <button class="copy-btn" onclick="copySnippet(this)">Copy</button>
        </div>
        <pre>curl -i "https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g"</pre>
      </div>

      <div class="section-title">Response (200 OK / 206 Partial Content)</div>
      <div class="code-container">
        <div class="code-header">
          <span>HTTP Headers</span>
        </div>
        <pre>HTTP/2 200 OK
Content-Type: image/jpeg
Content-Length: 1048576
Accept-Ranges: bytes
Cache-Control: public, max-age=604800, stale-while-revalidate=86400
Access-Control-Allow-Origin: *</pre>
      </div>
    </div>

    <!-- SECTION: GET /api/drive/thumbnail/:fileId -->
    <div class="endpoint-card" id="endpoint-thumb">
      <div class="endpoint-header">
        <span class="endpoint-badge get">GET</span>
        <span class="endpoint-path">/api/drive/thumbnail/:fileId</span>
      </div>
      <p class="endpoint-desc">
        Streams optimized image thumbnails directly from Google Drive cache. Significantly reduces bandwidth and accelerates card grid render times.
      </p>

      <div class="section-title">Query Parameters</div>
      <table class="params-table">
        <thead>
          <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="param-name">sz</span><span class="param-optional">Optional</span></td>
            <td><span class="param-type">string</span></td>
            <td>Size preset (e.g. <code>s400</code>, <code>s800</code>, <code>w1000</code>). Default: <code>s400</code></td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">Example URL</div>
      <div class="code-container">
        <pre>https://booking-system-be.iluvsunset.workers.dev/api/drive/thumbnail/1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g?sz=s400</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/upload -->
    <div class="endpoint-card" id="endpoint-upload">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/upload</span>
      </div>
      <p class="endpoint-desc">
        Uploads binary raw byte payloads directly to Google Drive and automatically organizes files into multi-tier folders (<code>Properties/{name}_{id}/Images</code> or <code>Users/{user}/Identification/</code>).
      </p>

      <div class="section-title">Required HTTP Headers</div>
      <table class="params-table">
        <thead>
          <tr><th>Header</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="param-name">Content-Type</span><span class="param-required">Required</span></td>
            <td><span class="param-type">string</span></td>
            <td>MIME Type of the file (e.g. <code>image/jpeg</code>, <code>application/pdf</code>)</td>
          </tr>
          <tr>
            <td><span class="param-name">X-File-Name</span><span class="param-required">Required</span></td>
            <td><span class="param-type">string</span></td>
            <td>URL-encoded target filename (e.g. <code>photo_01.jpg</code>)</td>
          </tr>
          <tr>
            <td><span class="param-name">X-Category</span><span class="param-optional">Optional</span></td>
            <td><span class="param-type">string</span></td>
            <td><code>properties</code> | <code>users</code></td>
          </tr>
          <tr>
            <td><span class="param-name">X-Entity-Id</span><span class="param-optional">Optional</span></td>
            <td><span class="param-type">string</span></td>
            <td>Identifier for property folder or user folder</td>
          </tr>
          <tr>
            <td><span class="param-name">X-Folder-Type</span><span class="param-optional">Optional</span></td>
            <td><span class="param-type">string</span></td>
            <td><code>Images</code> | <code>Files</code></td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "fileId": "1g9K8x_...",
  "fileName": "photo_01.jpg",
  "folderId": "1nXSUr...",
  "url": "https://lh3.googleusercontent.com/d/1g9K8x_...",
  "proxyUrl": "https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1g9K8x_...",
  "thumbnailUrl": "https://booking-system-be.iluvsunset.workers.dev/api/drive/thumbnail/1g9K8x_...",
  "webViewLink": "https://drive.google.com/file/d/1g9K8x_.../view?usp=drivesdk"
}</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/drive/delete -->
    <div class="endpoint-card" id="endpoint-delete-batch">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/drive/delete</span>
      </div>
      <p class="endpoint-desc">
        Batch deletes multiple files or an entire category entity folder (e.g. all images belonging to a deleted Property or Tenant) from Google Drive.
      </p>

      <div class="section-title">Request Body (JSON)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Payload</span></div>
        <pre>{
  "fileIds": ["1g9K8x_...", "1h8J7y_..."],
  "urls": ["https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1g9K8x_..."],
  "category": "properties",
  "entityId": "Villa_Sunrise_p1"
}</pre>
      </div>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "deletedCount": 2,
  "deletedIds": ["1g9K8x_...", "1h8J7y_..."]
}</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/request-otp -->
    <div class="endpoint-card" id="endpoint-req-otp">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/request-otp</span>
      </div>
      <p class="endpoint-desc">
        Generates a 6-digit random verification code, signs an edge-stateless cryptographic HMAC token (valid for 5 minutes), and dispatches the OTP via Gmail SMTP TLS.
      </p>

      <div class="section-title">Request Body (JSON)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Payload</span></div>
        <pre>{
  "contact": "bao.h0146824@gmail.com"
}</pre>
      </div>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "otpToken": "eyJjIjoiYmFvLmgwMTQ2ODI0QGdtYWlsLmNvbSIsImUiOjE3...",
  "message": "Mã OTP đã được gửi đến email bao.h0146824@gmail.com",
  "contact": "bao.h0146824@gmail.com"
}</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/verify-otp -->
    <div class="endpoint-card" id="endpoint-ver-otp">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/verify-otp</span>
      </div>
      <p class="endpoint-desc">
        Validates entered OTP against the signed <code>otpToken</code> using HMAC-SHA256. Completely stateless and works across any Cloudflare Edge data center worldwide.
      </p>

      <div class="section-title">Request Body (JSON)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Payload</span></div>
        <pre>{
  "contact": "bao.h0146824@gmail.com",
  "otp": "984273",
  "otpToken": "eyJjIjoiYmFvLmgwMTQ2ODI0QGdtYWlsLmNvbSIsImUiOjE3..."
}</pre>
      </div>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "verified": true,
  "role": "owner",
  "user": {
    "fullName": "Nguyễn Văn Bảo",
    "email": "bao.h0146824@gmail.com",
    "phone": "0912345678"
  }
}</pre>
      </div>
    </div>

    <!-- SECTION: POST /api/send-email -->
    <div class="endpoint-card" id="endpoint-send-email">
      <div class="endpoint-header">
        <span class="endpoint-badge post">POST</span>
        <span class="endpoint-path">/api/send-email</span>
      </div>
      <p class="endpoint-desc">
        Sends HTML emails directly via Gmail SMTP over TCP TLS sockets (port 465). Used for OTP codes, contract notices, and payment reminders.
      </p>

      <div class="section-title">Request Body (JSON)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Payload</span></div>
        <pre>{
  "to": "customer@example.com",
  "subject": "Thông báo hợp đồng thuê nhà #HD-001",
  "htmlContent": "&lt;h1&gt;Xin chào!&lt;/h1&gt;&lt;p&gt;Hợp đồng của bạn đã được cập nhật.&lt;/p&gt;"
}</pre>
      </div>

      <div class="section-title">Response (200 OK)</div>
      <div class="code-container">
        <div class="code-header"><span>JSON Response</span></div>
        <pre>{
  "success": true,
  "message": "Email đã gửi thành công qua Gmail SMTP tới customer@example.com"
}</pre>
      </div>
    </div>
  </main>

  <script>
    function copyText(text) {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard: ' + text);
    }

    function copySnippet(btn) {
      const code = btn.closest('.code-container').querySelector('pre').innerText;
      navigator.clipboard.writeText(code);
      btn.innerText = '✓ Copied!';
      setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
    }

    // Search filter
    document.getElementById('searchBar').addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.endpoint-card').forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
      });
    });
  </script>
</body>
</html>
`;
