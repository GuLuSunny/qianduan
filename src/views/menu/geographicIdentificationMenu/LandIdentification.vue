<template>
  <div>
    <!-- 功能选择选项卡 -->
    <div class="feature-tabs">
      <el-radio-group v-model="activeFeature" size="large">
        <el-radio-button label="upload">数据上传</el-radio-button>
        <el-radio-button label="identification">土地识别</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 动态加载子组件 -->
    <landUpload 
      v-if="activeFeature === 'upload'" 
      @cancel="handleCancel"
      @continue="handleContinue"
    />
    
    <LandRecognition 
      v-if="activeFeature === 'identification'" 
      @back="handleBack"
      @continue-predict="handleContinuePredict"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import landUpload from './LandUpload.vue'
import LandRecognition from './LandRecognition.vue'

// 功能选项卡状态
const activeFeature = ref('upload')

// 处理子组件事件
const handleCancel = () => {
  // 可以在这里处理取消逻辑
  console.log('取消上传操作')
}

const handleContinue = () => {
  // 可以在这里处理继续逻辑
  console.log('继续上传操作')
}

const handleBack = () => {
  // 可以在这里处理返回逻辑
  console.log('返回操作')
}

const handleContinuePredict = () => {
  // 可以在这里处理继续预测逻辑
  console.log('继续预测操作')
}
</script>

<style scoped>
.feature-tabs {
  display: flex;
  justify-content: center;
  margin: 20px 0 30px;
}
</style>