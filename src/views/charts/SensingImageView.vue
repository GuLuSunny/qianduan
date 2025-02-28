<template>
  <div style="width: 100%; height: calc(100vh * 0.25)">
    <el-carousel
      ref="carouseRef"
      style="width: calc(100vw * 0.248); height: calc(100vh * 0.25)"
      motion-blur
      indicator-position="none"
      arrow="never"
      interval="3500"
      :autoplay="autoplay"
    >
      <el-carousel-item v-for="item in birdData" :key="item.key">
        <el-image
          :src="item.src"
          :key="item.src"
          alt="sensing image"
          style="width: calc(100vw * 0.2498); height: calc(100vh * 0.25)"
          lazy
        />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
const carouseRef = ref()
const autoplay = ref(true)
const data = ref({
  title: '',
  content: ''
})
const birdData = [
  {
    key: 1,
    src: '/images/fullscreenRemoteSensing/siv1.jpg'
  },
  {
    key: 2,
    src: '/images/fullscreenRemoteSensing/siv2.jpg'
  },
  {
    key: 3,
    src: '/images/fullscreenRemoteSensing/siv3.jpg'
  }
  // ,
  // {
  //   key: 4,
  //   src: require('@/assets/img/sivIMG/siv4.jpg')
  // },
  // {
  //   key: 5,
  //   src: require('@/assets/img/sivIMG/siv5.jpg')
  // },
  // {
  //   key: 6,
  //   src: require('@/assets/img/sivIMG/siv6.jpg')
  // },
  // {
  //   key: 7,
  //   src: require('@/assets/img/sivIMG/siv7.jpg')
  // },
  // {
  //   key: 8,
  //   src: require('@/assets/img/sivIMG/siv8.jpg')
  // },
  // {
  //   key: 9,
  //   src: require('@/assets/img/sivIMG/siv9.jpg')
  // },
  // {
  //   key: 10,
  //   src: require('@/assets/img/sivIMG/siv10.jpg')
  // },
  // {
  //   key: 11,
  //   src: require('@/assets/img/sivIMG/siv11.jpg')
  // }
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
