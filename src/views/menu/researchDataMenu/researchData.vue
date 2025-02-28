<template>
  <div class="container">
    <!-- 左上角选项框 -->
    <a-tabs
      class="tabs"
      v-model:activeKey="activeTab"
      @change="handleTabChange"
    >
      <a-tab-pane key="1" tab="卫星遥感影像"  v-if="$hasPermission('menu_subA_d_a')"/>
      <a-tab-pane key="2" tab="无人机影像"  v-if="$hasPermission('menu_subA_d_b')"/>
    </a-tabs>

    <!-- 下方动态切换的组件区域 -->
    <div class="content-box">
      <component :is="currentComponent" />
    </div>
  </div>
</template>
<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue'

// 引入你需要的组件
import DroneImageData from './DroneImageData.vue'
import SatelliteRemoteSensingImageData from './SatelliteRemoteSensingImageData.vue'

// 当前选中的 Tab
const activeTab = ref()

// 当前展示的组件
const currentComponent = ref()

const instance = getCurrentInstance()
const hasPermission = (permission) => {
  return instance?.appContext.config.globalProperties.$hasPermission(permission)
}
const tabs = [
  {
    key: '1',
    pressionKey: 'menu_subA_d_a',
    tab: '卫星遥感影像',
    currentComponent: SatelliteRemoteSensingImageData
  },
  {
    key: '2',
    pressionKey: 'menu_subA_d_b',
    tab: '无人机影像',
    currentComponent: DroneImageData
  }
]
function tabs_Pression () {
  for (const t of tabs) {
    if (hasPermission(t.pressionKey)) {
      activeTab.value = t.key
      currentComponent.value = t.currentComponent
      return
    }
  }
}


onMounted(() => {
  // 初始化
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      // 在 DOM 更新后执行
     tabs_Pression()
    })
  }
})

// Tab 切换处理逻辑
function handleTabChange (key) {
  if (key === '1') {
    currentComponent.value = SatelliteRemoteSensingImageData
  } else if (key === '2') {
    currentComponent.value = DroneImageData
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
