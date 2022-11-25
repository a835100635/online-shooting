/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
module.exports = {
  lintOnSave: false,
  devServer: {
    host: '0.0.0.0',
    port: 8617,
    open: true,
    proxy: {
      'socket.io': {
        target: 'ws://localhost:8616',
        ws: true,
        changeOrigin: true
      }
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias.set('@', path.resolve(__dirname, 'src'));
  }
};
