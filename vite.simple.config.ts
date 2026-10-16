import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: 'frontend',
  plugins: [tailwindcss()],
  server: {
    host: '127.0.0.1', port: 5174, strictPort: true,
    proxy: { '/api': process.env.SIMPLE_API_URL || 'http://127.0.0.1:3002' },
  },
  build: { outDir: '../dist-simple', emptyOutDir: true },
});
