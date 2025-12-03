import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState, useEffect } from 'react';
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

// ============================================
// RESPONSIVE POSITIONS HOOK
// ============================================
function useResponsivePositions() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop positions - spread out more
  const desktopPositions = [
    { x: -35, y: -38, rotate: -5, scale: 1 }, // Top left
    { x: 35, y: -32, rotate: 8, scale: 1.1 }, // Top right
    { x: -38, y: 38, rotate: -3, scale: 0.95 }, // Bottom left
    { x: 38, y: 35, rotate: 5, scale: 1.05 }, // Bottom right
    { x: -20, y: -5, rotate: -8, scale: 0.85 }, // Center left
    { x: 22, y: 8, rotate: 10, scale: 0.8 }, // Center right
  ];

  // Mobile positions - tighter, vertical layout
  const mobilePositions = [
    { x: -30, y: -35, rotate: -3, scale: 0.8 }, // Top left
    { x: 30, y: -30, rotate: 5, scale: 0.85 }, // Top right
    { x: -32, y: 32, rotate: -5, scale: 0.75 }, // Bottom left
    { x: 32, y: 35, rotate: 3, scale: 0.8 }, // Bottom right
    { x: -15, y: 0, rotate: -2, scale: 0.7 }, // Middle left
    { x: 18, y: 5, rotate: 4, scale: 0.65 }, // Middle right
  ];

  return isMobile ? mobilePositions : desktopPositions;
}

// ============================================
// STOCK SECTION COMPONENT
// ============================================
export function StockSection({
  buttonText: propButtonText,
  buttonUrl: propButtonUrl,
}: StockSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const { getFontFamily } = useShopifyTheme();

  // Get product images and settings from Shopify data
  const shopifyData = getShopifyData();
  const stockData = (shopifyData as any).stockSection ?? {};

  const productImages: ProductImage[] = stockData.productImages ?? [];
  const buttonText =
    propButtonText ?? stockData.buttonText ?? 'Ver catálogo';
  const buttonUrl =
    propButtonUrl ?? stockData.buttonUrl ?? '/collections/all';

  // Get responsive positions
  const explodedPositions = useResponsivePositions();

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !pinContainerRef.current ||
        !contentRef.current
      )
        return;
      if (productImages.length === 0) return;

      const section = sectionRef.current;
      const pinContainer = pinContainerRef.current;
      const content = contentRef.current;
      const images = imagesRef.current.filter(
        Boolean
      ) as HTMLDivElement[];

      // Set initial state - all images clustered in center (hidden)
      gsap.set(images, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 0,
        opacity: 0,
        rotation: 0,
      });

      // Set initial content state
      gsap.set(content, {
        opacity: 0,
        y: 40,
      });

      // Create the main explosion timeline with PIN
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%', // Scroll for 150% of viewport height
          scrub: 1,
          pin: pinContainer,
          pinSpacing: true,
          anticipatePin: 1,
          // markers: true, // Uncomment for debugging
        },
      });

      // Animate each image to its exploded position
      images.forEach((img, index) => {
        const pos =
          explodedPositions[index % explodedPositions.length];

        tl.to(
          img,
          {
            x: `${pos.x}vw`,
            y: `${pos.y}vh`,
            scale: pos.scale,
            opacity: 1,
            rotation: pos.rotate,
            ease: 'power2.out',
            duration: 0.5,
          },
          0 // All start together
        );
      });

      // Fade in the content after images explode
      tl.to(
        content,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        },
        0.3
      );
    },
    {
      scope: sectionRef,
      dependencies: [productImages, explodedPositions],
    }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ backgroundColor: '#E8ECF2' }}
    >
      {/* Pin Container - This gets pinned during scroll */}
      <div
        ref={pinContainerRef}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: '#E8ECF2' }}
      >
        {/* Product Images - Positioned absolutely */}
        <div className="absolute inset-0 pointer-events-none">
          {productImages.map((image, index) => (
            <div
              key={index}
              ref={(el) => {
                imagesRef.current[index] = el;
              }}
              className="absolute top-1/2 left-1/2 will-change-transform"
              style={{
                width: 'clamp(80px, 15vw, 180px)',
                height: 'auto',
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-contain"
                style={{
                  filter:
                    'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15))',
                }}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Center Content */}
        <div
          ref={contentRef}
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        >
          {/* Title - Split into lines like the design */}
          <h2
            className="font-bold leading-[1.1] mb-8"
            style={{
              fontFamily: getFontFamily('heading'),
              color: '#1B4B6B',
            }}
          >
            <span
              className="block"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
            >
              +170
            </span>
            <span
              className="block"
              style={{ fontSize: 'clamp(1.5rem, 4.5vw, 3rem)' }}
            >
              PRODUCTOS EN
            </span>
            <span
              className="block"
              style={{ fontSize: 'clamp(1.5rem, 4.5vw, 3rem)' }}
            >
              STOCK PERMANENTE
            </span>
          </h2>

          {/* Button */}
          <a
            href={buttonUrl}
            className="inline-block px-8 py-3 bg-white rounded-full font-medium 
                       transition-all duration-300 hover:scale-105"
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
    </section>
  );
}
