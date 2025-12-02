import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface CarouselProps {
  radius?: number;
  count?: number;
}

export function Carousel({ radius = 6, count = 10 }: CarouselProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Interaction state
  const isDragging = useRef(false);
  const previousX = useRef(0);
  const velocity = useRef(0.1); // Base rotation speed
  const targetVelocity = useRef(0.1);

  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      previousX.current = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const delta = e.clientX - previousX.current;
      previousX.current = e.clientX;

      // Update velocity based on drag
      // Faster drag = higher velocity
      velocity.current += delta * 0.005;
      targetVelocity.current = velocity.current;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      canvas.releasePointerCapture(e.pointerId);
      // Reset target to base speed, let velocity decay to it
      targetVelocity.current = 0.1;
    };

    const onWheel = (e: WheelEvent) => {
      // Scroll boosts rotation
      velocity.current += e.deltaY * 0.001;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel); // Passive listener might be needed

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      // Decay velocity back to base speed (0.1)
      // Lerp velocity
      velocity.current = THREE.MathUtils.lerp(
        velocity.current,
        0.1,
        delta * 2
      );

      // Apply rotation
      groupRef.current.rotation.z += velocity.current * delta;
    }
  });

  // Create objects in a circle
  const objects = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return (
      <group key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
              color="#E0E0E0"
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
        </Float>
      </group>
    );
  });

  return (
    // Tilt: Slight forward tilt (x-rotation)
    <group rotation={[-0.2, 0, 0]}>
      <group ref={groupRef}>{objects}</group>
    </group>
  );
}
