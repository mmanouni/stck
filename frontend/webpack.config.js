const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      crypto: false, // Ensure compatibility with OpenSSL 3.0
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
    topLevelAwait: true, // Optional, if needed
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Add your middleware logic here
      return middlewares;
    },
  },
};