import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

interface LogoItem {
  src: string;
  scale?: number;
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
  { src: 'ajec-autoadhesivos.webp', scale: 1 },
  { src: 'alpac-srl.webp', scale: 0.95 },
  { src: 'american-envases-group.webp', scale: 1.05 },
  { src: 'arnaldo-chapini.webp', scale: 0.9 },
  { src: 'bandex.webp', scale: 0.9 },
  { src: 'celpack-argentina.webp', scale: 0.9 },
  { src: 'cotnyl-sa.webp', scale: 0.95 },
  { src: 'elite.webp', scale: 1.05 },
  { src: 'enpolex.webp', scale: 1 },
  { src: 'euroswiss.webp', scale: 0.8 },
  { src: 'filmroll-food-service.webp', scale: 1.1 },
  { src: 'grupo-estisol.webp', scale: 0.95 },
  { src: 'inpack-sa.webp', scale: 0.9 },
  { src: 'ipack.webp', scale: 0.9 },
  { src: 'manu-packaging.webp', scale: 0.9 },
  { src: 'papelera-berazategui.webp', scale: 1 },
  { src: 'plastivas.webp', scale: 0.95 },
  { src: 'resinite.webp', scale: 0.85 },
  { src: 'thames.webp', scale: 0.85 },
  { src: 'vassoi.webp', scale: 0.95 },
];

export function LogoCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
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

      const refresh = () => {
        gsap.set(track, { x: 0 });
        tween.invalidate().restart();
      };

      const resizeObserver = new ResizeObserver(refresh);
      resizeObserver.observe(set);

      const container = containerRef.current;
      const images = Array.from(
        container?.querySelectorAll('img') ?? [],
      );
      const onImgLoad = () => refresh();
      images.forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', onImgLoad, { once: true });
        img.addEventListener('error', onImgLoad, { once: true });
      });

      return () => {
        resizeObserver.disconnect();
        tween.kill();
        images.forEach((img) => {
          img.removeEventListener('load', onImgLoad);
          img.removeEventListener('error', onImgLoad);
        });
      };
    },
    { scope: containerRef },
  );

  return (
    <section className="relative w-full py-12 md:pt-28 md:-mb-10 overflow-hidden">
      {/* Intro Text */}
      <div className="container mx-auto px-4 pb-6 border-b border-white/20">
        <p className="text-center text-white/60 uppercase tracking-[0.2em] text-xs md:text-base font-light">
          MARCAS QUE CONFÍAN EN NUESTRA GESTIÓN
        </p>
      </div>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="w-full relative flex overflow-hidden mask-gradient-x"
      >
        {/* Gradient Masks for fading edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-62 z-1 bg-linear-to-r from-[#084e85] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-62 z-1 bg-linear-to-l from-[#084e85] to-transparent pointer-events-none" />

        <div
          ref={trackRef}
          className="flex w-max items-center mix-blend-screen will-change-transform gap-12 md:gap-20"
        >
          <div
            ref={setRef}
            className="flex flex-none shrink-0 gap-12 md:gap-28 items-center"
          >
            {LOGOS.map((logo, index) => (
              <div
                key={`logo-1-${index}`}
                className="relative group shrink-0 h-20 md:h-34 w-auto flex items-center justify-center"
              >
                <img
                  src={getLogoSrc(logo.src)}
                  alt={logo.src
                    .replace('.webp', '')
                    .replace(/-/g, ' ')}
                  className="w-auto object-contain grayscale opacity-70 transition-opacity duration-300 contrast-[1.5] brightness-[0.7]"
                  style={{ height: `${(logo.scale || 1) * 8}rem` }}
                />
              </div>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="flex flex-none shrink-0 gap-12 md:gap-28 items-center"
          >
            {LOGOS.map((logo, index) => (
              <div
                key={`logo-2-${index}`}
                className="relative group shrink-0 h-20 md:h-34 w-auto flex items-center justify-center"
              >
                <img
                  src={getLogoSrc(logo.src)}
                  alt=""
                  className="w-auto object-contain grayscale opacity-70 transition-opacity duration-300 contrast-[1.5] brightness-[0.7]"
                  style={{ height: `${(logo.scale || 1) * 8}rem` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
