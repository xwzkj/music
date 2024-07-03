const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g
const DRIVE_LETTER_REGEX = /^[a-z]:/i
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

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
      ],
    }),
    Components({
      resolvers: [
        IconsResolver({
          prefix: 'i',
          enabledCollections: ['ep', 'hugeicons','ant-design'],
        }),
        NaiveUiResolver()
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

    // proxy: {
    //   '/api': {
    //     target: 'https://api.xwzkj.top',
    //     changeOrigin: true,
    //     rewrite: path => path.replace(/^\/api/, '')
    //   }
    // }
  },

  build: {
    reportCompressedSize: false,
    sourcemap: false,
    commonjsOptions: {
      ignoreTryCatch: false
    },
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 2000, // 解决包大小超过500kb的警告
    rollupOptions: {
      output: {
        manualChunks: {},
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 解决文件名中的非法字符
        sanitizeFileName: (name) => {
          const match = DRIVE_LETTER_REGEX.exec(name)
          const driveLetter = match ? match[0] : ''
          return (
            driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '')
          )
        }
      }
    }
  }

})
