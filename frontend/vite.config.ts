import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three') || id.includes('node_modules/@pmndrs') || id.includes('node_modules/postprocessing')) {
            return 'world3d-vendor'
          }

          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor'
          }

          if (id.includes('node_modules/reactflow')) {
            return 'canvas-vendor'
          }

          if (id.includes('node_modules/framer-motion')) {
            return 'motion-vendor'
          }
        },
      },
    },
  },
})
