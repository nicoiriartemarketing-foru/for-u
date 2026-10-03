import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1200,
    cssCodeSplit: true,
    minify: 'esbuild',
    // Keep React and its renderers in Rollup's dependency graph. Splitting
    // reconciler/fiber/drei into forced vendor chunks creates initialization cycles.
    rollupOptions: { output: { manualChunks(id) {
      if (id.includes('/node_modules/three/')) return 'three-vendor'
    } } },
  },
})
