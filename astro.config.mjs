import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  base: '/dashboard',
  adapter: cloudflare({ imageService: 'passthrough' }),
});
