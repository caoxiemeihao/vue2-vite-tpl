import path from 'path'
import { Plugin } from 'vite'
import { parse } from '@vue/compiler-sfc'
import detective from 'detective-less'

export function styleImport(opts: {
  alias: Record<string, string | ((args: Record<string, any>) => string)>,
}): Plugin {
  const { alias } = opts

  return {
    enforce: 'pre',
    name: '草鞋没号:styleLoader',
    transform(code, id) {
      if (!id.endsWith('.vue')) return

      let _code = code

      try {
        const pathDict = parse(code).descriptor.styles.reduce((dict, cur) => {
          for (const importPath of detective(cur.content)) {
            if (importPath.startsWith('~')) {
              const node_modules = path.join(process.cwd(), 'node_modules')
              dict[importPath] = path.join(
                path.relative(path.parse(id).dir, node_modules),
                importPath.slice(1),
              )
            }
          }
          return dict
        }, {} as Record<string, string>)

        for (const [originPath, targetPath] of Object.entries(pathDict)) {
          // Replace alias '~' to 'node_modules'
          _code = _code.replace(originPath, targetPath)
        }

        return _code
      } catch (error) {
        throw error
      }
    },
  }
}
