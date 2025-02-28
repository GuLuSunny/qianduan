'use strict'
import { cssLoaders } from './utils'
import { build, dev } from '../config'
const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  ? build.productionSourceMap
  : dev.cssSourceMap

export const loaders = cssLoaders({
  sourceMap: sourceMapEnabled,
  extract: isProduction
})
export const cssSourceMap = sourceMapEnabled
export const cacheBusting = dev.cacheBusting
export const transformToRequire = {
  video: ['src', 'poster'],
  source: 'src',
  img: 'src',
  image: 'xlink:href'
}
