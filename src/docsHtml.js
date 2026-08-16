/**
 * Humanized, Luxury Developer Portal & Interactive Database Studio
 * Built for Booking System (Cloudflare Workers + Supabase DB + Google Drive API)
 */
export const API_DOCS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking System — Backend & Database Guide</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0A0C10;
      --sidebar: #0F1218;
      --card: #141822;
      --card-hover: #191E2B;
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: #C5A880;
      
      --accent: #D4AF37;
      --accent-soft: rgba(212, 175, 55, 0.12);
      --accent-glow: rgba(212, 175, 55, 0.25);
      
      --text: #F1F5F9;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      
      --code-bg: #07090D;
      --code-border: rgba(255, 255, 255, 0.06);

      --success: #10B981;
      --info: #38BDF8;
      --danger: #F43F5E;
      --warning: #F59E0B;
      --purple: #A855F7;

      --font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      height: 100vh;
      display: flex;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Left Sidebar */
    .sidebar {
      width: 290px;
      background: var(--sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      user-select: none;
    }

    .brand-header {
      padding: 24px 20px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border);
    }

    .brand-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #FDE68A 0%, #D4AF37 50%, #92400E 100%);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #0A0C10;
      font-size: 17px;
      box-shadow: 0 4px 14px var(--accent-soft);
    }

    .brand-meta h1 {
      font-size: 14.5px;
      font-weight: 700;
      color: #FFF;
      letter-spacing: -0.01em;
    }

    .brand-meta p {
      font-size: 11px;
      color: var(--text-dim);
    }

    .search-box {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }

    .search-input {
      width: 100%;
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 7px;
      padding: 8px 12px;
      color: #FFF;
      font-family: var(--font);
      font-size: 12.5px;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: var(--accent);
    }

    .nav-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 14px 10px 30px;
    }

    .nav-scroll::-webkit-scrollbar { width: 4px; }
    .nav-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .nav-title {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-dim);
      letter-spacing: 0.08em;
      padding: 14px 10px 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 7px 10px;
      border-radius: 6px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 12.5px;
      font-weight: 500;
      transition: all 0.15s ease;
      margin-bottom: 2px;
    }

    .nav-item:hover {
      background: var(--card);
      color: #FFF;
    }

    .nav-item.active {
      background: var(--card);
      color: var(--accent);
      font-weight: 600;
    }

    .badge-pill {
      font-family: var(--font-mono);
      font-size: 8.5px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 3px;
      text-transform: uppercase;
    }

    .badge-pill.get { background: rgba(16, 185, 129, 0.15); color: var(--success); }
    .badge-pill.post { background: rgba(56, 189, 248, 0.15); color: var(--info); }
    .badge-pill.del { background: rgba(244, 63, 94, 0.15); color: var(--danger); }
    .badge-pill.db { background: rgba(168, 85, 247, 0.15); color: var(--purple); }

    /* Main Container */
    .main-stage {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      scroll-behavior: smooth;
      display: flex;
      flex-direction: column;
    }

    .main-stage::-webkit-scrollbar { width: 6px; }
    .main-stage::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }

    /* Top Nav */
    .top-header {
      position: sticky;
      top: 0;
      z-index: 30;
      background: rgba(10, 12, 16, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 12px 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .live-status {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 11.5px;
      color: var(--success);
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 4px 12px;
      border-radius: 999px;
      font-weight: 600;
    }

    .status-pulse {
      width: 6px;
      height: 6px;
      background: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--success);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-clean {
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      text-decoration: none;
    }

    .btn-clean:hover {
      background: var(--card-hover);
      color: #FFF;
    }

    .btn-clean.accent {
      background: var(--accent);
      color: #0A0C10;
      border: none;
    }

    .btn-clean.accent:hover {
      background: #E5C358;
    }

    /* Content Area */
    .content-canvas {
      padding: 36px 44px 100px;
      max-width: 1160px;
    }

    /* Friendly Hero Section */
    .welcome-card {
      background: radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.08) 0%, transparent 50%), var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px 36px;
      margin-bottom: 40px;
    }

    .welcome-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 8px;
    }

    .welcome-card h2 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #FFF;
      margin-bottom: 12px;
    }

    .welcome-card p {
      font-size: 14.5px;
      color: var(--text-muted);
      line-height: 1.65;
      max-width: 820px;
      margin-bottom: 24px;
    }

    .quick-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .chip {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chip-icon { font-size: 16px; }
    .chip-title { font-size: 11px; color: var(--text-dim); text-transform: uppercase; font-weight: 700; }
    .chip-value { font-size: 13px; font-weight: 600; color: #FFF; }

    /* Section Styling */
    .section-block {
      margin-bottom: 48px;
      scroll-margin-top: 80px;
    }

    .section-headline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
    }

    .section-headline h3 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #FFF;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-headline p {
      font-size: 13.5px;
      color: var(--text-dim);
      margin-top: 2px;
    }

    /* Visual Finder for Drive Folders */
    .drive-explorer {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 32px;
    }

    .explorer-bar {
      background: var(--sidebar);
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--text-dim);
    }

    .explorer-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }

    .explorer-breadcrumbs span.active {
      color: var(--accent);
      font-weight: 600;
    }

    .explorer-grid {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 14px;
    }

    .folder-tile {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: all 0.2s;
    }

    .folder-tile:hover {
      border-color: rgba(212, 175, 55, 0.4);
      background: #0B0E14;
    }

    .tile-icon {
      font-size: 24px;
      flex-shrink: 0;
      line-height: 1;
    }

    .tile-meta h4 {
      font-size: 13px;
      font-weight: 700;
      color: #FFF;
      margin-bottom: 2px;
      font-family: var(--font-mono);
    }

    .tile-meta p {
      font-size: 11.5px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .tile-meta .path-pill {
      font-size: 10px;
      color: var(--accent);
      background: var(--accent-soft);
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 6px;
      font-family: var(--font-mono);
    }

    /* ERD Visual Cards */
    .erd-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 18px;
    }

    .erd-item {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: border-color 0.2s;
    }

    .erd-item:hover {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .erd-item-header {
      padding: 12px 16px;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .erd-item-title {
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 13px;
      color: #FFF;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .erd-field-row {
      padding: 8px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.02);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-family: var(--font-mono);
    }

    .erd-field-row:last-child { border-bottom: none; }

    .field-name {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #E2E8F0;
    }

    .field-type {
      color: var(--text-dim);
      font-size: 11px;
    }

    .tag-key {
      font-size: 8.5px;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 3px;
      text-transform: uppercase;
    }

    .tag-key.pk { background: rgba(244, 63, 94, 0.15); color: var(--danger); }
    .tag-key.fk { background: rgba(168, 85, 247, 0.15); color: var(--purple); }

    /* API Endpoint Cards */
    .api-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 26px;
      margin-bottom: 24px;
      scroll-margin-top: 80px;
    }

    .api-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .api-method {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 5px;
      text-transform: uppercase;
    }

    .api-method.get { background: rgba(16, 185, 129, 0.15); color: var(--success); }
    .api-method.post { background: rgba(56, 189, 248, 0.15); color: var(--info); }
    .api-method.del { background: rgba(244, 63, 94, 0.15); color: var(--danger); }

    .api-endpoint {
      font-family: var(--font-mono);
      font-size: 16px;
      font-weight: 700;
      color: #FFF;
    }

    .api-summary {
      font-size: 13.5px;
      color: var(--text-muted);
      margin-bottom: 18px;
    }

    .mini-subhead {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--accent);
      margin: 18px 0 8px;
    }

    /* Clean Code Block */
    .clean-code {
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: 8px;
      padding: 14px 16px;
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: #E2E8F0;
      overflow-x: auto;
      position: relative;
    }

    .copy-corner-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255,255,255,0.06);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10.5px;
      cursor: pointer;
      font-family: var(--font);
      font-weight: 600;
    }

    .copy-corner-btn:hover {
      color: #FFF;
      background: rgba(255,255,255,0.12);
    }
  </style>
