<template>
  <div
    ref="chart"
    style="
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    "
  >
    123
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import data from '@/../public/json/fullscreenSampleJson/spectralReflectance.json' // 注意路径，可能需要调整
import * as echarts from 'echarts'

const chart = ref()
const chartData = ref([])
let myChart = null

// 更新颜色列表
const colors = [
  '#FF4500', // 橙红色
  '#1E90FF', // 遇青色
  '#32CD32', // 鳄梨绿
  '#FFD700', // 金色
  '#FF69B4', // 热粉色
  '#8A2BE2' // 蓝紫色
]

// 监听window对象的resize事件
window.addEventListener('resize', updateChart)

onMounted(() => {
  // 处理数据
  chartData.value = data.map((item) => {
    const wavelengths = item.wavelength.split(',').map(Number)
    const data = item.data.split(',').map(Number)
    return {
      name: item.deviceName, // 假设每个对象有一个 name 属性来标识这条线
      data: wavelengths.map((wavelength, index) => [wavelength, data[index]])
    }
  })
  // 初始化图表
  updateChart()
})

onBeforeUnmount(() => {
  // 销毁图表实例
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', updateChart)
})

function updateChart () {
  // 页面大小设置
  const viewportHeightInPx = window.innerHeight
  const viewportWidthInPx = window.innerWidth
  // const gridHeight = viewportHeightInPx * 0.14
  // const gridWidth = viewportWidthInPx * 0.23
  const gridleft = viewportWidthInPx * 0.003
  // console.log('viewportHeightInPx:', viewportHeightInPx)
  // console.log('viewportWidthInPx:', viewportWidthInPx)
  let aHeight = 0.14
  let aWidth = 0.23
  if (viewportHeightInPx > 850 && viewportHeightInPx < 920) {
    aHeight = 0.14
    aWidth = 0.23
  }
  if (viewportHeightInPx > 1000 && viewportHeightInPx < 1100) {
    aHeight = 0.16
    aWidth = 0.23
  }
  if (viewportHeightInPx > 650 && viewportHeightInPx < 750) {
    aHeight = 0.12
    aWidth = 0.23
  }

  const gridHeight = viewportHeightInPx * aHeight
  const gridWidth = viewportWidthInPx * aWidth
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
  if (!myChart || myChart === undefined) {
    myChart = echarts.init(chart.value)
  }

  // 位置
  const grid = {
    // width:'80%',
    // height:'50%',
    left: gridleft,
    width: gridWidth,
    height: gridHeight,
    containLabel: true // 确保标签不会被裁剪
  }

  // 生成 series 配置
  const series = chartData.value.map((line, index) => ({
    name: line.name,
    type: 'line',
    smooth: true,
    showSymbol: false,
    data: line.data,
    itemStyle: {
      color: colors[index % colors.length]
    }
  }))

  const option = {
    title: {
      text: '2021-05-20日陆浑湖水库光谱反射率曲线',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 14 // 设置为想要的字体大小，例如 14
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      // 使用回调函数来设置 tooltip 的位置
      position: function (point, params, dom, rect, size) {
        // point 是鼠标当前的坐标
        // size.viewSize 是容器的大小
        // 我们希望 tooltip 在垂直方向上偏移容器高度的 10%，并且跟随鼠标水平移动
        const viewHeight = size.viewSize[1] // 容器的高度
        const verticalOffset = -viewHeight * 0.1 // 垂直方向偏移量，为容器高度的 10%

        // 水平方向上，我们让 tooltip 跟随鼠标移动
        // 但要注意不要超出容器的边界
        const boxWidth = size.contentSize[0] // tooltip 的宽度
        let x = point[0] // 鼠标的 x 坐标
        if (x + boxWidth > size.viewSize[0]) {
          // 如果 tooltip 超出容器的右边界
          x = size.viewSize[0] - boxWidth // 则将 x 坐标调整为容器右边界减去 tooltip 宽度
        } else if (x < 0) {
          // 如果 tooltip 超出容器的左边界
          x = 0 // 则将 x 坐标调整为 0
        }

        // 垂直方向上，我们设置一个固定的偏移量
        let y = point[1] - verticalOffset // 鼠标的 y 坐标减去垂直偏移量
        // 如果 tooltip 超出容器的上边界，则需要进行调整
        const boxHeight = size.contentSize[1] // tooltip 的高度
        if (y < 0) {
          y = 0 // 确保 tooltip 不会超出容器的上边界
        }

        // 返回 tooltip 的位置
        return [x, y]
      },
      formatter: (params) => {
        let tooltipHtml = ''
        params.forEach((item) => {
          tooltipHtml += `${item.seriesName}: ${item.data[1].toFixed(3)} %<br/>`
        })
        return tooltipHtml
      }
    },
    legend: {
      data: series.slice(0, 9).map((item) => item.name),
      right: '5%',
      top: '10%',
      height:'60px',
      width:'60px',
      textStyle: {
        color: 'white'
      },
       orient: 'vertical',//'horizontal'表示水平排列，'vertical'表示垂直排列
       itemHeight: 4, // 图标的高度
    },
    xAxis: {
      type: 'value',
      name: '波长 (nm)',
      nameLocation: 'middle',
      nameTextStyle: {
        color: 'white'
      },
      nameGap: 25,
      min: 400,
      max: 1000,
      interval: 50,
      splitLine: {
        show: false
      },
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      axisLabel: {
        color: 'white'
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: false
      },
      name: '反射率 (%)',
      nameTextStyle: {
        color: 'white'
      },
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      axisLabel: {
        formatter: (value) => value.toFixed(3), // 格式化为小数点后三位
        color: 'white'
      }
    },
    series: series,
    grid: grid
  }
  myChart.setOption(option, true)
}
</script>

<style scoped>
/* 添加样式以确保图表正确显示 */
</style>
