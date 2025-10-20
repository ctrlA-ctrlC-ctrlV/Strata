import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**']
  }
});
