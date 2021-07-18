// --------------------------------------------------------------------

---- /Users/atom/Desktop/npm-test/vue2-vite-tpl/src/router.js ----
[
  'Program',
  'ExportNamedDeclaration',
  'VariableDeclaration',
  'VariableDeclarator',
  'ArrayExpression',
  'ObjectExpression',
  'Property',
  'CallExpression'
]
[
  'Program',
  'ExportNamedDeclaration',
  'VariableDeclaration',
  'VariableDeclarator',
  'ArrayExpression',
  'ObjectExpression',
  'Property',
  'MemberExpression',
  'CallExpression'
]
---- /Users/atom/Desktop/npm-test/vue2-vite-tpl/src/require.js ----
[
  'Program',
  'VariableDeclaration',
  'VariableDeclarator',
  'MemberExpression',
  'CallExpression'
]
[
  'Program',
  'VariableDeclaration',
  'VariableDeclarator',
  'CallExpression'
]
[
  'Program',
  'VariableDeclaration',
  'VariableDeclarator',
  'CallExpression'
]
[
  'Program',
  'VariableDeclaration',
  'VariableDeclarator',
  'MemberExpression',
  'CallExpression'
]
[ 'Program', 'ExpressionStatement', 'CallExpression' ]
[
  'Program',
  'VariableDeclaration',
  'VariableDeclarator',
  'ObjectExpression',
  'Property',
  'MemberExpression',
  'CallExpression'
]
[
  'Program',
  'VariableDeclaration',
  'VariableDeclarator',
  'ObjectExpression',
  'Property',
  'CallExpression'
]
[
  'Program',
  'VariableDeclaration',
  'VariableDeclarator',
  'ArrayExpression',
  'MemberExpression',
  'CallExpression'
]
[
  'Program',
  'VariableDeclaration',
  'VariableDeclarator',
  'ArrayExpression',
  'CallExpression'
]

// --------------------------------------------------------------------

---- /Users/atom/Desktop/npm-test/vue2-vite-tpl/src/router.js ----
{
  Statement: { VariableDeclarator: null, CallExpression: null },
  ObjectExpression: {
    Property: 'component',
    CallExpression: {
      type: 'CallExpression',
      node: [Node],
      ancestors: [Array],
      require: '@/views/home'
    }
  },
  ArrayExpression: null
}
{
  Statement: { VariableDeclarator: null, CallExpression: null },
  ObjectExpression: {
    Property: 'component',
    CallExpression: {
      type: 'MemberExpression',
      node: [Node],
      ancestors: [Array],
      property: 'default',
      require: '@/views/news.vue'
    }
  },
  ArrayExpression: null
}
---- /Users/atom/Desktop/npm-test/vue2-vite-tpl/src/require.js ----
{
  Statement: {
    VariableDeclarator: { type: 'Identifier', node: [Node], name: 'parse' },
    CallExpression: {
      type: 'MemberExpression',
      node: [Node],
      ancestors: [Array],
      property: 'parse',
      require: 'acorn'
    }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: {
    VariableDeclarator: { type: 'ObjectPattern', node: [Node], names: [Array] },
    CallExpression: {
      type: 'CallExpression',
      node: [Node],
      ancestors: [Array],
      require: 'acorn-walk'
    }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: {
    VariableDeclarator: { type: 'Identifier', node: [Node], name: 'acorn' },
    CallExpression: {
      type: 'CallExpression',
      node: [Node],
      ancestors: [Array],
      require: 'acorn'
    }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: {
    VariableDeclarator: { type: 'Identifier', node: [Node], name: 'home' },
    CallExpression: {
      type: 'MemberExpression',
      node: [Node],
      ancestors: [Array],
      property: 'home',
      require: '@/views/home'
    }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: {
    VariableDeclarator: null,
    CallExpression: {
      type: 'CallExpression',
      node: [Node],
      ancestors: [Array],
      require: 'vite'
    }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: { VariableDeclarator: null, CallExpression: null },
  ObjectExpression: {
    Property: 'news',
    CallExpression: {
      type: 'MemberExpression',
      node: [Node],
      ancestors: [Array],
      property: 'default',
      require: '@/views/news'
    }
  },
  ArrayExpression: null
}
{
  Statement: { VariableDeclarator: null, CallExpression: null },
  ObjectExpression: {
    Property: 'home',
    CallExpression: {
      type: 'CallExpression',
      node: [Node],
      ancestors: [Array],
      require: '@/views/home'
    }
  },
  ArrayExpression: null
}
{
  Statement: { VariableDeclarator: null, CallExpression: null },
  ObjectExpression: null,
  ArrayExpression: {
    Index: 0,
    CallExpression: {
      type: 'MemberExpression',
      node: [Node],
      ancestors: [Array],
      property: 'news',
      require: '@/views/news'
    }
  }
}
{
  Statement: { VariableDeclarator: null, CallExpression: null },
  ObjectExpression: null,
  ArrayExpression: {
    Index: 1,
    CallExpression: {
      type: 'CallExpression',
      node: [Node],
      ancestors: [Array],
      require: '@/views/home'
    }
  }
}

// --------------------------------------------------------------------

---- /Users/atom/Desktop/npm-test/vue2-vite-tpl/src/router.js ----

/** CommonJs statements */


/** CommonJs expressions */
import * as _MODULE_name__EXPRESSION_object__0 from "@/views/home"
import _MODULE_default___EXPRESSION_object__1 from "@/views/news.vue"

/** CommonJs deconstructs */

import { DEFAULT_EXTENSIONS } from '../vite-plugins/utils'

import './require'

console.log(DEFAULT_EXTENSIONS)

const dynamicVar = 'dynamic'

export const routes = [
  {
    path: '/home',
    component: _MODULE_name__EXPRESSION_object__0,
  },
  {
    path: '/news',
    component: _MODULE_default___EXPRESSION_object__1,
  },
  {
    path: '/dynamic',
    component: () => {


      const res = import(`@/views/${dynamicVar}`)
      const res2 = import(`@/views/${dynamicVar}/index`)
      const res3 = import(`@/views/${dynamicVar}` + '/index')
      const res4 = import('@/views/dynamic')

      console.log(res, res2, res3, res4)


      return res
    },
  },
]


---- /Users/atom/Desktop/npm-test/vue2-vite-tpl/src/require.js ----

/** CommonJs statements */
import { parse } from "acorn"
import { ancestor, simple } from "acorn-walk"
import * as acorn from "acorn"
import { home } from "@/views/home"
import "vite"

/** CommonJs expressions */
import _MODULE_default___EXPRESSION_object__0 from "@/views/news"
import * as _MODULE_name__EXPRESSION_object__1 from "@/views/home"
import * as _MODULE_name__EXPRESSION_array__2 from "@/views/news"
import * as _MODULE_name__EXPRESSION_array__3 from "@/views/home"

/** CommonJs deconstructs */



const dict = {
  news: _MODULE_default___EXPRESSION_object__0,
  home: _MODULE_name__EXPRESSION_object__1,
}

const arr = [
  _MODULE_name__EXPRESSION_array__2.news,
  _MODULE_name__EXPRESSION_array__3,
]

module.exports = { dict, arr };

// --------------------------------------------------------------------
// --------------------------------------------------------------------

