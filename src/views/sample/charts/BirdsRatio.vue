<template>
  <div ref="chart" style="
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    "></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import data from '@/../public/json/fullscreenSampleJson/birdsRatio.json' // 注意路径，可能需要调整
import * as echarts from 'echarts'
const chart = ref()
let myChart = null
const chartTitle = ref('')
const totalNum = ref(0)
let birdData = null

// 监听window对象的resize事件
window.addEventListener('resize', updateChart)


onMounted(() => {
  chartTitle.value = data.month
  totalNum.value = data.sum
  birdData = data.data.map((item) => ({
    name: item.speciesId,
    value: item.num,
    percentage: item.percentage
  }))
  birdData = processBirdData()
  // 初始化图表
  updateChart()
})

onBeforeUnmount(() => {
  // 销毁图表实例
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', updateChart);
})

function processBirdData() {
  birdData.sort((a, b) => b.value - a.value)
  const topFive = birdData.slice(0, 5)
  const others = birdData.slice(5)
  const othersSum = others.reduce((sum, item) => sum + item.value, 0)
  if (othersSum > 0) {
    const othersTooltip = others
      .map((item) => `${item.name}: ${item.value}`)
      .join('<br/>')
    topFive.push({
      name: '其他',
      value: othersSum,
      tooltip: { formatter: othersTooltip }
    })
  }
  birdData = topFive.map((item) => {
    item.label = {
      formatter: '{b} ({c})'
    }
    return item
  })
  return topFive
}

function updateChart() {

  const viewportHeightInPx = window.innerHeight
  const viewportWidthInPx = window.innerWidth
  // const gridHeight = viewportHeightInPx * 0.14
  // const gridWidth = viewportWidthInPx * 0.23
  const gridleft = viewportWidthInPx * 0.003
  // console.log('viewportHeightInPx:', viewportHeightInPx)
  // console.log('viewportWidthInPx:', viewportWidthInPx)
  let radiusPre = '75%'
  if (viewportHeightInPx > 850 && viewportHeightInPx < 920) {
    radiusPre = '75%'
  }
  if (viewportHeightInPx > 1000 && viewportHeightInPx < 1100) {
    radiusPre = '75%'
  }
  if (viewportHeightInPx > 650 && viewportHeightInPx < 750) {
    radiusPre = '70%'
  }

  if (myChart) {
    myChart.dispose()
    myChart = null
  }
  if (!myChart || myChart === undefined) {
    myChart = echarts.init(chart.value)
  }
  const option = {
    title: {
      text: chartTitle.value + '野外水鸟调查', // 使用返回的时间作为标题
      left: 'center',
      top: 'top',
      textStyle: {
        color: '#fff',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item',
      valueFormatter: (value) => value
    },
    series: [
      {
        name: '水鸟数量',
        type: 'pie',
        radius: radiusPre, // 将饼状图的半径增大到 70%
        center: ['50%', '55%'], // 将图表垂直位置向上移动
        data: birdData,
        label: {
          color: '#fff' // 设置标签字体颜色为白色
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],
    graphic: {
      type: 'text',
      left: '3%',
      top: '4%',
      style: {
        text: '总数量：' + totalNum.value + '',
        textAlign: 'center',
        fill: 'white',
        fontSize: 14
      }
    }
  }
  myChart.setOption(option, true)
}
</script>

<style scoped>
/* 添加样式以确保图表正确显示 */
.birdsratioClass {
  left: 15%;
  width: 340px;
  height: 240px;
  display: flex;
  place-items: center;
}
</style>
