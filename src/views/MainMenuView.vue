<template>
  <a-layout style="min-height: 100vh" class="layoutLoading">
    <!-- 侧边栏宽度不固定，允许折叠 -->
    <a-layout-sider 
      v-model:collapsed="collapsed" 
      collapsible
      :width="280"  
      :collapsedWidth="80" 
      breakpoint="lg" 
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
      style="position: fixed; height: 100vh; overflow: auto; left: 0; top: 0; z-index: 100;"
    >
      <div v-if="!collapsed" class="logo">地表水资源<br></br>综合信息遥感监测系统</div>
      <div v-else class="logo-collapsed">
        <span style="color: white; font-size: 18px">系统</span>
      </div>
      
      <a-menu 
        v-model:selectedKeys="selectedKeys" 
        theme="dark" 
        mode="inline" 
        :openKeys="openKeys"
        :inlineCollapsed="collapsed"
      >
        <template v-for="menu in menus" :key="menu.key">
          <a-sub-menu>
            <template #title>
              <span class="menu-title-wrapper">
                <component :is="menu.icon" class="menu-icon" />
                <span v-if="!collapsed" class="menu-text">{{ menu.title }}</span>
              </span>
            </template>
            <template v-for="item in menu.items" :key="item.key">
              <a-menu-item 
                :index="item.key" 
                @click="updateComponent(item.component, item.breadcrumb)"
                class="submenu-item"
              >
                <span class="submenu-text">{{ item.title }}</span>
              </a-menu-item>
            </template>
          </a-sub-menu>
        </template>
      </a-menu>
    </a-layout-sider>
    
    <a-layout :style="{ marginLeft: collapsed ? '80px' : '280px' }">
      <a-layout-header style="background: #fff; padding: 0">
        <span class="head">
          <Head></Head>
        </span>
      </a-layout-header>
      
      <a-layout-content style="margin: 0 16px">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item v-for="(breadcrumb, index) in breadcrumbs" :key="index">
            {{ breadcrumb }}
          </a-breadcrumb-item>
        </a-breadcrumb>
        <component :is="currentComponent" />
      </a-layout-content>
      
      <a-layout-footer style="text-align: center">
        河南大学 版权所有
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import Icon, {
  DashboardOutlined,
  FormOutlined,
  InsertRowAboveOutlined,
  BarsOutlined,
  MenuFoldOutlined
} from '@ant-design/icons-vue'

import SpectralQuery from './menu/dataQuerySpectralMenu/SpectralQuery.vue'
import Head from './menu/head.vue'
import AutoDetect from './menu/autoDetectMenu/AutoDetect.vue'
import WaterQueryPanel from './menu/waterLevelQueryMenu/WaterQueryPanel.vue'
import userManagementMenu from './menu/userManagementMenu/UserManagement.vue'
import dataUploadMenu from './menu/dataUplodMenu/DataUpload.vue'
import dataDownloadMenu from './menu/dataDownloadMenu/DataDownload.vue'
import LaboratoryAnalysis from './menu/laboratoryAnalysisDataMenu/LaboratoryAnalysisData.vue'
import researchData from './menu/researchDataMenu/researchData.vue'
import atmosphereQuery from './menu/atmosphere/AtmosphereQuery.vue'
import WetlandMonitoringQuery from './menu/wetlandMonitoring/wetlandMonitoringQuery.vue'
import Manua from './menu/ManualobservationdataMenu/Manua.vue'
import Birdsdata from './menu/DataBirds/Birdsdata.vue'
import PhysicochemicalPanel from './menu/PhysicochemicalData/PhysicochemicalPanel.vue'
import RunoffQuery from './menu/runoff/RunoffQuery.vue'
import configManagement from './menu/configManagementMenu/ConfigManagement.vue'
import RemoteSensingQuery from './menu/remoteSensingMenu/RemoteSensingQuery.vue'
import GeographicIdentificationUpload from './menu/geographicIdentificationMenu/GeographicIdentificationUpload.vue'
import LandIdentification from './menu/geographicIdentificationMenu/LandIdentification.vue'
import ShpFileUpload from './menu/geographicIdentificationMenu/ShpFileUpload.vue'
import WaterIdentification from './menu/geographicIdentificationMenu/WaterIdentification.vue'
import PlantCoverIdentification from './menu/geographicIdentificationMenu/PlantCoverIdentification.vue'
import ProductsData from './menu/ModelProductsMenu/ProductsData.vue'
import WaterChange from './menu/changeAnalysisMenu/WaterChange.vue'
import LandChange from './menu/changeAnalysisMenu/LandChange.vue'
import PlangtChange from './menu/changeAnalysisMenu/PlangtChange.vue'
import { title } from 'process'


