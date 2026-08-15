/**
 * Unit & Integration Test Suite for Worker M1
 * Tests:
 * 1. Root Folder Configuration
 * 2. Structured Drive Hierarchy & Unicode Vietnamese Sanitization
 * 3. Resilient File Streaming Endpoint (GET /api/drive/file/:fileId) with Range & 401 Retry
 * 4. Thumbnail Proxy Endpoint (GET /api/drive/thumbnail/:fileId) with ?sz= param & Caching
 * 5. Local Server Parity & googleDriveService exports
 */

import assert from 'assert';
import worker from '../src/worker.js';
import {
  DEFAULT_ROOT_FOLDER_ID,
  sanitizeFolderSegment,
  extractFolderId
} from '../services/googleDriveService.js';

let passed = 0;
let total = 0;

function it(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}:`, err.message);
    throw err;
  }
}

async function itAsync(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}:`, err.message);
    throw err;
  }
}

console.log('=== Starting Worker M1 Test Suite ===\n');

// 1. Root Folder & ID Extraction Tests
console.log('[Suite 1: Root Folder & ID Extraction]');
it('DEFAULT_ROOT_FOLDER_ID is set to 1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g', () => {
  assert.strictEqual(DEFAULT_ROOT_FOLDER_ID, '1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g');
});

it('extractFolderId extracts raw ID from full URL, query param or raw ID string', () => {
  assert.strictEqual(extractFolderId('https://drive.google.com/drive/folders/1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g'), '1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g');
  assert.strictEqual(extractFolderId('https://drive.google.com/open?id=1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g'), '1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g');
  assert.strictEqual(extractFolderId('1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g'), '1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g');
  assert.strictEqual(extractFolderId(null), null);
});

// 2. Unicode Vietnamese Preservation & Path Sanitization Tests
console.log('\n[Suite 2: Unicode Vietnamese Preservation & Path Sanitization]');
it('sanitizeFolderSegment preserves Unicode Vietnamese diacritics', () => {
  const vnName = 'Nguyễn Văn Ánh';
  assert.strictEqual(sanitizeFolderSegment(vnName), 'Nguyễn Văn Ánh');
  
  const vnPeriod = 'Kỳ thanh toán 08/2026';
  assert.strictEqual(sanitizeFolderSegment(vnPeriod), 'Kỳ thanh toán 08_2026');

  const vnProperty = 'Căn hộ Cao Cấp Sun Grand City';
  assert.strictEqual(sanitizeFolderSegment(vnProperty), 'Căn hộ Cao Cấp Sun Grand City');
});

it('sanitizeFolderSegment replaces filesystem prohibited characters [/\\?%*:|"<>]/g with _', () => {
  const raw = 'test/path\\with?invalid%chars*and:quotes"and|pipes<and>angles';
  const sanitized = sanitizeFolderSegment(raw);
  assert.strictEqual(sanitized, 'test_path_with_invalid_chars_and_quotes_and_pipes_and_angles');
});

it('sanitizeFolderSegment handles empty or fallback values', () => {
  assert.strictEqual(sanitizeFolderSegment(null, 'default_val'), 'default_val');
  assert.strictEqual(sanitizeFolderSegment('', 'general'), 'general');
});

// 3. Worker CORS & Endpoint Verification
console.log('\n[Suite 3: Worker CORS & Status Endpoints]');
await itAsync('Worker responds to OPTIONS with 204 and CORS headers', async () => {
  const req = new Request('http://localhost/api/drive/file/12345', { method: 'OPTIONS' });
  const res = await worker.fetch(req, {});
  assert.strictEqual(res.status, 204);
  assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*');
  assert.strictEqual(res.headers.get('Access-Control-Allow-Methods'), 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
});

await itAsync('Worker root GET returns 200 with rootFolderId', async () => {
  const req = new Request('http://localhost/', { method: 'GET' });
  const res = await worker.fetch(req, {});
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'Booking System BE Worker Running');
  assert.strictEqual(data.rootFolderId, '1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g');
  assert.ok(Array.isArray(data.endpoints));
  assert.ok(data.endpoints.includes('GET /api/drive/file/:fileId'));
  assert.ok(data.endpoints.includes('GET /api/drive/thumbnail/:fileId'));
});

