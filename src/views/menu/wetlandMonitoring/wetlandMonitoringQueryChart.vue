<template>
  <div class="container">
    <div class="controls">
      <el-form-item label="日期：">
        <el-date-picker
          v-model="datePicked"
          type="date"
          placeholder=""
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="false"
          placement="bottom"
          @visible-change="
            (visibility) =>
              handleVisibleChange(visibility, 'shiditurang', 'day')
          "
          :disabled-date="(time) => disabledDate(time, 'shiditurang', 'day')"
        ></el-date-picker>
      </el-form-item>
    </div>
    <div class="soil">
      <h3 style="text-align: left">湿地土壤监测指标</h3>
      <div class="flex-container">
        <div class="chart-container">
          <div
            ref="soilChart"
            class="chart"
            style="width: 100%; height: 350px"
          ></div>
        </div>
        <div class="soil-indicator">
          <el-col
            v-for="(item, index) in switchItems"
            :key="index"
            :span="12"
            style="padding-left: 0"
          >
            <div class="grid-content ep-bg-purple">
              <el-switch
                v-model="item.visible"
                :active-text="item.text"
                :inactive-value="null"
                @change="onSwitchChange(item)"
              />
            </div>
          </el-col>
        </div>
      </div>
    </div>
  </div>
  <div class="ad"></div>

  <!-- 表格区域 -->
  <div class="container1">
    <div class="header1">
      <h3 style="text-align: left">湿地植物监测指标</h3>
      <el-form-item label="植被物种：" style="margin-left: 38%">
        <el-select
          v-model="plantPicked"
          placeholder="芦苇，碎米莎草"
          class="custom-select"
          style="width: 200px"
          @change="fetchWetLandData()"
        >
          <el-option label="芦苇，碎米莎草" value="芦苇，碎米莎草" />
        </el-select>
      </el-form-item>
    </div>
  </div>

  <div class="table-container" style="margin-left: 15%">
    <el-table
      :data="wetLandData"
      border="true"
      style="width: 80%; height: auto; table-layout: fixed"
      :header-cell-style="{ backgroundColor: '#f2f2f2' }"
    >
      <el-table-column prop="dataType" label="数据类型" align="center" />
      <el-table-column prop="dataValue" label="含量" align="center" />
      <el-table-column prop="dataUnit" label="单位" align="center" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, watch } from 'vue'
import * as echarts from 'echarts'
import { PlantGetData, WetlandSoilGetData, getTimesByType } from '@/api/getData'
import { ElMessage, ElLoading } from 'element-plus'

// Reactive references
const datePicked = ref('')
const plantPicked = ref('芦苇，碎米莎草')
const wetLandData = ref([])
const soilChart = ref(null)
const selectedValue = ref(4)
let myChart = null
const periodDataList = ref([])
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
const switchItems = ref([
  { value: 1, text: '土壤含水量', visible: false },
  { value: 2, text: '土壤有机质含量', visible: false },
  { value: 3, text: '土壤含碳总量', visible: false },
  { value: 4, text: '土壤含氮总量', visible: true },
  { value: 5, text: '土壤含磷总量', visible: false }
])

