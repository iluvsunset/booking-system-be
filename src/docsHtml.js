/**
 * VietQR / GitBook Master Documentation Portal for Booking System API & Database
 * 1:1 Architecture & Aesthetic of doc.vietqr.vn (GitBook Engine)
 */
export const API_DOCS_HTML = `<!DOCTYPE html>
<html lang="vi" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tài liệu Tích hợp API & Cơ sở Dữ liệu — Booking System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --header-bg: #346DDB;
      --header-text: #FFFFFF;
      
      --bg-page: #FFFFFF;
      --bg-sidebar: #F8FAFC;
      --bg-card: #F1F5F9;
      --bg-code: #0F172A;
      --bg-hover: #E2E8F0;

      --border: #E2E8F0;
      --border-focus: #346DDB;

      --text-main: #0F172A;
      --text-sub: #475569;
      --text-muted: #64748B;
      --text-dim: #94A3B8;

      --primary: #346DDB;
      --primary-hover: #2756B8;
      --primary-light: #EFF6FF;

      --method-get: #10B981;
      --method-post: #346DDB;
      --method-del: #EF4444;
      --method-put: #F59E0B;

      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    [data-theme="dark"] {
      --header-bg: #1E293B;
      --header-text: #FFFFFF;

      --bg-page: #0B0F19;
      --bg-sidebar: #0F172A;
      --bg-card: #1E293B;
      --bg-code: #050811;
      --bg-hover: #334155;

      --border: #1E293B;
      --border-focus: #38BDF8;

      --text-main: #F8FAFC;
      --text-sub: #94A3B8;
      --text-muted: #64748B;
      --text-dim: #475569;

      --primary: #38BDF8;
      --primary-hover: #0EA5E9;
      --primary-light: rgba(56, 189, 248, 0.12);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-sans);
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.7;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* =========================================================================
       VIETQR BLUE HEADER (doc.vietqr.vn)
       ========================================================================= */
    .vietqr-header {
      height: 60px;
      background: var(--header-bg);
      color: var(--header-text);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
      z-index: 50;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: #FFF;
    }

    .brand-logo-sq {
      width: 32px;
      height: 32px;
      background: #FFF;
      color: var(--primary);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 17px;
    }

    .brand-name {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-tag {
      font-size: 10px;
      font-weight: 700;
      background: rgba(255,255,255,0.2);
      color: #FFF;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topbar-action-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      padding: 6px 13px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: all 0.18s ease;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .topbar-action-btn:hover {
      background: rgba(255, 255, 255, 0.24);
      border-color: rgba(255, 255, 255, 0.4);
      color: #FFFFFF;
      transform: translateY(-1px);
    }

    .topbar-action-btn.btn-github {
      background: #FFFFFF;
      color: #1E40AF;
      border-color: #FFFFFF;
    }

    .topbar-action-btn.btn-github:hover {
      background: #F8FAFC;
      color: #1D4ED8;
    }

    .topbar-action-btn svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    /* =========================================================================
       DOCS WORKSPACE LAYOUT (GitBook Sidebar + Center Markdown + Right TOC)
       ========================================================================= */
    .docs-layout {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    /* LEFT SIDEBAR */
    .sidebar {
      width: 290px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      overflow-y: auto;
      flex-shrink: 0;
      user-select: none;
      display: flex;
      flex-direction: column;
    }

    .sidebar::-webkit-scrollbar { width: 5px; }
    .sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    .sidebar-search-box {
      padding: 14px 16px;
      position: sticky;
      top: 0;
      background: var(--bg-sidebar);
      z-index: 10;
      border-bottom: 1px solid var(--border);
    }

    .search-input {
      width: 100%;
      background: var(--bg-page);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      color: var(--text-main);
      font-size: 12.5px;
      outline: none;
      font-family: var(--font-sans);
      transition: all 0.15s ease;
    }

    .search-input:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 2px var(--primary-light);
    }

    .sidebar-nav {
      padding: 14px 10px 60px;
    }

    .nav-group-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.06em;
      padding: 14px 12px 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 12px;
      border-radius: 6px;
      color: var(--text-sub);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s ease;
      margin-bottom: 2px;
    }

    .nav-item:hover {
      background: var(--bg-card);
      color: var(--text-main);
    }

    .nav-item.active {
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 600;
    }

    .method-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 800;
      padding: 2px 5px;
      border-radius: 4px;
      min-width: 36px;
      text-align: center;
      text-transform: uppercase;
    }

    .method-badge.get { background: rgba(16, 185, 129, 0.15); color: var(--method-get); }
    .method-badge.post { background: rgba(52, 109, 219, 0.15); color: var(--method-post); }
    .method-badge.del { background: rgba(239, 68, 68, 0.15); color: var(--method-del); }
    .method-badge.db { background: rgba(168, 85, 247, 0.15); color: #9333EA; }

    /* CENTER ARTICLE CANVAS (VietQR Clean Style) */
    .article-canvas {
      flex: 1;
      overflow-y: auto;
      padding: 36px 54px 120px;
      scroll-behavior: smooth;
    }

    .article-canvas::-webkit-scrollbar { width: 7px; }
    .article-canvas::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    .article-wrapper {
      max-width: 880px;
      margin: 0 auto;
    }

    .doc-section {
      margin-bottom: 56px;
      scroll-margin-top: 30px;
    }

    /* BREADCRUMB */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .breadcrumb a {
      color: var(--text-sub);
      text-decoration: none;
    }

    .breadcrumb a:hover { color: var(--primary); }

    /* HEADINGS & TEXT */
    h1.page-title {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: var(--text-main);
      margin-bottom: 14px;
    }

    h2.section-heading {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.015em;
      color: var(--text-main);
      margin: 40px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    h3.sub-heading {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      margin: 24px 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    p.lead-desc {
      font-size: 14.5px;
      color: var(--text-sub);
      line-height: 1.75;
      margin-bottom: 22px;
    }

    /* ENDPOINT BANNER (VietQR Core Component) */
    .endpoint-banner {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 24px;
    }

    .endpoint-info {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
    }

    .badge-endpoint {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .badge-endpoint.get { background: rgba(16, 185, 129, 0.15); color: var(--method-get); }
    .badge-endpoint.post { background: rgba(52, 109, 219, 0.15); color: var(--method-post); }
    .badge-endpoint.del { background: rgba(239, 68, 68, 0.15); color: var(--method-del); }

    .endpoint-path {
      font-family: var(--font-mono);
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-main);
      word-break: break-all;
    }

    .btn-copy {
      background: var(--bg-page);
      border: 1px solid var(--border);
      color: var(--text-sub);
      padding: 5px 12px;
      border-radius: 5px;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .btn-copy:hover {
      background: var(--bg-hover);
      color: var(--text-main);
    }

    /* VIETQR DATA TABLES */
    .vietqr-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 26px;
      font-size: 13px;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .vietqr-table th {
      background: var(--bg-sidebar);
      padding: 10px 14px;
      text-align: left;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }

    .vietqr-table td {
      padding: 11px 14px;
      border-bottom: 1px solid var(--border);
      color: var(--text-sub);
      background: var(--bg-page);
      vertical-align: top;
    }

    .vietqr-table tr:last-child td { border-bottom: none; }

    .col-name {
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--text-main);
    }

    .col-type {
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: #2563EB;
    }

    .badge-req {
      font-size: 9px;
      font-weight: 800;
      background: rgba(239, 68, 68, 0.12);
      color: var(--method-del);
      padding: 2px 5px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-left: 6px;
    }

    .badge-opt {
      font-size: 9px;
      font-weight: 700;
      background: rgba(148, 163, 184, 0.15);
      color: var(--text-muted);
      padding: 2px 5px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-left: 6px;
    }

    .key-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-right: 4px;
    }

    .key-badge.pk { background: rgba(244, 63, 94, 0.15); color: #F43F5E; border: 1px solid rgba(244, 63, 94, 0.3); }
    .key-badge.fk { background: rgba(168, 85, 247, 0.15); color: #A855F7; border: 1px solid rgba(168, 85, 247, 0.3); }

    /* CODE SNIPPETS (VietQR Box) */
    .code-box {
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 26px;
      overflow: hidden;
    }

    .code-header {
      background: #0B1120;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 38px;
    }

    .code-tabs {
      display: flex;
      height: 100%;
    }

    .code-tab-btn {
      background: none;
      border: none;
      color: #94A3B8;
      font-family: var(--font-sans);
      font-size: 11.5px;
      font-weight: 600;
      padding: 0 12px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
      height: 100%;
      display: flex;
      align-items: center;
    }

    .code-tab-btn.active {
      color: #FFF;
      border-bottom-color: #38BDF8;
    }

    .btn-copy-code {
      background: none;
      border: 1px solid rgba(255,255,255,0.15);
      color: #94A3B8;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.15s ease;
    }

    .btn-copy-code:hover {
      background: rgba(255,255,255,0.1);
      color: #FFF;
    }

    pre code {
      display: block;
      padding: 16px 18px;
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: #E2E8F0;
      line-height: 1.65;
      overflow-x: auto;
    }

    /* INTERACTIVE LIVE RUNNER WIDGET */
    .live-runner {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px 18px;
      margin-bottom: 26px;
    }

    .runner-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .runner-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .runner-btn {
      background: var(--primary);
      color: #FFF;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .runner-btn:hover {
      background: var(--primary-hover);
    }

    .runner-result {
      margin-top: 12px;
      padding: 12px 14px;
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #34D399;
      display: none;
      max-height: 180px;
      overflow-y: auto;
    }

    /* STORAGE TREE VISUALIZER */
    .tree-block {
      background: var(--bg-code);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 18px 20px;
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: #CBD5E1;
      line-height: 1.8;
      margin-bottom: 26px;
    }

    .tree-dir { color: #F59E0B; font-weight: 700; }
    .tree-file { color: #38BDF8; }
    .tree-note { color: #64748B; font-style: italic; }

    /* GITBOOK CALLOUT */
    .callout {
      padding: 14px 18px;
      border-radius: 8px;
      margin-bottom: 22px;
      font-size: 13px;
      display: flex;
      gap: 12px;
      line-height: 1.6;
    }

    .callout.info {
      background: var(--primary-light);
      border-left: 3px solid var(--primary);
      color: var(--text-main);
    }

    @media (max-width: 900px) {
      .article-canvas { padding: 24px 20px 80px; }
      .sidebar { width: 260px; }
    }
  </style>
</head>
<body>

  <!-- VIETQR BLUE TOPBAR -->
  <header class="vietqr-header">
    <div class="header-brand">
      <div class="brand-logo-sq">B</div>
      <div class="brand-name">
        Booking System API <span class="header-tag">v2.5</span>
      </div>
    </div>

    <div class="header-actions">
      <button class="topbar-action-btn" onclick="copyBaseUrl()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        Base URL
      </button>
      <button class="topbar-action-btn" onclick="toggleTheme()" title="Chuyển chế độ Sáng/Tối">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        Sáng / Tối
      </button>
      <a href="https://github.com/iluvsunset/booking-system-fe" target="_blank" class="topbar-action-btn btn-github">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 11px; height: 11px; margin-left: -2px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
      </a>
    </div>
  </header>

  <!-- DOCS WORKSPACE -->
  <div class="docs-layout">

    <!-- LEFT SIDEBAR TREE NAVIGATION -->
    <aside class="sidebar">
      <div class="sidebar-search-box">
        <input type="text" class="search-input" placeholder="Tìm kiếm API & Bảng... (Cmd+K)" id="docSearch">
      </div>

      <nav class="sidebar-nav">
        <div class="nav-group-title">1. TỔNG QUAN</div>
        <a href="#section-overview" class="nav-item active">⚡ Kiến trúc & Base URL</a>
        <a href="#section-drive-tree" class="nav-item">📁 Cấu trúc thư mục Drive</a>

        <div class="nav-group-title">2. GOOGLE DRIVE API</div>
        <a href="#api-stream" class="nav-item"><span class="method-badge get">GET</span> Stream Media File</a>
        <a href="#api-thumbnail" class="nav-item"><span class="method-badge get">GET</span> Lấy Thumbnail</a>
        <a href="#api-upload" class="nav-item"><span class="method-badge post">POST</span> Tải lên Stream File</a>
        <a href="#api-delete-batch" class="nav-item"><span class="method-badge post">POST</span> Xóa Folder / Batch</a>
        <a href="#api-delete-single" class="nav-item"><span class="method-badge del">DEL</span> Xóa File đơn lẻ</a>

        <div class="nav-group-title">3. XÁC THỰC & EMAIL</div>
        <a href="#api-request-otp" class="nav-item"><span class="method-badge post">POST</span> Yêu cầu mã OTP</a>
        <a href="#api-verify-otp" class="nav-item"><span class="method-badge post">POST</span> Xác thực mã OTP</a>
        <a href="#api-send-email" class="nav-item"><span class="method-badge post">POST</span> Gửi Email HTML</a>

        <div class="nav-group-title">4. CƠ SỞ DỮ LIỆU (11 BẢNG)</div>
        <a href="#tbl-properties" class="nav-item"><span class="method-badge db">TBL</span> properties</a>
        <a href="#tbl-tenants" class="nav-item"><span class="method-badge db">TBL</span> tenants</a>
        <a href="#tbl-contracts" class="nav-item"><span class="method-badge db">TBL</span> contracts</a>
        <a href="#tbl-schedules" class="nav-item"><span class="method-badge db">TBL</span> payment_schedules</a>
        <a href="#tbl-payments" class="nav-item"><span class="method-badge db">TBL</span> payments</a>
        <a href="#tbl-bookings" class="nav-item"><span class="method-badge db">TBL</span> bookings</a>
        <a href="#tbl-temp-res" class="nav-item"><span class="method-badge db">TBL</span> temp_residences</a>
        <a href="#tbl-documents" class="nav-item"><span class="method-badge db">TBL</span> documents</a>
        <a href="#tbl-notifications" class="nav-item"><span class="method-badge db">TBL</span> notifications</a>
        <a href="#tbl-audit" class="nav-item"><span class="method-badge db">TBL</span> audit_logs</a>
        <a href="#tbl-users" class="nav-item"><span class="method-badge db">TBL</span> users</a>

        <div class="nav-group-title">5. PHỤ LỤC</div>
        <a href="#section-error-codes" class="nav-item">⚠️ Mã lỗi & HTTP Status</a>
      </nav>
    </aside>

    <!-- CENTER ARTICLE CANVAS -->
    <main class="article-canvas">
      <div class="article-wrapper">

        <!-- SECTION: OVERVIEW -->
        <article id="section-overview" class="doc-section">
          <div class="breadcrumb">
            <a href="#section-overview">Tài liệu</a> <span>/</span> <a href="#section-overview">Tổng quan</a> <span>/</span> Kiến trúc
          </div>
          <h1 class="page-title">Kiến trúc Hệ thống & Base URL</h1>
          <p class="lead-desc">
            Tài liệu tích hợp kỹ thuật chi tiết của <strong>Booking System</strong>. Nền tảng kết hợp <strong>Cloudflare Edge Workers</strong> (xử lý proxy, stream byte-range, stateless HMAC OTP) với <strong>Supabase PostgreSQL</strong> (ACID relational core, RLS) và <strong>Google Drive REST API</strong> (lưu trữ không giới hạn tài sản hình ảnh & chứng từ).
          </p>

          <div class="endpoint-banner">
            <div class="endpoint-info">
              <span class="badge-endpoint get">BASE URL</span>
              <span class="endpoint-path">https://booking-system-be.iluvsunset.workers.dev</span>
            </div>
            <button class="btn-copy" onclick="copyBaseUrl()">Sao chép</button>
          </div>

          <div class="callout info">
            <div>💡</div>
            <div>
              <strong>Xác thực Stateless:</strong> Toàn bộ thao tác tệp tin qua Cloudflare Edge Worker đều sử dụng tài khoản dịch vụ Google OAuth2 Service Account với cơ chế tự động làm mới Access Token trong bộ nhớ Isolate.
            </div>
          </div>

          <h3 class="sub-heading">Môi trường & Thông số Kỹ thuật</h3>
          <table class="vietqr-table">
            <thead>
              <tr>
                <th>Thành phần</th>
                <th>Công nghệ</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="col-name">Edge Runtime</span></td>
                <td>Cloudflare Workers (V8 Isolates)</td>
                <td>0ms Cold Start, phân tán toàn cầu</td>
              </tr>
              <tr>
                <td><span class="col-name">Database Engine</span></td>
                <td>PostgreSQL 15 (Supabase)</td>
                <td>Row Level Security (RLS) & Foreign Keys</td>
              </tr>
              <tr>
                <td><span class="col-name">Media Gateway</span></td>
                <td>Google Drive REST API v3</td>
                <td>OAuth2 Service Account Token Rotation</td>
              </tr>
              <tr>
                <td><span class="col-name">Xác thực OTP</span></td>
                <td>HMAC-SHA256 Web Crypto</td>
                <td>Stateless Token, thời hạn 5 phút</td>
              </tr>
            </tbody>
          </table>
        </article>

        <!-- SECTION: DRIVE TREE -->
        <article id="section-drive-tree" class="doc-section">
          <h2 class="section-heading">Cấu trúc Phân cấp Thư mục Google Drive</h2>
          <p class="lead-desc">
            Hệ thống tự động phân loại tệp tin theo cây thư mục nghiêm ngặt. Đặc biệt, các chứng từ thanh toán và hợp đồng được phân lập thành các thư mục con riêng biệt theo từng khách thuê:
          </p>

          <div class="tree-block">
            <div>📁 <span class="tree-dir">Booking System Drive (Root ID: 1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g)</span></div>
            <div>│</div>
            <div>├── 📁 <span class="tree-dir">Properties/</span> <span class="tree-note">— Hình ảnh phòng & bất động sản</span></div>
            <div>│   └── 📁 <span class="tree-dir">{PropertyName}_{PropertyUUID}/</span></div>
            <div>│       ├── 📁 <span class="tree-dir">Images/</span> (gallery_01.webp, cover.jpg)</div>
            <div>│       └── 📁 <span class="tree-dir">Files/</span> (so_do_phong.pdf)</div>
            <div>│</div>
            <div>└── 📁 <span class="tree-dir">Users/</span> <span class="tree-note">— Khách thuê & người dùng</span></div>
            <div>    └── 📁 <span class="tree-dir">{TenantEmail_or_Phone}/</span> <span class="tree-note">&lt;-- USER ROOT</span></div>
            <div>        ├── 📁 <span class="tree-dir">Identification/</span> (cccd_mat_truoc.jpg, cccd_mat_sau.jpg)</div>
            <div>        ├── 📁 <span class="tree-dir">Contracts/</span></div>
            <div>        │   └── 📁 <span class="tree-dir">{ContractNumber}/</span> (hop_dong_thue_nha.pdf)</div>
            <div>        └── 📁 <span class="tree-dir">Payments/</span> <span class="tree-note">&lt;-- THƯ MỤC THANH TOÁN RIÊNG CỦA USER</span></div>
            <div>            ├── 📁 <span class="tree-dir">Thang_07_2026/</span> (bien_lai_chuyen_khoan.png)</div>
            <div>            └── 📁 <span class="tree-dir">Thang_08_2026/</span> (momo_receipt.jpg)</div>
          </div>
        </article>

        <!-- API 1: Stream File -->
        <article id="api-stream" class="doc-section">
          <h2 class="section-heading">1. Stream Media File từ Google Drive</h2>
          <p class="lead-desc">
            Truy xuất và phát trực tiếp luồng nhị phân (ảnh, PDF, video, audio) từ Google Drive thông qua Cloudflare Edge Worker. Hỗ trợ đầy đủ HTTP 206 Partial Content (Byte-Range Requests).
          </p>

          <div class="endpoint-banner">
            <div class="endpoint-info">
              <span class="badge-endpoint get">GET / HEAD</span>
              <span class="endpoint-path">/api/drive/file/:fileId</span>
            </div>
            <button class="btn-copy" onclick="copyText('https://booking-system-be.iluvsunset.workers.dev/api/drive/file/:fileId')">Sao chép</button>
          </div>

          <h3 class="sub-heading">Path Parameters</h3>
          <table class="vietqr-table">
            <thead>
              <tr><th>Tham số</th><th>Kiểu</th><th>Bắt buộc</th><th>Mô tả</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="col-name">fileId</span></td>
                <td><span class="col-type">string</span></td>
                <td><span class="badge-req">Bắt buộc</span></td>
                <td>ID tệp tin Google Drive (Ví dụ: <code>1g9K8x_XYZ9876</code>)</td>
              </tr>
            </tbody>
          </table>

          <h3 class="sub-heading">Mẫu Request cURL</h3>
          <div class="code-box">
            <div class="code-header">
              <div class="code-tabs"><button class="code-tab-btn active">cURL</button></div>
              <button class="btn-copy-code" onclick="copySnippet(this)">Copy</button>
            </div>
            <pre><code>curl -i "https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g"</code></pre>
          </div>
        </article>

        <!-- API 2: Thumbnail -->
        <article id="api-thumbnail" class="doc-section">
          <h2 class="section-heading">2. Lấy Thumbnail Tối ưu từ Google Cache</h2>
          <p class="lead-desc">
            Truy xuất ảnh thu nhỏ đã nén sẵn từ CDN Google với các tùy chọn kích thước linh hoạt, giảm băng thông tải ảnh trong danh sách bất động sản.
          </p>

          <div class="endpoint-banner">
            <div class="endpoint-info">
              <span class="badge-endpoint get">GET</span>
              <span class="endpoint-path">/api/drive/thumbnail/:fileId</span>
            </div>
            <button class="btn-copy" onclick="copyText('https://booking-system-be.iluvsunset.workers.dev/api/drive/thumbnail/:fileId')">Sao chép</button>
          </div>

          <h3 class="sub-heading">Query Parameters</h3>
          <table class="vietqr-table">
            <thead>
              <tr><th>Tham số</th><th>Kiểu</th><th>Mặc định</th><th>Mô tả</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="col-name">sz</span></td>
                <td><span class="col-type">string</span></td>
                <td><code>s400</code></td>
                <td>Kích thước thumbnail (<code>s400</code>, <code>s800</code>, <code>w1200</code>)</td>
              </tr>
            </tbody>
          </table>
        </article>

        <!-- API 3: Upload -->
        <article id="api-upload" class="doc-section">
          <h2 class="section-heading">3. Tải lên Tệp tin (Streaming Multipart)</h2>
          <p class="lead-desc">
            Tải lên trực tiếp luồng nhị phân vào Google Drive, tự động tạo và phân loại thư mục theo Metadata Headers.
          </p>

          <div class="endpoint-banner">
            <div class="endpoint-info">
              <span class="badge-endpoint post">POST</span>
              <span class="endpoint-path">/api/upload</span>
            </div>
            <button class="btn-copy" onclick="copyText('https://booking-system-be.iluvsunset.workers.dev/api/upload')">Sao chép</button>
          </div>

          <h3 class="sub-heading">HTTP Headers</h3>
          <table class="vietqr-table">
            <thead>
              <tr><th>Header</th><th>Kiểu</th><th>Bắt buộc</th><th>Mô tả</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="col-name">Content-Type</span></td><td><span class="col-type">string</span></td><td><span class="badge-req">Bắt buộc</span></td><td>MIME type của file (Ví dụ: <code>image/jpeg</code>)</td></tr>
              <tr><td><span class="col-name">X-File-Name</span></td><td><span class="col-type">string</span></td><td><span class="badge-req">Bắt buộc</span></td><td>Tên file URL-encoded (Ví dụ: <code>photo_01.jpg</code>)</td></tr>
              <tr><td><span class="col-name">X-Category</span></td><td><span class="col-type">string</span></td><td><span class="badge-opt">Tùy chọn</span></td><td><code>properties</code> | <code>users</code></td></tr>
              <tr><td><span class="col-name">X-Sub-Category</span></td><td><span class="col-type">string</span></td><td><span class="badge-opt">Tùy chọn</span></td><td><code>identification</code>, <code>contracts</code>, <code>payments</code></td></tr>
              <tr><td><span class="col-name">X-Entity-Id</span></td><td><span class="col-type">string</span></td><td><span class="badge-opt">Tùy chọn</span></td><td>Mã định danh đối tượng (Tên phòng hoặc Khách thuê)</td></tr>
              <tr><td><span class="col-name">X-Period</span></td><td><span class="col-type">string</span></td><td><span class="badge-opt">Tùy chọn</span></td><td>Kỳ thanh toán (Ví dụ: <code>Thang_08_2026</code>)</td></tr>
            </tbody>
          </table>

          <h3 class="sub-heading">Phản hồi mẫu (200 OK)</h3>
          <div class="code-box">
            <div class="code-header">
              <div class="code-tabs"><button class="code-tab-btn active">JSON Response</button></div>
              <button class="btn-copy-code" onclick="copySnippet(this)">Copy</button>
            </div>
            <pre><code>{
  "success": true,
  "fileId": "1g9K8x_XYZ9876",
  "fileName": "photo_01.jpg",
  "url": "https://lh3.googleusercontent.com/d/1g9K8x_XYZ9876",
  "proxyUrl": "https://booking-system-be.iluvsunset.workers.dev/api/drive/file/1g9K8x_XYZ9876",
  "thumbnailUrl": "https://booking-system-be.iluvsunset.workers.dev/api/drive/thumbnail/1g9K8x_XYZ9876"
}</code></pre>
          </div>
        </article>

        <!-- API 4: Delete Batch -->
        <article id="api-delete-batch" class="doc-section">
          <h2 class="section-heading">4. Xóa Tệp tin Hàng loạt & Thư mục Đối tượng</h2>
          <p class="lead-desc">
            Xóa vĩnh viễn danh sách file ID và/hoặc toàn bộ thư mục của một đối tượng khi bị xóa trong database.
          </p>

          <div class="endpoint-banner">
            <div class="endpoint-info">
              <span class="badge-endpoint post">POST</span>
              <span class="endpoint-path">/api/drive/delete</span>
            </div>
            <button class="btn-copy" onclick="copyText('https://booking-system-be.iluvsunset.workers.dev/api/drive/delete')">Sao chép</button>
          </div>

          <h3 class="sub-heading">Request Body (JSON)</h3>
          <table class="vietqr-table">
            <thead>
              <tr><th>Trường</th><th>Kiểu</th><th>Mô tả</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="col-name">fileIds</span></td><td><span class="col-type">string[]</span></td><td>Danh sách các file ID Google Drive cần xóa</td></tr>
              <tr><td><span class="col-name">category</span></td><td><span class="col-type">string</span></td><td><code>properties</code> | <code>users</code></td></tr>
              <tr><td><span class="col-name">entityId</span></td><td><span class="col-type">string</span></td><td>Tên thư mục đối tượng cần xóa toàn bộ</td></tr>
            </tbody>
          </table>
        </article>

        <!-- API 5: Request OTP -->
        <article id="api-request-otp" class="doc-section">
          <h2 class="section-heading">5. Yêu cầu Gửi mã OTP Xác thực</h2>
          <p class="lead-desc">
            Tạo mã xác thực 6 chữ số ngẫu nhiên, ký token mật mã HMAC-SHA256 (thời hạn 5 phút), và gửi OTP qua Gmail SMTP TLS trực tiếp.
          </p>

          <div class="endpoint-banner">
            <div class="endpoint-info">
              <span class="badge-endpoint post">POST</span>
              <span class="endpoint-path">/api/request-otp</span>
            </div>
            <button class="btn-copy" onclick="copyText('https://booking-system-be.iluvsunset.workers.dev/api/request-otp')">Sao chép</button>
          </div>

          <div class="live-runner">
            <div class="runner-header">
              <span class="runner-title">⚡ Thử nghiệm API Trực tiếp (Live Runner)</span>
              <button class="runner-btn" onclick="runLiveOtpTest(this)">Gửi Thử Nghiệm</button>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
              Gửi yêu cầu thực tế tới Cloudflare Edge Worker và đo độ trễ mạng:
            </p>
            <div class="runner-result" id="otpTestResult"></div>
          </div>
        </article>

        <!-- API 6: Verify OTP -->
        <article id="api-verify-otp" class="doc-section">
          <h2 class="section-heading">6. Xác thực mã OTP</h2>
          <p class="lead-desc">
            Kiểm tra tính hợp lệ của mã OTP người dùng nhập đối chiếu với chữ ký mật mã trong <code>otpToken</code> mà không cần lưu trữ session ở database.
          </p>

          <div class="endpoint-banner">
            <div class="endpoint-info">
              <span class="badge-endpoint post">POST</span>
              <span class="endpoint-path">/api/verify-otp</span>
            </div>
            <button class="btn-copy" onclick="copyText('https://booking-system-be.iluvsunset.workers.dev/api/verify-otp')">Sao chép</button>
          </div>

          <h3 class="sub-heading">Request Body (JSON)</h3>
          <table class="vietqr-table">
            <thead>
              <tr><th>Trường</th><th>Kiểu</th><th>Bắt buộc</th><th>Mô tả</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="col-name">contact</span></td><td><span class="col-type">string</span></td><td><span class="badge-req">Bắt buộc</span></td><td>Email hoặc số điện thoại đã yêu cầu OTP</td></tr>
              <tr><td><span class="col-name">otp</span></td><td><span class="col-type">string</span></td><td><span class="badge-req">Bắt buộc</span></td><td>Mã 6 chữ số người dùng nhập</td></tr>
              <tr><td><span class="col-name">otpToken</span></td><td><span class="col-type">string</span></td><td><span class="badge-req">Bắt buộc</span></td><td>Token HMAC nhận được từ bước yêu cầu OTP</td></tr>
            </tbody>
          </table>
        </article>

        <!-- DATABASE SCHEMAS (11 Tables) -->
        <article id="tbl-properties" class="doc-section">
          <h2 class="section-heading">Cơ sở Dữ liệu: properties (Bất động sản & Phòng)</h2>
          <table class="vietqr-table">
            <thead>
              <tr><th>Cột</th><th>Kiểu dữ liệu</th><th>Ràng buộc</th><th>Mô tả</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="key-badge pk">PK</span> id</td><td>UUID</td><td>DEFAULT uuid_generate_v4()</td><td>Mã định danh duy nhất</td></tr>
              <tr><td>name</td><td>VARCHAR(200)</td><td>NOT NULL</td><td>Tên phòng / căn hộ</td></tr>
              <tr><td>address</td><td>TEXT</td><td>NOT NULL</td><td>Địa chỉ chi tiết</td></tr>
              <tr><td>property_type</td><td>VARCHAR(50)</td><td>DEFAULT 'apartment'</td><td>apartment, villa, room</td></tr>
              <tr><td>rental_type</td><td>VARCHAR(50)</td><td>DEFAULT 'long_term'</td><td>long_term, short_term, both</td></tr>
              <tr><td>reference_price</td><td>NUMERIC(15,2)</td><td>DEFAULT 0</td><td>Giá thuê tham chiếu (VNĐ)</td></tr>
              <tr><td>status</td><td>VARCHAR(50)</td><td>DEFAULT 'vacant'</td><td>vacant, occupied, maintenance</td></tr>
              <tr><td>photos</td><td>TEXT[]</td><td>DEFAULT ARRAY[]::TEXT[]</td><td>Mảng URL ảnh Google Drive</td></tr>
              <tr><td><span class="key-badge fk">FK</span> created_by</td><td>UUID</td><td>REFERENCES users(id)</td><td>Người tạo bản ghi</td></tr>
            </tbody>
          </table>
        </article>

        <article id="tbl-tenants" class="doc-section">
          <h2 class="section-heading">Cơ sở Dữ liệu: tenants (Khách thuê)</h2>
          <table class="vietqr-table">
            <thead>
              <tr><th>Cột</th><th>Kiểu dữ liệu</th><th>Ràng buộc</th><th>Mô tả</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="key-badge pk">PK</span> id</td><td>UUID</td><td>DEFAULT uuid_generate_v4()</td><td>Mã khách thuê</td></tr>
              <tr><td>full_name</td><td>VARCHAR(100)</td><td>NOT NULL</td><td>Họ và tên đầy đủ</td></tr>
              <tr><td>id_number</td><td>VARCHAR(20)</td><td>UNIQUE NOT NULL</td><td>Số CCCD / Hộ chiếu</td></tr>
              <tr><td>phone</td><td>VARCHAR(20)</td><td>NOT NULL</td><td>Số điện thoại liên hệ</td></tr>
              <tr><td>email</td><td>VARCHAR(200)</td><td>NULLABLE</td><td>Địa chỉ email</td></tr>
              <tr><td>permanent_address</td><td>TEXT</td><td>NULLABLE</td><td>Địa chỉ thường trú</td></tr>
            </tbody>
          </table>
        </article>

        <article id="tbl-contracts" class="doc-section">
          <h2 class="section-heading">Cơ sở Dữ liệu: contracts (Hợp đồng thuê nhà)</h2>
          <table class="vietqr-table">
            <thead>
              <tr><th>Cột</th><th>Kiểu dữ liệu</th><th>Ràng buộc</th><th>Mô tả</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="key-badge pk">PK</span> id</td><td>UUID</td><td>DEFAULT uuid_generate_v4()</td><td>Mã hợp đồng</td></tr>
              <tr><td>contract_number</td><td>VARCHAR(50)</td><td>UNIQUE NOT NULL</td><td>Số hiệu hợp đồng (HD-...)</td></tr>
              <tr><td><span class="key-badge fk">FK</span> property_id</td><td>UUID</td><td>REFERENCES properties(id) ON DELETE CASCADE</td><td>Căn hộ / phòng thuê</td></tr>
              <tr><td><span class="key-badge fk">FK</span> tenant_id</td><td>UUID</td><td>REFERENCES tenants(id) ON DELETE CASCADE</td><td>Khách thuê đại diện</td></tr>
              <tr><td>start_date / end_date</td><td>DATE</td><td>NOT NULL</td><td>Ngày bắt đầu và kết thúc</td></tr>
              <tr><td>monthly_rent</td><td>NUMERIC(15,2)</td><td>NOT NULL</td><td>Giá thuê hàng tháng (VNĐ)</td></tr>
              <tr><td>deposit</td><td>NUMERIC(15,2)</td><td>DEFAULT 0</td><td>Tiền đặt cọc hợp đồng</td></tr>
              <tr><td>status</td><td>VARCHAR(50)</td><td>DEFAULT 'active'</td><td>draft, active, expired, terminated</td></tr>
            </tbody>
          </table>
        </article>

        <article id="tbl-schedules" class="doc-section">
          <h2 class="section-heading">Cơ sở Dữ liệu: payment_schedules (Lịch thanh toán)</h2>
          <table class="vietqr-table">
            <thead>
              <tr><th>Cột</th><th>Kiểu dữ liệu</th><th>Ràng buộc</th><th>Mô tả</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="key-badge pk">PK</span> id</td><td>UUID</td><td>DEFAULT uuid_generate_v4()</td><td>Mã kỳ thanh toán</td></tr>
              <tr><td><span class="key-badge fk">FK</span> contract_id</td><td>UUID</td><td>REFERENCES contracts(id) ON DELETE CASCADE</td><td>Hợp đồng liên kết</td></tr>
              <tr><td>period_month / year</td><td>SMALLINT</td><td>NOT NULL</td><td>Tháng và Năm kỳ thu</td></tr>
              <tr><td>amount_due</td><td>NUMERIC(15,2)</td><td>NOT NULL</td><td>Số tiền phải trả kỳ này</td></tr>
              <tr><td>due_date</td><td>DATE</td><td>NOT NULL</td><td>Hạn cuối thanh toán</td></tr>
              <tr><td>status</td><td>VARCHAR(50)</td><td>DEFAULT 'pending'</td><td>pending, paid, overdue</td></tr>
              <tr><td>receipt_url</td><td>TEXT</td><td>NULLABLE</td><td>URL ảnh biên lai thanh toán (Drive)</td></tr>
            </tbody>
          </table>
        </article>

        <!-- HTTP ERROR CODES -->
        <article id="section-error-codes" class="doc-section">
          <h2 class="section-heading">Mã lỗi & Trạng thái HTTP (Error Reference)</h2>
          <table class="vietqr-table">
            <thead>
              <tr><th>Status Code</th><th>Mã lỗi</th><th>Mô tả nguyên nhân</th></tr>
            </thead>
            <tbody>
              <tr><td><code>200 OK</code></td><td>SUCCESS</td><td>Yêu cầu xử lý thành công</td></tr>
              <tr><td><code>206 Partial Content</code></td><td>STREAM_RANGE</td><td>Trả về phân đoạn byte của luồng media</td></tr>
              <tr><td><code>400 Bad Request</code></td><td>INVALID_PARAMS</td><td>Thiếu hoặc sai định dạng payload / header</td></tr>
              <tr><td><code>401 Unauthorized</code></td><td>AUTH_FAILED</td><td>Mã OTP hoặc token không hợp lệ hoặc đã hết hạn</td></tr>
              <tr><td><code>404 Not Found</code></td><td>NOT_FOUND</td><td>Không tìm thấy tệp tin hoặc bản ghi database</td></tr>
              <tr><td><code>500 Server Error</code></td><td>DRIVE_ERROR</td><td>Lỗi kết nối Google Drive API hoặc SMTP Server</td></tr>
            </tbody>
          </table>
        </article>

      </div>
    </main>

  </div>

  <script>
    function copyBaseUrl() {
      navigator.clipboard.writeText('https://booking-system-be.iluvsunset.workers.dev');
      alert('Đã sao chép Base URL: https://booking-system-be.iluvsunset.workers.dev');
    }

    function copyText(txt) {
      navigator.clipboard.writeText(txt);
      alert('Đã sao chép: ' + txt);
    }

    function copySnippet(btn) {
      const code = btn.closest('.code-box').querySelector('pre code').innerText;
      navigator.clipboard.writeText(code);
      btn.innerText = '✓ Đã chép';
      setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
    }

    async function runLiveOtpTest(btn) {
      const resBox = document.getElementById('otpTestResult');
      resBox.style.display = 'block';
      resBox.innerText = 'Đang gửi yêu cầu tới Cloudflare Edge...';
      btn.disabled = true;

      try {
        const start = performance.now();
        const res = await fetch('/api/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: 'bao.h0146824@gmail.com' })
        });
        const elapsed = Math.round(performance.now() - start);
        const data = await res.json();
        resBox.innerText = \`// HTTP Status: \${res.status} OK (\${elapsed}ms)\n\` + JSON.stringify(data, null, 2);
      } catch (err) {
        resBox.innerText = '// Error: ' + err.message;
      } finally {
        btn.disabled = false;
      }
    }

    // Instant Search
    document.getElementById('docSearch').addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.article-wrapper article').forEach(art => {
        const txt = art.innerText.toLowerCase();
        art.style.display = txt.includes(query) ? 'block' : 'none';
      });
    });
  </script>
</body>
</html>
`;
