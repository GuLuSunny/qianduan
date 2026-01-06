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
        <div class="switch-container">
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
        </div>
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
    { value: 2, text: 'pH' }
  ],
  [
    { value: 3, text: '浊度(mg/L)' },
    { value: 4, text: '电导率(mg/L)' }
  ],
  [
    { value: 5, text: '溶解氧(mg/L)' },
    { value: 6, text: '透明度(m)' }
  ],
  [
    { value: 7, text: '高锰酸盐指数(mg/L)' },
    { value: 8, text: 'TSS(mg/L)' }
  ],
  [
    { value: 9, text: 'TN(mg/L)' },
    { value: 10, text: 'TP(mg/L)' }
  ],
  [
    { value: 11, text: '叶绿素(μg/L)' },
    { value: 12, text: '水位' }
  ],
  [
    { value: 13, text: '流速' },
    { value: 14, text: '流量' }
  ],
  [
    { value: 15, text: '气温(℃)' },
    { value: 16, text: 'CODCR(mg/L)' }
  ],
  [
    { value: 17, text: 'BOD5(mg/L)' },
    { value: 18, text: '氨氮(mg/L)' }
  ],
  [
    { value: 19, text: '铜(mg/L)' },
    { value: 20, text: '锌(mg/L)' }
  ],
  [
    { value: 21, text: '氟化物(mg/L)' },
    { value: 22, text: '硒(mg/L)' }
  ],
  [
    { value: 23, text: '砷(mg/L)' },
    { value: 24, text: '汞(mg/L)' }
  ],
  [
    { value: 25, text: '镉(mg/L)' },
    { value: 26, text: '六价铬(mg/L)' }
  ],
  [
    { value: 27, text: '铅(mg/L)' },
    { value: 28, text: '氰化物(mg/L)' }
  ],
  [
    { value: 29, text: '挥发酚(mg/L)' },
    { value: 30, text: '石油类(mg/L)' }
  ],
  [
    { value: 31, text: 'LAS(mg/L)' },
    { value: 32, text: '硫化物(mg/L)' }
  ],
  [
    { value: 33, text: '粪大肠杆菌群(个)' },
    { value: 34, text: '蓄水量' }
  ],
  [
    { value: 35, text: '硫酸盐(mg/L)' },
    { value: 36, text: '氯化物(mg/L)' }
  ],
  [
    { value: 37, text: '硝酸盐氮(mg/L)' },
    { value: 38, text: '铁(mg/L)' }
  ],
  [
    { value: 39, text: '锰(mg/L)' }
  ]
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
      title: 'pH变化图',
      yAxisName: 'pH',
      seriesName: 'pH',
      dataKey: 'ph'
    },
    3: {
      title: '浊度变化图',
      yAxisName: '浊度',
      yAxisFormatter: '{value} mg/L',
      seriesName: '浊度(mg/L)',
      dataKey: 'turbidity'
    },
    4: {
      title: '电导率变化图',
      yAxisName: '电导率',
      yAxisFormatter: '{value} mg/L',
      seriesName: '电导率(mg/L)',
      dataKey: 'conductivity'
    },
    5: {
      title: '溶解氧变化图',
      yAxisName: '溶解氧',
      yAxisFormatter: '{value} mg/L',
      seriesName: '溶解氧(mg/L)',
      dataKey: 'dissolvedOxygen'
    },
    6: {
      title: '透明度变化图',
      yAxisName: '透明度',
      yAxisFormatter: '{value} m',
      seriesName: '透明度(m)',
      dataKey: 'transparency'
    },
    7: {
      title: '高锰酸盐指数变化图',
      yAxisName: '高锰酸盐指数',
      yAxisFormatter: '{value} mg/L',
      seriesName: '高锰酸盐指数(mg/L)',
      dataKey: 'codmn'
    },
    8: {
      title: 'TSS变化图',
      yAxisName: 'TSS',
      yAxisFormatter: '{value} mg/L',
      seriesName: 'TSS(mg/L)',
      dataKey: 'tss'
    },
    9: {
      title: 'TN变化图',
      yAxisName: 'TN',
      yAxisFormatter: '{value} mg/L',
      seriesName: 'TN(mg/L)',
      dataKey: 'tn'
    },
    10: {
      title: 'TP变化图',
      yAxisName: 'TP',
      yAxisFormatter: '{value} mg/L',
      seriesName: 'TP(mg/L)',
      dataKey: 'tp'
    },
    11: {
      title: '叶绿素变化图',
      yAxisName: '叶绿素',
      yAxisFormatter: '{value} μg/L',
      seriesName: '叶绿素',
      dataKey: 'chlorophyll'
    },
    12: {
      title: '水位变化图',
      yAxisName: '水位',
      seriesName: '水位',
      dataKey: 'waterLevel'
    },
    13: {
      title: '流速变化图',
      yAxisName: '流速',
      seriesName: '流速',
      dataKey: 'flowRate'
    },
    14: {
      title: '流量变化图',
      yAxisName: '流量',
      seriesName: '流量',
      dataKey: 'flowVolume'
    },
    15: {
      title: '气温变化图',
      yAxisName: '气温',
      yAxisFormatter: '{value} ℃',
      seriesName: '气温(℃)',
      dataKey: 'airTemperature'
    },
    16: {
      title: 'CODCR变化图',
      yAxisName: 'CODCR',
      yAxisFormatter: '{value} mg/L',
      seriesName: 'CODCR(mg/L)',
      dataKey: 'codcr'
    },
    17: {
      title: 'BOD5变化图',
      yAxisName: 'BOD5',
      yAxisFormatter: '{value} mg/L',
      seriesName: 'BOD5(mg/L)',
      dataKey: 'bod5'
    },
    18: {
      title: '氨氮变化图',
      yAxisName: '氨氮',
      yAxisFormatter: '{value} mg/L',
      seriesName: '氨氮(mg/L)',
      dataKey: 'ammoniaNitrogen'
    },
    19: {
      title: '铜变化图',
      yAxisName: '铜',
      yAxisFormatter: '{value} mg/L',
      seriesName: '铜(mg/L)',
      dataKey: 'copper'
    },
    20: {
      title: '锌变化图',
      yAxisName: '锌',
      yAxisFormatter: '{value} mg/L',
      seriesName: '锌(mg/L)',
      dataKey: 'zinc'
    },
    21: {
      title: '氟化物变化图',
      yAxisName: '氟化物',
      yAxisFormatter: '{value} mg/L',
      seriesName: '氟化物(mg/L)',
      dataKey: 'fluoride'
    },
    22: {
      title: '硒变化图',
      yAxisName: '硒',
      yAxisFormatter: '{value} mg/L',
      seriesName: '硒(mg/L)',
      dataKey: 'selenium'
    },
    23: {
      title: '砷变化图',
      yAxisName: '砷',
      yAxisFormatter: '{value} mg/L',
      seriesName: '砷(mg/L)',
      dataKey: 'arsenic'
    },
    24: {
      title: '汞变化图',
      yAxisName: '汞',
      yAxisFormatter: '{value} mg/L',
      seriesName: '汞(mg/L)',
      dataKey: 'mercury'
    },
    25: {
      title: '镉变化图',
      yAxisName: '镉',
      yAxisFormatter: '{value} mg/L',
      seriesName: '镉(mg/L)',
      dataKey: 'cadmium'
    },
    26: {
      title: '六价铬变化图',
      yAxisName: '六价铬',
      yAxisFormatter: '{value} mg/L',
      seriesName: '六价铬(mg/L)',
      dataKey: 'cr6'
    },
    27: {
      title: '铅变化图',
      yAxisName: '铅',
      yAxisFormatter: '{value} mg/L',
      seriesName: '铅(mg/L)',
      dataKey: 'pb'
    },
    28: {
      title: '氰化物变化图',
      yAxisName: '氰化物',
      yAxisFormatter: '{value} mg/L',
      seriesName: '氰化物(mg/L)',
      dataKey: 'cyanide'
    },
    29: {
      title: '挥发酚变化图',
      yAxisName: '挥发酚',
      yAxisFormatter: '{value} mg/L',
      seriesName: '挥发酚(mg/L)',
      dataKey: 'volatilePhenols'
    },
    30: {
      title: '石油类变化图',
      yAxisName: '石油类',
      yAxisFormatter: '{value} mg/L',
      seriesName: '石油类(mg/L)',
      dataKey: 'oil'
    },
    31: {
      title: 'LAS变化图',
      yAxisName: 'LAS',
      yAxisFormatter: '{value} mg/L',
      seriesName: 'LAS(mg/L)',
      dataKey: 'las'
    },
    32: {
      title: '硫化物变化图',
      yAxisName: '硫化物',
      yAxisFormatter: '{value} mg/L',
      seriesName: '硫化物(mg/L)',
      dataKey: 's2'
    },
    33: {
      title: '粪大肠杆菌群变化图',
      yAxisName: '粪大肠杆菌群',
      yAxisFormatter: '{value} 个',
      seriesName: '粪大肠杆菌群(个)',
      dataKey: 'fcg'
    },
    34: {
      title: '蓄水量变化图',
      yAxisName: '蓄水量',
      seriesName: '蓄水量',
      dataKey: 'waterStorage'
    },
    35: {
      title: '硫酸盐变化图',
      yAxisName: '硫酸盐',
      yAxisFormatter: '{value} mg/L',
      seriesName: '硫酸盐(mg/L)',
      dataKey: 'so4'
    },
    36: {
      title: '氯化物变化图',
      yAxisName: '氯化物',
      yAxisFormatter: '{value} mg/L',
      seriesName: '氯化物(mg/L)',
      dataKey: 'cl'
    },
    37: {
      title: '硝酸盐氮变化图',
      yAxisName: '硝酸盐氮',
      yAxisFormatter: '{value} mg/L',
      seriesName: '硝酸盐氮(mg/L)',
      dataKey: 'no3'
    },
    38: {
      title: '铁变化图',
      yAxisName: '铁',
      yAxisFormatter: '{value} mg/L',
      seriesName: '铁(mg/L)',
      dataKey: 'fe'
    },
    39: {
      title: '锰变化图',
      yAxisName: '锰',
      yAxisFormatter: '{value} mg/L',
      seriesName: '锰(mg/L)',
      dataKey: 'mn'
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
      name: '站点'
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
      yAxisName === 'pH' ? value : `${value}${yAxisFormatter.split(' ')[1]}`
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
        console.log(error)
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
  height: 500px; /* 设置固定高度与图表一致 */
}

.switch-container {
  height: 100%;
  overflow-y: auto; /* 垂直滚动 */
  padding-right: 8px; /* 为滚动条留出空间 */
}

/* 自定义滚动条样式 */
.switch-container::-webkit-scrollbar {
  width: 6px;
}

.switch-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.switch-container::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.switch-container::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

.el-row {
  margin-bottom: 16px; /* 稍微减小行间距 */
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
