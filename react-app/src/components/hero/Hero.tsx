import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import { getShopifyData } from '@/types/shopify';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLenis } from 'lenis/react';
import { dispatchHeroReady } from '../loadingEvents';

export function Hero() {
  const { getFontFamily } = useShopifyTheme();
  const shopifyData = getShopifyData();
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const firstFeaturedImageRef = useRef<HTMLImageElement>(null);
  const hasDispatchedHeroReadyRef = useRef(false);
  const [animationTriggered, setAnimationTriggered] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const lenis = useLenis();

  const featuredProducts = (
    shopifyData.heroFeaturedProducts ??
    shopifyData.products ??
    []
  ).slice(0, 4);
  const hasFeaturedProducts = featuredProducts.length > 0;
  const activeProduct = hasFeaturedProducts
    ? featuredProducts[activeProductIndex]
    : null;
  const heroSizes = '(min-width: 1024px) 50vw, 100vw';
  // NOTE: Header+announcement overlays the hero on homepage.
  // We add --header-group-height so the visible media area keeps the original perceived height.
  // If announcement bar is removed in the future, revert these constants to the previous values:
  // - featuredMediaHeightClass: 'md:h-[49vh] md:min-h-[25rem]'
  // - featuredContentOffsetClass: 'md:pt-[max(calc(49vh+2.5rem),27.5rem)]'
  const featuredMediaHeightClass =
    'md:h-[calc(49vh+var(--header-group-height,0px))] md:min-h-[calc(25rem+var(--header-group-height,0px))]';
  const featuredContentOffsetClass =
    'md:pt-[max(calc(49vh+var(--header-group-height,0px)+2.5rem),calc(27.5rem+var(--header-group-height,0px)))]';

  const markHeroReady = () => {
    if (hasDispatchedHeroReadyRef.current) {
      return;
    }

    hasDispatchedHeroReadyRef.current = true;
    dispatchHeroReady();
  };

  const scrollToIndustries = () => {
    if (!lenis) return;
    lenis.scrollTo('#industry-dynamics', {
      offset: -40,
      duration: 1.3,
    });
  };

  useEffect(() => {
    if (animationTriggered) return;

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

      setAnimationTriggered(true);
    };

    let firstRaf = 0;
    let secondRaf = 0;
    let timeoutId = 0;
    firstRaf = window.requestAnimationFrame(() => {
      secondRaf = window.requestAnimationFrame(() => {
        timeoutId = window.setTimeout(startAnimation, 120);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstRaf);
      window.cancelAnimationFrame(secondRaf);
      window.clearTimeout(timeoutId);
    };
  }, [animationTriggered]);

  useEffect(() => {
    const firstFeaturedImage = featuredProducts[0]?.image;

    if (!firstFeaturedImage) {
      markHeroReady();
      return;
    }

    if (firstFeaturedImageRef.current?.complete) {
      markHeroReady();
    }
  }, [featuredProducts]);

  useEffect(() => {
    if (featuredProducts.length <= 1) return;

    const autoplay = window.setInterval(() => {
      setActiveProductIndex((prev) =>
        prev === featuredProducts.length - 1 ? 0 : prev + 1,
      );
    }, 5200);

    return () => {
      window.clearInterval(autoplay);
    };
  }, [featuredProducts.length]);

  useEffect(() => {
    if (!featuredProducts.length) return;
    if (activeProductIndex < featuredProducts.length) return;
    setActiveProductIndex(0);
  }, [activeProductIndex, featuredProducts.length]);

  return (
    <section className="relative w-full min-h-[100svh]">
      {/* Responsive SVG filter switcher: mobile uses thinner dilate radius */}
      <style>{`
        .hero-outline-text { filter: url(#outline-filter-hero-mobile); }
        @media (min-width: 768px) {
          .hero-outline-text { filter: url(#outline-filter-hero); }
        }
      `}</style>
      <div className="relative w-full pointer-events-none text-white flex flex-col">
        {hasFeaturedProducts ? (
          <div
            className={`pointer-events-auto w-full md:absolute md:inset-x-0 md:top-0 ${featuredMediaHeightClass}`}
          >
            <article className="relative w-full overflow-hidden bg-[#062742] text-white md:h-full">
              <div className="relative flex h-full w-full flex-col md:flex-row">
                <div className="relative order-1 flex w-full flex-col justify-center bg-[#042843] px-5 pb-10 pt-24 sm:px-7 sm:pb-14 sm:pt-32 md:order-1 md:w-1/2 md:items-center md:px-10 md:py-10">
                  <div className="w-full max-w-[30rem] text-left">
                    <div className="flex justify-start">
                    <p
                      className="inline-flex items-center w-max rounded-full border border-[#69b6e8]/45 bg-[#0a4f82]/45 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm md:text-[9px]"
                      style={{ fontFamily: getFontFamily('accent') }}
                    >
                      Destacados
                    </p>
                    </div>

                    {activeProduct ? (
                      <div className="mt-4 md:mt-7">
                        <h2
                          className="text-[clamp(1.45rem,5.5vw,2.1rem)] md:text-[clamp(2rem,2.65vw,2.85rem)] font-medium leading-[1.03] uppercase tracking-[0.01em] sm:tracking-[0.02em]"
                          style={{ fontFamily: getFontFamily('heading') }}
                        >
                          {activeProduct.title}
                        </h2>
                        {activeProduct.description ? (
                          <p
                            className="mt-2 max-w-[28ch] text-[0.78rem] leading-snug text-white/80 md:mt-3 md:max-w-[30ch] md:text-sm"
                            style={{ fontFamily: getFontFamily('body') }}
                          >
                            {activeProduct.description}
                          </p>
                        ) : null}
                        <div className="mt-4 flex justify-start md:mt-6">
                          <a
                            href={activeProduct.url}
                            className="inline-flex min-h-[42px] w-full sm:w-auto items-center justify-center rounded-[11px] border border-white/70 bg-white/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-white transition-colors duration-300 hover:bg-white/25 md:px-7 md:text-xs"
                            style={{ fontFamily: getFontFamily('body') }}
                          >
                            Ver producto
                          </a>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="relative order-2 h-[18rem] w-full overflow-hidden bg-[#0a3f67] sm:h-[22rem] md:order-2 md:h-full md:w-1/2">
                  {featuredProducts.map((product, index) => (
                    <div
                      key={product.handle}
                      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                      style={{
                        opacity: index === activeProductIndex ? 1 : 0,
                      }}
                      aria-hidden={index !== activeProductIndex}
                    >
                      {product.image ? (
                        <img
                          ref={index === 0 ? firstFeaturedImageRef : undefined}
                          src={product.image}
                          srcSet={
                            product.image640 &&
                            product.image960 &&
                            product.image1200 &&
                            product.image1600
                              ? `${product.image640} 640w, ${product.image960} 960w, ${product.image1200} 1200w, ${product.image1600} 1600w`
                              : undefined
                          }
                          sizes={heroSizes}
                          alt={product.title}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                          loading={index === 0 ? 'eager' : 'lazy'}
                          fetchPriority={index === 0 ? 'high' : 'auto'}
                          decoding="async"
                          width={product.imageWidth ?? 1200}
                          height={product.imageHeight ?? 800}
                          onLoad={index === 0 ? markHeroReady : undefined}
                          onError={index === 0 ? markHeroReady : undefined}
                        />
                      ) : null}
                    </div>
                  ))}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#08355a]/30 via-transparent to-[#0f4a76]/25" />

                  {featuredProducts.length > 1 ? (
                    <div className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2 md:bottom-8 md:right-10">
                      {featuredProducts.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setActiveProductIndex(index)}
                          aria-label={`Ir al producto ${index + 1}`}
                          className={`flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-white/55 transition-opacity duration-300 md:h-7 md:w-7 ${
                            index === activeProductIndex
                              ? 'opacity-95'
                              : 'opacity-35 hover:opacity-65'
                          }`}
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          </div>
        ) : null}

        <div
          className={`flex-1 md:h-full flex items-center px-5 md:px-7 md:pr-10 xl:pl-9 xl:pr-12 pb-8 md:pb-10 pt-8 ${
            hasFeaturedProducts
              ? featuredContentOffsetClass
              : 'md:pt-28'
          }`}
        >
          <div className="flex flex-col lg:flex-row w-full relative items-start lg:justify-between gap-7 lg:gap-6">
            <div className="lg:w-3/5 xl:w-7/12 flex flex-col justify-start relative">
              <h1
                ref={headlineRef}
                style={{ fontFamily: getFontFamily('heading') }}
                className="text-[clamp(2.05rem,9.6vw,2.9rem)] sm:text-6xl md:text-7xl lg:text-[clamp(4.2rem,5.5vw,5.8rem)] xl:text-[clamp(5rem,5.5vw,6.4rem)] leading-[0.92] font-medium uppercase tracking-[0.01em] sm:tracking-wide mt-[-0.05em]"
              >
                <div className="flex flex-col items-start leading-[0.92]">
                  <div className="relative inline-block min-h-[0.92em] leading-[0.92]">
                    {/* Invisible placeholder for sizing — weight must match SVG fontWeight: 500 */}
                    <div className="opacity-0 font-medium tracking-wider leading-[0.92]">
                      SOLUCIONES
                    </div>

                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                      <defs>
                        {/* Desktop outline filter — slightly thicker stroke */}
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
                            radius="1.8"
                          />
                          <feMorphology
                            in="SourceAlpha"
                            result="ERODED"
                            operator="erode"
                            radius="0.5"
                          />
                          <feComposite
                            in="DILATED"
                            in2="ERODED"
                            operator="out"
                            result="OUTLINE"
                          />
                          <feFlood
                            floodColor="white"
                            result="COLOR"
                          />
                          <feComposite
                            in="COLOR"
                            in2="OUTLINE"
                            operator="in"
                            result="FINAL"
                          />
                        </filter>
                        {/* Mobile outline filter — thinner stroke to avoid heavy look */}
                        <filter
                          id="outline-filter-hero-mobile"
                          x="-20%"
                          y="-20%"
                          width="140%"
                          height="140%"
                        >
                          <feMorphology
                            in="SourceAlpha"
                            result="DILATED"
                            operator="dilate"
                            radius="0.8"
                          />
                          <feMorphology
                            in="SourceAlpha"
                            result="ERODED"
                            operator="erode"
                            radius="0.3"
                          />
                          <feComposite
                            in="DILATED"
                            in2="ERODED"
                            operator="out"
                            result="OUTLINE"
                          />
                          <feFlood
                            floodColor="white"
                            result="COLOR"
                          />
                          <feComposite
                            in="COLOR"
                            in2="OUTLINE"
                            operator="in"
                            result="FINAL"
                          />
                        </filter>
                      </defs>

                      {/* Outline text - always visible — mobile uses thinner filter */}
                      <text
                        x="0.03em"
                        y="0.9em"
                        className="hero-outline-text"
                        style={{
                          fontFamily: getFontFamily('heading'),
                          fontSize: 'inherit',
                          fontWeight: 500,
                          fontVariationSettings: '"wght" 530',
                          fill: 'white',
                          textRendering: 'geometricPrecision',
                        }}
                      >
                        SOLUCIONES
                      </text>

                      {/* Solid fill text - fades in on top of outline */}
                      <text
                        data-hero-highlight-fill="true"
                        x="0.03em"
                        y="0.9em"
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

                  <div className="relative inline-block min-h-[0.92em] leading-[0.92]">
                    {/* Invisible placeholder for sizing — weight must match SVG fontWeight: 500 */}
                    <div className="opacity-0 font-medium tracking-wider leading-[0.92]">
                      INTEGRALES
                    </div>

                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                      {/* Outline text - always visible */}
                      <text
                        x="0.03em"
                        y="0.9em"
                        className="hero-outline-text"
                        style={{
                          fontFamily: getFontFamily('heading'),
                          fontSize: 'inherit',
                          fontWeight: 500,
                          fontVariationSettings: '"wght" 530',
                          fill: 'white',
                          textRendering: 'geometricPrecision',
                        }}
                      >
                        INTEGRALES
                      </text>

                      {/* Solid fill text - fades in on top of outline */}
                      <text
                        data-hero-highlight-fill="true"
                        x="0.03em"
                        y="0.9em"
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
                  <div className="min-h-[0.92em] mt-[0.04em] leading-[0.92]">
                    <span className="block -tracking-wide mt-0 leading-[0.92]">
                      PARA TU{' '}
                      <span className="block mt-[0.05em]">
                        EMPRESA
                      </span>
                    </span>
                  </div>
                </div>
              </h1>
            </div>

            <div className="lg:w-2/5 flex flex-col justify-start items-start lg:pl-8 mt-4 lg:mt-0 pointer-events-auto z-30 relative pt-2 gap-3">
              <p
                className="text-sm tracking-[0.2em] uppercase font-medium"
                style={{ fontFamily: getFontFamily('accent') }}
              >
                TU ALIADO ESTRATÉGICO
              </p>

              <div className="w-full h-px bg-white/50"></div>

              <p
                className="text-md leading-relaxed mb-4"
                style={{ fontFamily: getFontFamily('body') }}
              >
                En PLUPack somos especialistas en abastecimiento
                mayorista de embalajes y descartables. Fabricamos y
                distribuimos insumos para papeleras, industriales,
                gastronomía, salud y hotelería, asegurando stock
                permanente y continuidad operativa. Además,
                centralizamos la provisión de insumos indirectos y
                complementarios que sostienen el funcionamiento diario
                de cada empresa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <a
                  href="/collections/all"
                  className="px-8 py-1 flex-1 bg-white text-[#0B6386] rounded-[10px] font-bold hover:bg-gray-100 transition-colors uppercase text-sm tracking-wide min-h-[40px] flex items-center justify-center"
                  style={{ fontFamily: getFontFamily('body') }}
                >
                  Ver productos
                </a>
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
        </div>
      </div>
    </section>
  );
}
