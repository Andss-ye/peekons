import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const lib = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

// La landing usa la librería desde ../src, con la misma API que se publica.
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        { find: /^peekons\/react$/, replacement: lib('src/react.tsx') },
        { find: /^peekons\/icons$/, replacement: lib('src/icons/index.ts') },
        { find: /^peekons\/peekons\.css$/, replacement: lib('peekons.css') },
        { find: /^peekons$/, replacement: lib('src/index.ts') },
      ],
      dedupe: ['react', 'react-dom'],
    },
  },
});
