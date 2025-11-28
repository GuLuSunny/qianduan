<template>
  <div class="container">
    <!-- 使用 el-tabs 替代 a-tabs 避免样式冲突 -->
    <el-tabs
      class="tabs"
      v-model="activeTab"
      @tab-change="handleTabChange"
    >
      <el-tab-pane label="产品查询" name="1" />
      <el-tab-pane label="产品展示" name="2" />
      
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
import ProductSearch from './ProductSearch.vue'
import ProductDisplay from './ProductDisplay.vue'


// 当前选中的 Tab - 使用字符串类型
const activeTab = ref('1')

// 使用 shallowRef 避免不必要的响应式更新
const currentComponent = shallowRef(ProductSearch)

// Tab 切换处理逻辑 - 添加防抖和 nextTick
async function handleTabChange(key) {
  console.log(key)
  await nextTick() // 等待 DOM 更新
  
  if (key === '1') {
    currentComponent.value = ProductSearch
  } 
  else if (key === '2') {
    currentComponent.value =ProductDisplay
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
</style>