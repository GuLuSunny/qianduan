const path = require('path');
const { defineConfig } = require("@vue/cli-service");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require('webpack');
const fs = require('graceful-fs');
fs.gracefulify(require('fs'));

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  
  devServer: {
    port: 8081,
    proxy: {
      "/api/ai-assistant": {
        target: "http://127.0.0.1:3002",
        changeOrigin: true,
        pathRewrite: { "^/api/ai-assistant": "/api/ai-assistant" },
      },
      "/api": {
        target: "http://127.0.0.1:8091",
        changeOrigin: true,
        pathRewrite: { "^/api": "/api" },
      },
    },
  },
  
  chainWebpack: (config) => {
    // 环境变量定义
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      });
      return definitions;
    });
    
    // 删除默认的 public 复制插件
    config.plugins.delete('copy');
    
    // 解决 index.html 冲突的关键配置
    config.plugin('html').tap(args => {
      args[0].template = path.resolve(__dirname, 'public/index.html');
      args[0].filename = 'index.html';
      args[0].inject = true;
      return args;
    });
    
    // 忽略地形文件处理
    config.module
      .rule('ignore-terrain')
      .test(/\.(hm|terrain|jpg|png)$/)
      .include.add(path.resolve(__dirname, 'public/dixing'))
      .end()
      .use('ignore-loader')
      .loader('ignore-loader');
  },
  
  configureWebpack: {
    watchOptions: {
      ignored: /public\/dixing/
    },
    
    plugins: [
      new NodePolyfillPlugin(),
       new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      // 合并所有复制操作到单个 CopyWebpackPlugin 实例
      new CopyWebpackPlugin({
        patterns: [
          // 1. 复制 public 目录（排除 index.html 和 dixting 目录）
          {
            from: path.resolve(__dirname, 'public'),
            to: path.resolve(__dirname, 'dist'),
            globOptions: {
              ignore: [
                '**/dixing/**',
                '**/index.html'  // 确保忽略 index.html
              ]
            }
          },
          // 2. 复制 Cesium 资源
          { 
            from: "node_modules/cesium/Build/Cesium/Workers", 
            to: "cesium/Workers",
            noErrorOnMissing: true
          },
          { 
            from: "node_modules/cesium/Build/Cesium/ThirdParty", 
            to: "cesium/ThirdParty",
            noErrorOnMissing: true
          },
          { 
            from: "node_modules/cesium/Build/Cesium/Assets", 
            to: "cesium/Assets",
            noErrorOnMissing: true
          },
          { 
            from: "node_modules/cesium/Build/Cesium/Widgets", 
            to: "cesium/Widgets",
            noErrorOnMissing: true,
            transform: (content, path) => {
              return path && path.endsWith('.gif') ? content : content;
            }
          }
        ],
      }),
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("./cesium"),
      })
    ],
    
    resolve: {
      fallback: {
        zlib: require.resolve("browserify-zlib"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        stream: require.resolve("stream-browserify"),
        process: require.resolve("process/browser")
      },
    },
  },
});