<template>
  <div class="atmosphere-wrap">
    <div class="atmosphere-title">{{ title }}</div>

    <!-- 使用紧凑的网格布局 -->
    <div class="compact-grid">
      <!-- 第一行 -->
      <div class="compact-row">
        <div class="compact-item">
          <div class="compact-label">风速(m/s)</div>
          <div class="compact-value">{{ atmosphereData.windSpeed}}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">雨量(mm)</div>
          <div class="compact-value">{{ atmosphereData.rainfall }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">大气温度(℃)</div>
          <div class="compact-value">{{ atmosphereData.atmosphereTemperature }}</div>
        </div>
      </div>

      <!-- 第二行 -->
      <div class="compact-row">
        <div class="compact-item">
          <div class="compact-label">相对湿度(%)</div>
          <div class="compact-value">{{ atmosphereData.relativeHumidity }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">数字气压(hPa)</div>
          <div class="compact-value">{{ atmosphereData.digitalPressure }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">aqi指数</div>
          <div class="compact-value">{{ atmosphereData.aqiIndex }}</div>
        </div>
      </div>

      <!-- 第三行 -->
      <div class="compact-row">
        <div class="compact-item">
          <div class="compact-label">风向(°)</div>
          <div class="compact-value">{{ atmosphereData.windDirection }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">首要污染物</div>
          <div class="compact-value">{{ atmosphereData.primaryPollutant }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">空气质量等级</div>
          <div class="compact-value">{{ atmosphereData.airQualityLevel }}</div>
        </div>
      </div>

      <!-- 第四行 -->
      <div class="compact-row">
        <div class="compact-item">
          <div class="compact-label">PM2.5(ug/m3)</div>
          <div class="compact-value">{{ atmosphereData.pm25 }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">臭氧(μg/m3)</div>
          <div class="compact-value">{{ atmosphereData.ozone }}</div>
        </div>
        <div class="compact-item">
          <div class="compact-label">PM10(ug/m3)</div>
          <div class="compact-value">{{ atmosphereData.pm10 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import data from '@/../public/json/fullscreenSampleJson/atmosphere.json'

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

// 页面标题，显示当前日期 + 场所名称
const title = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}日 龙亭公园气象数据`
})

function formatNumber(number) {
  if (!isNaN(number) && number !== '') {
    const numberValue = Number(number)
    return numberValue.toFixed(2)
  } else {
    return '---'
  }
}

// 组件加载时获取数据
onMounted(() => {
  atmosphereData.value = data
})
</script>


<style scoped>
.atmosphere-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  overflow: hidden;
}

.atmosphere-title {
  text-align: center;
  color: #ffffff;
  font-size: 16px;
  /* 增大 */
  font-weight: 600;
  margin: 8px 0 10px 0;
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