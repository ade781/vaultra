import React, { useId } from 'react';

/**
 * VaultraLogo - Pure Minimalist SVG Logo & Icon Component for Vaultra
 * Enhanced with useId() to prevent SVG gradient collisions across SPA renders.
 * 100% vector scalability, zero layout thrashing, ultra-fast render.
 */
export default function VaultraLogo({ variant = 'icon', size = 36, className = '' }) {
  const rawId = useId();
  // Sanitize id for valid CSS/SVG selector
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const darkGradId = `vaultraDark_${safeId}`;
  const brassGradId = `vaultraBrass_${safeId}`;
  const glowGradId = `vaultraGlow_${safeId}`;

  const iconMark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${variant === 'icon' ? className : ''}`}
      aria-label="Vaultra Emblem"
    >
      <defs>
        {/* Obsidian Walnut Wood Plaque Gradient */}
        <linearGradient id={darkGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A180E" />
          <stop offset="50%" stopColor="#1C1008" />
          <stop offset="100%" stopColor="#100804" />
        </linearGradient>

        {/* Polished Warm Brass Metallic Gradient */}
        <linearGradient id={brassGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2CE" />
          <stop offset="30%" stopColor="#F5BF4F" />
          <stop offset="70%" stopColor="#D49132" />
          <stop offset="100%" stopColor="#9C5D17" />
        </linearGradient>

        {/* Subtle Brass Shimmer Glow */}
        <linearGradient id={glowGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE3B3" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#B48248" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* 1. Architectural Squircle Plaque */}
      <rect
        x="8"
        y="8"
        width="112"
        height="112"
        rx="30"
        fill={`url(#${darkGradId})`}
        stroke="#B48248"
        strokeWidth="2.5"
      />

      {/* 2. Delicate Gold Hairline Border Inlay */}
      <rect
        x="13.5"
        y="13.5"
        width="101"
        height="101"
        rx="25"
        fill="none"
        stroke={`url(#${glowGradId})`}
        strokeWidth="1.2"
      />

      {/* 3. Vault Padlock Arch (Shackle) */}
      <path
        d="M44 54 V36 C44 25 53 16 64 16 C75 16 84 25 84 36 V54"
        stroke={`url(#${brassGradId})`}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* 4. Bold Geometric 'V' Monogram */}
      <path
        d="M33 46 L61.5 96 C62.8 98.2 65.2 98.2 66.5 96 L95 46"
        stroke={`url(#${brassGradId})`}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 5. Central Vault Dial & Keyhole Silhouette */}
      <circle
        cx="64"
        cy="62"
        r="11"
        fill="#140A05"
        stroke={`url(#${brassGradId})`}
        strokeWidth="2.2"
      />
      <circle cx="64" cy="59" r="2.8" fill="#FFF2CE" />
      <polygon points="62.2,59.5 65.8,59.5 65.1,67 62.9,67" fill="#FFF2CE" />
    </svg>
  );

  if (variant === 'icon') {
    return iconMark;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {iconMark}
      <div className="flex flex-col justify-center leading-none select-none">
        <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#261C14] block leading-none font-sans">
          Vaultra
        </span>
        <span className="text-[10px] font-bold text-[#7A4F26] tracking-widest uppercase block mt-1 font-mono">
          Woodcraft Vault
        </span>
      </div>
    </div>
  );
}
