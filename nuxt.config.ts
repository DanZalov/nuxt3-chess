// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
  ],
  build: {
    transpile: ['vuetify'],
  },
  hooks: {
    'pages:extend'(pages) {
      // add a route
      pages.push({
        name: 'home',
        path: '/',
        file: '~/pages/Home.vue',
      })
    },
  },
})
