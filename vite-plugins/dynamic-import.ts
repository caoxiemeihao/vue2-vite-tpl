import { Plugin } from 'vite'

export function dynamicImport(options: Record<string, unknown>): Plugin {
  return {
    name: '草鞋没号:dynamicImport',
  }
}
