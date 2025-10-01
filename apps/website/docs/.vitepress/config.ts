import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DPML',
  description: 'Deepractice Prompt Markup Language - Define AI like writing HTML',

  locales: {
    en: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/' },
          { text: 'Protocol', link: '/en/protocol/' },
          { text: 'GitHub', link: 'https://github.com/Deepractice/DPML' }
        ],

        sidebar: {
          '/en/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Introduction', link: '/en/guide/' },
                { text: 'Quick Start', link: '/en/guide/quickstart' }
              ]
            }
          ]
          // Protocol page has no sidebar, use outline only
        },

        outline: {
          level: [2, 3],
          label: 'On this page'
        }
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/' },
          { text: '协议', link: '/zh/protocol/' },
          { text: 'GitHub', link: 'https://github.com/Deepractice/DPML' }
        ],

        sidebar: {
          '/zh/guide/': [
            {
              text: '开始使用',
              items: [
                { text: '介绍', link: '/zh/guide/' },
                { text: '快速开始', link: '/zh/guide/quickstart' }
              ]
            }
          ]
          // 协议页面没有侧边栏，只使用右侧目录
        },

        outline: {
          label: '页面导航'
        },

        docFooter: {
          prev: '上一页',
          next: '下一页'
        },

        lastUpdated: {
          text: '最后更新于'
        },

        darkModeSwitchLabel: '主题',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部'
      }
    }
  },

  themeConfig: {
    logo: '/logo.png',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Deepractice/DPML' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Deepractice.ai'
    },

    search: {
      provider: 'local'
    }
  }
})
