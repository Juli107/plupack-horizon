import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import { getShopifyData } from '@/types/shopify';

export function StockSustainabilityWrapper() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  const { getFontFamily } = useShopifyTheme();
  const [hasCountedUp, setHasCountedUp] = useState(false);

  const shopifyData = getShopifyData();
  const stockData = (shopifyData as any).stockSection ?? {};
  const productCount = stockData.productCount ?? 200;
  const buttonText = stockData.buttonText ?? 'Ver productos';
  const buttonUrl = stockData.buttonUrl ?? '/collections/all';

  useEffect(() => {
    if (hasCountedUp) return;

    const numberElement = numberRef.current;
    const wrapper = wrapperRef.current;
    if (!numberElement || !wrapper) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;

        setHasCountedUp(true);
        observer.disconnect();

        const counter = { val: 0 };
        gsap.to(counter, {
          val: productCount,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            numberElement.textContent = '+' + Math.round(counter.val);
          },
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [hasCountedUp, productCount]);

  return (
    <div
      ref={wrapperRef}
      className="stock-sustainability-trigger relative z-20"
      style={{ height: 'clamp(420px, 62vh, 680px)' }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ backgroundColor: '#E8ECF2' }}
      >
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />

        <div
          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
        >
          <div className="text-center px-6 max-w-3xl mx-auto pointer-events-auto">
            <h2
              className="font-bold leading-[1.1] mb-6"
              style={{
                fontFamily: getFontFamily('heading'),
                color: '#1B4B6B',
              }}
            >
              <span
                ref={numberRef}
                className="block"
                style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}
              >
                +0
              </span>
              <span
                className="block"
                style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)' }}
              >
                ARTICULOS EN
              </span>
              <span
                className="block"
                style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)' }}
              >
                STOCK PERMANENTE
              </span>
            </h2>
            <a
              href={buttonUrl}
              className="inline-block px-8 py-3 rounded-[10px] text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105"
              style={{
                fontFamily: getFontFamily('body'),
                backgroundColor: '#2873A8',
                color: 'white',
              }}
            >
              {buttonText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
