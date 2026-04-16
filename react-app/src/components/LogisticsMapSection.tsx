import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useEffect, useState } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import argentinaSvgUrl from '@/assets/argentina.svg?url';

// ============================================
// TYPES
// ============================================
interface PulseNode {
  index: number;
  delay: number;
}

interface TransportistaItem {
  src: string;
  alt: string;
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

const transportistaImports = import.meta.glob(
  '../assets/transportistas/*.webp',
  {
    eager: true,
    import: 'default',
  },
);

const getTransportistaSrc = (filename: string) => {
  const path = `../assets/transportistas/${filename}`;
  return (transportistaImports[path] as string) || '';
};

const TRANSPORTISTAS: TransportistaItem[] = [
  {
    src: 'cruz-del-sur-transporte-y-logistica.webp',
    alt: 'Cruz del Sur transporte y logistica',
  },
  {
    src: 'don-pedro-monograma.webp',
    alt: 'Don Pedro monograma',
  },
  {
    src: 'don-pedro-transporte-y-logistica.webp',
    alt: 'Don Pedro transporte y logistica',
  },
  {
    src: 'e-circular.webp',
    alt: 'E Circular',
  },
  {
    src: 'e-flecha.webp',
    alt: 'E Flecha',
  },
  {
    src: 'ev-logistica.webp',
    alt: 'EV Logistica',
  },
  {
    src: 'expreso-bisonte.webp',
    alt: 'Expreso Bisonte',
  },
  {
    src: 'g.webp',
    alt: 'G',
  },
  {
    src: 'mostto-logistica-y-transporte.webp',
    alt: 'Mostto logistica y transporte',
  },
  {
    src: 'transportes-navas-srl.webp',
    alt: 'Transportes Navas SRL',
  },
  {
    src: 'via-cargo.webp',
    alt: 'Via Cargo',
  },
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
  const transportCarouselRef = useRef<HTMLDivElement>(null);
  const transportTrackRef = useRef<HTMLDivElement>(null);
  const transportSetRef = useRef<HTMLDivElement>(null);
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
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // Style all circles and collect positions
        const circles = svg.querySelectorAll('circle, ellipse');
        const circleData: { cx: number; cy: number }[] = [];

        circles.forEach((circle) => {
          const svgCircle = circle as SVGCircleElement;
          svgCircle.style.fill = 'rgba(255, 255, 255, 0.32)';
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
      const isDesktop = window.matchMedia(
        '(min-width: 1280px) and (hover: hover) and (pointer: fine)',
      ).matches;
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

      if (isDesktop) {
        // ============================================
        // MAIN SCROLL TIMELINE
        // ============================================
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        });

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

        tl.to(
          mapContainer,
          {
            scale: 1.0,
            duration: 0.4,
            ease: 'power3.out',
          },
          0.1,
        );

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
              clipPath:
                'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
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
              clipPath:
                'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
              y: 0,
              duration: 0.25,
              ease: 'power3.out',
            },
            0.4,
          );
        }

        tl.to(
          [mapContainer, text],
          {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
          },
          0.7,
        );
      } else {
        gsap.set(mapContainer, {
          scale: 1,
          opacity: 1,
          y: 0,
        });
        gsap.set(text, { opacity: 1, y: 0 });
        if (heading && subheading) {
          gsap.set([heading, subheading], {
            clipPath: 'none',
            y: 0,
          });
        }
        if (linesGroupRef.current) {
          gsap.set(linesGroupRef.current, { opacity: 1 });
        }
        pulseCircles.forEach((circle, i) => {
          gsap.set(circle, {
            fill: 'rgba(255, 255, 255, 0.6)',
            attr: { r: originalRadii[i] + 2 },
          });
        });
      }

      // ============================================
      // PULSE ANIMATION (Continuous while in view)
      // Simulates "Live Activity" on key provinces
      // ============================================
      let pulseDriver: gsap.core.Tween | null = null;
      const pulsePeriod = 1.6;
      const inactiveFill = 'rgba(255, 255, 255, 0.6)';
      const activeFill = 'rgba(94, 234, 212, 0.9)';

      const startPulsing = () => {
        pulseDriver?.kill();
        pulseDriver = null;

        pulseCircles.forEach((circle, i) => {
          gsap.set(circle, {
            fill: inactiveFill,
            attr: { r: originalRadii[i] },
          });
        });

        const clock = { t: 0 };
        pulseDriver = gsap.to(clock, {
          t: pulsePeriod,
          duration: pulsePeriod,
          ease: 'none',
          repeat: -1,
          onUpdate: () => {
            pulseCircles.forEach((circle, i) => {
              const node = PULSE_NODES[i];
              const baseR = originalRadii[i];
              if (!node) return;

              const shifted = (clock.t + node.delay) % pulsePeriod;
              const normalized = shifted / pulsePeriod;
              const wave =
                normalized <= 0.5
                  ? normalized * 2
                  : (1 - normalized) * 2;

              gsap.set(circle, {
                fill: gsap.utils.interpolate(
                  inactiveFill,
                  activeFill,
                  wave,
                ),
                attr: { r: baseR + wave * 4 },
              });
            });
          },
        });
      };

      const stopPulsing = () => {
        pulseDriver?.kill();
        pulseDriver = null;
        // Reset circles to scroll-revealed state
        pulseCircles.forEach((circle, i) => {
          gsap.set(circle, {
            fill: inactiveFill,
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
        pulseDriver?.kill();
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === section) {
            st.kill();
          }
        });
      };
    },
    { scope: sectionRef, dependencies: [svgLoaded] },
  );

  useGSAP(
    () => {
      if (
        window.matchMedia?.('(prefers-reduced-motion: reduce)')
          ?.matches
      )
        return;

      const track = transportTrackRef.current;
      const set = transportSetRef.current;
      if (!track || !set) return;

      const getSetGap = () => {
        const styles = window.getComputedStyle(track);
        const value = styles.columnGap || styles.gap || '0';
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const getDistance = () => set.scrollWidth + getSetGap();

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        duration: 36,
        repeat: -1,
      });

      let lastDistance = getDistance();
      let refreshRaf = 0;

      const refresh = () => {
        refreshRaf = 0;
        const nextDistance = getDistance();
        if (Math.abs(nextDistance - lastDistance) < 0.5) return;

        const progress = tween.totalProgress();
        lastDistance = nextDistance;
        tween.invalidate();
        tween.totalProgress(progress);
      };

      const requestRefresh = () => {
        if (refreshRaf) return;
        refreshRaf = window.requestAnimationFrame(refresh);
      };

      const resizeObserver = new ResizeObserver(requestRefresh);
      resizeObserver.observe(set);

      const container = transportCarouselRef.current;
      const images = Array.from(
        container?.querySelectorAll('img') ?? [],
      );
      const onImgLoad = () => requestRefresh();
      images.forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', onImgLoad, { once: true });
        img.addEventListener('error', onImgLoad, { once: true });
      });

      return () => {
        if (refreshRaf) {
          window.cancelAnimationFrame(refreshRaf);
        }
        resizeObserver.disconnect();
        tween.kill();
        images.forEach((img) => {
          img.removeEventListener('load', onImgLoad);
          img.removeEventListener('error', onImgLoad);
        });
      };
    },
    { scope: transportCarouselRef, dependencies: [svgLoaded] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-10 lg:h-[200vh]"
    >
      {/* Sticky Wrapper - stays fixed during scroll */}
      <div
        ref={stickyRef}
        className="relative w-full overflow-visible flex items-start justify-center py-10 lg:sticky lg:top-0 lg:h-screen lg:items-center lg:overflow-hidden lg:py-0"
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
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1760px] items-center px-6 py-12 md:px-10 lg:px-16 xl:px-24">
          <div className="grid w-full grid-cols-1 items-center gap-10 landscape:min-[700px]:grid-cols-12 landscape:min-[700px]:gap-10 xl:grid-cols-12 xl:gap-20">
            <div
              ref={mapWrapperRef}
              className="relative flex w-full items-center justify-center landscape:min-[700px]:col-span-5 xl:col-span-5"
            >
              <div
                ref={mapContainerRef}
                className="will-change-transform w-[clamp(170px,52vw,260px)] h-auto max-h-[62vh] aspect-[407/854] sm:w-[clamp(190px,46vw,300px)] lg:w-[clamp(260px,40vw,760px)] lg:h-[clamp(360px,74vh,900px)] lg:max-h-none"
              />
            </div>

            <div
              ref={textRef}
              className="relative z-20 flex w-full max-w-[36rem] flex-col items-start text-left will-change-transform landscape:min-[700px]:col-span-7 landscape:min-[700px]:max-w-none xl:col-span-7 xl:max-w-none"
            >
              <h2
                className="map-heading text-white font-bold tracking-tight"
                style={{
                  fontFamily: getFontFamily('heading'),
                  fontSize: 'clamp(3.2rem, 6.2vw, 6.2rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.9,
                  maxWidth: '13ch',
                }}
              >
                COBERTURA NACIONAL
              </h2>
              <p
                className="map-subheading mt-4 text-white/92 font-medium"
                style={{
                  fontFamily: getFontFamily('body'),
                  fontSize: 'clamp(1.12rem, 1.55vw, 1.65rem)',
                }}
              >
                Logística donde lo necesites.
              </p>

              <div
                ref={transportCarouselRef}
                className="relative mt-14 md:mt-16 w-full overflow-hidden mask-gradient-x"
              >
                <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 z-10 bg-linear-to-r from-[#1B4B6B] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 z-10 bg-linear-to-l from-[#1B4B6B] to-transparent pointer-events-none" />
                <div
                  ref={transportTrackRef}
                  className="flex w-max items-center mix-blend-screen will-change-transform gap-8 md:gap-12"
                >
                  <div
                    ref={transportSetRef}
                    className="flex flex-none shrink-0 gap-8 md:gap-12 items-center"
                  >
                    {TRANSPORTISTAS.map((transportista) => (
                      <div
                        key={`transportista-1-${transportista.src}`}
                        className="relative shrink-0 h-14 md:h-16 px-2 flex items-center justify-center"
                      >
                        <img
                          src={getTransportistaSrc(transportista.src)}
                          alt={transportista.alt}
                          className="h-full w-auto max-w-[11rem] md:max-w-[14rem] object-contain object-center grayscale opacity-70 contrast-[1.5] brightness-[0.7]"
                          width={224}
                          height={64}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>
                  <div
                    aria-hidden="true"
                    className="flex flex-none shrink-0 gap-8 md:gap-12 items-center"
                  >
                    {TRANSPORTISTAS.map((transportista) => (
                      <div
                        key={`transportista-2-${transportista.src}`}
                        className="relative shrink-0 h-14 md:h-16 px-2 flex items-center justify-center"
                      >
                        <img
                          src={getTransportistaSrc(transportista.src)}
                          alt=""
                          className="h-full w-auto max-w-[11rem] md:max-w-[14rem] object-contain object-center grayscale opacity-70 contrast-[1.5] brightness-[0.7]"
                          width={224}
                          height={64}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
