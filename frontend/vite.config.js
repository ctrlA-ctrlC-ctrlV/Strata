import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['axios'] // if we add any vendor deps later
        }
      }
    },
    // Performance budget
    chunkSizeWarningLimit: 500
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    port: 3000
  }
})