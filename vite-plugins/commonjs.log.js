// --------------------------

[
  'VariableDeclaration',
  'VariableDeclarator',
  'MemberExpression',
  'CallExpression'
]
[ 'VariableDeclaration', 'VariableDeclarator', 'CallExpression' ]
[ 'VariableDeclaration', 'VariableDeclarator', 'CallExpression' ]
[ 'VariableDeclaration', 'VariableDeclarator', 'CallExpression' ]
[ 'CallExpression' ]
[
  'VariableDeclaration',
  'VariableDeclarator',
  'ObjectExpression',
  'Property',
  'MemberExpression',
  'CallExpression'
]
[
  'VariableDeclaration',
  'VariableDeclarator',
  'ArrayExpression',
  'MemberExpression',
  'CallExpression'
]

// --------------------------

acorn [
  {
    type: 'declarator',
    identifier: { node: [Node], name: 'parse', names: undefined },
    require: { node: [Node], name: 'acorn', property: 'parse' }
  },
  {
    type: 'declarator',
    identifier: { node: [Node], name: 'acorn', names: undefined },
    require: { node: [Node], name: 'acorn', property: undefined }
  }
]
acorn-walk [
  {
    type: 'declarator',
    identifier: { node: [Node], name: undefined, names: [Array] },
    require: { node: [Node], name: 'acorn-walk', property: undefined }
  }
]
@/views/home [
  {
    type: 'declarator',
    identifier: { node: [Node], name: 'home', names: undefined },
    require: { node: [Node], name: '@/views/home', property: 'default' }
  },
  {
    type: 'objectExpression',
    node: Node {
      type: 'CallExpression',
      start: 246,
      end: 269,
      loc: [SourceLocation],
      callee: [Node],
      arguments: [Array],
      optional: false
    },
    property: undefined,
    require: '@/views/home'
  },
  {
    type: 'arrayExpression',
    node: Node {
      type: 'CallExpression',
      start: 325,
      end: 348,
      loc: [SourceLocation],
      callee: [Node],
      arguments: [Array],
      optional: false
    },
    property: undefined,
    require: '@/views/home'
  }
]
vite [
  {
    type: 'declarator',
    identifier: { node: null, name: null, names: null },
    require: { node: [Node], name: 'vite', property: undefined }
  }
]
@/views/news [
  {
    type: 'objectExpression',
    node: Node {
      type: 'MemberExpression',
      start: 205,
      end: 236,
      loc: [SourceLocation],
      object: [Node],
      property: [Node],
      computed: false,
      optional: false
    },
    property: 'default',
    require: '@/views/news'
  },
  {
    type: 'arrayExpression',
    node: Node {
      type: 'MemberExpression',
      start: 290,
      end: 321,
      loc: [SourceLocation],
      object: [Node],
      property: [Node],
      computed: false,
      optional: false
    },
    property: 'default',
    require: '@/views/news'
  }
]


// -------------------------------------------------