// 权限过滤后菜单配置数组
const menus = ref([])
// 权限过滤前菜单配置数组
const menus_pre = [
  {
    key: 'sub1',
    pressionKey: 'menu_subE',
    title: '地表水资源遥感产品生产',
    icon: MenuFoldOutlined,
    items: [
      // {
      //   key:'17',
      //   title: '文件上传',
      //   component: GeographicIdentificationUpload,
      //   breadcrumb: ['水生态要素提取','文件提交'] ,
      //   pressionKey: 'menu_subE_a'
      // },
      {
        key: '19',
        title: '水资源分布产品生产',
        component: WaterIdentification,
        breadcrumb: ['水生态要素提取', '水资源分布产品生产'],
        pressionKey: 'menu_subE_c'
      },
      {
        key: '23',
        title: '水资源变化产品生产',
        component: WaterChange,
        breadcrumb: ['水生态要素提取', '水资源变化产品生产'],
        pressionKey: 'menu_subE_c'
      }
    ]
  },
  {
    key: 'sub6',
    pressionKey: 'menu_subF',
    title: '地表水环境遥感产品生产',
    icon: MenuFoldOutlined,
    items: [
      {
        key: '18',
        title: '水生态格局分布产品生产',
        component: LandIdentification,
        breadcrumb: ['地表水环境遥感产品生产', '水生态格局分布产品生产'],
        pressionKey: 'menu_subE_b'
      },
      {
        key: '24',
        title: '水生态格局演变产品生产',
        component: LandChange,
        breadcrumb: ['地表水环境遥感产品生产', '水生态格局演变产品生产'],
        pressionKey: 'menu_subE_b'
      }
    ]
  },
  {
    key: 'sub7',
    pressionKey: 'menu_subF',
    title: '地表水生态遥感产品生产',
    icon: MenuFoldOutlined,
    items: [
      {
        key: '20',
        title: '植被覆盖度产品生产',
        component: PlantCoverIdentification,
        breadcrumb: ['地表水生态遥感产品生产', '植被覆盖度产品生产'],
        pressionKey: 'menu_subE_d'
      },
      {
        key: '25',
        title: '区域水生态状况产品生产',
        component: PlangtChange,
        breadcrumb: ['地表水生态遥感产品生产', '区域水生态状况产品生产'],
        pressionKey: 'menu_subE_d'
      }
    ]
  },
  {
    key: 'sub8',
    pressionKey: 'menu_subF',
    title: '遥感产品查询',
    icon: MenuFoldOutlined,
    items: [
      {
        key: '22',
        title: '产品获取',
        component: ProductsData,
        breadcrumb: ['水生态要素提取', '生态产品获取'],
        pressionKey: 'menu_subE_e'
      }
    ]
  },
  {
    key: 'sub2',
    pressionKey: 'menu_subB',
    title: '地表水文数据查询',
    icon: FormOutlined,
    items: [
      // {
      //   key: '5',
      //   title: '气象',
      //   component: atmosphereQuery,
      //   breadcrumb: ['数据查询', '气象'],
      //   pressionKey: 'menu_subB_a'
      // },
      // {
      //   key: '6',
      //   title: '水鸟',
      //   component: Birdsdata,
      //   breadcrumb: ['数据查询', '水鸟'],
      //   pressionKey: 'menu_subB_b'
      // },
      {
        key: '7',
        title: '水质',
        component: PhysicochemicalPanel,
        breadcrumb: ['地表水文数据查询', '水质'],
        pressionKey: 'menu_subB_c'
      },
      {
        key: '8',
        title: '光谱',
        component: SpectralQuery,
        breadcrumb: ['地表水文数据查询', '光谱'],
        pressionKey: 'menu_subB_d'
      },
      {
        key: '9',
        title: '水位',
        component: WaterQueryPanel,
        breadcrumb: ['地表水文数据查询', '水位'],
        pressionKey: 'menu_subB_e'
      },
      {
        key: '10',
        title: '径流',
        component: RunoffQuery,
        breadcrumb: ['地表水文数据查询', '径流'],
        pressionKey: 'menu_subB_f'
      },
      {
        key: '11',
        title: '土壤',
        component: WetlandMonitoringQuery,
        breadcrumb: ['地表水文数据查询', '土壤'],
        pressionKey: 'menu_subB_g'
      }
      // {
      //   key: '16',
      //   title: '遥感',
      //   component: RemoteSensingQuery,
      //   breadcrumb: ['数据查询', '遥感'],
      //   pressionKey: 'menu_subB_h'
      // }
    ]
  },
  // {
  //   key: 'sub3',
  //   pressionKey: 'menu_subC',
  //   title: '数据共享',
  //   icon: InsertRowAboveOutlined,
  //   items: [
  //     {
  //       key: '12',
  //       title: '数据管理',
  //       component: dataUploadMenu,
  //       breadcrumb: ['数据共享', '数据管理'],
  //       pressionKey: 'menu_subC_a'
  //     },
  //     {
  //       key: "13",
  //       title: "数据申请",
  //       component: dataDownloadMenu,
  //       breadcrumb: ["数据共享", "数据申请"],
  //     }, 
  //   ]
  // },
  
  {
    key: 'sub5',
    pressionKey: 'menu_subA',
    title: '地表水文数据上传',
    icon: DashboardOutlined,
    items: [
      {
        key: '1',
        title: '径流与水位',
        component: AutoDetect,
        breadcrumb: ['地表水文数据上传', '径流与水位'],
        pressionKey: 'menu_subA_a'
      },
      {
        key: '2',
        title: '土壤',
        component: Manua,
        breadcrumb: ['地表水文数据上传', '土壤'],
        pressionKey: 'menu_subA_b'
      },
      {
        key: '3',
        title: '光谱与水质',
        component: LaboratoryAnalysis,
        breadcrumb: ['地表水文数据上传', '光谱与水质'],
        pressionKey: 'menu_subA_c'
      }
      // ,
      // {
      //   key: '4',
      //   title: '研究数据',
      //   component: researchData,
      //   breadcrumb: ['地表水文数据上传', '研究数据'],
      //   pressionKey: 'menu_subA_d'
      // }
    ]
  },
  {
    key: 'sub4',
    pressionKey: 'menu_subD',
    title: '系统管理',
    icon: BarsOutlined,
    items: [
      {
        key: '14',
        title: '用户管理',
        component: userManagementMenu,
        breadcrumb: ['系统管理', '用户管理'],
        pressionKey: 'menu_subD_a'
      },
      {
        key: '15',
        title: '配置管理',
        component: configManagement,
        breadcrumb: ['系统管理', '配置管理'],
        pressionKey: 'menu_subD_b'
      },
      {
        key: '21',
        title: 'SHP文件上传',
        component: ShpFileUpload,
        breadcrumb: ['系统管理', 'SHP文件上传'],
        pressionKey: 'menu_subF_a'
      }
    ]
  }
]

