import { 
  Folder, 
  FileText, 
  Presentation, 
  FileSpreadsheet, 
  Archive, 
  HardDrive, 
  FileQuestion 
} from 'lucide-react';

/**
 * Detect driveType from URL
 * @param {string} url 
 * @returns {'FOLDER' | 'DOC' | 'SHEET' | 'SLIDE' | 'FORM' | 'ARCHIVE' | 'OTHER'}
 */
export function detectDriveType(url) {
  if (!url || typeof url !== 'string') return 'OTHER';
  const cleanUrl = url.trim().toLowerCase();

  if (cleanUrl.includes('/folders/') || cleanUrl.includes('drive.google.com/drive/folders')) {
    return 'FOLDER';
  }
  if (cleanUrl.includes('docs.google.com/document') || cleanUrl.includes('/document/d/')) {
    return 'DOC';
  }
  if (cleanUrl.includes('docs.google.com/spreadsheets') || cleanUrl.includes('/spreadsheets/d/')) {
    return 'SHEET';
  }
  if (cleanUrl.includes('docs.google.com/presentation') || cleanUrl.includes('/presentation/d/')) {
    return 'SLIDE';
  }
  if (cleanUrl.includes('docs.google.com/forms') || cleanUrl.includes('/forms/d/')) {
    return 'FORM';
  }
  if (
    cleanUrl.endsWith('.zip') || 
    cleanUrl.endsWith('.rar') || 
    cleanUrl.endsWith('.7z') || 
    cleanUrl.endsWith('.tar.gz') || 
    cleanUrl.includes('archive')
  ) {
    return 'ARCHIVE';
  }

  if (cleanUrl.includes('drive.google.com')) {
    return 'OTHER';
  }

  return 'OTHER';
}

/**
 * Metadata configuration for each driveType
 */
export const DRIVE_TYPE_CONFIG = {
  FOLDER: {
    label: 'Folder Drive',
    shortLabel: 'Folder',
    icon: Folder,
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    glowColor: 'group-hover:border-amber-500/40',
  },
  DOC: {
    label: 'Google Docs',
    shortLabel: 'Docs',
    icon: FileText,
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    glowColor: 'group-hover:border-blue-500/40',
  },
  SHEET: {
    label: 'Google Sheets',
    shortLabel: 'Sheets',
    icon: FileSpreadsheet,
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    glowColor: 'group-hover:border-emerald-500/40',
  },
  SLIDE: {
    label: 'Google Slides',
    shortLabel: 'Slides',
    icon: Presentation,
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
    badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    glowColor: 'group-hover:border-orange-500/40',
  },
  FORM: {
    label: 'Google Form',
    shortLabel: 'Form',
    icon: FileQuestion,
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    glowColor: 'group-hover:border-purple-500/40',
  },
  ARCHIVE: {
    label: 'Arsip / Zip',
    shortLabel: 'Arsip',
    icon: Archive,
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/20',
    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    glowColor: 'group-hover:border-rose-500/40',
  },
  OTHER: {
    label: 'Drive Link',
    shortLabel: 'Drive',
    icon: HardDrive,
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/20',
    badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    glowColor: 'group-hover:border-indigo-500/40',
  },
};

/**
 * Get metadata object for a driveType
 * @param {string} type 
 */
export function getDriveTypeMeta(type) {
  const normalized = (type || 'OTHER').toUpperCase();
  return DRIVE_TYPE_CONFIG[normalized] || DRIVE_TYPE_CONFIG.OTHER;
}

/**
 * Format date string into readable Indonesian format
 * @param {string} dateString 
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}
