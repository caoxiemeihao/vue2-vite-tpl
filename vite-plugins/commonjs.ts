import path from 'path'
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
              // filter duplicate
              callExpressions.push(ancestors2)
            }
          },
        })

        const requires = transformRequire(callExpressions)
        const imports = transformImport(requires)
        const tmp = extractCjsEsm(code, imports)

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
  VariableDeclarator: VariableDeclaratorNode | null
  CallExpression: CallExpressionNode | null
}

export interface RequireRecord {
  Statement: RequireStatement
  ObjectExpression: ObjectExpressionNode[] | null
  ArrayExpression: ArrayExpressionNode[] | null
}

export interface BaseNode {
  type: string
  node: acorn.Node
}

export interface VariableDeclaratorNode extends BaseNode {
  /** const acorn = require('acorn') */
  name?: string
  /** const { ancestor, simple } = require('acorn-walk') */
  names?: string[]
}

export interface CallExpressionNode extends BaseNode {
  ancestors: acorn.Node[]
  require: string
  /** MemberExpression 才有 */
  property?: string
}

export interface ObjectExpressionNode {
  Property: string
  CallExpression: CallExpressionNode
}

export interface ArrayExpressionNode {
  Index: number
  CallExpression: CallExpressionNode
}

// ------------------------------

