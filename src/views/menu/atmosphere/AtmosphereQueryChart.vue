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
      <el-table-column prop="monthMin" label="日最低数据" align="center" />
      <el-table-column prop="monthAvg" label="日最高数据" align="center" />
      <el-table-column prop="monthMax" label="日平均数据" align="center" />
    </el-table>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ElMessage, ElLoading } from 'element-plus'
import {
  findAtmosphere,
  getTimesByType,
  queryDeviceByMultiWord
} from '@/api/getData'
import { ref, onMounted, getCurrentInstance, watch, computed } from 'vue'

const datePicked = ref('')
const sitePicked = ref(null)
const selectedValue = ref(10)
const periodDataList = ref([])
const atmosphereData = ref([{ monthMin: 0, monthAvg: 0, monthMax: 0 }]) // Define atmosphereData
const chart = ref()
const deviceOptions = ref([])
const isLoading = ref(true) // 加载状态 
let myChart = null
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

const switchItems = ref([
  { value: 1, text: '风速', visible: false },
  { value: 2, text: '雨量', visible: false },
  { value: 3, text: '大气温度', visible: false },
  { value: 4, text: '土壤温度', visible: false },
  { value: 5, text: '数字气压', visible: false },
  { value: 6, text: '简易总辐射', visible: false },
  { value: 7, text: '风向', visible: false },
  { value: 8, text: '大气湿度', visible: false },
  { value: 9, text: '土壤湿度', visible: false },
  { value: 10, text: 'PM2.5', visible: true },
  { value: 11, text: '盐分', visible: false },
  { value: 12, text: '负氧离子', visible: false },
  { value: 13, text: '雨量累计', visible: false },
  { value: 14, text: '辐射累积', visible: false },
  { value: 15, text: 'PM10', visible: false }
])

// Fetch device options
async function fetchDeviceOptions () {  
  try {  
    const res = await queryDeviceByMultiWord({ type: '03' })  
    if (res.response.value.code === 'SUCCESS') {  
      deviceOptions.value = res.response.value.body  
      // 检查设备选项是否包含 id 为 24 的设备  
      const deviceExists = deviceOptions.value.some(device => device.id === 24)  
      sitePicked.value = deviceExists ? 24 : deviceOptions.value[0]?.id // 设置为 24 或第一个可用设备 ID  
    } else {  
      ElMessage.error(res.response.value.msg)  
    }  
  } catch {  
    ElMessage.error('获取设备数据失败，请稍后再试')  
  } finally {  
    isLoading.value = false // 设置加载完成  
  }  
}  
// Computed property to get the selected device name
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

