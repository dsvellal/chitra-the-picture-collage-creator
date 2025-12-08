/// <reference types="vitest" />
import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./config/thresholds.json', 'utf8'));

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, '.stryker-tmp/**'],
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    server: {
      deps: {
        inline: ['vitest-canvas-mock'] // IMPORTANT for Konva
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/components/**',
        'src/App.tsx'
      ],
      thresholds: {
        lines: config.coverage,
        functions: config.coverage,
        branches: config.coverage,
        statements: config.coverage
      }
    }
  }
});
