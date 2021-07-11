import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import _ from 'lodash'
import pkg from './package.json'

// The first step coyp ’public/index.html‘ to root directory
copyIndexHtml()

export default defineConfig({
  plugins: [
    createVuePlugin(),
  ],
})

function copyIndexHtml() {
  let indexHtml = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8')
  const compiled = _.template(indexHtml, { interpolate: /<%=([\s\S]+?)%>/g })
  const date = new Date
  const hms = date
    .toLocaleTimeString()
    .split(' ')[0]
    .split(':')
    .join('-')
  const ymd = date
    .toLocaleDateString()
    .split('/')
    .reverse()
    .join('-')

  indexHtml = compiled({
    BASE_URL: '/',
    htmlWebpackPlugin: {
      options: {
        title: pkg.name,
      },
    }
  })

  indexHtml = indexHtml.split('\n')
    .map(line => line.includes('</body>')
      ? `    <script type="module" src="/src/main.js">${ymd}|${hms}</script>
${line}`
      : line
    )
    .join('\n')

  fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml)

  console.log('[vite.config.ts] public/index.html has copyed.')
}