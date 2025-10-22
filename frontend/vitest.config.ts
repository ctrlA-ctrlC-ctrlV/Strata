/// <reference types="vitest" />
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  test: {
    // Only include unit tests for vitest
    include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
    exclude: [
      'tests/e2e/**/*',
      'tests/a11y/**/*',
      'node_modules/**/*'
    ],
    environment: 'jsdom',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/'
      ]
    }
  },
  build: {
    target: 'esnext', 
    minify: 'terser',
    rollupOptions: {
      input: {
        main: 'src/main.ts'
      },
      output: {
        // Will add vendor deps when we have them
        manualChunks: undefined
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