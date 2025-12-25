import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  coverage: {
    enabled: true,
    provider: 'istanbul',
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
      '**/*.d.ts',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
    ],
    reporters: [
      'html',
      ['text', { skipFull: true }],
      ['json', { file: 'coverage-final.json' }],
    ],
    reportsDirectory: './coverage-reports',
    reportOnFailure: true,
    clean: true,
  },
  testEnvironment: 'jsdom',
  setupFiles: ['./rstest.setup.ts'],
  plugins: [pluginReact()],
});