</head>
<body>

  <!-- Left Sidebar -->
  <aside class="sidebar">
    <div class="brand-header">
      <div class="brand-avatar">B</div>
      <div class="brand-meta">
        <h1>Booking System</h1>
        <p>Backend & Database Reference</p>
      </div>
    </div>

    <div class="search-box">
      <input type="text" class="search-input" placeholder="Quick search..." id="filterInput">
    </div>

    <div class="nav-scroll">
      <div class="nav-title">Overview</div>
      <a href="#welcome" class="nav-item active">⚡ Welcome & Architecture</a>
      <a href="#storage-guide" class="nav-item">📁 Drive Folder Structure</a>

      <div class="nav-title">Database Tables (11)</div>
      <a href="#erd-section" class="nav-item"><span class="badge-pill db">ERD</span> Visual Schema Studio</a>
      <a href="#erd-properties" class="nav-item"><span class="badge-pill db">TBL</span> properties</a>
      <a href="#erd-tenants" class="nav-item"><span class="badge-pill db">TBL</span> tenants</a>
      <a href="#erd-contracts" class="nav-item"><span class="badge-pill db">TBL</span> contracts</a>
      <a href="#erd-schedules" class="nav-item"><span class="badge-pill db">TBL</span> payment_schedules</a>
      <a href="#erd-payments" class="nav-item"><span class="badge-pill db">TBL</span> payments</a>
      <a href="#erd-bookings" class="nav-item"><span class="badge-pill db">TBL</span> bookings</a>
      <a href="#erd-temp-res" class="nav-item"><span class="badge-pill db">TBL</span> temp_residences</a>

      <div class="nav-title">Google Drive APIs</div>
      <a href="#api-file" class="nav-item"><span class="badge-pill get">GET</span> /api/drive/file/:id</a>
      <a href="#api-thumb" class="nav-item"><span class="badge-pill get">GET</span> /api/drive/thumbnail/:id</a>
      <a href="#api-upload" class="nav-item"><span class="badge-pill post">POST</span> /api/upload</a>
      <a href="#api-delete" class="nav-item"><span class="badge-pill post">POST</span> /api/drive/delete</a>

      <div class="nav-title">Auth & SMTP APIs</div>
      <a href="#api-otp-req" class="nav-item"><span class="badge-pill post">POST</span> /api/request-otp</a>
      <a href="#api-otp-ver" class="nav-item"><span class="badge-pill post">POST</span> /api/verify-otp</a>
      <a href="#api-email" class="nav-item"><span class="badge-pill post">POST</span> /api/send-email</a>
    </div>
  </aside>

  <!-- Main Stage -->
  <div class="main-stage">
    <!-- Top Header -->
    <header class="top-header">
      <div class="live-status">
        <span class="status-pulse"></span> Cloudflare Edge & Database Online
      </div>
      <div class="header-actions">
        <button class="btn-clean" onclick="copyBaseUrl()">📋 Base URL</button>
        <button class="btn-clean accent" onclick="copySchema()">📊 Copy SQL DDL</button>
      </div>
    </header>

    <div class="content-canvas">

      <!-- Humanized Welcome Card -->
      <section id="welcome" class="welcome-card">
        <div class="welcome-tag">Developer Guide</div>
        <h2>Booking System Backend & Database</h2>
        <p>
          Welcome to the core service architecture. This backend runs serverlessly on <strong>Cloudflare Workers</strong> for global speed, stores structured business records in <strong>Supabase PostgreSQL</strong>, and saves all image & PDF attachments into an organized <strong>Google Drive</strong> folder tree.
        </p>

        <div class="quick-chips">
          <div class="chip">
            <div class="chip-icon">⚡</div>
            <div>
              <div class="chip-title">Edge Runtime</div>
              <div class="chip-value">Cloudflare Workers</div>
            </div>
          </div>
          <div class="chip">
            <div class="chip-icon">🗄️</div>
            <div>
              <div class="chip-title">Database</div>
              <div class="chip-value">PostgreSQL 15 (Supabase)</div>
            </div>
          </div>
          <div class="chip">
            <div class="chip-icon">☁️</div>
            <div>
              <div class="chip-title">Storage Driver</div>
              <div class="chip-value">Google Drive API v3</div>
            </div>
          </div>
          <div class="chip">
            <div class="chip-icon">🛡️</div>
            <div>
              <div class="chip-title">Auth Engine</div>
              <div class="chip-value">Stateless HMAC-SHA256</div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION: Visual Google Drive Storage Tree -->
      <section id="storage-guide" class="section-block">
        <div class="section-headline">
          <div>
            <h3>📁 How Google Drive Files Are Organized</h3>
            <p>Files are automatically sorted into specific sub-folders per property and per tenant</p>
          </div>
        </div>

        <div class="drive-explorer">
          <div class="explorer-bar">
            <span>Root Folder:</span>
            <div class="explorer-breadcrumbs">
              <span>Drive</span> / <span class="active">Booking System Root (1nXSUrLoiR...)</span>
            </div>
          </div>

          <div class="explorer-grid">
            <div class="folder-tile">
              <div class="tile-icon">🏢</div>
              <div class="tile-meta">
                <h4>Properties/</h4>
                <p>Stores all property images, photos, and building documents.</p>
                <div class="path-pill">Properties/{PropertyName}_{ID}/Images</div>
              </div>
            </div>

            <div class="folder-tile">
              <div class="tile-icon">🪪</div>
              <div class="tile-meta">
                <h4>Users/.../Identification/</h4>
                <p>Encrypted tenant identification photos (CCCD front and back).</p>
                <div class="path-pill">Users/{UserIdentifier}/Identification</div>
              </div>
            </div>

            <div class="folder-tile">
              <div class="tile-icon">📄</div>
              <div class="tile-meta">
                <h4>Users/.../Contracts/</h4>
                <p>Scanned contract documents, signed PDFs, and appendices.</p>
                <div class="path-pill">Users/{UserIdentifier}/Contracts/{HD_01}</div>
              </div>
            </div>

            <div class="folder-tile">
              <div class="tile-icon">💳</div>
              <div class="tile-meta">
                <h4>Users/.../Payments/</h4>
                <p>Monthly rent transfer receipts sorted by month and year.</p>
                <div class="path-pill">Users/{UserIdentifier}/Payments/{Thang_08_2026}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION: Database ERD Studio -->
      <section id="erd-section" class="section-block">
        <div class="section-headline">
          <div>
            <h3>🗄️ Database Tables & Schema (PostgreSQL)</h3>
            <p>Interactive table specifications with Primary Keys (PK) and Foreign Keys (FK)</p>
          </div>
        </div>

        <div class="erd-cards">
          <!-- 1. properties -->
          <div class="erd-item" id="erd-properties">
            <div class="erd-item-header">
              <span class="erd-item-title">🏢 properties</span>
              <span class="badge-pill db">TABLE</span>
            </div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key pk">PK</span> id</span><span class="field-type">UUID</span></div>
            <div class="erd-field-row"><span class="field-name">name</span><span class="field-type">VARCHAR(200)</span></div>
            <div class="erd-field-row"><span class="field-name">address</span><span class="field-type">TEXT</span></div>
            <div class="erd-field-row"><span class="field-name">property_type</span><span class="field-type">apartment, villa, room</span></div>
            <div class="erd-field-row"><span class="field-name">status</span><span class="field-type">vacant, occupied, maintenance</span></div>
            <div class="erd-field-row"><span class="field-name">reference_price</span><span class="field-type">NUMERIC(15,2)</span></div>
            <div class="erd-field-row"><span class="field-name">photos</span><span class="field-type">TEXT[]</span></div>
          </div>

          <!-- 2. tenants -->
          <div class="erd-item" id="erd-tenants">
            <div class="erd-item-header">
              <span class="erd-item-title">👤 tenants</span>
              <span class="badge-pill db">TABLE</span>
            </div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key pk">PK</span> id</span><span class="field-type">UUID</span></div>
            <div class="erd-field-row"><span class="field-name">full_name</span><span class="field-type">VARCHAR(100)</span></div>
            <div class="erd-field-row"><span class="field-name">id_number (CCCD)</span><span class="field-type">VARCHAR(20) UNIQUE</span></div>
            <div class="erd-field-row"><span class="field-name">phone</span><span class="field-type">VARCHAR(20)</span></div>
            <div class="erd-field-row"><span class="field-name">email</span><span class="field-type">VARCHAR(200)</span></div>
            <div class="erd-field-row"><span class="field-name">permanent_address</span><span class="field-type">TEXT</span></div>
          </div>

          <!-- 3. contracts -->
          <div class="erd-item" id="erd-contracts">
            <div class="erd-item-header">
              <span class="erd-item-title">📝 contracts</span>
              <span class="badge-pill db">TABLE</span>
            </div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key pk">PK</span> id</span><span class="field-type">UUID</span></div>
            <div class="erd-field-row"><span class="field-name">contract_number</span><span class="field-type">VARCHAR(50) UNIQUE</span></div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key fk">FK</span> property_id</span><span class="field-type">UUID -> properties</span></div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key fk">FK</span> tenant_id</span><span class="field-type">UUID -> tenants</span></div>
            <div class="erd-field-row"><span class="field-name">start_date / end_date</span><span class="field-type">DATE</span></div>
            <div class="erd-field-row"><span class="field-name">monthly_rent</span><span class="field-type">NUMERIC(15,2)</span></div>
            <div class="erd-field-row"><span class="field-name">status</span><span class="field-type">draft, active, expired</span></div>
          </div>

          <!-- 4. payment_schedules -->
          <div class="erd-item" id="erd-schedules">
            <div class="erd-item-header">
              <span class="erd-item-title">💳 payment_schedules</span>
              <span class="badge-pill db">TABLE</span>
            </div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key pk">PK</span> id</span><span class="field-type">UUID</span></div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key fk">FK</span> contract_id</span><span class="field-type">UUID -> contracts</span></div>
            <div class="erd-field-row"><span class="field-name">period_month / year</span><span class="field-type">SMALLINT</span></div>
            <div class="erd-field-row"><span class="field-name">amount_due</span><span class="field-type">NUMERIC(15,2)</span></div>
            <div class="erd-field-row"><span class="field-name">due_date</span><span class="field-type">DATE</span></div>
            <div class="erd-field-row"><span class="field-name">status</span><span class="field-type">pending, paid, overdue</span></div>
            <div class="erd-field-row"><span class="field-name">receipt_url</span><span class="field-type">TEXT (Drive Link)</span></div>
          </div>

          <!-- 5. payments -->
          <div class="erd-item" id="erd-payments">
            <div class="erd-item-header">
              <span class="erd-item-title">💰 payments</span>
              <span class="badge-pill db">TABLE</span>
            </div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key pk">PK</span> id</span><span class="field-type">UUID</span></div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key fk">FK</span> schedule_id</span><span class="field-type">UUID -> schedules</span></div>
            <div class="erd-field-row"><span class="field-name">amount_paid</span><span class="field-type">NUMERIC(15,2)</span></div>
            <div class="erd-field-row"><span class="field-name">payment_method</span><span class="field-type">bank_transfer, momo, cash</span></div>
            <div class="erd-field-row"><span class="field-name">payment_date</span><span class="field-type">DATE</span></div>
          </div>

          <!-- 6. bookings -->
          <div class="erd-item" id="erd-bookings">
            <div class="erd-item-header">
              <span class="erd-item-title">📅 bookings</span>
              <span class="badge-pill db">TABLE</span>
            </div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key pk">PK</span> id</span><span class="field-type">UUID</span></div>
            <div class="erd-field-row"><span class="field-name">booking_number</span><span class="field-type">VARCHAR(50) UNIQUE</span></div>
            <div class="erd-field-row"><span class="field-name"><span class="tag-key fk">FK</span> property_id</span><span class="field-type">UUID -> properties</span></div>
            <div class="erd-field-row"><span class="field-name">guest_name / phone</span><span class="field-type">VARCHAR(100)</span></div>
            <div class="erd-field-row"><span class="field-name">check_in / check_out</span><span class="field-type">DATE</span></div>
            <div class="erd-field-row"><span class="field-name">status</span><span class="field-type">pending, confirmed</span></div>
          </div>
        </div>
      </section>

      <!-- SECTION: API Reference -->
      <section class="section-block">
        <div class="section-headline">
          <div>
            <h3>⚡ API Endpoints Reference</h3>
            <p>Cloudflare Workers edge API for streaming media, uploads, OTP auth, and emails</p>
          </div>
        </div>

        <!-- API 1: GET /api/drive/file/:fileId -->
        <div class="api-card" id="api-file">
          <div class="api-card-header">
            <span class="api-method get">GET</span>
            <span class="api-endpoint">/api/drive/file/:fileId</span>
          </div>
          <p class="api-summary">
            Streams images, documents, or video from Google Drive with Byte-Range acceleration (HTTP 206).
          </p>

          <div class="mini-subhead">Example Request</div>
          <div class="clean-code">
            <button class="copy-corner-btn" onclick="copySnippetText(this)">Copy</button>
            <code>curl -i "https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g"</code>
          </div>
        </div>

        <!-- API 2: GET /api/drive/thumbnail/:fileId -->
        <div class="api-card" id="api-thumb">
          <div class="api-card-header">
            <span class="api-method get">GET</span>
            <span class="api-endpoint">/api/drive/thumbnail/:fileId?sz=s400</span>
          </div>
          <p class="api-summary">
            Fetches high-speed resized thumbnails (e.g. <code>sz=s400</code>, <code>sz=s800</code>) for fast card grid loading.
          </p>
        </div>

        <!-- API 3: POST /api/upload -->
        <div class="api-card" id="api-upload">
          <div class="api-card-header">
            <span class="api-method post">POST</span>
            <span class="api-endpoint">/api/upload</span>
          </div>
          <p class="api-summary">
            Uploads raw file bytes to Google Drive and automatically creates the correct category sub-folder.
          </p>

          <div class="mini-subhead">Required Headers</div>
          <div class="clean-code">
            <button class="copy-corner-btn" onclick="copySnippetText(this)">Copy</button>
            <code>X-File-Name: photo.jpg
