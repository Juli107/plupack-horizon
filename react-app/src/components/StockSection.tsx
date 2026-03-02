import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import { useRef, useMemo, useEffect, useState } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import { getShopifyData } from '@/types/shopify';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// TYPES
// ============================================
interface ProductImage {
  src: string;
  alt: string;
}

interface StockSectionProps {
  buttonText?: string;
  buttonUrl?: string;
}

interface ImagePosition {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  layer: 1 | 2 | 3;
}

// ============================================
// FIXED POSITIONS FOR A CLEAN LAYOUT
// Positions are in percentages from center
// Arranged to frame the title nicely
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
// STOCK SECTION COMPONENT
// Uses CSS sticky positioning for natural scroll feel
// Compatible with Lenis smooth scroll
// ============================================
export function StockSection({
  buttonText: propButtonText,
  buttonUrl: propButtonUrl,
}: StockSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const numberRef = useRef<HTMLSpanElement>(null);
  const { getFontFamily } = useShopifyTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [hasCountedUp, setHasCountedUp] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get product images and settings from Shopify data
  const shopifyData = getShopifyData();
  const stockData = (shopifyData as any).stockSection ?? {};

  const productImages: ProductImage[] = stockData.productImages ?? [];
  const productCount = stockData.productCount ?? 170;
  const buttonText =
    propButtonText ?? stockData.buttonText ?? 'Ver productos';
  const buttonUrl =
    propButtonUrl ?? stockData.buttonUrl ?? '/collections/all';

  // Use fixed positions based on screen size
  const positions = useMemo(() => {
    const basePositions = isMobile
      ? MOBILE_POSITIONS
      : DESKTOP_POSITIONS;
    // Only use as many positions as we have images
    return basePositions.slice(0, productImages.length);
  }, [isMobile, productImages.length]);

  // Sync with Lenis - ensures ScrollTrigger stays in sync with smooth scroll
  useLenis(() => {
    ScrollTrigger.update();
  });

  // Auto count-up animation when section enters viewport
  useEffect(() => {
    if (hasCountedUp) return;

    const numberElement = numberRef.current;
    const containerElement = containerRef.current;

    if (!numberElement || !containerElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
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
      { threshold: 0.1 },
    );

    observer.observe(containerElement);

    return () => observer.disconnect();
  }, [hasCountedUp, productCount]);

  useGSAP(
    () => {
      if (!containerRef.current || !stickyRef.current) return;

      // Only run image animations if we have images
      if (productImages.length === 0) return;

      const images = imagesRef.current.filter(
        Boolean,
      ) as HTMLDivElement[];
      if (images.length === 0) return;

      const container = containerRef.current;

      // Set initial state - images at center, invisible
      gsap.set(images, {
        xPercent: -50,
        yPercent: -50,
        left: '50%',
        top: '50%',
        x: 0,
        y: 0,
        scale: 0,
        opacity: 0,
        rotation: 0,
      });

      // Main scroll-driven animation for images
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          // markers: true, // Uncomment for debugging
        },
      });

      // Phase 2: Explode images outward (20% - 80% of scroll)
      // Stagger by layer: back layer first, then mid, then front
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

      // Back layer - appears first, moves slower
      backImages.forEach(({ el, pos }) => {
        tl.to(
          el,
          {
            x: `${pos.x * 0.8}vw`,
            y: `${pos.y * 0.8}vh`,
            scale: pos.scale * 0.85,
            opacity: 0.6,
            rotation: pos.rotate,
            ease: 'power2.out',
            duration: 0.4,
          },
          0.1,
        );
      });

      // Mid layer
      midImages.forEach(({ el, pos }) => {
        tl.to(
          el,
          {
            x: `${pos.x}vw`,
            y: `${pos.y}vh`,
            scale: pos.scale * 0.95,
            opacity: 0.85,
            rotation: pos.rotate,
            ease: 'power2.out',
            duration: 0.4,
          },
          0.15,
        );
      });

      // Front layer - appears last, full opacity
      frontImages.forEach(({ el, pos }) => {
        tl.to(
          el,
          {
            x: `${pos.x * 1.1}vw`,
            y: `${pos.y * 1.1}vh`,
            scale: pos.scale,
            opacity: 1,
            rotation: pos.rotate,
            ease: 'power2.out',
            duration: 0.4,
          },
          0.2,
        );
      });

      // Continuous parallax movement - each layer moves at different speeds
      // Back layer: slowest movement (closest to camera focal point)
      backImages.forEach(({ el, pos }) => {
        tl.to(
          el,
          {
            y: `${pos.y * 0.8 + 8}vh`,
            rotation: pos.rotate + 3,
            duration: 0.5,
            ease: 'none',
          },
          0.5,
        );
      });

      // Mid layer: medium movement
      midImages.forEach(({ el, pos }) => {
        tl.to(
          el,
          {
            y: `${pos.y + 15}vh`,
            rotation: pos.rotate - 2,
            duration: 0.5,
            ease: 'none',
          },
          0.5,
        );
      });

      // Front layer: fastest movement (furthest from camera focal point)
      frontImages.forEach(({ el, pos }) => {
        tl.to(
          el,
          {
            y: `${pos.y * 1.1 + 25}vh`,
            rotation: pos.rotate + 4,
            duration: 0.5,
            ease: 'none',
          },
          0.5,
        );
      });

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === container) {
            st.kill();
          }
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [productImages, positions, isMobile],
    },
  );

  // Get layer-based styling
  const getLayerStyles = (index: number) => {
    const pos = positions[index];
    if (!pos) return { zIndex: 1 };

    const layer = pos.layer;
    return {
      zIndex: layer * 10,
      filter:
        layer === 1
          ? 'blur(2px)'
          : layer === 2
            ? 'blur(0.5px)'
            : 'none',
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative z-20"
      style={{ backgroundColor: '#E8ECF2' }}
    >
      {/* Sticky container - sticks to top while scrolling through the section */}
      <div
        ref={stickyRef}
        className="sticky top-0 w-full h-screen overflow-hidden"
        style={{ backgroundColor: '#E8ECF2' }}
      >
        {/* Product Images - positioned absolutely from center */}
        {productImages
          .slice(0, positions.length)
          .map((image, index) => (
            <div
              key={index}
              ref={(el) => {
                imagesRef.current[index] = el;
              }}
              data-stock-image={index}
              className="absolute will-change-transform stock-floating-image"
              style={{
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

        {/* Center Content - Title and Button */}
        <div
          ref={titleRef}
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
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
                className="stock-number block"
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

            <a href={buttonUrl} className="button button--primary">
              {buttonText}
            </a>
          </div>
        </div>
      </div>

      {/* Extra scroll space - this is what you scroll through while sticky is pinned */}
      {/* Height = 150vh means you scroll 1.5 viewport heights while content stays sticky */}
      <div style={{ height: '150vh' }} />
    </div>
  );
}

// Helper to get random-ish background colors for image cards
function getRandomBgColor(index: number): string {
  const colors = [
    '#F5E6C8', // warm beige
    '#E8D4B8', // tan
    '#D4E5D7', // soft green
    '#E0EBE8', // mint
    '#F0E4D7', // cream
    '#E5E0D4', // taupe
    '#D8E8E8', // light teal
    '#F2E8DC', // light sand
  ];
  return colors[index % colors.length];
}
