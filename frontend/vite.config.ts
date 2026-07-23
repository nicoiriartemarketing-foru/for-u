import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compressionPlugin(),
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

function compressionPlugin(): Plugin {
  return {
    name: 'foru-gzip-brotli',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (!/\.(js|css|html|svg|json)$/.test(fileName)) continue

        const source = asset.type === 'asset' ? asset.source : asset.code
        if (!source) continue

        const buffer = Buffer.isBuffer(source) ? source : Buffer.from(source)
        if (buffer.byteLength < 1024) continue

        this.emitFile({
          type: 'asset',
          fileName: `${fileName}.gz`,
          source: gzipSync(buffer, { level: 9 }),
        })

        this.emitFile({
          type: 'asset',
          fileName: `${fileName}.br`,
          source: brotliCompressSync(buffer, {
            params: {
              [constants.BROTLI_PARAM_QUALITY]: 11,
            },
          }),
        })
      }
    },
  }
}
