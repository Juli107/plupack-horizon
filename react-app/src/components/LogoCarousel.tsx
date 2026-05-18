import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

interface LogoItem {
  src: string;
}

const logoImports = import.meta.glob('../assets/logos/*.webp', {
  eager: true,
  import: 'default',
});

const getLogoSrc = (filename: string) => {
  const path = `../assets/logos/${filename}`;
  return (logoImports[path] as string) || '';
};

const LOGOS: LogoItem[] = [
  { src: 'ajec-autoadhesivos.webp' },
  { src: 'american-envases-group.webp' },
  { src: 'alpac-srl.webp' },
  { src: 'arnaldo-chapini.webp' },
  { src: 'bandex.webp' },
  { src: 'celpack-argentina.webp' },
  { src: 'cotnyl-sa.webp' },
  { src: 'elite.webp' },
  { src: 'enpolex.webp' },
  { src: 'euroswiss.webp' },
  { src: 'filmroll-food-service.webp' },
  { src: 'grupo-estisol.webp' },
  { src: 'inpack-sa.webp' },
  { src: 'ipack.webp' },
  { src: 'manu-packaging.webp' },
  { src: 'papelera-berazategui.webp' },
  { src: 'plastivas.webp' },
  { src: 'resinite.webp' },
  { src: 'thames.webp' },
  { src: 'vassoi.webp' },
];

export function LogoCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')
        ?.matches,
  );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    const updateReducedMotion = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updateReducedMotion();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateReducedMotion);
      return () => {
        mediaQuery.removeEventListener(
          'change',
          updateReducedMotion,
        );
      };
    }

    mediaQuery.addListener(updateReducedMotion);
    return () => {
      mediaQuery.removeListener(updateReducedMotion);
    };
  }, []);

  useGSAP(
    () => {
      if (
        reducedMotion ||
        window.matchMedia?.('(prefers-reduced-motion: reduce)')
          ?.matches
      )
        return;

      const track = trackRef.current;
      const set = setRef.current;
      if (!track) return;
      if (!set) return;

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
        duration: 40,
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

      return () => {
        if (refreshRaf) {
          window.cancelAnimationFrame(refreshRaf);
        }
        resizeObserver.disconnect();
        tween.kill();
      };
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  useEffect(() => {
    if (!reducedMotion) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const updateScrollButtons = () => {
      const maxScrollLeft = Math.max(
        0,
        container.scrollWidth - container.clientWidth,
      );
      const current = container.scrollLeft;
      setCanScrollLeft(current > 1);
      setCanScrollRight(current < maxScrollLeft - 1);
    };

    updateScrollButtons();
    container.addEventListener('scroll', updateScrollButtons, {
      passive: true,
    });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [reducedMotion]);

  const scrollCarouselBy = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const amount = Math.max(120, Math.round(container.clientWidth * 0.7));
    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative w-full py-12 md:pt-28 md:-mb-10 overflow-hidden">
      {/* Intro Text */}
      <div className="container mx-auto px-4 pb-6 border-b border-white/20 mb-8">
        <p className="text-center text-white/60 uppercase tracking-[0.2em] text-xs md:text-base font-light">
          MARCAS QUE CONFÍAN EN NUESTRA GESTIÓN
        </p>
      </div>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className={`w-full relative flex mask-gradient-x ${
          reducedMotion
            ? 'overflow-x-auto overflow-y-hidden'
            : 'overflow-hidden'
        }`}
        style={
          reducedMotion
            ? {
                touchAction: 'pan-x',
                WebkitOverflowScrolling: 'touch',
              }
            : undefined
        }
        tabIndex={reducedMotion ? 0 : undefined}
        aria-label={
          reducedMotion
            ? 'Carrusel de marcas, deslizable horizontalmente'
            : undefined
        }
      >
        {/* Gradient Masks for fading edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-20 lg:w-24 z-1 bg-linear-to-r from-[#084e85] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-20 lg:w-24 z-1 bg-linear-to-l from-[#084e85] to-transparent pointer-events-none" />

        <div
          ref={trackRef}
          className="flex w-max items-center mix-blend-screen will-change-transform gap-12 md:gap-24"
        >
          <div
            ref={setRef}
            className="flex flex-none shrink-0 gap-12 md:gap-24 items-center"
          >
            {LOGOS.map((logo, index) => (
              <div
                key={`logo-1-${index}`}
                className="relative group shrink-0 h-12 w-28 md:h-16 md:w-40 flex items-center justify-center"
              >
                <img
                  src={getLogoSrc(logo.src)}
                  alt={logo.src
                    .replace('.webp', '')
                    .replace(/-/g, ' ')}
                  className="h-full w-full object-contain object-center grayscale opacity-70 transition-opacity duration-300 contrast-[1.5] brightness-[0.7]"
                  width={160}
                  height={64}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
          {!reducedMotion ? (
            <div
              aria-hidden="true"
              className="flex flex-none shrink-0 gap-12 md:gap-24 items-center"
            >
              {LOGOS.map((logo, index) => (
                <div
                  key={`logo-2-${index}`}
                  className="relative group shrink-0 h-12 w-28 md:h-16 md:w-40 flex items-center justify-center"
                >
                  <img
                    src={getLogoSrc(logo.src)}
                    alt=""
                    className="h-full w-full object-contain object-center grayscale opacity-70 transition-opacity duration-300 contrast-[1.5] brightness-[0.7]"
                    width={160}
                    height={64}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {reducedMotion ? (
        <div className="mt-3 flex w-full items-center justify-end gap-2 pr-1">
          <button
            type="button"
            onClick={() => scrollCarouselBy('left')}
            disabled={!canScrollLeft}
            aria-label="Desplazar carrusel de marcas a la izquierda"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/45 bg-white/10 text-white transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
            >
              <path
                d="M9.75 3.25 5 8l4.75 4.75"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollCarouselBy('right')}
            disabled={!canScrollRight}
            aria-label="Desplazar carrusel de marcas a la derecha"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/45 bg-white/10 text-white transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
            >
              <path
                d="M6.25 3.25 11 8l-4.75 4.75"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </section>
  );
}
