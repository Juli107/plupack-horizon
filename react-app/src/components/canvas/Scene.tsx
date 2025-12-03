import { Environment } from '@react-three/drei';
import { Carousel } from '../hero/Carousel';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================
// INDUSTRY CYLINDER (Placeholder)
// ============================================
// This is a placeholder cylinder for the industry sections
// Replace this with your actual 3D model when ready
// Positioned in WORLD SPACE - camera orbits around it

// ============================================
// STAIRCASE CUBES
// ============================================
// Cubes arranged in a descending spiral around the rod

function StaircaseCubes() {
  const cubesRef = useRef<THREE.Group>(null);

  // Configuration for the staircase
  const numCubes = 12;
  const cubeSize = 0.6;
  const radiusFromCenter = 1.2; // Distance from the rod
  const startHeight = 3.5;
  const heightStep = 0.6; // How much each cube descends
  const angleStep = ((Math.PI * 2) / numCubes) * 1.5; // Spiral angle increment

  // Generate cube positions
  const cubes = Array.from({ length: numCubes }, (_, i) => {
    const angle = i * angleStep;
    const x = Math.cos(angle) * radiusFromCenter;
    const z = Math.sin(angle) * radiusFromCenter;
    const y = startHeight - i * heightStep;

    return { x, y, z, angle };
  });

  return (
    <group ref={cubesRef}>
      {cubes.map((cube, i) => (
        <mesh
          key={i}
          position={[cube.x, cube.y, cube.z]}
          rotation={[0, cube.angle, 0]}
        >
          <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
          <meshStandardMaterial
            color="#4a90a4"
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function IndustryCylinder() {
  const cylinderRef = useRef<THREE.Group>(null);

  return (
    // The camera keyframes orbit around orbitCenter: [0, -2, 0] to [0, -4.5, 0]
    // So cylinder stays fixed while camera moves around it
    <group ref={cylinderRef}>
      {/* Main cylinder body - transparent/glass-like */}
      <mesh>
        <cylinderGeometry args={[2, 2, 8, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          roughness={0.1}
          metalness={0.1}
          transmission={0.95}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Core rod */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 9, 32]} />
        <meshStandardMaterial
          color="#e8e8e8"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Staircase cubes around the rod */}
      <StaircaseCubes />
    </group>
  );
}

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
        <Carousel radius={7} />
      </group>

      <group position={[0, -60, 0]}>
        <IndustryCylinder />
      </group>
    </>
  );
}
