import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Carousel } from './Carousel';

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Carousel Logic: Ring/Circle formation */}
        {/* Positioned in lower half (y: -4) and behind UI (if desired) but prompts says "moves over bottom of title" */}
        {/* Z-Index logic handled in CSS: Canvas z-20 > Title z-10 */}
        <group position={[0, -7, 0]}>
          <Carousel radius={7} />
        </group>
      </Canvas>
    </div>
  );
}
