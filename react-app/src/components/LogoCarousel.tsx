import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

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
        const progress = tween.totalProgress();
        tween.invalidate();
        tween.totalProgress(progress);
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
      <div className="container mx-auto px-4 pb-6 border-b border-white/20 mb-8">
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
        </div>
      </div>
    </section>
  );
}
