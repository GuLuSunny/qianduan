<template>
  <div class="container">
    <!-- 使用 el-tabs 替代 a-tabs 避免样式冲突 -->
    <el-tabs
      class="tabs"
      v-model="activeTab"
      @tab-change="handleTabChange"
    >
      <el-tab-pane label="产品上传" name="upload" />
      <el-tab-pane label="产品查询" name="search" />
      <el-tab-pane label="产品展示" name="display" />
    </el-tabs>
    
    <!-- 下方动态切换的组件区域 -->
    <div class="content-box">
      <component :is="currentComponent" :key="activeTab" />
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, nextTick } from 'vue'
// 引入组件
import ProductUpload from './ProductUpload.vue'
import ProductSearch from './ProductSearch.vue'
import ProductDisplay from './ProductDisplay.vue'

// 当前选中的 Tab - 使用字符串类型
const activeTab = ref('upload')

// 使用 shallowRef 避免不必要的响应式更新
const currentComponent = shallowRef(ProductUpload)

// 组件映射对象
const componentMap = {
  'upload': ProductUpload,
  'search': ProductSearch,
  'display': ProductDisplay
}

// Tab 切换处理逻辑 - 添加防抖和 nextTick
async function handleTabChange(key) {
  console.log('切换到:', key)
  await nextTick() // 等待 DOM 更新
  
  // 根据key获取对应的组件
  if (componentMap[key]) {
    currentComponent.value = componentMap[key]
  } else {
    console.warn('未知的标签页:', key)
    currentComponent.value = ProductUpload
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
  width: 100%;
  padding: 0;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.tabs {
  margin-left: 10px;
  padding: 0;
  flex-shrink: 0;
}

.content-box {
  border: 0;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow: auto;
  position: relative;
}

/* 确保选项卡内容区域有正确的样式 */
:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
}

:deep(.el-tab-pane) {
  height: 100%;
}

/* 确保所有组件容器都有正确的高度 */
:deep(.feature-container) {
  min-height: calc(100vh - 100px);
  padding: 20px;
}
</style>