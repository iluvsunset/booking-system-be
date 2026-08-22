import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

export const DEFAULT_ROOT_FOLDER_ID = '1nXSUrLoiR_SUV9Ethl5AqP6M_Xfjwl6g';

// Memory cache for folder IDs to eliminate redundant API lookups
const folderCache = new Map();

/**
 * Extracts raw Google Drive folder ID from full URLs or raw strings
 */
export function extractFolderId(input) {
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
export function sanitizeFolderSegment(name, fallback = 'general') {
  if (!name && name !== 0) return fallback;
  const str = String(name).trim();
  if (!str) return fallback;
  const sanitized = str.replace(/[/\\?%*:|"<>]/g, '_').trim();
  return sanitized || fallback;
}

/**
 * Initializes Google Drive API client using either:
 * 1. Local credentials file: service-account.json or booking-system-*.json
 * 2. Environment variable GOOGLE_SERVICE_ACCOUNT_JSON / GOOGLE_SERVICE_ACCOUNT_KEY
 * 3. OAuth2 refresh token credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)
 */
export function getDriveClient() {
  let auth;

  // 1. Check env variable for Service Account JSON
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    try {
      const credentials = typeof rawKey === 'string' ? JSON.parse(rawKey) : rawKey;
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive']
      });
      return google.drive({ version: 'v3', auth });
    } catch (err) {
      console.warn('[GoogleDrive] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON env:', err.message);
    }
  }

  // 2. Check local files in working directory
  const keyFiles = ['service-account.json', 'booking-system-504917-873cbd7ed9a8.json'];
  for (const kf of keyFiles) {
    const localKeyPath = path.resolve(process.cwd(), kf);
    if (fs.existsSync(localKeyPath)) {
      try {
        auth = new google.auth.GoogleAuth({
          keyFile: localKeyPath,
          scopes: ['https://www.googleapis.com/auth/drive']
        });
        return google.drive({ version: 'v3', auth });
      } catch (err) {
        console.warn(`[GoogleDrive] Failed to load local ${kf}:`, err.message);
      }
    }
  }

  // 3. Check OAuth 2.0 User credentials
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.VITE_GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || process.env.VITE_GOOGLE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      return google.drive({ version: 'v3', auth: oauth2Client });
    } catch (oauthErr) {
      console.warn('[GoogleDrive] Failed to initialize OAuth2 Drive client:', oauthErr.message);
    }
  }

  return null;
}

const folderInflight = new Map();

/**
 * Find or create a folder inside a parent folder in Google Drive with in-memory caching and inflight deduplication
 */
export async function findOrCreateFolder(drive, folderName, parentId = null) {
  const cleanName = sanitizeFolderSegment(folderName);
  const cacheKey = `${parentId || 'root'}:${cleanName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey);
  }
  if (folderInflight.has(cacheKey)) {
    return folderInflight.get(cacheKey);
  }

  const creationPromise = (async () => {
    const escapedName = cleanName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    let q = `mimeType='application/vnd.google-apps.folder' and name='${escapedName}' and trashed=false`;
    if (parentId) {
      q += ` and '${parentId}' in parents`;
    }

    try {
      const res = await drive.files.list({
        q,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

      if (res.data.files && res.data.files.length > 0) {
        const existingId = res.data.files[0].id;
        folderCache.set(cacheKey, existingId);
        return existingId;
      }

      // Create new folder
      const fileMetadata = {
        name: cleanName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : []
      };

      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
        supportsAllDrives: true
      });

      const newId = folder.data.id;
      folderCache.set(cacheKey, newId);
      return newId;
    } catch (err) {
      console.error(`[GoogleDrive] Error findOrCreateFolder (${cleanName}):`, err.message);
      throw err;
    }
  })();

  folderInflight.set(cacheKey, creationPromise);
  try {
    return await creationPromise;
  } finally {
    folderInflight.delete(cacheKey);
  }
}

/**
 * Resolves deeply nested folder paths sequentially in Google Drive inside root folder
 */
export async function findOrCreateFolderPath(drive, pathSegments, rootId) {
  let currentParentId = rootId;
  for (const segment of pathSegments) {
    const cleanName = sanitizeFolderSegment(segment);
    if (!cleanName) continue;
    currentParentId = await findOrCreateFolder(drive, cleanName, currentParentId);
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
export async function resolveTargetFolder(drive, {
  folderPath = null,
  folderType = 'Images',
  userEmail = 'general',
  category = null,
  subCategory = null,
  entityId = null,
  period = null,
  rootFolderId = null
}) {
  const rawRoot = rootFolderId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || process.env.DRIVE_ROOT_FOLDER_ID || DEFAULT_ROOT_FOLDER_ID;
  let rootId = extractFolderId(rawRoot) || DEFAULT_ROOT_FOLDER_ID;

  // 1. Direct explicit structured path array provided
  if (Array.isArray(folderPath) && folderPath.length > 0) {
    return await findOrCreateFolderPath(drive, folderPath, rootId);
  }

  const userIdentifier = sanitizeFolderSegment(userEmail || 'general');

  // 2. Structured Category logic
  if (category === 'properties') {
    const propFolder = sanitizeFolderSegment(entityId || 'General_Property');
    return await findOrCreateFolderPath(drive, ['Properties', propFolder, 'Images'], rootId);
  }

  if (category === 'users') {
    if (subCategory === 'identification') {
      return await findOrCreateFolderPath(drive, ['Users', userIdentifier, 'Identification'], rootId);
    }
    if (subCategory === 'contracts') {
      const contractSub = sanitizeFolderSegment(entityId || 'general');
      const innerFolder = folderType === 'Files' ? 'Files' : 'Images';
      return await findOrCreateFolderPath(drive, ['Users', userIdentifier, 'Contracts', contractSub, innerFolder], rootId);
    }
    if (subCategory === 'payments') {
      const payPeriod = sanitizeFolderSegment(period || 'General_Period');
      return await findOrCreateFolderPath(drive, ['Users', userIdentifier, 'Payments', payPeriod], rootId);
    }
    const innerFolder = folderType === 'Files' ? 'Files' : 'Images';
    return await findOrCreateFolderPath(drive, ['Users', userIdentifier, innerFolder], rootId);
  }

  // Fallback: Legacy Files/Images organization
  const subFolderId = await findOrCreateFolder(drive, folderType === 'Files' ? 'Files' : 'Images', rootId);
  const userFolderId = await findOrCreateFolder(drive, userIdentifier, subFolderId);
  return userFolderId;
}

/**
 * Upload buffer or stream to Google Drive
 */
export async function uploadToDrive({
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
  requestOrigin = 'http://localhost:3001'
}) {
  const drive = getDriveClient();
  if (!drive) {
    throw new Error('Google Drive API client is not configured. Please supply GOOGLE_SERVICE_ACCOUNT_JSON, service-account.json or OAuth credentials.');
  }

  const targetFolderId = await resolveTargetFolder(drive, {
    folderPath,
    folderType,
    userEmail,
    category,
    subCategory,
    entityId,
    period
  });

  // Prepare stream from buffer
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);

  const fileMetadata = {
    name: filename || `upload_${Date.now()}`,
    parents: [targetFolderId]
  };

  const media = {
    mimeType: mimeType || 'application/octet-stream',
    body: readable
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink, webContentLink, thumbnailLink',
    supportsAllDrives: true
  });

  const fileData = response.data;
  const fileId = fileData.id;

  // Make file readable via link
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      },
      supportsAllDrives: true
    });
  } catch (permErr) {
    console.warn('[GoogleDrive] Could not set public link permission:', permErr.message);
  }

  const originBase = requestOrigin || 'http://localhost:3001';
  const proxyUrl = `${originBase}/api/drive/file/${fileId}`;
  const thumbnailProxyUrl = `${originBase}/api/drive/thumbnail/${fileId}`;
  const directLink = `https://lh3.googleusercontent.com/d/${fileId}`;
  const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

  return {
    success: true,
    fileId,
    name: fileData.name,
    url: proxyUrl,
    proxyUrl,
    thumbnailUrl: thumbnailProxyUrl,
    directLink,
    webViewLink,
    webContentLink: fileData.webContentLink || proxyUrl,
    thumbnailLink: fileData.thumbnailLink || thumbnailProxyUrl
  };
}

