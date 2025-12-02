import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  cameraKeyframes,
  findSurroundingKeyframes,
  interpolateKeyframes,
} from './cameraKeyframes';

// ============================================
// SCROLL-SYNCED CAMERA CONTROLLER
// ============================================
// This component moves the camera based on scroll position
// using keyframes defined in cameraKeyframes.ts

const LERP_FACTOR = 0.08;

export function ScrollCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { set } = useThree();

  // Current interpolated values (for smooth lerping)
  const currentPosition = useRef(new THREE.Vector3(0, 0, 10));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentRotation = useRef(new THREE.Euler(0, 0, 0));
  const currentFov = useRef(45);

  // Target values (from keyframes)
  const targetPosition = useRef(new THREE.Vector3(0, 0, 10));
  const targetLookAt = useRef<THREE.Vector3 | null>(
    new THREE.Vector3(0, 0, 0)
  );
  const targetRotation = useRef<THREE.Euler | null>(null);
  const targetFov = useRef(45);

  // Track if we're using lookAt or rotation
  const useLookAt = useRef(true);

  // Set this camera as the default
  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
    }
  }, [set]);

  useEffect(() => {
    const handleScroll = () => {
      // Get scroll progress (0 to 100 percent)
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollHeight) * 100;

      // Find surrounding keyframes and interpolate
      const { from, to, t } = findSurroundingKeyframes(
        scrollPercent,
        cameraKeyframes
      );
      const interpolated = interpolateKeyframes(from, to, t);

      // Set target values
      targetPosition.current.copy(interpolated.position);
      targetFov.current = interpolated.fov;

      // Handle lookAt vs rotation
      if (interpolated.lookAt) {
        targetLookAt.current = interpolated.lookAt;
        targetRotation.current = null;
        useLookAt.current = true;
      } else if (interpolated.rotation) {
        targetRotation.current = interpolated.rotation;
        targetLookAt.current = null;
        useLookAt.current = false;
      }
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame(() => {
    if (!cameraRef.current) return;

    // Lerp position
    currentPosition.current.lerp(targetPosition.current, LERP_FACTOR);
    cameraRef.current.position.copy(currentPosition.current);

    // Handle rotation - either via lookAt or direct rotation
    if (useLookAt.current && targetLookAt.current) {
      // Lerp lookAt target
      currentLookAt.current.lerp(targetLookAt.current, LERP_FACTOR);
      cameraRef.current.lookAt(currentLookAt.current);
    } else if (targetRotation.current) {
      // Lerp rotation directly
      currentRotation.current.x = THREE.MathUtils.lerp(
        currentRotation.current.x,
        targetRotation.current.x,
        LERP_FACTOR
      );
      currentRotation.current.y = THREE.MathUtils.lerp(
        currentRotation.current.y,
        targetRotation.current.y,
        LERP_FACTOR
      );
      currentRotation.current.z = THREE.MathUtils.lerp(
        currentRotation.current.z,
        targetRotation.current.z,
        LERP_FACTOR
      );
      cameraRef.current.rotation.copy(currentRotation.current);
    }

    // Lerp FOV
    currentFov.current = THREE.MathUtils.lerp(
      currentFov.current,
      targetFov.current,
      LERP_FACTOR
    );
    cameraRef.current.fov = currentFov.current;
    cameraRef.current.updateProjectionMatrix();
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
