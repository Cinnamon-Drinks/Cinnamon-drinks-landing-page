import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://cinnamondrinks.com.br',
  build: {
    assets: 'assets-built'
  },
  vite: {
    server: {
      fs: { strict: false }
    }
  }
});
