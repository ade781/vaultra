import React, { useState } from 'react';
import { ArrowLeft, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import * as api from '../services/api';
import { getWoodPlank } from '../utils/woodTextures';

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
  const [isLampOn, setIsLampOn] = useState(true);
  const [isPullingCord, setIsPullingCord] = useState(false);

  const toggleLamp = () => {
    setIsPullingCord(true);
    const nextState = !isLampOn;
    playSwitchSound(nextState);

    setTimeout(() => {
      setIsLampOn(nextState);
      setIsPullingCord(false);
    }, 160);
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
      
      {/* 1. Blurred Bright Wood Plank Background for Login Page (Kayu Cerah: wood-plank-7) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-all duration-700"
        style={{
          backgroundImage: `url(${getWoodPlank(7)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: isLampOn 
            ? 'blur(16px) brightness(1.15) saturate(1.1)' 
            : 'blur(16px) brightness(0.18) saturate(0.5)',
          transform: 'scale(1.08)',
        }}
      />

      {/* 2. Ambient Lighting Glow radiating from the lamp over the wooden wall */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
          isLampOn ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at 28% 42%, rgba(255, 225, 120, 0.45) 0%, rgba(240, 175, 65, 0.28) 38%, rgba(180, 120, 40, 0.16) 68%, rgba(40, 25, 12, 0.35) 100%)',
        }}
      />

      {/* 3. Dark Shadow Overlay when Lamp is OFF */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
          isLampOn ? 'opacity-0' : 'opacity-92 bg-[#090705]'
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
              background: 'linear-gradient(180deg, rgba(255, 240, 160, 0.72) 0%, rgba(255, 205, 80, 0.42) 35%, rgba(230, 160, 45, 0.18) 75%, transparent 100%)',
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
                    ? 'bg-[#FFFBE8] shadow-[0_0_20px_6px_#FFE58F,0_0_55px_20px_rgba(255,195,65,0.85),0_0_90px_35px_rgba(255,150,20,0.4)] border border-[#FFF4CC]'
                    : 'bg-[#1C1712] shadow-[inset_0_3px_6px_rgba(0,0,0,0.9)] opacity-85 border border-[#2D241C]'
                }`}
              />

              {/* Interactive Pull String (Tali Saklar Gantung dengan Kayu Akor di Kanan) */}
              <div 
                onClick={toggleLamp}
                className="absolute top-18 sm:top-22 right-4 sm:right-5 cursor-pointer group flex flex-col items-center z-30"
                title="Tarik tali untuk menyalakan/mematikan lampu"
              >
                <div 
                  className={`w-[1.5px] bg-[#2E2822] shadow-[1px_1px_2px_rgba(0,0,0,0.8)] transition-all duration-150 origin-top ${
                    isPullingCord ? 'h-18 sm:h-22' : 'h-14 sm:h-16'
                  }`}
                />
                <div 
                  className={`w-3.5 h-6.5 rounded-full border transition-all duration-150 transform group-hover:scale-110 active:scale-95 shadow-[2px_6px_14px_rgba(0,0,0,0.85),inset_1px_1px_2px_rgba(255,255,255,0.4),inset_-1px_-1px_3px_rgba(0,0,0,0.6)] ${
                    isPullingCord ? 'translate-y-2' : 'translate-y-0'
                  } ${
                    isLampOn 
                      ? 'bg-gradient-to-b from-[#E2B77E] via-[#C9965B] to-[#8C5824] border-[#FFE2A8]/70 text-white shadow-[#C9965B]/30' 
                      : 'bg-gradient-to-b from-[#5C422A] to-[#302114] border-[#7D5A38]/50 text-white/50'
                  }`}
                >
                  <div className="w-1 h-3 mx-auto mt-1 rounded-full bg-white/35" />
                </div>
              </div>
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
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-72 sm:w-84 h-12 rounded-[100%] bg-gradient-to-r from-transparent via-[#FFC843]/25 to-transparent blur-xl pointer-events-none z-0" />
            )}

          </div>

        </div>

        {/* ======================================================== */}
        {/* SEBELAH KANAN: Floating Login Card dengan Deep Shadow     */}
        {/* ======================================================== */}
        <div 
          className={`w-full max-w-[420px] rounded-3xl p-7 sm:p-9 transition-all duration-700 relative overflow-hidden backdrop-blur-xl ${
            isLampOn
              ? 'bg-[#1C1A17]/90 border border-[#3A332A] border-l-[#FFCC00]/30 shadow-[20px_25px_60px_-10px_rgba(0,0,0,0.9),0_10px_25px_rgba(0,0,0,0.8)]'
              : 'bg-[#14120F]/95 border border-[#262018] shadow-[20px_25px_60px_-10px_rgba(0,0,0,0.95)] opacity-85'
          }`}
        >
          {/* Subtle Top Wooden Trim Line for Vaultra Craft Identity */}
          <div 
            className="absolute top-0 left-0 right-0 h-1.5 opacity-85" 
            style={{ 
              backgroundImage: `url(${getWoodPlank(5)})`, 
              backgroundSize: "cover", 
              backgroundPosition: "center" 
            }} 
          />

          {/* Card Header: Welcome Back */}
          <div className="text-center mb-6 pt-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F5] drop-shadow-sm">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-[#9E9282] mt-1.5">
              Enter your details to access your account
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs shadow-inner">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7D7365]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#14120F] border border-[#2C2720] text-sm text-[#FAF8F5] placeholder-[#665D50] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50 focus:border-[#FFCC00] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7D7365]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#14120F] border border-[#2C2720] text-sm text-[#FAF8F5] placeholder-[#665D50] focus:outline-none focus:ring-2 focus:ring-[#FFCC00]/50 focus:border-[#FFCC00] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#7D7365] hover:text-[#FAF8F5] cursor-pointer"
                aria-label="Lihat password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Primary Action Button: Vibrant Gold/Yellow Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-2 rounded-2xl text-sm font-bold text-[#14120F] bg-[#FFCC00] hover:bg-[#FFD633] active:bg-[#E6B800] shadow-[0_8px_20px_rgba(255,204,0,0.3)] hover:shadow-[0_12px_28px_rgba(255,204,0,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Kembali Button to Dashboard */}
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-semibold text-[#9E9282] hover:text-[#FAF8F5] bg-transparent hover:bg-white/5 border border-white/5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}



