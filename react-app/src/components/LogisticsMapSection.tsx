import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useEffect, useState } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import argentinaSvgRaw from '@/assets/argentina.svg?raw';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// TYPES
// ============================================
interface PulseNode {
  index: number;
  delay: number;
}

// ============================================
// SELECTED NODE INDICES FOR PULSE ANIMATION
// These represent key provinces/locations on the map
// Indices chosen to spread across Argentina's geography
// Based on cy coordinates: lower cy = north, higher cy = south
// SVG has ~960 circles total
// ============================================
const PULSE_NODES: PulseNode[] = [
  // Northern region (cy ~0-150)
  { index: 10, delay: 0 },
  { index: 35, delay: 0.8 },
  // Central-north (cy ~150-300)
  { index: 100, delay: 0.2 },
  { index: 150, delay: 1.0 },
  // Central region - Buenos Aires area (cy ~300-400)
  { index: 220, delay: 0.4 },
  { index: 280, delay: 1.2 },
  // Central-west - Mendoza region (cy ~400-500)
  { index: 350, delay: 0.6 },
  { index: 420, delay: 1.4 },
  // Patagonia north (cy ~500-600)
  { index: 520, delay: 0.3 },
  { index: 580, delay: 1.1 },
  // Patagonia central (cy ~600-700)
  { index: 650, delay: 0.5 },
  { index: 720, delay: 1.3 },
  // Patagonia south (cy ~700-800)
  { index: 780, delay: 0.7 },
  { index: 850, delay: 1.5 },
  // Tierra del Fuego (cy ~800-850)
  { index: 900, delay: 0.9 },
  { index: 940, delay: 1.7 },
];

