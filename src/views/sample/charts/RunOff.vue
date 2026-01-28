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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import { findRunOffByMonth, getTimesByType } from '@/api/getData' // 导入 API 请求方法
import { ElMessage, ElLoading } from 'element-plus'

const chart = ref()
const chartData = ref([])
let myChart = null
const chartTitle = ref('')
const monthSelected = ref('') // 选择的月份

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
  54: '惠济河大王庙水文观测站',
  55: '涡河水文观测站'
  // 可以添加更多的设备ID与线名的对应关系
}

// 监听window对象的resize事件
window.addEventListener('resize', updateChart)

const showDateArr = ref([])
let firBool = false

// 请求日期
function handleVisibleChange (visibility, type, searchTimeType) {
  if (visibility) {
    // 开启时
    const searchType = searchTimeType
    getTimesByType({
      type: type,
      searchTimeType: searchType
    })
      .then((res) => {
        const result = res.response.value
        if (result.code === 'SUCCESS') {
          const type = result.body.type
          const date = result.body.date
          showDateArr.value = date
          if (date && date.length > 0) {
            const latestDate = date.sort((a, b) => b.localeCompare(a))[0]
            if (firBool === false) {
              monthSelected.value = latestDate // 设置最新月份为默认值
              getRunOffData()
              firBool = true
            }
          } else {
            ElMessage({
              showClose: true,
              message: '暂无可用数据',
              center: true,
              type: 'warning'
            })
          }
        } else {
          // 处理失败的响应
          ElMessage({
            showClose: true,
            message: result.msg,
            center: true,
            type: 'error'
          })
        }
      })
      .catch((error) => {
        ElMessage({
          showClose: true,
          message: '获取日期数据失败，请稍后再试',
          center: true,
          type: 'error'
        })
      })
  } else if (!visibility && monthSelected.value) {
    getRunOffData()
  }
}

// 获取径流数据
function getRunOffData () {
  if (!monthSelected.value) return
  
  const loadingInstance = ElLoading.service(loadingoptions)
  
  // 获取所有设备的数据（假设要获取设备54和55的数据）
  const deviceIds = [54, 55]
  const promises = deviceIds.map(deviceId => 
    findRunOffByMonth({ month: monthSelected.value, device: deviceId })
  )
  
  Promise.all(promises)
    .then(responses => {
      loadingInstance.close()
      
      // 处理所有响应
      const allData = []
      responses.forEach((res, index) => {
        const result = res.response.value
        if (result.code === 'SUCCESS' && result.body.data && result.body.data.length > 0) {
          const deviceId = deviceIds[index]
          const dataItem = result.body.data[0] // 取第一个数据项
          
          // 确保数据格式正确
          if (dataItem.day && dataItem.month) {
            allData.push({
              x: dataItem.day,
              y: dataItem.month,
              device: deviceId,
              flowdiff: dataItem.flowdiff,
              monthAvg: dataItem.monthAvg,
              monthMin: dataItem.monthMin,
              monthMax: dataItem.monthMax
            })
          }
          
          // 设置标题（使用第一个响应的yearMonth）
          if (index === 0) {
            chartTitle.value = result.body.yearMonth + '月径流'
          }
        }
      })
      
      if (allData.length === 0) {
        ElMessage({
          showClose: true,
          message: `月份 ${monthSelected.value} 暂无数据`,
          center: true,
          type: 'warning'
        })
        chartData.value = []
      } else {
        chartData.value = allData
      }
      
      // 更新图表
      updateChart()
    })
    .catch((error) => {
      loadingInstance.close()
      console.error('获取径流数据失败:', error)
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 加载配置
const loadingoptions = {
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

onMounted(() => {
  // 初始化时获取最新月份的数据
  handleVisibleChange(true, 'jingliu', 'month')
})

onBeforeUnmount(() => {
  // 销毁图表实例
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', updateChart)
})

function updateChart () {
  const viewportHeightInPx = window.innerHeight
  const viewportWidthInPx = window.innerWidth
  const gridleft = viewportWidthInPx * 0.003
  
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
    left: gridleft,
    width: gridWidth,
    height: gridHeight,
    containLabel: true // 确保标签不会被裁剪
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
  
  // 设置x轴数据（使用第一条数据的x轴）
  const xAxisData = chartData.value.length > 0 ? chartData.value[0].x : []

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
      data: xAxisData,
      name: '日',
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
      name: '流量 (m³/s)',
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