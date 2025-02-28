<template>
  <div style="width: 100%; height: 100%">
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
          风速(m/s)<br />
          {{ formatNumber(atmosphereData.windSpeed) }}
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
          雨量(mm)<br />
          {{ formatNumber(atmosphereData.rainfall) }}
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
          大气温度(℃)<br />
          {{ formatNumber(atmosphereData.atmosphereTemperature) }}
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
          土壤温度(℃)<br />
          {{ formatNumber(atmosphereData.soilTemperature) }}
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
          数字气压(hPa)<br />
          {{ formatNumber(atmosphereData.digitalPressure) }}
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
          简易总辐射(W/m2)<br />
          {{ formatNumber(atmosphereData.simpleTotalRadiation) }}
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
          风向(°)<br />
          {{ formatNumber(atmosphereData.windDirection) }}
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
          土壤湿度(%RH)<br />
          {{ formatNumber(atmosphereData.soilHumidity) || 'N/A' }}
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
          大气湿度(%RH)<br />
          {{ formatNumber(atmosphereData.atmosphereHumidity) }}
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
          PM2.5 (ug/m3)<br />
          {{ formatNumber(atmosphereData.pm25) }}
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
          盐分(mg/L)<br />
          {{ formatNumber(atmosphereData.salinity) }}
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
          PM10 (ug/m3)<br />{{ formatNumber(atmosphereData.pm10) }}
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch,onBeforeUnmount } from 'vue'
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
</style>
