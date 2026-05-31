import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "NS虚幻插件文档",
  description: "NS虚幻插件文档",
  base: '/NS_Doc/',
  outDir: '../wd',
  themeConfig: {
    outline: {
      label: ''
    }
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh',
      description: 'NS虚幻插件文档',
      themeConfig: {
        outline: {
          label: '开始'
        },
        nav: [
          { text: '首页', link: '/' },
          { text: '插件', link: '/plugins/ns-replay' }
        ],
        sidebar: [
          {
            text: '插件目录',
            items: [
              { text: 'NS_Replay', link: '/plugins/ns-replay' },
              { text: 'NS_HttpJson', link: '/plugins/ns-httpjson' },
              { text: 'NS_Encryption', link: '/plugins/ns-encryption' },
              { text: 'NS_BlueprintToText', link: '/plugins/ns-blueprinttotext' },
              { text: 'NS_DS_Commander', link: '/plugins/ns-ds-commander' }
            ]
          }
        ]
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      description: 'NS Unreal Plugins Documentation',
      themeConfig: {
        outline: {
          label: 'Start'
        },
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Plugins', link: '/en/plugins/ns-replay' }
        ],
        sidebar: [
          {
            text: 'Plugin Directory',
            items: [
              { text: 'NS_Replay', link: '/en/plugins/ns-replay' },
              { text: 'NS_HttpJson', link: '/en/plugins/ns-httpjson' },
              { text: 'NS_Encryption', link: '/en/plugins/ns-encryption' },
              { text: 'NS_BlueprintToText', link: '/en/plugins/ns-blueprinttotext' },
              { text: 'NS_DS_Commander', link: '/en/plugins/ns-ds-commander' }
            ]
          }
        ]
      }
    }
  }
})
