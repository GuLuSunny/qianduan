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
    class="waterLeverDiv"
  ></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
// import data from '@/../public/json/fullscreenSampleJson/waterLevel.json' // 注意路径，可能需要调整
import { findWaterlevelByYear, findWaterlevelByMonth } from '@/api/getData'
import { ElMessage, ElLoading } from 'element-plus'

const chart = ref()
let myChart = null
const chartData = ref([])
const chartTitle = ref('')
const xTitle = ref('')
const loadingoptions = {
  // 加载配置
  target: '.waterLeverDiv',
  fullscreen: false,
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

// 监听window对象的resize事件
window.addEventListener('resize', updateChart)
// 定义接收的参数
const props = defineProps({
  shuiWeiData: {
    type: Object,
    default: {
      time: '2021-12',
      type: 'month'
    }
  }
})

// 监听 props 的变化
watch(
  () => [props.shuiWeiData.time, props.shuiWeiData.type],
  (newValue, oldValue) => {
    getShuiWei()
  }
)

onMounted(() => {
  getShuiWei()
})
onBeforeUnmount(() => {
  // 销毁图表实例
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', updateChart)
})

/* 数据查询 */
function getShuiWei () {
  if (props.shuiWeiData.type === 'year') {
    // 年查询
    findYear()
  } else if (props.shuiWeiData.type === 'month') {
    // 月查询
    findMonth()
  }
}

/* 年数据查询 */
function findYear () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 年查询
  findWaterlevelByYear({
    year: props.shuiWeiData.time
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value // 处理成功的响应
      // console.log(result)
      if (result.code === 'SUCCESS') {
        // 处理数据
        const data = result.body
        chartData.value = {
          x: data.month,
          y: data.data,
          waterLevelDiff: data.waterdiff
        }
        chartTitle.value = props.shuiWeiData.time + '年径流曲线'
        xTitle.value='月'
        updateChart()
      } else {
        const message = result.msg
        // alert(message)
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
        message: '获取水位数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

/* 月数据查询 */
function findMonth () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 月查询
  findWaterlevelByMonth({
    month: props.shuiWeiData.time
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value // 处理成功的响应
      // console.log(result)
      if (result.code === 'SUCCESS') {
        // 处理数据
        const data = result.body

        chartData.value = {
          x: data.day,
          y: data.data,
          waterLevelDiff: data.waterdiff
        }
        chartTitle.value = props.shuiWeiData.time + '月径流曲线'
        xTitle.value='日'
        updateChart()
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
        message: '获取水位数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

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
  const days = chartData.value.x.split(',').map(Number) // x轴转换为数字类型
  const waterLevels = chartData.value.y
    .split(',')
    .map((val) => (val ? Number(val) : null)) // y轴转换为数字或空值

  const waterdiff = chartData.value.waterLevelDiff
    .split(',')
    .map((val) => (val ? Number(val) : null)) // y轴水位差转换为数字或空值

  let minWaterLevel = Math.min(...waterLevels.map((item) =>
      item ? item : 0x3f3f3f))
  let maxWaterLevel = Math.max(...waterLevels.map((item) =>
      item ? item : -0x3f3f3f))
  let minWaterLevelDiff = Math.min(...waterdiff.map((item) =>
      item ? item : 0x3f3f3f))
  let maxWaterLevelDiff = Math.max(...waterdiff.map((item) =>
      item ? item : -0x3f3f3f))
  const option = {
    title: {
      text: chartTitle.value,
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
      formatter: (params) => {
        let tooltipHtml = ''
        params.forEach((item) => {
          tooltipHtml += `${item.seriesName}: ${item.data} m<br/>` // 改为二位小数
        })
        return tooltipHtml
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
      data: days,
      name: xTitle.value,
      nameLocation: 'middle',
      nameTextStyle: {
        color: 'white'
      },
      nameGap: 25,
      axisPointer: {
        type: 'shadow'
      },
      axisLine: {
        show: true
      },
      axisTick: {
        show: false
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
        min: Math.floor(minWaterLevel - 1), // 动态计算最小值并减去一定偏移量
        max: Math.ceil(maxWaterLevel + 1), // 动态计算最大值并加上一定偏移量
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
        min: Math.floor(minWaterLevelDiff - 1), // 动态计算最小值并减去一定偏移量
        max: Math.ceil(maxWaterLevelDiff + 1), // 动态计算最大值并加上一定偏移量
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
        data: waterLevels,
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
        data: waterdiff,
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
