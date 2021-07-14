import path from 'path'
import { Plugin, UserConfig } from 'vite'
import walk from 'acorn-walk'
import {
  DEFAULT_EXTENSIONS,
  parsePathQuery,
  detectFileExist,
  convertVueFile,
} from './utils'

export function dynamicImport(options?: Record<string, unknown>): Plugin {
  const extensions = DEFAULT_EXTENSIONS
  const refConifg: { current: UserConfig } = { current: null }

  return {
    name: '草鞋没号:dynamicImport',
    // enforce: 'pre',
    config(config) {
      refConifg.current = config
    },
    transform(code, id) {
      if (/node_modules/.test(id)) return
      if (!extensions.some(ext => id.endsWith(ext))) return
      if (parsePathQuery(id).type === 'template') return
      if (!/import[\n\s]*\(/g.test(code)) return

      try {
        let _code = id.endsWith('.vue') ? convertVueFile(code).script.content : code
        const ast = this.parse(code)
        const importExpressions: acorn.Node[] = []

        walk.simple(ast, {
          ImportExpression(node) {
            importExpressions.push(node)
          },
        })

        for (const expression of importExpressions.reverse()) {
          const start = expression.source.start
          const end = expression.source.end
          let importText = _code.slice(start, end)
          const alias = refConifg.current?.resolve?.alias ?? {}
          const commaPerfix = /^['"`].*/.test(importText)

          if (commaPerfix) { importText = importText.slice(1) }

          for (const [alia, aliaPath] of Object.entries(alias)) {
            if (importText.startsWith(`${alia}/`)) {
              const relativePathReg = /^(\w+)\/?/
              const regTmp = relativePathReg.exec(importText.replace(`${alia}/`, ''))
              if (!regTmp) continue

              const relativeImportPath = path
                .relative(path.parse(id).dir, path.join(aliaPath, regTmp[1]))
                .replace(regTmp[1], '') || './'
              const fullImportPath = importText.replace(`${alia}/`, relativeImportPath)

              _code
                = _code.slice(0, commaPerfix ? start + 1 : start) // start
                + fullImportPath + '.vue'
                + _code.slice(end) // end
            }
          }

        }
        return _code
      } catch (error) {
        throw error
      }
    },
  }
}
