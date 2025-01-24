import { createRequire } from 'module'
import { DefaultTheme, defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('chinese-days/package.json')

export const zh = defineConfig({
  description: "A VitePress Site",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/guide/what-is-chinese-days' },
      { text: '示例', link: '/demo/calendar' },
      {
        text: pkg.version,
        link: 'https://github.com/vsme/chinese-days/blob/main/CHANGELOG.md'
      },
    ],

    sidebar: {
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/demo/': { base: '/demo/', items: sidebarDemo() }
    },

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

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '简介',
      collapsed: false,
      items: [
        { text: '关于本项目', link: 'what-is-chinese-days' },
        { text: '日历订阅', link: 'ical-subscription' },
        { text: '快速开始', link: 'getting-started' },
      ]
    },
    {
      text: '节假日',
      collapsed: false,
      items: [
        { text: '节假日', link: 'holidays' },
        { text: '调休日', link: 'lieu-days' },
        { text: '工作日', link: 'working-days' },
      ]
    },
    {
      text: '24节气',
      collapsed: false,
      items: [
        { text: '使用方法', link: '24-solar-terms' },
      ]
    },
    {
      text: '农历（阴历）',
      collapsed: false,
      items: [
        { text: '阳历转农历', link: 'to-lunar' },
        { text: '农历转阳历', link: 'from-lunar' },
        { text: '民俗节日与纪念日', link: 'lunar-folk-festival' },
      ]
    },
    { text: '其他',
      collapsed: false,
      items: [
        { text: '贡献指南', link: 'contributing' },
        { text: '致谢', link: 'thank' }
      ]
    }
  ]
}

function sidebarDemo(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '使用示例',
      items: [
        { text: '日历', link: 'calendar' }
      ]
    }
  ]
}