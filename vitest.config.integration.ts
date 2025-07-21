import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/__tests__/integration/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/__tests__/test-utils/setup.ts'],
    testTimeout: 30000, // Integration tests may take longer
    hookTimeout: 30000,
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});