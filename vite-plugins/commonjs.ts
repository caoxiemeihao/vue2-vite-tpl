import path from 'path'
import fs from 'fs'
import * as fs2 from 'fs'
import { Plugin, UserConfig } from 'vite'
import acorn from 'acorn'
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

            const ancestors2 = filterAncestors(ancestors)
            if (!callExpressions.find(ce => ce[0].start === ancestors2[0].start)) {
              callExpressions.push(ancestors2)
            }
          },
        })

        const requires = transformRequire(callExpressions)
        const imports = requireToImport(requires)

        console.log(imports)

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

export interface RequireStatement {
  Identifier: IdentifierNode | null
  CallExpression: CallExpressionNode | null
}

export interface RequireRecord {
  Statement: RequireStatement
  ObjectExpression: ObjectExpressionNode[] | null
  ArrayExpression: ArrayExpression[] | null
}

export interface BaseNode {
  type: string
  node: acorn.Node
}

export interface IdentifierNode extends BaseNode {
  /** const acorn = require('acorn') */
  name?: string
  /** const { ancestor, simple } = require('acorn-walk') */
  names?: string[]
}

export interface CallExpressionNode extends BaseNode {
  require: string
  /** MemberExpression 才有 */
  property?: string
}

export interface ObjectExpressionNode {
  Property: string
  CallExpression: CallExpressionNode
}

export interface ArrayExpression {
  Index: number
  CallExpression: CallExpressionNode
}

// ------------------------------

function transformRequire(callExpressions: acorn.Node[][]) {
  const requires: RequireRecord[] = []

  for (const callExpression of callExpressions) {
    // console.log(callExpression.map(n => n.type))
    try {
      const firstNode = callExpression[0]
      const transformed: RequireRecord = {
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
        transformed.Statement.Identifier = transformIdentifier(requireIdentifier)

        // require 体处理
        if (['CallExpression', 'MemberExpression'].includes(CallExpression.type)) {
          transformed.Statement.CallExpression = transformCallExpression(CallExpression)
        } else if (CallExpression.type === 'ObjectExpression') {
          transformed.ObjectExpression = CallExpression.properties.map(property => ({
            Property: property.key.name,
            CallExpression: transformCallExpression(property.value)
          }))
        } else if (CallExpression.type === 'ArrayExpression') {
          transformed.ArrayExpression = CallExpression.elements.map((element, idx) => ({
            Index: idx,
            CallExpression: transformCallExpression(element),
          }))
        }

      } else if (firstNode.type === 'CallExpression') {
        transformed.Statement.CallExpression = transformCallExpression(firstNode)
      }

      // console.log(transformed)
      requires.push(transformed)
    } catch (error) {
      throw error
    }
  }

  return requires
}

function transformIdentifier(node: acorn.Node): IdentifierNode {
  if (node.type === 'Identifier') {
    /** const acorn */
    return {
      type: node.type,
      node,
      name: (node as any).name,
    }
  } else if (node.type === 'ObjectPattern') {
    /** const { ancestor, simple } */
    return {
      type: node.type,
      node,
      names: (node as any).properties.map(property => property.key.name),
    }
  }
}

/**
 * @todo 只考虑常量 require 参数，不考虑拼接、模板字符串 21-07-15
 */
function transformCallExpression(node: acorn.Node): CallExpressionNode {

  if (node.type === 'CallExpression') {
    /** require('acorn-walk') */
    return {
      type: node.type,
      node,
      require: (node as any).arguments[0].value,
    }
  } else if (node.type === 'MemberExpression') {
    /**
     * require('acorn').parse
     * @todo require('acorn').parse.xxxx.xxxx
     */
    return {
      type: node.type,
      node,
      property: (node as any).property.name,
      require: (node as any).object.arguments[0].value,
    }
  }
}

// ------------------------------

export type RequireExpressionType = 'arrayExpression' | 'objectExpression'

export interface RequireExpression {
  type: RequireExpressionType
  node: acorn.Node
  /** MemberExpression */
  property?: string
  require: string
}

export interface RequireDeclarator {
  type: 'declarator'
  identifier: {
    node?: acorn.Node
    name?: string
    names?: string[]
  }
  require: {
    node: acorn.Node
    name: string
    /** MemberExpression */
    property?: string
  }
}

export type CollectRequireDict = { [k: string]: (RequireExpression | RequireDeclarator)[] }

function collectRequire(requires: RequireRecord[]) {
  const requireDict: CollectRequireDict = {}

  for (const require of requires) {
    if (require.ArrayExpression) {
      for (const element of require.ArrayExpression) {
        const require = element.CallExpression
        const item: RequireExpression = {
          type: 'arrayExpression',
          node: require.node,
          property: require.property,
          require: require.require,
        }
        requireDict[require.require] = requireDict[require.require]
          ? requireDict[require.require].concat(item)
          : [item]
      }
    } else if (require.ObjectExpression) {
      for (const property of require.ObjectExpression) {
        const require = property.CallExpression
        const item: RequireExpression = {
          type: 'objectExpression',
          node: require.node,
          property: require.property,
          require: require.require,
        }
        requireDict[require.require] = requireDict[require.require]
          ? requireDict[require.require].concat(item)
          : [item]
      }
    } else {
      const identifier = require.Statement.Identifier
      const callExpression = require.Statement.CallExpression
      const item: RequireDeclarator = {
        type: 'declarator',
        identifier: {
          node: identifier && identifier.node,
          name: identifier && identifier.name,
          names: identifier && identifier.names,
        },
        require: {
          node: callExpression.node,
          name: callExpression.require,
          property: callExpression.property,
        },
      }
      requireDict[callExpression.require] = requireDict[callExpression.require]
        ? requireDict[callExpression.require].concat(item)
        : [item]
    }
  }

  // for (const [k, v] of Object.entries(requireDict)) {
  //   console.log(k, v)
  // }

  return requireDict
}

