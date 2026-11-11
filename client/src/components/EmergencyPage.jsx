import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  Lock,
  UserCheck,
  FileCheck,
  AlertTriangle,
  Save,
  Check,
  Printer,
  Edit3,
} from 'lucide-react';

const DEFAULT_EMERGENCY_PROFILE = {
  bloodType: 'O+',
  bpjsNumber: '0001234567890',
  insuranceName: 'BPJS Kesehatan & Asuransi Swasta',
  allergies: 'Penisilin, Seafood (Udang)',
  hospital: 'RSUP Dr. Sardjito / RS Terdekat',
  primaryContactName: 'Budi Santoso',
  primaryContactRelation: 'Kakak Kandung',
  primaryContactPhone: '081234567890',
  secondaryContactName: 'Siti Rahma',
  secondaryContactRelation: 'Istri / Pasangan',
  secondaryContactPhone: '081987654321',
};

const DEFAULT_HANDOVER_NOTES = {
  safeLocation: 'Laci meja kayu ruang kerja pribadi, gembok kuningan kombinasi 4 digit.',
  bankAccounts: 'BCA (Rek: 1234567890 a/n Pemilik) untuk dana darurat bulanan keluarga.',
  insuranceClaim: 'Call Center Asuransi: 1500-123 (Polis No: POL-882199-JKT).',
  digitalAssets: 'Master Password cadangan tertulis di lembaran arsip fisik pada safe box.',
};