// 4. File Streaming Endpoint (GET /api/drive/file/:fileId)
console.log('\n[Suite 4: File Streaming Endpoint (GET /api/drive/file/:fileId)]');
await itAsync('Missing file ID returns 400 JSON', async () => {
  const req = new Request('http://localhost/api/drive/file/', { method: 'GET' });
  const res = await worker.fetch(req, {});
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.success, false);
  assert.ok(data.error.includes('Missing'));
});

await itAsync('Streaming endpoint returns 200 with Cache-Control and Content-Type on successful fetch', async () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: 'test_client',
    GOOGLE_CLIENT_SECRET: 'test_secret',
    GOOGLE_REFRESH_TOKEN: 'test_refresh'
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const urlStr = String(url);
    if (urlStr.includes('oauth2.googleapis.com/token')) {
      return new Response(JSON.stringify({ access_token: 'mock_token_123', expires_in: 3600 }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files/file_abc?alt=media')) {
      return new Response('Mock file binary content', {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': '24'
        }
      });
    }
    return originalFetch(url, opts);
  };

  try {
    const req = new Request('http://localhost/api/drive/file/file_abc', { method: 'GET' });
    const res = await worker.fetch(req, mockEnv);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('Content-Type'), 'image/jpeg');
    assert.strictEqual(res.headers.get('Accept-Ranges'), 'bytes');
    assert.strictEqual(res.headers.get('Cache-Control'), 'public, max-age=86400, stale-while-revalidate=604800');
    assert.strictEqual(res.headers.get('Access-Control-Allow-Origin'), '*');
    const text = await res.text();
    assert.strictEqual(text, 'Mock file binary content');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await itAsync('Streaming endpoint handles HTTP HEAD method with 200/headers and empty body', async () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: 'test_client',
    GOOGLE_CLIENT_SECRET: 'test_secret',
    GOOGLE_REFRESH_TOKEN: 'test_refresh'
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const urlStr = String(url);
    if (urlStr.includes('oauth2.googleapis.com/token')) {
      return new Response(JSON.stringify({ access_token: 'mock_token_123', expires_in: 3600 }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files/file_abc?alt=media')) {
      return new Response('Mock file binary content', {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': '24'
        }
      });
    }
    return originalFetch(url, opts);
  };

  try {
    const req = new Request('http://localhost/api/drive/file/file_abc', { method: 'HEAD' });
    const res = await worker.fetch(req, mockEnv);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('Content-Type'), 'image/jpeg');
    assert.strictEqual(res.headers.get('Accept-Ranges'), 'bytes');
    assert.strictEqual(res.headers.get('Cache-Control'), 'public, max-age=86400, stale-while-revalidate=604800');
    assert.strictEqual(res.headers.get('Content-Length'), '24');
    const text = await res.text();
    assert.strictEqual(text, '', 'HEAD response body must be empty');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await itAsync('Streaming endpoint handles HTTP Range header with 206 Partial Content', async () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: 'test_client',
    GOOGLE_CLIENT_SECRET: 'test_secret',
    GOOGLE_REFRESH_TOKEN: 'test_refresh'
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const urlStr = String(url);
    if (urlStr.includes('oauth2.googleapis.com/token')) {
      return new Response(JSON.stringify({ access_token: 'mock_token_123', expires_in: 3600 }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files/file_range?alt=media')) {
      assert.strictEqual(opts.headers.get('Range'), 'bytes=0-100');
      return new Response('Partial bytes content', {
        status: 206,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Range': 'bytes 0-100/5000',
          'Content-Length': '21'
        }
      });
    }
    return originalFetch(url, opts);
  };

  try {
    const req = new Request('http://localhost/api/drive/file/file_range', {
      method: 'GET',
      headers: { Range: 'bytes=0-100' }
    });
    const res = await worker.fetch(req, mockEnv);
    assert.strictEqual(res.status, 206);
    assert.strictEqual(res.headers.get('Content-Type'), 'application/pdf');
    assert.strictEqual(res.headers.get('Content-Range'), 'bytes 0-100/5000');
    assert.strictEqual(res.headers.get('Accept-Ranges'), 'bytes');
    assert.strictEqual(res.headers.get('Cache-Control'), 'public, max-age=86400, stale-while-revalidate=604800');
    const text = await res.text();
    assert.strictEqual(text, 'Partial bytes content');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await itAsync('Streaming endpoint retries once on 401 Unauthorized with fresh token', async () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: 'test_client',
    GOOGLE_CLIENT_SECRET: 'test_secret',
    GOOGLE_REFRESH_TOKEN: 'test_refresh'
  };

  let tokenRequests = 0;
  let fileRequests = 0;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const urlStr = String(url);
    if (urlStr.includes('oauth2.googleapis.com/token')) {
      tokenRequests++;
      return new Response(JSON.stringify({ access_token: `token_${tokenRequests}`, expires_in: 3600 }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files/file_401_test?alt=media')) {
      fileRequests++;
      if (fileRequests === 1) {
        return new Response('Unauthorized', { status: 401 });
      }
      return new Response('File recovered after 401 retry', {
        status: 200,
        headers: { 'Content-Type': 'image/png' }
      });
    }
    return originalFetch(url, opts);
  };

  try {
    const req = new Request('http://localhost/api/drive/file/file_401_test', { method: 'GET' });
    const res = await worker.fetch(req, mockEnv);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(fileRequests, 2, 'Should have retried the file request');
    assert.ok(tokenRequests >= 1, 'Should have fetched a token during retry');
    const text = await res.text();
    assert.strictEqual(text, 'File recovered after 401 retry');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await itAsync('Streaming endpoint returns 404 JSON when file is not found on Google Drive', async () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: 'test_client',
    GOOGLE_CLIENT_SECRET: 'test_secret',
    GOOGLE_REFRESH_TOKEN: 'test_refresh'
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const urlStr = String(url);
    if (urlStr.includes('oauth2.googleapis.com/token')) {
      return new Response(JSON.stringify({ access_token: 'token_mock', expires_in: 3600 }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files/file_missing?alt=media')) {
      return new Response('Not Found', { status: 404 });
    }
    return originalFetch(url, opts);
  };

  try {
    const req = new Request('http://localhost/api/drive/file/file_missing', { method: 'GET' });
    const res = await worker.fetch(req, mockEnv);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'File not found on Google Drive');
    assert.strictEqual(data.fileId, 'file_missing');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// 5. Thumbnail Proxy Endpoint (GET /api/drive/thumbnail/:fileId)
console.log('\n[Suite 5: Thumbnail Proxy Endpoint (GET /api/drive/thumbnail/:fileId)]');
await itAsync('Thumbnail endpoint with ?sz= modifies thumbnailLink and streams image', async () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: 'test_client',
    GOOGLE_CLIENT_SECRET: 'test_secret',
    GOOGLE_REFRESH_TOKEN: 'test_refresh'
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const urlStr = String(url);
    if (urlStr.includes('oauth2.googleapis.com/token')) {
      return new Response(JSON.stringify({ access_token: 'token_mock', expires_in: 3600 }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files/thumb_123?fields=')) {
      return new Response(JSON.stringify({
        id: 'thumb_123',
        mimeType: 'image/jpeg',
        thumbnailLink: 'https://lh3.googleusercontent.com/drive-thumb=s220'
      }), { status: 200 });
    }
    if (urlStr === 'https://lh3.googleusercontent.com/drive-thumb=s600') {
      return new Response('Mock resized thumbnail binary', {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' }
      });
    }
    return originalFetch(url, opts);
  };

  try {
    const req = new Request('http://localhost/api/drive/thumbnail/thumb_123?sz=s600', { method: 'GET' });
    const res = await worker.fetch(req, mockEnv);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('Content-Type'), 'image/jpeg');
    assert.strictEqual(res.headers.get('Cache-Control'), 'public, max-age=604800, stale-while-revalidate=86400');
    const text = await res.text();
    assert.strictEqual(text, 'Mock resized thumbnail binary');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await itAsync('Thumbnail endpoint falls back to media stream when thumbnailLink is missing', async () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: 'test_client',
    GOOGLE_CLIENT_SECRET: 'test_secret',
    GOOGLE_REFRESH_TOKEN: 'test_refresh'
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const urlStr = String(url);
    if (urlStr.includes('oauth2.googleapis.com/token')) {
      return new Response(JSON.stringify({ access_token: 'token_mock', expires_in: 3600 }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files/file_no_thumb?fields=')) {
      return new Response(JSON.stringify({
        id: 'file_no_thumb',
        mimeType: 'image/png'
      }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files/file_no_thumb?alt=media')) {
      return new Response('Mock fallback media binary', {
        status: 200,
        headers: { 'Content-Type': 'image/png' }
      });
    }
    return originalFetch(url, opts);
  };

  try {
    const req = new Request('http://localhost/api/drive/thumbnail/file_no_thumb', { method: 'GET' });
    const res = await worker.fetch(req, mockEnv);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('Content-Type'), 'image/png');
    assert.strictEqual(res.headers.get('Cache-Control'), 'public, max-age=604800, stale-while-revalidate=86400');
    const text = await res.text();
    assert.strictEqual(text, 'Mock fallback media binary');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

await itAsync('Thumbnail endpoint handles HTTP HEAD method with 200/headers and empty body', async () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: 'test_client',
    GOOGLE_CLIENT_SECRET: 'test_secret',
    GOOGLE_REFRESH_TOKEN: 'test_refresh'
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const urlStr = String(url);
    if (urlStr.includes('oauth2.googleapis.com/token')) {
      return new Response(JSON.stringify({ access_token: 'token_mock', expires_in: 3600 }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files/thumb_head_123?fields=')) {
      return new Response(JSON.stringify({
        id: 'thumb_head_123',
        mimeType: 'image/jpeg',
        thumbnailLink: 'https://lh3.googleusercontent.com/drive-thumb=s220'
      }), { status: 200 });
    }
    if (urlStr.includes('https://lh3.googleusercontent.com/drive-thumb')) {
      return new Response('Mock thumbnail content', {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '22' }
      });
    }
    return originalFetch(url, opts);
  };

  try {
    const req = new Request('http://localhost/api/drive/thumbnail/thumb_head_123?sz=s800', { method: 'HEAD' });
    const res = await worker.fetch(req, mockEnv);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('Content-Type'), 'image/jpeg');
    assert.strictEqual(res.headers.get('Cache-Control'), 'public, max-age=604800, stale-while-revalidate=86400');
    assert.strictEqual(res.headers.get('Content-Length'), '22');
    const text = await res.text();
    assert.strictEqual(text, '', 'HEAD response body must be empty');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// 6. Hierarchy Resolution Simulation
console.log('\n[Suite 6: Multi-Tier Folder Hierarchy Resolution]');
await itAsync('Structured upload creates path for Users identification, contracts, payments, and properties', async () => {
  const mockEnv = {
    GOOGLE_CLIENT_ID: 'test_client',
    GOOGLE_CLIENT_SECRET: 'test_secret',
    GOOGLE_REFRESH_TOKEN: 'test_refresh',
    GOOGLE_DRIVE_ROOT_FOLDER_ID: '1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g'
  };

  const createdFolders = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    const urlStr = String(url);
    if (urlStr.includes('oauth2.googleapis.com/token')) {
      return new Response(JSON.stringify({ access_token: 'token_mock', expires_in: 3600 }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files?q=')) {
      // Return empty to trigger create
      return new Response(JSON.stringify({ files: [] }), { status: 200 });
    }
    if (urlStr.includes('googleapis.com/drive/v3/files?supportsAllDrives=true') && opts.method === 'POST') {
      const body = JSON.parse(opts.body);
      createdFolders.push(body);
      return new Response(JSON.stringify({ id: `folder_${body.name}_${Date.now()}` }), { status: 200 });
    }
    if (urlStr.includes('upload/drive/v3/files?uploadType=multipart')) {
      return new Response(JSON.stringify({
        id: 'new_file_id_999',
        name: 'test.jpg',
        webViewLink: 'https://drive.google.com/file/d/new_file_id_999/view'
      }), { status: 200 });
    }
    if (urlStr.includes('/permissions')) {
      return new Response(JSON.stringify({ id: 'perm_123' }), { status: 200 });
    }
    return originalFetch(url, opts);
  };

  try {
    // 1. Upload for user identification
    const idReq = new Request('http://localhost/api/upload', {
      method: 'POST',
      headers: {
        'x-file-name': encodeURIComponent('cccd_front.jpg'),
        'x-file-mime': 'image/jpeg',
        'x-category': 'users',
        'x-sub-category': 'identification',
        'x-user-email': encodeURIComponent('tenant@example.com')
      },
      body: new Uint8Array([1, 2, 3, 4])
    });
    const idRes = await worker.fetch(idReq, mockEnv);
    assert.strictEqual(idRes.status, 200);
    const idData = await idRes.json();
    assert.strictEqual(idData.success, true);
    assert.strictEqual(idData.fileId, 'new_file_id_999');
    assert.strictEqual(idData.proxyUrl, 'http://localhost/api/drive/file/new_file_id_999');
    assert.strictEqual(idData.thumbnailUrl, 'http://localhost/api/drive/thumbnail/new_file_id_999');

    // 2. Upload for contract files
    const contractReq = new Request('http://localhost/api/upload', {
      method: 'POST',
      headers: {
        'x-file-name': encodeURIComponent('contract_scan.pdf'),
        'x-file-mime': 'application/pdf',
        'x-category': 'users',
        'x-sub-category': 'contracts',
        'x-entity-id': encodeURIComponent('HD-2026-001'),
        'x-folder-type': 'Files',
        'x-user-email': encodeURIComponent('tenant@example.com')
      },
      body: new Uint8Array([5, 6, 7, 8])
    });
    const contractRes = await worker.fetch(contractReq, mockEnv);
    assert.strictEqual(contractRes.status, 200);

    // 3. Upload for payment proof
    const paymentReq = new Request('http://localhost/api/upload', {
      method: 'POST',
      headers: {
        'x-file-name': encodeURIComponent('receipt.png'),
        'x-file-mime': 'image/png',
        'x-category': 'users',
        'x-sub-category': 'payments',
        'x-period': encodeURIComponent('Kỳ thanh toán 08/2026'),
        'x-user-email': encodeURIComponent('tenant@example.com')
      },
      body: new Uint8Array([9, 10, 11])
    });
    const paymentRes = await worker.fetch(paymentReq, mockEnv);
    assert.strictEqual(paymentRes.status, 200);

    // 4. Upload for property gallery
    const propReq = new Request('http://localhost/api/upload', {
      method: 'POST',
      headers: {
        'x-file-name': encodeURIComponent('livingroom.jpg'),
        'x-file-mime': 'image/jpeg',
        'x-category': 'properties',
        'x-entity-id': encodeURIComponent('Penthouse_Sun_Grand_City_p123')
      },
      body: new Uint8Array([12, 13, 14])
    });
    const propRes = await worker.fetch(propReq, mockEnv);
    assert.strictEqual(propRes.status, 200);

    const allFolderNames = createdFolders.map(f => f.name);
    assert.ok(allFolderNames.includes('Contracts'), 'Hierarchy should include Contracts');
    assert.ok(allFolderNames.includes('HD-2026-001'), 'Hierarchy should include contract ID');
    assert.ok(allFolderNames.includes('Files'), 'Hierarchy should include Files');
    assert.ok(allFolderNames.includes('Payments'), 'Hierarchy should include Payments');
    assert.ok(allFolderNames.includes('Kỳ thanh toán 08_2026'), 'Hierarchy should sanitize and include payment period');
    assert.ok(allFolderNames.includes('Properties'), 'Hierarchy should include Properties');
    assert.ok(allFolderNames.includes('Penthouse_Sun_Grand_City_p123'), 'Hierarchy should include property folder');
    assert.ok(allFolderNames.includes('Images'), 'Hierarchy should include Images');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// 7. Local Node.js googleDriveService Parity Tests
console.log('\n[Suite 7: Local googleDriveService Parity]');
await itAsync('googleDriveService resolveTargetFolder builds correct path hierarchy', async () => {
  const { resolveTargetFolder } = await import('../services/googleDriveService.js');
  
  const createdFolders = [];
  const mockDrive = {
    files: {
      list: async () => ({ data: { files: [] } }),
      create: async ({ requestBody }) => {
        createdFolders.push(requestBody);
        return { data: { id: `mock_node_folder_${requestBody.name}` } };
      }
    }
  };

  await resolveTargetFolder(mockDrive, {
    category: 'users',
    subCategory: 'contracts',
    entityId: 'HD-999',
    folderType: 'Images',
    userEmail: 'bao.h0146824@gmail.com'
  });

  const names = createdFolders.map(f => f.name);
  assert.ok(names.includes('Users'));
  assert.ok(names.includes('bao.h0146824@gmail.com'));
  assert.ok(names.includes('Contracts'));
  assert.ok(names.includes('HD-999'));
  assert.ok(names.includes('Images'));
});

console.log(`\n=== All ${passed}/${total} Tests Passed Successfully! ===`);

