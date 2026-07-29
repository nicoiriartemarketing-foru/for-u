import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-hot-toast',
      'zustand',
      '@supabase/supabase-js',
      'reactflow',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },
  server: {
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/pages/LandingPage.tsx',
        './src/pages/ForUWorkspace.tsx',
      ],
    },
  },
  build: {
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three-vendor'
          }

          if (id.includes('node_modules/@react-three/fiber')) {
            return 'r3f-vendor'
          }

          if (id.includes('node_modules/@react-three/drei')) {
            return 'drei-vendor'
          }

          if (id.includes('node_modules/@react-three/postprocessing') || id.includes('node_modules/postprocessing')) {
            return 'postprocessing-vendor'
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
