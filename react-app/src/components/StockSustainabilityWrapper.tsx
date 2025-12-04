import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import { getShopifyData } from '@/types/shopify';
import RecycleSvgRaw from '@/assets/recycle.svg?raw';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// TYPES
// ============================================
interface ProductImage {
  src: string;
  alt: string;
}

interface ImagePosition {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  layer: 1 | 2 | 3;
}

// ============================================
// FIXED POSITIONS FOR IMAGES
// ============================================
const DESKTOP_POSITIONS: ImagePosition[] = [
  { x: -42, y: -35, rotate: -8, scale: 0.85, layer: 2 },
  { x: -25, y: -38, rotate: 5, scale: 0.9, layer: 3 },
  { x: -5, y: -42, rotate: -3, scale: 0.75, layer: 1 },
  { x: 15, y: -40, rotate: 6, scale: 0.85, layer: 2 },
  { x: 38, y: -36, rotate: -5, scale: 0.9, layer: 3 },
  { x: -45, y: -10, rotate: -12, scale: 1, layer: 3 },
  { x: -48, y: 18, rotate: 8, scale: 0.8, layer: 1 },
  { x: 42, y: -8, rotate: 10, scale: 0.95, layer: 3 },
  { x: 45, y: 15, rotate: -6, scale: 0.85, layer: 2 },
  { x: 48, y: 35, rotate: 4, scale: 0.75, layer: 1 },
  { x: -38, y: 38, rotate: 6, scale: 0.9, layer: 2 },
  { x: -15, y: 42, rotate: -8, scale: 0.85, layer: 3 },
  { x: 8, y: 40, rotate: 5, scale: 0.8, layer: 2 },
  { x: 28, y: 38, rotate: -4, scale: 0.9, layer: 3 },
  { x: 45, y: 42, rotate: 7, scale: 0.75, layer: 1 },
];

const MOBILE_POSITIONS: ImagePosition[] = [
  { x: -35, y: -38, rotate: -8, scale: 0.8, layer: 2 },
  { x: 0, y: -42, rotate: 5, scale: 0.75, layer: 1 },
  { x: 35, y: -38, rotate: -5, scale: 0.85, layer: 3 },
  { x: -40, y: -5, rotate: -10, scale: 0.9, layer: 3 },
  { x: -42, y: 25, rotate: 6, scale: 0.75, layer: 1 },
  { x: 40, y: 0, rotate: 8, scale: 0.85, layer: 2 },
  { x: 42, y: 28, rotate: -6, scale: 0.8, layer: 3 },
  { x: -32, y: 40, rotate: 5, scale: 0.85, layer: 2 },
  { x: 5, y: 42, rotate: -7, scale: 0.9, layer: 3 },
  { x: 35, y: 38, rotate: 4, scale: 0.75, layer: 1 },
];

function getRandomBgColor(index: number): string {
  const colors = [
    '#F5E6C8',
    '#E8D4B8',
    '#D4E5D7',
    '#E0EBE8',
    '#F0E4D7',
    '#E5E0D4',
    '#D8E8E8',
    '#F2E8DC',
  ];
  return colors[index % colors.length];
}

