import { HeroOverlay } from './HeroOverlay';
import { HeroScene } from './HeroScene';

export function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Layer 1: 3D Canvas */}
      <HeroScene />

      {/* Layer 2: UI Overlay */}
      <HeroOverlay />
    </section>
  );
}
