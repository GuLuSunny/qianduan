<template>
  <el-container>
    <el-header class="top">
      <div class="control">
        <el-form-item label="日期：">
          <el-date-picker
            v-model="dateSelect"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :editable="false"
            :clearable="false"
            @visible-change="
              (visibility) =>
                handleVisibleChange(visibility, 'shuitilihua', 'day')
            "
            :disabled-date="(time) => disabledDate(time, 'shuitilihua', 'day')"
          />
        </el-form-item>
      </div>
    </el-header>
    <el-container style="background-color: white">
      <el-main width="70%" height="100%" class="left">
        <div ref="chart" style="width: 100%; height: 500px"></div>
      </el-main>
      <el-divider direction="vertical" />
      <el-aside width="30%" class="right">
        <el-row :gutter="10" v-for="(item, index) in switchItems" :key="index">
          <el-col :span="12" v-for="col in item" :key="col.value">
            <div class="grid-content ep-bg-purple">
              <el-switch
                :model-value="selectedValue === col.value"
                @update:model-value="updateValue(col.value)"
                class="mb-2"
                :active-text="col.text"
              />
            </div>
          </el-col>
        </el-row>
      </el-aside>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getWaterPhyBigScreen, getTimesByType } from '@/api/getData'
import * as echarts from 'echarts'
import { ElMessage, ElLoading } from 'element-plus'

const chart = ref()
let myChart = null
const dateSelect = ref('')
const periodDataList = ref([])
const selectedValue = ref(1)
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
const switchItems = [
  [
    { value: 1, text: '水温(℃)' },
    { value: 2, text: '叶绿素(µg/L)' }
  ],
  [
    { value: 3, text: 'PH' },
    { value: 4, text: '透明度(m)' }
  ],
  [
    { value: 5, text: '电导率(mg/L)' },
    { value: 6, text: '高锰酸盐指数(mg/L)' }
  ],
  [
    { value: 7, text: '浊度(mg/L)' },
    { value: 8, text: 'TSS(mg/L)' }
  ],
  [
    { value: 9, text: '溶解氧(mg/L)' },
    { value: 10, text: 'TN(mg/L)' }
  ],
  [{ value: 11, text: 'TP(mg/L)' }]
]

const updateValue = (value) => {
  selectedValue.value = value
  if (periodDataList.value.length > 0) {
    updateChart()
  }
}

const createOption = () => {
  if (periodDataList.value.length === 0) return {}

  const chartOptions = {
    1: {
      title: '水温变化图',
      yAxisName: '水温',
      yAxisFormatter: '{value} ℃',
      seriesName: '水温(℃)',
      dataKey: 'waterTemperature'
    },
    2: {
      title: '叶绿素变化图',
      yAxisName: '叶绿素',
      yAxisFormatter: '{value} µg/L',
      seriesName: '叶绿素',
      dataKey: 'chlorophyll'
    },
    3: {
      title: 'PH变化图',
      yAxisName: 'PH',
      seriesName: 'PH',
      dataKey: 'ph'
    },
    4: {
      title: '透明度变化图',
      yAxisName: '透明度',
      yAxisFormatter: '{value} m',
      seriesName: '透明度(m)',
      dataKey: 'transparency'
    },
    5: {
      title: '电导率变化图',
      yAxisName: '电导率',
      yAxisFormatter: '{value} mg/L',
      seriesName: '电导率(mg/L)',
      dataKey: 'conductivity'
    },
    6: {
      title: '高锰酸盐指数变化图',
      yAxisName: '高锰酸盐指数',
      yAxisFormatter: '{value} mg/L',
      seriesName: '高锰酸盐指数(mg/L)',
      dataKey: 'codmn'
    },
    7: {
      title: '浊度变化图',
      yAxisName: '浊度',
      yAxisFormatter: '{value} mg/L',
      seriesName: '浊度(mg/L)',
      dataKey: 'turbidity'
    },
    8: {
      title: 'TSS变化图',
      yAxisName: 'TSS',
      yAxisFormatter: '{value} mg/L',
      seriesName: 'TSS(mg/L)',
      dataKey: 'tss'
    },
    9: {
      title: '溶解氧变化图',
      yAxisName: '溶解氧',
      yAxisFormatter: '{value} mg/L',
      seriesName: '溶解氧(mg/L)',
      dataKey: 'dissolvedOxygen'
    },
    10: {
      title: 'TN变化图',
      yAxisName: 'TN',
      yAxisFormatter: '{value} mg/L',
      seriesName: 'TN(mg/L)',
      dataKey: 'tn'
    },
    11: {
      title: 'TP变化图',
      yAxisName: 'TP',
      yAxisFormatter: '{value} mg/L',
      seriesName: 'TP(mg/L)',
      dataKey: 'tp'
    }
  }

  const { title, yAxisName, yAxisFormatter, seriesName, dataKey } =
    chartOptions[selectedValue.value]

  return {
    title: { text: `${dateSelect.value} ${title}`, left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: periodDataList.value.map((item) => item.deviceId),
      name: '设备'
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
        data: periodDataList.value.map((item) => item[dataKey]),
        type: 'line'
      }
    ],
    valueFormatter: (value) =>
      yAxisName === 'PH' ? value : `${value}${yAxisFormatter.split(' ')[1]}`
  }
}

// watch(
//   () => dateSelect.value,
//   () => {
//     getWaterPhy()
//   }
// )

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
              dateSelect.value = latestDate // 设置最新日期为默认值
              getWaterPhy()
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
    getWaterPhy()
  }
}

const getWaterPhy = () => {
  const loadingInstance = ElLoading.service(loadingoptions)
  getWaterPhyBigScreen({ time: dateSelect.value, device: '' })
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
}

// watch(() => dateSelect.value, getWaterPhy)
onMounted(() => {
  handleVisibleChange(true, 'shuitilihua', 'day')
})
</script>

<style scoped>
.el-container {
  background-color: white;
  padding: 0px;
}

.top {
  text-align: left;
}

.top button {
  border: none;
  margin-top: 20px;
  margin-right: 20px;
}

.control {
  display: flex;
  height: 40px;
  width: 100%;
  justify-content: flex-end;
}

.demo-date-picker {
  border: none;
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}

.left {
  text-align: left;
  font-weight: bold;
}

.right {
  font-size: 20px;
  font-weight: bold;
  margin-top: 45px;
  overflow: hidden;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 2px;
}

.grid-content {
  border: none;
  min-height: 25px;
  min-width: 5px;
  background-color: white;
  text-align: left;
}
</style>
