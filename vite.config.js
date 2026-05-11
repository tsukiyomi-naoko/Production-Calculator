import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative paths make the built app work on GitHub Pages project URLs
  // with or without the trailing slash.
  base: process.env.GITHUB_PAGES === 'true' ? './' : '/',
});
