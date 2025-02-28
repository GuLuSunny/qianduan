<!-- 动态上下翻滚的表格 -->
<template>
  <div class="table-wrap" style="width: 100%">
    <div class="titleContent">
      <div class="tit">样点</div>
      <div class="tit">水温</div>
      <div class="tit">PH</div>
      <div class="tit">浊度</div>
      <div class="tit">导电率</div>
      <div class="tit">溶解氧</div>
      <div class="tit">透明度</div>
      <div class="tit">TSS</div>
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
        <div class="descr">{{ item.deviceId }}</div>
        <div class="descr">{{ formatNumber(item.waterTemperature) }}</div>
        <div class="descr">{{ formatNumber(item.ph) }}</div>
        <div class="descr">{{ formatNumber(item.turbidity) }}</div>
        <div class="descr">{{ formatNumber(item.conductivity) }}</div>
        <div class="descr">{{ formatNumber(item.dissolvedOxygen) }}</div>
        <div class="descr">{{ formatNumber(item.transparency) }}</div>
        <div class="descr">{{ formatNumber(item.tss) }}</div>
      </div>
    </vue3-seamless-scroll>
  </div>
</template>

<script setup>
import { ref, defineComponent, onMounted, watch, onBeforeUnmount } from 'vue'
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'
import data from '@/../public/json/fullscreenSampleJson/waterPhysicochemistry.json' // 注意路径，可能需要调整
import { getWaterPhyBigScreen } from '@/api/getData' // 导入 API 请求方法
const periodDataList = ref([]) // 响应式数组用于保存水体数据
const hasExtraScroll1 = ref(true)
const hasExtraScroll2 = ref(false)
const hasExtraScroll3 = ref(false)

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

onMounted(() => {
  changeSize()
  periodDataList.value = data
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
