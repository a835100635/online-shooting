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
  // 取消生成map文件
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.resolve.alias.set('@', path.resolve(__dirname, 'src'));
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs = ['console.log'];
    }
  }
};
