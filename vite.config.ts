
import path from 'path'
import { defineConfig, Plugin } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import pkg from './package.json'
import {
  symlinkIndexHtml,
  styleImport,
} from './vite-plugins'

export default defineConfig({
  plugins: [
    createVuePlugin({
      vueTemplateOptions: {
        // compiler: {},
      },
    }),
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
    styleImport({
      alias: {
        '~': path.join(__dirname, 'node_modules'),
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
      '~': path.join(__dirname, 'node_modules'),
    },
  },
})
