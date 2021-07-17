[
  'VariableDeclaration',
  'VariableDeclarator',
  'MemberExpression',
  'CallExpression'
]
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
  'ObjectExpression',
  'Property',
  'CallExpression'
]
[
  'VariableDeclaration',
  'VariableDeclarator',
  'ArrayExpression',
  'MemberExpression',
  'CallExpression'
]
[
  'VariableDeclaration',
  'VariableDeclarator',
  'ArrayExpression',
  'CallExpression'
]

// --------------------------

[
  'VariableDeclaration',
  'VariableDeclarator',
  'MemberExpression',
  'CallExpression'
]
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
    importNames: { names: [Array], code: 'import { parse } from "acorn";' }
  },
  {
    require: 'acorn-walk',
    importNames: {
      names: [Array],
      code: 'import { ancestor, simple } from "acorn-walk";'
    }
  },
  {
    require: 'acorn',
    importName: { name: [Object], code: 'import * as acorn from "acorn";' }
  },
  {
    require: '@/views/home',
    importName: { name: [Object], code: 'import * as home from "@/views/home";' }
  },
  { require: 'vite', importOnly: {} },
  {
    require: '@/views/news',
    importDefaultExpression: {
      name: '__module_default__expression__0',
      code: 'import __module_default__expression__0 from "@/views/news";'
    }
  },
  {
    require: '@/views/home',
    importExpression: {
      name: '__module_name__expression__1',
      code: 'import * as __module_name__expression__1 from "@/views/home";'
    }
  },
  {
    require: '@/views/news',
    importDefaultExpression: {
      name: '__module_default__expression__2',
      code: 'import __module_default__expression__2 from "@/views/news";'
    }
  },
  {
    require: '@/views/home',
    importExpression: {
      name: '__module_name__expression__3',
      code: 'import * as __module_name__expression__3 from "@/views/home";'
    }
  }
]
// ------------------------------------------------

