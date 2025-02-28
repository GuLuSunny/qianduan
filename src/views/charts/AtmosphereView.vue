<template>
  <div style="width: 100%; height: 100%" class="atmosDiv">
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
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  findCurrentAtmosphereByDevice,
  selectByYearAndDevice,
  selectByMonthAndDevice
} from '@/api/getData' // 导入 API 请求方法
import { ElMessage, ElLoading } from 'element-plus'

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

const loadingoptions = {
  // 加载配置
  target: '.atmosDiv',
  fullscreen: false,
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

function formatNumber (number) {
  if (!isNaN(number) && number !== '') {
    const numberValue = Number(number) // 将字符串转换为数字
    return numberValue.toFixed(2)
  } else {
    return ''
  }
}

// 定义接收的参数
const props = defineProps({
  qiXiangData: {
    type: Object,
    default: {
      time: '2021-01-01',
      device: '24'
    }
  }
})

// 监听 props 的变化
watch(
  () => [props.qiXiangData.device, props.qiXiangData.time],
  (newValue, oldValue) => {
    // 当message变化时，这里的代码会执行
    // console.log(`Message changed from "${oldValue}" to "${newValue}"`)
    // 你可以在这里执行任何需要的逻辑
    getAtmosphere()
  }
)

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
  getAtmosphere()
})
onBeforeUnmount(() => {
  // 销毁实例
  window.removeEventListener('resize', changeSize)
})

// 获取气象动态数据  
function getAtmosphere() {  
  const loadingInstance = ElLoading.service(loadingoptions);  
  
  // 从 props 中获取 device 和 time  
  const { device, time } = props.qiXiangData;  

  // 定义正则表达式来匹配不同的日期格式  
  const yearRegex = /^\d{4}$/; // YYYY  
  const monthRegex = /^\d{4}-\d{2}$/; // YYYY-MM  
  const dayRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD  

  let requestPromise;  

  if (dayRegex.test(time)) {  
    // 如果是 YYYY-MM-DD 格式  
    requestPromise = findCurrentAtmosphereByDevice({  
      device: device,  
      time: time  
    });  
  } else if (monthRegex.test(time)) {  
    // 如果是 YYYY-MM 格式  
    requestPromise = selectByMonthAndDevice({  
      deviceId: device,  
      observationTime: time  
    });  
  } else if (yearRegex.test(time)) {  
    // 如果是 YYYY 格式  
    requestPromise = selectByYearAndDevice({  
      deviceId: device,  
      observationTime: time  
    });  
  } else {  
    loadingInstance.close();  
    ElMessage({  
      showClose: true,  
      message: '时间格式不正确',  
      center: true,  
      type: 'error'  
    });  
    return; // 退出函数  
  }  

  // 处理请求的 Promise  
  requestPromise  
    .then((res) => {  
      loadingInstance.close();  
      const result = res.response.value; // 处理成功的响应  
      if (result.code === 'SUCCESS') {  
        if (result.body === null || result.body.length === 0) {  
          ElMessage({  
            showClose: true,  
            message: '气象数据不存在',  
            center: true  
          });  
        } else {  
          // 将数据存储到响应式变量中  
          atmosphereData.value = result.body;  
        }  
      } else {  
        const message = result.msg;  
        ElMessage({  
          showClose: true,  
          message: message,  
          center: true  
        });  
      }  
    })  
    .catch((error) => {  
      loadingInstance.close();  
      ElMessage({  
        showClose: true,  
        message: '获取气象数据失败，请稍后再试',  
        center: true,  
        type: 'error'  
      });  
    });  
}

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
