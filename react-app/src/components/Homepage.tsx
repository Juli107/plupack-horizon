import { Environment, Float } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useShopifyTheme } from '../hooks/useShopifyTheme';
import { Hero } from './hero/Hero';
import { NoiseOverlay } from './NoiseOverlay';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ============================================
// HEADER TINT CONTROLLER
// ============================================
// This hook communicates with the Liquid header to change its tint
// based on which section the user is viewing

type HeaderTint = 'light' | 'dark';

function useHeaderTintControl() {
  useEffect(() => {
    const header = document.querySelector(
      '#header-component'
    ) as HTMLElement;
    if (!header) return;

    // Add transition for smooth tint changes
    header.style.transition = 'all 0.4s ease';

    return () => {
      // Cleanup: remove any added classes
      header.classList.remove(
        'header--tint-light',
        'header--tint-dark'
      );
    };
  }, []);

  // Function to change header tint - can be called from ScrollTrigger
  const setHeaderTint = (tint: HeaderTint) => {
    const header = document.querySelector('#header-component');
    if (!header) return;

    if (tint === 'dark') {
      header.classList.add('header--tint-dark');
      header.classList.remove('header--tint-light');
    } else {
      header.classList.add('header--tint-light');
      header.classList.remove('header--tint-dark');
    }
  };

  return { setHeaderTint };
}

// ============================================
// LENIS SMOOTH SCROLL PROVIDER
// ============================================
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);
}

// ============================================
// 3D SCENE COMPONENTS
// ============================================
// (Removed old hero components: AnimatedSphere, FloatingElements)

// ============================================
// 2D OVERLAY COMPONENTS (Above 3D)
// ============================================
// (Removed old hero components: TextOverlay)

// ============================================
// 2D BACKGROUND LAYER (Behind 3D)
// ============================================
// (Removed old hero components: BackgroundLayer)

