import React from 'react';

/**
 * VaultraLogo - Pure Minimalist SVG Logo & Icon Component for Vaultra
 * Crafted with Anti-Slop & Design-Taste guidelines:
 * - Zero CPU-heavy SVG drop-shadow filters (100% vector scalability & ultra-low INP)
 * - Clean geometric shackle arch + bold architectural 'V' + precision vault keyhole
 * - High-contrast palette: Rich Dark Obsidian Walnut & Warm Polished Brass
 * - Fully accessible with proper aria labels and WCAG AA compliance
 *
 * @param {'icon' | 'full'} variant - 'icon' renders emblem mark only, 'full' renders emblem + logotype
 * @param {number} size - pixel dimension (for icon: size x size; for full: mark size)
 * @param {string} className - optional extra tailwind classes
 */
export default function VaultraLogo({ variant = 'icon', size = 36, className = '' }) {
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
        <linearGradient id="vaultraDarkBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#25170F" />
          <stop offset="100%" stopColor="#120A05" />
        </linearGradient>

        {/* Polished Warm Brass Metallic Gradient */}
        <linearGradient id="vaultraBrass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2CE" />
          <stop offset="35%" stopColor="#F5BF4F" />
          <stop offset="100%" stopColor="#B8731F" />
        </linearGradient>
      </defs>

      {/* 1. Architectural Squircle Plaque */}
      <rect
        x="10"
        y="10"
        width="108"
        height="108"
        rx="28"
        fill="url(#vaultraDarkBase)"
        stroke="#8C5C2E"
        strokeWidth="2"
      />

      {/* 2. Delicate Gold Hairline Border Inlay */}
      <rect
        x="15"
        y="15"
        width="98"
        height="98"
        rx="23"
        fill="none"
        stroke="#F5BF4F"
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />

      {/* 3. Vault Padlock Arch (Shackle) */}
      <path
        d="M45 52 V38 C45 27.5 53.5 19 64 19 C74.5 19 83 27.5 83 38 V52"
        stroke="url(#vaultraBrass)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* 4. Bold Geometric 'V' Monogram */}
      <path
        d="M34 48 L61.5 94 C62.8 96.2 65.2 96.2 66.5 94 L94 48"
        stroke="url(#vaultraBrass)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 5. Central Vault Dial & Keyhole Silhouette */}
      <circle
        cx="64"
        cy="62"
        r="9.5"
        fill="#120A05"
        stroke="url(#vaultraBrass)"
        strokeWidth="2"
      />
      <circle cx="64" cy="59.5" r="2.4" fill="#FFF2CE" />
      <polygon points="62.5,60 65.5,60 64.9,66.5 63.1,66.5" fill="#FFF2CE" />
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
