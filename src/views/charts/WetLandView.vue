<template>
  <div
    ref="soilChart"
    style="
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    "
    class="wetLandDiv"
  ></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
// import data from '@/../public/json/fullscreenSampleJson/wetLand.json' // 注意路径，可能需要调整
import { WetlandSoilGetData } from '@/api/getData'
import { ElMessage, ElLoading } from 'element-plus'

const soilChart = ref(null)
let myChart = null
const periodDataList = ref({})
let intervalId = null
const chartOptionsList = null
let idxCount = 0
const chartTitle = ref('')

const loadingoptions = {
  // 加载配置
  target: '.wetLandDiv',
  fullscreen: false,
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

// 定义接收的参数
const props = defineProps({
  shiDiData: {
    type: Object,
    default: {
      time: ''
    }
  }
})

// 监听window对象的resize事件
window.addEventListener('resize', updateChart)

onMounted(() => {
  //  periodDataList.value = data
  // 初始化图表
  //   updateChart()
  fetchSoilData()
})

onBeforeUnmount(() => {
  // 销毁图表实例
  if (myChart) {
    myChart.dispose()
  }
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
  window.removeEventListener('resize', updateChart)
})

const chartOptions = {
  0: {
    title: '土壤含水量柱状图',
    yAxisName: '土壤含水量(%)',
    dataKey: 'soilMoistureContent'
  },
  1: {
    title: '土壤有机质含量柱状图',
    yAxisName: '土壤有机质含量(g/100g)',
    dataKey: 'soilOrganicMatterContent'
  },
  2: {
    title: '土壤含碳总量柱状图',
    yAxisName: '土壤含碳总量(g/100g)',
    dataKey: 'totalSoilCarbonContent'
  },
  3: {
    title: '土壤含氮总量柱状图',
    yAxisName: '土壤含氮总量(g/100g)',
    dataKey: 'totalSoilNitrogenContent'
  },
  4: {
    title: '土壤含磷总量柱状图',
    yAxisName: '土壤含磷总量(g/100g)',
    dataKey: 'totalSoilPhosphorusContent'
  }
}

/* 数据查询 */
function fetchSoilData () {
  const loadingInstance = ElLoading.service(loadingoptions)
  WetlandSoilGetData({ time: props.shiDiData.time })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        if (result.body.length === 0) {
          ElMessage({ showClose: true, message: '数据不存在', center: true })
        } else {
          periodDataList.value = result.body
          updateChart() // Ensure the chart is updated with the latest data
          if (intervalId === null) {
            intervalId = setInterval(updateChart, 10000) // 10秒执行一次
          }
        }
      }
    })
    .catch(() => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

function updateChart () {
  const viewportHeightInPx = window.innerHeight
  const viewportWidthInPx = window.innerWidth
  // const gridHeight = viewportHeightInPx * 0.14
  // const gridWidth = viewportWidthInPx * 0.23
  const gridleft = viewportWidthInPx * 0.003
  // console.log('viewportHeightInPx:', viewportHeightInPx)
  // console.log('viewportWidthInPx:', viewportWidthInPx)
  let aHeight = 0.16
  let aWidth = 0.24
  if (viewportHeightInPx > 850 && viewportHeightInPx < 920) {
    aHeight = 0.16
    aWidth = 0.24
  }
  if (viewportHeightInPx > 1000 && viewportHeightInPx < 1100) {
    aHeight = 0.17
    aWidth = 0.24
  }
  if (viewportHeightInPx > 650 && viewportHeightInPx < 750) {
    aHeight = 0.14
    aWidth = 0.24
  }

  const gridHeight = viewportHeightInPx * aHeight
  const gridWidth = viewportWidthInPx * aWidth
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
  if (!myChart || myChart === undefined) {
    myChart = echarts.init(soilChart.value)
  }
  idxCount = idxCount + 1
  idxCount = idxCount % 5

  // 位置
  const grid = {
    // width:'80%',
    // height:'50%',
    left: gridleft,
    width: gridWidth,
    height: gridHeight,
    containLabel: true // 确保标签不会被裁剪
  }

  if (periodDataList.value.length === 0) return {}
  const { title, yAxisName, dataKey } = chartOptions[idxCount] || {}

  // Handle missing options
  if (!title || !yAxisName) return {}

  const xAxisData = periodDataList.value.map((item) => item.depthRange)
  const seriesData = periodDataList.value.map((item) =>
    parseFloat(item[dataKey]).toFixed(2)
  )
  // console.log(title, ' 数据：', seriesData)
  const option = {
    title: {
      text: props.shiDiData.time + '日' + title,
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 14 // 设置为想要的字体大小，例如 14
      }
    },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: '深度(cm)',
      nameLocation: 'middle',
      nameTextStyle: {
        color: 'white'
      },
      nameGap: 25,
      axisTick: {
        show: true
      },
      axisLabel: {
        color: 'white'
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      axisLabel: { formatter: (value) => `${value}`, color: 'white' },
      axisTick: { show: true },
      axisLine: { show: true },
      splitLine: { show: false },
      nameTextStyle: {
        color: 'white',
        padding: [0, 0, 0, 90]
      }
    },
    series: [
      {
        name: yAxisName,
        data: seriesData,
        type: 'bar',
        itemStyle: { color: '#2F85EB' }
      }
    ],
    grid: grid
  }
  myChart.setOption(option, true)
}
</script>

<style scoped>
/* 添加样式以确保图表正确显示 */
</style>
