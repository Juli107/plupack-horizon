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
    <div className="fixed inset-0 z-10 pointer-events-none w-screen h-screen">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        className="bg-transparent pointer-events-none"
      >
        {/* Camera is controlled by ScrollCamera using keyframes */}
        <ScrollCamera />
        <Scene />
      </Canvas>
    </div>
  );
}
