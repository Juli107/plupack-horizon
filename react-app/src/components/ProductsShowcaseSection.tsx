import { useEffect, useRef } from 'react';
import { getShopifyData } from '@/types/shopify';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

export function ProductsShowcaseSection() {
  const { getFontFamily } = useShopifyTheme();
  const shopifyData = getShopifyData();
  const scrollerRef = useRef<HTMLUListElement>(null);

  // Intercept wheel only for horizontal-dominant gestures so Lenis still handles
  // vertical scroll while the cursor is over the carousel. Capture phase runs
  // before Lenis's window listener, so stopPropagation keeps Lenis untouched.
  useEffect(() => {
    const ul = scrollerRef.current;
    if (!ul) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.stopPropagation();
      }
    };

    ul.addEventListener('wheel', onWheel, { capture: true, passive: true });
    return () => ul.removeEventListener('wheel', onWheel, { capture: true });
  }, []);

  const showcase = shopifyData.productsShowcase;
  const allProducts = shopifyData.products ?? [];
  const maxProducts = showcase?.maxProducts ?? 8;
  const products = allProducts.slice(0, maxProducts);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="relative z-20 w-full bg-[#0F5575] text-white py-16 md:py-24">
      <div className="container mx-auto px-5 sm:px-6 md:px-12">
        <header className="mb-7 md:mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="w-full max-w-none">
            <h2
              className="text-[clamp(2.15rem,8.4vw,3.1rem)] leading-[0.9] tracking-[-0.03em] md:text-5xl font-semibold text-balance"
              style={{ fontFamily: getFontFamily('heading') }}
            >
              {showcase?.title ?? 'Lo que mas se mueve hoy'}
            </h2>
          </div>

          <a
            href={showcase?.buttonUrl ?? shopifyData.routes?.allProducts ?? '/collections/all'}
            className="shrink-0 inline-flex w-full md:w-auto items-center justify-center gap-2 border border-white rounded-[10px] px-4 py-2.5 md:px-5 md:py-2.5 text-xs md:text-sm uppercase tracking-[0.08em] font-semibold bg-transparent text-white hover:bg-white hover:text-[#0F5575] transition-colors duration-300"
            style={{
              fontFamily: getFontFamily('body'),
            }}
          >
            {showcase?.buttonText ?? 'Ver mas'}
          </a>
        </header>
      </div>

      <div className="relative w-full">
        <ul
          ref={scrollerRef}
          className="m-0 list-none flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory pl-5 md:pl-[max(3rem,calc((100vw-80rem)/2+3rem))] scroll-pl-5 md:scroll-pl-[max(3rem,calc((100vw-80rem)/2+3rem))] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.4)_transparent]"
        >
          {products.map((product, index) => (
            <li
              key={product.handle}
              className={`snap-start shrink-0 w-[78vw] max-w-[19rem] sm:w-[45vw] md:w-[30vw] lg:w-[24vw]${index === products.length - 1 ? ' mr-5 md:mr-[max(3rem,calc((100vw-80rem)/2+3rem))]' : ''}`}
            >
              <a
                href={product.url}
                className="group flex h-full flex-col overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-300"
              >
                <div className="relative aspect-square bg-[#0A3D54]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      width={900}
                      height={900}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-[#1B4B6B] to-[#5AA2C2]" />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <h3
                    className="overflow-hidden text-[0.98rem] md:text-lg font-medium leading-snug text-white font-['Montserrat'] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                  >
                    {product.title}
                  </h3>
                  <span
                    className={`mt-auto pt-3 inline-flex w-full items-center justify-center rounded-[10px] border px-4 py-2.5 text-[0.72rem] md:text-xs uppercase tracking-[0.08em] font-semibold transition-colors duration-300 ${
                      product.inStock === false
                        ? 'border-white/35 bg-transparent text-white/75'
                        : 'border-white bg-white text-[#0F5575] group-hover:bg-transparent group-hover:text-white'
                    }`}
                    style={{ fontFamily: getFontFamily('body') }}
                  >
                    {product.inStock === false ? 'Agotado' : 'Ver producto'}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