// ------------------------------

export interface ImportRecord {
  /**
   * const acornDefault = require('acorn').default
   * const alias = require('acorn').parse
   * const acorn = require('acorn')
   */
  importName?: {
    name: string | Record</* (name as alias | * as name) */string, string>
    code: string
  }
  /**
   * const parse = require('acorn').parse
   * const { ancestor, simple } = require('acorn-walk')
   */
  importNames?: {
    names: string[]
    code: string
  }
  /** require('acorn') */
  importOnly?: {}
  /** const { ancestor, simple } = require('acorn-walk').other */
  importDeconstruct?: {
    name: string
    deconstruct: string[]
    codes: string[]
  }
  /** const { ancestor, simple } = require('acorn-walk').default */
  importDefaultDeconstruct?: {
    /** 自定义模块名 */
    name: string
    deconstruct: string[]
    codes: string[]
  }
  /** For ArrayExpression, ObjectExpression statement. */
  importExpression?: {
    /** 自定义模块名 */
    name: string
    code: string
  }
  importDefaultExpression?: {
    /** 自定义模块名 */
    name: string
    code: string
  }
  require: string
}

function requireToImport(requires: RequireRecord[]) {
  const statements = requires.filter(
    req => req.Statement.CallExpression
  ) as unknown as { Statement: RequireStatement }[]
  const expressions = requires.filter(
    req => req.ArrayExpression || req.ObjectExpression
  ) as unknown as {
    ObjectExpression: ObjectExpressionNode[] | null
    ArrayExpression: ArrayExpression[] | null
  }[]
  let counter = 0
  const imports: ImportRecord[] = []

  for (const statement of statements) {
    const { Identifier, CallExpression } = statement.Statement
    const item: ImportRecord = { require: CallExpression.require }

    if (Identifier === null) {
      // require('acorn')
      item.importOnly = {}
    } else if (Identifier.name) {
      const property = CallExpression.property
      if (property) {
        if (property === 'default') {
          // const acornDefault = require('acorn').default
          item.importName = {
            name: Identifier.name,
            code: `import ${Identifier.name} from "${CallExpression.require}";`,
          }
        } else {
          if (Identifier.name === property) {
            // const parse = require('acorn').parse
            item.importNames = {
              names: [property],
              code: `import { ${property} } from "${CallExpression.require}";`,
            }
          } else {
            // const alias = require('acorn').parse
            item.importName = {
              name: { [property]: Identifier.name },
              code: `import { ${property} as ${Identifier.name} } from "${CallExpression.require}";`,
            }
          }
        }
      } else {
        // const acorn = require('acorn')
        item.importName = {
          name: { '*': Identifier.name },
          code: `import * as ${Identifier.name} from "${CallExpression.require}";`,
        }
      }
    } else if (Identifier.names) {
      const property = CallExpression.property
      if (property) {
        if (property === 'default') {
          // const { ancestor, simple } = require('acorn-walk').default
          const moduleName = `__module_default_${counter++}`
          item.importDefaultDeconstruct = {
            name: moduleName,
            deconstruct: Identifier.names,
            codes: [
              `import ${moduleName} from "${CallExpression.require}";`,
              `const { ${Identifier.names.join(', ')} } = ${moduleName};`,
            ],
          }
        } else {
          // const { ancestor, simple } = require('acorn-walk').other
          const moduleName = `__module_name_${counter++}` // 防止命名冲突
          item.importDeconstruct = {
            name: moduleName,
            deconstruct: Identifier.names,
            codes: [
              `import { ${property} as ${moduleName} } from "${CallExpression.require}";`,
              `const { ${Identifier.names.join(', ')} } = ${moduleName};`,
            ],
          }
        }
      } else {
        // const { ancestor, simple } = require('acorn-walk')
        item.importNames = {
          names: Identifier.names,
          code: `import { ${Identifier.names.join(', ')} } from "${CallExpression.require}";`,
        }
      }
    }

    // console.log(item)
    imports.push(item)
  }

  for (const { ArrayExpression, ObjectExpression } of expressions) {
    for (const { CallExpression } of ArrayExpression || ObjectExpression) {
      const item: ImportRecord = { require: CallExpression.require }

      if (CallExpression.property === 'default') {
        const moduleName = `__module_default__expression__${counter++}`
        item.importDefaultExpression = {
          name: moduleName,
          code: `import ${moduleName} from "${CallExpression.require}";`,
        }
      } else {
        // CallExpression.property === other 的情况当做 * as moduleName 处理，省的命名冲突
        const moduleName = `__module_name__expression__${counter++}`
        item.importExpression = {
          name: moduleName,
          code: `import * as ${moduleName} from "${CallExpression.require}";`,
        }
      }

      // console.log(item)
      imports.push(item)
    }
  }

  return imports
}

// ------------------------------
