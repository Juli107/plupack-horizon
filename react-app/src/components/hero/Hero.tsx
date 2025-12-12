import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function Hero() {
  const { getFontFamily } = useShopifyTheme();
  const solidTextRef = useRef<SVGTextElement>(null);
  const [animationTriggered, setAnimationTriggered] = useState(false);

  // Listen for loading screen completion and trigger fill animation
  useEffect(() => {
    if (animationTriggered) return;

    const checkLoadingComplete = () => {
      const loadingScreen = document.querySelector('.plupack-loading-screen');
      return !loadingScreen;
    };

    const startAnimation = () => {
      if (!solidTextRef.current) return;
      
      // Animate the solid text opacity from 0 to 1, filling in over the outline
      gsap.fromTo(solidTextRef.current, 
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.3,
        }
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
        <div className="flex flex-col lg:flex-row w-full h-full relative items-start">
          {/* Left: Headline Group - z-10 to be behind 3D elements if they overlap */}
          <div className="lg:w-2/3 flex flex-col justify-start relative">
            <h1
              style={{ fontFamily: getFontFamily('heading') }}
              className="text-6xl md:text-8xl lg:text-[7.2rem] leading-[0.9] font-medium uppercase tracking-wide mt-[-0.05em]"
            >
              EMBALAJE <br />
              <span className="-tracking-wide">PARA CADA</span>
              <br />
              <div className="relative inline-block">
                {/* Invisible placeholder for sizing */}
                <div className="opacity-0 font-extrabold tracking-wider">
                  DINÁMICA
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
                        radius="2.8"
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
                    x="0.05em"
                    y="0.9em"
                    className="font-extrabold tracking-wider"
                    style={{
                      fontFamily: getFontFamily('heading'),
                      fontSize: 'inherit',
                      filter: 'url(#outline-filter-hero)',
                      fill: 'white',
                    }}
                  >
                    DINÁMICA
                  </text>
                  
                  {/* Solid fill text - fades in on top of outline */}
                  <text
                    ref={solidTextRef}
                    x="0.05em"
                    y="0.9em"
                    className="font-extrabold tracking-wider"
                    style={{
                      fontFamily: getFontFamily('heading'),
                      fontSize: 'inherit',
                      fill: 'white',
                      opacity: 0,
                    }}
                  >
                    DINÁMICA
                  </text>
                </svg>
              </div>
            </h1>
          </div>

          {/* Right: Info Panel - z-30 to be above 3D elements */}
          <div className="lg:w-2/5 flex flex-col justify-start items-start lg:pl-10 mt-10 lg:mt-0 pointer-events-auto z-30 relative pt-2 gap-3">
            {/* Eyebrow */}
            <p
              className="text-sm tracking-[0.2em] uppercase font-medium"
              style={{ fontFamily: getFontFamily('accent') }}
            >
              TU PROVEEDOR INTEGRAL
            </p>

            {/* Separator */}
            <div className="w-full h-px bg-white/50"></div>

            {/* Body */}
            <p
              className="text-md leading-relaxed mb-4"
              style={{ fontFamily: getFontFamily('body') }}
            >
              En PLUPack nos adaptamos a la realidad operativa de cada
              cliente, resolviendo el abastecimiento de embalajes y
              descartables. Además, complementamos tu pedido con
              insumos de limpieza, textiles y librería para que no
              tengas que buscar en otro lado.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                className="px-8 py-1 w-full bg-white text-[#0B6386] rounded-full font-bold hover:bg-gray-100 transition-colors uppercase text-sm tracking-wide"
                style={{ fontFamily: getFontFamily('body') }}
              >
                Cotización Mayorista
              </button>
              <button
                className="px-8 py-1 w-full bg-transparent border border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors uppercase text-sm tracking-wide"
                style={{ fontFamily: getFontFamily('body') }}
              >
                Ver catálogo
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
