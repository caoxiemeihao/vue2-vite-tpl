import path from 'path'
import fs from 'fs'
import { AliasOptions, Plugin, UserConfig } from 'vite'
import acorn from 'acorn'
import walk from 'acorn-walk'
import {
  DEFAULT_EXTENSIONS,
  parsePathQuery,
  detectFileExist,
  convertVueFile,
} from '../utils'

function errorLog(TAG: string, error: Error) {
  console.log()
  console.error('File:', errorLog.id)
  console.error('Error:', TAG, error.message)
  console.log()
}

/** @todo .ts .tsx process */
const extensions = DEFAULT_EXTENSIONS.filter(ext => !['.ts', '.tsx'].includes(ext))
const refConifg: { current: UserConfig } = { current: null }

export function commonjs(options?: Record<string, unknown>): Plugin {

  return {
    name: '草鞋没号:commonjs',
    enforce: 'pre',
    config(config) {
      refConifg.current = config
    },
    transform(code, id) {
      if (/node_modules/.test(id)) return
      if (!extensions.some(ext => id.endsWith(ext))) return
      if (parsePathQuery(id).query) return
      if (!/(require|exports)/g.test(code)) return

      // if (!id.endsWith('router.js')) return

      // console.log('----', id, '----')
      errorLog.id = id

      try {
        let _code = id.endsWith('.vue') ? convertVueFile(code).script.content : code
        const ast = this.parse(_code)
        const requires: RequireRecord[] = []

        walk.ancestor(ast, {
          CallExpression(node, ancestors: acorn.Node[]) {
            if ((node as any).callee.name !== 'require') return
            requires.push(transformRequire(ancestors/* 需要深拷贝 */.slice(0)))
          },
        })

        // for (const CE of callExpressions) {
        //   console.log(CE.map(ce => ce.type))
        // }

        const imports = transformImport(requires)
        const cjsEsmList = extractCjsEsm(code, imports)
        const importStatements: string[] = []
        const importExpressionStatements: string[] = []
        const importDeconstructs: string[] = []

        for (const item of cjsEsmList.reverse()) {
          const {
            node,
            require,
            importName,
            importNames,
            importOnly,
            importDeconstruct,
            importDefaultDeconstruct,
            importExpression,
            importDefaultExpression,
          } = item
          let middle: string

          if (importName) {
            middle = ''
            importStatements.unshift(importName.code)
          } else if (importNames) {
            middle = ''
            importStatements.unshift(importNames.code)
          } else if (importOnly) {
            middle = ''
            importStatements.unshift(importOnly.code)
          } else if (importDeconstruct) {
            middle = ''
            importStatements.unshift(importDeconstruct.codes[0])
            importDeconstructs.unshift(importDeconstruct.codes[1])
          } else if (importDefaultDeconstruct) {
            middle = ''
            importStatements.unshift(importDefaultDeconstruct.codes[0])
            importDeconstructs.unshift(importDefaultDeconstruct.codes[1])
          } else if (importExpression) {
            middle = importExpression.name['*']
            importExpressionStatements.unshift(importExpression.code)
          } else if (importDefaultExpression) {
            middle = importDefaultExpression.name
            importExpressionStatements.unshift(importDefaultExpression.code)
          }

          if (typeof middle === 'string') {
            let end = node.end
            if (middle === '' && _code[node.end + 1] === '\n') { end += 1 } // 去掉尾部换行
            _code = _code.slice(0, node.start) + middle + _code.slice(end)
          }
        }

        _code = `
/** CommonJs statements */
${importStatements.join('\n')}

/** CommonJs expressions */
${importExpressionStatements.join('\n')}

/** CommonJs deconstructs */
${importDeconstructs.join('\n')}
${_code}
`

        // console.log(_code)
        return _code
      } catch (error) {
        throw error
      }
    },
  }
}

