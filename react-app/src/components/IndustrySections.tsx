import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// INDUSTRY COLORS
// ============================================
const INDUSTRY_COLORS = {
  industrial: '#1A5F7A', // Deep teal blue
  gastronomy: '#3D7A8C', // Muted teal
  institutional: '#2D6A6A', // Teal green
  exit: '#146C90', // Return to main brand color
};

// ============================================
// COLOR INTERPOLATION UTILITY
// ============================================
function interpolateColors(
  color1: string,
  color2: string,
  factor: number
): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ============================================
// OUTLINE TEXT COMPONENT
// ============================================
interface OutlineTextProps {
  text: string;
  className?: string;
  strokeWidth?: number;
}

function OutlineText({
  text,
  className = '',
  strokeWidth = 2,
}: OutlineTextProps) {
  const { getFontFamily } = useShopifyTheme();
  const filterId = `outline-filter-${text
    .replace(/\s/g, '-')
    .toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <span className={`relative inline-block ${className}`}>
      {/* Invisible text for sizing */}
      <span
        className="invisible font-bold tracking-tight"
        aria-hidden="true"
      >
        {text}
      </span>

      {/* SVG outline text */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
        <defs>
          <filter
            id={filterId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
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
          y="1.3em"
          className="font-bold tracking-tight"
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
// SINGLE INDUSTRY SECTION
// ============================================
interface IndustrySectionProps {
  id: string;
  title: string;
  description: string;
  index: number;
}

function IndustrySection({
  id,
  title,
  description,
  index,
}: IndustrySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { getFontFamily } = useShopifyTheme();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const titleEl = section.querySelector('.industry-title');

      // Title reveal animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'top 30%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(
        titleEl,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <div
      ref={sectionRef}
      id={id}
      className="industry-section relative w-full min-h-[80vh] md:min-h-screen flex overflow-hidden"
      data-industry-index={index}
    >
      {/* Title Layer - BEHIND 3D canvas (z-5) */}
      <div className="absolute z-5 inset-0 w-full h-full flex justify-center pointer-events-none">
        <h2
          className="industry-title text-white will-change-transform"
          style={{ fontFamily: getFontFamily('heading') }}
        >
          <OutlineText
            text={title}
            className="block text-[clamp(3rem,15vw,11.2rem)]"
            strokeWidth={2}
          />
        </h2>
      </div>

      {/* Description Layer - ABOVE 3D canvas (z-20) */}
      <div className="absolute z-20 bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 w-full px-10 md:pb-20 max-w-md pointer-events-auto text-left">
        <div className="w-10 h-0.5 bg-white/60 mb-1" />
        <p
          className="text-white/90 text-md leading-relaxed"
          style={{ fontFamily: getFontFamily('body') }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ============================================
// INDUSTRY SECTIONS CONTAINER
// ============================================
export function IndustrySections() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const industries = [
    {
      id: 'industrial',
      title: 'INDUSTRIAL',
      description:
        'Protección, film stretch y cintas para tu línea de producción y centro de distribución.',
      color: INDUSTRY_COLORS.industrial,
    },
    {
      id: 'gastronomy',
      title: 'GASTRONOMÍA',
      description:
        'Packaging seguro para alimentos, compostable y personalizado para delivery y take away.',
      color: INDUSTRY_COLORS.gastronomy,
    },
    {
      id: 'institutional',
      title: 'INSTITUCIONAL',
      description:
        'Insumos certificados y esterilizados para laboratorios, clínicas y centros médicos.',
      color: INDUSTRY_COLORS.institutional,
    },
  ];

  useGSAP(
    () => {
      if (!containerRef.current || !bgRef.current) return;

      const container = containerRef.current;
      const bg = bgRef.current;
      const colors = industries.map((i) => i.color);

      // Set initial color and hide it
      bg.style.backgroundColor = colors[0];
      bg.style.opacity = '0';

      // Show/hide the fixed background based on container visibility
      ScrollTrigger.create({
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => {
          bg.style.opacity = '1';
        },
        onLeave: () => {
          bg.style.opacity = '0';
        },
        onEnterBack: () => {
          bg.style.opacity = '1';
        },
        onLeaveBack: () => {
          bg.style.opacity = '0';
        },
      });

      // Smooth color transition based on scroll position through the container
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalSections = colors.length;

          // Scale progress across all sections
          const scaledProgress = progress * totalSections;
          const currentIndex = Math.min(
            Math.floor(scaledProgress),
            totalSections - 1
          );
          const nextIndex = Math.min(
            currentIndex + 1,
            totalSections - 1
          );

          // Local progress within current section (0 to 1)
          const localProgress = scaledProgress - currentIndex;

          // Get colors for interpolation
          const fromColor = colors[currentIndex];
          const toColor =
            currentIndex === nextIndex
              ? INDUSTRY_COLORS.exit
              : colors[nextIndex];

          // Interpolate and apply color
          const currentColor = interpolateColors(
            fromColor,
            toColor,
            localProgress
          );
          bg.style.backgroundColor = currentColor;
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Fixed background - controlled by ScrollTrigger visibility */}
      <div
        ref={bgRef}
        className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
        style={{
          backgroundColor: INDUSTRY_COLORS.industrial,
          zIndex: 0,
          opacity: 0,
        }}
      />

      {/* Industry Sections */}
      <div className="relative">
        {industries.map((industry, index) => (
          <IndustrySection
            key={industry.id}
            id={industry.id}
            title={industry.title}
            description={industry.description}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
