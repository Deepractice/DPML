import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'DPML',
  description: 'Deepractice Prompt Markup Language - Define AI like writing HTML',

  ignoreDeadLinks: true,

  rewrites: {
    'index.md': 'zh/index.md'
  },

  locales: {
    en: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Whitepaper', link: '/en/whitepaper/' },
          { text: 'Protocol', link: '/en/protocol/' }
        ],

        sidebar: {
          '/en/protocol/': [
            {
              text: 'Protocol Specification',
              items: [
                { text: 'Overview', link: '/en/protocol/' },
                { text: 'Syntax Specification', link: '/en/protocol/syntax' }
              ]
            }
          ]
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
          { text: '白皮书', link: '/zh/whitepaper/' },
          { text: '协议', link: '/zh/protocol/' }
        ],

        sidebar: {
          '/zh/protocol/': [
            {
              text: '协议规范',
              items: [
                { text: '概述', link: '/zh/protocol/' },
                { text: '语法规范', link: '/zh/protocol/syntax' },
                { text: '语义规范', link: '/zh/protocol/semantics' }
              ]
            }
          ]
        },

        outline: {
          level: [2, 3],
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

    // Version switcher in navbar
    nav: [
      {
        text: 'v1.0',
        items: [
          { text: 'v1.0 (Current)', link: '/zh/' },
          // Future versions will be added here
          // { text: 'v2.0', link: '/v2.0/zh/' }
        ]
      }
    ],

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

  // Note: Mermaid support temporarily disabled due to dependency issues
  // Will re-enable after fixing vitepress-plugin-mermaid compatibility
});
