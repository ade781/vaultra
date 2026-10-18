import React, { useState } from 'react';
import { ArrowLeft, Lock, User, Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import * as api from '../services/api';

export default function LoginPage({ onBack, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username wajib diisi');
      return;
    }
    if (!password.trim()) {
      setError('Password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login({
        username: username.trim(),
        password: password.trim(),
      });
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-[#FAF8F5] relative overflow-hidden">
      {/* Background Decorative Wood Tone Gradients */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#E5DACB]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#D4A373]/20 blur-3xl pointer-events-none" />

      {/* Main Card with Warm Wood Craftsmanship Aesthetic */}
      <div className="w-full max-w-md rounded-3xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xl shadow-[#8C6239]/8 overflow-hidden relative z-10 transition-all">
        
        {/* Wood Header Trim Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-[#5E3F21] via-[#8C6239] to-[#B48248]" />

        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 text-center bg-gradient-to-b from-[#FDFBF7] to-[#FFFFFF]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8C6239] to-[#5E3F21] text-[#FAF8F5] shadow-md shadow-[#8C6239]/25 border border-[#B48248]/50 mb-3.5">
            <Key className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#261C14]">
            Masuk ke Vaultra
          </h1>
          <p className="text-xs text-[#786858] mt-1.5 max-w-xs mx-auto">
            Akses brankas tautan dan kelola privasi aset digital Anda.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-4">
          
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Username */}
          <div>
            <label className="block text-xs font-semibold text-[#261C14] mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9E8C7C]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoFocus
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/30 focus:border-[#8C6239] transition-all"
              />
            </div>
          </div>

          {/* 2. Password */}
          <div>
            <label className="block text-xs font-semibold text-[#261C14] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9E8C7C]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/30 focus:border-[#8C6239] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9E8C7C] hover:text-[#261C14] cursor-pointer"
                aria-label="Lihat password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Hint */}
          <div className="p-3 rounded-xl bg-[#F7F2EA]/60 border border-[#E5DACB]/60 text-[11px] text-[#786858] space-y-0.5">
            <span className="font-semibold text-[#8C6239]">Akun demo:</span>
            <div className="font-mono text-[11px] text-[#5E3F21]">
              admin / admin123 • budi / budi123
            </div>
          </div>

          {/* Actions: Masuk & Kembali */}
          <div className="pt-2 space-y-2.5">
            {/* Tombol Masuk with Wood Hover Effect */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#FAF8F5] bg-gradient-to-r from-[#8C6239] via-[#7B5430] to-[#5E3F21] hover:from-[#7B5430] hover:to-[#4A2E1B] border border-[#B48248]/50 shadow-md shadow-[#8C6239]/20 hover:shadow-lg hover:shadow-[#8C6239]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Memeriksa Akun...</span>
              ) : (
                <span>Masuk</span>
              )}
            </button>

            {/* Tombol Kembali (sesuai instruksi: "hanya, username dan password dan kembali") */}
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#786858] hover:text-[#261C14] bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#E5DACB] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              <span>Kembali</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
