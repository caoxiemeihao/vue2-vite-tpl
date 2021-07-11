import path from 'path'
import fs from 'fs'
import { Plugin } from 'vite'
import vtc from 'vue-template-compiler'
import gonzales from 'gonzales-pe'
import Walker from 'node-source-walk'

export function testPlugin(): Plugin {
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
    name: '草鞋没号:testPlugin',
    enforce: 'pre',
    transform(code, id) {

      /* test style import
      if (id.endsWith('App.vue')) {
        try {
          console.log('****')

          const result = vtc.parseComponent(code)

          const imports = result.styles.reduce((dependencies, cur) => {
            const ast = (gonzales as any).parse(cur.content, { syntax: cur.lang })
            let deps = dependencies

            walker.walk(ast, (node: any) => {
              if (!isImportStatement(node)) return

              deps = deps.concat(extractDependencies(node))
            })

            return deps
          }, [])

          console.log(imports)

        } catch (error) {
          console.log(error)
        }
        console.log('----')
      }
      */

      return code
    },
  }
}
