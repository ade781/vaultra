import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * PullCord - Interactive Elastic Lamp Pull String with Physics Spring Snapback
 * Supports:
 * - Direct mouse/touch dragging
 * - Elastic stretching and resistance
 * - Rubber-like snapback ("menjepret") with damped harmonic oscillation
 * - Pendulum sway ("bergelantungan")
 * - Click fallback
 */
export default function PullCord({ isLampOn, onToggle }) {
  const REST_LENGTH = 64; // resting length in pixels
  const TRIGGER_DIST = 36; // distance needed to trigger lamp switch
  const MAX_STRETCH = 145; // maximum stretch constraint

  const [cordY, setCordY] = useState(REST_LENGTH);
  const [cordX, setCordX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasToggled, setHasToggled] = useState(false);

  const stateRef = useRef({
    y: REST_LENGTH,
    x: 0,
    vy: 0,
    vx: 0,
    isDragging: false,
    hasToggled: false,
    startY: 0,
    startX: 0,
    animId: null,
  });

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current.isLampOn = isLampOn;
  }, [isLampOn]);

  // Spring Snapback Animation Loop
  const startSpringAnimation = useCallback(() => {
    if (stateRef.current.animId) {
      cancelAnimationFrame(stateRef.current.animId);
    }

    const springK = 0.085; // rubber stiffness (menjepret kuat)
    const dampingY = 0.76; // rubber damping
    const pendK = 0.045; // pendulum sway stiffness
    const dampingX = 0.88; // pendulum sway damping

    const step = () => {
      const s = stateRef.current;
      if (s.isDragging) return;

      // Vertical spring force: F = -k*(y - rest) - c*vy
      const dy = s.y - REST_LENGTH;
      const ay = -springK * dy;
      s.vy = (s.vy + ay) * dampingY;
      s.y += s.vy;

      // Horizontal pendulum force
      const ax = -pendK * s.x;
      s.vx = (s.vx + ax) * dampingX;
      s.x += s.vx;

      setCordY(s.y);
      setCordX(s.x);

      // Continue until motion decays to rest
      if (Math.abs(dy) > 0.4 || Math.abs(s.vy) > 0.4 || Math.abs(s.x) > 0.4 || Math.abs(s.vx) > 0.4) {
        s.animId = requestAnimationFrame(step);
      } else {
        s.y = REST_LENGTH;
        s.x = 0;
        s.vy = 0;
        s.vx = 0;
        setCordY(REST_LENGTH);
        setCordX(0);
        s.animId = null;
      }
    };

    stateRef.current.animId = requestAnimationFrame(step);
  }, []);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (stateRef.current.animId) {
        cancelAnimationFrame(stateRef.current.animId);
      }
    };
  }, []);

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (stateRef.current.animId) {
      cancelAnimationFrame(stateRef.current.animId);
      stateRef.current.animId = null;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if capture fails
    }

    const s = stateRef.current;
    s.isDragging = true;
    s.hasToggled = false;
    s.startY = e.clientY;
    s.startX = e.clientX;
    s.vy = 0;
    s.vx = 0;

    setIsDragging(true);
    setHasToggled(false);
  };

  // Pointer Move
  const handlePointerMove = (e) => {
    const s = stateRef.current;
    if (!s.isDragging) return;

    e.preventDefault();
    const rawDy = e.clientY - s.startY;
    const rawDx = e.clientX - s.startX;

    // Apply elastic resistance as cord is pulled further down
    let newY = REST_LENGTH + Math.max(0, rawDy * 0.85);
    if (newY > MAX_STRETCH) {
      newY = MAX_STRETCH + (newY - MAX_STRETCH) * 0.2;
    }

    // Side-to-side deflection
    const newX = Math.max(-28, Math.min(28, rawDx * 0.4));

    s.y = newY;
    s.x = newX;
    setCordY(newY);
    setCordX(newX);

    // Trigger lamp toggle once threshold passed
    if (!s.hasToggled && newY - REST_LENGTH >= TRIGGER_DIST) {
      s.hasToggled = true;
      setHasToggled(true);
      onToggle();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(25); } catch {}
      }
    }
  };

  // Pointer Up / Cancel
  const handlePointerUp = (e) => {
    const s = stateRef.current;
    if (!s.isDragging) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    s.isDragging = false;
    setIsDragging(false);

    // If it was a short tap / quick click without dragging
    const rawDy = e.clientY - s.startY;
    if (!s.hasToggled && Math.abs(rawDy) < 8) {
      // Quick pull snap
      onToggle();
      s.y = REST_LENGTH + 32;
      s.vy = -18; // strong initial snapback velocity
    } else {
      // Release from drag: snap back with momentum
      s.vy = -(s.y - REST_LENGTH) * 0.35;
      s.vx = -s.x * 0.3;
    }

    startSpringAnimation();
  };

  // SVG dimensions
  const svgWidth = 80;
  const svgHeight = 180;
  const anchorX = 40;
  const anchorY = 0;
  const beadX = anchorX + cordX;
  const beadY = cordY;

  // Bezier curve control point for natural drooping string
  const ctrlX = anchorX + cordX * 0.45;
  const ctrlY = anchorY + (beadY - anchorY) * 0.55;

  return (
    <div
      className="absolute top-18 sm:top-22 right-4 sm:right-6 z-30 select-none touch-none cursor-grab active:cursor-grabbing"
      style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Tarik ke bawah atau klik untuk menyalakan/mematikan lampu"
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="overflow-visible pointer-events-none"
      >
        <defs>
          {/* Wooden Bead Texture Gradient */}
          <linearGradient id="beadWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A373" />
            <stop offset="35%" stopColor="#A86E3C" />
            <stop offset="70%" stopColor="#7A4C24" />
            <stop offset="100%" stopColor="#4A2B11" />
          </linearGradient>

          {/* Brass Ring Gradient */}
          <linearGradient id="beadBrass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF2CE" />
            <stop offset="50%" stopColor="#FFCC00" />
            <stop offset="100%" stopColor="#9E6B28" />
          </linearGradient>

          {/* Bead Drop Shadow */}
          <filter id="beadShadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* 1. Hanging String with Bezier Curve */}
        <path
          d={`M ${anchorX} ${anchorY} Q ${ctrlX} ${ctrlY} ${beadX} ${beadY}`}
          fill="none"
          stroke={isLampOn ? '#8C6847' : '#423325'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Cord Highlights / Ball Beads Effect */}
        <path
          d={`M ${anchorX} ${anchorY} Q ${ctrlX} ${ctrlY} ${beadX} ${beadY}`}
          fill="none"
          stroke={isLampOn ? '#FFE49E' : '#7D6246'}
          strokeWidth="1.8"
          strokeDasharray="2 4"
          strokeOpacity={isLampOn ? '0.75' : '0.4'}
          strokeLinecap="round"
        />

        {/* 2. Top Brass Ferrule Ring above Bead */}
        <g transform={`translate(${beadX}, ${beadY})`}>
          <rect
            x="-2"
            y="-2"
            width="4"
            height="3"
            rx="1"
            fill="url(#beadBrass)"
            stroke="#5C3B14"
            strokeWidth="0.5"
          />

          {/* 3. Carved Wooden Acorn / Bead Handle */}
          <g filter="url(#beadShadow)">
            {/* Main Acorn Teardrop */}
            <path
              d="M 0 0 C 6 2, 7 12, 4 19 C 2 23, -2 23, -4 19 C -7 12, -6 2, 0 0 Z"
              fill="url(#beadWood)"
              stroke={isLampOn ? '#FFE2A8' : '#6B4522'}
              strokeWidth="0.8"
            />

            {/* Brass Middle Accent Band */}
            <rect
              x="-4.5"
              y="7"
              width="9"
              height="2"
              rx="0.5"
              fill="url(#beadBrass)"
            />

            {/* 3D Curved Light Reflection */}
            <ellipse
              cx="-1.5"
              cy="9"
              rx="1.2"
              ry="5"
              fill="#FFFFFF"
              fillOpacity={isLampOn ? '0.45' : '0.2'}
            />

            {/* Bottom Brass Ball Finial */}
            <circle
              cx="0"
              cy="20.5"
              r="2"
              fill="url(#beadBrass)"
              stroke="#4A2B11"
              strokeWidth="0.4"
            />
          </g>
        </g>
      </svg>

      {/* Subtle Glowing Pull Hint when lamp is OFF */}
      {!isLampOn && !isDragging && (
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap animate-bounce"
          style={{ transform: `translate(${cordX}px, ${cordY + 28}px)` }}
        >
          <span className="px-2 py-0.5 rounded-full bg-[#1A0F08]/90 border border-[#FFCC00]/50 text-[#FFDF80] text-[10px] font-bold shadow-[0_0_10px_rgba(255,204,0,0.5)]">
            Tarik
          </span>
        </div>
      )}
    </div>
  );
}