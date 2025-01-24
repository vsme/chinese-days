import { createRequire } from 'module'
import { DefaultTheme, defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('chinese-days/package.json')

export const en = defineConfig({
  description: "A VitePress Site",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/en/guide/what-is-chinese-days' },
      { text: 'Demo', link: '/en/demo/calendar' },
      {
        text: pkg.version,
        link: 'https://github.com/vsme/chinese-days/blob/main/CHANGELOG.md'
      },
    ],

    sidebar: {
      '/en/guide/': { base: '/en/guide/', items: sidebarGuide() },
      '/en/demo/': { base: '/en/demo/', items: sidebarDemo() }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vsme/chinese-days' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Yawei Sun'
    },
  }
})

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'What is Chinese Days', link: 'what-is-chinese-days' },
        { text: 'iCal Subscription', link: 'ical-subscription' },
        { text: 'Getting started', link: 'getting-started' },
      ]
    },
    {
      text: 'Holidays',
      collapsed: false,
      items: [
        { text: 'Holidays', link: 'holidays' },
        { text: 'Lieu Days', link: 'lieu-days' },
        { text: 'Working Days', link: 'working-days' },
      ]
    },
    {
      text: '24 Solar Terms',
      collapsed: false,
      items: [
        { text: 'Apis', link: '24-solar-terms' },
      ]
    },
    {
      text: 'Lunar',
      collapsed: false,
      items: [
        { text: 'Solar to Lunar', link: 'to-lunar' },
        { text: 'Lunar to Solar', link: 'from-lunar' },
        { text: 'Lunar Folk Festival', link: 'lunar-folk-festival' },
      ]
    },
    { text: 'Else',
      collapsed: false,
      items: [
        { text: 'Contributing', link: 'contributing' },
        { text: 'Thank', link: 'thank' }
      ]
    }
  ]
}

function sidebarDemo(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Demo',
      items: [
        { text: 'Calendar', link: 'calendar' }
      ]
    }
  ]
}