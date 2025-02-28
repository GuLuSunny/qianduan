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
    class="runoffDiv"
  ></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
// import data from '@/../public/json/fullscreenSampleJson/runOff.json' // 注意路径，可能需要调整
import { ElMessage, ElLoading } from 'element-plus'
import { findRunOff, findMonthRunOff } from '@/api/getData'

const chart = ref()
const chartData = ref([])
let myChart = null
const chartTitle = ref('')
const xTitle = ref('')
// 选择更具对比性的颜色
const colors = [
  '#FF4500', // 橙红色
  '#1E90FF', // 遇青色
  '#FF69B4', // 热粉色
  '#FFD700', // 金色
  '#32CD32' // 鳄梨绿
]

// 设备ID与线名的对应关系
const deviceNames = {
  22: '伊河东湾',
  23: '伊河陆浑坝下'
  // 可以添加更多的设备ID与线名的对应关系
}

// 定义接收的参数
const props = defineProps({
  jingLiuData: {
    type: Object,
    default: {
      time: '',
      device: '',
      type: 'month'
    }
  }
})

const loadingoptions = {
  // 加载配置
  target: '.runoffDiv',
  background: 'rgba(0, 0, 0, 0.7)',
  fullscreen: false,
  text: '数据加载中...'
}

// 监听 props 的变化
watch(
  () => [
    props.jingLiuData.time,
    props.jingLiuData.device,
    props.jingLiuData.type
  ],
  () => {
    getRunOff()
  }
)

// 监听window对象的resize事件
window.addEventListener('resize', updateChart)

onMounted(() => {
  props.jingLiuData.time='2021-09'
  getRunOff()
})

onBeforeUnmount(() => {
  // 销毁图表实例
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', updateChart)
})

/* 数据查询 */
function getRunOff () {
  if (props.jingLiuData.type === 'year') {
    // 年查询
    findYear()
  } else if (props.jingLiuData.type === 'month') {
    // 月查询
    findMonth()
  }
}
/* 年数据查询 */
function findYear () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 年查询
  findRunOff({
    year: props.jingLiuData.time,
    device: props.jingLiuData.device
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        // 处理成功的响应
        if (result.body.data === 0) {
          ElMessage({
            showClose: true,
            message: '数据不存在',
            center: true
          })
        } else {
          chartData.value = result.body.data.map((datas, index) => {
            return {
              x: datas.month,
              y: datas.monthAvg,
              device: datas.device
            }
          })
          chartTitle.value = result.body.year + '年径流曲线'
          xTitle.value='月'
          updateChart()
        }
      } else {
        // 处理失败的响应
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

/* 月数据查询 */
function findMonth () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 月查询
  findMonthRunOff({
    month: props.jingLiuData.time,
    device: props.jingLiuData.device
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        // 处理成功的响应
        if (result.body.data === 0) {
          ElMessage({
            showClose: true,
            message: '数据不存在',
            center: true
          })
        } else {
          chartData.value = result.body.data.map((datas, index) => {
            return {
              x: datas.day,
              y: datas.month,
              device: datas.device
            }
          })
          chartTitle.value = result.body.yearMonth + '月径流曲线'
          xTitle.value='月'
          updateChart()
        }
      } else {
        // 处理失败的响应
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取径流数据失败，请稍后再试',
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

  // 生成 series 配置
  const series = chartData.value.map((line, index) => {
    return {
      name: deviceNames[line.device] || line.device,
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: line.y,
      itemStyle: {
        color: colors[index % colors.length]
      }
    }
  })
  // 位置
  const grid = {
    // width:'80%',
    // height:'50%',
    left: gridleft,
    width: gridWidth,
    height: gridHeight,
    containLabel: true // 确保标签不会被裁剪
  }
  const option = {
    title: {
      text: chartTitle.value,
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 14
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
          tooltipHtml += `${item.seriesName}: ${item.data} m³/s<br/>` // 改为二位小数
        })
        return tooltipHtml
      }
    },
    legend: {
      data: series.map((item) => item.name),
      right: '10%',
      top: '10%',
      textStyle: {
        color: 'white'
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.value[0].x,
      name: xTitle.value,
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
      name: '流量 (m³)',
      nameTextStyle: {
        color: 'white'
      },
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
        formatter: (value) => value.toFixed(2), // 格式化为小数点后两位
        color: 'white'
      }
    },
    grid: grid,
    series: series
  }
  myChart.setOption(option, true) // 使用 true 参数强制更新图表
}
</script>

<style scoped>
/* 添加样式以确保图表正确显示 */
</style>
