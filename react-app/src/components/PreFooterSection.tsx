import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// OUTLINE TEXT COMPONENT
// ============================================
// SVG-based outline text for "SIN LÍMITES"
interface OutlineTextProps {
  text: string;
  className?: string;
  strokeWidth?: number;
}

function OutlineText({
  text,
  className = '',
  strokeWidth = 3,
}: OutlineTextProps) {
  const { getFontFamily } = useShopifyTheme();
  const filterId = `outline-filter-${text
    .replace(/\s/g, '-')
    .toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <span className={`relative inline-block ${className}`}>
      {/* Invisible text for sizing */}
      <span
        className="invisible font-medium tracking-tight uppercase"
        aria-hidden="true"
      >
        {text}
      </span>

      {/* SVG outline text */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feMorphology
              in="SourceAlpha"
              result="DILATED"
              operator="dilate"
              radius={strokeWidth}
            />
            <feComposite
              in="DILATED"
              in2="SourceAlpha"
              operator="out"
              result="OUTLINE"
            />
            <feFlood floodColor="white" result="COLOR" />
            <feComposite
              in="COLOR"
              in2="OUTLINE"
              operator="in"
              result="FINAL"
            />
          </filter>
        </defs>
        <text
          x="0"
          y="0.85em"
          className="font-medium tracking-tight uppercase"
          style={{
            fontFamily: getFontFamily('heading'),
            fontSize: 'inherit',
            filter: `url(#${filterId})`,
            fill: 'white',
          }}
        >
          {text}
        </text>
      </svg>
    </span>
  );
}

// ============================================
// PRE-FOOTER SECTION COMPONENT
// ============================================
export function PreFooterSection() {
  const { getFontFamily } = useShopifyTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate content on scroll
  useGSAP(
    () => {
      if (!sectionRef.current || !contentRef.current) return;

      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="pre-footer-trigger relative z-20 w-full min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Blur Overlay - sits above the 3D canvas (GlobalCanvas is z-10) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: 'rgba(30, 67, 119, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />

      {/* Content Container */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 md:px-12 py-20"
      >
        {/* Main Headline */}
        <h2
          className="text-5xl md:text-7xl lg:text-[116px] font-medium uppercase tracking-tight leading-[0.95] text-white mb-8"
          style={{ fontFamily: getFontFamily('heading') }}
        >
          Embalajes
          <br />
          <OutlineText
            text="SIN LÍMITES"
            strokeWidth={2.8}
            className="text-5xl md:text-7xl lg:text-[116px]"
          />
        </h2>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <a
            href="/collections/all"
            className="px-10 py-3 bg-white text-[#0B6386] rounded-[10px] font-semibold hover:bg-gray-100 transition-colors uppercase text-sm tracking-wider"
            style={{ fontFamily: getFontFamily('body') }}
          >
            Ver productos
          </a>
        </div>
      </div>
    </section>
  );
}
