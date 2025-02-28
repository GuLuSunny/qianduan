'use strict'
import { styleLoaders, createNotifierCallback } from './utils'
import { DefinePlugin, HotModuleReplacementPlugin, NamedModulesPlugin, NoEmitOnErrorsPlugin } from 'webpack'
import { dev } from '../config'
import merge from 'webpack-merge'
import { posix, resolve as _resolve } from 'path'
import baseWebpackConfig from './webpack.base.conf'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import { basePort, getPort } from 'portfinder'

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: styleLoaders({ sourceMap: dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: posix.join(dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || dev.host,
    port: PORT || dev.port,
    open: dev.autoOpenBrowser,
    overlay: dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: dev.assetsPublicPath,
    proxy: dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: dev.poll,
    }
  },
  plugins: [
    new DefinePlugin({
      'process.env': require('../config/dev.env').default
    }),
    new HotModuleReplacementPlugin(),
    new NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: _resolve(__dirname, '../static'),
        to: dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

export default new Promise((resolve, reject) => {
  basePort = process.env.PORT || dev.port
  getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: dev.notifyOnErrors
        ? createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
