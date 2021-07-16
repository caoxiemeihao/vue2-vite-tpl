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
            if ((node as any).callee.name !== 'require') return

            // console.log(filterAncestors(ancestors).map(n => n.type))
            callExpressions.push(filterAncestors(ancestors))
          },
        })

        transformRequire(callExpressions)

        // fs.writeFileSync(path.join(__dirname, 'tmp/0.require.json'), JSON.stringify(ast, null, 2))
      } catch (error) {
        throw error
      }
    },
  }
}

function filterAncestors(ancestors: acorn.Node[]) {
  for (const [idx, node] of ancestors.entries()) {
    if (['VariableDeclaration', 'CallExpression'].includes(node.type)) {
      return ancestors.slice(idx)
    }
  }
  return []
}

/**
 * _RI: RequireIdentifier
 * _R: Require
 */
function transformRequire(callExpressions: acorn.Node[][]) {
  for (const callExpression of callExpressions) {
    try {
      const firstNode = callExpression[0]
      const transformed = {
        Statement: {
          Identifier: null,
          CallExpression: null,
        },
        ObjectExpression: null,
        ArrayExpression: null,
      }

      if (firstNode.type === 'VariableDeclaration') {
        // require 的 VariableDeclaration 只会有一项 VariableDeclarator
        const VariableDeclarator = (firstNode as any).declarations[0]
        // require 成员
        const requireIdentifier = VariableDeclarator.id
        // require 体
        const CallExpression = VariableDeclarator.init

        // require 成员处理
        if (requireIdentifier.type === 'Identifier') {
          transformed.Statement.Identifier = transformIdentifier(requireIdentifier)
        } else if (requireIdentifier.type === 'ObjectPattern') {
          transformed.Statement.Identifier = transformIObjectPattern(requireIdentifier)
        }

        // require 体处理
        if (CallExpression.type === 'CallExpression') {
          transformed.Statement.CallExpression = transformCallExpression(CallExpression)
        } else if (CallExpression.type === 'MemberExpression') {
          transformed.Statement.CallExpression = transformMemberExpression(CallExpression)
        } else if (CallExpression.type === 'ObjectExpression') {
          const requires = []
          for (const property of CallExpression.properties) {
            if (property.value.type === 'CallExpression') {
              requires.push({
                Property: null, // property.value,
                CallExpression: transformCallExpression(property.value)
              })
            } else if (property.value.type === 'MemberExpression') {
              requires.push({
                Property: null, // property.value,
                CallExpression: transformMemberExpression(property.value),
              })
            }
          }
          transformed.ObjectExpression = requires
        } else if (CallExpression.type === 'ArrayExpression') {
          const requires = []
          for (const element of CallExpression.elements) {
            if (element.type === 'CallExpression') {
              requires.push({
                Index: null, // element,
                CallExpression: transformCallExpression(element),
              })
            } else if (element.type === 'MemberExpression') {
              requires.push({
                Index: null, // element,
                CallExpression: transformMemberExpression(element),
              })
            }
          }
          transformed.ArrayExpression = requires
        }

      } else if (firstNode.type === 'CallExpression') {
        transformed.Statement.CallExpression = transformCallExpression(firstNode)
      }

      console.log(transformed)
    } catch (error) {
      throw error
    }
  }
}

/**
 * const acorn
 */
function transformIdentifier(node: acorn.Node) {
  return {
    type: 'RequireIdentifier',
    // node,
    name: (node as any).name,
  }
}

/**
 * const { ancestor, simple }
 */
function transformIObjectPattern(node: acorn.Node) {
  return {
    type: 'RequireIdentifier',
    // node,
    names: (node as any).properties.map(property => property.key.name),
  }
}

/**
 * require('acorn').parse
 * @todo 只考虑常量 require 参数，不考虑拼接、模板字符串 21-07-15
 */
function transformMemberExpression(node: acorn.Node) {
  return {
    type: 'Require',
    // node,
    property: (node as any).property.name,
    require: (node as any).object.arguments[0].value,
  }
}

/**
 * require('acorn-walk')
 * @todo 只考虑常量 require 参数，不考虑拼接、模板字符串 21-07-15
 */
function transformCallExpression(node: acorn.Node) {
  return {
    type: 'Require',
    // node,
    require: (node as any).arguments[0].value,
  }
}

