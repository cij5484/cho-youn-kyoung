import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fontsource-woff2-only',
      enforce: 'pre',
      transform(code, id) {
        if (!/\/node_modules\/@fontsource\/noto-(sans|serif)-kr\/[^?]+\.css(?:\?|$)/.test(id.replaceAll('\\', '/'))) return;
        // Keep the exact font faces, weights and Unicode ranges. Modern browsers
        // use WOFF2; removing only the legacy fallback avoids emitting duplicates.
        return code.replace(/,\s*url\([^)]*\.woff['"]?\)\s*format\(['"]woff['"]\)/g, '');
      },
    },
  ],
  base: '/',
});
