<template>
  <div class="atmosphere-wrap" style="width: 100%; height: 100%">
    <div class="atmosphere-title">{{ title }}</div>
    <el-row :gutter="25">
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">风速(m/s)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.windSpeed) }}</div>
        </div>
      </el-col>
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">雨量(mm)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.rainfall) }}</div>
        </div>
      </el-col>
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">大气温度(℃)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.atmosphereTemperature) }}</div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="25">
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">土壤温度(℃)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.soilTemperature) }}</div>
        </div>
      </el-col>
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">数字气压(hPa)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.digitalPressure) }}</div>
        </div>
      </el-col>
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">简易总辐射(W/m2)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.simpleTotalRadiation) }}</div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="25">
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">风向(°)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.windDirection) }}</div>
        </div>
      </el-col>
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">土壤湿度(%RH)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.soilHumidity) || 'N/A' }}</div>
        </div>
      </el-col>
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">大气湿度(%RH)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.atmosphereHumidity) }}</div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="25">
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">PM2.5 (ug/m3)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.pm25) }}</div>
        </div>
      </el-col>
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">盐分(mg/L)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.salinity) }}</div>
        </div>
      </el-col>
      <el-col
        :span="8"
        :class="[
          {
            'extra-padding1': hasExtraPadding1,
            'extra-padding2': hasExtraPadding2,
            'extra-padding3': hasExtraPadding3
          }
        ]"
      >
        <div class="grid-content">
          <div class="box-label">PM10 (ug/m3)</div>
          <div class="box-value">{{ formatNumber(atmosphereData.pm10) }}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import data from '@/../public/json/fullscreenSampleJson/atmosphere.json' // 注意路径，可能需要调整
// 创建一个响应式变量来存储气象数据
const atmosphereData = ref({
  windSpeed: '---',
  rainfall: '---',
  atmosphereTemperature: '---',
  soilTemperature: '---',
  digitalPressure: '---',
  simpleTotalRadiation: '---',
  windDirection: '---',
  soilHumidity: null, // 声明为 null，方便后续处理
  atmosphereHumidity: '---',
  pm25: '---',
  salinity: '---',
  pm10: '---'
})
const hasExtraPadding1 = ref(true)
const hasExtraPadding2 = ref(false)
const hasExtraPadding3 = ref(false)

// 页面标题，显示当前日期 + 场所名称
const title = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}日 龙庭公园气象数据`
})

function formatNumber (number) {
  if (!isNaN(number) && number !== '') {
    const numberValue = Number(number) // 将字符串转换为数字
    return numberValue.toFixed(2)
  } else {
    return ''
  }
}

// 监听window对象的resize事件
window.addEventListener('resize', changeSize)
function changeSize () {
  // 页面大小设置
  const viewportHeightInPx = window.innerHeight
  const viewportWidthInPx = window.innerWidth
  // const gridHeight = viewportHeightInPx * 0.14
  // const gridWidth = viewportWidthInPx * 0.23
  const gridleft = viewportWidthInPx * 0.003
  // console.log('viewportHeightInPx:', viewportHeightInPx)
  // console.log('viewportWidthInPx:', viewportWidthInPx)
  if (viewportHeightInPx > 850 && viewportHeightInPx < 920) {
    hasExtraPadding1.value = true
    hasExtraPadding2.value = false
    hasExtraPadding3.value = false
  }
  if (viewportHeightInPx > 1000 && viewportHeightInPx < 1100) {
    hasExtraPadding1.value = false
    hasExtraPadding2.value = true
    hasExtraPadding3.value = false
  }
  if (viewportHeightInPx > 650 && viewportHeightInPx < 750) {
    hasExtraPadding1.value = false
    hasExtraPadding2.value = false
    hasExtraPadding3.value = true
  }
}
// 组件加载时开始获取数据
onMounted(() => {
  changeSize()
  atmosphereData.value = data
})
onBeforeUnmount(() => {
  // 销毁实例
  window.removeEventListener('resize', changeSize);
})
</script>

<style scoped>
.el-row {
  width: 100%;
  /* height: 100%; */
  padding: 0px 10px 2px 10px;
}
/* .bordered-col {
  padding-top: calc(100vh * 0.01);
} */
.grid-content {
  margin: 0px;
  padding: 0px;
  height: 40px;
  /* padding-top: calc(100vh * 0.025); */
  /* min-height: 20px; */
  background-color: rgba(17, 32, 71, 0.5);
  font-size: 10px;
  text-align: center;
  /* line-height: 21px; */
  border: 1px solid #1272df; /* 边框样式，可以根据需要自定义颜色和宽度 */
  border-radius: 10px; /* 可选，圆角边框 */
}
.extra-padding1 {
  margin-top: calc(100vh * 0.012);
}
.extra-padding2 {
  margin-top: calc(100vh * 0.02);
}
.extra-padding3 {
  margin-top: calc(100vh * 0.00001);
}

.atmosphere-title {
  text-align: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0px 0 6px 0;
}

.atmosphere-wrap {
  margin-top: -18px; /* 整体上移一点，与其他模块一致 */
}
</style>
