/**
 * cardHelper.js - Utilities for Vaultra Compartment & Card Expiry Calculations
 */

/**
 * Calculates remaining days and status for an expiry date string (YYYY-MM-DD).
 */
export function getExpiryDetails(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return {
      daysLeft: null,
      status: 'none',
      label: 'Belum diatur',
      shortLabel: '-',
      badgeClass: 'bg-[#F5EFEB] text-[#786858] border-[#DEC8B0]',
      isUrgent: false,
    };
  }

  try {
    const cleanStr = dateStr.trim().split('T')[0];
    const parts = cleanStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return {
        daysLeft: null,
        status: 'none',
        label: 'Format tanggal salah',
        shortLabel: 'Error',
        badgeClass: 'bg-[#F5EFEB] text-[#786858] border-[#DEC8B0]',
        isUrgent: false,
      };
    }

    const [y, m, d] = parts;
    const target = new Date(y, m - 1, d);
    target.setHours(0, 0, 0, 0);

    if (isNaN(target.getTime())) {
      return {
        daysLeft: null,
        status: 'none',
        label: 'Format tanggal salah',
        shortLabel: 'Error',
        badgeClass: 'bg-[#F5EFEB] text-[#786858] border-[#DEC8B0]',
        isUrgent: false,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (isNaN(daysLeft)) {
      return {
        daysLeft: null,
        status: 'none',
        label: 'Format tanggal salah',
        shortLabel: 'Error',
        badgeClass: 'bg-[#F5EFEB] text-[#786858] border-[#DEC8B0]',
        isUrgent: false,
      };
    }

    if (daysLeft < 0) {
      const overdue = Math.abs(daysLeft);
      return {
        daysLeft,
        status: 'expired',
        label: overdue === 1 ? 'Kedaluwarsa kemarin' : `Kedaluwarsa ${overdue} hari lalu`,
        shortLabel: 'Kedaluwarsa',
        badgeClass: 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]',
        isUrgent: true,
      };
    }

    if (daysLeft === 0) {
      return {
        daysLeft: 0,
        status: 'today',
        label: 'Kedaluwarsa hari ini!',
        shortLabel: 'Hari ini',
        badgeClass: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444] animate-pulse',
        isUrgent: true,
      };
    }

    if (daysLeft <= 7) {
      return {
        daysLeft,
        status: 'warning',
        label: `H-${daysLeft} (${daysLeft} hari lagi)`,
        shortLabel: `H-${daysLeft}`,
        badgeClass: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
        isUrgent: true,
      };
    }

    if (daysLeft <= 30) {
      return {
        daysLeft,
        status: 'attention',
        label: `${daysLeft} hari lagi`,
        shortLabel: `${daysLeft} hr`,
        badgeClass: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
        isUrgent: false,
      };
    }

    return {
      daysLeft,
      status: 'safe',
      label: `Aman (${daysLeft} hari)`,
      shortLabel: 'Aman',
      badgeClass: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
      isUrgent: false,
    };
  } catch {
    return {
      daysLeft: null,
      status: 'none',
      label: 'Format tanggal salah',
      shortLabel: 'Error',
      badgeClass: 'bg-[#F5EFEB] text-[#786858] border-[#DEC8B0]',
      isUrgent: false,
    };
  }
}

/**
 * Checks overall status of a card_reminder, bill, or document item
 */