function transformRequire(callExpressions: acorn.Node[][]) {
  const requires: RequireRecord[] = []

  for (const ancestors of callExpressions) {
    // console.log(callExpression.map(n => n.type))
    try {
      const firstNode = ancestors[0]
      const transformed: RequireRecord = {
        Statement: {
          VariableDeclarator: null,
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
        transformed.Statement.VariableDeclarator = transformVariableDeclarator(requireIdentifier)

        // require 体处理
        if (['CallExpression', 'MemberExpression'].includes(CallExpression.type)) {
          transformed.Statement.CallExpression = transformCallExpression(CallExpression, ancestors)
        } else if (CallExpression.type === 'ObjectExpression') {
          transformed.ObjectExpression = CallExpression.properties.map(property => ({
            Property: property.key.name,
            CallExpression: transformCallExpression(property.value, ancestors)
          }))
        } else if (CallExpression.type === 'ArrayExpression') {
          transformed.ArrayExpression = CallExpression.elements.map((element, idx) => ({
            Index: idx,
            CallExpression: transformCallExpression(element, ancestors),
          }))
        }

      } else if (firstNode.type === 'CallExpression') {
        transformed.Statement.CallExpression = transformCallExpression(firstNode, ancestors)
      }

      // console.log(transformed)
      requires.push(transformed)
    } catch (error) {
      throw error
    }
  }

  return requires
}

function transformVariableDeclarator(node: acorn.Node): VariableDeclaratorNode {
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
function transformCallExpression(node: acorn.Node, ancestors: acorn.Node[]): CallExpressionNode {

  if (node.type === 'CallExpression') {
    /** require('acorn-walk') */
    return {
      type: node.type,
      node,
      ancestors,
      require: (node as any).arguments[0].value, // require 只有一个有效入参
    }
  } else if (node.type === 'MemberExpression') {
    /**
     * require('acorn').parse
     * @todo require('acorn').parse.xxxx.xxxx
     */
    return {
      type: node.type,
      node,
      ancestors,
      property: (node as any).property.name,
      require: (node as any).object.arguments[0].value, // require 只有一个有效入参
    }
  }
}

// ------------------------------

export type ImportName = string | Record</* (name as alias) */string, string> | Record</* (* as name) */'*', string>

export interface ImportRecord {
  /**
   * const acornDefault = require('acorn').default
   * const alias = require('acorn').parse
   * const acorn = require('acorn')
   */
  importName?: {
    name: ImportName
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
  importOnly?: {
    code: string
  }
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
    name: Record<'*', string>
    code: string
  }
  importDefaultExpression?: {
    /** 自定义模块名 */
    name: string
    code: string
  }

  /** 对象、数组会公用同一个 ancestors 导致判断不准 */
  node: acorn.Node
  ancestors: acorn.Node[]
  require: string
}

function transformImport(requires: RequireRecord[]) {
  const statements = requires.filter(
    req => req.Statement.CallExpression
  ) as unknown as { Statement: RequireStatement }[]
  const expressions = requires.filter(
    req => req.ArrayExpression || req.ObjectExpression
  ) as unknown as {
    ObjectExpression: ObjectExpressionNode[] | null
    ArrayExpression: ArrayExpressionNode[] | null
  }[]
  let counter = 0
  const imports: ImportRecord[] = []

  for (const statement of statements) {
    const { VariableDeclarator: VD, CallExpression } = statement.Statement
    const item: ImportRecord = {
      node: CallExpression.node,
      ancestors: CallExpression.ancestors,
      require: CallExpression.require,
    }

    if (VD === null) {
      // require('acorn')
      item.importOnly = { code: `import "${CallExpression.require}"` }
    } else if (VD.name) {
      const property = CallExpression.property
      if (property) {
        if (property === 'default') {
          // const acornDefault = require('acorn').default
          item.importName = {
            name: VD.name,
            code: `import ${VD.name} from "${CallExpression.require}"`,
          }
        } else {
          if (VD.name === property) {
            // const parse = require('acorn').parse
            item.importNames = {
              names: [property],
              code: `import { ${property} } from "${CallExpression.require}"`,
            }
          } else {
            // const alias = require('acorn').parse
            item.importName = {
              name: { [property]: VD.name },
              code: `import { ${property} as ${VD.name} } from "${CallExpression.require}"`,
            }
          }
        }
      } else {
        // const acorn = require('acorn')
        item.importName = {
          name: { '*': VD.name },
          code: `import * as ${VD.name} from "${CallExpression.require}"`,
        }
      }
    } else if (VD.names) {
      const property = CallExpression.property
      if (property) {
        if (property === 'default') {
          // const { ancestor, simple } = require('acorn-walk').default
          const moduleName = `_MODULE_default__${counter++}`
          item.importDefaultDeconstruct = {
            name: moduleName,
            deconstruct: VD.names,
            codes: [
              `import ${moduleName} from "${CallExpression.require}"`,
              `const { ${VD.names.join(', ')} } = ${moduleName}`,
            ],
          }
        } else {
          // const { ancestor, simple } = require('acorn-walk').other
          const moduleName = `_MODULE_name__${counter++}` // 防止命名冲突
          item.importDeconstruct = {
            name: moduleName,
            deconstruct: VD.names,
            codes: [
              `import { ${property} as ${moduleName} } from "${CallExpression.require}"`,
              `const { ${VD.names.join(', ')} } = ${moduleName}`,
            ],
          }
        }
      } else {
        // const { ancestor, simple } = require('acorn-walk')
        item.importNames = {
          names: VD.names,
          code: `import { ${VD.names.join(', ')} } from "${CallExpression.require}"`,
        }
      }
    }

    // console.log(item)
    imports.push(item)
  }

  for (const { ArrayExpression, ObjectExpression } of expressions) {
    for (const arrOrObj of ArrayExpression || ObjectExpression) {
      const { CallExpression } = arrOrObj
      const expType = typeof (arrOrObj as any).Index === 'number' ? 'array' : 'object'
      const item: ImportRecord = {
        node: CallExpression.node,
        ancestors: CallExpression.ancestors,
        require: CallExpression.require,
      }

      if (CallExpression.property === 'default') {
        const moduleName = `_MODULE_default___EXPRESSION_${expType}__${counter++}`
        item.importDefaultExpression = {
          name: moduleName,
          code: `import ${moduleName} from "${CallExpression.require}"`,
        }
      } else {
        // CallExpression.property === other 的情况当做 * as moduleName 处理，省的命名冲突
        const moduleName = `_MODULE_name__EXPRESSION_${expType}__${counter++}`
        item.importExpression = {
          name: { '*': moduleName },
          code: `import * as ${moduleName} from "${CallExpression.require}"`,
        }
      }

      // console.log(item)
      imports.push(item)
    }
  }

  return imports
}

// ------------------------------

export interface CjsEsmRecord {
  node: acorn.Node
  require: string
  cjs: {
    code: string
  }
  importName?: ImportRecord['importName']
  importNames?: ImportRecord['importNames']
  importOnly?: ImportRecord['importOnly']
  importDeconstruct?: ImportRecord['importDeconstruct']
  importDefaultDeconstruct?: ImportRecord['importDefaultDeconstruct']
  importExpression?: ImportRecord['importExpression']
  importDefaultExpression?: ImportRecord['importDefaultExpression']
}

function extractCjsEsm(code: string, imports: ImportRecord[]) {
  const cjsEsmList: CjsEsmRecord[] = []

  for (const impt of imports) {
    const {
      node,
      ancestors,
      require,
      importName,
      importNames,
      importOnly,
      importDeconstruct,
      importDefaultDeconstruct,
      importExpression,
      importDefaultExpression,
    } = impt
    let item: CjsEsmRecord

    if ([
      importName,
      importNames,
      importDeconstruct,
      importDefaultDeconstruct,
    ].some(Boolean)) {
      const parent = ancestors[ancestors.findIndex(an => an.type === 'VariableDeclaration')]
      item = {
        node: parent,
        require,
        cjs: { code: code.slice(parent.start, parent.end) },
      }
      if (importName) { item.importName = importName }
      if (importNames) { item.importNames = importNames }
      if (importDeconstruct) { item.importDeconstruct = importDeconstruct }
      if (importDefaultDeconstruct) { item.importDefaultDeconstruct = importDefaultDeconstruct }
    } else if ([importExpression, importDefaultExpression].some(Boolean)) {
      if (importDefaultExpression) {
        item = {
          node,
          require,
          cjs: { code: code.slice(node.start, node.end) },
          importDefaultExpression,
        }
      } else {
        let _node = node.type === 'MemberExpression' ? (node as any).object : node
        item = {
          node: _node,
          require,
          cjs: { code: code.slice(_node.start, _node.end) },
          importExpression,
        }
      }
    } else if (importOnly) {
      item = {
        node,
        require,
        cjs: { code: code.slice(node.start, node.end) },
        importOnly,
      }
    }

    console.log(item)
    cjsEsmList.push(item)
  }

  return cjsEsmList
}

// ------------------------------
