import { createRequire } from 'module'
import { defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('chinese-days/package.json')

export const zh = defineConfig({
  description: "A VitePress Site",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/getting-started' },
      { text: '日历', link: '/calendar' },
      {
        text: pkg.version,
        items: [
          {
            text: '更新日志',
            link: 'https://github.com/vsme/chinese-days/blob/main/CHANGELOG.md'
          },
          {
            text: '参与贡献',
            link: 'https://github.com/vsme/chinese-days?tab=readme-ov-file#%E8%B4%A1%E7%8C%AE%E4%BB%A3%E7%A0%81'
          }
        ]
      },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vsme/chinese-days' }
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: `Copyright © 2019-${new Date().getFullYear()} Yawei Sun`
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})