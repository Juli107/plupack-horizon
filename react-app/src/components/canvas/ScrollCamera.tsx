import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ============================================
// SCROLL-SYNCED CAMERA CONTROLLER
// ============================================
// This component moves the camera based on scroll position
// allowing 3D content to "appear" at different scroll depths

export function ScrollCamera() {
  const { camera } = useThree();
  const scrollY = useRef(0);
  const targetY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      // Get scroll progress (0 to 1 based on document height)
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / scrollHeight;

      // Map scroll to camera Y position
      // Adjust these values to control how much the camera moves
      // Negative Y moves camera down, revealing content positioned lower in 3D space
      targetY.current = progress * -20; // Camera moves down 20 units over full scroll
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame(() => {
    // Smooth lerp to target position
    scrollY.current = THREE.MathUtils.lerp(
      scrollY.current,
      targetY.current,
      0.1
    );
    camera.position.y = scrollY.current;
  });

  return null;
}
