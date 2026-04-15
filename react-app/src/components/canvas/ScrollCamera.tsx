import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  findSurroundingKeyframes,
  interpolateKeyframes,
  MOBILE_ORBIT_PULLBACK,
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
const MOBILE_DISTANCE_PULLBACK = 1.1;
const MOBILE_FOV_BOOST = 2;
const MOBILE_MAX_FOV = 55;

interface ScrollCameraProps {
  isMobile: boolean;
  isTouchDevice: boolean;
}

export function ScrollCamera({
  isMobile,
  isTouchDevice,
}: ScrollCameraProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const smoothedScrollPercentRef = useRef(0);
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

  useFrame((_, delta) => {
    if (!cameraRef.current) return;

    const targetScrollPercent = getCameraDirectorEffectiveScrollPercent();
    const clampedDelta = Math.min(delta, 1 / 30);
    const smoothing = isTouchDevice ? 18 : 24;
    const scrollPercent = THREE.MathUtils.damp(
      smoothedScrollPercentRef.current,
      targetScrollPercent,
      smoothing,
      clampedDelta,
    );

    smoothedScrollPercentRef.current = scrollPercent;

    const { from, to, t } = findSurroundingKeyframes(scrollPercent);
    const orbitPullback = isMobile ? MOBILE_ORBIT_PULLBACK : 1;
    const interpolated = interpolateKeyframes(
      from,
      to,
      t,
      orbitPullback,
    );

    if (isMobile) {
      const viewOffset = interpolated.position
        .clone()
        .sub(interpolated.lookAt);
      const pulledViewOffset = viewOffset.multiplyScalar(
        MOBILE_DISTANCE_PULLBACK,
      );

      cameraRef.current.position.copy(interpolated.lookAt).add(
        pulledViewOffset,
      );
    } else {
      cameraRef.current.position.copy(interpolated.position);
    }
    cameraRef.current.lookAt(interpolated.lookAt);

    const nextFov = isMobile
      ? Math.min(interpolated.fov + MOBILE_FOV_BOOST, MOBILE_MAX_FOV)
      : interpolated.fov;

    if (Math.abs(cameraRef.current.fov - nextFov) > FOV_EPSILON) {
      cameraRef.current.fov = nextFov;
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
