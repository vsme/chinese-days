import { defineConfig } from 'vitepress'
import { en } from './en'
import { zh } from './zh'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Chinese Days",

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/icon.png' }],
  ],

  rewrites: {
    'zh/:rest*': ':rest*'
  },

  themeConfig: {
    logo: { src: '/icon.png', width: 24, height: 24 },
    search: {
      provider: 'local',
    }
  },

  locales: {
    root: { label: '简体中文', ...zh },
    en: { label: 'English', ...en },
  },
})
