'use strict'
import { join, resolve as _resolve } from 'path'
import { assetsPath } from './utils'
import { build, dev } from '../config'
import vueLoaderConfig from './vue-loader.conf'

function resolve(dir) {
  return join(__dirname, '..', dir)
}



export const context = _resolve(__dirname, '../')
export const entry = {
  app: './src/main.js'
}
export const output = {
  path: build.assetsRoot,
  filename: '[name].js',
  publicPath: process.env.NODE_ENV === 'production'
    ? build.assetsPublicPath
    : dev.assetsPublicPath
}
export const resolve = {
  extensions: ['.js', '.vue', '.json'],
  alias: {
    'vue$': 'vue/dist/vue.esm.js',
    '@': resolve('src'),
  }
}
export const module = {
  rules: [
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: vueLoaderConfig
    },
    {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
    },
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: assetsPath('img/[name].[hash:7].[ext]')
      }
    },
    {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: assetsPath('media/[name].[hash:7].[ext]')
      }
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: assetsPath('fonts/[name].[hash:7].[ext]')
      }
    },
    {
      test: /\.(gltf)$/,
      use: [
        {
          loader: 'gltf-webpack-loader'
        }
      ]
    },
    {
      test: /\.(glb)$/,

      loader: 'url-loader'
    },
    {
      test: /\.less$/,
      use: [
        'style-loader',
        'css-loader',
        'less-loader'
      ]
    }
  ]
}
export const node = {
  // prevent webpack from injecting useless setImmediate polyfill because Vue
  // source contains it (although only uses it if it's native).
  setImmediate: false,
  // prevent webpack from injecting mocks to Node native modules
  // that does not make sense for the client
  dgram: 'empty',
  fs: 'empty',
  net: 'empty',
  tls: 'empty',
  child_process: 'empty'
}
