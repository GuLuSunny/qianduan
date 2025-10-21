<template>
  <a-layout style="min-height: 100vh" class="layoutLoading">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div v-if="!collapsed" class="logo">多源数据综汇系统</div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        :openKeys="openKeys"
      >
        <template v-for="menu in menus" :key="menu.key">
          <a-sub-menu>
            <template #title>
              <span>
                <component :is="menu.icon" />
                <span v-if="!collapsed">{{ menu.title }}</span>
              </span>
            </template>
            <template v-for="item in menu.items" :key="item.key">
              <a-menu-item
                :index="item.key"
                @click="updateComponent(item.component, item.breadcrumb)"
              >
                {{ item.title }}
              </a-menu-item>
            </template>
          </a-sub-menu>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <span class="head">
          <Head></Head>
        </span>
      </a-layout-header>
      <a-layout-content style="margin: 0 16px">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item
            v-for="(breadcrumb, index) in breadcrumbs"
            :key="index"
          >
            {{ breadcrumb }}
          </a-breadcrumb-item>
        </a-breadcrumb>
        <component :is="currentComponent" />
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        河南省科学院地理研究所 河南大学 版权所有 Copyright©2024
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
import { title } from 'process'

// 权限过滤后菜单配置数组
const menus = ref([])
// 权限过滤前菜单配置数组
const menus_pre = [  
  {
    key: 'sub1',
    pressionKey: 'menu_subE',
    title: '水生态要素提取',
    icon: MenuFoldOutlined,
    items:[
      {
        key:'17',
        title: '文件上传',
        component: GeographicIdentificationUpload,
        breadcrumb: ['水生态要素提取','文件提交'] ,
        pressionKey: 'menu_subE_a'
      },
      {
        key:'18',
        title: '土地分类',
        component: LandIdentification,
        breadcrumb: ['水生态要素提取','土地分类'] ,
        pressionKey: 'menu_subE_b'
      },
      {
        key:'19',
        title: '水域地域',
        component: WaterIdentification,
        breadcrumb: ['水生态要素提取','水域地域'] ,
        pressionKey: 'menu_subE_c'
      },
      {
        key:'20',
        title: '植被覆盖',
        component: PlantCoverIdentification,
        breadcrumb: ['水生态要素提取','植被覆盖'] ,
        pressionKey: 'menu_subE_d'
      }
    ]
  },
  
  {
    key: 'sub2',
    pressionKey: 'menu_subB',
    title: '数据查询',
    icon: FormOutlined,
    items: [
      {
        key: '5',
        title: '气象',
        component: atmosphereQuery,
        breadcrumb: ['数据查询', '气象'],
        pressionKey: 'menu_subB_a'
      },
      // {
      //   key: '6',
      //   title: '水鸟',
      //   component: Birdsdata,
      //   breadcrumb: ['数据查询', '水鸟'],
      //   pressionKey: 'menu_subB_b'
      // },
      {
        key: '7',
        title: '理化',
        component: PhysicochemicalPanel,
        breadcrumb: ['数据查询', '理化'],
        pressionKey: 'menu_subB_c'
      },
      {
        key: '8',
        title: '光谱',
        component: SpectralQuery,
        breadcrumb: ['数据查询', '光谱'],
        pressionKey: 'menu_subB_d'
      },
      {
        key: '9',
        title: '水位',
        component: WaterQueryPanel,
        breadcrumb: ['数据查询', '水位'],
        pressionKey: 'menu_subB_e'
      },
      {
        key: '10',
        title: '径流',
        component: RunoffQuery,
        breadcrumb: ['数据查询', '径流'],
        pressionKey: 'menu_subB_f'
      },
      // {
      //   key: '11',
      //   title: '湿地',
      //   component: WetlandMonitoringQuery,
      //   breadcrumb: ['数据查询', '湿地'],
      //   pressionKey: 'menu_subB_g'
      // },
      {
        key: '16',
        title: '遥感',
        component: RemoteSensingQuery,
        breadcrumb: ['数据查询', '遥感'],
        pressionKey: 'menu_subB_h'
      }
    ]
  },
  {
    key: 'sub3',
    pressionKey: 'menu_subC',
    title: '数据共享',
    icon: InsertRowAboveOutlined,
    items: [
      {
        key: '12',
        title: '数据管理',
        component: dataUploadMenu,
        breadcrumb: ['数据共享', '数据管理'],
        pressionKey: 'menu_subC_a'
      }
      /* {
        key: "13",
        title: "数据申请",
        component: dataDownloadMenu,
        breadcrumb: ["数据共享", "数据申请"],
      }, */
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
      }
    ]
  },
{
    key: 'sub5',
    pressionKey: 'menu_subA',
    title: '数据获取',
    icon: DashboardOutlined,
    items: [
      {
        key: '1',
        title: '自动观测数据',
        component: AutoDetect,
        breadcrumb: ['数据获取', '自动观测数据'],
        pressionKey: 'menu_subA_a'
      },
      {
        key: '2',
        title: '人工观测数据',
        component: Manua,
        breadcrumb: ['数据获取', '人工观测数据'],
        pressionKey: 'menu_subA_b'
      },
      {
        key: '3',
        title: '实验室分析数据',
        component: LaboratoryAnalysis,
        breadcrumb: ['数据获取', '实验室分析数据'],
        pressionKey: 'menu_subA_c'
      },
      {
        key: '4',
        title: '研究数据',
        component: researchData,
        breadcrumb: ['数据获取', '研究数据'],
        pressionKey: 'menu_subA_d'
      }
    ]
  },
  {
    key: 'sub6',
    pressionKey: 'menu_subF',
    title: 'SHP文件提交',
    icon: MenuFoldOutlined,
    items: [
      {
        key: '21',
        title: 'SHP文件上传',
        component: ShpFileUpload,
        breadcrumb: ['SHP文件提交', '文件上传'],
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
const breadcrumbs = ref(['数据获取', '自动观测数据'])
const currentComponent = ref(AutoDetect)
const openKeys = ref([''])
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

function menu_Pression () {
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
function updateComponent (component, newBreadcrumbs) {
  currentComponent.value = component
  breadcrumbs.value = newBreadcrumbs
}

// 根据key查询组件信息
function getMenuItemByKey (key) {
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
.logo {
  height: 32px;
  margin: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 15px;
}

.head {
  font-size: 1.5em;
}

.site-layout .site-layout-background {
  background: #fff;
}
</style>