/**
 * Streams a file from Google Drive with optional Range header support
 */
export async function getFileStream(fileId, range = null) {
  const drive = getDriveClient();
  if (!drive) {
    throw new Error('Google Drive API client is not configured.');
  }

  const reqOptions = {
    responseType: 'stream',
    headers: {}
  };
  if (range) {
    reqOptions.headers['Range'] = range;
  }

  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    reqOptions
  );

  return {
    stream: res.data,
    status: res.status,
    headers: res.headers,
    contentType: res.headers['content-type'] || 'application/octet-stream',
    contentLength: res.headers['content-length'],
    contentRange: res.headers['content-range']
  };
}

/**
 * Fetches thumbnail stream from Google Drive with dynamic sizing
 */
export async function getThumbnailStream(fileId, sz = 's400') {
  const drive = getDriveClient();
  if (!drive) {
    throw new Error('Google Drive API client is not configured.');
  }

  // 1. Get file metadata
  const metaRes = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, thumbnailLink',
    supportsAllDrives: true
  });

  const metaData = metaRes.data;

  // 2. Fetch thumbnailLink if available
  if (metaData.thumbnailLink) {
    let thumbUrl = metaData.thumbnailLink;
    if (thumbUrl.includes('=')) {
      thumbUrl = thumbUrl.replace(/=[^=]*$/, `=${sz}`);
    } else {
      thumbUrl = `${thumbUrl}=${sz}`;
    }

    try {
      const fetchRes = await fetch(thumbUrl);
      if (fetchRes.ok) {
        return {
          stream: Readable.fromWeb(fetchRes.body),
          status: 200,
          contentType: fetchRes.headers.get('content-type') || 'image/jpeg',
          contentLength: fetchRes.headers.get('content-length')
        };
      }
    } catch (fetchErr) {
      console.warn('[GoogleDrive] Failed to fetch thumbnail URL, falling back to direct stream:', fetchErr.message);
    }
  }

  // 3. Fallback to raw file media stream
  return await getFileStream(fileId);
}

/**
 * Share root folder with Google Group email for automatic manager access
 */
export async function shareRootWithGoogleGroup(groupEmail, role = 'writer') {
  const drive = getDriveClient();
  if (!drive) throw new Error('Drive not configured');

  const rootId = extractFolderId(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID) || DEFAULT_ROOT_FOLDER_ID;

  const res = await drive.permissions.create({
    fileId: rootId,
    requestBody: {
      role, // 'writer' (can edit/upload) or 'reader'
      type: 'group',
      emailAddress: groupEmail
    },
    fields: 'id',
    supportsAllDrives: true
  });

  return { success: true, permissionId: res.data.id, rootFolderId: rootId };
}
