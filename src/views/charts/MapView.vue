<template>
  <div
    id="container"
    class="mapDiv"
    style="width: calc(100vw * 0.5); height: calc(100vh * 0.53)"
  ></div>
</template>
<script setup>
import { onMounted, onUnmounted, ref, getCurrentInstance } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { findDevicePositionAndIntroduce } from '@/api/getData' // 导入 API 请求方法
import { ElMessage, ElLoading } from 'element-plus'
const bodyList = ref()
const currentMarker = ref()
let map = null
const loadingoptions = {
  // 加载配置
  target: '.mapDiv',
  fullscreen: false,
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

// const currentPageUrl =
//   window.location.protocol +
//   '//' +
//   window.location.hostname +
//   ':' +
//   window.location.port
// console.log(currentPageUrl)
// 信息窗体的内容可以是任意html片段
const contents = [
  "<div style='width:503px;height:264px' class='bg0'><div class='infoWindowTitle'>{{deviceName}}</div><div class='infoWindowLeft'><img style='width: 100%; height: 100%;background-size: cover;' src='{{deviceItImgPath}}'/></div></div>"
]

const htmlConList = [
  "<div class='auto-wrap'>",
  "<p class='input-item'>{{deviceItIntroduce}}</p>"
]
const htmlConEndList = ['</div>']

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      setTimeout(() => {
        getInfoList()
      }, 5000)
    })
  }
})

// 获取观测的信息
function getInfoList () {
  const loadingInstance = ElLoading.service(loadingoptions)
  findDevicePositionAndIntroduce({})
    .then((res) => {
      loadingInstance.close()
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
          createMap(loadingInstance)
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
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取地图数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 地图初始化
function createMap (loadingInstance) {
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
      zoom: 12, // 初始化地图级别
      center: [112.17078, 34.175763],
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
        image: body.iconPath,
        size: [12, 12],
        anchor: 'bottom-center',
        type: 1
      }
      // console.log(curPosition.deviceId)
      const curData = {
        position: [Number(body.ddLongitude), Number(body.ddLatitude)],
        icon: iconClass,
        deviceType: body.deviceType,
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
        const deviceType = extData.deviceType
        const deviceIntroduce = extData.deviceIntroduce
        if (position) {
          // let conHtml = contents[deviceType]
          let conHtml = contents[0]
          conHtml = conHtml.replace('{{deviceName}}', extData.deviceName)
          conHtml = conHtml.replace(
            '{{deviceItImgPath}}',
            extData.deviceImgPath
          )
          conHtml = conHtml + htmlConList[0]
          deviceIntroduce.forEach((item) => {
            conHtml =
              conHtml + htmlConList[1].replace('{{deviceItIntroduce}}', item)
          })
          conHtml = conHtml + htmlConEndList[0]
          infoWindow.setContent(conHtml)
          infoWindow.setOffset(new AMap.Pixel(0, -15))
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
    loadingInstance.close()
  })
}

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
  background: url('../../../public/images/fullscreenMapPoint/bg0.png') no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
}
.infoWindowTitle {
  position: absolute;
  left: 6%;
  font-size: 18px;
}
.infoWindowLeft {
  position: absolute;
  width: 40%;
  height: 69%;
  left: 5.5%;
  top: 17.5%;
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
  left: 53%;
  top: 16%;
  width: 41%;
  font-size: 14px;
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
.input-item {
  /* 默认情况下，text-align 属性是 left，所以这里其实不需要显式设置 */
  text-align: left; /* 但为了明确起见，还是加上这行 */
}
</style>
