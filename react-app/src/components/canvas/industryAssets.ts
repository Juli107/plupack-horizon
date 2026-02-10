import { useGLTF } from '@react-three/drei';
import industryWrapUrl from '../../assets/models/optimized/industry_wrap.glb';

export { industryWrapUrl };

export const INDUSTRY_ITEM_NAMES = [
  'film_stretch.glb',
  'tape.glb',
  'carton.glb',
  'bubble_wrap.glb',
  'aluminum_roll.glb',
  'food_container.glb',
  'plastic_bag.glb',
  'plastic_wrap.glb',
  'paper_rolls.glb',
  'napkins.glb',
  'gloves.glb',
  'detergent.glb',
];

export function preloadIndustryWrapModel() {
  useGLTF.preload(industryWrapUrl);
}
