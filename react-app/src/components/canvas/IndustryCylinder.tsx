import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RenderProduct } from './Products';
import { industryWrapUrl } from './industryAssets';
import { getCameraDirectorDebugState } from './cameraDirector';

// Helper types for individual item configuration
type ItemConfig = {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

// Manually defined positions based on previous circular logic (radius ~1.8)
// User can now tweak each item individually.
const TOP_ITEMS: ItemConfig[] = [
  {
    name: 'film_stretch.glb',
    position: [-2.1, 11.5, 0],
    rotation: [-0.2, 3, -0.3],
  },
  {
    name: 'tape.glb',
    position: [-0.1, 10.5, 0.2],
    rotation: [0.3, -3, 0],
  },
  {
    name: 'carton.glb',
    position: [1.4, 12, 1],
    rotation: [0.6, -Math.PI / 1.7, 0],
  },
  {
    name: 'bubble_wrap.glb',
    position: [-0.5, 12.4, 2.3],
    rotation: [0.7, 0, 0],
  },
];

const MID_ITEMS: ItemConfig[] = [
  {
    name: 'aluminum_roll.glb',
    position: [1.8, 3.5, 1],
    rotation: [0, -0.7, 1],
  },
  {
    name: 'food_container.glb',
    position: [0.8, 5.2, 0],
    rotation: [-0.6, -2.09, 0],
  },
  {
    name: 'plastic_bag.glb',
    position: [-0.6, 4.6, 0],
    rotation: [-0.3, 0, 0],
  },

  {
    name: 'plastic_wrap.glb',
    position: [-1.8, 5.2, 0],
    rotation: [-0.9, 1, 2],
  },
];

const BOT_ITEMS: ItemConfig[] = [
  {
    name: 'paper_rolls.glb',
    position: [-1, 0, -0.7],
    rotation: [0.8, -2, 0.3],
  },
  {
    name: 'napkins.glb',
    position: [-0.3, -3.2, 0.2],
    rotation: [0.7, 0, -0.8],
  },
  {
    name: 'gloves.glb',
    position: [-0, -1.6, -1.5],
    rotation: [0, 2, 0],
  },
  {
    name: 'detergent.glb',
    position: [0, -0.5, 1],
    rotation: [0, 1.7, -0.2],
  },
];

// Preload all assets
// Preloading is now handled within RenderProduct

export function IndustryCylinder(props: any) {
  const cylinderRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!cylinderRef.current) {
      return;
    }

    cylinderRef.current.visible = getCameraDirectorDebugState().industryActive;
  });

  const { scene } = useGLTF(industryWrapUrl);
  const wrapperModel = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).material = new THREE.MeshPhysicalMaterial(
          {
            color: '#d9f4ff',
            transparent: true,
            opacity: 0.26,
            roughness: 0.08,
            metalness: 0,
            transmission: 0.92,
            thickness: 0.38,
            ior: 1.46,
            clearcoat: 0.8,
            clearcoatRoughness: 0.12,
            envMapIntensity: 1.25,
            attenuationColor: '#bfe9ff',
            attenuationDistance: 2.2,
            side: THREE.DoubleSide,
            depthWrite: false,
          }
        );
        (obj as THREE.Mesh).castShadow = false;
        (obj as THREE.Mesh).receiveShadow = false;
      }
    });
    return cloned;
  }, [scene]);

  const allItems = [...TOP_ITEMS, ...MID_ITEMS, ...BOT_ITEMS];

  return (
    <group ref={cylinderRef} {...props}>
      {/* Main transparent cylinder replacement */}
      <primitive
        object={wrapperModel}
        scale={2.5}
        position={[0, -3.5, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Render Individually Configured Items */}
      {allItems.map((item, index) => (
        <RenderProduct
          key={`${item.name}-${index}`}
          name={item.name}
          position={item.position}
          rotation={item.rotation}
          scale={6}
        />
      ))}
    </group>
  );
}
