import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

// Memory cache for folder IDs to eliminate redundant API lookups
const folderCache = new Map();

/**
 * Initializes Google Drive API client using either:
 * 1. Environment variable GOOGLE_SERVICE_ACCOUNT_JSON / GOOGLE_SERVICE_ACCOUNT_KEY
 * 2. Local credentials file: service-account.json
 * 3. Default Application Credentials / API Key
 */
function getDriveClient() {
  let auth;

  // Check env variable for JSON string
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    try {
      const credentials = typeof rawKey === 'string' ? JSON.parse(rawKey) : rawKey;
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive']
      });
    } catch (err) {
      console.warn('[GoogleDrive] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON env:', err.message);
    }
  }

  // Check local file service-account.json
  if (!auth) {
    const localKeyPath = path.resolve(process.cwd(), 'service-account.json');
    if (fs.existsSync(localKeyPath)) {
      try {
        auth = new google.auth.GoogleAuth({
          keyFile: localKeyPath,
          scopes: ['https://www.googleapis.com/auth/drive']
        });
      } catch (err) {
        console.warn('[GoogleDrive] Failed to load local service-account.json:', err.message);
      }
    }
  }

  if (!auth) {
    return null;
  }

  return google.drive({ version: 'v3', auth });
}

/**
 * Find or create a folder inside a parent folder in Google Drive
 */
async function findOrCreateFolder(drive, folderName, parentId = null) {
  const cacheKey = `${parentId || 'root'}:${folderName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey);
  }

  // Build query
  let q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }

  try {
    const res = await drive.files.list({
      q,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (res.data.files && res.data.files.length > 0) {
      const existingId = res.data.files[0].id;
      folderCache.set(cacheKey, existingId);
      return existingId;
    }

    // Create new folder
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : []
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id'
    });

    const newId = folder.data.id;
    folderCache.set(cacheKey, newId);
    return newId;
  } catch (err) {
    console.error(`[GoogleDrive] Error findOrCreateFolder (${folderName}):`, err.message);
    throw err;
  }
}

/**
 * Resolves the structured folder path in Google Drive:
 * "Booking System Drive" -> "Images" | "Files" -> "{user_email}"
 */
async function resolveTargetFolder(drive, folderType = 'Images', userEmail = 'general') {
  const cleanEmail = (userEmail || 'general').trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
  
  // 1. Root folder: "Booking System Drive"
  const rootId = await findOrCreateFolder(drive, 'Booking System Drive', null);

  // 2. Sub folder: "Images" or "Files"
  const subFolderId = await findOrCreateFolder(drive, folderType === 'Files' ? 'Files' : 'Images', rootId);

  // 3. User folder: "{user_email}"
  const userFolderId = await findOrCreateFolder(drive, cleanEmail, subFolderId);

  return userFolderId;
}

/**
 * Upload buffer or stream to Google Drive
 */
export async function uploadToDrive({ buffer, filename, mimeType, folderType = 'Images', userEmail = 'general' }) {
  const drive = getDriveClient();
  if (!drive) {
    throw new Error('Google Drive API client is not configured. Please supply GOOGLE_SERVICE_ACCOUNT_JSON or service-account.json.');
  }

  const targetFolderId = await resolveTargetFolder(drive, folderType, userEmail);

  // Prepare stream
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
    fields: 'id, name, webViewLink, webContentLink, thumbnailLink'
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
      }
    });
  } catch (permErr) {
    console.warn('[GoogleDrive] Could not set public link permission (may be restricted by Workspace policy):', permErr.message);
  }

  // Direct image display link format
  const directLink = `https://lh3.googleusercontent.com/d/${fileId}`;
  const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

  return {
    success: true,
    fileId,
    name: fileData.name,
    url: directLink,
    webViewLink,
    webContentLink: fileData.webContentLink,
    thumbnailLink: fileData.thumbnailLink || directLink
  };
}

/**
 * Share root folder with Google Group email for automatic manager access
 */
export async function shareRootWithGoogleGroup(groupEmail, role = 'writer') {
  const drive = getDriveClient();
  if (!drive) throw new Error('Drive not configured');

  const rootId = await findOrCreateFolder(drive, 'Booking System Drive', null);

  const res = await drive.permissions.create({
    fileId: rootId,
    requestBody: {
      role, // 'writer' (can edit/upload) or 'reader'
      type: 'group',
      emailAddress: groupEmail
    },
    fields: 'id'
  });

  return { success: true, permissionId: res.data.id, rootFolderId: rootId };
}
