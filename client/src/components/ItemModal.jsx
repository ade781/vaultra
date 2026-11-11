import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Globe,
  Lock,
  Share2,
  CreditCard,
  FileText,
  Receipt,
  Key,
  BookOpen,
  Link as LinkIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import VaultraLogo from './VaultraLogo';
import * as api from '../services/api';
import { getExpiryDetails } from '../utils/cardHelper';

const COMPARTMENT_TYPES = [
  { id: 'link', label: 'Tautan Web', icon: LinkIcon, desc: 'URL, Google Drive, & tautan penting' },
  { id: 'card_reminder', label: 'Masa Aktif Kartu', icon: CreditCard, desc: 'Reminder masa tenggang & SIM/ATM' },
  { id: 'document', label: 'Dokumen & NIK', icon: FileText, desc: 'KTP, KK, SIM, & nomor identitas' },
  { id: 'bill', label: 'Tagihan Rutin', icon: Receipt, desc: 'PLN, BPJS, Wi-Fi, & tempo bulanan' },
  { id: 'credential', label: 'Kredensial & Kunci', icon: Key, desc: 'Akun, PIN, Token, & kunci akses' },
  { id: 'note', label: 'Catatan Rahasia', icon: BookOpen, desc: 'Catatan memo terenkripsi & privat' },
];

const DEFAULT_CARDS = [
  { id: '1', label: 'SIM 1 / Utama', lastDigits: '', expiryDate: '' },
  { id: '2', label: 'SIM 2 / Cadangan', lastDigits: '', expiryDate: '' },
  { id: '3', label: 'Kartu ATM / Debit', lastDigits: '', expiryDate: '' },
  { id: '4', label: 'Kartu Kredit / e-Money', lastDigits: '', expiryDate: '' },
];

