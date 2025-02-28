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
  ></div>
</template>

<script setup>
import { ref, onMounted, watch,onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import data from '@/../public/json/fullscreenSampleJson/waterLevel.json' // 注意路径，可能需要调整

const chart = ref()
let myChart = null


// 监听window对象的resize事件
window.addEventListener('resize', updateChart)


onMounted(() => {
  updateChart()
})
onBeforeUnmount(() => {
  // 销毁图表实例
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', updateChart);
})

function updateChart () {
  // 视图大小
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
    aHeight = 0.15
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

  // 处理数据
  const days = data.day.split(',').map(Number)
  const waterLevels = data.data
    .split(',')
    .map((val) => (val ? Number(val) : null)) // 转换为数字或空值
  const monthMax = parseFloat(data.monthMax)
  const monthMin = parseFloat(data.monthMin)
  const monthAvg = parseFloat(data.monthAvg)
  const waterdiff = data.waterdiff
    .split(',')
    .map((val) => (val ? Number(val) : null)) // 转换为数字或空值
  const chartData = days.map((day, index) => ({
    name: day,
    waterLevel: waterLevels[index],
    waterLevelDiff: waterdiff[index]
  }))

  const minWaterLevelDiff = Math.min(
    ...chartData.map((item) =>
      item.waterLevelDiff ? item.waterLevelDiff : 0x3f3f3f
    )
  ) // 月最小水位差
  const maxWaterLevelDiff = Math.max(
    ...chartData.map((item) =>
      item.waterLevelDiff ? item.waterLevelDiff : -0x3f3f3f
    )
  ) // 月最大水位差

  const option = {
    title: {
      text: `2021-12月平均水位柱状图`,
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
      }
    },
    legend: {
      data: ['水位', '水位差'],
      top: '10%',
      right: '20%',
      textStyle: {
        color: 'white'
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.map((item) => item.name),
      name: '日',
      nameLocation: 'middle',
      nameTextStyle: {
        color: 'white'
      },
      nameGap: 25,
      axisTick: {
        show: false
      },
      axisLine: {
        show: true
      },
      axisLabel: {
        color: 'white'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '水位/m',
        nameTextStyle: {
          color: 'white'
        },
        min: Math.floor(monthMin) - 1, // 动态计算最小值并减去一定偏移量
        max: Math.floor(monthMax) + 1, // 动态计算最大值并加上一定偏移量
        position: 'left',
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
      {
        type: 'value',
        name: '水位差/m',
        nameTextStyle: {
          color: 'white'
        },
        min: Math.floor(minWaterLevelDiff) - 1, // 动态计算最小值并减去一定偏移量
        max: Math.floor(maxWaterLevelDiff) + 1, // 动态计算最大值并加上一定偏移量
        position: 'right',
        splitLine: {
          show: false
        },
        axisLabel: {
          color: 'white'
        }
      }
    ],
    series: [
      {
        name: '水位',
        type: 'bar',
        data: chartData.map((item) => item.waterLevel),
        itemStyle: {
          color: '#0AADA3'
        },
        barWidth: '60%'
      },
      {
        name: '水位差',
        type: 'line',
        yAxisIndex: 1,
        showSymbol: false,
        data: chartData.map((item) => item.waterLevelDiff),
        itemStyle: {
          color: '#FF9C0C'
        }
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
