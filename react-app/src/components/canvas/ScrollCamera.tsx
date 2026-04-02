import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  findSurroundingKeyframes,
  interpolateKeyframes,
} from './cameraKeyframes';
import {
  getCameraDirectorEffectiveScrollPercent,
  setCameraDirectorPageScrollPercent,
} from './cameraDirector';

// ============================================
// SCROLL-SYNCED CAMERA CONTROLLER
// ============================================
// Camera is resolved deterministically from effective scroll
// on every frame so behavior is consistent across browsers.
const FOV_EPSILON = 0.02;

export function ScrollCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { set } = useThree();

  // Set this camera as the default
  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
    }
  }, [set]);

  // Use Lenis scroll for smooth, synced scrolling
  useLenis((lenis) => {
    setCameraDirectorPageScrollPercent(lenis.progress * 100);
  });

  useFrame(() => {
    if (!cameraRef.current) return;

    const scrollPercent = getCameraDirectorEffectiveScrollPercent();
    const { from, to, t } = findSurroundingKeyframes(scrollPercent);
    const interpolated = interpolateKeyframes(from, to, t);

    cameraRef.current.position.copy(interpolated.position);
    cameraRef.current.lookAt(interpolated.lookAt);

    if (Math.abs(cameraRef.current.fov - interpolated.fov) > FOV_EPSILON) {
      cameraRef.current.fov = interpolated.fov;
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0, 10]}
      fov={45}
      near={0.1}
      far={1000}
    />
  );
}
