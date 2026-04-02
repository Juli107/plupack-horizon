import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useId, useMemo, useRef } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import {
  setCameraDirectorIndustryActive,
  setCameraDirectorIndustryProgress,
  setCameraDirectorIndustrySectionProgress,
  setCameraDirectorIndustryVisible,
} from './canvas/cameraDirector';
import {
  INDUSTRY_TIMELINE,
  normalizeIndustrySectionProgress,
} from './canvas/industryTimeline';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// INDUSTRY COLORS
// ============================================
const INDUSTRY_COLORS = {
  industrial: '#1A5F7A', // Deep teal blue
  gastronomy: '#3D7A8C', // Muted teal
  institutional: '#2D6A6A', // Teal green
  exit: '#084e85', // Return to main brand color
};

// ============================================
// COLOR INTERPOLATION UTILITY
// ============================================
function interpolateColors(
  color1: string,
  color2: string,
  factor: number,
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
// OUTLINE TEXT COMPONENT WITH KINETIC FILL
// When in focus: outline fades to reveal solid text + scales up
// When scrolling away: outline fades back in
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
  const isSafari = useMemo(
    () =>
      typeof navigator !== 'undefined' &&
      /Safari/i.test(navigator.userAgent) &&
      !/Chrome|CriOS|Edg|OPR|FxiOS/i.test(navigator.userAgent),
    [],
  );
  const outlineId = useId();
  const filterId = useMemo(
    () => `outline-filter-${text.replace(/\s/g, '-').toLowerCase()}-${outlineId}`,
    [outlineId, text],
  );

  if (isSafari) {
    return (
      <span
        className={`relative inline-block whitespace-nowrap ${className}`}
        style={{
          transform:
            'scale(calc(var(--industry-fit-scale, 1) * (1 + var(--industry-fill-progress, 0) * 0.05)))',
          transition: 'transform 0.24s ease-out',
        }}
      >
        <span
          className="invisible font-bold tracking-tight"
          aria-hidden="true"
        >
          {text}
        </span>

        <span
          aria-hidden="true"
          className="absolute inset-0 font-bold tracking-tight text-transparent"
          style={{
            fontFamily: getFontFamily('heading'),
            WebkitTextStroke: `${strokeWidth}px white`,
          }}
        >
          {text}
        </span>

        <span
          aria-hidden="true"
          className="absolute inset-0 font-bold tracking-tight text-white"
          style={{
            fontFamily: getFontFamily('heading'),
            opacity: 'var(--industry-fill-progress, 0)',
            transition: 'opacity 0.2s linear',
          }}
        >
          {text}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        transform:
          'scale(calc(var(--industry-fit-scale, 1) * (1 + var(--industry-fill-progress, 0) * 0.05)))',
        transition: 'transform 0.3s ease-out',
      }}
    >
      {/* Invisible text for sizing */}
      <span
        className="invisible font-bold tracking-tight"
        aria-hidden="true"
      >
        {text}
      </span>

      {/* SVG text layers */}
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

        {/* Outline text - always visible */}
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

        {/* Solid fill text - fades in on top based on fillProgress */}
        <text
          x="0"
          y="1.3em"
          className="font-bold tracking-tight"
          style={{
            fontFamily: getFontFamily('heading'),
            fontSize: 'inherit',
            fill: 'white',
            opacity: 'var(--industry-fill-progress, 0)',
            transition: 'opacity 0.3s ease-out',
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
  const titleMeasureRef = useRef<HTMLSpanElement>(null);
  const { getFontFamily } = useShopifyTheme();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const titleEl = section.querySelector('.industry-title');
      section.style.setProperty('--industry-fill-progress', '0');
      section.style.setProperty('--industry-fit-scale', '1');

      let resizeRaf: number | null = null;

      const updateTitleFitScale = () => {
        if (!sectionRef.current || !titleMeasureRef.current) return;

        const availableWidth = sectionRef.current.clientWidth * 0.94;
        const titleWidth = titleMeasureRef.current.offsetWidth;
        if (!titleWidth) return;

        const fitScale = Math.min(1, availableWidth / titleWidth);
        sectionRef.current.style.setProperty(
          '--industry-fit-scale',
          fitScale.toFixed(4),
        );
      };

      const scheduleTitleFitScaleUpdate = () => {
        if (resizeRaf !== null) {
          cancelAnimationFrame(resizeRaf);
        }

        resizeRaf = requestAnimationFrame(() => {
          resizeRaf = null;
          updateTitleFitScale();
        });
      };

      scheduleTitleFitScaleUpdate();

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
        },
      );

      // Kinetic typography: fill when in center focus
      // Progress goes 0 -> 1 -> 0 as section scrolls through viewport center
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 0.5,
        onUpdate: (self) => {
          // Create a bell curve: 0 at edges, 1 at center
          const progress = self.progress;
          // Use sine curve for smooth in/out: peaks at 0.5
          const fillValue = Math.sin(progress * Math.PI);
          section.style.setProperty(
            '--industry-fill-progress',
            fillValue.toFixed(4),
          );
        },
        onLeave: () => section.style.setProperty('--industry-fill-progress', '0'),
        onLeaveBack: () =>
          section.style.setProperty('--industry-fill-progress', '0'),
      });

      let resizeObserver: ResizeObserver | null = null;

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          scheduleTitleFitScaleUpdate();
        });
        resizeObserver.observe(section);
      }

      window.addEventListener('resize', scheduleTitleFitScaleUpdate);

      if (document.fonts && typeof document.fonts.ready?.then === 'function') {
        void document.fonts.ready.then(() => {
          scheduleTitleFitScaleUpdate();
        });
      }

      return () => {
        if (resizeRaf !== null) {
          cancelAnimationFrame(resizeRaf);
        }

        if (resizeObserver) {
          resizeObserver.disconnect();
        }

        window.removeEventListener('resize', scheduleTitleFitScaleUpdate);
      };
    },
    { scope: sectionRef },
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
          className="industry-title inline-block whitespace-nowrap leading-none text-white will-change-transform"
          style={{ fontFamily: getFontFamily('heading') }}
        >
          <span ref={titleMeasureRef} className="inline-block">
            <OutlineText
              text={title}
              className="block text-[clamp(3rem,15vw,11.2rem)]"
              strokeWidth={2}
            />
          </span>
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
      description: 'Protección para tu operación',
      color: INDUSTRY_COLORS.industrial,
    },
    {
      id: 'gastronomy',
      title: 'GASTRONOMÍA',
      description: 'Packaging y descartables para alimentos',
      color: INDUSTRY_COLORS.gastronomy,
    },
    {
      id: 'institutional',
      title: 'INSTITUCIONAL',
      description: 'Artículos institucionales de alto rendimiento',
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
        start: INDUSTRY_TIMELINE.sectionTrigger.visibilityRange.start,
        end: INDUSTRY_TIMELINE.sectionTrigger.visibilityRange.end,
        onEnter: () => {
          bg.style.opacity = '1';
          setCameraDirectorIndustryVisible(true);
        },
        onLeave: () => {
          bg.style.opacity = '0';
          setCameraDirectorIndustryVisible(false);
        },
        onEnterBack: () => {
          bg.style.opacity = '1';
          setCameraDirectorIndustryVisible(true);
        },
        onLeaveBack: () => {
          bg.style.opacity = '0';
          setCameraDirectorIndustryVisible(false);
        },
      });

      // Smooth color transition based on scroll position through the container
      ScrollTrigger.create({
        trigger: container,
        start: INDUSTRY_TIMELINE.sectionTrigger.progressRange.start,
        end: INDUSTRY_TIMELINE.sectionTrigger.progressRange.end,
        scrub: true,
        onToggle: (self) => {
          const sectionProgress = normalizeIndustrySectionProgress(self.progress);

          if (self.isActive) {
            setCameraDirectorIndustryProgress(sectionProgress);
            setCameraDirectorIndustrySectionProgress(sectionProgress);
            setCameraDirectorIndustryActive(true);
            return;
          }

          setCameraDirectorIndustryActive(false);

          setCameraDirectorIndustryProgress(self.direction < 0 ? 0 : 1);
          setCameraDirectorIndustrySectionProgress(self.direction < 0 ? 0 : 1);
        },
        onUpdate: (self) => {
          const sectionProgress =
            normalizeIndustrySectionProgress(self.progress);

          setCameraDirectorIndustryProgress(sectionProgress);
          setCameraDirectorIndustrySectionProgress(sectionProgress);

          const progress = sectionProgress;
          const totalSections = colors.length;

          // Scale progress across all sections
          const scaledProgress = progress * totalSections;
          const currentIndex = Math.min(
            Math.floor(scaledProgress),
            totalSections - 1,
          );
          const nextIndex = Math.min(
            currentIndex + 1,
            totalSections - 1,
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
            localProgress,
          );
          bg.style.backgroundColor = currentColor;
        },
      });

      return () => {
        setCameraDirectorIndustryActive(false);
        setCameraDirectorIndustryProgress(0);
        setCameraDirectorIndustrySectionProgress(0);
        setCameraDirectorIndustryVisible(false);
      };
    },
    { scope: containerRef },
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
