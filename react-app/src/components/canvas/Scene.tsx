import { Environment } from '@react-three/drei';
import { Carousel } from '../hero/Carousel';

// ============================================
// GLOBAL 3D SCENE
// ============================================
// All 3D elements positioned in world space
// Camera scrolls through them based on page scroll

export function Scene() {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Hero Section 3D Content (scroll position ~0) */}
      {/* Carousel positioned so it appears at the hero section */}
      <group position={[0, -7.8, 0]}>
        <Carousel radius={7} />
      </group>
    </>
  );
}
