import { Canvas } from '@react-three/fiber';
import { ScrollCamera } from './canvas/ScrollCamera';
import { Scene } from './canvas/Scene';

// ============================================
// GLOBAL CANVAS COMPONENT
// ============================================
// Fixed viewport-sized canvas that stays in place
// while content scrolls over/under it

export function GlobalCanvas() {
  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ScrollCamera />
        <Scene />
      </Canvas>
    </div>
  );
}
