import { getShopifyData } from '@/types/shopify';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

export function ProductsShowcaseSection() {
  const { getFontFamily } = useShopifyTheme();
  const shopifyData = getShopifyData();

  const showcase = shopifyData.productsShowcase;
  const allProducts = shopifyData.products ?? [];
  const maxProducts = showcase?.maxProducts ?? 8;
  const products = allProducts.slice(0, maxProducts);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="relative z-20 w-full bg-[#0F5575] text-white py-18 md:py-24">
      <div className="container mx-auto px-6 md:px-12">
        <header className="mb-8 md:mb-10 flex items-start justify-between gap-6">
          <div>
            <h2
              className="text-3xl md:text-5xl font-semibold leading-tight"
              style={{ fontFamily: getFontFamily('heading') }}
            >
              {showcase?.title ?? 'Lo que mas se mueve hoy'}
            </h2>
          </div>

          <a
            href={showcase?.buttonUrl ?? shopifyData.routes?.allProducts ?? '/collections/all'}
            className="shrink-0 inline-flex items-center gap-2 border border-white rounded-[10px] px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm uppercase tracking-[0.08em] font-semibold bg-transparent text-white hover:bg-white hover:text-[#0F5575] transition-colors duration-300"
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
          className="m-0 list-none flex gap-4 md:gap-6 overflow-x-auto pb-3 snap-x snap-mandatory pl-6 md:pl-[max(3rem,calc((100vw-80rem)/2+3rem))] scroll-pl-6 md:scroll-pl-[max(3rem,calc((100vw-80rem)/2+3rem))] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.4)_transparent]"
        >
          {products.map((product, index) => (
            <li
              key={product.handle}
              className={`snap-start shrink-0 w-[72vw] sm:w-[45vw] md:w-[30vw] lg:w-[24vw]${index === products.length - 1 ? ' mr-6 md:mr-[max(3rem,calc((100vw-80rem)/2+3rem))]' : ''}`}
            >
              <a
                href={product.url}
                className="group block h-full overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-300"
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

                <div className="p-4 md:p-5">
                  <h3
                    className="text-base md:text-lg font-medium leading-snug text-white font-['Montserrat']"
                  >
                    {product.title}
                  </h3>
                  <p
                    className="mt-2 text-sm md:text-base text-white/80"
                    style={{ fontFamily: getFontFamily('body') }}
                  >
                    {product.inStock === false ? 'Contactar para cotizar' : `${product.price} ARS`}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
