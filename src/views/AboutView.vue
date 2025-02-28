<template>
  <div style="width: 100%; height: 240px">
        <el-carousel
          ref="carouseRef"
          style="width: 100%; height: 100%"
          motion-blur
          height="100%"
          indicator-position="none"
          arrow="never"
          interval="2000"
          :autoplay="autoplay"
        >
          <el-carousel-item v-for="item in birdData" :key="item.key">
            <img
              :src="item.src"
              alt="Bird 1"
              style="width: 100%; height: 100%"
            />
          </el-carousel-item>
        </el-carousel>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
const carouseRef = ref()
const autoplay=ref (true)
const data = ref({
  title: '',
  content: ''
})
const birdData = [
 {
    key: 1,
    src: '/images/fullscreenInfraredCamera/icd1.png',
  },
  {
    key: 2,
    src: '/images/fullscreenInfraredCamera/icd2.png',
  },
  {
    key: 3,
    src: '/images/fullscreenInfraredCamera/icd3.png',
  }
]
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
