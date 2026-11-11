import React, { useState } from 'react';
import {
  User,
  Clock,
  Mail,
  Globe,
  Lock,
  Share2,
  CreditCard,
  FileText,
  Receipt,
  Key,
  BookOpen,
  Link as LinkIcon,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { getWoodPlank } from '../utils/woodTextures';
import { getExpiryDetails, getItemUrgency, formatIDR } from '../utils/cardHelper';
import { playTumblerTick } from '../utils/soundHelper';

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '-';
  }
}

function formatCompactExpiry(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim().split('T')[0];
  const parts = clean.split('-');
  if (parts.length >= 2) {
    const year = parts[0];
    const month = parts[1];
    if (year.length === 4 && month.length === 2) {
      return `${month}/${year.slice(-2)}`;
    }
  }
  return null;
}

const ItemCard = React.memo(function ItemCard({ item, onClick, isPrivacyMode = false }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [revealSecret, setRevealSecret] = useState(false);

  const isPrivate = Boolean(item.isPrivate);
  const type = item.type || 'link';
  const metadata = item.metadata || {};
  const woodTexture = getWoodPlank(item.id || item.title || 0);

  const copyToClipboard = (e, text, key) => {
    e.stopPropagation();
    if (!text) return;
    playTumblerTick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1800);
  };

  // Header Icon according to type
  const getTypeHeader = () => {
    switch (type) {
      case 'card_reminder':
        return {
          icon: CreditCard,
          label: 'Masa Aktif Kartu',
          badgeText: `${metadata.cards?.length || 0} Nomor`,
        };
      case 'document':
        return {
          icon: FileText,
          label: metadata.docType || 'Dokumen',
          badgeText: 'Identitas',
        };
      case 'bill':
        return {
          icon: Receipt,
          label: metadata.provider || 'Tagihan Rutin',
          badgeText: metadata.frequency || 'Bulanan',
        };
      case 'credential':
        return {
          icon: Key,
          label: 'Kredensial & Kunci',
          badgeText: 'Rahasia',
        };
      case 'note':
        return {
          icon: BookOpen,
          label: metadata.category || 'Catatan Rahasia',
          badgeText: 'Memo',
        };
      case 'link':
      default:
        return {
          icon: LinkIcon,
          label: `Tautan #${item.id || 1}`,
          badgeText: null,
        };
    }
  };

  const headerMeta = getTypeHeader();
  const HeaderIcon = headerMeta.icon;

  // Calculation for smart urgency alert badge across card_reminder, document, and bill
  const urgency = getItemUrgency(item);

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Buka detail ${item.title || 'item'}`}
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item);
        }
      }}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#FFFFFF] border border-[#E5DACB] hover:border-[#B48248] focus:border-[#B48248] focus:outline-none focus:ring-2 focus:ring-[#D49132]/50 shadow-sm hover:shadow-xl hover:shadow-[#8C6239]/15 hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-200 cursor-pointer overflow-hidden"
    >
      {/* 1. Prominent Wooden Plank Header Cap */}
      <div
        className="relative h-12 w-full px-4 flex items-center justify-between border-b border-[#3D271D]/40 overflow-hidden shadow-xs"
        style={{
          backgroundImage: `linear-gradient(rgba(35, 20, 12, 0.45), rgba(45, 25, 15, 0.7)), url(${woodTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Left: Icon & Title/Label */}
        <div className="flex items-center gap-2 drop-shadow-xs max-w-[65%]">
          <div className="w-6 h-6 rounded-md bg-[#FAF8F5]/15 border border-[#FFE3B3]/40 flex items-center justify-center text-[#FFE3B3] shrink-0">
            <HeaderIcon className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#FCEBD4] drop-shadow-sm truncate">
            {headerMeta.label}
          </span>
        </div>

        {/* Right: Public / Private Pill */}
        <div className="flex items-center gap-1.5">
          {headerMeta.badgeText && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1C1008]/70 text-[#FFE3B3] border border-[#B48248]/40">
              {headerMeta.badgeText}
            </span>
          )}
          {isPrivate ? (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#26160D]/85 text-[#FCE3C3] border border-[#D4A373]/60 shadow-sm"
              title={item.sharedWith ? `Tautan privat dibagikan ke @${item.sharedWith}` : 'Kompartemen privat'}
            >
              <Lock className="w-3 h-3 stroke-[2.5] text-[#FFCC00]" />
              <span className="hidden xs:inline">Private</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1E3316]/85 text-[#D7F2CB] border border-[#7CB364]/60 shadow-sm"
              title="Terbuka untuk umum"
            >
              <Globe className="w-3 h-3 stroke-[2.5] text-[#9EE37D]" />
              <span className="hidden xs:inline">Publik</span>
            </span>
          )}
        </div>

        {/* Bottom Wood Bevel Shadow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black/40" />
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* Main Compartment Body */}
        <div>
          {/* Header Title */}
          <h3 className="text-base font-bold text-[#261C14] group-hover:text-[#8C6239] transition-colors duration-100 line-clamp-1 leading-snug">
            {item.title}
          </h3>

          {/* If Private and sharedWith is set */}
          {isPrivate && item.sharedWith && (
            <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-[#FAF4ED] text-[#8C6239] text-[10px] font-medium border border-[#E5DACB]">
              <Share2 className="w-3 h-3 text-[#B48248]" />
              <span>
                Dibagi ke: <strong>@{item.sharedWith}</strong>
              </span>
            </div>
          )}

          {/* DYNAMIC CONTENT PER TYPE */}

          {/* A. CARD REMINDER */}
          {type === 'card_reminder' && (
            <div className="mt-3 space-y-2.5">
              {/* Smart Alert Badge */}
              {urgency.hasExpired ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>⚠️ Ada nomor kedaluwarsa!</span>
                </div>
              ) : urgency.minDays !== null && urgency.minDays <= 7 ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>⏳ H-{urgency.minDays} Kadaluarsa</span>
                </div>
              ) : urgency.minDays !== null && urgency.minDays > 30 ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
                  <span>✓ Masa aktif aman</span>
                </div>
              ) : urgency.minDays !== null ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50/70 text-amber-800 border border-amber-200 shadow-xs">
                  <span>⏳ Sisa {urgency.minDays} hari</span>
                </div>
              ) : null}

              {/* Chips of Cards */}
              <div className="space-y-1.5 pt-1">
                {(metadata.cards || []).slice(0, 3).map((card, i) => {
                  const details = getExpiryDetails(card.expiryDate);
                  const isExpired = details.status === 'expired' || details.status === 'today';
                  const isWarning = details.status === 'warning';
                  const rowClass = isExpired
                    ? 'border-l-4 border-l-rose-500 bg-rose-50/60 border-rose-200'
                    : isWarning
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/50 border-amber-200'
                    : 'bg-[#FAF8F5] border-[#EBE3D5]';

                  return (
                    <div
                      key={card.id || i}
                      className={`flex items-center justify-between gap-2 p-2 rounded-xl text-xs border ${rowClass}`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-[#3D271D] truncate max-w-[90px]">
                          {card.label || `Kartu ${i + 1}`}
                        </span>
                        <span className="font-mono text-[#8C6239] font-bold text-[11px] shrink-0">
                          {isPrivacyMode ? '•••• ••••' : `•••• ${card.lastDigits || card.last4 || '----'}`}
                        </span>
                        {formatCompactExpiry(card.expiryDate) && (
                          <span className="text-[10px] font-mono text-[#786858] shrink-0 font-medium">
                            Exp: {formatCompactExpiry(card.expiryDate)}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${details.badgeClass}`}
                      >
                        {details.shortLabel}
                      </span>
                    </div>
                  );
                })}

                {(metadata.cards?.length || 0) > 3 && (
                  <span className="text-[10px] font-bold text-[#8C6239] block text-right pt-0.5">
                    +{metadata.cards.length - 3} nomor kartu lainnya...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* B. DOCUMENT & NIK */}
          {type === 'document' && (
            <div className="mt-3 space-y-2">
              {/* Universal Urgency Alert Badge for Document */}
              {urgency.hasExpired ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>⚠️ {urgency.reason || 'Masa berlaku dokumen habis!'}</span>
                </div>
              ) : urgency.minDays !== null && urgency.minDays <= 7 ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>⏳ {urgency.reason || `H-${urgency.minDays} Habis`}</span>
                </div>
              ) : null}

              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE3D5] flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7460] block">
                    {metadata.docType || 'Nomor Identitas'}
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#261C14] tracking-wider block mt-0.5">
                    {isPrivacyMode
                      ? '•••• •••• •••• ••••'
                      : metadata.docNumber || 'Tidak ada nomor'}
                  </span>
                </div>

                {metadata.docNumber && (
                  <button
                    type="button"
                    onClick={(e) => copyToClipboard(e, metadata.docNumber, 'doc')}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white border border-[#DEC8B0] text-[#7A583B] hover:text-[#261C14] hover:bg-[#F5EEDB] transition-colors duration-100 cursor-pointer shadow-xs"
                    title="Salin nomor identitas"
                    aria-label="Salin nomor identitas"
                  >
                    {copiedKey === 'doc' ? (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[#786858] px-0.5">
                {metadata.holderName ? (
                  <div>
                    <span className="text-[#9E8C7C]">Atas nama: </span>
                    <span className="font-semibold text-[#261C14]">{metadata.holderName}</span>
                  </div>
                ) : <div />}

                {metadata.expiryDate && (
                  <span className="font-mono text-[11px] text-[#8C6239]">
                    Exp: {formatCompactExpiry(metadata.expiryDate) || metadata.expiryDate}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* C. BILL */}
          {type === 'bill' && (
            <div className="mt-3 space-y-2">
              {/* Universal Urgency Alert Badge for Bill */}
              {urgency.hasExpired ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>⚠️ {urgency.reason || 'Tagihan lewat jatuh tempo!'}</span>
                </div>
              ) : urgency.minDays !== null && urgency.minDays <= 7 ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>⏳ {urgency.reason || `H-${urgency.minDays} Jatuh Tempo`}</span>
                </div>
              ) : null}

              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE3D5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7460] block">
                    Estimasi Tagihan
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-[#261C14] block mt-0.5">
                    {isPrivacyMode ? 'Rp ••••••' : formatIDR(metadata.amount)}
                  </span>
                </div>

                {metadata.dueDate && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7460] block">
                      Jatuh Tempo
                    </span>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${
                        getExpiryDetails(metadata.dueDate).badgeClass
                      }`}
                    >
                      {getExpiryDetails(metadata.dueDate).label}
                    </span>
                  </div>
                )}
              </div>

              {metadata.accountNumber && (
                <div className="flex items-center justify-between text-xs text-[#786858] px-1">
                  <span className="font-mono">
                    ID: {isPrivacyMode ? '••••••••' : metadata.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => copyToClipboard(e, metadata.accountNumber, 'bill')}
                    className="min-h-[44px] min-w-[44px] px-2 text-[#8C6239] hover:underline flex items-center justify-center gap-1 font-semibold cursor-pointer"
                    aria-label="Salin nomor pelanggan tagihan"
                  >
                    {copiedKey === 'bill' ? 'Tersalin' : 'Salin ID'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* D. CREDENTIAL */}
          {type === 'credential' && (
            <div className="mt-3 space-y-2">
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE3D5] space-y-1.5">
                {metadata.username && (
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#8C7460]">Akun:</span>
                    <span className="font-mono font-medium text-[#261C14] truncate max-w-[170px]">
                      {metadata.username}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-[#F5EFEB]">
                  <span className="text-[#8C7460]">Kunci/Sandi:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#8C6239]">
                      {isPrivacyMode
                        ? '••••••••••••'
                        : revealSecret
                        ? metadata.secret || '---'
                        : '••••••••••••'}
                    </span>
                    {!isPrivacyMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRevealSecret((prev) => !prev);
                        }}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#9E826A] hover:text-[#261C14] cursor-pointer"
                        aria-label={revealSecret ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                      >
                        {revealSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => copyToClipboard(e, metadata.secret, 'secret')}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white border border-[#DEC8B0] text-[#7A583B] hover:text-[#261C14] cursor-pointer shadow-2xs"
                      title="Salin sandi"
                      aria-label="Salin sandi ke clipboard"
                    >
                      {copiedKey === 'secret' ? (
                        <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* E. NOTE */}
          {type === 'note' && (
            <div className="mt-3">
              {isPrivacyMode ? (
                <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#DFCBB5]">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6239]">
                    <Lock className="w-3.5 h-3.5 text-[#B48248] shrink-0" />
                    <span>Catatan Disensor (Privacy Shield)</span>
                  </div>
                  <div className="select-none overflow-hidden rounded-lg bg-[#F2ECE4] p-2.5 border border-[#E5DACB]">
                    <p className="blur-[3px] text-xs text-[#786858] line-clamp-2 select-none opacity-60">
                      {metadata.content || 'Isi catatan rahasia terlindungi dalam brankas Vaultra.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EBE3D5] text-xs text-[#5C4533] leading-relaxed">
                  <p className="line-clamp-3 whitespace-pre-wrap">
                    {metadata.content || '(Catatan kosong)'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* F. LINK */}
          {type === 'link' && item.url && (
            <div className="mt-3">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#FAF8F5] border border-[#EBE3D5] font-mono text-[11px] text-[#8C6239] truncate">
                <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#B48248]" />
                <span className="truncate">{item.url}</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Meta: Pembuat, Asal Email, Tanggal Dibuat */}
        <div className="pt-3.5 mt-3 border-t border-[#F5EFEB] flex flex-wrap items-center justify-between gap-y-2 text-xs text-[#786858]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-[#B48248] shrink-0" />
              <span className="truncate max-w-[120px] text-[#261C14]">
                {item.creator || 'Anonim'}
              </span>
            </div>

            {item.sourceEmail && (
              <div className="flex items-center gap-1 font-mono text-[11px] text-[#786858]">
                <Mail className="w-3.5 h-3.5 text-[#B48248]/80 shrink-0" />
                <span className="truncate max-w-[130px]">{item.sourceEmail}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[#9E8C7C] shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#B48248]/70 shrink-0" />
            <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          </div>
        </div>
      </div>

      {/* 3. Subtle Bottom Wood Plank Footer Edge */}
      <div
        className="h-1.5 w-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundImage: `url(${woodTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </article>
  );
});

export default ItemCard;
