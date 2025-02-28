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
  ></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import data from '@/../public/json/fullscreenSampleJson/wetLand.json' // 注意路径，可能需要调整
const soilChart = ref(null)
let myChart = null
const periodDataList = ref({})
let intervalId = null
const chartOptionsList = null
let idxCount = 0
// 监听window对象的resize事件
window.addEventListener('resize', updateChart)

onMounted(() => {
  periodDataList.value = data
  // 初始化图表
  updateChart()

  if (intervalId === null) {
    intervalId = setInterval(updateChart, 10000) // 10秒执行一次
  }
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
      text: `2021-01-01 ${title}`,
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
