import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5174 },
  test: {
    include: ['src/**/*.test.js']
  }
});
