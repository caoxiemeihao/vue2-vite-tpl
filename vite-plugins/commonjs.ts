import path from 'path'
import fs from 'fs'
import { Plugin, UserConfig } from 'vite'
import vtc from 'vue-template-compiler'
import { transpileModule, ModuleKind, SyntaxKind } from 'typescript'
import { cjsToEsmTransformer } from 'cjstoesm'

export function commonjs(options?: Record<string, unknown>): Plugin {
  const fileExts = ['.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs']
  const refConifg: { current: UserConfig } = { current: null }

  const parseQuery = (querystring: string): Record<string, string | boolean> => {
    // { vue: true, type: 'template', 'lang.js': true }
    // { vue: true, type: 'style', index: '0', 'lang.less': true }
    // { vue: true, type: 'style', index: '0', scoped: 'true', 'lang.css': tru }

    const [, query] = querystring.split('?')
    try {
      return [...new URLSearchParams(query).entries()].reduce((acc, [k, v]) => (
        { ...acc, [k]: v === '' ? true : v }
      ), {})
    } catch (error) {
      return {
        _error: error,
      }
    }
  }

  const existFile = (filepath: string) => {
    let fileExt = fileExts.find(ext => fs.existsSync(filepath + ext))
    if (!fileExt) {
      const indexFile = fileExts.find(ext => fs.existsSync(path.join(filepath, 'index') + ext))
      if (indexFile) {
        fileExt = `/index${indexFile}`
      }
    }

    return fileExt ?? ''
  }

  return {
    name: '草鞋没号:commonjs',
    enforce: 'pre',
    config(config) {
      refConifg.current = config
    },
    transform(code, id) {
      if (!fileExts.some(ext => id.endsWith(ext))) return
      if (parseQuery(id).type === 'template') return
      if (!/(require|exports)/g.test(code)) return

      try {
        let _code = code

        if (id.endsWith('.vue')) {
          const component = vtc.parseComponent(_code)
          _code = component.script.content
        }

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
                              statement.moduleSpecifier.text += existFile(fullImportPath)
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
