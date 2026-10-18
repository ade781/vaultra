/**
 * Helper to detect Google Drive link type and item type.
 * Supported driveType: 'FOLDER' | 'DOC' | 'SHEET' | 'SLIDE' | 'ARCHIVE' | 'OTHER'
 * Supported itemType: 'GDRIVE' | 'WEB_LINK'
 */

function detectDriveType(url = '', title = '') {
  if (!url || typeof url !== 'string') {
    return { itemType: 'WEB_LINK', driveType: null };
  }

  const cleanUrl = url.trim().toLowerCase();
  const cleanTitle = (title || '').trim().toLowerCase();

  const isGoogle = cleanUrl.includes('drive.google.com') ||
                   cleanUrl.includes('docs.google.com');

  // Archive extension check (in url or title)
  const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.iso'];
  const hasArchiveExt = archiveExtensions.some(ext => cleanUrl.includes(ext) || cleanTitle.endsWith(ext));

  if (hasArchiveExt) {
    return {
      itemType: isGoogle ? 'GDRIVE' : 'WEB_LINK',
      driveType: 'ARCHIVE',
    };
  }

  if (cleanUrl.includes('/folders/') || cleanUrl.includes('drive/folders')) {
    return {
      itemType: 'GDRIVE',
      driveType: 'FOLDER',
    };
  }

  if (cleanUrl.includes('/document/') || cleanUrl.includes('docs.google.com/document')) {
    return {
      itemType: 'GDRIVE',
      driveType: 'DOC',
    };
  }

  if (cleanUrl.includes('/spreadsheets/') || cleanUrl.includes('docs.google.com/spreadsheets')) {
    return {
      itemType: 'GDRIVE',
      driveType: 'SHEET',
    };
  }

  if (cleanUrl.includes('/presentation/') || cleanUrl.includes('docs.google.com/presentation')) {
    return {
      itemType: 'GDRIVE',
      driveType: 'SLIDE',
    };
  }

  if (isGoogle) {
    return {
      itemType: 'GDRIVE',
      driveType: 'OTHER',
    };
  }

  return {
    itemType: 'WEB_LINK',
    driveType: null,
  };
}

module.exports = {
  detectDriveType,
};
