import path from 'path'
import { Plugin, UserConfig } from 'vite'
import { transpileModule, ModuleKind, SyntaxKind } from 'typescript'
import { cjsToEsmTransformer } from 'cjstoesm'
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

      try {
        let _code = id.endsWith('.vue') ? convertVueFile(code).script.content : code

        const { outputText } = transpileModule(_code, {
          transformers: {
            before: [
              cjsToEsmTransformer(),
              function (context) {
                return {
                  transformSourceFile(node) {
                    for (const statement of node.statements) {
                      if (statement.kind === SyntaxKind.ImportDeclaration) {
                        const alias = refConifg.current?.resolve?.alias ?? {}
                        const importText: string = statement.moduleSpecifier.text
                        Object.entries(alias).forEach(([a, p]) => {
                          if (importText.startsWith(`${a}/`)) {
                            const fullImportPath = importText.replace(a, p)
                            if (!path.parse(fullImportPath).ext) {
                              // Assemble file suffix
                              statement.moduleSpecifier.text += detectFileExist(fullImportPath)
                            }
                          }
                        })
                      }
                    }
                    return node
                  },
                  transformBundle(node) {
                    return node
                  }
                }
              },
            ],
          },
          compilerOptions: {
            module: ModuleKind.ES2020,
          },
        })

        return outputText
      } catch (error) {
        throw error
      }
    },
  }
}