export function getItemUrgency(item) {
  if (!item) return { isUrgent: false, reason: null, minDays: null, hasExpired: false };

  const type = item.type || 'link';

  if (type === 'card_reminder') {
    const cards = item.metadata?.cards;
    if (!Array.isArray(cards) || cards.length === 0) {
      return { isUrgent: false, reason: null, minDays: null, hasExpired: false };
    }

    let minDays = Infinity;
    let hasExpired = false;
    let expiredCount = 0;
    let todayCount = 0;
    let warningCount = 0;

    for (const card of cards) {
      if (!card.expiryDate) continue;
      const details = getExpiryDetails(card.expiryDate);
      if (details.daysLeft !== null) {
        if (details.daysLeft < minDays) {
          minDays = details.daysLeft;
        }
        if (details.status === 'today') {
          hasExpired = true;
          todayCount++;
        } else if (details.status === 'expired') {
          hasExpired = true;
          expiredCount++;
        } else if (details.status === 'warning') {
          warningCount++;
        }
      }
    }

    if (todayCount > 0 && expiredCount === 0) {
      return {
        isUrgent: true,
        hasExpired: true,
        reason: todayCount === 1 ? '1 nomor kedaluwarsa hari ini!' : `${todayCount} nomor kedaluwarsa hari ini!`,
        minDays,
      };
    }

    if (hasExpired) {
      const total = expiredCount + todayCount;
      return {
        isUrgent: true,
        hasExpired: true,
        reason:
          total === 1
            ? todayCount === 1
              ? '1 nomor kedaluwarsa hari ini!'
              : '1 nomor telah kedaluwarsa'
            : `${total} nomor kedaluwarsa`,
        minDays,
      };
    }

    if (minDays <= 7 && minDays !== Infinity) {
      return {
        isUrgent: true,
        hasExpired: false,
        reason: `Masa aktif sisa ${minDays} hari`,
        minDays,
      };
    }

    return {
      isUrgent: false,
      hasExpired: false,
      reason: 'Semua nomor aman',
      minDays: minDays === Infinity ? null : minDays,
    };
  }

  if (type === 'document') {
    const expiryDate = item.metadata?.expiryDate;
    if (expiryDate) {
      const details = getExpiryDetails(expiryDate);
      if (details.daysLeft !== null) {
        if (details.isUrgent) {
          let reason = '';
          if (details.status === 'today') {
            reason = 'Masa berlaku dokumen berakhir hari ini!';
          } else if (details.status === 'expired') {
            reason = 'Masa berlaku dokumen telah kedaluwarsa';
          } else {
            reason = `Masa berlaku dokumen sisa ${details.daysLeft} hari`;
          }
          return {
            isUrgent: true,
            hasExpired: details.status === 'expired' || details.status === 'today',
            reason,
            minDays: details.daysLeft,
          };
        }
        return {
          isUrgent: false,
          hasExpired: false,
          reason: 'Dokumen masih berlaku',
          minDays: details.daysLeft,
        };
      }
    }
  }

  if (type === 'bill') {
    const dueDate = item.metadata?.dueDate;
    if (dueDate) {
      const details = getExpiryDetails(dueDate);
      if (details.daysLeft !== null) {
        if (details.isUrgent) {
          let reason = '';
          if (details.status === 'today') {
            reason = 'Tagihan jatuh tempo HARI INI!';
          } else if (details.status === 'expired') {
            reason = 'Tagihan lewat jatuh tempo';
          } else {
            reason = `Jatuh tempo H-${details.daysLeft} (${details.daysLeft} hari lagi)`;
          }
          return {
            isUrgent: true,
            hasExpired: details.status === 'expired' || details.status === 'today',
            reason,
            minDays: details.daysLeft,
          };
        }
        return {
          isUrgent: false,
          hasExpired: false,
          reason: 'Tagihan belum jatuh tempo',
          minDays: details.daysLeft,
        };
      }
    }
  }

  return { isUrgent: false, reason: null, minDays: null, hasExpired: false };
}

/**
 * Quick extend date by days, months, or years
 */
export function addDaysOrYearsToDate(currentDateStr, { days = 0, months = 0, years = 0 } = {}) {
  let baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  if (currentDateStr) {
    const cleanStr = typeof currentDateStr === 'string' ? currentDateStr.trim().split('T')[0] : '';
    const parts = cleanStr.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      const [y, m, d] = parts;
      const existing = new Date(y, m - 1, d);
      existing.setHours(0, 0, 0, 0);

      // If existing date is in the future, extend from existing.
      // If already in the past (expired), extend from today!
      if (!isNaN(existing.getTime()) && existing.getTime() >= baseDate.getTime()) {
        baseDate = existing;
      }
    }
  }

  if (years > 0) {
    const originalMonth = baseDate.getMonth();
    baseDate.setFullYear(baseDate.getFullYear() + years);
    // If Feb 29 jumped to March in non-leap year, setDate(0) brings it to Feb 28
    if (baseDate.getMonth() !== originalMonth) {
      baseDate.setDate(0);
    }
  }

  if (months > 0) {
    const anchorDay = baseDate.getDate();
    baseDate.setMonth(baseDate.getMonth() + months);
    // If month rollover occurred (e.g. 31st into month with 30 days), setDate(0) goes to last day of target month
    if (baseDate.getDate() !== anchorDay) {
      baseDate.setDate(0);
    }
  }

  if (days > 0) {
    baseDate.setDate(baseDate.getDate() + days);
  }

  const y = baseDate.getFullYear();
  const m = String(baseDate.getMonth() + 1).padStart(2, '0');
  const d = String(baseDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatIDR(amount) {
  if (amount === undefined || amount === null || amount === '') return '-';
  const num = Number(amount);
  if (isNaN(num)) return String(amount);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}
