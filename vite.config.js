import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g
const DRIVE_LETTER_REGEX = /^[a-z]:/i

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        }
      ],
      resolvers: [
        ElementPlusResolver(),
      ],
    }),
    Components({
      resolvers: [
        IconsResolver({
          prefix: 'i',
          enabledCollections: ['ep', 'hugeicons'],
        }),
        ElementPlusResolver(),
        NaiveUiResolver(),
      ],
    }),

    Icons({
      compiler: 'vue3',
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, './src')
    }
  },
  server: {

    port: 80,
    host: '0.0.0.0',

    proxy: {
      '/api': {
        target: 'https://api.xwzkj.top',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'scripts/[name]-[hash].js', // 入口文件命名规则
        chunkFileNames: 'scripts/[name]-[hash].js', // 块文件命名规则
        assetFileNames: 'assets/[name]-[hash].[ext]', // 资源文件命名规则

        // TODO: 处理GitHub Pages 部署 _plugin-vue_export-helper.js 404
        // https://github.com/rollup/rollup/blob/master/src/utils/sanitizeFileName.ts
        sanitizeFileName(name) {
          const match = DRIVE_LETTER_REGEX.exec(name)
          const driveLetter = match ? match[0] : ''
          // A `:` is only allowed as part of a windows drive letter (ex: C:\foo)
          // Otherwise, avoid them because they can refer to NTFS alternate data streams.
          return driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '')
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const match = id.toString().match(/\/node_modules\/(?!.pnpm)(?<moduleName>[^\/]*)\//);
            return match && match.groups ? match.groups.moduleName : 'vendor';
          }
        }
        // manualChunks(id) {
        //   if (id.includes('node_modules')) {
        //     return id.toString().split('node_modules/')[1].split('/')[0].toString()
        //   }
        // }
      }
    }
  }



})
