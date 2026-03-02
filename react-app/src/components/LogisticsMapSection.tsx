import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useEffect, useState } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import argentinaSvgUrl from '@/assets/argentina.svg?url';

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
// 23 markers total: one per Argentine province
// Indices chosen to spread across Argentina's geography
// Based on cy coordinates: lower cy = north, higher cy = south
// SVG has ~960 circles total
// ============================================
const PULSE_NODES: PulseNode[] = [
  // North and northeast
  { index: 10, delay: 0.0 },
  { index: 35, delay: 0.5 },
  { index: 70, delay: 1.0 },
  { index: 100, delay: 1.5 },
  { index: 130, delay: 0.2 },

  // Cuyo and central-north
  { index: 160, delay: 0.7 },
  { index: 190, delay: 1.2 },
  { index: 220, delay: 1.7 },
  { index: 250, delay: 0.4 },
  { index: 280, delay: 0.9 },

  // Pampas and Buenos Aires region
  { index: 320, delay: 1.4 },
  { index: 350, delay: 0.1 },
  { index: 380, delay: 0.6 },
  { index: 420, delay: 1.1 },

  // Northern Patagonia
  { index: 470, delay: 1.6 },
  { index: 520, delay: 0.3 },
  { index: 580, delay: 0.8 },

  // Central and southern Patagonia
  { index: 650, delay: 1.3 },
  { index: 700, delay: 0.0 },
  { index: 740, delay: 0.5 },
  { index: 780, delay: 1.0 },
  { index: 850, delay: 1.5 },
  { index: 940, delay: 0.2 },
];

// Generate static connecting lines between nearby dots
function generateStaticLines(
  circleData: { cx: number; cy: number }[],
  linesGroup: SVGGElement,
) {
  const MAX_DISTANCE = 20; // SVG units
  const lines: string[] = [];

  // Sample every Nth circle to avoid too many lines
  const sampledCircles = circleData.filter((_, i) => i % 3 === 0);

  for (let i = 0; i < sampledCircles.length; i++) {
    const c1 = sampledCircles[i];

    // Find nearby circles
    for (let j = i + 1; j < sampledCircles.length; j++) {
      const c2 = sampledCircles[j];
      const dx = c2.cx - c1.cx;
      const dy = c2.cy - c1.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DISTANCE && dist > 5) {
        const opacity = 0.3 * (1 - dist / MAX_DISTANCE);
        lines.push(
          `<line x1="${c1.cx}" y1="${c1.cy}" x2="${c2.cx}" y2="${c2.cy}" stroke="rgba(94, 234, 212, ${opacity})" stroke-width="0.8"/>`,
        );
      }
    }
  }

  linesGroup.innerHTML = lines.join('');
}

// ============================================
// LOGISTICS MAP SECTION
// "Satellite View" transition with Argentina map
// ============================================
export function LogisticsMapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const linesGroupRef = useRef<SVGGElement | null>(null);
  const { getFontFamily } = useShopifyTheme();
  const [svgLoaded, setSvgLoaded] = useState(false);
  const animationInitialized = useRef(false);

  // Inject the bundled SVG into the DOM
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    const loadSvg = async () => {
      try {
        const response = await fetch(argentinaSvgUrl);
        if (!response.ok || !mapContainerRef.current || !isMounted) {
          return;
        }

        const svgMarkup = await response.text();
        if (!mapContainerRef.current || !isMounted) {
          return;
        }

        mapContainerRef.current.innerHTML = svgMarkup;
        const svg = mapContainerRef.current.querySelector('svg');

        if (!svg) {
          return;
        }

        svg.style.width = '100%';
        svg.style.height = '100%';

        // Style all circles and collect positions
        const circles = svg.querySelectorAll('circle, ellipse');
        const circleData: { cx: number; cy: number }[] = [];

        circles.forEach((circle) => {
          const svgCircle = circle as SVGCircleElement;
          svgCircle.style.fill = 'rgba(255, 255, 255, 0.08)';
          svgCircle.style.stroke = 'none';

          circleData.push({
            cx: parseFloat(svgCircle.getAttribute('cx') || '0'),
            cy: parseFloat(svgCircle.getAttribute('cy') || '0'),
          });
        });

        // Create lines group (inserted first so lines appear behind circles)
        const linesGroup = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'g',
        );
        linesGroup.setAttribute('class', 'connecting-lines');
        linesGroup.style.opacity = '0'; // Start hidden, reveal on scroll
        svg.insertBefore(linesGroup, svg.firstChild);
        linesGroupRef.current = linesGroup;

        // Generate static connecting lines
        generateStaticLines(circleData, linesGroup);

        setSvgLoaded(true);
      } catch {
        // Keep section inert if SVG fails to load
      }
    };

    void loadSvg();

    return () => {
      isMounted = false;
      linesGroupRef.current = null;
    };
  }, []);

  // Initialize GSAP animations after SVG is loaded
  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stickyRef.current ||
        !mapContainerRef.current ||
        !textRef.current ||
        !svgLoaded ||
        animationInitialized.current
      )
        return;

      animationInitialized.current = true;

      const section = sectionRef.current;
      const mapContainer = mapContainerRef.current;
      const text = textRef.current;
      const heading = text.querySelector('.map-heading');
      const subheading = text.querySelector('.map-subheading');

      // Get all circle elements from the SVG
      const circles =
        mapContainer.querySelectorAll('circle, ellipse');
      const circleArray = Array.from(circles);

      // Select specific circles for pulse animation and store original radii
      const pulseCircles = PULSE_NODES.map(
        (node) => circleArray[node.index],
      ).filter(Boolean) as SVGCircleElement[];

      // Store original radius for each pulse circle
      const originalRadii = pulseCircles.map((circle) =>
        parseFloat(circle.getAttribute('r') || '3'),
      );

      // ============================================
      // SET INITIAL STATES
      // ============================================
      gsap.set(mapContainer, {
        scale: 1.2,
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
        0,
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
        0.1,
      );

      // Reveal connecting lines
      if (linesGroupRef.current) {
        tl.to(
          linesGroupRef.current,
          {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
          },
          0.2,
        );
      }

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
            0.2 + i * 0.02,
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
        0.3,
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
          0.35,
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
          0.4,
        );
      }

      // ----------------------------------------
      // STATE 3: Exit (70% - 100%)
      // Blur and fade while next section slides over
      // ----------------------------------------
      tl.to(
        [mapContainer, text],
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        },
        0.7,
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
    { scope: sectionRef, dependencies: [svgLoaded] },
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
        style={{ backgroundColor: '#1B4B6B' }}
      >
        {/* Background Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Argentina Map - Background Layer - Centered with wrapper */}
        <div
          ref={mapWrapperRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            ref={mapContainerRef}
            className="will-change-transform"
            style={{
              width: 'clamp(300px, 60vw, 600px)',
              height: 'clamp(400px, 80vh, 700px)',
            }}
          />
        </div>

        {/* Foreground Text Layer */}
        <div
          ref={textRef}
          className="relative z-20 text-center px-6 will-change-transform"
        >
          <h2
            className="map-heading text-white font-bold tracking-tight"
            style={{
              fontFamily: getFontFamily('heading'),
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            COBERTURA NACIONAL
          </h2>
          <p
            className="map-subheading text-white font-medium"
            style={{
              fontFamily: getFontFamily('body'),
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            }}
          >
            Logística donde lo necesites.
          </p>
        </div>
      </div>
    </section>
  );
}
