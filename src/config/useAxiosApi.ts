import { useAxios } from '@vueuse/integrations/useAxios'
import axios, { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// create an axios instance
const instance = axios.create({
  withCredentials: false,
  timeout: 40000
})

// 为所有请求添加默认header
// instance.defaults.headers.common.Authorization = ''

// request interceptor
instance.interceptors.request.use(
  // 请求发送前的处理
  (config) => {
    // do something before request is sent
    // const token = store.state.user.token;

    // if (token) {
    //   // let each request carry token
    //   config.headers = {
    //     ...config.headers,
    //     Authorization: `Bearer ${token}`
    //   };
    // }
    const token = localStorage.getItem('Authorization')
    // console.log('token:',token)
    config.headers.set('Authorization', token)
    // config.headers.set('content-type', 'application/json')
    return config
  },
  (error) => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
instance.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data
    // if the custom code is not 200, it is judged as an error.
    // if (res.code !== 'SUCCESS') {
    //   alert(res.msg)
    // 412: Token expired;
    // if (res.code === 412) {
    // store.dispatch('user/userLogout');
    //   }
    //   return Promise.reject(res.msg || 'Error')
    // } else {
    // console.log(res)
    return res
    // }
  },
  (error) => {
    console.log('err' + error)
    // alert(error.message)
    // ElMessage({
    //   showClose: true,
    //   message: error,
    //   center: true,
    //   type: 'error'
    // })
    return Promise.reject(error.message)
  }
)

/**
 * reactive useFetchApi
 */

export default function useAxiosApi (url: string, config: AxiosRequestConfig) {
  // const baseUrl = 'http://127.0.0.1:8090'
  const res = useAxios<JSON>(url, config, instance)
  return res
}
