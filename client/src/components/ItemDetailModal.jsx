import React, { useEffect, useState } from 'react';
import {
  X,
  Clock,
  User,
  Mail,
  Link as LinkIcon,
  Trash2,
  Edit3,
  AlertTriangle,
  Globe,
  Lock,
  Share2,
  Archive,
  CreditCard,
  FileText,
  Receipt,
  Key,
  BookOpen,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  CalendarPlus,
  CheckCircle2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getWoodPlank } from '../utils/woodTextures';
import {
  getExpiryDetails,
  addDaysOrYearsToDate,
  formatIDR,
} from '../utils/cardHelper';
import * as api from '../services/api';

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

export default function ItemDetailModal({
  isOpen,
  item,
  onClose,
  onEdit,
  onDelete,
  onItemUpdated,
  isPrivacyMode = false,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [extendingCardId, setExtendingCardId] = useState(null);
  const [currentItem, setCurrentItem] = useState(item);

  useEffect(() => {
    setCurrentItem(item);
    setConfirmDelete(false);
    setDeleting(false);
    setShowSecret(false);
    setExtendingCardId(null);
  }, [isOpen, item]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !currentItem) return null;

  const isPrivate = Boolean(currentItem.isPrivate);
  const type = currentItem.type || 'link';
  const metadata = currentItem.metadata || {};
  const woodTexture = getWoodPlank(currentItem.id || currentItem.title || 0);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1800);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onDelete(currentItem.id);
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  // Quick Extend Handler for Card Expiry (+30 days or +1 year)
  const handleQuickExtend = async (cardIndex, extensionType) => {
    const existingCards = metadata.cards || [];
    if (!existingCards[cardIndex]) return;

    const targetCard = existingCards[cardIndex];
    setExtendingCardId(`${cardIndex}_${extensionType}`);

    const newExpiry =
      extensionType === '30d'
        ? addDaysOrYearsToDate(targetCard.expiryDate, { days: 30 })
        : addDaysOrYearsToDate(targetCard.expiryDate, { years: 1 });

    const updatedCards = existingCards.map((c, i) =>
      i === cardIndex ? { ...c, expiryDate: newExpiry } : c
    );

    const updatedPayload = {
      ...currentItem,
      metadata: {
        ...metadata,
        cards: updatedCards,
      },
    };

    try {
      const saved = await api.updateItem(currentItem.id, updatedPayload);
      const finalItem = saved || updatedPayload;
      setCurrentItem(finalItem);
      if (onItemUpdated) {
        onItemUpdated(finalItem);
      }
    } catch (err) {
      console.error('Gagal memperpanjang masa aktif:', err);
    } finally {
      setExtendingCardId(null);
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'card_reminder':
        return CreditCard;
      case 'document':
        return FileText;
      case 'bill':
        return Receipt;
      case 'credential':
        return Key;
      case 'note':
        return BookOpen;
      case 'link':
      default:
        return Archive;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#261C14]/60 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#FFFFFF] border border-[#E5DACB] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prominent Wood Plank Modal Header Band */}
        <div
          className="relative px-5 sm:px-6 py-4.5 border-b border-[#3D271D]/50 flex items-center justify-between overflow-hidden shadow-sm shrink-0"
          style={{
            backgroundImage: `linear-gradient(rgba(35, 20, 12, 0.72), rgba(48, 28, 16, 0.86)), url(${woodTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5]/10 border border-[#D4A373]/50 flex items-center justify-center text-[#FFE8C2] shadow-xs">
              <TypeIcon className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#E5DACB] uppercase tracking-wider block">
                Detail Kompartemen Brankas
              </span>
              <span className="text-[11px] font-semibold text-[#D4A373]">
                ID #{currentItem.id} • {isPrivate ? 'Akses Privat' : 'Akses Publik'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#E5DACB] hover:text-white hover:bg-white/10 transition-colors duration-100 cursor-pointer relative z-10"
            aria-label="Tutup pop-up"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Section: Title & Metadata */}
          <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-5 pb-5 border-b border-[#F5EFEB]">
            <div className="flex-1 min-w-0 pr-0 sm:pr-4 space-y-2.5">
              {/* Privacy Pill & Type */}
              <div className="flex items-center gap-2">
                {isPrivate ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FBF0E4] text-[#8C6239] border border-[#E8CDB5]">
                    <Lock className="w-3 h-3 stroke-[2.5]" />
                    <span>Private</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0F6EE] text-[#4A6B3D] border border-[#CFE1C9]">
                    <Globe className="w-3 h-3 stroke-[2.5]" />
                    <span>Publik</span>
                  </span>
                )}
                {isPrivate && currentItem.sharedWith && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF4ED] text-[#8C6239] text-xs font-medium border border-[#E5DACB]">
                    <Share2 className="w-3 h-3 text-[#B48248]" />
                    <span>@{currentItem.sharedWith}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#261C14] leading-snug break-words">
                {currentItem.title}
              </h2>

              {/* Meta details */}
              <div className="space-y-1.5 pt-1 text-xs text-[#786858]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#8C6239]" />
                  <span>Dibuat: </span>
                  <time dateTime={currentItem.createdAt} className="font-semibold text-[#261C14]">
                    {formatDate(currentItem.createdAt)}
                  </time>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#8C6239]" />
                  <span>Pembuat: </span>
                  <span className="font-semibold text-[#261C14]">
                    {currentItem.creator || 'Anonim'}
                  </span>
                </div>

                {currentItem.sourceEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8C6239]" />
                    <span>Email: </span>
                    <span className="font-semibold text-[#261C14]">
                      {currentItem.sourceEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            {currentItem.url && (
              <div
                className="shrink-0 self-center sm:self-auto flex flex-col items-center p-3 rounded-2xl border border-[#B48248]/50 shadow-md relative overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(rgba(45, 26, 16, 0.8), rgba(30, 16, 9, 0.9)), url(${woodTexture})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                title="Arahkan kamera ponsel Anda untuk scan tautan"
              >
                <div className="p-2 rounded-xl bg-white shadow-inner">
                  <QRCodeSVG
                    value={currentItem.url}
                    size={100}
                    bgColor="#FFFFFF"
                    fgColor="#261C14"
                    level="M"
                  />
                </div>
                <span className="text-[10px] text-[#FFE8C2] font-mono mt-1.5 font-bold uppercase tracking-wider drop-shadow-xs">
                  Scan QR
                </span>
              </div>
            )}
          </div>

          {/* DYNAMIC COMPARTMENT DETAIL SECTION */}

          {/* A. CARD REMINDER: LIST SEMUA KARTU DENGAN QUICK EXTEND */}
          {type === 'card_reminder' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#8C6239]" />
                  <h3 className="text-sm font-extrabold text-[#261C14] uppercase tracking-wider">
                    Daftar Kartu &amp; Masa Aktif ({metadata.cards?.length || 0} Nomor)
                  </h3>
                </div>
                <span className="text-xs text-[#8C7460]">Perpanjang otomatis 1-klik</span>
              </div>

              <div className="space-y-2.5">
                {(metadata.cards || []).map((card, idx) => {
                  const details = getExpiryDetails(card.expiryDate);
                  const is30dLoading = extendingCardId === `${idx}_30d`;
                  const is1yLoading = extendingCardId === `${idx}_1y`;

                  return (
                    <div
                      key={card.id || idx}
                      className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#DEC8B0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      {/* Left: Card Label & Number */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#8C6239] bg-[#F2E5D5] px-2 py-0.5 rounded-md font-mono">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-bold text-[#261C14]">
                            {card.label || `Nomor ${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs text-[#5C4533]">
                          <span>Nomor:</span>
                          <strong className="tracking-wider text-[#8C6239]">
                            {isPrivacyMode ? '•••• ••••' : `•••• ${card.lastDigits || '----'}`}
                          </strong>
                          {card.lastDigits && !isPrivacyMode && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(card.lastDigits, `card_${idx}`)}
                              className="p-1 rounded text-[#9E8C7C] hover:text-[#261C14] cursor-pointer"
                              title="Salin 4 digit"
                            >
                              {copiedKey === `card_${idx}` ? (
                                <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[11px] text-[#786858]">Expired:</span>
                          <span className="text-xs font-semibold text-[#261C14]">
                            {card.expiryDate || 'Belum diatur'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${details.badgeClass}`}
                          >
                            {details.status === 'expired' || details.status === 'today' ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : details.status === 'warning' ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            <span>{details.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Right: Quick Extend Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickExtend(idx, '30d')}
                          disabled={Boolean(extendingCardId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF4ED] hover:bg-[#F2E5D5] text-[#5C4533] border border-[#DEC8B0] transition-colors duration-100 cursor-pointer disabled:opacity-50"
                          title="Perpanjang 30 hari dari tanggal aktif"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-[#8C6239]" />
                          <span>{is30dLoading ? 'Menyimpan...' : '+30 Hari'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickExtend(idx, '1y')}
                          disabled={Boolean(extendingCardId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E5B57A] hover:bg-[#DCA765] text-[#24140B] border border-[#B48248]/60 transition-colors duration-100 cursor-pointer shadow-2xs disabled:opacity-50"
                          title="Perpanjang 1 tahun dari tanggal aktif"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-[#24140B]" />
                          <span>{is1yLoading ? 'Menyimpan...' : '+1 Tahun'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* B. DOCUMENT & NIK */}
          {type === 'document' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DEC8B0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C7460]">
                    {metadata.docType || 'Nomor Identitas'}
                  </span>
                  {metadata.docNumber && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(metadata.docNumber, 'doc_num')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#DEC8B0] text-xs font-semibold text-[#8C6239] hover:bg-[#F4ECE1] cursor-pointer"
                    >
                      {copiedKey === 'doc_num' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Cepat</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="font-mono text-lg font-bold text-[#261C14] tracking-widest bg-white p-3 rounded-xl border border-[#E5DACB]">
                  {isPrivacyMode ? '•••• •••• •••• ••••' : metadata.docNumber || 'Tidak tercatat'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <span className="text-[#8C7460] block">Nama Pemilik:</span>
                    <strong className="text-[#261C14] text-sm">{metadata.holderName || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[#8C7460] block">Masa Berlaku:</span>
                    <strong className="text-[#261C14] text-sm">
                      {metadata.expiryDate || 'Seumur Hidup'}
                    </strong>
                  </div>
                </div>

                {metadata.notes && (
                  <div className="pt-2 border-t border-[#EBE3D5] text-xs text-[#5C4533]">
                    <span className="text-[#8C7460] block mb-1">Catatan Tambahan:</span>
                    <p className="whitespace-pre-wrap">{metadata.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* C. BILL */}
          {type === 'bill' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DEC8B0] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C7460] block">
                      Penyedia / Layanan
                    </span>
                    <strong className="text-base font-bold text-[#261C14]">
                      {metadata.provider || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C7460] block">
                      Estimasi Nominal
                    </span>
                    <strong className="text-lg font-extrabold text-[#261C14]">
                      {isPrivacyMode ? 'Rp ••••••' : formatIDR(metadata.amount)}
                    </strong>
                  </div>
                </div>

                {metadata.accountNumber && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5DACB]">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#8C7460] block">
                        Nomor Pelanggan / ID Tagihan
                      </span>
                      <span className="font-mono text-sm font-bold text-[#261C14]">
                        {isPrivacyMode ? '••••••••' : metadata.accountNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(metadata.accountNumber, 'bill_acc')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#DEC8B0] text-xs font-semibold text-[#8C6239] hover:bg-[#F4ECE1] cursor-pointer"
                    >
                      {copiedKey === 'bill_acc' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin ID</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {metadata.dueDate && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#8C7460]">Jatuh Tempo:</span>
                    <span
                      className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${
                        getExpiryDetails(metadata.dueDate).badgeClass
                      }`}
                    >
                      {getExpiryDetails(metadata.dueDate).label} ({metadata.dueDate})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* D. CREDENTIAL */}
          {type === 'credential' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DEC8B0] space-y-3">
                {metadata.username && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5DACB]">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#8C7460] block">
                        Username / Akun
                      </span>
                      <span className="font-mono text-sm font-semibold text-[#261C14]">
                        {metadata.username}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(metadata.username, 'cred_user')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#DEC8B0] text-xs font-semibold text-[#8C6239] cursor-pointer"
                    >
                      {copiedKey === 'cred_user' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Salin</span>
                    </button>
                  </div>
                )}

                {metadata.secret && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5DACB]">
                    <div className="flex-1 pr-3">
                      <span className="text-[10px] font-bold uppercase text-[#8C7460] block">
                        Sandi / Token / Kunci Rahasia
                      </span>
                      <span className="font-mono text-sm font-bold text-[#8C6239] break-all">
                        {isPrivacyMode
                          ? '••••••••••••'
                          : showSecret
                          ? metadata.secret
                          : '••••••••••••'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isPrivacyMode && (
                        <button
                          type="button"
                          onClick={() => setShowSecret((prev) => !prev)}
                          className="p-1.5 rounded-lg border border-[#DEC8B0] text-[#7A583B] hover:bg-[#FAF8F5] cursor-pointer"
                          title={showSecret ? 'Sembunyikan' : 'Perlihatkan'}
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(metadata.secret, 'cred_sec')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#DEC8B0] text-xs font-semibold text-[#8C6239] cursor-pointer"
                      >
                        {copiedKey === 'cred_sec' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin Sandi</span>
                      </button>
                    </div>
                  </div>
                )}

                {metadata.notes && (
                  <div className="text-xs text-[#5C4533] p-2">
                    <span className="text-[#8C7460] block mb-0.5">Catatan / Backup Codes:</span>
                    <p className="whitespace-pre-wrap font-mono text-[11px] bg-white p-2.5 rounded-lg border border-[#E5DACB]">
                      {metadata.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* E. NOTE */}
          {type === 'note' && (
            <div className="space-y-2">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DEC8B0] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C7460] block">
                  Kategori: {metadata.category || 'Pribadi'}
                </span>
                <div className="p-3.5 rounded-xl bg-white border border-[#E5DACB] text-sm text-[#261C14] leading-relaxed whitespace-pre-wrap font-sans">
                  {isPrivacyMode ? (
                    <span className="blur-[3px] select-none text-[#9E8C7C]">
                      Isi catatan disensor oleh Privacy Shield.
                    </span>
                  ) : (
                    metadata.content || '(Catatan kosong)'
                  )}
                </div>
              </div>
            </div>
          )}

          {/* URL Link Section */}
          {currentItem.url && (
            <div>
              <label className="block text-xs font-bold text-[#786858] uppercase tracking-wider mb-1.5">
                Alamat Tautan
              </label>
              <div className="flex items-center justify-between gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] font-mono text-xs sm:text-sm text-[#261C14] break-all">
                <div className="flex items-center gap-2 min-w-0">
                  <LinkIcon className="w-4 h-4 text-[#8C6239] shrink-0" />
                  <a
                    href={currentItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-[#8C6239] font-medium truncate"
                    title="Buka di tab baru"
                  >
                    {currentItem.url}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentItem.url, 'url_link')}
                  className="p-1.5 rounded-lg text-[#8C7460] hover:text-[#261C14] hover:bg-[#F2E5D5] transition-colors duration-100 cursor-pointer shrink-0"
                  title="Salin tautan"
                >
                  {copiedKey === 'url_link' ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Box */}
          {confirmDelete && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Yakin ingin menghapus kompartemen ini dari brankas?</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 p-4 px-6 border-t border-[#F5EFEB] bg-[#FAF8F5] shrink-0">
          <div>
            {!confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors duration-100 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(currentItem)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/80 shadow-sm shadow-[#8C6239]/25 hover:shadow-lg hover:shadow-[#8C6239]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(rgba(55, 30, 16, 0.72), rgba(35, 18, 9, 0.85)), url(${woodTexture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Edit3 className="w-4 h-4 text-[#FFE8C2]" />
              <span>Edit Kompartemen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
