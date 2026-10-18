import woodPlank1 from '../assets/wood-plank-1.jpg';
import woodPlank2 from '../assets/wood-plank-2.jpg';
import woodPlank3 from '../assets/wood-plank-3.jpg';
import woodPlank4 from '../assets/wood-plank-4.jpg';
import woodPlank5 from '../assets/wood-plank-5.jpg';
import woodPlank6 from '../assets/wood-plank-6.jpg';
import woodPlank7 from '../assets/wood-plank-7.jpg';
import woodPlank8 from '../assets/wood-plank-8.jpg';
import woodPlank9 from '../assets/wood-plank-9.jpg';
import woodPlank10 from '../assets/wood-plank-10.jpg';

export const WOOD_PLANKS = [
  woodPlank1,
  woodPlank2,
  woodPlank3,
  woodPlank4,
  woodPlank5,
  woodPlank6,
  woodPlank7,
  woodPlank8,
  woodPlank9,
  woodPlank10,
];

/**
 * Returns a deterministic wood texture based on an item's id or index.
 * This guarantees consistent appearance across renders while giving
 * natural variety across different items.
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
