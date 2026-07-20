import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

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
  },

  adapter: cloudflare()
});