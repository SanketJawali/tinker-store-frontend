import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [devtools(), solidPlugin(), tailwindcss()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['debug', 'extend'],
  },
});
