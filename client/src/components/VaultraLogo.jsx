import React from 'react';

/**
 * VaultraLogo - SVG Logo & Icon Component for Vaultra
 * @param {'icon' | 'full'} variant - 'icon' renders emblem only, 'full' renders emblem + logotype
 * @param {number} size - pixel dimension (for icon: size x size; for full: scaled proportionally)
 * @param {string} className - optional extra tailwind classes
 */
export default function VaultraLogo({ variant = 'icon', size = 36, className = '' }) {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label="Vaultra Logo Icon"
      >
        <defs>
          <linearGradient id="vLogoWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3D2415" />
            <stop offset="35%" stopColor="#5C361F" />
            <stop offset="70%" stopColor="#442817" />
            <stop offset="100%" stopColor="#24140B" />
          </linearGradient>

          <linearGradient id="vLogoBrass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2CE" />
            <stop offset="25%" stopColor="#E5B57A" />
            <stop offset="50%" stopColor="#D49746" />
            <stop offset="75%" stopColor="#FFCC00" />
            <stop offset="100%" stopColor="#8C5824" />
          </linearGradient>

          <linearGradient id="vLogoCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A0F08" />
            <stop offset="100%" stopColor="#2D1A0E" />
          </linearGradient>
        </defs>

        {/* Outer Wooden Squircle Plaque */}
        <rect
          x="6"
          y="6"
          width="116"
          height="116"
          rx="28"
          fill="url(#vLogoWood)"
          stroke="#B48248"
          strokeWidth="2.5"
        />

        {/* Wood Seams */}
        <line x1="8" y1="42" x2="120" y2="42" stroke="#1F1109" strokeWidth="1.8" opacity="0.6" />
        <line x1="8" y1="84" x2="120" y2="84" stroke="#1F1109" strokeWidth="1.8" opacity="0.6" />

        {/* Brass Inner Border */}
        <rect
          x="12"
          y="12"
          width="104"
          height="104"
          rx="22"
          fill="none"
          stroke="url(#vLogoBrass)"
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />

        {/* Corner Rivets */}
        <circle cx="18" cy="18" r="2.5" fill="#FFE2A8" />
        <circle cx="110" cy="18" r="2.5" fill="#FFE2A8" />
        <circle cx="18" cy="110" r="2.5" fill="#FFE2A8" />
        <circle cx="110" cy="110" r="2.5" fill="#FFE2A8" />

        {/* Shackle Vault Arch */}
        <path
          d="M46 54 C46 42 54 34 64 34 C74 34 82 42 82 54"
          stroke="url(#vLogoBrass)"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* 'V' Monogram */}
        <path
          d="M36 46 L58 92 C60 96 68 96 70 92 L92 46"
          stroke="url(#vLogoBrass)"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Central Escutcheon / Keyhole */}
        <circle cx="64" cy="63" r="14" fill="url(#vLogoCore)" stroke="url(#vLogoBrass)" strokeWidth="2.2" />
        <circle cx="64" cy="60.5" r="3.6" fill="#FFDF80" />
        <polygon points="61.8,61.5 66.2,61.5 65.2,68.5 62.8,68.5" fill="#FFDF80" />
      </svg>
    );
  }

  // Full Brand Variant
  const aspectWidth = Math.round((size / 80) * 320);
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <VaultraLogo variant="icon" size={size} />
      <div className="flex flex-col justify-center leading-none">
        <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#261C14] block leading-none">
          Vaultra
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold text-[#8C6239] tracking-wider uppercase block mt-1">
          Woodcraft Vault
        </span>
      </div>
    </div>
  );
}