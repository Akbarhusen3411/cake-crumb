import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Repo name on GitHub Pages — assets load from /cake-crumb/...
  base: '/cake-crumb/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split the long-lived vendor code into its own chunk so app updates
        // don't bust the React/Router cache. Firebase is dynamically imported
        // (see firebase.js) so Rollup already emits it as a separate async chunk.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
          }
        },
      },
    },
  },
})