{
  Statement: {
    Identifier: { type: 'Identifier', node: [Node], name: 'parse' },
    CallExpression: {
      type: 'MemberExpression',
      node: [Node],
      property: 'parse',
      require: 'acorn'
    }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: {
    Identifier: { type: 'ObjectPattern', node: [Node], names: [Array] },
    CallExpression: { type: 'CallExpression', node: [Node], require: 'acorn-walk' }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: {
    Identifier: { type: 'Identifier', node: [Node], name: 'acorn' },
    CallExpression: { type: 'CallExpression', node: [Node], require: 'acorn' }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: {
    Identifier: { type: 'Identifier', node: [Node], name: 'home' },
    CallExpression: {
      type: 'MemberExpression',
      node: [Node],
      property: 'default',
      require: '@/views/home'
    }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: {
    Identifier: null,
    CallExpression: { type: 'CallExpression', node: [Node], require: 'vite' }
  },
  ObjectExpression: null,
  ArrayExpression: null
}
{
  Statement: {
    Identifier: { type: 'Identifier', node: [Node], name: 'dict' },
    CallExpression: null
  },
  ObjectExpression: [
    { Property: 'news', CallExpression: [Object] },
    { Property: 'home', CallExpression: [Object] }
  ],
  ArrayExpression: null
}
{
  Statement: {
    Identifier: { type: 'Identifier', node: [Node], name: 'arr' },
    CallExpression: null
  },
  ObjectExpression: null,
  ArrayExpression: [
    { Index: 0, CallExpression: [Object] },
    { Index: 1, CallExpression: [Object] }
  ]
}

// ------------------------------------------------

[
  {
    require: 'acorn',
    ancestors: [ [Node], [Node], [Node], [Node] ],
    importNames: { names: [Array], code: 'import { parse } from "acorn";' }
  },
  {
    require: 'acorn-walk',
    ancestors: [ [Node], [Node], [Node] ],
    importNames: {
      names: [Array],
      code: 'import { ancestor, simple } from "acorn-walk";'
    }
  },
  {
    require: 'acorn',
    ancestors: [ [Node], [Node], [Node] ],
    importName: { name: [Object], code: 'import * as acorn from "acorn";' }
  },
  {
    require: '@/views/home',
    ancestors: [ [Node], [Node], [Node], [Node] ],
    importNames: { names: [Array], code: 'import { home } from "@/views/home";' }
  },
  { require: 'vite', ancestors: [ [Node] ], importOnly: {} },
  {
    require: '@/views/news',
    ancestors: [ [Node], [Node], [Node], [Node], [Node], [Node] ],
    importDefaultExpression: {
      name: '_MODULE_default___EXPRESSION_object__0',
      code: 'import _MODULE_default___EXPRESSION_object__0 from "@/views/news";'
    }
  },
  {
    require: '@/views/home',
    ancestors: [ [Node], [Node], [Node], [Node], [Node], [Node] ],
    importExpression: {
      name: '_MODULE_name__EXPRESSION_object__1',
      code: 'import * as _MODULE_name__EXPRESSION_object__1 from "@/views/home";'
    }
  },
  {
    require: '@/views/news',
    ancestors: [ [Node], [Node], [Node], [Node], [Node] ],
    importExpression: {
      name: '_MODULE_name__EXPRESSION_array__2',
      code: 'import * as _MODULE_name__EXPRESSION_array__2 from "@/views/news";'
    }
  },
  {
    require: '@/views/home',
    ancestors: [ [Node], [Node], [Node], [Node], [Node] ],
    importExpression: {
      name: '_MODULE_name__EXPRESSION_array__3',
      code: 'import * as _MODULE_name__EXPRESSION_array__3 from "@/views/home";'
    }
  }
]

// ------------------------------------------------

const parse = require('acorn').parse
const { ancestor, simple } = require('acorn-walk')
const acorn = require('acorn')
const home = require('@/views/home').home
// ----
const parse = require('acorn').parse
const { ancestor, simple } = require('acorn-walk').aaaa
const acorn = require('acorn')
const home = require('@/views/home').home

// ------------------------------------------------

{
  node: Node {
    type: 'VariableDeclaration',
    start: 0,
    end: 36,
    loc: SourceLocation { start: [Position], end: [Position] },
    declarations: [ [Node] ],
    kind: 'const'
  },
  require: 'acorn',
  cjs: { code: "const parse = require('acorn').parse" },
  importNames: { names: [ 'parse' ], code: 'import { parse } from "acorn"' }
}
{
  node: Node {
    type: 'VariableDeclaration',
    start: 37,
    end: 87,
    loc: SourceLocation { start: [Position], end: [Position] },
    declarations: [ [Node] ],
    kind: 'const'
  },
  require: 'acorn-walk',
  cjs: { code: "const { ancestor, simple } = require('acorn-walk')" },
  importNames: {
    names: [ 'ancestor', 'simple' ],
    code: 'import { ancestor, simple } from "acorn-walk"'
  }
}
{
  node: Node {
    type: 'VariableDeclaration',
    start: 88,
    end: 118,
    loc: SourceLocation { start: [Position], end: [Position] },
    declarations: [ [Node] ],
    kind: 'const'
  },
  require: 'acorn',
  cjs: { code: "const acorn = require('acorn')" },
  importName: { name: { '*': 'acorn' }, code: 'import * as acorn from "acorn"' }
}
{
  node: Node {
    type: 'VariableDeclaration',
    start: 119,
    end: 160,
    loc: SourceLocation { start: [Position], end: [Position] },
    declarations: [ [Node] ],
    kind: 'const'
  },
  require: '@/views/home',
  cjs: { code: "const home = require('@/views/home').home" },
  importNames: { names: [ 'home' ], code: 'import { home } from "@/views/home"' }
}
{
  node: Node {
    type: 'CallExpression',
    start: 162,
    end: 177,
    loc: SourceLocation { start: [Position], end: [Position] },
    callee: Node {
      type: 'Identifier',
      start: 162,
      end: 169,
      loc: [SourceLocation],
      name: 'require'
    },
    arguments: [ [Node] ],
    optional: false
  },
  require: 'vite',
  cjs: { code: "require('vite')" },
  importOnly: { code: 'import "vite"' }
}
{
  node: Node {
    type: 'MemberExpression',
    start: 202,
    end: 233,
    loc: SourceLocation { start: [Position], end: [Position] },
    object: Node {
      type: 'CallExpression',
      start: 202,
      end: 225,
      loc: [SourceLocation],
      callee: [Node],
      arguments: [Array],
      optional: false
    },
    property: Node {
      type: 'Identifier',
      start: 226,
      end: 233,
      loc: [SourceLocation],
      name: 'default'
    },
    computed: false,
    optional: false
  },
  require: '@/views/news',
  cjs: { code: "require('@/views/news').default" },
  importDefaultExpression: {
    name: '_MODULE_default___EXPRESSION_object__0',
    code: 'import _MODULE_default___EXPRESSION_object__0 from "@/views/news"'
  }
}
{
  node: Node {
    type: 'CallExpression',
    start: 243,
    end: 266,
    loc: SourceLocation { start: [Position], end: [Position] },
    callee: Node {
      type: 'Identifier',
      start: 243,
      end: 250,
      loc: [SourceLocation],
      name: 'require'
    },
    arguments: [ [Node] ],
    optional: false
  },
  require: '@/views/home',
  cjs: { code: "require('@/views/home')" },
  importExpression: {
    name: { '*': '_MODULE_name__EXPRESSION_object__1' },
    code: 'import * as _MODULE_name__EXPRESSION_object__1 from "@/views/home"'
  }
}
{
  node: Node {
    type: 'CallExpression',
    start: 287,
    end: 310,
    loc: SourceLocation { start: [Position], end: [Position] },
    callee: Node {
      type: 'Identifier',
      start: 287,
      end: 294,
      loc: [SourceLocation],
      name: 'require'
    },
    arguments: [ [Node] ],
    optional: false
  },
  require: '@/views/news',
  cjs: { code: "require('@/views/news')" },
  importExpression: {
    name: { '*': '_MODULE_name__EXPRESSION_array__2' },
    code: 'import * as _MODULE_name__EXPRESSION_array__2 from "@/views/news"'
  }
}
{
  node: Node {
    type: 'CallExpression',
    start: 319,
    end: 342,
    loc: SourceLocation { start: [Position], end: [Position] },
    callee: Node {
      type: 'Identifier',
      start: 319,
      end: 326,
      loc: [SourceLocation],
      name: 'require'
    },
    arguments: [ [Node] ],
    optional: false
  },
  require: '@/views/home',
  cjs: { code: "require('@/views/home')" },
  importExpression: {
    name: { '*': '_MODULE_name__EXPRESSION_array__3' },
    code: 'import * as _MODULE_name__EXPRESSION_array__3 from "@/views/home"'
  }
}

// ------------------------------------------------

const parse = require('acorn').parse;
const { ancestor, simple } = require('acorn-walk')
const acorn = require('acorn');
const home = require('@/views/home').home

require('vite')

const dict = {
  news: require('@/views/news').default,
  home: require('@/views/home'),
}

const arr = [
  require('@/views/news').news,
  require('@/views/home'),
]

module.exports = { dict, arr };

//----------------------------------

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

// ------------------------------------------------

