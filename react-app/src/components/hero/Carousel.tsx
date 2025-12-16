import { Center, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { RenderProduct } from '../canvas/Products';

const ITEMS = [
  'food_container.glb',
  'plastic_bag.glb',
  'detergent.glb',
  'paper_rolls.glb',
  'aluminum_roll.glb',
  'gloves.glb',
  'tape.glb',
  'film_stretch.glb',
  'napkins.glb',
];

interface CarouselProps {
  radius?: number;
  count?: number; // Ignored effectively as we use fixed items, or we can slice the array
}

export function Carousel({ radius = 6 }: CarouselProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Interaction state
  const velocity = useRef(0.1); // Base rotation speed

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
  const objects = ITEMS.map((filename, i) => {
    const count = ITEMS.length;
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return (
      <group key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
        <Float
          speed={1.5}
          rotationIntensity={0.05}
          floatIntensity={0.2}
          floatingRange={[-0.2, 0.2]}
        >
          <group>
            <Center>
              <group rotation={[0, 0, 0]}>
                <RenderProduct name={filename} scale={10} />
              </group>
            </Center>
          </group>
        </Float>
      </group>
    );
  });

  return (
    // Tilt: Slight forward tilt (x-rotation)
    <group position={[0, -3.5, 0]} rotation={[0, 0, 0]}>
      <group ref={groupRef}>{objects}</group>
    </group>
  );
}
