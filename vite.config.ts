import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative assets paths for easy deployment anywhere (GitHub Pages, Vercel, Firebase Hosting, etc.)
  server: {
    port: 3000,
    open: true
  }
});