const instance = getCurrentInstance()
const hasPermission = (permission) => {
  return instance?.appContext.config.globalProperties.$hasPermission(permission)
}

// 状态管理
const collapsed = ref(false)
const selectedKeys = ref(['1']) // 选中编号
const breadcrumbs = ref(['数据获取', '径流与水位'])
const currentComponent = ref(AutoDetect)
const openKeys = ref([''])

// 折叠状态变化时的处理
const onCollapse = (val) => {
  collapsed.value = val
  // 折叠时清空openKeys，避免样式问题
  if (val) {
    openKeys.value = []
  }
}

// 响应式断点处理
const onBreakpoint = (broken) => {
  console.log('断点变化:', broken)
}

onMounted(() => {
  // 权限过滤
  menu_Pression()
  if (menus.value.length > 0) {
    // 默认选择第一个菜单项的第一个子项
    const firstMenu = menus.value[0]
    if (firstMenu.items.length > 0) {
      const firstItem = firstMenu.items[0]
      selectedKeys.value = [firstItem.key]
      openKeys.value = [firstMenu.key]
      updateComponent(firstItem.component, firstItem.breadcrumb)
    }
  }
})

function menu_Pression() {
  menus.value = []
  for (const menuItem of menus_pre) {
    const menuItemPressionKey = menuItem.pressionKey
    if (!hasPermission(menuItemPressionKey)) {
      continue
    }
    // 创建菜单项并过滤子项
    const menuItemList = {
      key: menuItem.key,
      pressionKey: menuItem.pressionKey,
      title: menuItem.title,
      icon: menuItem.icon,
      items: menuItem.items.filter(item =>
        hasPermission(item.pressionKey)
      )
    }

    if (menuItemList.items.length > 0) {
      menus.value.push(menuItemList)
    }
  }
}

