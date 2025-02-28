<template>
  <div id="container"></div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { findDevicePositionAndIntroduce } from '@/api/getData' // 导入 API 请求方法
import { ElMessage } from 'element-plus'
const bodyList = ref()
const currentMarker = ref()
let map = null
const currentPageUrl =
  window.location.protocol +
  '//' +
  window.location.hostname +
  ':' +
  window.location.port
// console.log(currentPageUrl)
// 信息窗体的内容可以是任意html片段
// 01-光谱理化
// 07-气象站
// 05-湿地观测点
const contents = {
  '01': "<div class='content-window-card'><div style='padding:7px 0px 0px 0px;'><h4>光谱理化数据</h4><p class='input-item'>400：0.002685  </p><p class='input-item'>401：0.002675</p><p class='input-item'>402：0.002664</p><p class='input-item'>...</p></div><div style='padding:7px 0px 0px 0px;'><h4>水体理化数据</h4><p class='input-item'>400：0.002685  </p><p class='input-item'>401：0.002675</p><p class='input-item'>402：0.002664</p><p class='input-item'>...</p></div></div>",
  '05': "<div style='width:568px;height:302px' class='bg0'><div class='infoWindowLeft'><img style='width: 100%; height: 100%' src='{{deviceItImgPath}}'/></div></div><div class='auto-wrap'>{{deviceItIntroduce}}</div></div>",
  '07': "<div style='width:568px;height:302px' ><div><img style='width: 100%; height: 100%' src='/images/qixiang/wanan.jpg' /></div></div>"
}

onMounted(() => {
  getInfoList()
})

// 获取观测的信息
function getInfoList () {
  findDevicePositionAndIntroduce({})
    .then((res) => {
      const result = res.response.value // 处理成功的响应
      console.log(result)
      if (result.code === 'SUCCESS') {
        if (result.body === null || result.body.length === 0) {
          ElMessage({
            showClose: true,
            message: '观察点数据不存在',
            center: true
          })
        } else {
          bodyList.value = result.body
          createMap()
        }
      } else {
        const message = result.msg
        ElMessage({
          showClose: true,
          message: message,
          center: true
        })
      }
    })
    .catch((error) => {
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 地图初始化
function createMap () {
  window._AMapSecurityConfig = {
    securityJsCode: '「你申请的安全密钥」'
  }
  AMapLoader.load({
    key: '9f1072f10a5c9da6cb94b4017e0694fd', // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [] // 需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
  }).then((AMap) => {
    map = AMap
    map = new AMap.Map('container', {
      // 设置地图容器id
      viewMode: '3D', // 是否为3D地图模式
      // mapStyle: "amap://styles/darkblue",
      showBuildingBlock: false,
      terrain: true, // 开启地形图
      zoom: 14, // 初始化地图级别
      center: [112.18878, 34.185763],
      layers: [new AMap.TileLayer.Satellite()] // 初始化地图中心点位置
    })
    // map.on('complete', function () {
    // 创建 AMap.LabelsLayer 图层
    const layer = new AMap.LabelsLayer({
      zooms: [3, 20],
      zIndex: 1000,
      collision: false
    })
    // 将图层添加到地图
    map.add(layer)
    const markers = []
    for (let i = 0; i < bodyList.value.length; i++) {
      const body = bodyList.value[i]
      const iconClass = {
        type: 'image',
        image: body.deviceItIconPath,
        size: [48, 48],
        anchor: 'bottom-center',
        type: 1
      }
      // console.log(curPosition.deviceId)
      const curData = {
        position: [body.ddLongitude, body.ddLatitude],
        icon: iconClass,
        deviceType: body.type,
        extData: body
      }
      const labelMarker = new AMap.LabelMarker(curData)

      // console.log(labelMarker)
      // 给marker绑定鼠标悬浮事件
      labelMarker.on('click', function (e) {
        // console.log('mouseover', e)
        // console.log(e.target.getExtData()) // 获取数据
        const position = e.data.data && e.data.data.position
        const extData = e.target.getExtData()
        const deviceType = extData.type
        if (position) {
          let conHtml = contents[deviceType]
          conHtml = conHtml.replace(
            '{{deviceItImgPath}}',
            extData.deviceItImgPath
          )
          conHtml = conHtml.replace(
            '{{deviceItIntroduce}}',
            extData.deviceItIntroduce
          )
          infoWindow.setContent(conHtml)
          infoWindow.setOffset(new AMap.Pixel(0, -50))
          infoWindow.open(map, position) // 打开信息窗体
        }
      })
      // 给marker绑定鼠标离开事件
      // labelMarker.on('mouseout', function () {
      //   map.remove(normalMarker)
      // })
      markers.push(labelMarker)
    }
    // 一次性将海量点添加到图层
    layer.add(markers)
    // 创建信息窗体
    const infoWindow = new AMap.InfoWindow({
      isCustom: true, // 使用自定义窗体
      // offset: new AMap.Pixel(0, -50),
      closeWhenClickMap: true,
      anchor: 'bottom-center'
    })
  })
}

// })
onUnmounted(() => {
  map?.destroy()
})
</script>

<style>
#container {
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 100%;
  position: center;
}
.bg0 {
  background: url('../../../public/images/bg0.png') no-repeat;
  background-size: 100%;
  width: 100%;
  height: 100%;
}
.infoWindowLeft {
  position: absolute;
  width: 36%;
  height: 62%;
  left: 9%;
  top: 23%;
  font-size: 15px;
}
.infoWindowRight {
  position: absolute;
  left: 58%;
  top: 25%;
  font-size: 15px;
}
.auto-wrap {
  word-wrap: break-word; /* 支持旧版浏览器 */
  overflow-wrap: break-word; /* 标准属性 */
  position: absolute;
  left: 58%;
  top: 25%;
  width: 30%;
  font-size: 15px;
}
.amap-marker {
  width: 43px !important;
  height: 64px !important;
}
.amap-marker .amap-icon {
  width: 43px !important;
  height: 64px !important;
}
.amap-marker .amap-icon img {
  position: static !important;
}
.content-window-card {
  position: relative;
  width: 100%;
  padding: 0.75rem 1.25rem 0 1.25rem;
  box-shadow: none;
  bottom: 0;
  left: 0;
  background-color: #574ace;
}
</style>
