import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    server: {
      fs: {
        allow: [fileURLToPath(new URL('..', import.meta.url))],
      },
    },
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 3001,
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3000',
    },
  },
})