function filterAncestors(ancestors: acorn.Node[]) {
  for (const [idx, node] of ancestors.entries()) {
    // 所有的 require 语句均来自 声明 or 单独语句
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
  ObjectExpression: ObjectExpressionNode | null
  ArrayExpression: ArrayExpressionNode | null
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

function transformRequire(ancestors: acorn.Node[]) {
  const requireRecord: RequireRecord = {
    Statement: {
      VariableDeclarator: null,
      CallExpression: null,
    },
    ObjectExpression: null,
    ArrayExpression: null,
  }
  // console.log(ancestors.map(n => n.type))
  try {
    let parentIndex: number
    for (let len = ancestors.length, x = len - 1; x >= 0; x--) {
      // 反向查找
      if (!['CallExpression', 'MemberExpression'].includes(ancestors[x].type)) {
        parentIndex = x
        break
      }
    }

    const parentNode = ancestors[parentIndex]
    const requireNode = ancestors[parentIndex + 1]

    // An VariableDeclaration statement
    if (parentNode.type === 'VariableDeclarator') {
      requireRecord.Statement = {
        VariableDeclarator: transformVariableDeclarator((parentNode as any).id),
        CallExpression: transformCallExpression(requireNode, ancestors),
      }
    }
    // An ObjectExpression Property 
    else if (parentNode.type === 'Property') {
      requireRecord.ObjectExpression = {
        Property: (parentNode as any).key.name,
        CallExpression: transformCallExpression(requireNode, ancestors)
      }
    }
    // An ArrayExpression element
    else if (parentNode.type === 'ArrayExpression') {
      const element = requireNode as any
      requireRecord.ArrayExpression = {
        Index: (parentNode as any).elements.findIndex(elem => elem.start === requireNode.start),
        CallExpression: transformCallExpression(element, ancestors),
      }
    }
    // Just require statement
    else {
      requireRecord.Statement = {
        VariableDeclarator: null,
        CallExpression: transformCallExpression(requireNode, ancestors),
      }
    }

    // console.log(requireRecord)
    return requireRecord
  } catch (error) {
    errorLog('transformRequire]', error)
    throw error
  }
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
function transformCallExpression(CallExpressionOrMemberExpression: acorn.Node, ancestors: acorn.Node[]): CallExpressionNode {
  const node = CallExpressionOrMemberExpression

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

/**
 * @todo import 去重
 */
function transformImport(requires: RequireRecord[]) {
  const statements = requires.filter(
    req => req.Statement.CallExpression
  ) as unknown as { Statement: RequireStatement }[]
  const expressions = requires.filter(
    req => req.ArrayExpression || req.ObjectExpression
  ) as unknown as {
    ObjectExpression: ObjectExpressionNode | null
    ArrayExpression: ArrayExpressionNode | null
  }[]
  let counter = 0
  const imports: ImportRecord[] = []

  for (const statement of statements) {
    try {
      const { VariableDeclarator: VD, CallExpression } = statement.Statement
      const item: ImportRecord = {
        node: CallExpression.node,
        ancestors: CallExpression.ancestors,
        require: CallExpression.require,
      }

      const requireFilename = resolveFilename(refConifg.current.resolve.alias, CallExpression.require)

      if (VD === null) {
        // require('acorn')
        item.importOnly = { code: `import "${requireFilename}"` }
      } else if (VD.name) {
        const property = CallExpression.property
        if (property) {
          if (property === 'default') {
            // const acornDefault = require('acorn').default
            item.importName = {
              name: VD.name,
              code: `import ${VD.name} from "${requireFilename}"`,
            }
          } else {
            if (VD.name === property) {
              // const parse = require('acorn').parse
              item.importNames = {
                names: [property],
                code: `import { ${property} } from "${requireFilename}"`,
              }
            } else {
              // const alias = require('acorn').parse
              item.importName = {
                name: { [property]: VD.name },
                code: `import { ${property} as ${VD.name} } from "${requireFilename}"`,
              }
            }
          }
        } else {
          // const acorn = require('acorn')
          item.importName = {
            name: { '*': VD.name },
            code: `import * as ${VD.name} from "${requireFilename}"`,
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
                `import ${moduleName} from "${requireFilename}"`,
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
                `import { ${property} as ${moduleName} } from "${requireFilename}"`,
                `const { ${VD.names.join(', ')} } = ${moduleName}`,
              ],
            }
          }
        } else {
          // const { ancestor, simple } = require('acorn-walk')
          item.importNames = {
            names: VD.names,
            code: `import { ${VD.names.join(', ')} } from "${requireFilename}"`,
          }
        }
      }

      // console.log(item)
      imports.push(item)
    } catch (error) {
      errorLog('[transformImport.statements]', error)
      throw error
    }
  }

  for (const { ArrayExpression, ObjectExpression } of expressions) {
    try {
      const arrOrObj = ArrayExpression || ObjectExpression
      const { CallExpression } = arrOrObj
      const expType = typeof (arrOrObj as any).Index === 'number' ? 'array' : 'object'
      const item: ImportRecord = {
        node: CallExpression.node,
        ancestors: CallExpression.ancestors,
        require: CallExpression.require,
      }

      const requireFilename = resolveFilename(refConifg.current.resolve.alias, CallExpression.require)

      if (CallExpression.property === 'default') {
        const moduleName = `_MODULE_default___EXPRESSION_${expType}__${counter++}`
        item.importDefaultExpression = {
          name: moduleName,
          code: `import ${moduleName} from "${requireFilename}"`,
        }
      } else {
        // CallExpression.property === other 的情况当做 * as moduleName 处理，省的命名冲突
        const moduleName = `_MODULE_name__EXPRESSION_${expType}__${counter++}`
        item.importExpression = {
          name: { '*': moduleName },
          code: `import * as ${moduleName} from "${requireFilename}"`,
        }
      }

      // console.log(item)
      imports.push(item)
    } catch (error) {
      errorLog('[transformImport.expressions]', error)
      throw error
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

    // console.log(item)
    cjsEsmList.push(item)
  }

  return cjsEsmList
}

// ------------------------------

/** @todo Array typed alias options */
function resolveFilename(alias: AliasOptions, filepath: string) {
  if (Array.isArray(alias)) { return filepath }

  let aliasPath: string
  for (const [a, p] of Object.entries(alias)) {
    if (filepath.startsWith(`${a}/`)) {
      aliasPath = filepath.replace(a, p)
      break
    }
  }

  if (!aliasPath) { return filepath }

  const extension = detectFileExist(aliasPath)

  return extension ? filepath + extension : filepath
}

// ------------------------------
