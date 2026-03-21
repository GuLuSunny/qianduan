<template>
  <div class="atmosphere-wrap">
    <div class="atmosphere-title">{{ title }}</div>

    <!-- 使用紧凑的网格布局 -->
    <div class="compact-grid">
      <!-- 第一行 -->
      <div class="compact-row">
        <div class="compact-item">
          <div class="compact-label">风速(m/s)</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.windSpeed) }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">雨量(mm)</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.rainfall) }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">大气温度(℃)</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.atmosphereTemperature) }}</div>
        </div>
      </div>

      <!-- 第二行 -->
      <div class="compact-row">
        <div class="compact-item">
          <div class="compact-label">相对湿度(%)</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.relativeHumidity) }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">数字气压(hPa)</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.digitalPressure) }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">aqi指数</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.aqiIndex) }}</div>
        </div>
      </div>

      <!-- 第三行 -->
      <div class="compact-row">
        <div class="compact-item">
          <div class="compact-label">风向(°)</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.windDirection) }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">首要污染物</div>
          <div class="compact-value">{{ atmosphereData.primaryPollutant || '--' }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">空气质量等级</div>
          <div class="compact-value">{{ atmosphereData.airQualityLevel || '--' }}</div>
        </div>
      </div>

      <!-- 第四行 -->
      <div class="compact-row">
        <div class="compact-item">
          <div class="compact-label">PM2.5(ug/m3)</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.pm25) }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">臭氧(μg/m3)</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.ozone) }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">PM10(ug/m3)</div>
          <div class="compact-value">{{ formatNumber(atmosphereData.pm10) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { findAtmosphere, getTimesByType, queryDeviceByMultiWord } from '@/api/getData'
import { ElMessage, ElLoading } from 'element-plus'

// 创建一个响应式变量来存储气象数据
const atmosphereData = ref({
  windSpeed: '---',
  rainfall: '---',
  atmosphereTemperature: '---',
  relativeHumidity: '---',
  digitalPressure: '---',
  aqiIndex: '---',
  windDirection: '---',
  primaryPollutant: '---',
  airQualityLevel: '---',
  pm25: '---',
  pm10: '---',
  ozone: '---'
})

const dateSelected = ref('')
const deviceOptions = ref([]) // 设备列表
const selectedDeviceId = ref(null) // 选择的设备ID
const deviceName = ref('') // 设备名称

// 加载配置
const loadingoptions = {
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

// 页面标题，显示当前日期 + 场所名称
const title = computed(() => {
  if (dateSelected.value && deviceName.value) {
    // 格式化日期为YYYY-MM-DD
    const date = new Date(dateSelected.value)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day} ${deviceName.value}气象数据`
  } else {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day} 气象数据`
  }
})

function formatNumber(number) {
  // 处理空值、null、undefined或空字符串
  if (number === null || number === undefined || number === '' || number === 'NaN') {
    return '---'
  }
  
  // 处理"缺测"值
  if (number === '缺测') {
    return '缺测'
  }
  
  // 如果是字符串，尝试转换为数字
  const numberValue = Number(number)
  
  // 检查是否为有效数字
  if (!isNaN(numberValue)) {
    return numberValue.toFixed(2)
  } else {
    return '---'
  }
}

// 获取设备列表
function fetchDeviceOptions () {
  // 观测设备种类分类；03：气象站
  return queryDeviceByMultiWord({ type: '03' })
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        deviceOptions.value = result.body
        if (result.body.length > 0) {
          // 查找设备ID为24的设备，如果不存在则使用第一个设备
          const device24 = result.body.find(device => device.id === 24)
          selectedDeviceId.value = device24 ? 24 : result.body[0].id
          deviceName.value = device24 ? device24.deviceName : result.body[0].deviceName
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
    .catch((error) => {
      ElMessage({
        showClose: true,
        message: '获取设备数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

const showDateArr = ref([])

// 获取可用日期
function handleVisibleChange(visibility, type, searchTimeType) {
  if (visibility) {
    // 开启时
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
            // 获取最新一天的数据
            const latestDate = date.sort((a, b) => b.localeCompare(a))[0]
            dateSelected.value = latestDate
            getAtmosphereData()
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
  }
}

// 获取气象数据
function getAtmosphereData() {
  if (!dateSelected.value || !selectedDeviceId.value) return
  
  const loadingInstance = ElLoading.service(loadingoptions)
  
  // 获取指定月份的气象数据
  findAtmosphere({ 
    time: dateSelected.value, 
    device: selectedDeviceId.value
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        if (result.body.length === 0) {
          ElMessage({
            showClose: true,
            message: `日期 ${dateSelected.value} 暂无数据`,
            center: true,
            type: 'warning'
          })
          // 重置为默认值
          resetAtmosphereData()
        } else {
          // 取最后一天的数据（假设数据按日期排序）
          const latestData = result.body[result.body.length - 1]
          if (latestData && latestData.atmosphere) {
            // 映射字段
            atmosphereData.value = {
              windSpeed: latestData.atmosphere.windSpeed || '---',
              rainfall: latestData.atmosphere.rainfall || '---',
              atmosphereTemperature: latestData.atmosphere.atmosphereTemperature || '---',
              relativeHumidity: latestData.atmosphere.relativeHumidity || '---',
              digitalPressure: latestData.atmosphere.digitalPressure || '---',
              aqiIndex: latestData.atmosphere.aqiIndex || '---',
              windDirection: latestData.atmosphere.windDirection || '---',
              primaryPollutant: latestData.atmosphere.primaryPollutant || '---',
              airQualityLevel: latestData.atmosphere.airQualityLevel || '---',
              pm25: latestData.atmosphere.pm25 || '---',
              pm10: latestData.atmosphere.pm10 || '---',
              ozone: latestData.atmosphere.ozone || '---'
            }
          }
        }
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true,
          type: 'error'
        })
        resetAtmosphereData()
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
      resetAtmosphereData()
    })
}

// 重置气象数据为默认值
function resetAtmosphereData() {
  atmosphereData.value = {
    windSpeed: '---',
    rainfall: '---',
    atmosphereTemperature: '---',
    relativeHumidity: '---',
    digitalPressure: '---',
    aqiIndex: '---',
    windDirection: '---',
    primaryPollutant: '---',
    airQualityLevel: '---',
    pm25: '---',
    pm10: '---',
    ozone: '---'
  }
}

// 组件加载时获取数据
onMounted(() => {
  // 先获取设备列表，然后获取最新日期的数据
  fetchDeviceOptions().then(() => {
    handleVisibleChange(true, 'qixiang', 'day')
  })
})
</script>


<style scoped>
.atmosphere-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* padding: 0 8px; */
  overflow: hidden;
}

.atmosphere-title {
  text-align: center;
  color: #ffffff;
  font-size: 15px;
  /* 增大 */
  font-weight: 600;
  margin: 0px 0 10px 0;
  /* 增大边距 */
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(17, 32, 71, 0.3);
  border-radius: 6px;
  /* 增大圆角 */
  padding: 6px 10px;
  /* 增大内边距 */
}

.compact-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* 增大行间距 */
  overflow: hidden;
}

.compact-row {
  flex: 1;
  display: flex;
  gap: 8px;
  /* 增大列间距 */
  min-height: 0;
  max-height: 38px;
  /* 增大行高 */
  margin-bottom: 5px;
}

.compact-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(17, 32, 71, 0.5);
  border: 1px solid #1272df;
  border-radius: 6px;
  /* 增大圆角 */
  padding: 4px 2px;
  /* 增大内边距 */
  min-width: 0;
  overflow: hidden;
  height: 100%;
}

.compact-label {
  color: #7dffff;
  font-size: 12px !important;
  /* 增大字体 */
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  /* 增大行高 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-bottom: 2px;
  /* 增大边距 */
}

.compact-value {
  color: #ffffff;
  font-size: 14px !important;
  /* 增大字体 */
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  /* 增大行高 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* 笔记本屏幕适配 */
@media screen and (max-width: 1440px) {
  .atmosphere-title {
    font-size: 14px;
    margin: 6px 0 8px 0;
    padding: 4px 8px;
  }

  .compact-label {
    font-size: 10px !important;
  }

  .compact-value {
    font-size: 12px !important;
  }

  .compact-row {
    gap: 6px;
    max-height: 35px;
    /* 增大行高 */
  }

  .compact-item {
    padding: 3px 2px;
    border-radius: 5px;
  }

  .compact-grid {
    gap: 6px;
  }
}

/* 小屏幕笔记本适配 */
@media screen and (max-width: 1366px) {
  .atmosphere-title {
    font-size: 13px;
  }

  .compact-label {
    font-size: 9px !important;
  }

  .compact-value {
    font-size: 11px !important;
  }

  .compact-row {
    max-height: 32px;
    /* 增大行高 */
    gap: 5px;
  }

  .compact-item {
    padding: 2px 1px;
  }
}
</style>