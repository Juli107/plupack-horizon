import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useEffect, useState } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

// ============================================
// TYPES
// ============================================
interface ImagePosition {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  layer: 1 | 2 | 3;
}

// ============================================
// POSITIONS MATCHING STOCKSECTION'S EXPLODED STATE
// These mirror the final positions from StockSection
// so we know where to animate FROM
// ============================================
const DESKTOP_POSITIONS: ImagePosition[] = [
  // Top row - left to right
  { x: -42, y: -35, rotate: -8, scale: 0.85, layer: 2 },
  { x: -25, y: -38, rotate: 5, scale: 0.9, layer: 3 },
  { x: -5, y: -42, rotate: -3, scale: 0.75, layer: 1 },
  { x: 15, y: -40, rotate: 6, scale: 0.85, layer: 2 },
  { x: 38, y: -36, rotate: -5, scale: 0.9, layer: 3 },

  // Left side - top to bottom
  { x: -45, y: -10, rotate: -12, scale: 1, layer: 3 },
  { x: -48, y: 18, rotate: 8, scale: 0.8, layer: 1 },

  // Right side - top to bottom
  { x: 42, y: -8, rotate: 10, scale: 0.95, layer: 3 },
  { x: 45, y: 15, rotate: -6, scale: 0.85, layer: 2 },
  { x: 48, y: 35, rotate: 4, scale: 0.75, layer: 1 },

  // Bottom row - left to right
  { x: -38, y: 38, rotate: 6, scale: 0.9, layer: 2 },
  { x: -15, y: 42, rotate: -8, scale: 0.85, layer: 3 },
  { x: 8, y: 40, rotate: 5, scale: 0.8, layer: 2 },
  { x: 28, y: 38, rotate: -4, scale: 0.9, layer: 3 },
  { x: 45, y: 42, rotate: 7, scale: 0.75, layer: 1 },
];

const MOBILE_POSITIONS: ImagePosition[] = [
  // Top area
  { x: -35, y: -38, rotate: -8, scale: 0.8, layer: 2 },
  { x: 0, y: -42, rotate: 5, scale: 0.75, layer: 1 },
  { x: 35, y: -38, rotate: -5, scale: 0.85, layer: 3 },

  // Left side
  { x: -40, y: -5, rotate: -10, scale: 0.9, layer: 3 },
  { x: -42, y: 25, rotate: 6, scale: 0.75, layer: 1 },

  // Right side
  { x: 40, y: 0, rotate: 8, scale: 0.85, layer: 2 },
  { x: 42, y: 28, rotate: -6, scale: 0.8, layer: 3 },

  // Bottom area
  { x: -32, y: 40, rotate: 5, scale: 0.85, layer: 2 },
  { x: 5, y: 42, rotate: -7, scale: 0.9, layer: 3 },
  { x: 35, y: 38, rotate: 4, scale: 0.75, layer: 1 },
];

// ============================================
// RECYCLING RING SVG COMPONENT
// Dashed circle that draws itself
// ============================================
function RecyclingRing({
  className,
  ringRef,
}: {
  className?: string;
  ringRef: React.RefObject<SVGCircleElement | null>;
}) {
  const circumference = 2 * Math.PI * 120; // radius = 120

  return (
    <svg
      className={className}
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background ring - very faint */}
      <circle
        cx="140"
        cy="140"
        r="120"
        stroke="rgba(27, 75, 107, 0.1)"
        strokeWidth="2"
        strokeDasharray="8 8"
        fill="none"
      />
      {/* Animated ring - draws itself */}
      <circle
        ref={ringRef}
        cx="140"
        cy="140"
        r="120"
        stroke="#1B4B6B"
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        strokeLinecap="round"
        fill="none"
        style={{
          transformOrigin: 'center',
          transform: 'rotate(-90deg)',
        }}
      />
    </svg>
  );
}

