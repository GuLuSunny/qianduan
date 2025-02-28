import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import DataVVue3 from '@kjgl77/datav-vue3'
import Antd from 'ant-design-vue'
import './assets/css/index.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'dayjs/locale/zh-cn'
import 'element-plus/dist/index.css'
import permissionPlugin from './config/permission-plugin'
import { updateUserPermissions } from './config/global-state'
import axios from 'axios'


const app = createApp(App)
app
  .use(store)
  .use(router)
  .use(ElementPlus, {
    locale: zhCn
  })
  .use(DataVVue3)
  .use(Antd)
  .use(permissionPlugin)
  .mount('#app')

const debounce = (fn: any, delay: any) => {
  let timer: any
  return (...args: any) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
const _ResizeObserver = window.ResizeObserver
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback: any) {
    callback = debounce(callback, 200)
    super(callback)
  }
}

declare global {
  interface Window {
    CESIUM_BASE_URL: string
  }
}
