const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      crypto: false,
    },
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  optimization: {
    moduleIds: 'deterministic',
  },
  experiments: {
    topLevelAwait: true,
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      // Add custom middleware here if needed
      return middlewares;
    },
  },
};