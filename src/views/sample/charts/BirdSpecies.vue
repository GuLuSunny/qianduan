<template>
  <div style="width: 100%; height: calc(100vh * 0.25)">
    <el-popover
      v-if="isPopoverReady"
      placement="top"
      :width="300"
      trigger="hover"
      effect="light"
      hide-after="100"
      @show="showPop"
      @hide="hidePop"
    >
      <template #reference>
        <el-carousel
          ref="carouseRef"
          style="width: 100%; height: calc(100vh * 0.25)"
          motion-blur
          indicator-position="none"
          arrow="never"
          interval="3500"
          :autoplay="autoplay"
        >
          <el-carousel-item v-for="item in birdData" :key="item.key">
            <el-image
              :src="item.imgsrc"
              :key="item.id"
              alt="image"
              style="width: 100%; height: calc(100vh * 0.25)"
            />
          </el-carousel-item>
        </el-carousel>
      </template>
      <el-descriptions :title="data.name" :column="1" border>
        <el-descriptions-item
          label="拉丁学名"
          label-align="center"
          align="center"
          >{{ data.nameLatin }}</el-descriptions-item
        >
        <el-descriptions-item
          label="居留型"
          label-align="left"
          align="center"
          >{{ data.resideType }}</el-descriptions-item
        >
        <el-descriptions-item
          label="保护级别"
          label-align="left"
          align="center"
          >{{ data.protectionLevel }}</el-descriptions-item
        >
      </el-descriptions>
    </el-popover>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import dataJson from '@/../public/json/fullscreenSampleJson/birdSpecies.json' // 注意路径，可能需要调整

const carouseRef = ref()
// 控制popover是否准备好显示
const isPopoverReady = ref(false)
const autoplay = ref(true)
const data = ref({})
const birdData = ref([])
// 展示
function showPop () {
  const activeIndex = carouseRef.value.activeIndex
  const currentItem = birdData.value[activeIndex]
  data.value = { ...currentItem }
  autoplay.value = false
  // data.value.title = currentItem.name + ' ' + currentItem.nameLatin
  // data.value.content =
  //   currentItem.resideType + '<br/>' + currentItem.protectionLevel
  // console.log(activeIndex)
}
// 隐藏
function hidePop () {
  autoplay.value = true
}

onMounted(() => {
  setTimeout(() => {
    // 延迟挂载
    isPopoverReady.value = true
    birdData.value = dataJson
  }, 1500)
})
</script>
<style>
.demonstration {
  color: var(--el-text-color-secondary);
}

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  /* line-height: 200px; */
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