// 更新面包屑和当前组件
function updateComponent(component, newBreadcrumbs) {
  currentComponent.value = component
  breadcrumbs.value = newBreadcrumbs
}

// 根据key查询组件信息
function getMenuItemByKey(key) {
  // 遍历 menus 数组
  for (const menu of menus.value) {
    // 遍历当前菜单项的 items 数组
    for (const item of menu.items) {
      // 如果找到匹配的 key
      if (item.key === key) {
        // 返回该项的 component 和 breadcrumb
        return {
          component: item.component,
          breadcrumb: [menu.title, item.title]
        }
      }
    }
  }
  // 如果没有找到匹配的项，返回一个默认值或 null
  return null
}
</script>


<style scoped>
/* 移除之前的固定宽度设置，让侧边栏可折叠 */

/* 折叠状态下的logo样式 */
.logo-collapsed {
  height: 32px;
  margin: 18px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 15px;
  overflow-wrap: break-word;
}

.logo {
  height: 32px;
  margin: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 15px;
  overflow-wrap: break-word;
}

/* 菜单标题包装器 - 实现垂直居中 */
.menu-title-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* 菜单图标样式 - 保持在左侧 */
.menu-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 图标保持在左侧 */
  margin-left: 24px; /* 添加左边距，使图标不要太靠左 */
  margin-right: 12px; /* 添加右边距，与文字分开 */
  flex-shrink: 0; /* 防止图标被压缩 */
}

/* 二级菜单文字样式 - 居中效果 */
.menu-text {
  display: flex;
  align-items: center;
  justify-content: center; /* 文字居中 */
  font-size: 14px;
  width: 100%;
  text-align: center;
  padding: 0 8px;
  flex: 1; /* 占据剩余空间 */
  margin-right: 32px;
}

/* 三级导航栏样式 - 确保文字水平和垂直都居中 */
:deep(.ant-menu-item) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  height: 44px !important;
  padding: 0 !important;
  margin: 8px 0 !important;
  border-radius: 4px;
}

/* 三级菜单文字样式 */
.submenu-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 13px;
  text-align: center;
  padding: 0 8px;
  margin-left: 8px;
  
}

/* 修改二级菜单标题样式 - 保持图标在左侧，文字居中 */
:deep(.ant-menu-submenu-title) {
  display: flex !important;
  align-items: center !important;
  height: 48px !important;
  padding: 0 0px !important;
  line-height: normal !important;
  border-radius: 4px !important;
  margin: 4px 0 !important;
}

/* 二级菜单标题内部的容器 */
:deep(.ant-menu-submenu-title > span) {
  display: flex !important;
  align-items: center !important;
  width: 100%;
}


/* 菜单项悬停效果 */
:deep(.ant-menu-item:hover),
:deep(.ant-menu-submenu-title:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* 选中菜单项样式 */
:deep(.ant-menu-item-selected) {
  background-color: #1890ff !important; /* 选中时背景色 */
}

/* 折叠状态下菜单项的调整 */
:deep(.ant-menu-inline-collapsed .ant-menu-item) {
  padding: 0 !important;
  margin: 4px 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ant-menu-inline-collapsed .ant-menu-submenu-title) {
  padding: 0 !important;
  margin: 4px 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 折叠状态下图标的调整 */
:deep(.ant-menu-inline-collapsed .anticon) {
  margin-right: 0 !important;
  font-size: 16px;
}

.head {
  font-size: 1.5em;
}

.site-layout .site-layout-background {
  background: #fff;
}

/* 响应式调整 */
@media (max-width: 992px) {
  :deep(.ant-layout-sider) {
    position: absolute !important;
    height: 100vh;
    z-index: 100;
  }
  
  :deep(.ant-layout-sider-collapsed) {
    position: absolute !important;
    height: 100vh;
    z-index: 100;
  }
}
</style>