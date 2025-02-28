<template>
  <div class="controls">
    <el-form-item label="观测站点:" style="width: 15%">
      <el-select v-model="deviceName" placeholder="陆浑水库" :disabled="isLoading">
        <el-option
          v-for="item in locations"
          :key="item.id"
          :label="item.deviceName"
          :value="item.deviceName"
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
              'shuiwei',
              isMonthView ? 'month' : 'year'
            )
        "
        :disabled-date="
          (time) =>
            disabledDate(time, 'shuiwei', isMonthView ? 'month' : 'year')
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
    <el-table
      :data="monthData"
      border="true"
      style="width: 60%; height: auto; table-layout: fixed"
      :header-cell-style="{ backgroundColor: '#f2f2f2' }"
    >
      <el-table-column prop="monthMin" label="月最小水位（m）" align="center" />
      <el-table-column prop="monthAvg" label="月平均水位（m）" align="center" />
      <el-table-column prop="monthMax" label="月最大水位（m）" align="center" />
    </el-table>
  </div>
  <div v-if="!isMonthView" class="data-table" style="margin-left: 15%">
    <el-table
      :data="yearData"
      border="true"
      style="width: 60%; height: auto; table-layout: fixed"
      :header-cell-style="{ backgroundColor: '#f2f2f2' }"
    >
      <el-table-column prop="yearMin" label="年最小水位（m）" align="center" />
      <el-table-column prop="yearAvg" label="年平均水位（m）" align="center" />
      <el-table-column prop="yearMax" label="年最大水位（m）" align="center" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, getCurrentInstance } from 'vue'
import * as echarts from 'echarts'
import {
  findWaterlevelByMonth,
  findWaterlevelByYear,
  queryDeviceByMultiWord,
  getTimesByType
} from '@/api/getData'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

const monthDate = ref('')
const yearDate = ref('')
const datePicked = ref('')
const deviceName = ref('')
const chart = ref()
const yearData = ref([])
const monthData = ref([])
const isMonthView = ref(true)
const locations = ref([])
const isLoading = ref(true) // 加载状态
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
const createMonthChartOptions = (data) => {
  const days = data.day.split(',').map(Number)
  const waterLevels = data.data.split(',').map(Number) // 转换为数字
  const monthMax = parseFloat(data.monthMax)
  const monthMin = parseFloat(data.monthMin)
  const monthAvg = parseFloat(data.monthAvg)

  monthData.value = [
    {
      monthMax: monthMax,
      monthMin: monthMin,
      monthAvg: monthAvg
    }
  ]

  return {
    title: {
      text: monthDate.value + ' ' + deviceName.value + '水位变化图',
      left: 'center', // 将标题水平居中
      top: '0%' // 将标题向上移动
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
      data: ['月最高水位', '月最低水位', '月平均水位'],
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
      name: '水位/m',
      min: monthMin - 0.1,
      axisLabel: {
        formatter: (value) => value.toFixed(2)
      },
      axisTick: { show: true },
      axisLine: { show: true }
    },
    series: [
      {
        name: '水位',
        type: 'bar',
        data: waterLevels.map((waterLevel) => ({
          value: waterLevel,
          itemStyle: {
            color:
              waterLevel === monthMax
                ? '#aa6957'
                : waterLevel === monthMin
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
        name: '月最高水位',
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
        name: '月最低水位',
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
        name: '月平均水位',
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
const createYearChartOptions = (data) => {
  const months = data.month.split(',').map(Number)
  const waterLevels = data.data.split(',').map(Number) // 转换为数字
  const yearMax = parseFloat(data.yearMax)
  const yearMin = parseFloat(data.yearMin)
  const yearAvg = parseFloat(data.yearAvg)
  const monthMin = data.monthMin.split(',').map(Number)
  const monthMax = data.monthMax.split(',').map(Number)
  yearData.value = [
    {
      yearMax: yearMax,
      yearMin: yearMin,
      yearAvg: yearAvg
    }
  ]
  return {
    title: {
      text: yearDate.value + '年' + deviceName.value + '水位变化图',
      left: 'center', // 将标题水平居中
      top: '0%' // 将标题向上移动
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
    legend: {
      data: ['最低水位', '平均水位', '最高水位'],
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
        name: '水位/m',
        min: Math.min(...waterLevels) - 4,
        data: waterLevels,
        axisLabel: {
          formatter: (value) => value.toFixed(2) // 保留两位小数
        },
        axisTick: { show: true },
        axisLine: { show: true }
      }
    ],
    series: [
      {
        name: '最低水位',
        type: 'bar',
        data: monthMin,
        barGap: 0,
        emphasis: { focus: 'series' }
      },
      {
        name: '平均水位',
        type: 'bar',
        data: waterLevels,
        barGap: 0,
        emphasis: { focus: 'series' }
      },
      {
        name: '最高水位',
        type: 'bar',
        data: monthMax,
        barGap: 0,
        emphasis: { focus: 'series' }
      }
    ]
  }
}

function updateChart () {
  // 销毁现有的图表实例
  if (myChart) {
    myChart.dispose()
  }
  // 根据视图类型选择不同的数据请求
  const fetchData = isMonthView.value
    ? findWaterlevelByMonth
    : findWaterlevelByYear
  const date = isMonthView.value ? monthDate : yearDate
  const loadingInstance = ElLoading.service(loadingoptions)
  fetchData({
    [isMonthView.value ? 'month' : 'year']: date.value,
    deviceName: deviceName.value
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value // 处理成功的响应
      if (result.code === 'SUCCESS') {
        // 处理数据
        const options = isMonthView.value
          ? createMonthChartOptions(result.body)
          : createYearChartOptions(result.body)
        myChart = echarts.init(chart.value)
        myChart.setOption(options)
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

function toggleView () {
  isMonthView.value = !isMonthView.value
  if (isMonthView.value) {
    monthDate.value = datePicked.value
  } else {
    yearDate.value = datePicked.value
  }
  firBool = false
  handleVisibleChange(true, 'shuiwei', isMonthView.value ? 'month' : 'year')
}

// 根据设备类型，查询设备列表
// 观测设备种类分类；
// 01：光谱和水体监测点；
// 02：径流监测点；
// 03：气象站；
// 04：外业调查点位
// 06：水位
function getDeviceInfoList (deviceType) {
  isLoading.value = true; // 开始加载数据 
  queryDeviceByMultiWord({
    id: '',
    deviceName: '',
    type: deviceType
  })
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        locations.value.push(...result.body)
        deviceName.value = locations.value[0]?.deviceName || ''; // 设置为第一个设备名称，如果存在
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
        message: '获取观测站数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
    .finally(() => {  
      isLoading.value = false; // 加载完成  
    });  
}

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      getDeviceInfoList('06')
      handleVisibleChange(true, 'shuiwei', 'month')
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