// Calculate min, max, and average values
const calculateStats = () => {
  if (periodDataList.value.length === 0) {
    atmosphereData.value = [{ monthMin: '0.00', monthAvg: '0.00', monthMax: '0.00' }]
    return
  }

  const chartOptions = {
    1: { dataKey: 'windSpeed', unit: 'm/s' },
    2: { dataKey: 'rainfall', unit: 'mm' },
    3: { dataKey: 'atmosphereTemperature', unit: '℃' },
    4: { dataKey: 'soilTemperature', unit: '℃' },
    5: { dataKey: 'digitalPressure', unit: 'hPa' },
    6: { dataKey: 'simpleTotalRadiation', unit: 'W/m²' },
    7: { dataKey: 'windDirection', unit: '°' },
    8: { dataKey: 'atmosphereHumidity', unit: '%RH' },
    9: { dataKey: 'soilHumidity', unit: '%RH' },
    10: { dataKey: 'pm25', unit: 'μg/m³' },
    11: { dataKey: 'salinity', unit: 'mg/L' },
    12: { dataKey: 'negativeOxygenIon', unit: '个' },
    13: { dataKey: 'rainfallAccumulation', unit: 'mm' },
    14: { dataKey: 'radiationAccumulation', unit: 'MJ/㎡' },
    15: { dataKey: 'pm10', unit: 'μg/m³' }
  }

  const { dataKey, unit } = chartOptions[selectedValue.value]
  const dataList = periodDataList.value.map((item) =>
    parseFloat(item.atmosphere[dataKey])
  )

  const min = Math.min(...dataList).toFixed(2)
  const max = Math.max(...dataList).toFixed(2)
  const avg = (
    dataList.reduce((sum, value) => sum + value, 0) / dataList.length
  ).toFixed(2)

  // Add units to the values
  atmosphereData.value = [
    {
      monthMin: `${min} ${unit}`,
      monthAvg: `${avg} ${unit}`,
      monthMax: `${max} ${unit}`
    }
  ]
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
    4: {
      title: '土壤温度变化图',
      yAxisName: '土壤温度',
      yAxisFormatter: '{value} ℃',
      seriesName: '土壤温度(℃)',
      dataKey: 'soilTemperature'
    },
    5: {
      title: '数字气压变化图',
      yAxisName: '数字气压',
      yAxisFormatter: '{value} hPa',
      seriesName: '数字气压(hPa)',
      dataKey: 'digitalPressure'
    },
    6: {
      title: '简易总辐射变化图',
      yAxisName: '简易总辐射',
      yAxisFormatter: '{value} W/m2',
      seriesName: '简易总辐射(W/m2)',
      dataKey: 'simpleTotalRadiation'
    },
    7: {
      title: '风向变化图',
      yAxisName: '风向',
      yAxisFormatter: '{value} 度',
      seriesName: '风向/度',
      dataKey: 'windDirection'
    },
    8: {
      title: '大气湿度变化图',
      yAxisName: '大气湿度',
      yAxisFormatter: '{value} %RH',
      seriesName: '大气湿度(%RH)',
      dataKey: 'atmosphereHumidity'
    },
    9: {
      title: '土壤湿度变化图',
      yAxisName: '土壤湿度',
      yAxisFormatter: '{value} %RH',
      seriesName: '土壤湿度(%RH)',
      dataKey: 'soilHumidity'
    },
    10: {
      title: 'PM2.5变化图',
      yAxisName: 'PM2.5',
      yAxisFormatter: '{value} μg/m³',
      seriesName: 'PM2.5(μg/m³)',
      dataKey: 'pm25'
    },
    11: {
      title: '盐分变化图',
      yAxisName: '盐分',
      yAxisFormatter: '{value} mg/L',
      seriesName: '盐分(mg/L)',
      dataKey: 'salinity'
    },
    12: {
      title: '负氧离子变化图',
      yAxisName: '负氧离子',
      yAxisFormatter: '{value} 个',
      seriesName: '负氧离子(个)',
      dataKey: 'negativeOxygenIon'
    },
    13: {
      title: '雨量累计变化图',
      yAxisName: '雨量累计',
      yAxisFormatter: '{value} mm',
      seriesName: '雨量累计(mm)',
      dataKey: 'rainfallAccumulation'
    },
    14: {
      title: '辐射累积变化图',
      yAxisName: '辐射累积',
      yAxisFormatter: '{value} MJ/㎡',
      seriesName: '辐射累积(MJ/㎡)',
      dataKey: 'radiationAccumulation'
    },
    15: {
      title: 'PM10变化图',
      yAxisName: 'PM10',
      yAxisFormatter: '{value} μg/m³',
      seriesName: 'PM10(μg/m³)',
      dataKey: 'pm10'
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
        data: periodDataList.value.map((item) =>
          parseFloat(item.atmosphere[dataKey]).toFixed(2)
        ),
        type: 'line'
      }
    ],
    valueFormatter: (value) => `${value}${yAxisFormatter.split(' ')[1]}`
  }
}

const getWaterPhy = () => {
  const loadingInstance = ElLoading.service(loadingoptions)
  findAtmosphere({ time: datePicked.value, device: sitePicked.value })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        if (result.body.length === 0) {
          ElMessage({ showClose: true, message: '数据不存在', center: true })
        } else {
          periodDataList.value = result.body
          updateChart()
        }
      } else {
        ElMessage({ showClose: true, message: result.msg, center: true })
      }
    })
    .catch(() => {
      loadingInstance.close()
      ElMessage.error('获取气象数据失败，请稍后再试')
    })
}

onMounted(async () => {  
  const instance = getCurrentInstance();  
  if (instance) {  
    await instance.proxy.$nextTick(); // 等待下一个 DOM 更新周期  

    await fetchDeviceOptions(); // 等待 fetchDeviceOptions 完成 
    updateChart(); // 更新图表 
    const countVisible = switchItems.value.filter(control => control.visible).length;  
    if (countVisible === 0) {  
      item.visible = true; // 如果没有可见的项目，则设置为可见  
    }  

    await getTimesByTypeChange('qixiang', 'month'); // 等待获取时间数据  
  }  
});

// 日期过滤
function getTimesByTypeChange (type, searchTimeType) {
  // 开启时
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
          datePicked.value = latestDate // 设置最新日期为默认值
          getWaterPhy()
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
}

const updateChart = () => {
  if (myChart) myChart.dispose()
  myChart = echarts.init(chart.value)
  myChart.setOption(createOption())
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
