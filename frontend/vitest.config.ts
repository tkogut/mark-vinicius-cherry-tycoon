import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        // Registers @testing-library/jest-dom matchers and per-test cleanup.
        // Was `[]` before 2026-08-06 despite jest-dom being installed.
        setupFiles: ['./vitest.setup.ts'],
        include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
