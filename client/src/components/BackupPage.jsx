import React, { useState, useMemo, useRef, useId } from 'react';
import {
  Download,
  Upload,
  Lock,
  Unlock,
  Printer,
  FileCheck,
  Shield,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  FileText,
  CreditCard,
  Receipt,
  Key,
  BookOpen,
  Link as LinkIcon,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { encryptVaultData, decryptVaultData } from '../utils/cryptoHelper';

const COMPARTMENT_OPTIONS = [
  { id: 'link', label: 'Tautan Web', icon: LinkIcon },
  { id: 'card_reminder', label: 'Kartu & SIM', icon: CreditCard },
  { id: 'document', label: 'Dokumen & NIK', icon: FileText },
  { id: 'bill', label: 'Tagihan Rutin', icon: Receipt },
  { id: 'credential', label: 'Kredensial & Kunci', icon: Key },
  { id: 'note', label: 'Catatan Rahasia', icon: BookOpen },
];

export default function BackupPage({
  items = [],
  currentUser = null,
  onRestoreItems,
  showToast,
}) {
  const printCrestId = useId();
  const fileInputRef = useRef(null);

  // Selective Export Selection
  const [selectedTypes, setSelectedTypes] = useState([
    'link', 'card_reminder', 'document', 'bill', 'credential', 'note'
  ]);

  // Master Password State for Encryption
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Restore State
  const [uploadedFileContent, setUploadedFileContent] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [isEncryptedFile, setIsEncryptedFile] = useState(false);
  const [decryptedPreview, setDecryptedPreview] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [restoreError, setRestoreError] = useState(null);

  // Emergency Paper Vault Modal State
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);

  // Filter items based on selected types
  const exportableItems = useMemo(() => {
    return items.filter((it) => selectedTypes.includes(it.type || 'link'));
  }, [items, selectedTypes]);

  const toggleTypeSelection = (typeId) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleSelectAllTypes = () => {
    if (selectedTypes.length === COMPARTMENT_OPTIONS.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(COMPARTMENT_OPTIONS.map((c) => c.id));
    }
  };

  // 1. Export Encrypted .vaultra File
  const handleExportEncryptedVaultra = async () => {
    if (!masterPassword || masterPassword.length < 4) {
      if (showToast) showToast('Master Password minimal 4 karakter wajib diisi!', 'error');
      return;
    }

    try {
      setIsEncrypting(true);
      const backupPayload = {
        vaultraVersion: '1.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser?.username || 'admin',
        itemCount: exportableItems.length,
        items: exportableItems,
      };

      const encryptedText = await encryptVaultData(backupPayload, masterPassword);

      const blob = new Blob([encryptedText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      anchor.setAttribute('download', `vaultra-backup-${dateStr}.vaultra`);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      if (showToast) {
        showToast(`Cadangan terenkripsi .vaultra berhasil dibuat (${exportableItems.length} item)!`, 'success');
      }
      setMasterPassword('');
    } catch (err) {
      console.error('Error encrypting backup:', err);
      if (showToast) showToast(err.message || 'Gagal mengenkripsi berkas cadangan', 'error');
    } finally {
      setIsEncrypting(false);
    }
  };

  // 2. Export Standard JSON File
  const handleExportStandardJson = () => {
    const backupPayload = {
      vaultraVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.username || 'admin',
      itemCount: exportableItems.length,
      items: exportableItems,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupPayload, null, 2)
    )}`;
    const anchor = document.createElement('a');
    anchor.href = jsonString;
    const dateStr = new Date().toISOString().slice(0, 10);
    anchor.setAttribute('download', `vaultra-backup-${dateStr}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    if (showToast) {
      showToast(`Cadangan JSON berhasil diunduh (${exportableItems.length} item)!`, 'success');
    }
  };

  // 3. File Upload Handler for Restore
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setRestoreError(null);
    setDecryptedPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      setUploadedFileContent(text);

      const isVaultra = file.name.endsWith('.vaultra') || text.includes('VAULTRA_V1');
      setIsEncryptedFile(isVaultra);

      if (!isVaultra) {
        try {
          const parsed = JSON.parse(text);
          const rawItems = Array.isArray(parsed) ? parsed : parsed.items || [];
          setDecryptedPreview(rawItems);
        } catch {
          setRestoreError('Berkas JSON tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  // 4. Decrypt .vaultra file using password
  const handleDecryptFile = async () => {
    if (!restorePassword) {
      setRestoreError('Masukkan Master Password untuk mendekripsi.');
      return;
    }

    try {
      setIsDecrypting(true);
      setRestoreError(null);
      const decrypted = await decryptVaultData(uploadedFileContent, restorePassword);
      const rawItems = Array.isArray(decrypted) ? decrypted : decrypted.items || [];
      setDecryptedPreview(rawItems);
      if (showToast) showToast(`Berkas berhasil didekripsi (${rawItems.length} item)!`, 'success');
    } catch (err) {
      setRestoreError(err.message || 'Gagal mendekripsi berkas. Periksa password Anda.');
    } finally {
      setIsDecrypting(false);
    }
  };

  // 5. Diff Calculation (New vs Existing)
  const diffResults = useMemo(() => {
    if (!decryptedPreview || !Array.isArray(decryptedPreview)) return null;

    const existingTitles = new Set(items.map((it) => it.title.toLowerCase().trim()));
    let newCount = 0;
    let matchCount = 0;

    decryptedPreview.forEach((it) => {
      const title = (it.title || '').toLowerCase().trim();
      if (existingTitles.has(title)) {
        matchCount++;
      } else {
        newCount++;
      }
    });

    return {
      total: decryptedPreview.length,
      newCount,
      matchCount,
    };
  }, [decryptedPreview, items]);

  // 6. Commit Restore
  const handleCommitRestore = async () => {
    if (!decryptedPreview || !onRestoreItems) return;
    try {
      await onRestoreItems(decryptedPreview);
      setUploadedFileContent(null);
      setUploadedFileName('');
      setDecryptedPreview(null);
      setRestorePassword('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setRestoreError(err.message || 'Gagal menyimpan hasil pemulihan.');
    }
  };

  // 7. Trigger Print for Physical Emergency Paper Sheet
  const handlePrintPaperSheet = () => {
    window.print();
  };

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
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAF8F5] drop-shadow-sm">
                  Studio Cadangan &amp; Enkripsi
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E5B57A]/20 text-[#FFE3B3] border border-[#E5B57A]/40 font-mono">
                  AES-256-GCM
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#D7C4B0] mt-0.5">
                Enkripsi berkas .vaultra client-side, seleksi kompartemen, &amp; cetak lembaran arsip fisik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPaperModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FAF4ED] hover:bg-[#F2E5D5] text-[#261C14] border border-[#DEC8B0] shadow-xs transition-colors duration-100 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#8C6239]" />
              <span>Arsip Fisik (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Section: Selective Compartments Picker */}
      <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5] mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8C6239]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
              Pilih Kompartemen yang Dicadangkan
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSelectAllTypes}
            className="text-xs font-bold text-[#8C6239] hover:underline cursor-pointer"
          >
            {selectedTypes.length === COMPARTMENT_OPTIONS.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {COMPARTMENT_OPTIONS.map((opt) => {
            const IconComp = opt.icon;
            const isSelected = selectedTypes.includes(opt.id);
            const count = items.filter((it) => it.type === opt.id).length;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleTypeSelection(opt.id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-colors duration-100 cursor-pointer ${
                  isSelected
                    ? 'bg-[#2E1A0F] text-[#FFE3B3] border-[#D49132] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#786858] border-[#E5DACB] hover:bg-[#F5EFEB]'
                }`}
              >
                <IconComp className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-[#FFDF80]' : 'text-[#8C6239]'}`} />
                <span className="text-xs font-bold block leading-tight">{opt.label}</span>
                <span className="text-[10px] font-mono mt-0.5 opacity-80">({count} item)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Export Section: Encrypted .vaultra & Standard JSON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Box A: Enkripsi AES-256 Client-Side (.vaultra) */}
        <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#EBE3D5] mb-4">
              <Lock className="w-4 h-4 text-[#8C6239]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
                Enkripsi Brankas (.vaultra)
              </h3>
            </div>
            <p className="text-xs text-[#786858] mb-4">
              Enkripsi militer AES-GCM 256-bit diproses langsung di peramban Anda dengan Master Password. Server tidak pernah mengetahui sandi Anda.
            </p>

            {/* Strict Anti-Lag form input: transition-colors duration-100 */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-bold text-[#786858] block mb-1">
                  Master Password Enkripsi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-[#DEC8B0] bg-[#FAF8F5] text-[#261C14] text-xs font-mono font-semibold focus:outline-none focus:border-[#B48248] focus:ring-1 focus:ring-[#B48248] transition-colors duration-100"
                    placeholder="Masukkan sandi rahasia brankas..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C6239] hover:text-[#261C14] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportEncryptedVaultra}
            disabled={isEncrypting || exportableItems.length === 0}
            className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#E5B57A] hover:bg-[#F0C58F] text-[#24140B] border border-[#B48248]/60 shadow-sm flex items-center justify-center gap-2 transition-colors duration-100 cursor-pointer disabled:opacity-50 touch-manipulation"
          >
            <Lock className="w-4 h-4" />
            <span>{isEncrypting ? 'Mengenkripsi Data...' : `Enkripsi & Unduh .vaultra (${exportableItems.length} Item)`}</span>
          </button>
        </div>

        {/* Box B: Cadangan Terbuka JSON */}
        <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#EBE3D5] mb-4">
              <Download className="w-4 h-4 text-[#8C6239]" />
              <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
                Cadangan JSON Standar (Tanpa Enkripsi)
              </h3>
            </div>
            <p className="text-xs text-[#786858] mb-4">
              Berkas JSON standar portabel yang dapat dibuka dengan aplikasi teks atau diimpor kembali ke Vaultra kapan saja.
            </p>
            <div className="p-3.5 rounded-xl bg-[#FAF4ED] border border-[#DEC8B0] text-xs space-y-1 mb-4">
              <div className="flex justify-between font-mono">
                <span className="text-[#786858]">Jumlah Item Terpilih:</span>
                <span className="font-bold text-[#261C14]">{exportableItems.length} Item</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#786858]">Format:</span>
                <span className="font-bold text-[#8C6239]">UTF-8 JSON (.json)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportStandardJson}
            disabled={exportableItems.length === 0}
            className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FAF4ED] hover:bg-[#F2E5D5] text-[#261C14] border border-[#DEC8B0] shadow-xs flex items-center justify-center gap-2 transition-colors duration-100 cursor-pointer disabled:opacity-50 touch-manipulation"
          >
            <Download className="w-4 h-4 text-[#8C6239]" />
            <span>Unduh Cadangan JSON ({exportableItems.length} Item)</span>
          </button>
        </div>
      </div>

      {/* 4. Restore & Diff Viewer Section */}
      <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EBE3D5] mb-4">
          <Upload className="w-4 h-4 text-[#8C6239]" />
          <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
            Pulihkan dari Berkas Cadangan (.vaultra / .json)
          </h3>
        </div>

        {/* Upload File Input */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#786858] block mb-1">
              Pilih Berkas Cadangan
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".vaultra,.json"
              onChange={handleFileChange}
              className="w-full px-3 py-2 rounded-xl border border-[#DEC8B0] bg-[#FAF8F5] text-[#261C14] text-xs font-mono cursor-pointer transition-colors duration-100"
            />
          </div>

          {/* If file is encrypted (.vaultra), prompt for password */}
          {isEncryptedFile && !decryptedPreview && (
            <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#92400E]">
                <Lock className="w-4 h-4 text-[#D97706]" />
                <span>Berkas ini terenkripsi. Masukkan Master Password untuk membuka:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#FDE68A] bg-[#FFFFFF] text-[#261C14] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#D97706] transition-colors duration-100"
                  placeholder="Master Password..."
                />
                <button
                  type="button"
                  onClick={handleDecryptFile}
                  disabled={isDecrypting || !restorePassword}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E5B57A] hover:bg-[#F0C58F] text-[#24140B] cursor-pointer disabled:opacity-50 transition-colors duration-100"
                >
                  {isDecrypting ? 'Mendekripsi...' : 'Buka Kunci'}
                </button>
              </div>
            </div>
          )}

          {restoreError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{restoreError}</span>
            </div>
          )}

          {/* Diff Viewer & Confirmation */}
          {diffResults && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] space-y-3">
              <div className="flex items-center justify-between border-b border-[#EBE3D5] pb-2">
                <span className="text-xs font-extrabold text-[#261C14]">
                  Hasil Analisis Berkas ({uploadedFileName}):
                </span>
                <span className="text-xs font-mono font-bold text-[#8C6239]">
                  {diffResults.total} Total Item
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="font-bold block">+{diffResults.newCount} Item Baru</span>
                  <span className="text-[10px] text-emerald-600">Belum ada di brankas</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <span className="font-bold block">{diffResults.matchCount} Item Cocok</span>
                  <span className="text-[10px] text-amber-600">Judul sudah terdaftar</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCommitRestore}
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#16A34A] hover:bg-[#15803D] text-white border border-[#15803D] shadow-sm flex items-center justify-center gap-2 transition-colors duration-100 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Pemulihan ke Brankas ({diffResults.total} Item)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Emergency Paper Vault Sheet Modal & Printable Document */}
      {isPaperModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-3xl w-full border border-[#B48248] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Controls Header (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-[#E5DACB] pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#8C6239]" />
                <h3 className="text-base font-extrabold text-[#261C14]">
                  Pratinjau Lembaran Arsip Fisik Darurat
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPaperSheet}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E5B57A] hover:bg-[#F0C58F] text-[#24140B] border border-[#B48248] cursor-pointer transition-colors duration-100"
                >
                  Cetak / Simpan PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaperModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#F5EFEB] text-[#261C14] hover:bg-[#EBE3D5] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Physical Certificate Sheet Container */}
            <div className="p-6 border-4 border-double border-[#8C6239] rounded-xl bg-[#FAF8F5] text-[#261C14] space-y-4">
              {/* Header Certificate */}
              <div className="text-center border-b-2 border-[#DEC8B0] pb-4">
                <span className="text-[10px] font-black tracking-widest text-[#8C6239] uppercase font-mono block">
                  LEMBARAN ARSIP DARURAT BRANKAS PRIBADI
                </span>
                <h2 className="text-2xl font-black tracking-tight text-[#2D1A0E] mt-1 font-serif">
                  VAULTRA EMERGENCY PAPER SHEET
                </h2>
                <p className="text-xs text-[#786858] mt-1 italic">
                  Dokumen fisik rahasia untuk disimpan di brankas besi atau tempat penyimpanan aman keluarga.
                </p>
                <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-[#8C7460] mt-2">
                  <span>Dibuat: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                  <span>•</span>
                  <span>Pemilik: {currentUser?.name || currentUser?.username || 'Arsip Pribadi'}</span>
                </div>
              </div>

              {/* QR Code & Vault Summary */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white border border-[#DEC8B0]">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#8C6239]">
                    Ringkasan Kepemilikan Brankas
                  </h4>
                  <ul className="text-xs space-y-1 mt-1 text-[#261C14]">
                    <li>• Total Kompartemen Terdaftar: <strong>{items.length} Aset</strong></li>
                    <li>• Kartu &amp; SIM Aktif: <strong>{items.filter((it) => it.type === 'card_reminder').length} Layanan</strong></li>
                    <li>• Dokumen Resmi: <strong>{items.filter((it) => it.type === 'document').length} Dokumen</strong></li>
                    <li>• Tagihan Rutin: <strong>{items.filter((it) => it.type === 'bill').length} Tagihan</strong></li>
                  </ul>
                </div>
                <div className="p-2 bg-white border border-[#DEC8B0] rounded-lg shrink-0">
                  <QRCodeSVG value={`VAULTRA-ARCHIVE-${new Date().toISOString()}`} size={72} />
                </div>
              </div>

              {/* Table of Critical Items (Masked Sensitive Data for Physical Writing) */}
              <div>
                <h4 className="text-xs font-black uppercase text-[#8C6239] mb-2">
                  Daftar Kunci Akses &amp; Aset Penting
                </h4>
                <table className="w-full text-left text-xs border border-[#DEC8B0]">
                  <thead>
                    <tr className="bg-[#EFE4D6] text-[#261C14] font-bold">
                      <th className="p-2 border border-[#DEC8B0]">Nama Aset / Layanan</th>
                      <th className="p-2 border border-[#DEC8B0]">Jenis</th>
                      <th className="p-2 border border-[#DEC8B0]">Nomor / Akun</th>
                      <th className="p-2 border border-[#DEC8B0]">Catatan Kunci Rahasia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 15).map((it) => (
                      <tr key={it.id} className="border-b border-[#DEC8B0]">
                        <td className="p-2 font-bold">{it.title}</td>
                        <td className="p-2 capitalize text-[#786858]">{it.type}</td>
                        <td className="p-2 font-mono">{it.metadata?.accountNo || it.metadata?.docNumber || it.metadata?.username || '-'}</td>
                        <td className="p-2 text-[#8C7460] font-mono italic">[ Tulis tangan di sini ]</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-[#DEC8B0] text-[10px] text-center text-[#8C7460]">
                Disimpan dengan otentikasi biometrik / fisik. Dilarang menggandakan dokumen ini secara digital tanpa izin pemilik.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
