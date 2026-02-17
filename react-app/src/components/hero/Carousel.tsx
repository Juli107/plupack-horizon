import { Center, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RenderProduct } from '../canvas/Products';

export const CAROUSEL_ITEMS = [
  'detergent.glb',
  'paper_rolls.glb',
  'aluminum_roll.glb',
  'gloves.glb',
  'tape.glb',
  'film_stretch.glb',
  'napkins.glb',
  'food_container.glb',
  'plastic_bag.glb',
];

interface CarouselProps {
  radius?: number;
  count?: number;
}

export function Carousel({ radius = 6 }: CarouselProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    const update = () => {
      setIsMobile(mobileQuery.matches);
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    update();
    mobileQuery.addEventListener('change', update);
    reducedMotionQuery.addEventListener('change', update);

    return () => {
      mobileQuery.removeEventListener('change', update);
      reducedMotionQuery.removeEventListener('change', update);
    };
  }, []);

  const animationConfig = useMemo(
    () => ({
      baseVelocity: prefersReducedMotion ? 0 : isMobile ? 0.06 : 0.1,
      floatSpeed: isMobile ? 1 : 1.5,
      rotationIntensity: isMobile ? 0.03 : 0.05,
      floatIntensity: isMobile ? 0.12 : 0.2,
      floatingRange: isMobile
        ? ([-0.12, 0.12] as [number, number])
        : ([-0.2, 0.2] as [number, number]),
    }),
    [isMobile, prefersReducedMotion],
  );

  // Interaction state
  const velocity = useRef(animationConfig.baseVelocity);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      // Decay velocity back to base speed (0.1)
      // Lerp velocity
      velocity.current = THREE.MathUtils.lerp(
        velocity.current,
        animationConfig.baseVelocity,
        delta * 2,
      );

      // Apply rotation
      groupRef.current.rotation.z += velocity.current * delta;
    }
  });

  // Create objects in a circle
  const objects = CAROUSEL_ITEMS.map((filename, i) => {
    const count = CAROUSEL_ITEMS.length;
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return (
      <group key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
        <Float
          speed={animationConfig.floatSpeed}
          rotationIntensity={animationConfig.rotationIntensity}
          floatIntensity={animationConfig.floatIntensity}
          floatingRange={animationConfig.floatingRange}
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