// ============================================
// RECYCLING RING SVG
// ============================================
function RecyclingRing({
  className,
  ringRef,
}: {
  className?: string;
  ringRef: React.RefObject<SVGCircleElement | null>;
}) {
  const circumference = 2 * Math.PI * 120;
  return (
    <svg
      className={className}
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="140"
        cy="140"
        r="120"
        stroke="rgba(27, 75, 107, 0.1)"
        strokeWidth="2"
        strokeDasharray="8 8"
        fill="none"
      />
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
// BIODEGRADABLE BADGE
// ============================================
function BiodegradableBadge({
  badgeRef,
  getFontFamily,
}: {
  badgeRef: React.RefObject<HTMLDivElement | null>;
  getFontFamily: (type: 'heading' | 'body') => string;
}) {
  return (
    <div
      ref={badgeRef}
      className="flex flex-col items-center justify-center rounded-full will-change-transform"
      style={{
        width: 'clamp(140px, 28vw, 220px)',
        height: 'clamp(140px, 28vw, 220px)',
        background:
          'linear-gradient(135deg, #1B4B6B 0%, #146C90 50%, #0A3D54 100%)',
        boxShadow:
          '0 0 0 4px rgba(94, 234, 212, 0.6), 0 25px 80px rgba(20, 108, 144, 0.4), 0 10px 30px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Recycling SVG Icon */}
      <div
        className="w-10 h-10 md:w-14 md:h-14 mb-2 [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-[#5EEAD4]"
        dangerouslySetInnerHTML={{ __html: RecycleSvgRaw }}
      />
      <span
        className="text-sm md:text-base font-bold uppercase tracking-wider text-center px-3"
        style={{
          fontFamily: getFontFamily('heading'),
          color: '#5EEAD4',
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
// MAIN WRAPPER COMPONENT
// Combines StockSection + SustainabilityLoopSection
// Images are in a FIXED layer that spans both
// ============================================
export function StockSustainabilityWrapper() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const numberRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Sustainability refs
  const ringContainerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const expandingRingRef = useRef<HTMLDivElement>(null);

  const { getFontFamily } = useShopifyTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [hasCountedUp, setHasCountedUp] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get Shopify data
  const shopifyData = getShopifyData();
  const stockData = (shopifyData as any).stockSection ?? {};
  const productImages: ProductImage[] = stockData.productImages ?? [];
  const productCount = stockData.productCount ?? 170;
  const buttonText = stockData.buttonText ?? 'Ver catálogo';
  const buttonUrl = stockData.buttonUrl ?? '/collections/all';

  const positions = useMemo(() => {
    const basePositions = isMobile
      ? MOBILE_POSITIONS
      : DESKTOP_POSITIONS;
    return basePositions.slice(0, productImages.length);
  }, [isMobile, productImages.length]);

  // Count-up animation
  useEffect(() => {
    if (hasCountedUp) return;
    const numberElement = numberRef.current;
    const wrapper = wrapperRef.current;
    if (!numberElement || !wrapper) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasCountedUp(true);
          observer.disconnect();
          const counter = { val: 0 };
          gsap.to(counter, {
            val: productCount,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              numberElement.textContent =
                '+' + Math.round(counter.val);
            },
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [hasCountedUp, productCount]);

  // Layer styles
  const getLayerStyles = (index: number) => {
    const pos = positions[index];
    if (!pos) return { zIndex: 1 };
    return {
      zIndex: pos.layer * 10,
      filter:
        pos.layer === 1
          ? 'blur(2px)'
          : pos.layer === 2
          ? 'blur(0.5px)'
          : 'none',
    };
  };

  useGSAP(
    () => {
      if (
        !wrapperRef.current ||
        !imagesContainerRef.current ||
        productImages.length === 0
      )
        return;

      const wrapper = wrapperRef.current;
      const imagesContainer = imagesContainerRef.current;
      const images = imagesRef.current.filter(
        Boolean
      ) as HTMLDivElement[];
      const title = titleRef.current;
      const ringContainer = ringContainerRef.current;
      const ring = ringRef.current;
      const badge = badgeRef.current;
      const leftText = leftTextRef.current;
      const rightText = rightTextRef.current;
      const expandingRing = expandingRingRef.current;

      if (
        images.length === 0 ||
        !ringContainer ||
        !ring ||
        !badge ||
        !leftText ||
        !rightText ||
        !expandingRing ||
        !title
      )
        return;

      const circumference = 2 * Math.PI * 120;

      // ============================================
      // VISIBILITY CONTROL - Show/hide image container
      // Only visible when wrapper is in viewport
      // ============================================
      gsap.set(imagesContainer, { opacity: 0, visibility: 'hidden' });

      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () =>
          gsap.set(imagesContainer, {
            opacity: 1,
            visibility: 'visible',
          }),
        onLeave: () =>
          gsap.set(imagesContainer, {
            opacity: 0,
            visibility: 'hidden',
          }),
        onEnterBack: () =>
          gsap.set(imagesContainer, {
            opacity: 1,
            visibility: 'visible',
          }),
        onLeaveBack: () =>
          gsap.set(imagesContainer, {
            opacity: 0,
            visibility: 'hidden',
          }),
      });

      // ============================================
      // INITIAL STATES
      // ============================================
      gsap.set(images, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 0,
        opacity: 0,
        rotation: 0,
      });

      gsap.set(ringContainer, { opacity: 0, scale: 0.8 });
      gsap.set(ring, { strokeDashoffset: circumference });
      gsap.set(badge, { scale: 0, opacity: 0 });
      gsap.set(leftText, { opacity: 0, x: -30 });
      gsap.set(rightText, { opacity: 0, x: 30 });
      gsap.set(expandingRing, { scale: 0, opacity: 0 });

      // ============================================
      // MASTER TIMELINE - Spans the entire wrapper
      // Total scroll: 450vh (Stock 150vh + Sustainability 300vh)
      // ============================================
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          // markers: true,
        },
      });

      // Normalize: Stock section is 0-33%, Sustainability is 33-100%
      // Stock section scroll = 150vh out of 450vh total = ~0.33
      const stockEnd = 0.33;

      // ============================================
      // PHASE 1: STOCK SECTION (0% - 33%)
      // Images explode outward
      // ============================================
      const backImages: { el: HTMLDivElement; pos: ImagePosition }[] =
        [];
      const midImages: { el: HTMLDivElement; pos: ImagePosition }[] =
        [];
      const frontImages: {
        el: HTMLDivElement;
        pos: ImagePosition;
      }[] = [];

      images.forEach((img, index) => {
        const pos = positions[index];
        if (!pos) return;
        if (pos.layer === 1) backImages.push({ el: img, pos });
        else if (pos.layer === 2) midImages.push({ el: img, pos });
        else frontImages.push({ el: img, pos });
      });

      // Back layer - appears first
      backImages.forEach(({ el, pos }) => {
        masterTL.to(
          el,
          {
            x: `${pos.x * 0.8}vw`,
            y: `${pos.y * 0.8}vh`,
            scale: pos.scale * 0.85,
            opacity: 0.6,
            rotation: pos.rotate,
            ease: 'power2.out',
            duration: stockEnd * 0.5,
          },
          stockEnd * 0.05
        );
      });

      // Mid layer
      midImages.forEach(({ el, pos }) => {
        masterTL.to(
          el,
          {
            x: `${pos.x}vw`,
            y: `${pos.y}vh`,
            scale: pos.scale * 0.95,
            opacity: 0.85,
            rotation: pos.rotate,
            ease: 'power2.out',
            duration: stockEnd * 0.5,
          },
          stockEnd * 0.1
        );
      });

      // Front layer
      frontImages.forEach(({ el, pos }) => {
        masterTL.to(
          el,
          {
            x: `${pos.x * 1.1}vw`,
            y: `${pos.y * 1.1}vh`,
            scale: pos.scale,
            opacity: 1,
            rotation: pos.rotate,
            ease: 'power2.out',
            duration: stockEnd * 0.5,
          },
          stockEnd * 0.15
        );
      });

      // Parallax drift during stock section
      backImages.forEach(({ el, pos }) => {
        masterTL.to(
          el,
          {
            y: `${pos.y * 0.8 + 8}vh`,
            rotation: pos.rotate + 3,
            duration: stockEnd * 0.5,
            ease: 'none',
          },
          stockEnd * 0.5
        );
      });
      midImages.forEach(({ el, pos }) => {
        masterTL.to(
          el,
          {
            y: `${pos.y + 15}vh`,
            rotation: pos.rotate - 2,
            duration: stockEnd * 0.5,
            ease: 'none',
          },
          stockEnd * 0.5
        );
      });
      frontImages.forEach(({ el, pos }) => {
        masterTL.to(
          el,
          {
            y: `${pos.y * 1.1 + 25}vh`,
            rotation: pos.rotate + 4,
            duration: stockEnd * 0.5,
            ease: 'none',
          },
          stockEnd * 0.5
        );
      });

      // Title fade at end of stock section
      masterTL.to(
        title,
        { opacity: 0, y: -50, duration: 0.05, ease: 'power2.in' },
        stockEnd - 0.05
      );

      // ============================================
      // PHASE 2: SUSTAINABILITY SECTION (33% - 100%)
      // Images implode, ring draws, badge blooms
      // ============================================
      const sustStart = stockEnd;
      const sustDuration = 1 - stockEnd; // 0.67

      // Reset images to their last parallax positions first, then implode
      // Implosion (33% - 50%)
      const implodeStart = sustStart;
      const implodeDuration = sustDuration * 0.25;

      // Back layer implodes first
      backImages.forEach(({ el }) => {
        masterTL.to(
          el,
          {
            x: 0,
            y: 0,
            scale: 0,
            rotation: '+=360',
            opacity: 0,
            duration: implodeDuration,
            ease: 'power3.in',
          },
          implodeStart
        );
      });

      // Mid layer
      midImages.forEach(({ el }) => {
        masterTL.to(
          el,
          {
            x: 0,
            y: 0,
            scale: 0,
            rotation: '+=270',
            opacity: 0,
            duration: implodeDuration,
            ease: 'power3.in',
          },
          implodeStart + implodeDuration * 0.15
        );
      });

      // Front layer
      frontImages.forEach(({ el }) => {
        masterTL.to(
          el,
          {
            x: 0,
            y: 0,
            scale: 0,
            rotation: '+=180',
            opacity: 0,
            duration: implodeDuration,
            ease: 'power3.in',
          },
          implodeStart + implodeDuration * 0.3
        );
      });

      // Ring appears as images disappear
      masterTL.to(
        ringContainer,
        {
          opacity: 1,
          scale: 1,
          duration: sustDuration * 0.1,
          ease: 'power2.out',
        },
        implodeStart + implodeDuration * 0.7
      );

      // Ring draws (50% - 70%)
      const ringStart = sustStart + sustDuration * 0.25;
      masterTL.to(
        ring,
        {
          strokeDashoffset: 0,
          duration: sustDuration * 0.25,
          ease: 'none',
        },
        ringStart
      );

      // Left text: SCRAP INDUSTRIAL
      masterTL.to(
        leftText,
        {
          opacity: 1,
          x: 0,
          duration: sustDuration * 0.08,
          ease: 'power3.out',
        },
        ringStart + sustDuration * 0.05
      );
      masterTL.to(
        leftText,
        {
          opacity: 0,
          x: -20,
          duration: sustDuration * 0.08,
          ease: 'power2.in',
        },
        ringStart + sustDuration * 0.18
      );

      // Right text: MATERIA PRIMA
      masterTL.to(
        rightText,
        {
          opacity: 1,
          x: 0,
          duration: sustDuration * 0.08,
          ease: 'power3.out',
        },
        ringStart + sustDuration * 0.22
      );
      masterTL.to(
        rightText,
        {
          opacity: 0,
          duration: sustDuration * 0.06,
          ease: 'power2.in',
        },
        ringStart + sustDuration * 0.35
      );

      // Ring fades
      masterTL.to(
        ringContainer,
        {
          opacity: 0,
          duration: sustDuration * 0.08,
          ease: 'power2.in',
        },
        ringStart + sustDuration * 0.38
      );

      // Badge blooms (70% - 85%)
      const badgeStart = sustStart + sustDuration * 0.55;
      masterTL.to(
        badge,
        {
          scale: 1,
          opacity: 1,
          duration: sustDuration * 0.12,
          ease: 'elastic.out(1, 0.5)',
        },
        badgeStart
      );
      masterTL.to(
        badge,
        {
          scale: 0.8,
          opacity: 0,
          duration: sustDuration * 0.08,
          ease: 'power2.in',
        },
        badgeStart + sustDuration * 0.18
      );

      // Expanding ring wipe (85% - 100%)
      masterTL.to(
        expandingRing,
        {
          scale: 60,
          opacity: 1,
          duration: sustDuration * 0.15,
          ease: 'power2.out',
        },
        sustStart + sustDuration * 0.82
      );

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === wrapper) st.kill();
        });
      };
    },
    {
      scope: wrapperRef,
      dependencies: [productImages, positions, isMobile],
    }
  );

  return (
    <div
      ref={wrapperRef}
      className="relative z-20"
      style={{ height: '450vh' }} // 150vh Stock + 300vh Sustainability
    >
      {/* FIXED IMAGE LAYER - Spans entire wrapper */}
      <div
        ref={imagesContainerRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 25 }}
      >
        {/* Center anchor for images */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {productImages
            .slice(0, positions.length)
            .map((image, index) => (
              <div
                key={index}
                ref={(el) => {
                  imagesRef.current[index] = el;
                }}
                className="absolute will-change-transform"
                style={{
                  left: '50%',
                  top: '50%',
                  width: isMobile
                    ? 'clamp(50px, 18vw, 100px)'
                    : 'clamp(80px, 12vw, 150px)',
                  ...getLayerStyles(index),
                }}
              >
                <div
                  className="relative w-full aspect-square rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: getRandomBgColor(index),
                    boxShadow:
                      positions[index]?.layer === 3
                        ? '0 15px 40px rgba(0,0,0,0.2)'
                        : positions[index]?.layer === 2
                        ? '0 10px 25px rgba(0,0,0,0.15)'
                        : '0 5px 15px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* STICKY CONTENT LAYER */}
      {/* ============================================ */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ backgroundColor: '#E8ECF2' }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* STOCK SECTION TITLE */}
        <div
          ref={titleRef}
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
        >
          <div className="text-center px-6 max-w-3xl mx-auto pointer-events-auto">
            <h2
              className="font-bold leading-[1.1] mb-6"
              style={{
                fontFamily: getFontFamily('heading'),
                color: '#1B4B6B',
              }}
            >
              <span
                ref={numberRef}
                className="block"
                style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}
              >
                +0
              </span>
              <span
                className="block"
                style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)' }}
              >
                PRODUCTOS EN
              </span>
              <span
                className="block"
                style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)' }}
              >
                STOCK PERMANENTE
              </span>
            </h2>
            <a
              href={buttonUrl}
              className="inline-block px-8 py-3 bg-white rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                fontFamily: getFontFamily('body'),
                color: '#1B4B6B',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(27, 75, 107, 0.1)',
              }}
            >
              {buttonText}
            </a>
          </div>
        </div>

        {/* SUSTAINABILITY CENTRAL ELEMENTS */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
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

            {/* Left Text */}
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

            {/* Right Text */}
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

          {/* Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <BiodegradableBadge
              badgeRef={badgeRef}
              getFontFamily={getFontFamily}
            />
          </div>
        </div>

        {/* Expanding Ring Wipe */}
        <div
          ref={expandingRingRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none will-change-transform"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#E8ECF2',
            boxShadow: '0 0 0 2px rgba(27, 75, 107, 0.1)',
          }}
        />
      </div>
    </div>
  );
}
