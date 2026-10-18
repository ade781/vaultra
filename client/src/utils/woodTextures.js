import woodPlank1 from '../assets/wood-plank-1.jpg';
import woodPlank2 from '../assets/wood-plank-2.jpg';
import woodPlank3 from '../assets/wood-plank-3.jpg';
import woodPlank6 from '../assets/wood-plank-6.jpg';

export const WOOD_PLANKS = [
  woodPlank1,
  woodPlank2,
  woodPlank3,
  woodPlank6,
];

/**
 * Returns a deterministic wood texture based on an item's id or index.
 * Consistently maps items across the 4 curated, ultra-lightweight wood textures.
 */
export function getWoodPlank(seed = 0) {
  if (typeof seed === 'string') {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % WOOD_PLANKS.length;
    return WOOD_PLANKS[idx];
  }
  const num = Number(seed) || 0;
  return WOOD_PLANKS[Math.abs(num) % WOOD_PLANKS.length];
}

export default WOOD_PLANKS;