// ============================================
// BIODEGRADABLE BADGE COMPONENT
// Uses brand color scheme: Deep blue with teal accent
// ============================================
function BiodegradableBadge({
  className,
  badgeRef,
  getFontFamily,
}: {
  className?: string;
  badgeRef: React.RefObject<HTMLDivElement | null>;
  getFontFamily: (type: 'heading' | 'body') => string;
}) {
  return (
    <div
      ref={badgeRef}
      className={`${className} flex flex-col items-center justify-center rounded-full will-change-transform`}
      style={{
        width: 'clamp(140px, 28vw, 220px)',
        height: 'clamp(140px, 28vw, 220px)',
        // Brand colors: Deep blue background with teal accent ring
        background:
          'linear-gradient(135deg, #1B4B6B 0%, #084e85 50%, #0A3D54 100%)',
        boxShadow:
          '0 0 0 4px rgba(94, 234, 212, 0.6), 0 25px 80px rgba(20, 108, 144, 0.4), 0 10px 30px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Recycling/Leaf Icon */}
      <svg
        className="w-10 h-10 md:w-14 md:h-14 mb-2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5EEAD4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Recycling arrows icon */}
        <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
        <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
        <path d="m14 16-3 3 3 3" />
        <path d="M8.293 13.596 4.875 7.5l3.418-6.096a1.83 1.83 0 0 1 1.566-.89h2.453" />
        <path d="m10 5 3-3-3-3" />
        <path d="m12.586 10.404 3.418 6.096 3.418-6.096a1.784 1.784 0 0 0 0-1.775A1.83 1.83 0 0 0 17.866 7.5h-2.453" />
        <path d="m18 8-3-3h6" />
      </svg>
      <span
        className="text-sm md:text-base font-bold uppercase tracking-wider text-center px-3"
        style={{
          fontFamily: getFontFamily('heading'),
          color: '#5EEAD4', // Teal accent color
        }}
      >
        100%
      </span>
      <span
        className="text-xs md:text-sm font-medium uppercase tracking-wide text-center px-3 text-white/90"
        style={{ fontFamily: getFontFamily('body') }}
      >
        Reciclable
      </span>
    </div>
  );
}

// ============================================
// SUSTAINABILITY LOOP SECTION
// "Order from Chaos" recycling transition
// SHARES images with StockSection - does not render its own
// Targets .stock-floating-image elements from StockSection
// ============================================
export function SustainabilityLoopSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const vortexRef = useRef<HTMLDivElement>(null);
  const ringContainerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const expandingRingRef = useRef<HTMLDivElement>(null);
  const { getFontFamily } = useShopifyTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get positions based on screen size
  const positions = isMobile ? MOBILE_POSITIONS : DESKTOP_POSITIONS;

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stickyRef.current ||
        !vortexRef.current ||
        !ringContainerRef.current ||
        !ringRef.current ||
        !badgeRef.current ||
        !leftTextRef.current ||
        !rightTextRef.current ||
        !expandingRingRef.current
      )
        return;

      const section = sectionRef.current;
      const ring = ringRef.current;
      const badge = badgeRef.current;
      const leftText = leftTextRef.current;
      const rightText = rightTextRef.current;
      const expandingRing = expandingRingRef.current;
      const ringContainer = ringContainerRef.current;

      // ============================================
      // TARGET STOCKSECTION'S IMAGES DIRECTLY
      // These are the SAME images - no duplication
      // ============================================
      const floatingImages = Array.from(
        document.querySelectorAll('.stock-floating-image'),
      ) as HTMLDivElement[];

      if (floatingImages.length === 0) return;

      const circumference = 2 * Math.PI * 120;

      // ============================================
      // INITIAL STATES
      // Images are already positioned by StockSection
      // We don't touch them initially - we pick up where StockSection left off
      // ============================================

      // Ring container - hidden initially
      gsap.set(ringContainer, { opacity: 0, scale: 0.8 });

      // Ring stroke - full offset (hidden)
      gsap.set(ring, { strokeDashoffset: circumference });

      // Badge - scaled to 0
      gsap.set(badge, { scale: 0, opacity: 0 });

      // Text elements - hidden
      gsap.set(leftText, { opacity: 0, x: -30 });
      gsap.set(rightText, { opacity: 0, x: 30 });

      // Expanding ring - hidden
      gsap.set(expandingRing, { scale: 0, opacity: 0 });

      // ============================================
      // MAIN SCROLL TIMELINE
      // ============================================
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          // markers: true,
        },
      });

      // ============================================
      // PHASE A: THE IMPLOSION (0% - 25%)
      // Products get sucked into the center like a recycling vortex
      // We're animating StockSection's images - they implode to OUR section's center
      // ============================================

      // Calculate center of THIS section for implosion target
      // Get layer groups based on positions
      const backImages = floatingImages.filter(
        (_, i) => positions[i]?.layer === 1,
      );
      const midImages = floatingImages.filter(
        (_, i) => positions[i]?.layer === 2,
      );
      const frontImages = floatingImages.filter(
        (_, i) => positions[i]?.layer === 3,
      );

      // Back layer - implodes first
      backImages.forEach((img) => {
        tl.to(
          img,
          {
            x: 0,
            y: 0,
            scale: 0,
            rotation: '+=360',
            opacity: 0,
            duration: 0.2,
            ease: 'power3.in',
          },
          0,
        );
      });

      // Mid layer - implodes second
      midImages.forEach((img) => {
        tl.to(
          img,
          {
            x: 0,
            y: 0,
            scale: 0,
            rotation: '+=270',
            opacity: 0,
            duration: 0.2,
            ease: 'power3.in',
          },
          0.05,
        );
      });

      // Front layer - implodes last
      frontImages.forEach((img) => {
        tl.to(
          img,
          {
            x: 0,
            y: 0,
            scale: 0,
            rotation: '+=180',
            opacity: 0,
            duration: 0.2,
            ease: 'power3.in',
          },
          0.1,
        );
      });

      // Ring container fades in as products disappear
      tl.to(
        ringContainer,
        {
          opacity: 1,
          scale: 1,
          duration: 0.15,
          ease: 'power2.out',
        },
        0.18,
      );

      // ============================================
      // PHASE B: THE PROCESS (25% - 65%)
      // Ring draws itself, text morphs
      // ============================================

      // Draw the ring (stroke-dashoffset animation)
      tl.to(
        ring,
        {
          strokeDashoffset: 0,
          duration: 0.35,
          ease: 'none',
        },
        0.25,
      );

      // Left text appears: "SCRAP INDUSTRIAL"
      tl.to(
        leftText,
        {
          opacity: 1,
          x: 0,
          duration: 0.1,
          ease: 'power3.out',
        },
        0.3,
      );

      // Left text fades out, right text appears: "MATERIA PRIMA"
      tl.to(
        leftText,
        {
          opacity: 0,
          x: -20,
          duration: 0.1,
          ease: 'power2.in',
        },
        0.45,
      );

      tl.to(
        rightText,
        {
          opacity: 1,
          x: 0,
          duration: 0.1,
          ease: 'power3.out',
        },
        0.5,
      );

      // ============================================
      // PHASE C: THE REBIRTH (65% - 100%)
      // Badge blooms, ring expands to wipe
      // ============================================

      // Right text fades
      tl.to(
        rightText,
        {
          opacity: 0,
          duration: 0.08,
          ease: 'power2.in',
        },
        0.6,
      );

      // Ring container fades
      tl.to(
        ringContainer,
        {
          opacity: 0,
          duration: 0.1,
          ease: 'power2.in',
        },
        0.62,
      );

      // Badge blooms from center with elastic easing
      tl.to(
        badge,
        {
          scale: 1,
          opacity: 1,
          duration: 0.15,
          ease: 'elastic.out(1, 0.5)',
        },
        0.65,
      );

      // Badge holds, then starts to scale down
      tl.to(
        badge,
        {
          scale: 0.8,
          opacity: 0,
          duration: 0.1,
          ease: 'power2.in',
        },
        0.8,
      );

      // THE WIPE: Expanding ring grows to fill screen
      tl.to(
        expandingRing,
        {
          scale: 60,
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out',
        },
        0.82,
      );

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === section) {
            st.kill();
          }
        });
      };
    },
    { dependencies: [positions, isMobile] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-15"
      style={{ height: '300vh' }}
    >
      {/* Sticky Wrapper */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: '#E8ECF2' }}
      >
        {/* Noise Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* 
          NOTE: Product images are NOT rendered here.
          This section animates the SAME images from StockSection
          via the .stock-floating-image class selector.
          This creates a seamless visual connection between sections.
        */}

        {/* Central Vortex Anchor */}
        <div
          ref={vortexRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        >
          {/* Ring Container */}
          <div
            ref={ringContainerRef}
            className="relative will-change-transform"
            style={{
              width: 'clamp(250px, 45vw, 400px)',
              height: 'clamp(250px, 45vw, 400px)',
            }}
          >
            <RecyclingRing
              className="w-full h-full"
              ringRef={ringRef}
            />

            {/* Left Text: SCRAP INDUSTRIAL */}
            <div
              ref={leftTextRef}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[120%] text-right will-change-transform"
            >
              <span
                className="text-[#1B4B6B] font-bold uppercase tracking-wider whitespace-nowrap"
                style={{
                  fontFamily: getFontFamily('heading'),
                  fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                }}
              >
                SCRAP
                <br />
                INDUSTRIAL
              </span>
            </div>

            {/* Right Text: MATERIA PRIMA */}
            <div
              ref={rightTextRef}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[120%] text-left will-change-transform"
            >
              <span
                className="text-[#1B4B6B] font-bold uppercase tracking-wider whitespace-nowrap"
                style={{
                  fontFamily: getFontFamily('heading'),
                  fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                }}
              >
                MATERIA
                <br />
                PRIMA
              </span>
            </div>
          </div>

          {/* Biodegradable Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <BiodegradableBadge
              badgeRef={badgeRef}
              getFontFamily={getFontFamily}
            />
          </div>
        </div>

        {/* Expanding Ring - for wipe transition */}
        <div
          ref={expandingRingRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none will-change-transform"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#E8ECF2',
            boxShadow: '0 0 0 2px rgba(27, 75, 107, 0.1)',
          }}
        />
      </div>
    </section>
  );
}