function onSwitchChange (item) {
  if (item.visible) {
    switchItems.value.forEach((controlItem) => {
      if (controlItem !== item) {
        controlItem.visible = false
      }
    })
    selectedValue.value = item.value
    updateChart() // Ensure to update the chart after switching
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

function createOption () {
  if (periodDataList.value.length === 0) return {}

  const chartOptions = {
    1: {
      title: '土壤含水量柱状图',
      yAxisName: '土壤含水量(g/100g)',
      dataKey: 'soilMoistureContent'
    },
    2: {
      title: '土壤有机质含量柱状图',
      yAxisName: '土壤有机质含量(g/100g)',
      dataKey: 'soilOrganicMatterContent'
    },
    3: {
      title: '土壤含碳总量柱状图',
      yAxisName: '土壤含碳总量(g/100g)',
      dataKey: 'totalSoilCarbonContent'
    },
    4: {
      title: '土壤含氮总量柱状图',
      yAxisName: '土壤含氮总量(g/100g)',
      dataKey: 'totalSoilNitrogenContent'
    },
    5: {
      title: '土壤含磷总量柱状图',
      yAxisName: '土壤含磷总量(g/100g)',
      dataKey: 'totalSoilPhosphorusContent'
    }
  }

  const { title, yAxisName, dataKey } = chartOptions[selectedValue.value] || {}

  // Handle missing options
  if (!title || !yAxisName) return {}

  const xAxisData = periodDataList.value.map((item) => item.depthRange)
  const seriesData = periodDataList.value.map((item) =>
    parseFloat(item[dataKey])
  )

  return {
    title: { text: `${datePicked.value} ${title}`, left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: xAxisData, name: '土壤深度(cm)' },
    yAxis: {
      type: 'value',
      name: yAxisName,
      axisLabel: { formatter: (value) => `${value}` },
      axisTick: { show: true },
      axisLine: { show: true }
    },
    series: [
      {
        name: yAxisName,
        data: seriesData,
        type: 'bar',
        itemStyle: { color: 'rgba(54, 162, 235, 0.6)' }
      }
    ]
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
          // 提取最新日期并设置默认值
          if (date && date.length > 0) {
            const latestDate = date.sort((a, b) => b.localeCompare(a))[0]
            
            if (firBool === false) {
              datePicked.value = latestDate // 设置最新日期为默认值
              firBool = true
              fetchWetLandData()
              fetchSoilData()
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
    fetchWetLandData()
    fetchSoilData()
  }
}

// Fetch wetland data
function fetchWetLandData () {
  const loadingInstance = ElLoading.service(loadingoptions)
  PlantGetData({ time: datePicked.value, plant: plantPicked.value })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS' && result.body.length > 0) {
        const data = result.body[0] // 提取第一个对象
        wetLandData.value = [
          {
            dataType: '叶面积指数',
            dataValue: data.leafAreaIndex,
            dataUnit: '-'
          },
          {
            dataType: '物候指数',
            dataValue: data.phenologicalIndex,
            dataUnit: '%'
          },
          {
            dataType: '植物含水量',
            dataValue: data.vegetationMoistureContent,
            dataUnit: 'mg/g'
          },
          {
            dataType: '叶绿素含量',
            dataValue: data.chlorophyllContent,
            dataUnit: 'g/m²'
          },
          { dataType: '生物量', dataValue: data.biomass, dataUnit: 'kg' }, // 假定生物量单位为kg
          {
            dataType: '碳氮比',
            dataValue: data.carbonNitrogenRatio,
            dataUnit: '-'
          }
        ]
      } else {
        ElMessage({ showClose: true, message: '数据不存在', center: true })
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

// Fetch soil data
function fetchSoilData () {
  WetlandSoilGetData({ time: datePicked.value })
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        if (result.body.length === 0) {
          ElMessage({ showClose: true, message: '数据不存在', center: true })
        } else {
          periodDataList.value = result.body
          updateChart() // Ensure the chart is updated with the latest data
        }
      }
    })
    .catch(() => {
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// Update the chart with new data
function updateChart () {
  if (myChart) myChart.dispose()
  myChart = echarts.init(soilChart.value) // Assuming soilChart is your ref for the chart container
  myChart.setOption(createOption())
}

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      updateChart() // Initialize the chart on mount
      // Ensure at least one item is visible on mount
      const countVisible = switchItems.value.filter(
        (control) => control.visible
      ).length
      if (countVisible === 0) {
        switchItems.value[0].visible = true // Make the first item visible
      }
       handleVisibleChange(true, 'shiditurang', 'day')
    })
  }
  // fetchWetLandData()
  // fetchSoilData()

})

// Watchers for data changes
// watch(() => plantPicked.value, fetchWetLandData)
// watch(
//   () => datePicked.value,
//   () => {
//     fetchSoilData()
//     fetchWetLandData()
//   }
// )
</script>

<style scoped>
.controls {
  margin-bottom: -10px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 50px;
}
.container {
  padding: 0px;
}

.header {
  display: flex;
  justify-content: space-between; /* 左右分布 */
  align-items: center; /* 垂直居中 */
}

.gray-effect {
  height: 5px; /* 灰色效果的高度 */
  background-color: #d3d3d3; /* 灰色 */
  margin: 0px 0px; /* 上下边距 */
}
.ad {
  border: none;
  border-top: 1px dotted #000;
  margin: 0px -10px; /* 上下边距 */
}
.aa {
  margin-left: -200px; /* 负值表示向左偏移 */
}

.chart-container {
  margin: 0px 0;
  flex: 1; /* 使图表容器占据可用空间 */
  margin-right: 20px; /* 给图表和选择器之间留一些空间 */
}

.table-container {
  margin: 20px 0;
}
.flex-container {
  display: flex; /* 使用 Flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
  margin-left: 10%; /* 左边距 */
}

.soil-indicator {
  margin: 20px;
  flex-shrink: 0; /* 防止选择器缩小 */
  padding-left: 10px;
  left: 10%;
  width: 25%; /* 确保宽度足够 */
}
.soil {
  margin-top: -60px; /* 使用负边距将图表向上移动 */
}

input[type='radio'] {
  margin-right: 5px;
}
.date-picker-container {
  margin-right: 0; /* 确保右边没有额外的空间 */
  display: flex;
  margin-top: -12px;
  justify-content: space-between;
}
tbody tr:hover {
  background-color: #f0f0f0; /* 鼠标悬停时的背景颜色 */
}
.grid-content {
  border: none;
  min-height: 36px;
  background-color: white;
  text-align: left;
}
.grid-content {
  border: none;
  min-height: 36px;
  background-color: white;
  text-align: left;
  margin-bottom: 10px; /* 添加底部间距 */
  padding: 10px; /* 添加内边距以使内容更好看 */
}

.grid-content {
  border: none;
  min-height: 36px;
  background-color: white;
  text-align: left;
  margin-bottom: 10px; /* 添加底部间距 */
  padding: 0px; /* 添加内边距以使内容更好看 */
  white-space: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 溢出时显示省略号 */
}
</style>
