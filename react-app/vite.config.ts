import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: './', // Use relative paths for assets
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
    },
  },
  build: {
    // Output to Shopify assets folder
    outDir: '../assets',
    emptyOutDir: false, // Don't delete other assets!
    rollupOptions: {
      input: {
        'react-homepage': resolve(
          __dirname,
          'src/entries/homepage.tsx'
        ),
        // Add more entry points as needed:
        // 'react-product-viewer': resolve(__dirname, 'src/entries/product-viewer.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'react-chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Output CSS with predictable name for Shopify
          if (assetInfo.name?.endsWith('.css')) {
            return 'react-homepage.css';
          }
          // Flatten assets to avoid Shopify subfolder issues
          return 'react-[name]-[hash][extname]';
        },
      },
    },
  },
  // Dev server for local development
  server: {
    port: 3000,
    open: true,
  },
});
