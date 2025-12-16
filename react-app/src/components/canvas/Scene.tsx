import { Environment } from '@react-three/drei';
import { Carousel } from '../hero/Carousel';
import { IndustryCylinder } from './IndustryCylinder';

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

      {/* Additional lights for the cylinder */}
      <pointLight
        position={[-5, 0, 5]}
        intensity={0.5}
        color="#4a90a4"
      />
      <pointLight
        position={[5, -2, 3]}
        intensity={0.3}
        color="#ffffff"
      />

      {/* Hero Section 3D Content (scroll position ~0) */}
      {/* Carousel positioned so it appears at the hero section */}
      <group position={[0, -7.6, 0]}>
        <Carousel radius={11} />
      </group>

      <group position={[0, -67.8, 0]}>
        <IndustryCylinder />
      </group>
    </>
  );
}