export default function EmergencyPage({ onPanicLockdown, showToast }) {
  // Emergency Profile State (stored in localStorage for instantaneous offline recall)
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('vaultra_emergency_profile');
      return saved ? JSON.parse(saved) : DEFAULT_EMERGENCY_PROFILE;
    } catch {
      return DEFAULT_EMERGENCY_PROFILE;
    }
  });

  // Handover Notes State
  const [handover, setHandover] = useState(() => {
    try {
      const saved = localStorage.getItem('vaultra_handover_notes');
      return saved ? JSON.parse(saved) : DEFAULT_HANDOVER_NOTES;
    } catch {
      return DEFAULT_HANDOVER_NOTES;
    }
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingHandover, setIsEditingHandover] = useState(false);
  const [isPanicConfirming, setIsPanicConfirming] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Save changes
  const handleSaveProfile = () => {
    localStorage.setItem('vaultra_emergency_profile', JSON.stringify(profile));
    setIsEditingProfile(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
    if (showToast) showToast('Data Protokol Darurat SOS berhasil diperbarui', 'success');
  };

  const handleSaveHandover = () => {
    localStorage.setItem('vaultra_handover_notes', JSON.stringify(handover));
    setIsEditingHandover(false);
    if (showToast) showToast('Panduan Serah Terima Keluarga berhasil disimpan', 'success');
  };

  const handleTriggerPanic = () => {
    if (onPanicLockdown) {
      onPanicLockdown();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Panic Lockdown Safety Plaque */}
      <div
        className="w-full rounded-2xl border border-rose-900/60 p-5 sm:p-6 shadow-md relative overflow-hidden text-[#FAF8F5]"
        style={{
          background: 'linear-gradient(135deg, #3A0D0D 0%, #280808 60%, #150303 100%)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/70 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-red-800 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#1E0505] flex items-center justify-center text-rose-400">
                <AlertOctagon className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAF8F5] drop-shadow-sm">
                  Protokol Darurat SOS &amp; Warisan Digital
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                  SOS Protocol
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-200 mt-0.5">
                Akses cepat medis darurat, panduan serah terima rumah tangga, &amp; tombol Panic Lockdown
              </p>
            </div>
          </div>

          {/* Panic Lockdown Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {isPanicConfirming ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerPanic}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/50 border border-rose-400 animate-pulse transition-colors duration-100 cursor-pointer"
                >
                  KONFIRMASI LOCKDOWN
                </button>
                <button
                  type="button"
                  onClick={() => setIsPanicConfirming(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPanicConfirming(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border border-rose-400/50 shadow-md shadow-rose-900/40 transition-colors duration-100 cursor-pointer active:scale-95 touch-manipulation"
                title="Kunci darurat: seketika bersihkan sesi dan sembunyikan semua data brankas"
              >
                <Lock className="w-4 h-4 stroke-[2.2]" />
                <span>Panic Lockdown</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. One-Tap Emergency Medical & Contact View */}
      <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5] mb-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
              Kartu Darurat Medis Satu Sentuhan (One-Tap SOS)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isEditingProfile) handleSaveProfile();
              else setIsEditingProfile(true);
            }}
            className="text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF4ED] text-[#8C6239] border border-[#DEC8B0] hover:bg-[#F2E5D5] transition-colors duration-100 cursor-pointer"
          >
            {isEditingProfile ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Simpan Perubahan</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Data</span>
              </>
            )}
          </button>
        </div>

        {/* SOS Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Golongan Darah */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">
              Golongan Darah
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={profile.bloodType}
                onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                className="w-full mt-1 px-2.5 py-1 rounded-lg border border-rose-300 bg-white text-rose-950 font-black text-xl font-mono transition-colors duration-100"
              />
            ) : (
              <span className="text-3xl font-black text-rose-700 font-mono mt-1 block">
                {profile.bloodType}
              </span>
            )}
          </div>

          {/* Nomor BPJS / Asuransi */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DACB]">
            <span className="text-[10px] font-black text-[#8C6239] uppercase tracking-wider block">
              Nomor BPJS / Asuransi
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={profile.bpjsNumber}
                onChange={(e) => setProfile({ ...profile, bpjsNumber: e.target.value })}
                className="w-full mt-1 px-2.5 py-1 rounded-lg border border-[#DEC8B0] bg-white text-[#261C14] font-mono text-xs font-bold transition-colors duration-100"
              />
            ) : (
              <span className="text-base font-extrabold text-[#261C14] font-mono mt-1 block">
                {profile.bpjsNumber}
              </span>
            )}
            <span className="text-[10px] text-[#786858] mt-0.5 block">{profile.insuranceName}</span>
          </div>

          {/* Alergi Obat / Makanan */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
              Alergi Obat &amp; Makanan
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={profile.allergies}
                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                className="w-full mt-1 px-2.5 py-1 rounded-lg border border-amber-300 bg-white text-amber-950 text-xs font-bold transition-colors duration-100"
              />
            ) : (
              <span className="text-xs font-bold text-amber-900 mt-1 block">
                {profile.allergies}
              </span>
            )}
          </div>

          {/* RS Rujukan */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DACB]">
            <span className="text-[10px] font-black text-[#8C6239] uppercase tracking-wider block">
              Rumah Sakit Rujukan
            </span>
            {isEditingProfile ? (
              <input
                type="text"
                value={profile.hospital}
                onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
                className="w-full mt-1 px-2.5 py-1 rounded-lg border border-[#DEC8B0] bg-white text-[#261C14] text-xs font-bold transition-colors duration-100"
              />
            ) : (
              <span className="text-xs font-bold text-[#261C14] mt-1 block">
                {profile.hospital}
              </span>
            )}
          </div>
        </div>

        {/* Emergency Contacts with Direct Call Button */}
        <div className="mt-4 pt-4 border-t border-[#EBE3D5] grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kontak Darurat 1 */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#8C6239] tracking-wider block">
                Kontak Darurat Utama ({profile.primaryContactRelation})
              </span>
              <h4 className="text-sm font-extrabold text-[#261C14] mt-0.5">
                {profile.primaryContactName}
              </h4>
              <span className="text-xs font-mono font-bold text-[#786858] block">
                {profile.primaryContactPhone}
              </span>
            </div>
            <a
              href={`tel:${profile.primaryContactPhone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs transition-colors duration-100"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Hubungi</span>
            </a>
          </div>

          {/* Kontak Darurat 2 */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DEC8B0] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#8C6239] tracking-wider block">
                Kontak Sekunder ({profile.secondaryContactRelation})
              </span>
              <h4 className="text-sm font-extrabold text-[#261C14] mt-0.5">
                {profile.secondaryContactName}
              </h4>
              <span className="text-xs font-mono font-bold text-[#786858] block">
                {profile.secondaryContactPhone}
              </span>
            </div>
            <a
              href={`tel:${profile.secondaryContactPhone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs transition-colors duration-100"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Hubungi</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Panduan Serah Terima Rumah Tangga & Warisan Digital */}
      <div className="bg-[#FFFFFF] border border-[#E5DACB] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D5] mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#8C6239]" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#261C14]">
              Panduan Serah Terima Rumah Tangga &amp; Warisan Digital
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isEditingHandover) handleSaveHandover();
              else setIsEditingHandover(true);
            }}
            className="text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF4ED] text-[#8C6239] border border-[#DEC8B0] hover:bg-[#F2E5D5] transition-colors duration-100 cursor-pointer"
          >
            {isEditingHandover ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Simpan Petunjuk</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Petunjuk</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-[#786858] mb-4">
          Instruksi krusial bagi anggota keluarga atau ahli waris jika pemilik akun berhalangan tetap atau mengalami musibah.
        </p>

        <div className="space-y-4 text-xs">
          {/* Instruksi 1: Brankas Fisik */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] space-y-1">
            <span className="font-bold text-[#8C6239] block">
              1. Lokasi Kunci &amp; Brankas Besi Fisik Rumah
            </span>
            {isEditingHandover ? (
              <textarea
                value={handover.safeLocation}
                onChange={(e) => setHandover({ ...handover, safeLocation: e.target.value })}
                rows={2}
                className="w-full p-2 rounded-lg border border-[#DEC8B0] bg-white text-[#261C14] transition-colors duration-100"
              />
            ) : (
              <p className="text-[#261C14] leading-relaxed">{handover.safeLocation}</p>
            )}
          </div>

          {/* Instruksi 2: Rekening Operasional */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] space-y-1">
            <span className="font-bold text-[#8C6239] block">
              2. Rekening Operasional Keluarga &amp; Dana Darurat
            </span>
            {isEditingHandover ? (
              <textarea
                value={handover.bankAccounts}
                onChange={(e) => setHandover({ ...handover, bankAccounts: e.target.value })}
                rows={2}
                className="w-full p-2 rounded-lg border border-[#DEC8B0] bg-white text-[#261C14] transition-colors duration-100"
              />
            ) : (
              <p className="text-[#261C14] leading-relaxed">{handover.bankAccounts}</p>
            )}
          </div>

          {/* Instruksi 3: Klaim Asuransi */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] space-y-1">
            <span className="font-bold text-[#8C6239] block">
              3. Penanganan Klaim Asuransi &amp; Dokumen Penting
            </span>
            {isEditingHandover ? (
              <textarea
                value={handover.insuranceClaim}
                onChange={(e) => setHandover({ ...handover, insuranceClaim: e.target.value })}
                rows={2}
                className="w-full p-2 rounded-lg border border-[#DEC8B0] bg-white text-[#261C14] transition-colors duration-100"
              />
            ) : (
              <p className="text-[#261C14] leading-relaxed">{handover.insuranceClaim}</p>
            )}
          </div>

          {/* Instruksi 4: Aset Digital */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] space-y-1">
            <span className="font-bold text-[#8C6239] block">
              4. Akses Aset Digital &amp; Master Password
            </span>
            {isEditingHandover ? (
              <textarea
                value={handover.digitalAssets}
                onChange={(e) => setHandover({ ...handover, digitalAssets: e.target.value })}
                rows={2}
                className="w-full p-2 rounded-lg border border-[#DEC8B0] bg-white text-[#261C14] transition-colors duration-100"
              />
            ) : (
              <p className="text-[#261C14] leading-relaxed">{handover.digitalAssets}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
