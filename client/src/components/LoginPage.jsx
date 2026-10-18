import React, { useState } from 'react';
import { ArrowLeft, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import VaultraLogo from './VaultraLogo';
import PullCord from './PullCord';
import * as api from '../services/api';
import { getWoodPlank } from '../utils/woodTextures';
import woodPlank6 from '../assets/wood-plank-6.jpg';
import woodPlank2 from '../assets/wood-plank-2.jpg';

function playSwitchSound(isOn) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const startFreq = isOn ? 750 : 500;
    const endFreq = isOn ? 350 : 200;

    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio restriction fallback
  }
}

export default function LoginPage({ onBack, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Interactive Lamp State (True by default)
  const [isLampOn, setIsLampOn] = useState(false);

  const toggleLamp = () => {
    setIsLampOn((prev) => {
      const next = !prev;
      playSwitchSound(next);
      return next;
    });
  };

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

  // Ambient Firefly Particles
  const particles = [
    { top: '15%', left: '8%', size: 'w-2 h-2', delay: '0s' },
    { top: '22%', left: '28%', size: 'w-1.5 h-1.5', delay: '1.2s' },
    { top: '38%', left: '4%', size: 'w-2 h-2', delay: '0.5s' },
    { top: '12%', left: '76%', size: 'w-1.5 h-1.5', delay: '2s' },
    { top: '28%', left: '65%', size: 'w-1 h-1', delay: '0.8s' },
    { top: '48%', left: '73%', size: 'w-2 h-2', delay: '1.5s' },
    { top: '52%', left: '78%', size: 'w-1.5 h-1.5', delay: '2.5s' },
    { top: '68%', left: '72%', size: 'w-1 h-1', delay: '0.3s' },
    { top: '88%', left: '67%', size: 'w-2 h-2', delay: '1.8s' },
    { top: '85%', left: '85%', size: 'w-1.5 h-1.5', delay: '0.9s' },
    { top: '75%', left: '45%', size: 'w-1.5 h-1.5', delay: '1.4s' },
    { top: '25%', left: '48%', size: 'w-1 h-1', delay: '2.2s' },
  ];

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden select-none">
      
      {/* Top Left: Quick Back Navigation */}
      <div className="absolute top-5 left-5 z-40">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#D7C4B0] hover:text-[#FAF8F5] bg-[#140C07]/80 hover:bg-[#140C07] border border-[#4A2E1B]/70 shadow-md transition-all cursor-pointer backdrop-blur-sm"
          title="Kembali ke Beranda"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#B48248]" />
          <span>Kembali</span>
        </button>
      </div>
      
      {/* 1. Wood Plank 6 Background for Login Page - Lebih Gelap & Berkarakter */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${woodPlank6})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: isLampOn 
            ? 'blur(4px) brightness(0.65) saturate(1.2)' 
            : 'blur(4px) brightness(0.10) saturate(0.4)',
          transform: 'scale(1.03)',
        }}
      />

      {/* 2. Ambient Intense Golden-Yellow Glow Radiating from the Lamp */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
          isLampOn ? 'opacity-65' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at 26% 40%, rgba(255, 204, 0, 0.55) 0%, rgba(255, 160, 10, 0.32) 38%, rgba(180, 100, 20, 0.15) 65%, transparent 100%)',
        }}
      />

      {/* 3. Deep Cinematic Room Vignette (Lebih Gelap di Tepian) */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />

      {/* 4. Dark Shadow Overlay when Lamp is OFF */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
          isLampOn ? 'opacity-0' : 'opacity-95 bg-[#060403]'
        }`}
      />

      {/* 2. Floating Firefly Particles */}
      {isLampOn && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p, idx) => (
            <div
              key={idx}
              className={`absolute rounded-full bg-[#FFD15C] shadow-[0_0_8px_2px_rgba(255,209,92,0.8)] animate-pulse ${p.size}`}
              style={{
                top: p.top,
                left: p.left,
                animationDelay: p.delay,
                animationDuration: '3s',
              }}
            />
          ))}
        </div>
      )}

      {/* 3. Main Stage: Standing Lamp on Left, Login Card on Right */}
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16 relative z-10">
        
        {/* ======================================================== */}
        {/* SEBELAH KIRI: Standing Floor Lamp dengan Alas Kaki Kokoh */}
        {/* ======================================================== */}
        <div className="w-full max-w-[340px] sm:max-w-[380px] h-[500px] sm:h-[540px] relative flex flex-col items-center justify-end shrink-0">
          
          {/* Volumetric Light Cone emanating from bottom edge of shade to the floor (Lebih Terang & Berpendar) */}
          <div
            className={`absolute top-[96px] sm:top-[112px] left-1/2 -translate-x-1/2 w-[340px] sm:w-[400px] h-[360px] sm:h-[390px] pointer-events-none transition-all duration-700 ease-out z-0 ${
              isLampOn ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              clipPath: 'polygon(33% 0%, 67% 0%, 100% 100%, 0% 100%)',
              background: 'linear-gradient(180deg, rgba(255, 235, 70, 0.88) 0%, rgba(255, 195, 25, 0.58) 35%, rgba(240, 140, 10, 0.25) 75%, transparent 100%)',
            }}
          />

          {/* Lamp Complete Assembly in Natural Top-to-Bottom Flow */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* 1. TOP: Lamp Dome Shade & Glowing Diffuser Assembly */}
            <div className="relative flex flex-col items-center z-20">
              
              {/* Ambient Dark Shadow behind top of Shade (menghalangi cahaya ke atas) */}
              <div className="absolute -top-3 w-48 sm:w-56 h-14 rounded-full bg-black/85 blur-xl pointer-events-none" />

              {/* Outer Glow Halo behind Shade */}
              {isLampOn && (
                <div className="absolute inset-0 rounded-full bg-[#FFC843]/30 blur-2xl pointer-events-none transition-opacity duration-700" />
              )}

              {/* Dome Shade (Kap Kubah Hitam Doff Halus) */}
              <div 
                onClick={toggleLamp}
                className="w-38 sm:w-46 h-18 sm:h-22 rounded-t-full bg-gradient-to-b from-[#282828] via-[#1B1B1B] to-[#0D0D0D] relative overflow-hidden border-t border-white/20 shadow-[0_12px_24px_rgba(0,0,0,0.95),inset_0_-3px_6px_rgba(0,0,0,0.9)] cursor-pointer"
                title="Klik lampu atau tarik tali saklar"
              >
                {/* 3D Specular Curved Highlight */}
                <div className="absolute inset-x-5 top-1.5 h-3.5 rounded-t-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                {/* Internal Rim Shadow */}
                <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              </div>

              {/* Glowing Underside Diffuser Lens */}
              <div 
                onClick={toggleLamp}
                className={`w-36 sm:w-44 h-5 sm:h-6 rounded-full transition-all duration-500 cursor-pointer -mt-2.5 relative z-20 ${
                  isLampOn
                    ? 'bg-gradient-to-r from-[#FFCC00] via-[#FFF3B0] to-[#FFB703] shadow-[0_0_25px_8px_#FFCC00,0_0_65px_25px_rgba(255,185,10,0.9),0_0_110px_45px_rgba(255,140,0,0.5)] border border-[#FFE885]'
                    : 'bg-[#1C1712] shadow-[inset_0_3px_6px_rgba(0,0,0,0.9)] opacity-85 border border-[#2D241C]'
                }`}
              />

              {/* Interactive Physics Spring Pull Cord (Bisa Ditarik, Menjepret & Bergelantungan) */}
              <PullCord isLampOn={isLampOn} onToggle={toggleLamp} />
            </div>

            {/* 2. MIDDLE: Vertical Lamp Rod / Tiang Lampu Hitam (Tersambung langsung ke alas kaki) */}
            <div className="w-2.5 h-[290px] sm:h-[330px] bg-gradient-to-r from-[#0C0C0C] via-[#2E2E2E] to-[#0A0A0A] shadow-[2px_0_6px_rgba(0,0,0,0.7),-2px_0_6px_rgba(0,0,0,0.7)] relative z-10" />

            {/* 3. BOTTOM: ALAS / KAKI LAMPU (Tatakan bundar/bevel kokoh di atas lantai) */}
            <div 
              className={`w-32 sm:w-40 h-5 sm:h-6 rounded-t-2xl relative z-20 -mt-0.5 transition-all duration-500 overflow-hidden ${
                isLampOn
                  ? 'bg-gradient-to-r from-[#141414] via-[#2C2C2C] to-[#111111] border-t-2 border-[#FFDF80]/60 shadow-[0_-3px_15px_rgba(255,200,80,0.35),0_12px_28px_rgba(0,0,0,0.95)]'
                  : 'bg-gradient-to-r from-[#121212] via-[#202020] to-[#0E0E0E] border-t border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.95)]'
              }`}
            >
              {/* Highlight Bevel Permukaan Atas Kaki Lampu */}
              <div className="absolute inset-x-3 top-0.5 h-1.5 rounded-t-xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              {/* Sisi Bawah Alas Kaki Lampu */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-[#080808]" />
            </div>

            {/* 4. Floor Contact Shadow (Bayangan lantai gelap tepat di bawah alas kaki) */}
            <div className="w-44 sm:w-54 h-4 rounded-[100%] bg-black/95 blur-md -mt-1.5 pointer-events-none z-0" />

            {/* 5. Floor Light Reflection Puddle (Pendaran cahaya lantai di sekeliling kaki lampu) */}
            {isLampOn && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-72 sm:w-84 h-12 rounded-[100%] bg-gradient-to-r from-transparent via-[#FFB703]/50 to-transparent blur-2xl pointer-events-none z-0" />
            )}

          </div>

        </div>

        {/* ======================================================== */}
        {/* SEBELAH KANAN: Floating Login Card Muncul Saat Lampu ON  */}
        {/* ======================================================== */}
        <div 
          className={`w-full max-w-[430px] rounded-3xl p-7 sm:p-9 transition-all duration-700 ease-out relative overflow-hidden backdrop-blur-xl border ${
            isLampOn
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto border-[#B48248]/60 border-l-[#FFCC00] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95),-15px_0_35px_-5px_rgba(255,190,0,0.35)]'
              : 'opacity-0 scale-95 translate-y-8 pointer-events-none border-transparent shadow-none'
          }`}
          style={{
            backgroundImage: `linear-gradient(145deg, rgba(30, 17, 10, 0.88) 0%, rgba(18, 10, 6, 0.94) 100%), url(${woodPlank2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Top Wooden Plank Header Moulding */}
          <div 
            className="absolute top-0 left-0 right-0 h-3 border-b border-[#D4A373]/30 shadow-xs" 
            style={{ 
              backgroundImage: `linear-gradient(rgba(45, 26, 14, 0.5), rgba(30, 16, 9, 0.7)), url(${woodPlank2})`, 
              backgroundSize: "cover", 
              backgroundPosition: "center" 
            }} 
          />

          {/* Inner Brass Inlay Ring & Corner Screws */}
          <div className="absolute inset-2.5 border border-[#D4A373]/25 rounded-2xl pointer-events-none" />
          <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-[#FFE2A8] shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none" />
          <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[#FFE2A8] shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-[#FFE2A8] shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-[#FFE2A8] shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none" />

          {/* Card Header: Welcome Back with Logo */}
          <div className="text-center mb-6 pt-2 relative z-10">
            <div className="flex justify-center mb-3.5">
              <VaultraLogo variant="icon" size={54} className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF8F5] drop-shadow-md">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-[#D7C4B0] mt-1.5 font-medium">
              Akses brankas tautan pribadi Anda
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs shadow-inner relative z-10">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            {/* Username Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#B48248]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#120B07]/90 border border-[#4A2E1B] text-sm text-[#FAF8F5] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50 focus:border-[#FFCC00] transition-all shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#B48248]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#120B07]/90 border border-[#4A2E1B] text-sm text-[#FAF8F5] placeholder-[#8A7563] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50 focus:border-[#FFCC00] transition-all shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9E826A] hover:text-[#FAF8F5] cursor-pointer"
                aria-label="Lihat password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Primary Action Button: Glowing Yellow / Amber Woodcraft Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-2 rounded-2xl text-sm font-black text-[#1C1008] bg-gradient-to-r from-[#FFCC00] via-[#FFD633] to-[#FFAA00] hover:brightness-110 active:brightness-95 border border-[#FFE2A8]/70 shadow-[0_8px_25px_rgba(255,204,0,0.4)] hover:shadow-[0_12px_32px_rgba(255,204,0,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-50 tracking-wide"
            >
              {loading ? 'Memproses Masuk...' : 'Sign In'}
            </button>

            {/* Kembali Button to Dashboard */}
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-semibold text-[#D7C4B0] hover:text-[#FAF8F5] bg-[#140C07]/60 hover:bg-[#140C07] border border-[#4A2E1B]/60 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B48248]" />
              <span>Kembali ke Beranda</span>
            </button>

            {/* Hallmark Signature: MADE BY ADE7 (SVG) */}
            <div className="pt-2 flex justify-center items-center">
              <svg 
                viewBox="0 0 220 32" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-48 sm:w-52 h-auto opacity-75 hover:opacity-100 transition-opacity drop-shadow-sm select-none"
                aria-label="Made By Ade7"
              >
                <defs>
                  <linearGradient id="ade7Gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE5B4" />
                    <stop offset="50%" stopColor="#E5B57A" />
                    <stop offset="100%" stopColor="#FFCC00" />
                  </linearGradient>
                  <linearGradient id="ade7Line" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#B48248" stopOpacity="0" />
                    <stop offset="50%" stopColor="#FFCC00" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#B48248" stopOpacity="0" />
                  </linearGradient>
                  <filter id="ade7Glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#FFCC00" floodOpacity="0.45" />
                  </filter>
                </defs>

                {/* Left Accent Wing */}
                <line x1="10" y1="16" x2="48" y2="16" stroke="url(#ade7Line)" strokeWidth="1.2" strokeLinecap="round" />
                <polygon points="53,16 56,13 59,16 56,19" fill="#FFCC00" opacity="0.9" />

                {/* Centered Typography: MADE BY ADE7 */}
                <g filter="url(#ade7Glow)">
                  <text 
                    x="110" 
                    y="20" 
                    fontFamily="system-ui, -apple-system, 'Plus Jakarta Sans', sans-serif" 
                    fontSize="10.5" 
                    fontWeight="800" 
                    letterSpacing="3.2" 
                    textAnchor="middle" 
                    fill="url(#ade7Gold)"
                  >
                    MADE BY ADE7
                  </text>
                </g>

                {/* Right Accent Wing */}
                <polygon points="161,16 164,13 167,16 164,19" fill="#FFCC00" opacity="0.9" />
                <line x1="172" y1="16" x2="210" y2="16" stroke="url(#ade7Line)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>

          </form>

          {/* Bottom Wood Plank Accent Line */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-2 opacity-75" 
            style={{ 
              backgroundImage: `url(${woodPlank2})`, 
              backgroundSize: "cover", 
              backgroundPosition: "center" 
            }} 
          />
        </div>

      </div>
    </div>
  );
}



