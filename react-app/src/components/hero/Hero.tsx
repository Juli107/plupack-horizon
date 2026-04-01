import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import { getShopifyData } from '@/types/shopify';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLenis } from 'lenis/react';

export function Hero() {
  const { getFontFamily } = useShopifyTheme();
  const shopifyData = getShopifyData();
  const headlineRef = useRef<HTMLHeadingElement>(null);
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
  const featuredMediaHeightClass = 'md:h-[49vh] md:min-h-[25rem]';
  const featuredContentOffsetClass = 'md:pt-[calc(49vh+2.5rem)]';

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

  const goToPrevProduct = () => {
    if (featuredProducts.length <= 1) return;
    setActiveProductIndex((prev) =>
      prev === 0 ? featuredProducts.length - 1 : prev - 1,
    );
  };

  const goToNextProduct = () => {
    if (featuredProducts.length <= 1) return;
    setActiveProductIndex((prev) =>
      prev === featuredProducts.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <section className="relative w-full min-h-screen md:h-screen">
      {/* Responsive SVG filter switcher: mobile uses thinner dilate radius */}
      <style>{`
        .hero-outline-text { filter: url(#outline-filter-hero-mobile); }
        @media (min-width: 768px) {
          .hero-outline-text { filter: url(#outline-filter-hero); }
        }
      `}</style>
      <div className="md:absolute md:inset-0 md:h-full pointer-events-none text-white flex flex-col md:block">
        {hasFeaturedProducts ? (
          <div
            className={`pointer-events-auto w-full md:absolute md:inset-x-0 md:top-0 ${featuredMediaHeightClass}`}
          >
            <article className="relative overflow-hidden w-full aspect-[4/3] md:aspect-auto md:h-full bg-[#072f4f] text-white">

              {/* Full-bleed images — stacked, crossfade via opacity */}
              {featuredProducts.map((product, index) => (
                <div
                  key={product.handle}
                  className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                  style={{ opacity: index === activeProductIndex ? 1 : 0 }}
                  aria-hidden={index !== activeProductIndex}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  ) : null}
                </div>
              ))}

              {/* Gradient scrim — bottom-heavy, tinted PLUPack blue */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#051e34]/90 via-[#051e34]/40 to-transparent pointer-events-none" />
              {/* Subtle top vignette so navbar stays readable */}
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#051e34]/55 to-transparent pointer-events-none" />

              {/* "Destacados" badge — top-left, below navbar */}
              <div className="absolute top-16 md:top-20 left-6 md:left-10">
                <p
                  className="inline-flex items-center w-max px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-semibold backdrop-blur-sm"
                  style={{ fontFamily: getFontFamily('accent') }}
                >
                  Destacados
                </p>
              </div>

              {/* Slide counter — top-right */}
              <div className="absolute top-16 md:top-20 right-6 md:right-10">
                <span
                  className="text-[11px] md:text-xs uppercase tracking-[0.14em] text-white/70"
                  style={{ fontFamily: getFontFamily('accent') }}
                >
                  {activeProductIndex + 1} / {featuredProducts.length}
                </span>
              </div>

              {/* Text overlay — bottom-left, sitting on scrim */}
              {activeProduct ? (
                <div className="absolute bottom-0 left-0 right-0 pl-6 pr-6 md:pl-10 md:pr-20 pb-10 md:pb-8">
                  <h2
                    className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight uppercase tracking-wide line-clamp-2"
                    style={{ fontFamily: getFontFamily('heading') }}
                  >
                    {activeProduct.title}
                  </h2>
                  {activeProduct.description ? (
                    <p
                      className="mt-1.5 text-sm md:text-base leading-snug text-white/80 line-clamp-2 max-w-2xl"
                      style={{ fontFamily: getFontFamily('body') }}
                    >
                      {activeProduct.description}
                    </p>
                  ) : null}
                  <div className="mt-3 md:mt-4">
                    <a
                      href={activeProduct.url}
                      className="inline-flex items-center justify-center rounded-[8px] border border-white/70 bg-white/10 backdrop-blur-sm text-white px-5 py-2 md:px-6 md:py-2.5 uppercase tracking-[0.08em] text-xs md:text-sm font-semibold hover:bg-white/25 transition-colors duration-300"
                      style={{ fontFamily: getFontFamily('body') }}
                    >
                      Ver producto
                    </a>
                  </div>
                </div>
              ) : null}

              {/* Arrow — previous (hidden on mobile, shown md+) */}
              <button
                type="button"
                onClick={goToPrevProduct}
                className="hidden md:inline-flex absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/25 backdrop-blur-sm text-white hover:bg-black/45 transition-colors"
                aria-label="Producto anterior"
              >
                <span aria-hidden="true" className="text-xl leading-none">‹</span>
              </button>

              {/* Arrow — next (hidden on mobile, shown md+) */}
              <button
                type="button"
                onClick={goToNextProduct}
                className="hidden md:inline-flex absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/25 backdrop-blur-sm text-white hover:bg-black/45 transition-colors"
                aria-label="Siguiente producto"
              >
                <span aria-hidden="true" className="text-xl leading-none">›</span>
              </button>

              {/* Dot indicators — bottom-right */}
              {featuredProducts.length > 1 ? (
                <div className="absolute bottom-6 md:bottom-8 right-6 md:right-10 flex items-center gap-1.5">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveProductIndex(index)}
                      aria-label={`Ir al producto ${index + 1}`}
                      className={`rounded-full transition-all duration-300 ${
                        index === activeProductIndex
                          ? 'w-5 h-1.5 bg-white'
                          : 'w-1.5 h-1.5 bg-white/45 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          </div>
        ) : null}

        <div
          className={`flex-1 md:h-full flex items-end px-6 md:px-10 xl:px-12 pb-8 md:pb-10 pt-8 ${
            hasFeaturedProducts ? featuredContentOffsetClass : 'md:pt-28'
          }`}
        >
          <div className="flex flex-col lg:flex-row w-full relative items-start lg:justify-between gap-8 lg:gap-6">
          <div className="lg:w-3/5 xl:w-7/12 flex flex-col justify-start relative">
            <h1
              ref={headlineRef}
              style={{ fontFamily: getFontFamily('heading') }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[clamp(4.2rem,5.5vw,5.8rem)] xl:text-[clamp(5rem,5.5vw,6.4rem)] leading-[0.9] font-medium uppercase tracking-wide mt-[-0.05em]"
            >
              <div className="flex flex-wrap items-baseline gap-x-[0.18em] leading-[0.92]">
                <div className="relative inline-block">
                  {/* Invisible placeholder for sizing — weight must match SVG fontWeight: 500 */}
                  <div className="opacity-0 font-medium tracking-wider">
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
                        <feFlood floodColor="white" result="COLOR" />
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
                        <feFlood floodColor="white" result="COLOR" />
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
                      x="0.05em"
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
                      x="0.05em"
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

                <div className="relative inline-block">
                  {/* Invisible placeholder for sizing — weight must match SVG fontWeight: 500 */}
                  <div className="opacity-0 font-medium tracking-wider">
                    INTEGRALES
                  </div>

                  <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                    {/* Outline text - always visible */}
                    <text
                      x="0.05em"
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
                      x="0.05em"
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
              </div>
              <span className="block -tracking-wide mt-[0.28em] leading-[0.92]">
                PARA TU <span className="block 2xl:inline">EMPRESA</span>
              </span>
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
              En PLUPack somos especialistas en abastecimiento mayorista
              de embalajes y descartables. Fabricamos y distribuimos
              insumos para papeleras, industriales, gastronomía, salud y
              hotelería, asegurando stock permanente y continuidad
              operativa. Además, centralizamos la provisión de insumos
              indirectos y complementarios que sostienen el
              funcionamiento diario de cada empresa.
            </p>

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
      </div>
      </div>
    </section>
  );
}
