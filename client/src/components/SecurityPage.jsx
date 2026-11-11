import React, { useState, useMemo, useId, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Key,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Clock,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Sliders,
  FileText,
} from 'lucide-react';
import { getItemUrgency, getExpiryDetails } from '../utils/cardHelper';

// Indonesian Woodcraft wordlist for passphrase generator
const WOODCRAFT_WORDS = [
  'Mahoni', 'Kuningan', 'Cendana', 'Gembok', 'Pusaka', 'Sonokeling',
  'Akasia', 'Tembaga', 'Perunggu', 'Ulin', 'Ramin', 'Engsel',
  'Laci', 'Petikayu', 'Segel', 'Bilah', 'Kunci', 'Pasak',
  'Wadah', 'Rantai', 'Jati', 'Gaharu', 'Pernis', 'Pasak',
  'Kubah', 'Gagang', 'Tatah', 'Ampelas', 'Pakuemas', 'Gergaji'
];

/**
 * Calculates password strength details
 */
function analyzePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { score: 0, level: 'Kosong', color: 'text-gray-400', badge: 'bg-gray-100 text-gray-700' };
  }

  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= 12) points += 1;
  if (password.length >= 16) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/\d/.test(password)) points += 1;
  if (/[^a-zA-Z0-9]/.test(password)) points += 1;

  // Weak password check
  const commonWeak = ['123456', 'password', 'admin', 'qwerty', 'rahasia', '12345678'];
  if (commonWeak.includes(password.toLowerCase()) || password.length < 6) {
    return { score: 1, level: 'Sangat Lemah', color: 'text-rose-600', badge: 'bg-rose-100 text-rose-800 border-rose-200' };
  }

  if (points <= 2) {
    return { score: 2, level: 'Lemah', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-800 border-amber-200' };
  }
  if (points <= 4) {
    return { score: 3, level: 'Sedang', color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  }
  if (points === 5) {
    return { score: 4, level: 'Kuat', color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }
  return { score: 5, level: 'Sangat Kuat', color: 'text-teal-600', badge: 'bg-teal-100 text-teal-800 border-teal-200' };
}

export default function SecurityPage({ items = [], onSelectItem }) {
  const dialGradientId = useId();
  const brassRingId = useId();

  // Generator configuration states
  const [wordCount, setWordCount] = useState(3);
  const [includeNumber, setIncludeNumber] = useState(true);
  const [separator, setSeparator] = useState('-');
  const [generatedPassphrase, setGeneratedPassphrase] = useState(() => {
    const selected = [];
    const available = [...WOODCRAFT_WORDS];
    for (let i = 0; i < 3; i++) {
      const randIdx = Math.floor(Math.random() * available.length);
      selected.push(available[randIdx]);
      available.splice(randIdx, 1);
    }
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${selected.join('-')}-${num}`;
  });
  const [hasCopied, setHasCopied] = useState(false);

  // Credential view reveal toggle map
  const [revealedSecrets, setRevealedSecrets] = useState({});

  // 1. Vault Security Health Diagnostics & Password Audit
  const diagnostics = useMemo(() => {
    const credentials = items.filter((it) => it.type === 'credential');
    const secretMap = new Map(); // password -> array of items
    let weakPasswordCount = 0;
    let reusedPasswordCount = 0;

    // Analyze credentials
    const auditedCredentials = credentials.map((item) => {
      const secret = item.metadata?.secret || '';
      const strength = analyzePasswordStrength(secret);
      if (strength.score <= 2) weakPasswordCount++;

      if (secret) {
        if (!secretMap.has(secret)) {
          secretMap.set(secret, []);
        }
        secretMap.get(secret).push(item);
      }

      return {
        item,
        secret,
        username: item.metadata?.username || '-',
        service: item.title,
        strength,
      };
    });

    // Detect reused passwords
    const reuseClusters = [];
    secretMap.forEach((itemList, secret) => {
      if (itemList.length > 1) {
        reusedPasswordCount += itemList.length;
        reuseClusters.push({
          count: itemList.length,
          items: itemList,
          secretMasked: `${secret.slice(0, 1)}••••${secret.slice(-1)}`,
        });
      }
    });

    // Stale & Expired Items Inspector
    const now = Date.now();
    const staleItems = [];
    const expiredItems = [];

    items.forEach((item) => {
      const urgency = getItemUrgency(item);
      if (urgency.hasExpired) {
        expiredItems.push({ item, reason: urgency.reason || 'Kedaluwarsa' });
      }

      // Check last updated > 180 days (6 months)
      const updatedTime = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
      if (updatedTime > 0) {
        const daysSinceUpdate = Math.round((now - updatedTime) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate > 180) {
          staleItems.push({ item, daysSinceUpdate });
        }
      }
    });

    // Compute Vault Health Score (0 - 100)
    let score = 100;
    if (weakPasswordCount > 0) score -= weakPasswordCount * 12;
    if (reusedPasswordCount > 0) score -= reusedPasswordCount * 10;
    if (expiredItems.length > 0) score -= expiredItems.length * 8;
    if (staleItems.length > 5) score -= 10;

    score = Math.max(15, Math.min(100, score));

    let healthStatus = 'Kondisi Prima';
    let statusClass = 'text-[#16A34A]';
    if (score < 50) {
      healthStatus = 'Rentan (Perlu Audit)';
      statusClass = 'text-[#DC2626]';
    } else if (score < 75) {
      healthStatus = 'Cukup Baik';
      statusClass = 'text-[#D97706]';
    } else if (score < 90) {
      healthStatus = 'Kuat & Terawat';
      statusClass = 'text-[#059669]';
    }

    return {
      score,
      healthStatus,
      statusClass,
      credentialsCount: credentials.length,
      weakPasswordCount,
      reusedPasswordCount,
      reuseClusters,
      auditedCredentials,
      staleItems,
      expiredItems,
    };
  }, [items]);

  // Generate Woodcraft Passphrase
  const generateNewPassphrase = useCallback(() => {
    const selected = [];
    const available = [...WOODCRAFT_WORDS];
    for (let i = 0; i < wordCount; i++) {
      const randIdx = Math.floor(Math.random() * available.length);
      selected.push(available[randIdx]);
      available.splice(randIdx, 1);
    }

    let phrase = selected.join(separator);
    if (includeNumber) {
      const num = Math.floor(1000 + Math.random() * 9000); // 4-digit
      phrase = `${phrase}${separator}${num}`;
    }

    setGeneratedPassphrase(phrase);
    setHasCopied(false);
  }, [wordCount, includeNumber, separator]);


  const handleCopyPassphrase = () => {
    if (!generatedPassphrase) return;
    navigator.clipboard.writeText(generatedPassphrase);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const toggleRevealSecret = (id) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Dial rotation angle for needle (-90 deg for 0, +90 deg for 100)
  const needleAngle = -90 + (diagnostics.score / 100) * 180;

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
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAF8F5] drop-shadow-sm">
                  Pusat Diagnostik &amp; Skor Keamanan
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E5B57A]/20 text-[#FFE3B3] border border-[#E5B57A]/40 font-mono">
                  Vault Health
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#D7C4B0] mt-0.5">
                Audit integritas sandi, pencegahan password reuse, &amp; generator passphrase brankas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Row: Vault Health Score Brass Dial Meter + Summary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Brass Health Dial (Vintage Barometer Gauge) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#8C6239] mb-1">
            Indikator Kesehatan Brankas
          </span>

          {/* SVG Vintage Brass Dial */}
          <div className="relative w-56 h-36 my-2">
            <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id={dialGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="35%" stopColor="#F59E0B" />
                  <stop offset="70%" stopColor="#EAB308" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <linearGradient id={brassRingId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE3B3" />
                  <stop offset="50%" stopColor="#B48248" />
                  <stop offset="100%" stopColor="#6D431B" />
                </linearGradient>
              </defs>

              {/* Brass Gauge Arch Bezel */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={`url(#${brassRingId})`}
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Color Arc Indicator */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={`url(#${dialGradientId})`}
                strokeWidth="7"
                strokeLinecap="round"
                className="opacity-90"
              />

              {/* Tick Marks (0, 25, 50, 75, 100) */}
              <text x="18" y="115" fontSize="9" fontWeight="bold" fill="#8C7460" textAnchor="middle">0</text>
              <text x="50" y="48" fontSize="9" fontWeight="bold" fill="#8C7460" textAnchor="middle">25</text>
              <text x="100" y="28" fontSize="9" fontWeight="bold" fill="#8C7460" textAnchor="middle">50</text>
              <text x="150" y="48" fontSize="9" fontWeight="bold" fill="#8C7460" textAnchor="middle">75</text>
              <text x="182" y="115" fontSize="9" fontWeight="bold" fill="#8C7460" textAnchor="middle">100</text>

              {/* Center Pivot Brass Dome */}
              <circle cx="100" cy="100" r="10" fill="#2E1A0F" stroke="#B48248" strokeWidth="2.5" />
              <circle cx="100" cy="100" r="4" fill="#FFDF80" />

              {/* Dial Needle */}
              <g transform={`rotate(${needleAngle}, 100, 100)`} className="transition-transform duration-700 ease-out">
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="30"
                  stroke="#261C14"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <polygon points="97,35 103,35 100,24" fill="#B45309" />
              </g>
            </svg>
          </div>

          {/* Health Score Number */}
          <div className="flex items-baseline justify-center gap-1 font-mono">
            <span className="text-4xl font-black text-[#261C14] tracking-tight">
              {diagnostics.score}
            </span>
            <span className="text-base font-bold text-[#8C7460]">/ 100</span>
          </div>

          <div className={`mt-1 text-sm font-extrabold ${diagnostics.statusClass}`}>
            {diagnostics.healthStatus}
          </div>
          <p className="text-[11px] text-[#786858] mt-1 max-w-xs">
            Skor dihitung berdasarkan kekuatan kata sandi, tidak adanya password kembar, serta keteraturan masa aktif kompartemen.
          </p>
        </div>

        {/* Diagnostic Breakdown Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Total Kredensial */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
                Kredensial Tersimpan
              </span>
              <span className="text-2xl font-black text-[#261C14] mt-0.5 block font-mono">
                {diagnostics.credentialsCount}
              </span>
              <span className="text-[11px] text-[#786858] mt-0.5 block">Akun &amp; Kunci Rahasia</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF4ED] border border-[#DEC8B0] flex items-center justify-center text-[#8C6239]">
              <Key className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Password Lemah */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
                Sandi Lemah / Rentan
              </span>
              <span className={`text-2xl font-black mt-0.5 block font-mono ${diagnostics.weakPasswordCount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                {diagnostics.weakPasswordCount}
              </span>
              <span className="text-[11px] text-[#786858] mt-0.5 block">
                {diagnostics.weakPasswordCount > 0 ? 'Perlu diganti segera' : 'Semua sandi kuat'}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${diagnostics.weakPasswordCount > 0 ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]' : 'bg-[#F0FDF4] border-[#86EFAC] text-[#16A34A]'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Password Reuse */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
                Sandi Kembar / Terduplikasi
              </span>
              <span className={`text-2xl font-black mt-0.5 block font-mono ${diagnostics.reusedPasswordCount > 0 ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
                {diagnostics.reusedPasswordCount}
              </span>
              <span className="text-[11px] text-[#786858] mt-0.5 block">
                {diagnostics.reusedPasswordCount > 0 ? 'Sandi dipakai berulang' : 'Tidak ada sandi kembar'}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${diagnostics.reusedPasswordCount > 0 ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]' : 'bg-[#F0FDF4] border-[#86EFAC] text-[#16A34A]'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Dokumen & Item Kedaluwarsa */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider block">
                Item Kedaluwarsa
              </span>
              <span className={`text-2xl font-black mt-0.5 block font-mono ${diagnostics.expiredItems.length > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                {diagnostics.expiredItems.length}
              </span>
              <span className="text-[11px] text-[#786858] mt-0.5 block">Kartu / SIM / Tagihan</span>
            </div>
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${diagnostics.expiredItems.length > 0 ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]' : 'bg-[#F0FDF4] border-[#86EFAC] text-[#16A34A]'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Woodcraft Passphrase Generator Panel */}
      <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5] mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8C6239]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
              Generator Passphrase Woodcraft Vintage
            </h3>
          </div>
          <span className="text-xs font-bold text-[#8C6239] font-mono px-2 py-0.5 rounded-full bg-[#FAF4ED] border border-[#DEC8B0]">
            Entropi Tinggi
          </span>
        </div>

        {/* Passphrase Display Box */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2E1A0F] text-[#FFDF80] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider block">
                Hasil Generator
              </span>
              <span className="text-lg sm:text-xl font-black text-[#261C14] font-mono tracking-wide break-all">
                {generatedPassphrase}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyPassphrase}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors duration-100 cursor-pointer ${
                hasCopied
                  ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                  : 'bg-[#FFFFFF] text-[#261C14] border-[#DEC8B0] hover:bg-[#F5EFEB]'
              }`}
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#8C6239]" />
                  <span>Salin Sandi</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={generateNewPassphrase}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E5B57A] hover:bg-[#F0C58F] text-[#24140B] border border-[#B48248]/50 shadow-xs transition-colors duration-100 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Acak Baru</span>
            </button>
          </div>
        </div>

        {/* Options Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div>
            <label className="font-bold text-[#786858] block mb-1">Panjang Kata</label>
            <div className="flex items-center gap-1.5">
              {[2, 3, 4].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setWordCount(cnt)}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition-colors duration-100 cursor-pointer ${
                    wordCount === cnt
                      ? 'bg-[#2E1A0F] text-[#FFE3B3] border-[#D49132]'
                      : 'bg-[#FAF8F5] text-[#786858] border-[#E5DACB] hover:bg-[#F5EFEB]'
                  }`}
                >
                  {cnt} Kata
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-[#786858] block mb-1">Pemisah Kata</label>
            <div className="flex items-center gap-1.5">
              {['-', '_', '.', '#'].map((sep) => (
                <button
                  key={sep}
                  type="button"
                  onClick={() => setSeparator(sep)}
                  className={`flex-1 py-1.5 rounded-lg font-mono font-bold border transition-colors duration-100 cursor-pointer ${
                    separator === sep
                      ? 'bg-[#2E1A0F] text-[#FFE3B3] border-[#D49132]'
                      : 'bg-[#FAF8F5] text-[#786858] border-[#E5DACB] hover:bg-[#F5EFEB]'
                  }`}
                >
                  {sep}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-[#786858] block mb-1">Angka Acak 4-Digit</label>
            <button
              type="button"
              onClick={() => setIncludeNumber((prev) => !prev)}
              className={`w-full py-1.5 rounded-lg font-bold border transition-colors duration-100 cursor-pointer ${
                includeNumber
                  ? 'bg-[#E5B57A] text-[#24140B] border-[#B48248]'
                  : 'bg-[#FAF8F5] text-[#786858] border-[#E5DACB] hover:bg-[#F5EFEB]'
              }`}
            >
              {includeNumber ? 'Sertakan (+4 Digit)' : 'Tanpa Angka'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Audit Password Kembar (Password Reuse Detector) */}
      {diagnostics.reuseClusters.length > 0 && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#FCD34D] mb-4">
            <AlertTriangle className="w-5 h-5 text-[#D97706]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#92400E]">
              Peringatan: Password Kembar Terdeteksi ({diagnostics.reuseClusters.length} Pola)
            </h3>
          </div>
          <p className="text-xs text-[#B45309] mb-4">
            Menggunakan kata sandi yang sama di beberapa akun berbahaya. Jika salah satu layanan bocor, seluruh akun Anda ikut terancam.
          </p>

          <div className="space-y-3">
            {diagnostics.reuseClusters.map((cluster, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded">
                      Pola: {cluster.secretMasked}
                    </span>
                    <span className="text-xs font-semibold text-[#786858]">
                      Digunakan pada {cluster.count} akun:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {cluster.items.map((it) => (
                      <span
                        key={it.id}
                        className="text-xs font-bold text-[#261C14] px-2 py-1 rounded bg-[#FAF4ED] border border-[#DEC8B0]"
                      >
                        {it.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    Wajib Diganti Unik
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Daftar Audit Lengkap Kredensial */}
      <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5] mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#8C6239]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
              Daftar Evaluasi Sandi &amp; Kredensial
            </h3>
          </div>
          <span className="text-xs font-bold text-[#8C6239] font-mono px-2 py-0.5 rounded-full bg-[#FAF4ED] border border-[#DEC8B0]">
            {diagnostics.auditedCredentials.length} Kredensial
          </span>
        </div>

        {diagnostics.auditedCredentials.length === 0 ? (
          <div className="py-8 text-center text-[#8C7460] space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-[#DEC8B0]" />
            <p className="text-sm font-medium">Belum ada akun kredensial yang tersimpan di brankas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {diagnostics.auditedCredentials.map((itemObj) => {
              const isRevealed = revealedSecrets[itemObj.item.id];
              return (
                <div
                  key={itemObj.item.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-[#E5DACB] hover:border-[#DEC8B0] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF4ED] border border-[#DEC8B0] flex items-center justify-center text-[#8C6239] shrink-0 mt-0.5">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#261C14]">
                        {itemObj.service}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[#786858]">
                        <span className="font-mono">User: {itemObj.username}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono">
                            Sandi: {isRevealed ? itemObj.secret : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRevealSecret(itemObj.item.id)}
                            className="p-1 text-[#8C6239] hover:text-[#261C14] cursor-pointer"
                            aria-label={isRevealed ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border font-mono ${itemObj.strength.badge}`}>
                      {itemObj.strength.level}
                    </span>
                    {onSelectItem && (
                      <button
                        type="button"
                        onClick={() => onSelectItem(itemObj.item)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F5EFEB] border border-[#DEC8B0] text-[#7A583B] transition-colors duration-100 cursor-pointer"
                      >
                        Buka &amp; Ubah
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Inspektor Data Usang (> 6 Bulan) */}
      {diagnostics.staleItems.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EBE3D5] mb-4">
            <Clock className="w-4 h-4 text-[#8C6239]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
              Inspektor Data Usang (Tidak Diperbarui &gt; 6 Bulan)
            </h3>
          </div>
          <p className="text-xs text-[#786858] mb-4">
            Item berikut belum pernah diperbarui selama lebih dari setengah tahun. Tinjau apakah informasi di dalamnya masih valid atau perlu diarsipkan.
          </p>

          <div className="space-y-2.5">
            {diagnostics.staleItems.slice(0, 5).map((stale) => (
              <div
                key={stale.item.id}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#8C6239]" />
                  <span className="font-bold text-[#261C14]">{stale.item.title}</span>
                  <span className="text-[10px] text-[#8C7460] font-mono">
                    (Terakhir diperbarui {stale.daysSinceUpdate} hari lalu)
                  </span>
                </div>
                {onSelectItem && (
                  <button
                    type="button"
                    onClick={() => onSelectItem(stale.item)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F5EFEB] border border-[#DEC8B0] text-[#7A583B] transition-colors duration-100 cursor-pointer"
                  >
                    Tinjau
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
