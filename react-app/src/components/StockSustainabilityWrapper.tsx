import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import { getShopifyData } from '@/types/shopify';

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

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const seeded = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function generateRainPositions(
  count: number,
  isMobile: boolean
): ImagePosition[] {
  const maxVisible = isMobile ? 24 : 42;
  const total = Math.min(count, maxVisible);
  if (total <= 0) return [];

  return Array.from({ length: total }, (_, index) => {
    const angle = seeded(index + 2000) * Math.PI * 2;

    const radiusX = (isMobile ? 30 : 36) + seeded(index + 2100) * (isMobile ? 14 : 20);
    const radiusY = (isMobile ? 24 : 28) + seeded(index + 2200) * (isMobile ? 14 : 18);

    let baseX = Math.cos(angle) * radiusX;
    let baseY = Math.sin(angle) * radiusY;

    const jitterX = (seeded(index + 1) - 0.5) * (isMobile ? 9 : 7);
    const jitterY = (seeded(index + 101) - 0.5) * (isMobile ? 7 : 6);
    const depthRand = seeded(index + 500);

    const layer: 1 | 2 | 3 =
      depthRand > 0.68 ? 3 : depthRand > 0.34 ? 2 : 1;

    const scaleBase = layer === 3 ? 0.92 : layer === 2 ? 0.82 : 0.72;
    const scale = scaleBase + seeded(index + 800) * 0.12;

    // Keep center relatively clear so text remains readable.
    if (Math.abs(baseX) < 18 && Math.abs(baseY) < 14) {
      baseX *= 1.6;
      baseY *= 1.6;
    }

    return {
      x: clamp(baseX + jitterX, -49, 49),
      y: clamp(baseY + jitterY, -48, 46),
      rotate: Math.round((seeded(index + 1200) - 0.5) * 24),
      scale,
      layer,
    };
  });
}

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
// STOCK SECTION WRAPPER (Simplified — stock explosion only)
// Sustainability phase removed; now an independent EnvironmentSection.
// ============================================
export function StockSustainabilityWrapper() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const numberRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

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
  const productCount = stockData.productCount ?? 200;
  const rainImageCount = stockData.rainImageCount ?? 24;
  const buttonText = stockData.buttonText ?? 'Ver productos';
  const buttonUrl = stockData.buttonUrl ?? '/collections/all';

  const positions = useMemo(() => {
    return generateRainPositions(
      Math.min(productImages.length, rainImageCount),
      isMobile
    );
  }, [isMobile, productImages.length, rainImageCount]);

  const imageSize = useMemo(() => {
    const dense = positions.length > (isMobile ? 10 : 16);

    if (isMobile) {
      return dense
        ? 'clamp(42px, 12vw, 74px)'
        : 'clamp(50px, 18vw, 100px)';
    }

    return dense
      ? 'clamp(56px, 7vw, 96px)'
      : 'clamp(80px, 12vw, 150px)';
  }, [isMobile, positions.length]);

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

      if (images.length === 0 || !title) return;

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

      // ============================================
      // STOCK EXPLOSION TIMELINE
      // Images explode outward and drift with parallax
      // ============================================
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      });

      const backElements: HTMLDivElement[] = [];
      const backPositions: ImagePosition[] = [];
      const midElements: HTMLDivElement[] = [];
      const midPositions: ImagePosition[] = [];
      const frontElements: HTMLDivElement[] = [];
      const frontPositions: ImagePosition[] = [];

      images.forEach((img, index) => {
        const pos = positions[index];
        if (!pos) return;

        if (pos.layer === 1) {
          backElements.push(img);
          backPositions.push(pos);
          return;
        }

        if (pos.layer === 2) {
          midElements.push(img);
          midPositions.push(pos);
          return;
        }

        frontElements.push(img);
        frontPositions.push(pos);
      });

      const addLayerTweens = (
        layerElements: HTMLDivElement[],
        layerPositions: ImagePosition[],
        startAt: number,
        xMultiplier: number,
        yMultiplier: number,
        scaleMultiplier: number,
        opacity: number,
        driftY: number,
        driftRotation: number
      ) => {
        if (layerElements.length === 0) return;

        masterTL.to(
          layerElements,
          {
            x: (i) => `${layerPositions[i].x * xMultiplier}vw`,
            y: (i) => `${layerPositions[i].y * yMultiplier}vh`,
            scale: (i) => layerPositions[i].scale * scaleMultiplier,
            opacity,
            rotation: (i) => layerPositions[i].rotate,
            ease: 'power2.out',
            duration: 0.5,
          },
          startAt
        );

        masterTL.to(
          layerElements,
          {
            y: (i) =>
              `${layerPositions[i].y * yMultiplier + driftY}vh`,
            rotation: (i) => layerPositions[i].rotate + driftRotation,
            duration: 0.5,
            ease: 'none',
          },
          0.5
        );
      };

      addLayerTweens(
        backElements,
        backPositions,
        0.05,
        0.8,
        0.8,
        0.85,
        0.6,
        8,
        3
      );
      addLayerTweens(
        midElements,
        midPositions,
        0.1,
        1,
        1,
        0.95,
        0.85,
        15,
        -2
      );
      addLayerTweens(
        frontElements,
        frontPositions,
        0.15,
        1.1,
        1.1,
        1,
        1,
        25,
        4
      );

      // Title fades at end
      masterTL.to(
        title,
        { opacity: 0, y: -50, duration: 0.05, ease: 'power2.in' },
        0.9
      );

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === wrapper) st.kill();
        });
      };
    },
    {
      scope: wrapperRef,
      dependencies: [productImages, positions, isMobile, imageSize],
    }
  );

  return (
    <div
      ref={wrapperRef}
      className="stock-sustainability-trigger relative z-20"
      style={{ height: '150vh' }}
    >
      {/* FIXED IMAGE LAYER */}
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
                  width: imageSize,
                  ...getLayerStyles(index),
                }}
              >
                <div
                  className="relative w-full aspect-square overflow-hidden"
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
                    width={300}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* STICKY CONTENT LAYER */}
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
                ARTÍCULOS EN
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
              className="inline-block px-8 py-3 rounded-[10px] text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105"
              style={{
                fontFamily: getFontFamily('body'),
                backgroundColor: '#2873A8',
                color: 'white',
              }}
            >
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
