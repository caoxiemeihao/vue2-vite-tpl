const parse = require('acorn').parse
const { ancestor, simple } = require('acorn-walk')
const acorn = require('acorn')

require('vite')

const dict = {
  news: require('@/views/news').default,
  home: require('@/views/home'),
}

const arr = [
  require('@/views/news').default,
  require('@/views/home'),
]

module.exports = { dict, arr };
