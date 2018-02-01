module.exports = {
    mode: 'modules',
    out: 'doc',
    theme: 'default',
    ignoreCompilerErrors: true,
    excludePrivate: true,
    excludeNotExported: 'true',
    target: 'ES5',
    moduleResolution: 'node',
    preserveConstEnums: 'true',
    stripInternal: 'true',
    suppressExcessPropertyErrors: 'true',
    suppressImplicitAnyIndexErrors: 'true',
    module: 'commonjs'
  };