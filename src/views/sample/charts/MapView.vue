<template>
  <div style="width: calc(100vw * 0.5); height: calc(100vh * 0.53)">
    <!-- 遮盖层 -->
    <div
      style="
        z-index: 300;
        position: absolute;
        top: 1px;
        left: 2px;
        width: 300px;
        height: 150px;
        background-color: rgba(0, 0, 0, 0.5); /* 透明度为50%的黑色背景 */
        text-align: left;
        border: 1px solid  #FFFFFF;
        padding: 10px;
      "
    >
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;陆浑站工作和生活设施建于玉皇山森林公园内，现有综合楼面积约794平方米，包括3个实验室（样品室、标本室和无人机设备室）、展览室、科研专用房间（3间）、会议室。站区内宽带网络接入，可实现野外科学装置运行和永久标准地管理远程监控，实现了设备运行实时监控、数据远程下载、编辑和共享。
    </div>

    <el-image
      src="/images/fullscreenSample/center_icon.jpg"
      key="1"
      alt="image"
      style="width: calc(100vw * 0.497); height: calc(100vh * 0.527)"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :initial-index="0"
      :preview-src-list="srcList"
    />
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref, getCurrentInstance } from 'vue'

const bodyList = ref()
const currentMarker = ref()
const map = null
const srcList = ['/images/fullscreenSample/center.jpg']
</script>

<style></style>
