import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Look for files ending with .test.ts or .test.js
        include: ['src/**/*.test.{js,ts}'],
        environment: 'jsdom', // Explicitly set jsdom as the test environment
        globals: true,
    },
});
