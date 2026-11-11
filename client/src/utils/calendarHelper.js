/**
 * calendarHelper.js - RFC 5545 iCalendar (.ics) generator and calendar calculations for Vaultra
 */

/**
 * Formats a Date object or YYYY-MM-DD string to RFC 5545 DATE string (YYYYMMDD)
 * Guarantees zero timezone offset drift when given string dates.
 */
export function formatDateToIcs(dateInput) {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    const clean = dateInput.trim().split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3 && parts.every((p) => !isNaN(Number(p)))) {
      return `${parts[0]}${parts[1].padStart(2, '0')}${parts[2].padStart(2, '0')}`;
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    const y = dateInput.getFullYear();
    const m = String(dateInput.getMonth() + 1).padStart(2, '0');
    const d = String(dateInput.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }
  return '';
}

/**
 * Extracts calendar events from all vault items
 * @param {Array} items - List of items from vault
 * @returns {Array} List of normalized event objects
 */
export function extractVaultEvents(items) {
  if (!Array.isArray(items)) return [];
  const events = [];

  for (const item of items) {
    const type = item.type || 'link';

    if (type === 'bill') {
      const dueDate = item.metadata?.dueDate;
      if (dueDate) {
        const cleanDate = dueDate.trim().split('T')[0];
        const amount = item.metadata?.amount
          ? ` (Rp ${Number(item.metadata.amount).toLocaleString('id-ID')})`
          : '';
        events.push({
          id: `bill-${item.id}`,
          itemId: item.id,
          item,
          type: 'bill',
          title: `[Tagihan] ${item.title}${amount}`,
          date: cleanDate,
          details: `Penyedia: ${item.metadata?.provider || '-'}\nNo Rek: ${item.metadata?.accountNo || '-'}\nStatus: ${item.metadata?.isPaid ? 'Lunas' : 'Belum Lunas'}`,
          isPaid: Boolean(item.metadata?.isPaid),
          amount: Number(item.metadata?.amount) || 0,
        });
      }
    } else if (type === 'card_reminder') {
      const cards = item.metadata?.cards;
      if (Array.isArray(cards)) {
        cards.forEach((card, idx) => {
          if (card.expiryDate) {
            const cleanDate = card.expiryDate.trim().split('T')[0];
            events.push({
              id: `card-${item.id}-${idx}`,
              itemId: item.id,
              item,
              type: 'card_reminder',
              title: `[Masa Aktif] ${item.title} - ${card.label || `Kartu #${idx + 1}`}`,
              date: cleanDate,
              details: `Label: ${card.label || '-'}\nDigit Terakhir: ${card.lastDigits || '-'}\nCatatan: ${card.notes || '-'}`,
              isPaid: false,
              amount: 0,
            });
          }
        });
      }
    } else if (type === 'document') {
      const expiryDate = item.metadata?.expiryDate;
      if (expiryDate) {
        const cleanDate = expiryDate.trim().split('T')[0];
        events.push({
          id: `doc-${item.id}`,
          itemId: item.id,
          item,
          type: 'document',
          title: `[Kedaluwarsa Dokumen] ${item.title}`,
          date: cleanDate,
          details: `Jenis: ${item.metadata?.docType || '-'}\nNomor: ${item.metadata?.docNumber || '-'}\nAtas Nama: ${item.metadata?.docHolder || '-'}`,
          isPaid: false,
          amount: 0,
        });
      }
    }
  }

  // Sort chronologically
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

/**
 * Builds RFC 5545 .ics calendar text format from events
 */
export function generateIcsString(events, calendarName = 'Vaultra Agenda Brankas') {
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0] + 'Z';

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vaultra//Woodcraft Vault Calendar//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  for (const ev of events) {
    const dt = formatDateToIcs(ev.date);
    if (!dt) continue;

    // Calculate end date (next day for full-day event in RFC 5545)
    // Avoid ISO string UTC timezone shift by constructing local Date with numbers
    let dtEnd = '';
    const cleanDate = (ev.date || '').trim().split('T')[0];
    const dateParts = cleanDate.split('-').map(Number);
    if (dateParts.length === 3 && dateParts.every((n) => !isNaN(n))) {
      const [y, m, d] = dateParts;
      const nextDay = new Date(y, m - 1, d + 1);
      dtEnd = formatDateToIcs(nextDay);
    } else {
      const dateObj = new Date(ev.date);
      dateObj.setDate(dateObj.getDate() + 1);
      dtEnd = formatDateToIcs(dateObj);
    }

    ics.push(
      'BEGIN:VEVENT',
      `UID:${ev.id}@vaultra.local`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${dt}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${ev.title.replace(/[,;]/g, ' ')}`,
      `DESCRIPTION:${(ev.details || '').replace(/\n/g, '\\n')}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Triggers client-side download of .ics file
 */
export function downloadIcsFile(filename, icsContent) {
  if (typeof document === 'undefined') return;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
