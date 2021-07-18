import path from 'path'
import fs from 'fs'
import { Plugin, UserConfig } from 'vite'
import walk from 'acorn-walk'
import {
  DEFAULT_EXTENSIONS,
  parsePathQuery,
  detectFileExist,
  convertVueFile,
} from './utils'

export function commonjs(options?: Record<string, unknown>): Plugin {
  const extensions = DEFAULT_EXTENSIONS
  const refConifg: { current: UserConfig } = { current: null }

  return {
    name: '草鞋没号:commonjs',
    enforce: 'pre',
    config(config) {
      refConifg.current = config
    },
    transform(code, id) {
      if (/node_modules/.test(id)) return
      if (!extensions.some(ext => id.endsWith(ext))) return
      if (parsePathQuery(id).type === 'template') return
      if (!/(require|exports)/g.test(code)) return

      if (!id.endsWith('require.js')) return

      try {
        let _code = id.endsWith('.vue') ? convertVueFile(code).script.content : code
        const ast = this.parse(_code)
        const callExpressions: acorn.Node[][] = []

        walk.ancestor(ast, {
          CallExpression(node, ancestors: acorn.Node[]) {
            if (node.callee.name !== 'require') return

            console.log(ancestors.map(n => n.type))
            // callExpressions.push(filterAncestors(ancestors))
          },
        })

        for (const call of callExpressions) {
          if (call[0].type === 'VariableDeclaration') {
            createVariableDeclaration(call[0])
          } else if (call[0].type === 'MemberExpression') {
            createMemberExpression(call[0])
          } else if (call[0].type === 'CallExpression') {
            createCallExpression(call[0])
          }
        }

        // fs.writeFileSync(path.join(__dirname, 'tmp/0.require.json'), JSON.stringify(ast, null, 2))
      } catch (error) {
        throw error
      }
    },
  }
}

function filterAncestors(ancestors: acorn.Node[]) {
  /*
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
  */

  /*
    [
      'VariableDeclaration',
      'VariableDeclarator',
      'MemberExpression',
      'CallExpression'
    ]
    [ 'VariableDeclaration', 'VariableDeclarator', 'CallExpression' ]
    [ 'VariableDeclaration', 'VariableDeclarator', 'CallExpression' ]
    [ 'CallExpression' ]
    [
      'VariableDeclaration',
      'VariableDeclarator',
      'ObjectExpression',
      'Property',
      'MemberExpression',
      'CallExpression'
    ]
    [
      'VariableDeclaration',
      'VariableDeclarator',
      'ObjectExpression',
      'Property',
      'CallExpression'
    ]
    [
      'VariableDeclaration',
      'VariableDeclarator',
      'ArrayExpression',
      'MemberExpression',
      'CallExpression'
    ]
    [
      'VariableDeclaration',
      'VariableDeclarator',
      'ArrayExpression',
      'CallExpression'
    ]
  */


  const accumulate: acorn.Node[] = []

  for (const [idx, node] of ancestors.reverse().entries()) {
    if (idx === 0) { // CallExpression
      accumulate.push(node)
      continue
    }

    const lastNode = accumulate[idx - 1]
    if (!lastNode) break

    if (
      lastNode.type === 'CallExpression' &&
      ['MemberExpression', 'VariableDeclarator', 'Property'].includes(node.type)
    ) {
      accumulate.push(node)
    } else if (
      lastNode.type === 'MemberExpression' &&
      node.type === 'VariableDeclarator'
    ) {
      accumulate.push(node)
    } else if (
      lastNode.type === 'VariableDeclarator' &&
      node.type === 'VariableDeclaration'
    ) {
      accumulate.push(node)
    } else if (
      lastNode.type === 'Property' &&
      node.type === 'ObjectExpression'
    ) {
      accumulate.push(node)
    }
  }

  return accumulate.reverse()
}

function createVariableDeclaration(node: acorn.Node) {
  // require 的 VariableDeclaration 只会有一项 VariableDeclarator
  const declaration = node.declarations[node.declarations.length - 1]
  // require 等号前声明
  const declareNode = declaration.id
  // require 体
  const requireCallExpression = declaration.init

  let ImportSpecifier: string | string[]
  // @TODO: 暂不处理动态路径 - 21-07-15
  let importPath: string

  if (declareNode.type === 'Identifier') {
    ImportSpecifier = declareNode.name
  } else if (declareNode.type === 'ObjectPattern') {
    ImportSpecifier = declareNode
      .properties
      // @TODO: 暂不处理嵌套解构 - 21-07-15
      .filter(prop => prop.type === 'Property')
      .map(prop => prop.key.name)
  }

  if (requireCallExpression.type === 'CallExpression') {
    importPath = requireCallExpression.arguments[0].value // require 只会有一个路径参数
  } else if (requireCallExpression.type === 'MemberExpression') {
    if (typeof ImportSpecifier === 'string') {
      ImportSpecifier = `{ ${requireCallExpression.property.name} }`
    } else if (Array.isArray(ImportSpecifier)) {
      ImportSpecifier = `{ ${requireCallExpression.property.name}: { ${ImportSpecifier.join(', ')} } }`
    }

    importPath = requireCallExpression.object.arguments[0].value // require 只会有一个路径参数
  }

  if (Array.isArray(ImportSpecifier)) {
    ImportSpecifier = `{ ${ImportSpecifier.join(', ')} }`
  }

  return {
    ImportSpecifier,
    importPath,
  }
}

function createMemberExpression(node: acorn.Node) {
  const requireCallExpression = node.object
  const property = node.property.name
  const importPath = requireCallExpression.arguments[0].value // require 只会有一个路径参数

  return {
    property,
    importPath,
  }
}

createMemberExpression.processor = function () {

}

function createCallExpression(node: acorn.Node) {

}

createCallExpression.processor = function () {

}

/**
 * @todo require('paht') -> import 'path' -> import * as mod from 'path'
 */
