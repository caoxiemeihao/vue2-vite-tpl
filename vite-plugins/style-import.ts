import path from 'path'
import { Plugin } from 'vite'
import vtc from 'vue-template-compiler'

/** 参考 npm package: detective-less */
import Walker from 'node-source-walk'
import gonzales from 'gonzales-pe'

export function styleImport(options?: Record<string, unknown>): Plugin {
  const walker = new Walker as any
  const isImportStatement = (node) => {
    if (node.type !== 'atrule') { return false }
    if (!node.content.length || node.content[0].type !== 'atkeyword') { return false }

    const atKeyword = node.content[0]

    if (!atKeyword.content.length) { return false }

    const importKeyword = atKeyword.content[0]

    if (importKeyword.type !== 'ident' || importKeyword.content !== 'import') { return false }

    return true
  }
  const extractDependencies = (importStatementNode) => {
    return importStatementNode.content
      .filter(function (innerNode) {
        return innerNode.type === 'string' || innerNode.type === 'ident'
      })
      .map(function (identifierNode) {
        return identifierNode.content.replace(/["']/g, '')
      })
  }

  return {
    enforce: 'pre',
    name: '草鞋没号:styleLoader',
    transform(code, id) {
      if (!id.endsWith('.vue')) return

      let _code = code

      try {
        const imports = vtc.parseComponent(code).styles.reduce((dependencies, cur) => {
          const ast = (gonzales as any).parse(cur.content, { syntax: cur.lang })
          let deps = dependencies

          walker.walk(ast, (node: any) => {
            if (!isImportStatement(node)) return

            deps = deps.concat(extractDependencies(node))
          })

          return deps
        }, [])

        for (const importPath of imports) {
          if (importPath.startsWith('~')) {
            const node_modules = path.join(process.cwd(), 'node_modules')
            const targetPath = path.join(
              path.relative(path.parse(id).dir, node_modules),
              importPath.slice(1),
            )

            // Replace alias '~' to 'node_modules'
            _code = _code.replace(importPath, targetPath)
          }
        }

        return _code
      } catch (error) {
        throw error
      }
    },
  }
}
