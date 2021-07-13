
import path from 'path'
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import pkg from './package.json'
import {
  symlinkIndexHtml,
  styleImport,
  dynamicImport,
  commonjs,
} from './vite-plugins'
import { testPlugin } from './vite-plugins/test-plugin'

export default defineConfig({
  plugins: [
    createVuePlugin({}),
    // Coyp ’public/index.html‘ to root directory
    symlinkIndexHtml({
      template: path.join(__dirname, 'public/index.html'),
      entry: '/src/main.js',
      templateDate: {
        BASE_URL: '/',
        htmlWebpackPlugin: {
          options: {
            title: pkg.name,
          },
        },
      },
    }),
    styleImport({}),
    dynamicImport({}),
    commonjs({}),
    testPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
})
