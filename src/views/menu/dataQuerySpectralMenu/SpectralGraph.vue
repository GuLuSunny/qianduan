<template>
  <div class="container">
    <div class="controls">
      <el-form-item label="日期：">
        <el-date-picker
          v-model="dateSelected"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placement="bottom"
          :clearable="false"
          @visible-change="
            (visibility) => handleVisibleChange(visibility, 'guangpu', 'day')
          "
          :disabled-date="(time) => disabledDate(time, 'guangpu', 'day')"
        ></el-date-picker>
      </el-form-item>
    </div>
    <div class="chart-container" ref="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, getCurrentInstance } from 'vue'
import * as echarts from 'echarts'
import { findReflectanceByTimeAndDevice, getTimesByType } from '@/api/getData'
import { ElMessage, ElLoading } from 'element-plus'

const chart = ref()
const chartData = ref([])
const dateSelected = ref('')
const device = ref('')
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

const colors = [
  '#FF4500', // 橙红色
  '#1E90FF', // 遇青色
  '#32CD32', // 鳄梨绿
  '#FFD700', // 金色
  '#FF69B4', // 热粉色
  '#8A2BE2' // 蓝紫色
]

// watch(
//   () => [dateSelected.value, device.value],
//   () => {
//     getReflectance()
//   }
// )

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      // 在 DOM 更新后执行
      handleVisibleChange(true, 'guangpu', 'day')
    })
  }
})

const showDateArr = ref([])
// 可用日期
function disabledDate (time, type, searchTimeType) {
  if (showDateArr.value == null || showDateArr.value.length === 0) {
    return true
  }
  const customString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`
  const isTimeInArray = showDateArr.value.includes(customString)
  return !isTimeInArray
}
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
              dateSelected.value = latestDate // 设置最新日期为默认值
              getReflectance()
              firBool = true
            }
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
        ElMessage({
          showClose: true,
          message: '获取数据失败，请稍后再试',
          center: true,
          type: 'error'
        })
      })
  } else if (!visibility) {
    getReflectance()
  }
}

function getReflectance () {
  const loadingInstance = ElLoading.service(loadingoptions)
  findReflectanceByTimeAndDevice({
    time: dateSelected.value,
    device: device.value
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        if (result.body.length === 0) {
          ElMessage({
            showClose: true,
            message: '数据不存在',
            center: true
          })
        } else {
          chartData.value = result.body
            .map((item) => {
              const wavelengths = item.wavelength.split(',').map(Number)
              const data = item.data.split(',').map(Number)
              return {
                name: item.deviceName,
                data: wavelengths.map((wavelength, index) => [
                  wavelength,
                  data[index]
                ])
              }
            })
            .sort((a, b) => parseInt(a.name) - parseInt(b.name))
          updateChart()
        }
      } else {
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

function updateChart () {
  const myChart = echarts.init(chart.value)
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
      text: dateSelected.value + ' 光谱反射率曲线',
      left: 'center'
    },
    toolbox: {
      orient: 'vertical',
      feature: {
        saveAsImage: {}
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
      valueFormatter: (value) => value + '%'
    },
    legend: {
      // 图例
      data: series.map((item) => item.name),
      orient: 'vertical',
      right: '5%',
      top: '10%',
      height: '350px',
      itemGap: 30,
      align: 'auto',
      textStyle: {
        color: 'black'
      },
      selector: ['all', 'inverse']
    },
    grid: {
      left: '3%',
      right: '20%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '波长 (nm)',
      nameLocation: 'middle',
      nameTextStyle: {
        color: 'black'
      },
      nameGap: 25,
      min: 400,
      max: 1000,
      interval: 50,
      axisLabel: {
        color: 'black'
      }
    },
    yAxis: {
      type: 'value',
      name: '反射率 (%)',
      nameTextStyle: {
        color: 'black'
      },
      axisLabel: {
        formatter: (value) => value.toFixed(3),
        color: 'black'
      }
    },
    series: series
  }
  myChart.setOption(option)
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.controls {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 50px;
}

.el-date-picker {
  background-color: white;
}

.chart-container {
  width: 100%;
  height: 500px;
}
</style>
