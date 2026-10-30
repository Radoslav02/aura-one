import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Keep the heavy libs in their own cacheable chunks (three.js is split
        // automatically along the lazy page boundaries that use it)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[\\/](gsap|@gsap)[\\/]/.test(id)) return 'gsap'
            if (/[\\/](react|react-dom|react-router|i18next|react-i18next|scheduler)[\\/]/.test(id)) return 'vendor'
          }
        },
      },
    },
  },
})
