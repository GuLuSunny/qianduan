<!-- 动态上下翻滚的表格 -->
<template>
  <div class="table-wrap" style="width: 100%">
    <div class="water-title">{{ title }}</div>
    <div class="titleContent">
      <div class="tit">样点</div>
      <div class="tit">水温(℃)</div>
      <div class="tit">PH</div>
      <div class="tit">溶解氧</div>
      <div class="tit">高锰酸盐指数</div>
      <div class="tit">总磷</div>
      <div class="tit">水位</div>
      <div class="tit">气温(℃)</div>
    </div>

    <!-- 配置详情请见 README.md -->
    <vue3-seamless-scroll
      :list="periodDataList"
      :class="[
        {
          scroll1: hasExtraScroll1,
          scroll2: hasExtraScroll2,
          scroll3: hasExtraScroll3
        }
      ]"
      direction="up"
      :step="0.9"
      :hover="true"
      :limit-scroll-num="6"
      :is-watch="true"
      :single-height="0"
      :single-width="0"
      :single-wait-time="1000"
      :wheel="false"
    >
      <div class="countContent" v-for="(item, i) in periodDataList" :key="i">
        <div class="descr">{{ item.deviceId || '--' }}</div>
        <div class="descr">{{ formatNumber(item.waterTemperature, '℃') }}</div>
        <div class="descr">{{ formatNumber(item.ph) }}</div>
        <div class="descr">{{ formatNumber(item.dissolvedOxygen) }}</div>
        <div class="descr">{{ formatNumber(item.codmn) }}</div>
        <div class="descr">{{ formatNumber(item.tp) }}</div>
        <div class="descr">{{ formatNumber(item.waterLevel) }}</div>
        <div class="descr">{{ formatNumber(item.airTemperature, '℃') }}</div>
      </div>
    </vue3-seamless-scroll>
  </div>
</template>

<script setup>
import { ref, defineComponent, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'
import { getWaterPhyBigScreen, getTimesByType } from '@/api/getData' // 导入 API 请求方法
import { ElMessage, ElLoading } from 'element-plus'

const periodDataList = ref([]) // 响应式数组用于保存水体数据
const hasExtraScroll1 = ref(true)
const hasExtraScroll2 = ref(false)
const hasExtraScroll3 = ref(false)
const dateSelected = ref('') // 选择的日期

// 加载配置
const loadingoptions = {
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

const title = computed(() => {
  return dateSelected.value ? `${dateSelected.value} 水质数据` : '水质数据'
})

function formatNumber (number, unit = '') {
  // 处理空值、null、undefined或空字符串
  if (number === null || number === undefined || number === '' || number === 'NaN') {
    return '--'
  }
  
  // 处理小于号开头的检测限值（如<0.005）
  if (typeof number === 'string' && number.startsWith('<')) {
    return number
  }
  
  // 如果是字符串，尝试转换为数字
  const numberValue = Number(number)
  
  // 检查是否为有效数字
  if (!isNaN(numberValue)) {
    // pH值通常保留1位小数，其他水质参数通常保留2位小数
    // 但根据具体需求，这里统一保留2位小数
    return numberValue.toFixed(2) + (unit ? ` ${unit}` : '')
  } else {
    return '--'
  }
}

// 监听window对象的resize事件
window.addEventListener('resize', changeSize)

const showDateArr = ref([])
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
              dateSelected.value = latestDate // 设置最新日期为默认值
              getWaterPhy()
              firBool = true
            }
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
  } else if (!visibility && dateSelected.value) {
    getWaterPhy()
  }
}

function changeSize () {
  // 页面大小设置
  const viewportHeightInPx = window.innerHeight
  if (viewportHeightInPx > 850 && viewportHeightInPx < 920) {
    hasExtraScroll1.value = true
    hasExtraScroll2.value = false
    hasExtraScroll3.value = false
  }
  if (viewportHeightInPx > 1000 && viewportHeightInPx < 1100) {
    hasExtraScroll1.value = false
    hasExtraScroll2.value = true
    hasExtraScroll3.value = false
  }
  if (viewportHeightInPx > 650 && viewportHeightInPx < 750) {
    hasExtraScroll1.value = false
    hasExtraScroll2.value = false
    hasExtraScroll3.value = true
  }
}

// 获取水质数据
function getWaterPhy () {
  if (!dateSelected.value) return
  
  const loadingInstance = ElLoading.service(loadingoptions)
  getWaterPhyBigScreen({ 
    time: dateSelected.value, 
    device: '' // 传空获取所有设备
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
          periodDataList.value = []
        } else {
          // 直接使用接口返回的数据，确保字段对应
          periodDataList.value = result.body
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
      loadingInstance.close()
      console.error('获取水质数据失败:', error)
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

onMounted(() => {
  changeSize()
  // 初始化时获取最新日期的数据
  handleVisibleChange(true, 'shuitilihua', 'day')
})

onBeforeUnmount(() => {
  // 销毁实例
  window.removeEventListener('resize', changeSize)
})
</script>

<style scoped>
.tit {
  font-size: 10px !important;
}
.header-table {
  width: 100%;
  border-collapse: collapse; /* 合并边框 */
}

.table-wrap {
  width: calc(100vw * 0.06);
  margin-top: -16px; /* 整体上移一点 */
  /* height: calc(100vh * 0.2); */
  /* padding: 0 20px; */
  color: #ffffff;
}

.table-wrap .scroll1 {
  /* max-height: 200px; */
  height: calc(100vh * 0.2);
  overflow: hidden;
}
.table-wrap .scroll2 {
  /* max-height: 200px; */
  height: calc(100vh * 0.205);
  overflow: hidden;
}
.table-wrap .scroll3 {
  /* max-height: 200px; */
  height: calc(100vh * 0.2);
  overflow: hidden;
}

.titleContent {
  border: 1px solid black;
  padding: 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  font-size: 10x;
}

.titleContent .tit {
  flex: 0 0 10%;
  text-align: center;
  font-size: 15x;
}

.countContent {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  /* height: calc(100vh * 0.045); */
}

.countContent .descr {
  flex: 0 0 11%;
  padding: 5px 0;
  text-align: center;
}

.countContent:nth-of-type(odd) {
  background: #318699 !important;
}

.countContent:nth-of-type(odd) .descr {
  border-right: 1px solid #247587;
}
</style>
<style scoped>
.water-title {
  text-align: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 2px 0 4px 0; /* 减小底部间距，缩小标题与下方内容的间隔 */
}
</style>