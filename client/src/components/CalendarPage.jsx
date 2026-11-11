import React, { useState, useMemo, useId } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Receipt,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { extractVaultEvents, generateIcsString, downloadIcsFile } from '../utils/calendarHelper';
import { formatIDR, getExpiryDetails } from '../utils/cardHelper';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function CalendarPage({ items = [], onSelectItem }) {
  const gradientId = useId();
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState(null); // 'YYYY-MM-DD' or null

  // All extracted events from vault items
  const allEvents = useMemo(() => extractVaultEvents(items), [items]);

  // Navigate month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDateStr(todayStr);
  };

  // Calendar matrix calculation for the selected month
  const { calendarDays, monthEvents, monthTotalBills, unpaidBillsTotal } = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Monday is index 0 in day of week (getDay(): 0 is Sunday -> convert to Mon=0...Sun=6)
    let startDayIndex = firstDayOfMonth.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const days = [];

    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
      });
    }

    // Next month padding days to complete 35 or 42 cells (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
      });
    }

    // Events in this specific month
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const inMonth = allEvents.filter((ev) => ev.date.startsWith(prefix));

    // Calculate financial load
    let totalBills = 0;
    let unpaidTotal = 0;
    inMonth.forEach((ev) => {
      if (ev.type === 'bill' && ev.amount > 0) {
        totalBills += ev.amount;
        if (!ev.isPaid) {
          unpaidTotal += ev.amount;
        }
      }
    });

    return {
      calendarDays: days,
      monthEvents: inMonth,
      monthTotalBills: totalBills,
      unpaidBillsTotal: unpaidTotal,
    };
  }, [currentYear, currentMonth, allEvents]);

  // Map events to date strings for quick lookup
  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const ev of allEvents) {
      if (!map.has(ev.date)) {
        map.set(ev.date, []);
      }
      map.get(ev.date).push(ev);
    }
    return map;
  }, [allEvents]);

  // Selected date agenda items or all events for current month
  const displayedEvents = useMemo(() => {
    if (selectedDateStr) {
      return eventsByDate.get(selectedDateStr) || [];
    }
    return monthEvents;
  }, [selectedDateStr, eventsByDate, monthEvents]);

  // Handle Export iCal
  const handleExportIcs = () => {
    const icsString = generateIcsString(allEvents, 'Vaultra Agenda & Tempo');
    const filename = `vaultra-agenda-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}.ics`;
    downloadIcsFile(filename, icsString);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Vintage Desk Planner Title */}
      <div
        className="w-full rounded-2xl border border-[#B48248]/60 p-5 sm:p-6 shadow-md relative overflow-hidden text-[#FAF8F5]"
        style={{
          background: 'linear-gradient(135deg, #2D1A0E 0%, #3F2413 50%, #241308 100%)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFE3B3]/70 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E5B57A] to-[#B48248] p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#1E1008] flex items-center justify-center text-[#FFDF80]">
                <CalendarIcon className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAF8F5] drop-shadow-sm">
                  Kalender &amp; Linimasa Brankas
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E5B57A]/20 text-[#FFE3B3] border border-[#E5B57A]/40 font-mono">
                  Desk Planner
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#D7C4B0] mt-0.5">
                Pemantau visual tenggat waktu tagihan, perpanjangan SIM/kartu, &amp; kedaluwarsa dokumen
              </p>
            </div>
          </div>

          {/* Export .ics Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportIcs}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#E5B57A] hover:bg-[#F0C58F] text-[#24140B] shadow-sm transition-colors duration-100 cursor-pointer border border-[#FFE3B3]/60 active:scale-95 touch-manipulation"
              title="Unduh file .ics kompatibel dengan Google Calendar & Apple Calendar"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span>Ekspor ke iCal (.ics)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Monthly Financial Load & Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Agenda */}
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
              Agenda Bulan Ini
            </span>
            <span className="text-2xl font-black text-[#261C14] mt-0.5 block font-mono">
              {monthEvents.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF4ED] border border-[#DEC8B0] flex items-center justify-center text-[#8C6239]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Total Beban Tagihan */}
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
              Beban Tagihan ({MONTH_NAMES[currentMonth]})
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#261C14] mt-0.5 block font-mono">
              {formatIDR(monthTotalBills)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF4ED] border border-[#DEC8B0] flex items-center justify-center text-[#8C6239]">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Tagihan Belum Lunas */}
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
              Sisa Belum Lunas
            </span>
            <span className={`text-xl sm:text-2xl font-black mt-0.5 block font-mono ${unpaidBillsTotal > 0 ? 'text-[#C2410C]' : 'text-[#15803D]'}`}>
              {formatIDR(unpaidBillsTotal)}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${unpaidBillsTotal > 0 ? 'bg-[#FFF7ED] border-[#FDBA74] text-[#C2410C]' : 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]'}`}>
            {unpaidBillsTotal > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* 3. Interactive Monthly Desk Planner Grid */}
      <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
        {/* Navigation Bar: Prev Month, Current Month Title, Next Month, Go Today */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE3D5] mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-[#786858] hover:text-[#261C14] hover:bg-[#F5EFEB] border border-[#E5DACB] transition-colors duration-100 cursor-pointer"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <h2 className="text-base sm:text-lg font-black text-[#261C14] min-w-[170px] text-center font-sans tracking-tight">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-[#786858] hover:text-[#261C14] hover:bg-[#F5EFEB] border border-[#E5DACB] transition-colors duration-100 cursor-pointer"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedDateStr && (
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#8C6239] hover:bg-[#FAF4ED] border border-[#DEC8B0] transition-colors duration-100 cursor-pointer"
              >
                Lihat Semua Bulan Ini
              </button>
            )}
            <button
              type="button"
              onClick={handleGoToday}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FAF4ED] hover:bg-[#F2E5D5] text-[#7A583B] border border-[#DEC8B0] transition-colors duration-100 cursor-pointer"
            >
              Hari Ini
            </button>
          </div>
        </div>

        {/* 7 Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
          {DAY_NAMES.map((day, idx) => (
            <div
              key={day}
              className={`py-1.5 text-xs font-extrabold uppercase tracking-wider ${
                idx >= 5 ? 'text-[#9A3412]' : 'text-[#786858]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((cell) => {
            const dateEvents = eventsByDate.get(cell.dateStr) || [];
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDateStr;
            const hasEvents = dateEvents.length > 0;

            let hasUrgent = false;
            let hasUnpaidBill = false;
            dateEvents.forEach((ev) => {
              if (ev.type === 'bill' && !ev.isPaid) hasUnpaidBill = true;
              const exp = getExpiryDetails(ev.date);
              if (exp.isUrgent) hasUrgent = true;
            });

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`min-h-[64px] sm:min-h-[82px] p-1.5 sm:p-2 rounded-xl text-left border flex flex-col justify-between transition-colors duration-100 cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#2E1A0F] text-[#FFE3B3] border-[#D49132] ring-2 ring-[#D49132]/60'
                    : isToday
                    ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]'
                    : cell.isCurrentMonth
                    ? 'bg-[#FAF8F5] text-[#261C14] border-[#E8DACB] hover:bg-[#F4ECE1]'
                    : 'bg-[#F9F7F4]/50 text-[#B0A294] border-transparent hover:bg-[#F5EFEB]/60'
                }`}
              >
                {/* Cell Header: Day Number & Today indicator */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      isSelected
                        ? 'text-[#FFE3B3]'
                        : isToday
                        ? 'text-[#B45309] font-black'
                        : cell.isCurrentMonth
                        ? 'text-[#261C14]'
                        : 'text-[#B0A294]'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {isToday && (
                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-[#D97706] text-white'}`}>
                      Kini
                    </span>
                  )}
                </div>

                {/* Event Dots / Badges inside Cell */}
                {hasEvents && (
                  <div className="w-full space-y-0.5 mt-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      {dateEvents.slice(0, 3).map((ev, i) => {
                        let dotColor = 'bg-[#B48248]';
                        if (ev.type === 'bill') {
                          dotColor = ev.isPaid ? 'bg-[#16A34A]' : 'bg-[#DC2626]';
                        } else if (ev.type === 'card_reminder') {
                          dotColor = 'bg-[#D97706]';
                        } else if (ev.type === 'document') {
                          dotColor = 'bg-[#2563EB]';
                        }

                        return (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                            title={ev.title}
                          />
                        );
                      })}
                      {dateEvents.length > 3 && (
                        <span className="text-[8px] font-mono font-bold opacity-80">
                          +{dateEvents.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Compact label preview on larger screens */}
                    <div className="hidden sm:block truncate text-[9.5px] font-medium leading-tight opacity-90">
                      {dateEvents[0].title.replace(/^\[.*?\]\s*/, '')}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Agenda Detail List for Selected Date or Current Month */}
      <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5] mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8C6239]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
              {selectedDateStr
                ? `Agenda Tanggal ${selectedDateStr}`
                : `Daftar Jatuh Tempo ${MONTH_NAMES[currentMonth]} ${currentYear}`}
            </h3>
          </div>
          <span className="text-xs font-bold text-[#8C6239] font-mono px-2 py-0.5 rounded-full bg-[#FAF4ED] border border-[#DEC8B0]">
            {displayedEvents.length} Item
          </span>
        </div>

        {displayedEvents.length === 0 ? (
          <div className="py-8 text-center text-[#8C7460] space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-[#DEC8B0]" />
            <p className="text-sm font-medium">
              {selectedDateStr
                ? 'Tidak ada agenda atau jatuh tempo pada tanggal yang dipilih.'
                : 'Tidak ada tagihan atau kartu jatuh tempo pada bulan ini.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedEvents.map((ev) => {
              const exp = getExpiryDetails(ev.date);
              let IconComp = Clock;
              if (ev.type === 'bill') IconComp = Receipt;
              else if (ev.type === 'card_reminder') IconComp = CreditCard;
              else if (ev.type === 'document') IconComp = FileText;

              return (
                <div
                  key={ev.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-[#E5DACB] hover:border-[#DEC8B0] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF4ED] border border-[#DEC8B0] flex items-center justify-center text-[#8C6239] shrink-0 mt-0.5">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#261C14] leading-snug">
                        {ev.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-mono font-medium text-[#786858]">
                          Tanggal: {ev.date}
                        </span>
                        {ev.amount > 0 && (
                          <span className="text-xs font-mono font-bold text-[#261C14] px-1.5 py-0.2 rounded bg-[#EFE4D6]">
                            {formatIDR(ev.amount)}
                          </span>
                        )}
                        {ev.type === 'bill' && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              ev.isPaid
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : 'bg-[#FEE2E2] text-[#991B1B]'
                            }`}
                          >
                            {ev.isPaid ? 'Sudah Lunas' : 'Belum Lunas'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border font-mono ${exp.badgeClass}`}
                    >
                      {exp.label}
                    </span>
                    {onSelectItem && (
                      <button
                        type="button"
                        onClick={() => onSelectItem(ev.item)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F5EFEB] border border-[#DEC8B0] text-[#7A583B] transition-colors duration-100 cursor-pointer"
                      >
                        Lihat Detail
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
