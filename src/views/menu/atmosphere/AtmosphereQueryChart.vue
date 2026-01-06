<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="header-container">
          <el-form-item label="选择地点：" style="margin: 0">
            <el-select
            :disabled="isLoading" 
              v-model="sitePicked"
              placeholder="董屯"
              class="custom-select"
              style="width: 200px"
              @change="getWaterPhy()"
            >
              <el-option
                v-for="device in deviceOptions"
                :key="device.id"
                :label="device.deviceName"
                :value="device.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="日期：" style="margin: 0">
            <div class="date-picker-container">
              <el-date-picker
                v-model="datePicked"
                type="month"
                placeholder="请选择日期"
                format="YYYY-MM"
                value-format="YYYY-MM"
                :clearable="false"
                @visible-change="
                  (visibility) =>
                    handleVisibleChange(visibility, 'qixiang', 'month')
                "
                :disabled-date="
                  (time) => disabledDate(time, 'qixiang', 'month')
                "
              ></el-date-picker>
            </div>
          </el-form-item>
        </div>
      </el-header>

      <el-main>
        <div class="container-wrapper">
          <div class="flex-container">
            <div class="chart-container">
              <div ref="chart" class="chart"></div>
            </div>
            <div class="controls">
              <el-switch
                v-for="(item, index) in switchItems"
                :key="index"
                v-model="item.visible"
                :active-text="item.text"
                inactive-text=""
                @change="onSwitchChange(item)"
                class="control-item"
                :active-color="'#409eff'"
              />
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
  <div class="table-container" style="margin-left: 5%">
    <el-table
      :data="atmosphereData"
      border="true"
      style="width: 70%; height: auto; table-layout: fixed"
      :header-cell-style="{ backgroundColor: '#f2f2f2' }"
    >
      <el-table-column prop="monthMin" label="月最小值" align="center" />
      <el-table-column prop="monthAvg" label="月平均值" align="center" />
      <el-table-column prop="monthMax" label="月最大值" align="center" />
    </el-table>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ElMessage, ElLoading } from 'element-plus'
import {
  findAtmosphere,
  getTimesByType,
  queryDeviceByMultiWord,
  selectByMonthAndDevice  // 新增接口
} from '@/api/getData'
import { ref, onMounted, getCurrentInstance, watch, computed } from 'vue'


