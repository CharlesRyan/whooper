export default {
  ssr: false,
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#000' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [{ src: '~plugins/vuetify', ssr: true }],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxtjs/google-analytics'
    // '@nuxtjs/eslint-module',
    // '@nuxtjs/stylelint-module'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/vuetify', '@nuxtjs/style-resources'],
  /*
   ** Build configuration
   */
  build: {
    transpile: ['@nuxtjs/vuetify', '@nuxtjs/style-resources'],
    extend(config, ctx) {}
  },
  styleResources: {
    scss: ['~/assets/scss/variables.scss']
  },
  vuetify: {
    theme: {
      dark: true,
      themes: {
        light: {
          primary: '#2A9D8F',
          secondary: '#E9C46A',
          accent: '#F4A261'
        }
      }
    }
  },
  googleAnalytics: {
    id: 'G-5J5YJS37LK',
    autoTracking: {
      screenview: true
    }
  }
}
