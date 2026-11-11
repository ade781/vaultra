/**
 * soundHelper.js - Procedural Web Audio API Soundscape & Haptic Feedback for Vaultra
 * Zero external MP3 assets, < 2 KB, non-blocking via requestAnimationFrame
 */

let sharedAudioCtx = null;
const MUTE_KEY = 'vaultra_sound_muted';

export function isSoundMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSoundMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('vaultra:sound-mute-changed', { detail: { muted } }));
  } catch {
    // Ignore localStorage errors
  }
}

export function toggleSoundMute() {
  const current = isSoundMuted();
  setSoundMuted(!current);
  return !current;
}

export function triggerHaptic(pattern = [15]) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

function getAudioContext() {
  if (isSoundMuted()) return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Procedural Vintage Brass Switch Latch (Lamp pull-string)
 */
export function playSwitchSound(isOn = true) {
  triggerHaptic([15, 20]);
  requestAnimationFrame(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      const startFreq = isOn ? 950 : 620;
      const endFreq = isOn ? 1400 : 420;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Web Audio playback failure safely ignored
    }
  });
}

/**
 * Procedural Vault Tumbler Dial Tick (Copy button, Privacy toggle, Quick Action)
 */
export function playTumblerTick() {
  triggerHaptic([10]);
  requestAnimationFrame(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.02);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Ignore
    }
  });
}

/**
 * Procedural Wooden Drawer Glide (Modal Open / Expand)
 */
export function playDrawerGlide() {
  requestAnimationFrame(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Soft filtered noise/low hum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.06);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
    } catch {
      // Ignore
    }
  });
}

