import { createRoot } from 'react-dom/client';
import { Homepage } from '@components/Homepage';
import { getShopifyData } from '../types/shopify';

// Import Tailwind CSS v4 styles
import '../styles/globals.css';

// Get data from Shopify (injected by Liquid)
const shopifyData = getShopifyData();

function App() {
  return (
    <Homepage
      backgroundColor={
        shopifyData.settings?.backgroundColor ?? '#146C90'
      }
      shopName={shopifyData.shop?.name ?? 'Store'}
      accentColor={shopifyData.settings?.accentColor ?? '#ffffff'}
      headingText={shopifyData.settings?.headingText}
      subheadingText={shopifyData.settings?.subheadingText}
    />
  );
}

// Mount to the target element
const container =
  document.getElementById('react-homepage') ??
  document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
