import React, { useRef, useEffect, useCallback } from 'react';

/**
 * PullCord - Ultra Low-INP Elastic Lamp Pull String (< 16ms Pointer Response)
 * 1. Direct SVG DOM ref mutations to bypass React reconciliation.
 * 2. Decoupled toggle trigger via setTimeout(0) to free pointer event frame.
 * 3. CSS GPU drop-shadow replacing CPU software SVG feDropShadow.
 */
export default function PullCord({ isLampOn, onToggle }) {
  const REST_LENGTH = 64; // resting length in pixels
  const TRIGGER_DIST = 36; // distance needed to trigger lamp switch
  const MAX_STRETCH = 145; // maximum stretch constraint

  const pathStringRef = useRef(null);
  const pathHighlightRef = useRef(null);
  const beadGroupRef = useRef(null);

  const anchorX = 40;
  const anchorY = 0;

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
    rafMoveId: null,
  });

  // Direct DOM Mutator: Updates SVG path curves & bead translation with ZERO React overhead
  const updateDOMCoords = useCallback((x, y) => {
    const beadX = anchorX + x;
    const beadY = y;
    const ctrlX = anchorX + x * 0.45;
    const ctrlY = anchorY + (beadY - anchorY) * 0.55;
    const d = `M ${anchorX} ${anchorY} Q ${ctrlX} ${ctrlY} ${beadX} ${beadY}`;

    if (pathStringRef.current) pathStringRef.current.setAttribute('d', d);
    if (pathHighlightRef.current) pathHighlightRef.current.setAttribute('d', d);
    if (beadGroupRef.current) beadGroupRef.current.setAttribute('transform', `translate(${beadX}, ${beadY})`);
  }, []);

  // Spring Snapback Animation Loop (Damped harmonic spring + pendulum sway)
  const startSpringAnimation = useCallback(() => {
    if (stateRef.current.animId) {
      cancelAnimationFrame(stateRef.current.animId);
    }

    const springK = 0.085;
    const dampingY = 0.76;
    const pendK = 0.045;
    const dampingX = 0.88;

    const step = () => {
      const s = stateRef.current;
      if (s.isDragging) return;

      const dy = s.y - REST_LENGTH;
      const ay = -springK * dy;
      s.vy = (s.vy + ay) * dampingY;
      s.y += s.vy;

      const ax = -pendK * s.x;
      s.vx = (s.vx + ax) * dampingX;
      s.x += s.vx;

      updateDOMCoords(s.x, s.y);

      if (Math.abs(dy) > 0.4 || Math.abs(s.vy) > 0.4 || Math.abs(s.x) > 0.4 || Math.abs(s.vx) > 0.4) {
        s.animId = requestAnimationFrame(step);
      } else {
        s.y = REST_LENGTH;
        s.x = 0;
        s.vy = 0;
        s.vx = 0;
        updateDOMCoords(0, REST_LENGTH);
        s.animId = null;
      }
    };

    stateRef.current.animId = requestAnimationFrame(step);
  }, [updateDOMCoords]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      const s = stateRef.current;
      if (s.animId) cancelAnimationFrame(s.animId);
      if (s.rafMoveId) cancelAnimationFrame(s.rafMoveId);
    };
  }, []);

  // Sync initial resting coords on mount
  useEffect(() => {
    updateDOMCoords(0, REST_LENGTH);
  }, [updateDOMCoords]);

  // Pointer Down - Instantaneous execution
  const handlePointerDown = (e) => {
    const s = stateRef.current;
    if (s.animId) {
      cancelAnimationFrame(s.animId);
      s.animId = null;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }

    s.isDragging = true;
    s.hasToggled = false;
    s.startY = e.clientY;
    s.startX = e.clientX;
    s.vy = 0;
    s.vx = 0;
  };

  // Pointer Move - Throttled with RAF & decoupled toggle
  const handlePointerMove = (e) => {
    const s = stateRef.current;
    if (!s.isDragging) return;

    const rawDy = e.clientY - s.startY;
    const rawDx = e.clientX - s.startX;

    let newY = REST_LENGTH + Math.max(0, rawDy * 0.85);
    if (newY > MAX_STRETCH) {
      newY = MAX_STRETCH + (newY - MAX_STRETCH) * 0.2;
    }

    const newX = Math.max(-28, Math.min(28, rawDx * 0.4));
    s.y = newY;
    s.x = newX;

    // Trigger toggle decoupled from the pointer event frame (Guarantees < 16ms INP)
    if (!s.hasToggled && newY - REST_LENGTH >= TRIGGER_DIST) {
      s.hasToggled = true;
      setTimeout(() => {
        if (onToggle) onToggle();
      }, 0);
    }

    // Direct DOM update on next frame
    if (!s.rafMoveId) {
      s.rafMoveId = requestAnimationFrame(() => {
        updateDOMCoords(s.x, s.y);
        s.rafMoveId = null;
      });
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

    // Quick tap handling decoupled from event loop
    const rawDy = e.clientY - s.startY;
    if (!s.hasToggled && Math.abs(rawDy) < 8) {
      s.hasToggled = true;
      setTimeout(() => {
        if (onToggle) onToggle();
      }, 0);
      s.y = REST_LENGTH + 30;
      s.vy = -16;
    } else {
      s.vy = -(s.y - REST_LENGTH) * 0.35;
      s.vx = -s.x * 0.3;
    }

    startSpringAnimation();
  };

  const svgWidth = 80;
  const svgHeight = 180;
  const initialBeadX = anchorX;
  const initialBeadY = REST_LENGTH;
  const initialCtrlX = anchorX;
  const initialCtrlY = anchorY + (REST_LENGTH - anchorY) * 0.55;
  const initialD = `M ${anchorX} ${anchorY} Q ${initialCtrlX} ${initialCtrlY} ${initialBeadX} ${initialBeadY}`;

  return (
    <div
      className="absolute top-14 sm:top-18 md:top-22 right-2 sm:right-4 md:right-6 z-30 select-none touch-none cursor-grab active:cursor-grabbing will-change-transform"
      style={{ width: `${svgWidth}px`, height: `${svgHeight}px`, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Tarik ke bawah atau klik tali saklar"
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="overflow-visible pointer-events-none"
      >
        <defs>
          <linearGradient id="beadWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A373" />
            <stop offset="35%" stopColor="#A86E3C" />
            <stop offset="70%" stopColor="#7A4C24" />
            <stop offset="100%" stopColor="#4A2B11" />
          </linearGradient>

          <linearGradient id="beadBrass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF2CE" />
            <stop offset="50%" stopColor="#FFCC00" />
            <stop offset="100%" stopColor="#9E6B28" />
          </linearGradient>
        </defs>

        {/* 1. Hanging String with Bezier Curve */}
        <path
          ref={pathStringRef}
          d={initialD}
          fill="none"
          stroke={isLampOn ? '#8C6847' : '#423325'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Cord Highlights */}
        <path
          ref={pathHighlightRef}
          d={initialD}
          fill="none"
          stroke={isLampOn ? '#FFE49E' : '#7D6246'}
          strokeWidth="1.8"
          strokeDasharray="2 4"
          strokeOpacity={isLampOn ? '0.75' : '0.4'}
          strokeLinecap="round"
        />

        {/* 2. Bead Group with Hardware-Accelerated CSS Drop-Shadow */}
        <g 
          ref={beadGroupRef} 
          transform={`translate(${initialBeadX}, ${initialBeadY})`}
          style={{ filter: 'drop-shadow(1px 3px 2px rgba(0,0,0,0.8))' }}
        >
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

          {/* 3. Carved Wooden Acorn Handle */}
          <g>
            <path
              d="M 0 0 C 6 2, 7 12, 4 19 C 2 23, -2 23, -4 19 C -7 12, -6 2, 0 0 Z"
              fill="url(#beadWood)"
              stroke={isLampOn ? '#FFE2A8' : '#6B4522'}
              strokeWidth="0.8"
            />

            <rect
              x="-4.5"
              y="7"
              width="9"
              height="2"
              rx="0.5"
              fill="url(#beadBrass)"
            />

            <ellipse
              cx="-1.5"
              cy="9"
              rx="1.2"
              ry="5"
              fill="#FFFFFF"
              fillOpacity={isLampOn ? '0.45' : '0.2'}
            />

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
    </div>
  );
}