Content-Type: image/jpeg
X-Category: users
X-Sub-Category: payments
X-User-Email: tenant@gmail.com
X-Period: Thang_08_2026</code>
          </div>
        </div>

        <!-- API 4: POST /api/drive/delete -->
        <div class="api-card" id="api-delete">
          <div class="api-card-header">
            <span class="api-method post">POST</span>
            <span class="api-endpoint">/api/drive/delete</span>
          </div>
          <p class="api-summary">
            Permanently purges files or an entire entity folder from Google Drive when deleting properties or tenants.
          </p>

          <div class="mini-subhead">JSON Body</div>
          <div class="clean-code">
            <button class="copy-corner-btn" onclick="copySnippetText(this)">Copy</button>
            <code>{
  "fileIds": ["1nXSUrLoiR..."],
  "category": "users",
  "entityId": "tenant@gmail.com"
}</code>
          </div>
        </div>

        <!-- API 5: POST /api/request-otp -->
        <div class="api-card" id="api-otp-req">
          <div class="api-card-header">
            <span class="api-method post">POST</span>
            <span class="api-endpoint">/api/request-otp</span>
          </div>
          <p class="api-summary">
            Generates a 6-digit OTP, returns a cryptographically signed HMAC token (5-min expiry), and emails the code.
          </p>
          <div class="clean-code">
            <button class="copy-corner-btn" onclick="copySnippetText(this)">Copy</button>
            <code>curl -X POST "https://booking-system-be.iluvsunset.workers.dev/api/request-otp" \\
  -H "Content-Type: application/json" \\
  -d '{"contact":"bao.h0146824@gmail.com"}'</code>
          </div>
        </div>

        <!-- API 6: POST /api/verify-otp -->
        <div class="api-card" id="api-otp-ver">
          <div class="api-card-header">
            <span class="api-method post">POST</span>
            <span class="api-endpoint">/api/verify-otp</span>
          </div>
          <p class="api-summary">
            Statelessly verifies the OTP against the HMAC token without needing database sessions.
          </p>
          <div class="clean-code">
            <button class="copy-corner-btn" onclick="copySnippetText(this)">Copy</button>
            <code>curl -X POST "https://booking-system-be.iluvsunset.workers.dev/api/verify-otp" \\
  -H "Content-Type: application/json" \\
  -d '{"contact":"bao.h0146824@gmail.com","otp":"123456","otpToken":"ey..."}'</code>
          </div>
        </div>
      </section>

    </div>
  </div>

  <script>
    function copyBaseUrl() {
      navigator.clipboard.writeText('https://booking-system-be.iluvsunset.workers.dev');
      alert('Copied Base URL: https://booking-system-be.iluvsunset.workers.dev');
    }

    function copySnippetText(btn) {
      const code = btn.parentElement.querySelector('code').innerText;
      navigator.clipboard.writeText(code);
      btn.innerText = '✓ Copied';
      setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
    }

    function copySchema() {
      const sql = \`-- COMPLETE BOOKING SYSTEM DDL
CREATE TABLE properties (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name VARCHAR(200) NOT NULL, address TEXT NOT NULL, reference_price NUMERIC(15,2), photos TEXT[]);
CREATE TABLE tenants (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), full_name VARCHAR(100) NOT NULL, id_number VARCHAR(20) UNIQUE NOT NULL, phone VARCHAR(20) NOT NULL);
CREATE TABLE contracts (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), contract_number VARCHAR(50) UNIQUE NOT NULL, property_id UUID REFERENCES properties(id), tenant_id UUID REFERENCES tenants(id));
CREATE TABLE payment_schedules (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), contract_id UUID REFERENCES contracts(id), period_month SMALLINT, amount_due NUMERIC(15,2), due_date DATE, status VARCHAR(50));\`;
      navigator.clipboard.writeText(sql);
      alert('Copied Database SQL Schema to clipboard!');
    }

    // Filter
    document.getElementById('filterInput').addEventListener('input', function(e) {
      const val = e.target.value.toLowerCase();
      document.querySelectorAll('.erd-item, .api-card, .folder-tile').forEach(el => {
        el.style.display = el.innerText.toLowerCase().includes(val) ? '' : 'none';
      });
    });
  </script>
</body>
</html>
`;
