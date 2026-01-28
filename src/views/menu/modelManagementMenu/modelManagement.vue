<template>
  <div class="container">
    <!-- 左上角选项框 -->
    <a-tabs
      class="tabs"
      v-model:activeKey="activeTab"
      @change="handleTabChange"
    >
      <a-tab-pane key="1" tab="角色管理" />
      <a-tab-pane key="2" tab="权限管理" />
      <a-tab-pane key="3" tab="设备管理" />
    </a-tabs>

    <!-- 下方动态切换的组件区域 -->
    <div class="content-box">
      <component :is="currentComponent" />
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'

// 替换为你的组件
import yourvuename1 from './1.vue'
import yourvuename2 from './2.vue'
import yourvuename3 from './3.vue'
// 当前选中的 Tab
const activeTab = ref('1')

// 当前展示的组件
const currentComponent = ref(yourvuename1)

// Tab 切换处理逻辑
function handleTabChange (key) {
  if (key === '1') {
    currentComponent.value = yourvuename1
  } else if (key === '2') {
    currentComponent.value = yourvuename2
  } else if (key === '3') {
    currentComponent.value = yourvuename3
  }
}
</script>
<style scoped>
.container {
  height: 100%;
  width: 100%;
  height: 100%;
  padding: 0;
  background-color: white;
}

.tabs {
  margin-left: 10px;
  padding: 0;
}

.content-box {
  border: 0;
  padding: 0;
  margin: 0;
}
</style>
