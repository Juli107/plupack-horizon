import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import { getShopifyData } from '@/types/shopify';

// ============================================
// SOCIAL ICONS
// ============================================
function InstagramIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block ml-1"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

// ============================================
// FOOTER COMPONENT
// ============================================
export function Footer() {
  const { getFontFamily } = useShopifyTheme();
  const shopifyData = getShopifyData();

  // Use inverse logo if available, fallback to regular logo
  const logoUrl =
    shopifyData.assets?.logoInverse || shopifyData.assets?.logo;

  return (
    <footer className="relative w-full bg-gradient-to-b from-[#1E4377] to-[#143059] text-white">
      {/* Logo Section - Full Width */}
      <div className="w-full border-b border-white/20">
        <div className="px-6 sm:px-8 md:px-12 lg:px-16 py-8 md:py-16">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="PLUPack Embalajes"
              className="h-12 sm:h-14 md:h-20 lg:h-24 w-auto"
            />
          ) : (
            <span
              className="text-xl sm:text-2xl md:text-3xl font-bold"
              style={{ fontFamily: getFontFamily('heading') }}
            >
              PLUPACK
            </span>
          )}
        </div>
      </div>

      {/* Info Columns - Full Width Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/20 border-b border-white/20">
        {/* Column 1: Dónde estamos */}
        <div
          className="p-6 sm:p-8 md:p-12 lg:p-16"
          style={{ fontFamily: getFontFamily('body') }}
        >
          <h3
            className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.125em] mb-4 sm:mb-6 opacity-70"
            style={{ fontFamily: "'Roboto Mono', monospace" }}
          >
            DÓNDE ESTAMOS
          </h3>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-5 sm:mb-6 font-medium max-w-[20ch]">
            Alvar Núñez 571, B1686 Villa
            <br />
            Tesei, Provincia de Buenos Aires,
            <br />
            Argentina
          </p>
          <a
            href="https://maps.google.com/?q=Alvar+Núñez+571+Villa+Tesei+Buenos+Aires+Argentina"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors text-sm"
          >
            Ver en maps
            <ArrowIcon />
          </a>
        </div>

        {/* Column 2: Navegación */}
        <div
          className="p-6 sm:p-8 md:p-12 lg:p-16"
          style={{ fontFamily: getFontFamily('body') }}
        >
          <h3
            className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.125em] mb-4 sm:mb-6 opacity-70"
            style={{ fontFamily: "'Roboto Mono', monospace" }}
          >
            NAVEGACIÓN
          </h3>
          <nav className="flex flex-col gap-2.5 sm:gap-3">
            <a
              href="/collections/all"
              className="text-base sm:text-lg md:text-xl font-medium hover:opacity-70 transition-opacity"
            >
              Catálogo
            </a>
            <a
              href="/pages/cotizar"
              className="text-base sm:text-lg md:text-xl font-medium hover:opacity-70 transition-opacity"
            >
              Cotizar
            </a>
            <a
              href="/pages/nosotros"
              className="text-base sm:text-lg md:text-xl font-medium hover:opacity-70 transition-opacity"
            >
              Nosotros
            </a>
            <a
              href="/pages/contacto"
              className="text-base sm:text-lg md:text-xl font-medium hover:opacity-70 transition-opacity"
            >
              Contacto
            </a>
          </nav>
        </div>

        {/* Column 3: Llámanos */}
        <div
          className="p-6 sm:p-8 md:p-12 lg:p-16"
          style={{ fontFamily: getFontFamily('body') }}
        >
          <h3
            className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.125em] mb-4 sm:mb-6 opacity-70"
            style={{ fontFamily: "'Roboto Mono', monospace" }}
          >
            LLÁMANOS
          </h3>
          <a
            href="tel:+541160599214"
            className="text-xl sm:text-2xl md:text-3xl font-medium hover:opacity-70 transition-opacity block mb-2 leading-tight"
          >
            +54 11 6059-9214
          </a>
          <p className="text-sm opacity-70 mb-6 sm:mb-8">
            Lunes a Viernes, 9am - 6pm
          </p>

          {/* Social Icons */}
          <div className="flex gap-4">
            <a
              href="https://instagram.com/plupack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:opacity-70 transition-opacity"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://facebook.com/plupack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:opacity-70 transition-opacity"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 py-5 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-center md:text-left">
          <p
            className="text-xs font-medium uppercase tracking-widest opacity-70"
            style={{ fontFamily: "'Roboto Mono', monospace" }}
          >
            PLUPACK EMBALAJES © 2025
          </p>
          <a
            href="/pages/terminos-y-condiciones"
            className="text-xs opacity-70 hover:opacity-100 transition-opacity"
            style={{ fontFamily: getFontFamily('body') }}
          >
            Términos y condiciones
          </a>
        </div>
      </div>
    </footer>
  );
}