// ============================================
// LOGISTICS MAP SECTION
// "Satellite View" transition with Argentina map
// ============================================
export function LogisticsMapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const blurOverlayRef = useRef<HTMLDivElement>(null);
  const { getFontFamily } = useShopifyTheme();
  const [svgLoaded, setSvgLoaded] = useState(false);
  const animationInitialized = useRef(false);

  // Inject the bundled SVG into the DOM
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inject the pre-bundled SVG
    mapContainerRef.current.innerHTML = argentinaSvgRaw;
    const svg = mapContainerRef.current.querySelector('svg');

    if (svg) {
      svg.style.width = '100%';
      svg.style.height = '100%';

      // Style all circles to be white with low opacity (data-grid look)
      const circles = svg.querySelectorAll('circle, ellipse');
      circles.forEach((circle) => {
        (circle as SVGElement).style.fill =
          'rgba(255, 255, 255, 0.08)';
        (circle as SVGElement).style.stroke = 'none';
      });

      setSvgLoaded(true);
    }
  }, []);

  // Initialize GSAP animations after SVG is loaded
  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stickyRef.current ||
        !mapContainerRef.current ||
        !textRef.current ||
        !blurOverlayRef.current ||
        !svgLoaded ||
        animationInitialized.current
      )
        return;

      animationInitialized.current = true;

      const section = sectionRef.current;
      const mapContainer = mapContainerRef.current;
      const text = textRef.current;
      const blurOverlay = blurOverlayRef.current;
      const heading = text.querySelector('.map-heading');
      const subheading = text.querySelector('.map-subheading');

      // Get all circle elements from the SVG
      const circles =
        mapContainer.querySelectorAll('circle, ellipse');
      const circleArray = Array.from(circles);

      // Select specific circles for pulse animation and store original radii
      const pulseCircles = PULSE_NODES.map(
        (node) => circleArray[node.index]
      ).filter(Boolean) as SVGCircleElement[];

      // Store original radius for each pulse circle
      const originalRadii = pulseCircles.map((circle) =>
        parseFloat(circle.getAttribute('r') || '3')
      );

      // ============================================
      // SET INITIAL STATES
      // ============================================
      gsap.set(mapContainer, {
        scale: 1.3,
        opacity: 0,
        y: 100,
      });

      gsap.set(text, { opacity: 0, y: 50 });

      if (heading && subheading) {
        gsap.set([heading, subheading], {
          clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
          y: 30,
        });
      }

      gsap.set(blurOverlay, { opacity: 0 });

      // ============================================
      // MAIN SCROLL TIMELINE
      // ============================================
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
          // markers: true, // Uncomment for debugging
        },
      });

      // ----------------------------------------
      // STATE 0: Entrance (0% - 20%)
      // Section slides up with parallax effect
      // ----------------------------------------
      tl.to(
        mapContainer,
        {
          y: 0,
          opacity: 1,
          duration: 0.2,
          ease: 'power3.out',
        },
        0
      );

      // ----------------------------------------
      // STATE 1: The Reveal (10% - 50%)
      // Map zooms out from 1.3 to 1.0
      // ----------------------------------------
      tl.to(
        mapContainer,
        {
          scale: 1.0,
          duration: 0.4,
          ease: 'power3.out',
        },
        0.1
      );

      // Highlight pulse nodes with brighter fill
      if (pulseCircles.length > 0) {
        pulseCircles.forEach((circle, i) => {
          const enlargedR = originalRadii[i] + 2;
          tl.to(
            circle,
            {
              fill: 'rgba(255, 255, 255, 0.6)',
              attr: { r: enlargedR },
              duration: 0.3,
              ease: 'power2.out',
            },
            0.2 + i * 0.02
          );
        });
      }

      // ----------------------------------------
      // STATE 2: Text Reveal (30% - 50%)
      // Clip-path reveal animation
      // ----------------------------------------
      tl.to(
        text,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power3.out',
        },
        0.3
      );

      if (heading) {
        tl.to(
          heading,
          {
            clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
            y: 0,
            duration: 0.25,
            ease: 'power3.out',
          },
          0.35
        );
      }

      if (subheading) {
        tl.to(
          subheading,
          {
            clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
            y: 0,
            duration: 0.25,
            ease: 'power3.out',
          },
          0.4
        );
      }

      // ----------------------------------------
      // STATE 3: Exit (70% - 100%)
      // Blur and fade while next section slides over
      // ----------------------------------------
      tl.to(
        blurOverlay,
        {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.in',
        },
        0.7
      );

      tl.to(
        [mapContainer, text],
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        },
        0.7
      );

      // ============================================
      // PULSE ANIMATION (Continuous while in view)
      // Simulates "Live Activity" on key provinces
      // ============================================
      let pulseTimelines: gsap.core.Tween[] = [];

      const startPulsing = () => {
        // Kill any existing tweens first
        pulseTimelines.forEach((tween) => tween.kill());
        pulseTimelines = [];

        pulseCircles.forEach((circle, i) => {
          const node = PULSE_NODES[i];
          const baseR = originalRadii[i];
          const pulseR = baseR + 4;

          if (node && circle) {
            // Reset to base state first
            gsap.set(circle, {
              fill: 'rgba(255, 255, 255, 0.6)',
              attr: { r: baseR },
            });

            const pulseTween = gsap.to(circle, {
              fill: 'rgba(94, 234, 212, 0.9)',
              attr: { r: pulseR },
              duration: 0.8,
              ease: 'power2.inOut',
              repeat: -1,
              yoyo: true,
              delay: node.delay,
            });
            pulseTimelines.push(pulseTween);
          }
        });
      };

      const stopPulsing = () => {
        pulseTimelines.forEach((tween) => tween.kill());
        pulseTimelines = [];
        // Reset circles to scroll-revealed state
        pulseCircles.forEach((circle, i) => {
          gsap.set(circle, {
            fill: 'rgba(255, 255, 255, 0.6)',
            attr: { r: originalRadii[i] + 2 },
          });
        });
      };

      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom top',
        onEnter: startPulsing,
        onLeave: stopPulsing,
        onEnterBack: startPulsing,
        onLeaveBack: stopPulsing,
      });

      // Cleanup function
      return () => {
        pulseTimelines.forEach((tween) => tween.kill());
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === section) {
            st.kill();
          }
        });
      };
    },
    { scope: sectionRef, dependencies: [svgLoaded] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-10"
      style={{ height: '200vh' }}
    >
      {/* Sticky Wrapper - stays fixed during scroll */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: '#0A3D54' }}
      >
        {/* Background Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Argentina Map - Background Layer - Centered with wrapper */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            ref={mapContainerRef}
            className="will-change-transform"
            style={{
              width: 'clamp(300px, 60vw, 600px)',
              height: 'clamp(400px, 80vh, 800px)',
            }}
          />
        </div>

        {/* Foreground Text Layer */}
        <div
          ref={textRef}
          className="relative z-20 text-center px-6 will-change-transform"
        >
          <h2
            className="map-heading text-white font-bold tracking-tight mb-4"
            style={{
              fontFamily: getFontFamily('heading'),
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            COBERTURA FEDERAL
          </h2>
          <p
            className="map-subheading text-white/80 font-light"
            style={{
              fontFamily: getFontFamily('body'),
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            }}
          >
            Llegamos donde estés
          </p>
        </div>

        {/* Blur Overlay - for exit transition */}
        <div
          ref={blurOverlayRef}
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(10, 61, 84, 0.5)',
          }}
        />
      </div>
    </section>
  );
}