// ============================================
// SCROLL INDICATOR
// ============================================
// (Removed old hero components: ScrollIndicator)

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Adjust hex color brightness
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(
    255,
    Math.max(0, ((num >> 8) & 0x00ff) + amount)
  );
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`;
}

// ============================================
// MAIN HOMEPAGE COMPONENT
// ============================================

interface HomepageProps {
  backgroundColor?: string;
  shopName?: string;
  accentColor?: string;
  headingText?: string;
  subheadingText?: string;
}

export function Homepage({
  backgroundColor = '#146C90',
  shopName = 'Store',
  accentColor = '#ffffff',
  headingText: _headingText,
  subheadingText: _subheadingText,
}: HomepageProps) {
  // Initialize Lenis smooth scroll
  useLenis();

  // Header tint controller
  const { setHeaderTint } = useHeaderTintControl();

  useGSAP(() => {
    setHeaderTint('light');
  }, []);

  return (
    <main
      className="relative w-full overflow-x-hidden -z-10"
      style={{ backgroundColor: backgroundColor }}
    >
      <NoiseOverlay />
      <Hero />

      {/* Additional scroll content for demo */}
      <ScrollSections
        backgroundColor={backgroundColor}
        accentColor={accentColor}
        setHeaderTint={setHeaderTint}
      />

      {/* Pre-footer with 3D floating packaging */}
      <PreFooter
        backgroundColor={backgroundColor}
        accentColor={accentColor}
        shopName={shopName}
      />
    </main>
  );
}

// ============================================
// DEMO SCROLL SECTIONS
// ============================================

interface ScrollSectionsProps {
  backgroundColor: string;
  accentColor: string;
  setHeaderTint: (tint: 'light' | 'dark') => void;
}

function ScrollSections({
  backgroundColor,
  accentColor,
  setHeaderTint,
}: ScrollSectionsProps) {
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const whiteSectionRef = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reveal animations for each section
    const sections = [
      section1Ref.current,
      section2Ref.current,
      whiteSectionRef.current,
      section3Ref.current,
    ];

    sections.forEach((section) => {
      if (!section) return;

      const content = section.querySelector('.content');

      gsap.from(content, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // Header tint change for white section
    if (whiteSectionRef.current) {
      ScrollTrigger.create({
        trigger: whiteSectionRef.current,
        start: 'top 10%', // When white section reaches near top
        end: 'bottom 10%', // Until bottom of white section passes
        onEnter: () => setHeaderTint('dark'),
        onLeave: () => setHeaderTint('light'),
        onEnterBack: () => setHeaderTint('dark'),
        onLeaveBack: () => setHeaderTint('light'),
      });
    }
  }, [setHeaderTint]);

  // Get theme fonts from Shopify settings
  const { getFontFamily } = useShopifyTheme();

  const sectionStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };

  const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    color: accentColor,
    fontFamily: getFontFamily('body'), // Uses Shopify theme font
    padding: '2rem',
    maxWidth: '800px',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '3rem',
    marginBottom: '1rem',
    fontFamily: getFontFamily('heading'), // Uses Shopify heading font
  };

  return (
    <>
      <section
        ref={section1Ref}
        style={{
          ...sectionStyle,
          background: adjustColor(backgroundColor, -20),
        }}
      >
        <div className="content" style={contentStyle}>
          <h2 style={headingStyle}>Section One</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            This content animates in as you scroll. Lenis provides
            smooth scrolling, while GSAP ScrollTrigger handles the
            reveal animations.
          </p>
        </div>
      </section>

      <section
        ref={section2Ref}
        style={{
          ...sectionStyle,
          background: adjustColor(backgroundColor, -40),
        }}
      >
        <div className="content" style={contentStyle}>
          <h2 style={headingStyle}>Section Two</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            The 3D elements in the hero respond to scroll position
            through a shared ref, creating seamless 2D + 3D scroll
            interactions.
          </p>
        </div>
      </section>

      {/* White background section - header tint changes here */}
      <section
        ref={whiteSectionRef}
        style={{
          ...sectionStyle,
          background: '#ffffff',
        }}
      >
        <div
          className="content"
          style={{ ...contentStyle, color: '#333' }}
        >
          <h2 style={{ ...headingStyle, color: backgroundColor }}>
            White Section
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            Notice how the header changes from light text to dark text
            when you scroll over this white background section.
          </p>
        </div>
      </section>

      <section
        ref={section3Ref}
        style={{
          ...sectionStyle,
          background: adjustColor(backgroundColor, -60),
        }}
      >
        <div className="content" style={contentStyle}>
          <h2 style={headingStyle}>Section Three</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            All interactive content lives in React. Liquid handles
            basic structure and Shopify data injection - React handles
            the experience.
          </p>
        </div>
      </section>
    </>
  );
}

// ============================================
// PRE-FOOTER 3D PACKAGING SCENE
// ============================================

// Floating 3D box/packaging component
function PackagingBox({
  position,
  rotation,
  scale = 1,
  color = '#8a9ba8',
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Gentle floating animation
    meshRef.current.rotation.x =
      rotation[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    meshRef.current.rotation.y =
      rotation[1] + state.clock.elapsedTime * 0.2;
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 1.2, 0.8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>
    </Float>
  );
}

// Tape roll packaging component
function TapeRoll({
  position,
  rotation,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z =
      rotation[2] + state.clock.elapsedTime * 0.3;
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.6 + 1) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
      >
        <torusGeometry args={[0.5, 0.25, 16, 32]} />
        <meshStandardMaterial
          color="#b8c5d0"
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
    </Float>
  );
}

// Bubble wrap / cylinder packaging
function BubbleWrapRoll({
  position,
  rotation,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x =
      rotation[0] + state.clock.elapsedTime * 0.15;
    meshRef.current.position.y =
      position[1] +
      Math.sin(state.clock.elapsedTime * 0.7 + 2) * 0.12;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
      >
        <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
        <meshStandardMaterial
          color="#a0adb8"
          metalness={0.05}
          roughness={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

// Pre-footer 3D scene
function PreFooter3DScene() {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight
        position={[-5, 3, -5]}
        intensity={0.4}
        color="#4a90a4"
      />

      {/* Scattered packaging elements */}
      {/* Left side */}
      <PackagingBox
        position={[-4, 1, -1]}
        rotation={[0.3, 0.5, 0.1]}
        scale={0.8}
      />
      <TapeRoll
        position={[-3, -0.5, 0]}
        rotation={[1.2, 0, 0.3]}
        scale={0.6}
      />
      <BubbleWrapRoll
        position={[-5, 0.5, -2]}
        rotation={[0.5, 0, 1.5]}
        scale={0.7}
      />

      {/* Right side */}
      <PackagingBox
        position={[4, 0.5, -1]}
        rotation={[-0.2, -0.4, 0.15]}
        scale={0.9}
        color="#7a8b98"
      />
      <TapeRoll
        position={[3.5, -0.8, 0.5]}
        rotation={[0.8, 0.5, 0]}
        scale={0.5}
      />
      <BubbleWrapRoll
        position={[5, 1, -1.5]}
        rotation={[0.3, 0.2, 0.8]}
        scale={0.6}
      />

      {/* Top scattered */}
      <PackagingBox
        position={[-2, 2.5, -2]}
        rotation={[0.5, 1, 0.3]}
        scale={0.5}
        color="#95a5b0"
      />
      <PackagingBox
        position={[2.5, 2, -1.5]}
        rotation={[-0.3, 0.8, -0.2]}
        scale={0.6}
      />
      <TapeRoll
        position={[0, 2.8, -1]}
        rotation={[1.5, 0, 0.5]}
        scale={0.4}
      />

      {/* Bottom scattered */}
      <PackagingBox
        position={[-1.5, -1.5, 0]}
        rotation={[0.2, -0.3, 0.4]}
        scale={0.7}
      />
      <BubbleWrapRoll
        position={[1.5, -1.8, -0.5]}
        rotation={[0.8, 0.3, 1.2]}
        scale={0.5}
      />
    </>
  );
}

// Pre-footer section component
interface PreFooterProps {
  backgroundColor: string;
  accentColor: string;
  shopName: string;
}

function PreFooter({ backgroundColor, accentColor }: PreFooterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Logo entrance animation
    gsap.from(logoRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '80vh',
        background: backgroundColor,
        overflow: 'hidden',
      }}
    >
      {/* 3D Canvas with floating packaging */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <PreFooter3DScene />
        </Canvas>
      </div>

      {/* Logo overlay */}
      <div
        ref={logoRef}
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {/* Logo text - you can replace this with an actual logo image */}
        <div
          style={{
            color: accentColor,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 700,
              margin: 0,
              lineHeight: 1,
            }}
          >
            <span style={{ fontWeight: 300 }}>PLU</span>PACK
            <sup
              style={{ fontSize: '0.3em', verticalAlign: 'super' }}
            >
              ®
            </sup>
          </h2>
          <p
            style={{
              fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
              fontWeight: 400,
              margin: 0,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            EMBALAJES
          </p>
        </div>
      </div>
    </section>
  );
}
