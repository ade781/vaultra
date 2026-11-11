import React, { useState, useMemo, useId } from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  PieChart,
  Calculator,
  Calendar,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { formatIDR, getExpiryDetails, addDaysOrYearsToDate } from '../utils/cardHelper';

/**
 * Helper to advance date string YYYY-MM-DD by 1 month cleanly handling month-end boundaries
 */
function advanceDateByOneMonth(dateStr) {
  if (!dateStr) return dateStr;
  try {
    const clean = dateStr.trim().split('T')[0];
    const [y, m, d] = clean.split('-').map(Number);
    if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;

    let targetYear = y;
    let targetMonth = m + 1;
    if (targetMonth > 12) {
      targetYear += 1;
      targetMonth = 1;
    }

    // Determine the number of days in the target month (e.g. Feb 28/29, Apr 30, etc.)
    const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
    const targetDay = Math.min(d, daysInTargetMonth);

    const nextY = targetYear;
    const nextM = String(targetMonth).padStart(2, '0');
    const nextD = String(targetDay).padStart(2, '0');
    return `${nextY}-${nextM}-${nextD}`;
  } catch {
    return dateStr;
  }
}

export default function BillsPage({ items = [], onUpdateItem, onSelectItem }) {
  const gradientId = useId();

  // Overdue Calculator states
  const [calcAmount, setCalcAmount] = useState('150000');
  const [calcDaysOverdue, setCalcDaysOverdue] = useState('5');
  const [calcPenaltyPercent, setCalcPenaltyPercent] = useState('2'); // 2% per month or fixed

  // Extract all bill items
  const bills = useMemo(() => {
    return items.filter((it) => it.type === 'bill');
  }, [items]);

  // Aggregate monthly analytics & category breakdown
  const {
    totalMonthlyExpense,
    paidBillsTotal,
    unpaidBillsTotal,
    paidCount,
    unpaidCount,
    categoryBreakdown,
  } = useMemo(() => {
    let total = 0;
    let paidTotal = 0;
    let unpaidTotal = 0;
    let pCount = 0;
    let uCount = 0;
    const catMap = new Map();

    bills.forEach((b) => {
      const amount = Number(b.metadata?.amount) || 0;
      const isPaid = Boolean(b.metadata?.isPaid);
      const cat = b.metadata?.provider || b.metadata?.frequency || 'Lainnya';

      total += amount;
      if (isPaid) {
        paidTotal += amount;
        pCount++;
      } else {
        unpaidTotal += amount;
        uCount++;
      }

      catMap.set(cat, (catMap.get(cat) || 0) + amount);
    });

    const breakdown = [];
    catMap.forEach((amt, name) => {
      const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
      breakdown.push({ name, amount: amt, percent: pct });
    });
    breakdown.sort((a, b) => b.amount - a.amount);

    return {
      totalMonthlyExpense: total,
      paidBillsTotal: paidTotal,
      unpaidBillsTotal: unpaidTotal,
      paidCount: pCount,
      unpaidCount: uCount,
      categoryBreakdown: breakdown,
    };
  }, [bills]);

  // Handle Mark as Paid: advances due date to next month & marks paid
  const handleTogglePaid = async (item) => {
    if (!onUpdateItem) return;
    const isCurrentlyPaid = Boolean(item.metadata?.isPaid);

    let updatedDueDate = item.metadata?.dueDate || '';
    if (!isCurrentlyPaid && updatedDueDate) {
      // Advance due date by 1 month for recurring bills
      updatedDueDate = advanceDateByOneMonth(updatedDueDate);
    }

    const updatedMetadata = {
      ...(item.metadata || {}),
      isPaid: !isCurrentlyPaid,
      paidAt: !isCurrentlyPaid ? new Date().toISOString() : null,
      dueDate: updatedDueDate,
    };

    const payload = {
      title: item.title,
      url: item.url || '',
      type: item.type,
      creator: item.creator,
      sourceEmail: item.sourceEmail,
      isPrivate: item.isPrivate,
      sharedWith: item.sharedWith,
      metadata: updatedMetadata,
    };

    await onUpdateItem(payload, item.id);
  };

  // Overdue Calculator results
  const calcResult = useMemo(() => {
    const principal = Number(calcAmount) || 0;
    const days = Number(calcDaysOverdue) || 0;
    const rate = Number(calcPenaltyPercent) || 0;

    // Daily estimated penalty: (principal * (rate / 100) / 30) * days
    const penalty = Math.round((principal * (rate / 100) / 30) * days);
    const totalPayable = principal + penalty;

    return {
      principal,
      days,
      rate,
      penalty,
      totalPayable,
    };
  }, [calcAmount, calcDaysOverdue, calcPenaltyPercent]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
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
                <Receipt className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAF8F5] drop-shadow-sm">
                  Intelijen Tagihan &amp; Langganan
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E5B57A]/20 text-[#FFE3B3] border border-[#E5B57A]/40 font-mono">
                  Monthly Bills
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#D7C4B0] mt-0.5">
                Dashboard pengeluaran rutin, checklist pelunasan siklus berjalan, &amp; estimasi denda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Pengeluaran */}
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
              Total Beban Rutin
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#261C14] mt-0.5 block font-mono">
              {formatIDR(totalMonthlyExpense)}
            </span>
            <span className="text-[11px] text-[#786858] mt-0.5 block">{bills.length} Layanan Tagihan</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF4ED] border border-[#DEC8B0] flex items-center justify-center text-[#8C6239]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Sudah Lunas */}
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
              Sudah Dilunasi
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#15803D] mt-0.5 block font-mono">
              {formatIDR(paidBillsTotal)}
            </span>
            <span className="text-[11px] text-[#786858] mt-0.5 block">{paidCount} dari {bills.length} Tagihan</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] flex items-center justify-center text-[#15803D]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Belum Lunas */}
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
              Sisa Wajib Bayar
            </span>
            <span className={`text-xl sm:text-2xl font-black mt-0.5 block font-mono ${unpaidBillsTotal > 0 ? 'text-[#C2410C]' : 'text-[#15803D]'}`}>
              {formatIDR(unpaidBillsTotal)}
            </span>
            <span className="text-[11px] text-[#786858] mt-0.5 block">{unpaidCount} Tagihan Tertunda</span>
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${unpaidBillsTotal > 0 ? 'bg-[#FFF7ED] border-[#FDBA74] text-[#C2410C]' : 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]'}`}>
            {unpaidBillsTotal > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Category Breakdown + Overdue Penalty Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Category Breakdown (Porsi Pengeluaran) */}
        <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5] mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#8C6239]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
                Porsi Kategori Pengeluaran
              </h3>
            </div>
            <span className="text-xs font-bold text-[#8C6239] font-mono px-2 py-0.5 rounded-full bg-[#FAF4ED] border border-[#DEC8B0]">
              Breakdown
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-8 text-center text-[#8C7460] space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-[#DEC8B0]" />
              <p className="text-sm font-medium">Belum ada data kategori tagihan.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#261C14]">{cat.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[#8C7460]">{cat.percent}%</span>
                      <span className="text-[#261C14]">{formatIDR(cat.amount)}</span>
                    </div>
                  </div>
                  {/* Woodcraft themed progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-[#FAF4ED] border border-[#DEC8B0]/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#B48248] to-[#E5B57A] transition-[width] duration-300"
                      style={{ width: `${Math.max(5, cat.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kalkulator Denda Overdue */}
        <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5] mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#8C6239]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
                Kalkulator Denda Keterlambatan (Overdue)
              </h3>
            </div>
            <span className="text-xs font-bold text-[#8C6239] font-mono px-2 py-0.5 rounded-full bg-[#FAF4ED] border border-[#DEC8B0]">
              Estimasi
            </span>
          </div>

          {/* Form Input Anti-Lag: strict transition-colors duration-100 */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-[#786858] block mb-1">
                Pokok Tagihan (Rp)
              </label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DEC8B0] bg-[#FAF8F5] text-[#261C14] font-mono font-semibold focus:outline-none focus:border-[#B48248] focus:ring-1 focus:ring-[#B48248] transition-colors duration-100"
                placeholder="Contoh: 150000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#786858] block mb-1">
                  Hari Terlambat
                </label>
                <input
                  type="number"
                  value={calcDaysOverdue}
                  onChange={(e) => setCalcDaysOverdue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEC8B0] bg-[#FAF8F5] text-[#261C14] font-mono font-semibold focus:outline-none focus:border-[#B48248] focus:ring-1 focus:ring-[#B48248] transition-colors duration-100"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="font-bold text-[#786858] block mb-1">
                  Tarif Denda (% / Bulan)
                </label>
                <input
                  type="number"
                  value={calcPenaltyPercent}
                  onChange={(e) => setCalcPenaltyPercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DEC8B0] bg-[#FAF8F5] text-[#261C14] font-mono font-semibold focus:outline-none focus:border-[#B48248] focus:ring-1 focus:ring-[#B48248] transition-colors duration-100"
                  placeholder="2"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="mt-3 p-3.5 rounded-xl bg-[#FAF4ED] border border-[#DEC8B0] space-y-1.5 font-mono">
              <div className="flex justify-between text-[#786858]">
                <span>Estimasi Denda:</span>
                <span className="font-bold text-[#C2410C]">+{formatIDR(calcResult.penalty)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#261C14] pt-1 border-t border-[#DEC8B0]">
                <span>Total Kewajiban:</span>
                <span className="text-[#8C6239]">{formatIDR(calcResult.totalPayable)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Checklist Pelunasan Siklus Berjalan ("Tandai Lunas") */}
      <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5] mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8C6239]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
              Checklist Pelunasan Siklus Berjalan
            </h3>
          </div>
          <span className="text-xs font-bold text-[#8C6239] font-mono px-2 py-0.5 rounded-full bg-[#FAF4ED] border border-[#DEC8B0]">
            {bills.length} Tagihan
          </span>
        </div>

        {bills.length === 0 ? (
          <div className="py-8 text-center text-[#8C7460] space-y-2">
            <Receipt className="w-8 h-8 mx-auto text-[#DEC8B0]" />
            <p className="text-sm font-medium">Belum ada tagihan rutin yang didaftarkan ke brankas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((item) => {
              const isPaid = Boolean(item.metadata?.isPaid);
              const dueDate = item.metadata?.dueDate;
              const exp = getExpiryDetails(dueDate);
              const amount = Number(item.metadata?.amount) || 0;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-100 ${
                    isPaid
                      ? 'bg-[#F9FAF9] border-[#DCFCE7]'
                      : 'bg-[#FAF8F5] border-[#E5DACB] hover:border-[#DEC8B0]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePaid(item)}
                      className={`min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center border transition-colors duration-100 cursor-pointer shrink-0 mt-0.5 ${
                        isPaid
                          ? 'bg-[#16A34A] border-[#15803D] text-white shadow-xs'
                          : 'bg-[#FFFFFF] border-[#DEC8B0] text-[#DEC8B0] hover:border-[#B48248] hover:text-[#B48248]'
                      }`}
                      title={isPaid ? 'Batalkan status lunas' : 'Tandai lunas (otomatis majukan tempo ke bulan depan)'}
                      aria-label="Tandai status lunas"
                    >
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-bold ${isPaid ? 'line-through text-[#8C7460]' : 'text-[#261C14]'}`}>
                          {item.title}
                        </h4>
                        {item.metadata?.provider && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EFE4D6] text-[#7A583B]">
                            {item.metadata.provider}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap text-xs font-mono">
                        {amount > 0 && (
                          <span className="font-extrabold text-[#261C14]">
                            {formatIDR(amount)}
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-[#786858]">
                          Tempo: {dueDate || '-'}
                        </span>
                        {item.metadata?.accountNo && (
                          <>
                            <span>•</span>
                            <span className="text-[#8C7460]">Rek: {item.metadata.accountNo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border font-mono ${exp.badgeClass}`}>
                      {isPaid ? 'Lunas Siklus Ini' : exp.label}
                    </span>

                    {onSelectItem && (
                      <button
                        type="button"
                        onClick={() => onSelectItem(item)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F5EFEB] border border-[#DEC8B0] text-[#7A583B] transition-colors duration-100 cursor-pointer"
                      >
                        Detail
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
