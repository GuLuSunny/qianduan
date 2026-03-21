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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { findWaterlevelByMonth, getTimesByType, queryDeviceByMultiWord } from '@/api/getData'
import { ElMessage, ElLoading } from 'element-plus'

const chart = ref()
let myChart = null
const monthSelected = ref('')
const deviceName = ref('')
const deviceOptions = ref([])

// 定义响应式变量来存储图表数据
const chartData = ref([])
const monthMax = ref(0)
const monthMin = ref(0)
const monthAvg = ref(0)
const minWaterLevelDiff = ref(0)
const maxWaterLevelDiff = ref(0)

// 加载配置
const loadingoptions = {
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

// 监听window对象的resize事件
window.addEventListener('resize', updateChart)

// 获取设备列表
async function fetchDeviceOptions() {
  try {
    const res = await queryDeviceByMultiWord({ type: '06' })
    if (res.response.value.code === 'SUCCESS') {
      deviceOptions.value = res.response.value.body
      if (deviceOptions.value.length > 0) {
        deviceName.value = deviceOptions.value[0].deviceName || ''
      }
    } else {
      ElMessage.error(res.response.value.msg)
    }
  } catch {
    ElMessage.error('获取设备数据失败，请稍后再试')
  }
}

const showDateArr = ref([])
let firBool = false

// 请求日期
function handleVisibleChange(visibility, type, searchTimeType) {
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
              getWaterLevelData()
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
  } else if (!visibility && monthSelected.value && deviceName.value) {
    getWaterLevelData()
  }
}

// 获取水位数据
function getWaterLevelData() {
  if (!monthSelected.value || !deviceName.value) return

  const loadingInstance = ElLoading.service(loadingoptions)

  findWaterlevelByMonth({
    month: monthSelected.value,
    deviceName: deviceName.value
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        const data = result.body
        if (!data.data || data.data === '') {
          ElMessage({
            showClose: true,
            message: `月份 ${monthSelected.value} 暂无数据`,
            center: true,
            type: 'warning'
          })
          // 重置数据
          resetChartData()
          updateChart()
          return
        }

        // 处理数据
        const days = data.day.split(',').map(Number)
        const waterLevels = data.data.split(',').map((val) => (val ? Number(val) : null))
        const monthMaxValue = parseFloat(data.monthMax)
        const monthMinValue = parseFloat(data.monthMin)
        const monthAvgValue = parseFloat(data.monthAvg)
        const waterdiff = data.waterdiff
          .split(',')
          .map((val) => (val ? Number(val) : null))

        // 创建chartData数组
        const newChartData = days.map((day, index) => ({
          name: day,
          waterLevel: waterLevels[index],
          waterLevelDiff: waterdiff[index]
        }))

        // 计算水位差的最小值和最大值
        const minWaterLevelDiffValue = Math.min(
          ...newChartData.map((item) =>
            item.waterLevelDiff ? item.waterLevelDiff : 0x3f3f3f
          )
        )
        const maxWaterLevelDiffValue = Math.max(
          ...newChartData.map((item) =>
            item.waterLevelDiff ? item.waterLevelDiff : -0x3f3f3f
          )
        )

        // 更新响应式变量
        chartData.value = newChartData
        monthMax.value = monthMaxValue
        monthMin.value = monthMinValue
        monthAvg.value = monthAvgValue
        minWaterLevelDiff.value = minWaterLevelDiffValue
        maxWaterLevelDiff.value = maxWaterLevelDiffValue

        // 更新图表
        updateChart()
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true,
          type: 'error'
        })
        resetChartData()
        updateChart()
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
      resetChartData()
      updateChart()
    })
}

// 重置图表数据
function resetChartData() {
  chartData.value = []
  monthMax.value = 0
  monthMin.value = 0
  monthAvg.value = 0
  minWaterLevelDiff.value = 0
  maxWaterLevelDiff.value = 0
}

onMounted(() => {
  // 先获取设备列表，然后获取最新月份的数据
  fetchDeviceOptions().then(() => {
    handleVisibleChange(true, 'shuiwei', 'month')
  })
})

onBeforeUnmount(() => {
  // 销毁图表实例
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', updateChart)
})

function updateChart() {
  // 视图大小
  const viewportHeightInPx = window.innerHeight
  const viewportWidthInPx = window.innerWidth
  const gridleft = viewportWidthInPx * 0.003

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
    left: gridleft,
    width: gridWidth,
    height: gridHeight,
    containLabel: true // 确保标签不会被裁剪
  }

  const option = {
    title: {
      text: `${monthSelected.value} ${deviceName.value}平均水位`,
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
      data: chartData.value.map((item) => item.name),
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
        min: monthMin.value ? Math.floor(monthMin.value) - 1 : 0,
        max: monthMax.value ? Math.floor(monthMax.value) + 1 : 100,
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
        min: minWaterLevelDiff.value ? Math.floor(minWaterLevelDiff.value) - 1 : -10,
        max: maxWaterLevelDiff.value ? Math.floor(maxWaterLevelDiff.value) + 1 : 10,
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
        data: chartData.value.map((item) => item.waterLevel),
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
        data: chartData.value.map((item) => item.waterLevelDiff),
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