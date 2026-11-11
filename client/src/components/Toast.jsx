import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const isPausedRef = useRef(false);
  const remainingRef = useRef(3000);
  const progressBarRef = useRef(null);

  const handleClose = useCallback(() => {
    setIsExiting((prev) => {
      if (prev) return prev;
      setTimeout(() => {
        if (onClose) onClose();
      }, 200);
      return true;
    });
  }, [onClose]);

  useEffect(() => {
    if (!message) return;

    setIsExiting(false);
    remainingRef.current = 3000;
    isPausedRef.current = false;
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '100%';
    }

    let animId;
    let lastTime = performance.now();

    const step = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isPausedRef.current) {
        remainingRef.current -= delta;
        const pct = Math.max(0, (remainingRef.current / 3000) * 100);
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${pct}%`;
        }

        if (remainingRef.current <= 0) {
          handleClose();
          return;
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [message, handleClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-opacity transition-transform duration-200 ease-out ${
        isExiting
          ? 'opacity-0 translate-y-3 scale-95 pointer-events-none'
          : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-bottom-3 duration-200'
      }`}
      onMouseEnter={() => {
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isPausedRef.current = false;
      }}
    >
      <div
        className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          isSuccess
            ? 'bg-[#FFFFFF] border-[#D4A373]/40 text-[#261C14] shadow-[#8C6239]/10'
            : 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-900/10'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-[#8C6239] shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        )}
        <span>{message}</span>
        <button
          onClick={handleClose}
          className="ml-2 p-1 rounded-md text-[#9E8C7C] hover:text-[#261C14] transition-colors"
          aria-label="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Thin Warm Wood-Brass Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 overflow-hidden">
          <div
            ref={progressBarRef}
            className={`h-full ${isSuccess ? 'bg-[#D4A373]' : 'bg-rose-400'}`}
            style={{ width: '100%', willChange: 'width' }}
          />
        </div>
      </div>
    </div>
  );
}
