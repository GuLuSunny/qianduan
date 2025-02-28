<template>
  <div class="controls">
    <el-form-item label="选择地点：" style="width: 15%">
      <el-select
        v-model="sitePicked"
        placeholder="伊河东湾"
        @change="updateChart()"
         :disabled="isLoading"
      >
        <el-option
          v-for="device in deviceOptions"
          :key="device.id"
          :label="device.deviceName"
          :value="device.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="日期：">
      <el-date-picker
        v-model="datePicked"
        :type="isMonthView ? 'month' : 'year'"
        :value-format="isMonthView ? 'YYYY-MM' : 'YYYY'"
        :clearable="false"
        @visible-change="
          (visibility) =>
            handleVisibleChange(
              visibility,
              'jingliu',
              isMonthView ? 'month' : 'year'
            )
        "
        :disabled-date="
          (time) =>
            disabledDate(time, 'jingliu', isMonthView ? 'month' : 'year')
        "
      />
    </el-form-item>
    <el-button @click="toggleView">{{
      isMonthView ? '切换到年视图' : '切换到月视图'
    }}</el-button>
  </div>
  <div class="chart-container" ref="chart"></div>
  <!-- 表格数据 -->
  <div v-if="isMonthView" class="data-table" style="margin-left: 15%">
    <!-- 月数据表格 -->
    <el-table
      :data="monthData"
      border="true"
      style="width: 60%; height: auto; table-layout: fixed"
      :header-cell-style="{ backgroundColor: '#f2f2f2' }"
    >
      <el-table-column
        prop="monthMin"
        label="月最低径流量（m³）"
        align="center"
      />
      <el-table-column
        prop="monthAvg"
        label="月平均径流量（m³）"
        align="center"
      />
      <el-table-column
        prop="monthMax"
        label="月最大径流量（m³）"
        align="center"
      />
    </el-table>
  </div>
  <div v-if="!isMonthView" class="data-table" style="margin-left: 15%">
    <!-- 年数据表格 -->
    <el-table
      :data="yearData"
      border="true"
      style="width: 60%; height: auto; table-layout: fixed"
      :header-cell-style="{ backgroundColor: '#f2f2f2' }"
    >
      <el-table-column
        prop="yearMin"
        label="年最低径流量（m³）"
        align="center"
      />
      <el-table-column
        prop="yearAvg"
        label="年平均径流量（m³）"
        align="center"
      />
      <el-table-column
        prop="yearMax"
        label="年最大径流量（m³）"
        align="center"
      />
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, getCurrentInstance } from 'vue'
import * as echarts from 'echarts'
import {
  findRunOffByMonth,
  findRunOffByYear,
  getTimesByType,
  queryDeviceByMultiWord
} from '@/api/getData'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

const monthDate = ref('')
const yearDate = ref('')
const datePicked = ref('')
const sitePicked = ref(null)
const isLoading = ref(true) // 加载状态
const chart = ref()
const deviceOptions = ref([])
const yearData = ref([])
const monthData = ref([])
const isMonthView = ref(true) // true:月，false：年
let myChart = null
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
// watch(
//   () => datePicked.value,
//   () => {
//     isMonthView.value
//       ? (monthDate.value = datePicked.value)
//       : (yearDate.value = datePicked.value)
//     updateChart()
//   }
// )
// watch(
//   () => sitePicked.value,
//   () => {
//     updateChart()
//   }
// )

