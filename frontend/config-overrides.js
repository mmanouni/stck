const { override, addBabelPlugins, addBabelPreset } = require('customize-cra');

module.exports = override(
  addBabelPreset(['@babel/preset-env', { targets: "> 0.25%, not dead" }]),
  ...addBabelPlugins(
    '@babel/plugin-transform-nullish-coalescing-operator',
    '@babel/plugin-transform-optional-chaining'
  )
);

module.exports.devServer = (config) => {
  config.setupMiddlewares = (middlewares, devServer) => {
    // Add your custom middleware here if needed
    return middlewares;
  };
  return config;
};

// Ensure no usage of util._extend; replace with Object.assign if necessary
// Example:
// const util = require('util');
// const extended = Object.assign({}, obj1, obj2); // Replace util._extend