const datePicked = ref('')
const sitePicked = ref(null)
const selectedValue = ref(6) // 修改默认选中值为PM2.5
const periodDataList = ref([])
const atmosphereData = ref([{ monthMin: 0, monthAvg: 0, monthMax: 0 }]) // 统计数据显示
const chart = ref()
const deviceOptions = ref([])
const isLoading = ref(true)
const monthlyStatistics = ref({}) // 存储从新接口获取的月度统计数据
let myChart = null
const loadingoptions = {
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

// 修改switchItems，移除弃用字段，添加新字段
const switchItems = ref([
  { value: 1, text: '风速', visible: false },
  { value: 2, text: '雨量', visible: false },
  { value: 3, text: '大气温度', visible: false },
  // 移除: { value: 4, text: '土壤温度', visible: false },
  { value: 4, text: '数字气压', visible: false },
  // 移除: { value: 6, text: '简易总辐射', visible: false },
  { value: 5, text: '风向', visible: false },
  // 移除: { value: 8, text: '大气湿度', visible: false },
  // 移除: { value: 9, text: '土壤湿度', visible: false },
  { value: 6, text: 'PM2.5', visible: true },
  // 移除: { value: 11, text: '盐分', visible: false },
  // 移除: { value: 12, text: '负氧离子', visible: false },
  // 移除: { value: 13, text: '雨量累计', visible: false },
  // 移除: { value: 14, text: '辐射累积', visible: false },
  { value: 7, text: 'PM10', visible: false },
  // 添加新字段
  { value: 8, text: '相对湿度', visible: false },
  { value: 9, text: 'AQI指数', visible: false },
  { value: 10, text: '二氧化硫', visible: false },
  { value: 11, text: '二氧化氮', visible: false },
  { value: 12, text: '一氧化碳', visible: false },
  { value: 13, text: '臭氧', visible: false },
  { value: 14, text: '臭氧8小时', visible: false }
])

// Fetch device options
async function fetchDeviceOptions () {  
  try {  
    const res = await queryDeviceByMultiWord({ type: '03' })  
    if (res.response.value.code === 'SUCCESS') {  
      deviceOptions.value = res.response.value.body  
      const deviceExists = deviceOptions.value.some(device => device.id === 24)  
      sitePicked.value = deviceExists ? 24 : deviceOptions.value[0]?.id
    } else {  
      ElMessage.error(res.response.value.msg)  
    }  
  } catch {  
    ElMessage.error('获取设备数据失败，请稍后再试')  
  } finally {  
    isLoading.value = false
  }  
}

const selectedDeviceName = computed(() => {
  const device = deviceOptions.value.find((d) => d.id === sitePicked.value)
  return device ? device.deviceName : ''
})

const onSwitchChange = (item) => {
  if (item.visible) {
    switchItems.value.forEach((controlItem) => {
      if (controlItem !== item) {
        controlItem.visible = false
      }
    })
    selectedValue.value = item.value
    getWaterPhy()
  } else {
    const anyVisible = switchItems.value.some((control) => control.visible)
    if (!anyVisible) {
      item.visible = true
      ElMessage({
        showClose: true,
        message: '至少要有一个数据项可见',
        center: true
      })
    }
  }
}

// 从新接口获取月度统计数据
async function getMonthlyStatistics() {
  if (!datePicked.value || !sitePicked.value) {
    atmosphereData.value = [{ monthMin: '--', monthAvg: '--', monthMax: '--' }]
    return
  }
  
  try {
    const loadingInstance = ElLoading.service(loadingoptions)
    const res = await selectByMonthAndDevice({
      deviceId: sitePicked.value.toString(),
      observationTime: datePicked.value
    })
    loadingInstance.close()
    
    if (res.response.value.code === 'SUCCESS') {
      monthlyStatistics.value = res.response.value.body
      updateStatisticsDisplay()
    } else {
      ElMessage.error(res.response.value.msg || '获取统计数据失败')
      atmosphereData.value = [{ monthMin: '--', monthAvg: '--', monthMax: '--' }]
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败，请稍后再试')
    atmosphereData.value = [{ monthMin: '--', monthAvg: '--', monthMax: '--' }]
  }
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
  customString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`
  const isTimeInArray = showDateArr.value.includes(customString)
  return !isTimeInArray
}

// 关闭日期框
function handleVisibleChange (visibility, type, searchTimeType) {
  if (!visibility) {
    getWaterPhy()
  }
}

const createOption = () => {
  if (periodDataList.value.length === 0) return {}

  // 修改字段映射
  const chartOptions = {
    1: {
      title: '风速变化图',
      yAxisName: '风速',
      yAxisFormatter: '{value} m/s',
      seriesName: '风速(m/s)',
      dataKey: 'windSpeed'
    },
    2: {
      title: '雨量变化图',
      yAxisName: '雨量',
      yAxisFormatter: '{value} mm',
      seriesName: '雨量(mm)',
      dataKey: 'rainfall'
    },
    3: {
      title: '大气温度变化图',
      yAxisName: '大气温度',
      yAxisFormatter: '{value} ℃',
      seriesName: '大气温度(℃)',
      dataKey: 'atmosphereTemperature'
    },
    // 移除土壤温度
    4: {
      title: '数字气压变化图',
      yAxisName: '数字气压',
      yAxisFormatter: '{value} hPa',
      seriesName: '数字气压(hPa)',
      dataKey: 'digitalPressure'
    },
    // 移除简易总辐射
    5: {
      title: '风向变化图',
      yAxisName: '风向',
      yAxisFormatter: '{value} 度',
      seriesName: '风向(度)',
      dataKey: 'windDirection'
    },
    // 移除大气湿度
    // 移除土壤湿度
    6: {
      title: 'PM2.5变化图',
      yAxisName: 'PM2.5',
      yAxisFormatter: '{value} μg/m³',
      seriesName: 'PM2.5(μg/m³)',
      dataKey: 'pm25'
    },
    // 移除盐分
    // 移除负氧离子
    // 移除雨量累计
    // 移除辐射累积
    7: {
      title: 'PM10变化图',
      yAxisName: 'PM10',
      yAxisFormatter: '{value} μg/m³',
      seriesName: 'PM10(μg/m³)',
      dataKey: 'pm10'
    },
    // 添加新字段
    8: {
      title: '相对湿度变化图',
      yAxisName: '相对湿度',
      yAxisFormatter: '{value} %RH',
      seriesName: '相对湿度(%RH)',
      dataKey: 'relativeHumidity'
    },
    9: {
      title: 'AQI指数变化图',
      yAxisName: 'AQI指数',
      yAxisFormatter: '{value}',
      seriesName: 'AQI指数',
      dataKey: 'aqiIndex'
    },
    10: {
      title: '二氧化硫变化图',
      yAxisName: '二氧化硫',
      yAxisFormatter: '{value} μg/m³',
      seriesName: '二氧化硫(μg/m³)',
      dataKey: 'sulfurDioxide'
    },
    11: {
      title: '二氧化氮变化图',
      yAxisName: '二氧化氮',
      yAxisFormatter: '{value} μg/m³',
      seriesName: '二氧化氮(μg/m³)',
      dataKey: 'nitrogenDioxide'
    },
    12: {
      title: '一氧化碳变化图',
      yAxisName: '一氧化碳',
      yAxisFormatter: '{value} mg/m³',
      seriesName: '一氧化碳(mg/m³)',
      dataKey: 'carbonMonoxide'
    },
    13: {
      title: '臭氧变化图',
      yAxisName: '臭氧',
      yAxisFormatter: '{value} μg/m³',
      seriesName: '臭氧(μg/m³)',
      dataKey: 'ozone'
    },
    14: {
      title: '臭氧8小时变化图',
      yAxisName: '臭氧8小时',
      yAxisFormatter: '{value} μg/m³',
      seriesName: '臭氧8小时(μg/m³)',
      dataKey: 'ozone8Hour'
    }
  }

  const { title, yAxisName, yAxisFormatter, seriesName, dataKey } =
    chartOptions[selectedValue.value]

  return {
    title: {
      text: ` ${datePicked.value}${selectedDeviceName.value}${title}`,
      left: 'center'
    },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: periodDataList.value.map((item) => item.lastTwoDigits),
      name: '日期'
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      axisLabel: { formatter: yAxisFormatter },
      axisTick: { show: true },
      axisLine: { show: true }
    },
    series: [
      {
        name: seriesName,
        data: periodDataList.value.map((item) => {
          const value = item.atmosphere[dataKey]
          // 处理"缺测"值
          return value === '缺测' || value === null ? null : parseFloat(value).toFixed(2)
        }),
        type: 'line',
        connectNulls: false
      }
    ],
    valueFormatter: (value) => `${value}${yAxisFormatter.split(' ')[1] || ''}`
  }
}

// 修改后的calculateStats函数，使用原来的方法从每日数据计算最小值和最大值
const calculateStats = () => {
  if (periodDataList.value.length === 0) {
    atmosphereData.value = [{ 
      monthMin: '--', 
      monthAvg: '--', 
      monthMax: '--' 
    }]
    return
  }

  // 字段映射表
  const fieldMapping = {
    1: 'windSpeed',
    2: 'rainfall', 
    3: 'atmosphereTemperature',
    4: 'digitalPressure',
    5: 'windDirection',
    6: 'pm25',
    7: 'pm10',
    8: 'relativeHumidity',
    9: 'aqiIndex',
    10: 'sulfurDioxide',
    11: 'nitrogenDioxide',
    12: 'carbonMonoxide',
    13: 'ozone',
    14: 'ozone8Hour'
  }

  // 单位映射表
  const unitMapping = {
    1: 'm/s',
    2: 'mm',
    3: '℃',
    4: 'hPa',
    5: '°',
    6: 'μg/m³',
    7: 'μg/m³',
    8: '%RH',
    9: '',
    10: 'μg/m³',
    11: 'μg/m³',
    12: 'mg/m³',
    13: 'μg/m³',
    14: 'μg/m³'
  }

  const fieldName = fieldMapping[selectedValue.value]
  const unit = unitMapping[selectedValue.value]
  
  if (!fieldName) {
    atmosphereData.value = [{ 
      monthMin: `-- ${unit}`, 
      monthAvg: `-- ${unit}`, 
      monthMax: `-- ${unit}` 
    }]
    return
  }

  // 从每日数据中计算最小值和最大值（原来的方法）
  const validDataList = periodDataList.value
    .map((item) => {
      const value = item.atmosphere[fieldName]
      return value === '缺测' || value === null ? null : parseFloat(value)
    })
    .filter(value => value !== null && !isNaN(value))

  if (validDataList.length === 0) {
    atmosphereData.value = [{ 
      monthMin: `-- ${unit}`, 
      monthAvg: `-- ${unit}`, 
      monthMax: `-- ${unit}` 
    }]
    return
  }

  const min = Math.min(...validDataList).toFixed(2)
  const max = Math.max(...validDataList).toFixed(2)
  
  // 平均值从新接口获取，如果没有则显示"--"
  const avgFromAPI = monthlyStatistics.value[fieldName]
  const avg = avgFromAPI !== undefined && avgFromAPI !== null 
    ? parseFloat(avgFromAPI).toFixed(2) 
    : '--'

  atmosphereData.value = [
    {
      monthMin: `${min} ${unit}`,
      monthAvg: `${avg} ${unit}`,
      monthMax: `${max} ${unit}`
    }
  ]
}


// 修改getWaterPhy函数中的逻辑
const getWaterPhy = () => {
  if (!datePicked.value || !sitePicked.value) return
  
  const loadingInstance = ElLoading.service(loadingoptions)
  
  // 同时获取每日数据和月度统计数据
  Promise.all([
    findAtmosphere({ time: datePicked.value, device: sitePicked.value }),
    selectByMonthAndDevice({
      deviceId: sitePicked.value.toString(),
      observationTime: datePicked.value
    })
  ])
    .then(([dailyRes, statsRes]) => {
      loadingInstance.close()
      
      // 处理每日数据
      const dailyResult = dailyRes.response.value
      if (dailyResult.code === 'SUCCESS') {
        if (dailyResult.body.length === 0) {
          ElMessage({ showClose: true, message: '数据不存在', center: true })
        } else {
          periodDataList.value = dailyResult.body
          updateChart()
        }
      } else {
        ElMessage({ showClose: true, message: dailyResult.msg, center: true })
      }
      
      // 处理月度统计数据
      const statsResult = statsRes.response.value
      if (statsResult.code === 'SUCCESS') {
        monthlyStatistics.value = statsResult.body
        // 这里调用calculateStats来计算统计值
        calculateStats()
      } else {
        ElMessage.error(statsResult.msg || '获取统计数据失败')
        // 即使统计数据失败，也尝试从每日数据计算
        calculateStats()
      }
    })
    .catch(() => {
      loadingInstance.close()
      ElMessage.error('获取数据失败，请稍后再试')
      // 出错时尝试从每日数据计算
      calculateStats()
    })
}

onMounted(async () => {  
  const instance = getCurrentInstance();  
  if (instance) {  
    await instance.proxy.$nextTick();
    await fetchDeviceOptions();
    await getTimesByTypeChange('qixiang', 'month');
  }  
});

// 日期过滤
function getTimesByTypeChange (type, searchTimeType) {
  const searchType = searchTimeType
  getTimesByType({
    type: type,
    searchTimeType: searchTimeType
  })
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        const type = result.body.type
        const date = result.body.date
        showDateArr.value = date
        if (date && date.length > 0) {
          const latestDate = date.sort((a, b) => b.localeCompare(a))[0]
          datePicked.value = latestDate
          getWaterPhy()
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
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 修改updateChart函数，确保调用calculateStats
const updateChart = () => {
  if (myChart) myChart.dispose()
  myChart = echarts.init(chart.value)
  myChart.setOption(createOption())
  // 确保图表更新后计算统计数据
  calculateStats()
}
</script>

<style scoped>
.table-container {
  margin: 20px; /* 表格外边距 */
  margin-top: 0; /* 确保没有上边距 */
  padding-top: 0; /* 确保没有内上边距 */
}

.control-item {
  margin-bottom: 10px; /* 每个开关之间的间距 */
}
.header-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.date-picker-container {
  margin-left: 0px; /* 选择器之间的间距 */
}

.flex-container {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: space-between; /* 左右分布 */
}

.chart-container {
  flex: 50 0 80%; /* 图表占据60%的宽度 */
  margin-right: 60px; /* 图表与按钮之间的间距 */
}

.chart {
  width: 100%;
  height: 450px;
}

.controls {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  width: 30%; /* 控制按钮的宽度 */
}

.controls-row {
  display: flex;
  justify-content: space-between; /* 平均分配按钮 */
  flex-wrap: wrap; /* 允许换行 */
}

.control-item {
  flex: 1 1 30%; /* 每个按钮项占据30%宽度 */
  margin-bottom: 10px; /* 每行按钮的间距 */
}
</style>