// Computed property to get the selected device name
const selectedDeviceName = computed(() => {
  const device = deviceOptions.value.find((d) => d.id === sitePicked.value)
  return device ? device.deviceName : ''
})
// Fetch device options  
function fetchDeviceOptions() {  
  isLoading.value = true; // 开始加载数据  
  queryDeviceByMultiWord({ type: '02' })  
    .then((res) => {  
      if (res.response.value.code === 'SUCCESS') {  
        deviceOptions.value = res.response.value.body  
        sitePicked.value = deviceOptions.value.length > 0 ? deviceOptions.value[0].id : null; // 设置为第一个设备的 ID  
      } else {  
        ElMessage.error(res.response.value.msg)  
      }  
    })  
    .catch(() => {  
      ElMessage.error('获取设备数据失败，请稍后再试')  
    })  
    .finally(() => {  
      isLoading.value = false; // 加载完成  
    });  
} 
const showDateArr = ref([])
// 可用日期
function disabledDate (time, type, searchTimeType) {
  if (showDateArr.value == null || showDateArr.value.length === 0) {
    return true
  }
  let customString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`
  if (searchTimeType === 'year') {
    // year
    customString = `${time.getFullYear()}`
  } else if (searchTimeType === 'month') {
    // month
    customString = `${time.getFullYear()}-${(time.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`
  }
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
              datePicked.value = latestDate // 设置最新日期为默认值
              firBool = true
              isMonthView.value
                ? (monthDate.value = datePicked.value)
                : (yearDate.value = datePicked.value)
              updateChart()
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
    isMonthView.value
      ? (monthDate.value = datePicked.value)
      : (yearDate.value = datePicked.value)
    updateChart()
  }
}

// 创建月视图图表配置
function createMonthChartOptions (data) {
  const days = data.day
  const flows = data.month
  const monthMax = data.monthMax
  const monthMin = data.monthMin
  const monthAvg = data.monthAvg
  monthData.value = [{ monthMax, monthMin, monthAvg }]

  return {
    title: {
      text: `${datePicked.value} ${selectedDeviceName.value} 径流变化分析`,
      left: 'center',
      top: '0%'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: function (params) {
        // params 是一个数组，包含了当前触发 tooltip 显示的所有数据项的信息
        let titleStr = ''
        titleStr += params[0].name + '日<br/>'
        const table =
          '<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">'
        const tr = '<tr>'
        const td1 = '<td style="width: 20px; padding-right: 8px;"> '
        const td2 =
          ' <td style="font-size: 14px; color: #666; font-weight: 400; padding-right: 10px;">'
        const td3 =
          '<td style="font-size: 14px; color: #666; font-weight: 900; text-align: left;"> '
        const tableEnd = '</table">'
        const trEnd = '</tr>'
        const tdEnd = '</td>'
        titleStr += table
        params.forEach(function (item) {
          titleStr += tr + td1 + item.marker + tdEnd
          titleStr += td2 + item.seriesName + tdEnd
          titleStr += td3 + item.value + 'm³' + tdEnd
          titleStr += trEnd
        })
        titleStr += tableEnd
        return titleStr
      }
    },
    grid: {
      left: '3%',
      right: '20%',
      bottom: '3%',
      containLabel: true
    },
    legend: {
      data: ['月最高径流量', '月最低径流量', '月平均径流量'],
      selectedMode: false,
      orient: 'vertical',
      right: '10%',
      top: '20%',
      itemGap: 30,
      align: 'auto',
      textStyle: {
        color: 'black'
      }
    },
    toolbox: {
      orient: 'vertical',
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      data: days,
      axisLabel: {
        interval: 0
      },
      name: '日期/日'
    },
    yAxis: {
      type: 'value',
      name: '径流量/m³',
      min: monthMin - 10,
      axisLabel: {
        formatter: (value) => value.toFixed(2)
      },
      axisTick: { show: true },
      axisLine: { show: true }
    },
    series: [
      {
        name: '径流量',
        type: 'bar',
        data: flows.map((flow) => ({
          value: flow,
          itemStyle: {
            color:
              flow === monthMax
                ? '#aa6957'
                : flow === monthMin
                  ? '#808080'
                  : '#768eb0'
          },
          label: {
            rotate: 90,
            align: 'left',
            verticalAlign: 'middle',
            position: 'insideBottom',
            distance: 15,
            show: true,
            fontSize: 16
          }
        })),
        z: 2
      },
      {
        name: '月最高径流量',
        type: 'line',
        data: Array(days.length).fill(monthMax),
        itemStyle: {
          color: '#aa6957'
        },
        lineStyle: {
          type: 'dashed'
        },
        showSymbol: false,
        z: 1
      },
      {
        name: '月最低径流量',
        type: 'line',
        data: Array(days.length).fill(monthMin),
        itemStyle: {
          color: '#808080'
        },
        lineStyle: {
          type: 'dashed'
        },
        showSymbol: false,
        z: 1
      },
      {
        name: '月平均径流量',
        type: 'line',
        data: Array(days.length).fill(monthAvg),
        itemStyle: {
          color: '#768eb0'
        },
        lineStyle: {
          type: 'dashed'
        },
        showSymbol: false,
        z: 1
      }
    ]
  }
}

// 创建年视图图表配置
function createYearChartOptions (data) {
  const months = data.month
  const flows = data.monthAvg
  const yearMax = data.yearMax
  const yearMin = data.yearMin
  const yearAvg = data.yearAvg
  const monthMin = data.monthMin
  const monthMax = data.monthMax
  yearData.value = [{ yearMax, yearMin, yearAvg }]

  return {
    title: {
      text: `${datePicked.value} ${selectedDeviceName.value} 年径流量变化图`,
      left: 'center',
      top: '0%'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: function (params) {
        // params 是一个数组，包含了当前触发 tooltip 显示的所有数据项的信息
        let titleStr = ''
        titleStr += params[0].name + '月<br/>'
        const table =
          '<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">'
        const tr = '<tr>'
        const td1 = '<td style="width: 20px; padding-right: 8px;"> '
        const td2 =
          ' <td style="font-size: 14px; color: #666; font-weight: 400; padding-right: 10px;">'
        const td3 =
          '<td style="font-size: 14px; color: #666; font-weight: 900; text-align: left;"> '
        const tableEnd = '</table">'
        const trEnd = '</tr>'
        const tdEnd = '</td>'
        titleStr += table
        params.forEach(function (item) {
          titleStr += tr + td1 + item.marker + tdEnd
          titleStr += td2 + item.seriesName + tdEnd
          titleStr += td3 + item.value + 'm³' + tdEnd
          titleStr += trEnd
        })
        titleStr += tableEnd
        return titleStr
      }
    },
    legend: {
      data: ['最低径流量', '平均径流量', '最高径流量'],
      selectedMode: false,
      orient: 'vertical',
      right: '10%',
      top: '20%',
      itemGap: 30,
      align: 'auto',
      textStyle: {
        color: 'black'
      }
    },
    grid: {
      left: '3%',
      right: '20%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      show: true,
      orient: 'vertical',
      left: 'right',
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: [
      {
        type: 'category',
        axisTick: { show: true },
        data: months,
        name: '日期/月',
        axisLabel: {
          show: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '径流量/m³',
        min: 0,
        axisLabel: {
          formatter: (value) => value.toFixed(2)
        },
        axisTick: { show: true },
        axisLine: { show: true }
      }
    ],
    series: [
      {
        name: '最低径流量',
        type: 'bar',
        data: monthMin,
        barGap: 0,
        emphasis: { focus: 'series' }
      },
      {
        name: '平均径流量',
        type: 'bar',
        data: flows,
        barGap: 0,
        emphasis: { focus: 'series' }
      },
      {
        name: '最高径流量',
        type: 'bar',
        data: monthMax,
        barGap: 0,
        emphasis: { focus: 'series' }
      }
    ]
  }
}

function updateChart () {
  if (myChart) {
    myChart.dispose()
  }
  const fetchData = isMonthView.value ? findRunOffByMonth : findRunOffByYear
  const date = isMonthView.value ? monthDate : yearDate
  const loadingInstance = ElLoading.service(loadingoptions)
  fetchData({
    [isMonthView.value ? 'month' : 'year']: date.value,
    device: sitePicked.value
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        const data = result.body.data
        // Check if the data exists and is valid
        if (data && data.length !== 0) {
          const chartData = data[0]
          // Check if both month and day arrays are empty
          if (
            chartData.month &&
            chartData.month.length === 0 &&
            chartData.day &&
            chartData.day.length === 0
          ) {
            ElMessage({
              showClose: true,
              message: '数据不存在',
              center: true,
              type: 'error'
            })
            return // Exit the function early
          }
          const options = isMonthView.value
            ? createMonthChartOptions(chartData)
            : createYearChartOptions(chartData)
          myChart = echarts.init(chart.value)
          myChart.setOption(options)
        } else {
          ElMessage({
            showClose: true,
            message: '数据不存在',
            center: true,
            type: 'error'
          })
        }
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true,
          type: 'error'
        })
      }
    })
    .catch(() => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '数据获取失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

const toggleView = () => {
  isMonthView.value = !isMonthView.value
  if (isMonthView.value) {
    monthDate.value = datePicked.value
  } else {
    yearDate.value = datePicked.value
  }
  firBool = false
  handleVisibleChange(true, 'jingliu', isMonthView.value ? 'month' : 'year')
}

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      fetchDeviceOptions()
      handleVisibleChange(true, 'jingliu', 'month')
    })
  }
})
</script>

<style scoped>
.controls {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.chart-container {
  height: 500px;
  width: 100%;
}

.data-table {
  margin: 20px 0;
}
</style>
