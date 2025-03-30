const { override, addBabelPlugins, addBabelPreset } = require('customize-cra');

module.exports = override(
  addBabelPreset('@babel/preset-env'),
  ...addBabelPlugins(
    '@babel/plugin-transform-nullish-coalescing-operator',
    '@babel/plugin-transform-optional-chaining'
  )
);
