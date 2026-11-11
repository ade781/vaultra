import React from 'react';
import { AlertCircle, Clock, ChevronRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getItemUrgency } from '../utils/cardHelper';
import { getWoodPlank } from '../utils/woodTextures';

export default function UrgentAlertRibbon({
  items = [],
  onSelectUrgentFilter,
  isCurrentFilterUrgent = false,
}) {
  const ribbonWood = getWoodPlank(2);

  // Scan for urgent items
  const urgentItems = items.filter((it) => getItemUrgency(it).isUrgent);
  const expiredItems = urgentItems.filter((it) => getItemUrgency(it).hasExpired);
  const warningItems = urgentItems.filter((it) => !getItemUrgency(it).hasExpired);

  if (urgentItems.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full mb-6 rounded-2xl border border-[#D49132]/70 shadow-lg shadow-[#8C6239]/15 overflow-hidden relative transition-all"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(42, 20, 10, 0.94) 0%, rgba(58, 28, 14, 0.92) 50%, rgba(32, 14, 6, 0.96) 100%), url(${ribbonWood})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Top Polished Brass Hairline Inlay */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#FFE3B3] to-transparent pointer-events-none" />

      {/* Decorative Warm Brass Corner Accent */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#FFB84D]/10 blur-xl pointer-events-none" />

      <div className="px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
        
        {/* Left: Icon & Description */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9800] to-[#E65100] border border-[#FFD54F]/70 flex items-center justify-center text-white shrink-0 shadow-md">
            <ShieldAlert className="w-5 h-5 stroke-[2.2] animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold text-[#FFF4E0] tracking-wide drop-shadow-xs">
                Peringatan Masa Aktif Brankas
              </h2>
              {expiredItems.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444] text-white border border-[#FCA5A5]/60 shadow-xs">
                  <AlertCircle className="w-2.5 h-2.5" />
                  {expiredItems.length} Kedaluwarsa
                </span>
              )}
              {warningItems.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B] text-[#241202] border border-[#FDE68A]/60 shadow-xs">
                  <Clock className="w-2.5 h-2.5" />
                  {warningItems.length} Tempo ≤ 7 Hari
                </span>
              )}
            </div>

            <p className="text-xs text-[#E8D0BA] mt-0.5">
              {expiredItems.length > 0
                ? `${expiredItems.length} kompartemen telah melewati batas aktif dan memerlukan perpanjangan segera.`
                : `${urgentItems.length} kompartemen akan segera habis masa aktifnya dalam waktu 7 hari.`}
            </p>
          </div>
        </div>

        {/* Right: Instant Filter Action Button */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={onSelectUrgentFilter}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer border transition-colors duration-100 shadow-md ${
              isCurrentFilterUrgent
                ? 'bg-[#FFE3B3] text-[#261408] border-[#FFF2CE] ring-2 ring-[#FFB84D]'
                : 'bg-gradient-to-r from-[#D49132] to-[#B46D19] text-[#FFF9F2] border-[#FFE3B3]/40 hover:from-[#E5A344] hover:to-[#C67E25]'
            }`}
          >
            {isCurrentFilterUrgent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#261408]" />
                <span>Filter Aktif</span>
              </>
            ) : (
              <>
                <span>Buka Kompartemen Urgent</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* Bottom Wood Shadow Inlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8C4A15]/60 to-transparent pointer-events-none" />
    </div>
  );
}
