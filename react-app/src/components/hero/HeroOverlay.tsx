import { useShopifyTheme } from '../../hooks/useShopifyTheme';

export function HeroOverlay() {
  const { getFontFamily } = useShopifyTheme();

  return (
    <section className=" inset-0 px-8 py-20 flex flex-col justify-between pointer-events-none text-white">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row w-full h-full relative items-start">
        {/* Left: Headline Group - z-10 to be behind 3D elements if they overlap */}
        <div className="lg:w-2/3 flex flex-col justify-start -z-1 relative">
          <h1
            style={{ fontFamily: getFontFamily('heading') }}
            className="text-6xl md:text-8xl lg:text-8xl font-medium uppercase leading-[0.95] tracking-tight"
          >
            <div>EMBALAJE QUE</div>
            <div>SIGUE TU</div>
            <div
              className="text-transparent relative font-extrabold"
              style={{
                WebkitTextStroke: '2px white',
                fontFamily: getFontFamily('heading'),
              }}
            >
              DINÁMICA
            </div>
          </h1>
        </div>

        {/* Right: Info Panel - z-30 to be above 3D elements */}
        <div className="lg:w-1/3 flex flex-col justify-start items-start lg:pl-10 mt-10 lg:mt-0 pointer-events-auto z-30 relative pt-2">
          {/* Eyebrow */}
          <div
            className="text-xs tracking-[0.2em] uppercase opacity-80 mb-4 font-semibold"
            style={{ fontFamily: getFontFamily('body') }}
          >
            PROVEEDOR INTEGRAL
          </div>

          {/* Separator */}
          <div className="w-12 h-px bg-white/50 mb-6"></div>

          {/* Body */}
          <p
            className="text-base md:text-lg leading-relaxed opacity-90 mb-8 max-w-md"
            style={{ fontFamily: getFontFamily('body') }}
          >
            Plupack es una empresa que se adapta a las necesidades de
            cada cliente, apoyando sus necesidades de insumos de
            embalajes y descartables. A su vez, también podemos
            proveer de insumos de limpieza, textiles y de librería.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              className="px-8 py-3 bg-white text-[#0B6386] rounded-full font-bold hover:bg-gray-100 transition-colors uppercase text-sm tracking-wide"
              style={{ fontFamily: getFontFamily('body') }}
            >
              Cotización Mayorista
            </button>
            <button
              className="px-8 py-3 bg-transparent border border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors uppercase text-sm tracking-wide"
              style={{ fontFamily: getFontFamily('body') }}
            >
              Ver catálogo
            </button>
          </div>
        </div>
      </div>

      {/* Footer Badge */}
      <div
        className="absolute bottom-6 right-6 md:bottom-12 md:right-12 text-xs font-bold tracking-[0.2em] opacity-60 uppercase"
        style={{ fontFamily: getFontFamily('body') }}
      >
        EST. 2017 ARGENTINA
      </div>
    </section>
  );
}
