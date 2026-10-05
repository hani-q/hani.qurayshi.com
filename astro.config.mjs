// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // The chat's model workers import code-split libraries, which need ES-module workers.
    worker: { format: 'es' }
  }
});