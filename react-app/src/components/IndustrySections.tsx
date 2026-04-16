import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
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

function hexToRgba(hexColor: string, alpha: number): string {
  const normalizedHex = hexColor.replace('#', '');
  const r = parseInt(normalizedHex.substring(0, 2), 16);
  const g = parseInt(normalizedHex.substring(2, 4), 16);
  const b = parseInt(normalizedHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
      const subtitleEl = section.querySelector('.industry-subtitle');

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

      if (subtitleEl) {
        tl.fromTo(
          subtitleEl,
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
          },
          '-=0.55',
        );
      }

      return () => {
        tl.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <div
      ref={sectionRef}
      id={id}
      className="industry-section relative w-full min-h-[65vh] sm:min-h-[75vh] md:min-h-screen flex overflow-hidden"
      data-industry-index={index}
    >
      {/* Title Layer - BEHIND 3D canvas (z-5) */}
      <div className="absolute z-5 inset-0 w-full h-full flex justify-center pointer-events-none">
        <h2
          className="industry-title inline-block whitespace-nowrap leading-none text-white will-change-transform"
          style={{ fontFamily: getFontFamily('heading') }}
        >
          <span className="block text-[clamp(2rem,11vw,3.25rem)] md:text-[clamp(3rem,15vw,11.2rem)] font-bold tracking-tight">
            {title}
          </span>
        </h2>
      </div>

      {/* Description Layer - ABOVE 3D canvas (z-20) */}
      <div className="absolute z-20 bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 w-full px-10 md:pb-20 max-w-md pointer-events-auto text-left">
        <div className="industry-subtitle px-3 py-2 rounded-md bg-[var(--industry-subtitle-bg)] md:bg-transparent md:rounded-none md:px-0 md:py-0">
          <div className="w-10 h-0.5 bg-white/60 mb-1" />
          <p
            className="text-white/90 text-md leading-relaxed"
            style={{ fontFamily: getFontFamily('body') }}
          >
            {description}
          </p>
        </div>
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
      const isTouchDevice =
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(hover: none)').matches ||
        navigator.maxTouchPoints > 0;
      const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
      const progressStart = isMobileViewport
        ? 'top 60%'
        : INDUSTRY_TIMELINE.sectionTrigger.progressRange.start;
      const progressEnd = isMobileViewport
        ? 'bottom -20%'
        : INDUSTRY_TIMELINE.sectionTrigger.progressRange.end;

      // Set initial color and hide it
      bg.style.backgroundColor = colors[0];
      bg.style.opacity = '0';
      container.style.setProperty(
        '--industry-subtitle-bg',
        hexToRgba(colors[0], 0.42),
      );

      // Show/hide the fixed background based on container visibility
      ScrollTrigger.create({
        trigger: container,
        start: isTouchDevice
          ? 'top bottom+=20%'
          : INDUSTRY_TIMELINE.sectionTrigger.visibilityRange.start,
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
        start: progressStart,
        end: progressEnd,
        scrub: isTouchDevice ? 0.75 : true,
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
          container.style.setProperty(
            '--industry-subtitle-bg',
            hexToRgba(currentColor, 0.42),
          );
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
