import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLenis } from 'lenis/react';

export function Hero() {
  const { getFontFamily } = useShopifyTheme();
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [animationTriggered, setAnimationTriggered] = useState(false);
  const lenis = useLenis();

  const scrollToIndustries = () => {
    if (!lenis) return;
    lenis.scrollTo('#industry-dynamics', {
      offset: -40,
      duration: 1.3,
    });
  };

  // Listen for loading screen completion and trigger fill animation
  useEffect(() => {
    if (animationTriggered) return;

    const checkLoadingComplete = () => {
      const loadingScreen = document.querySelector(
        '.plupack-loading-screen',
      );
      return !loadingScreen;
    };

    const startAnimation = () => {
      if (!headlineRef.current) return;

      const fillWords = headlineRef.current.querySelectorAll(
        '[data-hero-highlight-fill="true"]',
      );
      if (!fillWords.length) return;

      gsap.fromTo(
        fillWords,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.3,
          stagger: 0.08,
        },
      );
    };

    const checkInterval = setInterval(() => {
      if (checkLoadingComplete()) {
        clearInterval(checkInterval);
        setAnimationTriggered(true);
        setTimeout(startAnimation, 200);
      }
    }, 100);

    const fallbackTimeout = setTimeout(() => {
      clearInterval(checkInterval);
      setAnimationTriggered(true);
      startAnimation();
    }, 3000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(fallbackTimeout);
    };
  }, [animationTriggered]);

  return (
    <section className="relative w-full h-screen">
      <div className=" inset-0 px-12 py-26 flex flex-col justify-between pointer-events-none text-white">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row w-full h-full relative items-start lg:justify-between gap-8 lg:gap-6">
          {/* Left: Headline Group - z-10 to be behind 3D elements if they overlap */}
          <div className="lg:w-3/5 xl:w-7/12 flex flex-col justify-start relative">
            <h1
              ref={headlineRef}
              style={{ fontFamily: getFontFamily('heading') }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[clamp(4.9rem,6.1vw,6.2rem)] xl:text-[clamp(5.6rem,6vw,7.1rem)] leading-[0.9] font-medium uppercase tracking-wide mt-[-0.05em]"
            >
              <div className="flex flex-wrap items-baseline gap-x-[0.18em] leading-[0.92]">
                <div className="relative inline-block">
                  {/* Invisible placeholder for sizing */}
                  <div className="opacity-0 font-extrabold tracking-wider">
                    SOLUCIONES
                  </div>

                  <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                    <defs>
                      {/* Outline filter - creates the stroke effect */}
                      <filter
                        id="outline-filter-hero"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feMorphology
                          in="SourceAlpha"
                          result="DILATED"
                          operator="dilate"
                          radius="2.4"
                        />
                        <feMorphology
                          in="SourceAlpha"
                          result="ERODED"
                          operator="erode"
                          radius="1.1"
                        />
                        <feComposite
                          in="DILATED"
                          in2="ERODED"
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
                      x="0.05em"
                      y="0.9em"
                      className="font-bold tracking-wider"
                      style={{
                        fontFamily: getFontFamily('heading'),
                        fontSize: 'inherit',
                        fontWeight: 500,
                        fontVariationSettings: '"wght" 530',
                        filter: 'url(#outline-filter-hero)',
                        fill: 'white',
                        textRendering: 'geometricPrecision',
                      }}
                    >
                      SOLUCIONES
                    </text>

                    {/* Solid fill text - fades in on top of outline */}
                    <text
                      data-hero-highlight-fill="true"
                      x="0.05em"
                      y="0.9em"
                      className="font-bold tracking-wider"
                      style={{
                        fontFamily: getFontFamily('heading'),
                        fontSize: 'inherit',
                        fontWeight: 500,
                        fontVariationSettings: '"wght" 530',
                        fill: 'white',
                        opacity: 0,
                        textRendering: 'geometricPrecision',
                      }}
                    >
                      SOLUCIONES
                    </text>
                  </svg>
                </div>

                <div className="relative inline-block">
                  {/* Invisible placeholder for sizing */}
                  <div className="opacity-0 font-extrabold tracking-wider">
                    INTEGRALES
                  </div>

                  <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                    {/* Outline text - always visible */}
                    <text
                      x="0.05em"
                      y="0.9em"
                      className="font-bold tracking-wider"
                      style={{
                        fontFamily: getFontFamily('heading'),
                        fontSize: 'inherit',
                        fontWeight: 500,
                        fontVariationSettings: '"wght" 530',
                        filter: 'url(#outline-filter-hero)',
                        fill: 'white',
                        textRendering: 'geometricPrecision',
                      }}
                    >
                      INTEGRALES
                    </text>

                    {/* Solid fill text - fades in on top of outline */}
                    <text
                      data-hero-highlight-fill="true"
                      x="0.05em"
                      y="0.9em"
                      className="font-bold tracking-wider"
                      style={{
                        fontFamily: getFontFamily('heading'),
                        fontSize: 'inherit',
                        fontWeight: 500,
                        fontVariationSettings: '"wght" 530',
                        fill: 'white',
                        opacity: 0,
                        textRendering: 'geometricPrecision',
                      }}
                    >
                      INTEGRALES
                    </text>
                  </svg>
                </div>
              </div>
              <span className="block -tracking-wide mt-[0.16em] leading-[0.92]">
                PARA TU <span className="block 2xl:inline">EMPRESA</span>
              </span>
            </h1>
          </div>

          {/* Right: Info Panel - z-30 to be above 3D elements */}
          <div className="lg:w-2/5 flex flex-col justify-start items-start lg:pl-8 mt-10 lg:mt-0 pointer-events-auto z-30 relative pt-2 gap-3">
            {/* Eyebrow */}
            <p
              className="text-sm tracking-[0.2em] uppercase font-medium"
              style={{ fontFamily: getFontFamily('accent') }}
            >
              TU ALIADO ESTRATÉGICO
            </p>

            {/* Separator */}
            <div className="w-full h-px bg-white/50"></div>

            {/* Body */}
            <p
              className="text-md leading-relaxed mb-4"
              style={{ fontFamily: getFontFamily('body') }}
            >
              En PLUPack somos especialistas en abastecimiento mayorista
              de embalajes y descartables. Fabricamos y distribuimos
              insumos para papeleras, industriales, gastronomía, salud y
              hotelería, asegurando stock permanente y continuidad
              operativa. Además, centralizamos la provisión de insumos
              indirectos y complementarios que sostienen el
              funcionamiento diario de cada empresa.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                className="px-8 py-1 flex-1 bg-white text-[#0B6386] rounded-[10px] font-bold hover:bg-gray-100 transition-colors uppercase text-sm tracking-wide min-h-[40px]"
                style={{ fontFamily: getFontFamily('body') }}
              >
                Ver productos
              </button>
              <button
                onClick={scrollToIndustries}
                className="px-8 py-1 flex-1 border border-white/60 text-white rounded-[10px] font-bold hover:bg-white/10 transition-colors uppercase text-sm tracking-wide min-h-[40px]"
                style={{ fontFamily: getFontFamily('body') }}
              >
                Explorar soluciones
              </button>
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <p
          className="absolute z-20 bottom-6 right-6 md:bottom-12 md:right-12 text-xs font-medium tracking-[0.2em] uppercase"
          style={{ fontFamily: getFontFamily('accent') }}
        >
          EST. 2017
          <br />
          ARGENTINA
        </p>
      </div>
    </section>
  );
}