export default function ItemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currentUser = null,
}) {
  // Compartment Type State
  const [type, setType] = useState('link');

  // Base Fields
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [creator, setCreator] = useState('');
  const [sourceEmail, setSourceEmail] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [sharedWith, setSharedWith] = useState('');
  const [usersList, setUsersList] = useState([]);

  // Type: Card Reminder (1 to 10 cards)
  const [cards, setCards] = useState(DEFAULT_CARDS);

  // Type: Document
  const [docType, setDocType] = useState('KTP / NIK');
  const [docNumber, setDocNumber] = useState('');
  const [docHolder, setDocHolder] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [docNotes, setDocNotes] = useState('');

  // Type: Bill
  const [billProvider, setBillProvider] = useState('');
  const [billAccountNo, setBillAccountNo] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billFrequency, setBillFrequency] = useState('Bulanan');

  // Type: Credential
  const [credUsername, setCredUsername] = useState('');
  const [credSecret, setCredSecret] = useState('');
  const [credNotes, setCredNotes] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Type: Note
  const [noteCategory, setNoteCategory] = useState('Pribadi');
  const [noteContent, setNoteContent] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef(null);

  // Fetch available users from backend once when modal opens (not while typing)
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      api.getUsers()
        .then((users) => {
          if (isMounted && Array.isArray(users)) {
            setUsersList(users);
          }
        })
        .catch(() => {
          if (isMounted) setUsersList([]);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Synchronize state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type || 'link');
        setTitle(initialData.title || '');
        setUrl(initialData.url || '');
        setCreator(
          initialData.creator === 'Anonim'
            ? currentUser?.name || currentUser?.username || ''
            : initialData.creator || ''
        );
        setSourceEmail(initialData.sourceEmail || '');
        setIsPrivate(Boolean(initialData.isPrivate));
        setSharedWith(initialData.sharedWith || '');

        const meta = initialData.metadata || {};

        // Populate card_reminder metadata
        if (Array.isArray(meta.cards) && meta.cards.length > 0) {
          setCards(
            meta.cards.map((c, i) => ({
              id: c.id || String(Date.now() + i),
              label: c.label || '',
              lastDigits: c.lastDigits || '',
              expiryDate: c.expiryDate || '',
            }))
          );
        } else {
          setCards(DEFAULT_CARDS);
        }

        // Populate document metadata
        setDocType(meta.docType || 'KTP / NIK');
        setDocNumber(meta.docNumber || '');
        setDocHolder(meta.holderName || '');
        setDocExpiry(meta.expiryDate || '');
        setDocNotes(meta.notes || '');

        // Populate bill metadata
        setBillProvider(meta.provider || '');
        setBillAccountNo(meta.accountNumber || '');
        setBillAmount(meta.amount !== undefined ? String(meta.amount) : '');
        setBillDueDate(meta.dueDate || '');
        setBillFrequency(meta.frequency || 'Bulanan');

        // Populate credential metadata
        setCredUsername(meta.username || '');
        setCredSecret(meta.secret || '');
        setCredNotes(meta.notes || '');
        setShowSecret(false);

        // Populate note metadata
        setNoteCategory(meta.category || 'Pribadi');
        setNoteContent(meta.content || '');
      } else {
        // Reset to pristine defaults
        setType('link');
        setTitle('');
        setUrl('');
        setCreator(currentUser ? currentUser.name || currentUser.username : '');
        setSourceEmail('');
        setIsPrivate(false);
        setSharedWith('');
        setCards(DEFAULT_CARDS);

        setDocType('KTP / NIK');
        setDocNumber('');
        setDocHolder('');
        setDocExpiry('');
        setDocNotes('');

        setBillProvider('');
        setBillAccountNo('');
        setBillAmount('');
        setBillDueDate('');
        setBillFrequency('Bulanan');

        setCredUsername('');
        setCredSecret('');
        setCredNotes('');
        setShowSecret(false);

        setNoteCategory('Pribadi');
        setNoteContent('');
      }

      setError('');
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialData, currentUser]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData && initialData.id);

  // Card Reminder Helpers
  const handleAddCard = () => {
    if (cards.length >= 10) return;
    const newId = String(Date.now());
    setCards((prev) => [
      ...prev,
      { id: newId, label: `Nomor Kartu ${prev.length + 1}`, lastDigits: '', expiryDate: '' },
    ]);
  };

  const handleRemoveCard = (index) => {
    if (cards.length <= 1) return;
    setCards((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCardChange = (index, field, value) => {
    setCards((prev) => {
      const updated = [...prev];
      if (field === 'lastDigits') {
        // Enforce max 4 digits
        updated[index] = { ...updated[index], [field]: value.replace(/\D/g, '').slice(0, 4) };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Judul kompartemen wajib diisi');
      return;
    }

    if (type === 'link' && !url.trim()) {
      setError('Alamat link wajib diisi untuk tautan web');
      return;
    }

    // Validation for guest user
    const resolvedCreator = currentUser
      ? currentUser.name || currentUser.username
      : creator.trim();
    if (!currentUser && (!resolvedCreator || resolvedCreator.toLowerCase() === 'anonim')) {
      setError('Nama pembuat wajib diisi karena Anda belum login');
      return;
    }

    // Build metadata payload based on type
    let metadataPayload = {};
    let resolvedUrl = url.trim() || null;

    if (type === 'card_reminder') {
      const validCards = cards.map((c, i) => ({
        id: c.id || String(i + 1),
        label: c.label.trim() || `Kartu ${i + 1}`,
        lastDigits: c.lastDigits.trim(),
        expiryDate: c.expiryDate || null,
      }));
      metadataPayload = { cards: validCards };
      resolvedUrl = resolvedUrl || null;
    } else if (type === 'document') {
      metadataPayload = {
        docType: docType.trim(),
        docNumber: docNumber.trim(),
        holderName: docHolder.trim(),
        expiryDate: docExpiry || null,
        notes: docNotes.trim(),
      };
    } else if (type === 'bill') {
      metadataPayload = {
        provider: billProvider.trim(),
        accountNumber: billAccountNo.trim(),
        amount: billAmount ? Number(billAmount) : null,
        dueDate: billDueDate || null,
        frequency: billFrequency,
      };
    } else if (type === 'credential') {
      metadataPayload = {
        username: credUsername.trim(),
        secret: credSecret.trim(),
        notes: credNotes.trim(),
      };
    } else if (type === 'note') {
      metadataPayload = {
        category: noteCategory.trim(),
        content: noteContent.trim(),
      };
    }

    try {
      setLoading(true);
      await onSubmit(
        {
          title: title.trim(),
          url: resolvedUrl,
          type,
          metadata: metadataPayload,
          creator: resolvedCreator,
          sourceEmail: sourceEmail.trim() || null,
          isPrivate: Boolean(isPrivate),
          sharedWith: isPrivate && sharedWith.trim() ? sharedWith.trim() : null,
        },
        initialData?.id
      );
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kompartemen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#261C14]/60 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#FFFFFF] border border-[#E5DACB] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Vaultra Logo & Brass Inlay */}
        <div
          className="relative px-5 sm:px-6 py-4 sm:py-4.5 border-b border-[#3D271D]/60 flex items-center justify-between overflow-hidden shadow-sm shrink-0"
          style={{
            background: 'linear-gradient(135deg, #2D1A0E 0%, #3D2314 50%, #201107 100%)',
          }}
        >
          {/* Top Brass Hairline Inlay */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFE3B3]/60 to-transparent pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <VaultraLogo variant="icon" size={36} className="drop-shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#FAF8F5] drop-shadow-xs">
                  {isEditing ? 'Perbarui Kompartemen Brankas' : 'Tambah ke Kompartemen Brankas'}
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#FFCC00]/20 text-[#FFE3B3] px-2 py-0.5 rounded-full border border-[#FFCC00]/30 hidden sm:inline-block">
                  Vaultra Woodcraft
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#D4A373] block mt-0.5">
                Simpan dan lindungi aset berharga Anda dalam brankas berkayu
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#E5DACB] hover:text-white hover:bg-white/10 transition-colors duration-100 cursor-pointer relative z-10"
            aria-label="Tutup form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Selector Tipe Kompartemen */}
          <div>
            <label className="block text-xs font-bold text-[#261C14] mb-2 uppercase tracking-wider">
              Pilih Jenis Kompartemen
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMPARTMENT_TYPES.map((t) => {
                const IconComp = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-colors duration-100 cursor-pointer ${
                      isSelected
                        ? 'bg-[#2E1A0F] border-[#D49132] text-[#FFF4E0] shadow-md ring-1 ring-[#D49132]'
                        : 'bg-[#FAF8F5] border-[#E5DACB] text-[#5C4533] hover:bg-[#F4ECE1]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#D49132] text-[#241208]'
                          : 'bg-[#EFE8DD] text-[#7A583B]'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <span className={`text-xs font-bold block truncate ${isSelected ? 'text-[#FFE3B3]' : 'text-[#261C14]'}`}>
                        {t.label}
                      </span>
                      <span className={`text-[10px] block leading-tight mt-0.5 line-clamp-1 ${isSelected ? 'text-[#E5C39E]' : 'text-[#8C7460]'}`}>
                        {t.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Judul Kompartemen (Wajib) */}
          <div>
            <label className="block text-xs font-bold text-[#261C14] mb-1.5 uppercase tracking-wider">
              Judul Kompartemen <span className="text-rose-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'card_reminder'
                  ? 'Contoh: Masa Aktif SIM & Kartu Pribadi'
                  : type === 'document'
                  ? 'Contoh: KTP & Dokumen Kependudukan'
                  : type === 'bill'
                  ? 'Contoh: Tagihan Listrik & Internet Rumah'
                  : type === 'credential'
                  ? 'Contoh: Akses Dashboard Server & Database'
                  : type === 'note'
                  ? 'Contoh: Catatan Ide & Rencana Rahasia'
                  : 'Contoh: Dokumen Proyek atau Google Drive'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-colors duration-100"
            />
          </div>

          {/* 3. FIELD KHUSUS SESUAI KOMPARTEMEN */}

          {/* A. TIPE: CARD REMINDER */}
          {type === 'card_reminder' && (
            <div className="p-4 rounded-2xl bg-[#FBF7F0] border border-[#DFC9B0] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#8C6239]" />
                  <span className="text-xs font-bold text-[#261C14] uppercase tracking-wider">
                    Daftar Kartu / Nomor ({cards.length}/10)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddCard}
                  disabled={cards.length >= 10}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E5B57A] hover:bg-[#DCA765] text-[#24140B] border border-[#B48248]/60 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-100"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>Tambah Nomor (Maks 10)</span>
                </button>
              </div>

              {/* List Cards */}
              <div className="space-y-2.5 pt-1">
                {cards.map((card, idx) => {
                  const expiryInfo = getExpiryDetails(card.expiryDate);
                  return (
                    <div
                      key={card.id || idx}
                      className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex flex-col sm:flex-row sm:items-center gap-2.5 relative"
                    >
                      {/* Nomor urut */}
                      <span className="text-[11px] font-mono font-bold text-[#8C6239] bg-[#F7EFE4] px-2 py-1 rounded-md shrink-0 self-start sm:self-center">
                        #{idx + 1}
                      </span>

                      {/* Label Kartu */}
                      <div className="flex-1 min-w-[130px]">
                        <input
                          type="text"
                          value={card.label}
                          onChange={(e) => handleCardChange(idx, 'label', e.target.value)}
                          placeholder="Label (SIM 1, BCA, dll.)"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DEC8B0] text-xs text-[#261C14] placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100 font-medium"
                        />
                      </div>

                      {/* 4 Digit Terakhir */}
                      <div className="w-28 shrink-0">
                        <input
                          type="text"
                          maxLength={4}
                          value={card.lastDigits}
                          onChange={(e) => handleCardChange(idx, 'lastDigits', e.target.value)}
                          placeholder="4 Digit Akhir"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DEC8B0] text-xs text-[#261C14] placeholder-[#A48F7E] font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100 text-center"
                        />
                      </div>

                      {/* Tanggal Kadaluarsa */}
                      <div className="w-36 shrink-0">
                        <input
                          type="date"
                          value={card.expiryDate}
                          onChange={(e) => handleCardChange(idx, 'expiryDate', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#DEC8B0] text-xs text-[#261C14] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                        />
                      </div>

                      {/* Badge Preview Status */}
                      <div className="shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${expiryInfo.badgeClass}`}
                          title={expiryInfo.label}
                        >
                          {expiryInfo.status === 'expired' || expiryInfo.status === 'today' ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : expiryInfo.status === 'warning' ? (
                            <Clock className="w-3 h-3" />
                          ) : expiryInfo.status === 'safe' || expiryInfo.status === 'attention' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : null}
                          <span>{expiryInfo.shortLabel || expiryInfo.label}</span>
                        </span>
                      </div>

                      {/* Tombol Hapus Baris */}
                      {cards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(idx)}
                          className="p-1.5 rounded-lg text-[#9E8C7C] hover:text-rose-600 hover:bg-rose-50 transition-colors duration-100 cursor-pointer self-end sm:self-center"
                          title="Hapus nomor ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-[11px] text-[#8C6239] block mt-1">
                Catatan: Masukkan 4 digit terakhir untuk identifikasi kartu tanpa menyimpan nomor kartu penuh.
              </span>
            </div>
          )}

          {/* B. TIPE: DOKUMEN & NIK */}
          {type === 'document' && (
            <div className="p-4 rounded-2xl bg-[#FBF7F0] border border-[#DFC9B0] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Jenis Dokumen
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] font-medium focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  >
                    <option value="KTP / NIK">KTP / NIK</option>
                    <option value="Kartu Keluarga (KK)">Kartu Keluarga (KK)</option>
                    <option value="SIM (Surat Izin Mengemudi)">SIM</option>
                    <option value="NPWP">NPWP</option>
                    <option value="BPJS Kesehatan / Ketenagakerjaan">BPJS</option>
                    <option value="Paspor">Paspor</option>
                    <option value="Lainnya">Dokumen Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Nomor Dokumen / NIK
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="Contoh: 3201012345670001"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] font-mono placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Nama Pemilik Dokumen
                  </label>
                  <input
                    type="text"
                    value={docHolder}
                    onChange={(e) => setDocHolder(e.target.value)}
                    placeholder="Nama sesuai KTP/identitas"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Masa Berlaku (Kosongkan jika Seumur Hidup)
                  </label>
                  <input
                    type="date"
                    value={docExpiry}
                    onChange={(e) => setDocExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Tempat terbit, kode wilayah, dll."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                />
              </div>
            </div>
          )}

          {/* C. TIPE: TAGIHAN RUTIN */}
          {type === 'bill' && (
            <div className="p-4 rounded-2xl bg-[#FBF7F0] border border-[#DFC9B0] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Penyedia / Layanan
                  </label>
                  <input
                    type="text"
                    value={billProvider}
                    onChange={(e) => setBillProvider(e.target.value)}
                    placeholder="Contoh: PLN Pascabayar, IndiHome, BPJS"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Nomor Pelanggan / Rekening
                  </label>
                  <input
                    type="text"
                    value={billAccountNo}
                    onChange={(e) => setBillAccountNo(e.target.value)}
                    placeholder="ID Pelanggan / Nomor Virtual"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] font-mono placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Estimasi Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="Contoh: 250000"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Frekuensi
                  </label>
                  <select
                    value={billFrequency}
                    onChange={(e) => setBillFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] font-medium focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="Tahunan">Tahunan</option>
                    <option value="Sekali Bayar">Sekali Bayar</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* D. TIPE: KREDENSIAL & KUNCI */}
          {type === 'credential' && (
            <div className="p-4 rounded-2xl bg-[#FBF7F0] border border-[#DFC9B0] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Akun / Email / Username
                  </label>
                  <input
                    type="text"
                    value={credUsername}
                    onChange={(e) => setCredUsername(e.target.value)}
                    placeholder="user@perusahaan.com / admin"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] font-mono placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                    Sandi / Kunci Rahasia / Token
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={credSecret}
                      onChange={(e) => setCredSecret(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 pr-10 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] font-mono placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C7460] hover:text-[#261C14] cursor-pointer"
                      title={showSecret ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                  Catatan Kredensial / Recovery Code
                </label>
                <input
                  type="text"
                  value={credNotes}
                  onChange={(e) => setCredNotes(e.target.value)}
                  placeholder="Kode cadangan 2FA, port, atau environment"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                />
              </div>
            </div>
          )}

          {/* E. TIPE: CATATAN RAHASIA */}
          {type === 'note' && (
            <div className="p-4 rounded-2xl bg-[#FBF7F0] border border-[#DFC9B0] space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                  Kategori Catatan
                </label>
                <input
                  type="text"
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  placeholder="Contoh: Ide Proyek, PIN Brankas, Rencana 2026"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] placeholder-[#A48F7E] focus:outline-none focus:ring-1 focus:ring-[#8C6239] transition-colors duration-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261C14] mb-1 uppercase tracking-wider">
                  Isi Catatan Rahasia
                </label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Tuliskan catatan penting Anda di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] text-xs sm:text-sm text-[#261C14] placeholder-[#A48F7E] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-colors duration-100 font-sans"
                />
              </div>
            </div>
          )}

          {/* F. TIPE: LINK WEB / URL (atau opsional link untuk kompartemen lain) */}
          {(type === 'link' || type === 'bill' || type === 'credential') && (
            <div>
              <label className="block text-xs font-bold text-[#261C14] mb-1.5 uppercase tracking-wider">
                {type === 'link' ? (
                  <>Link URL <span className="text-rose-500">*</span></>
                ) : (
                  <>Link Web / Portal Terkait (Opsional)</>
                )}
              </label>
              <input
                type="url"
                required={type === 'link'}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={type === 'link' ? 'https://drive.google.com/...' : 'https://portal.layanan.com'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-xs sm:text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-colors duration-100 font-mono"
              />
            </div>
          )}

          {/* 4. Baris Pembuat & Asal Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              {currentUser ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#261C14] uppercase tracking-wider">
                      Pembuat
                    </label>
                    <span className="text-[10px] font-bold text-[#4A6B3D] bg-[#F0F6EE] px-1.5 py-0.5 rounded border border-[#4A6B3D]/30">
                      Otomatis
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={currentUser.name || currentUser.username}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5EEDB] border border-[#D8C7B4] text-[#261C14] text-xs sm:text-sm font-semibold cursor-not-allowed select-none"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#786858] text-[11px] font-mono">
                      @{currentUser.username}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#261C14] uppercase tracking-wider">
                      Pembuat <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      Wajib (Tamu)
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-xs sm:text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-colors duration-100"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#261C14] mb-1.5 uppercase tracking-wider">
                Asal Email (Opsional)
              </label>
              <input
                type="email"
                value={sourceEmail}
                onChange={(e) => setSourceEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-xs sm:text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-colors duration-100"
              />
            </div>
          </div>

          {/* 5. Hak Akses Privasi */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-[#261C14] mb-2 uppercase tracking-wider">
              Status Privasi Kompartemen
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsPrivate(false);
                  setSharedWith('');
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors duration-100 cursor-pointer ${
                  !isPrivate
                    ? 'bg-[#F0F6EE] border-[#4A6B3D] text-[#2A4520] ring-1 ring-[#4A6B3D]/30'
                    : 'bg-[#FAF8F5] border-[#E5DACB] text-[#786858] hover:border-[#B48248]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    !isPrivate
                      ? 'bg-[#4A6B3D] text-white'
                      : 'bg-[#FFFFFF] border border-[#E5DACB] text-[#9E8C7C]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Publik</span>
                  <span className="text-[10px] text-[#786858] block leading-tight">
                    Terbuka untuk semua
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors duration-100 cursor-pointer ${
                  isPrivate
                    ? 'bg-[#FBF0E4] border-[#8C6239] text-[#5E3F21] ring-1 ring-[#8C6239]/30'
                    : 'bg-[#FAF8F5] border-[#E5DACB] text-[#786858] hover:border-[#B48248]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isPrivate
                      ? 'bg-[#8C6239] text-white'
                      : 'bg-[#FFFFFF] border border-[#E5DACB] text-[#9E8C7C]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Private</span>
                  <span className="text-[10px] text-[#786858] block leading-tight">
                    Akses terenkripsi
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 6. Dropdown Berbagi ke User Tertentu jika Private */}
          {isPrivate && (
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DACB] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6239]">
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Akses Private ke User Tertentu:</span>
              </div>
              <div className="relative">
                <select
                  value={sharedWith}
                  onChange={(e) => setSharedWith(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] text-[#261C14] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8C6239]/30 focus:border-[#8C6239] transition-colors duration-100 cursor-pointer"
                >
                  <option value="">(Hanya saya / Simpan pribadi)</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.name ? `${u.name} (@${u.username})` : `@${u.username}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F5EFEB] shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#786858] hover:text-[#261C14] hover:bg-[#F5EFEB] transition-colors duration-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] border border-[#B48248]/50 shadow-sm transition-opacity cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #4A2E1B 0%, #2E1B0E 100%)',
              }}
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Simpan ke Brankas'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
