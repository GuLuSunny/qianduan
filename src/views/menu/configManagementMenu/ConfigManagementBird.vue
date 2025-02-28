<template>
  <div class="container">
    <!-- <div class="controls"> -->
    <el-input
      v-model="filterText"
      style="width: 240px"
      placeholder="请输入名称"
    />

    <el-button @click="cancelBird" class="cancelBird"> 重置 </el-button>
    <el-button @click="subBird" class="subBird"> 提交 </el-button>
    <el-tree
      v-if="showTree"
      class="elTree"
      :data="dataSource"
      node-key="id"
      :props="defaultProps"
      highlight-current
      :default-expanded-keys="defaultExpandedKeys"
      :expand-on-click-node="false"
      @node-click="nodeClick"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node" v-if="data.leafBool == '0'">
          <span>{{ node.label }}</span>
          <span>
            <el-icon @click="append(node, data)"><CirclePlusFilled /></el-icon>
            <!-- <el-icon style="margin-left: 8px" @click="remove(node, data)"
              ><DeleteFilled
            /></el-icon> -->
          </span>
        </span>
      </template>
    </el-tree>
  </div>
  <el-dialog title="请填写信息" v-model="exportDialogVisible">
    <el-form
      ref="ruleFormRef"
      :inline="true"
      :model="birdInfo"
      class="demo-form"
      :rules="rules"
    >
      <el-form-item label="名称" prop="label">
        <el-input v-model="birdInfo.label" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="拉丁文" prop="nameLatin">
        <el-input v-model="birdInfo.nameLatin" placeholder="请输入拉丁文" />
      </el-form-item>
    </el-form>
    <el-button @click="exportDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="addNode(ruleFormRef)"> 确定 </el-button>
  </el-dialog>
  <!-- </div> -->
</template>

<script setup>
import { ref, onMounted, watch, computed, reactive, nextTick } from 'vue'
import { getBirdMKZ, addBirdData } from '@/api/getData'
import { ElMessage, ElMessageBox, ElTree, ElLoading } from 'element-plus'
import { CirclePlusFilled, DeleteFilled } from '@element-plus/icons-vue'
const filterText = ref('')
const exportDialogVisible = ref(false)
let dataSourceList = '' // 初始信息
const ruleFormRef = ref() // 校验
const defaultExpandedKeys = ref(['0'])
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
const birdInfo = ref({
  // 搜索框
  label: '',
  nameLatin: '',
  node: '',
  data: ''
}) // 信息
const showTree = ref(true) // 控制树组件是否显示的布尔值
const dataSource = ref([]) // 数据
const defaultProps = {
  children: 'children',
  label: 'label',
  leafBool: ''
}
onMounted(() => {
  getBirdMKZFunc()
})
// 监听的变化-过滤
watch(filterText, (newValue, oldValue) => {
  defaultExpandedKeys.value = ['0']
  if (newValue === '') {
    defaultExpandedKeys.value = ['0']
  } else {
    /// / 遍历数据中的每个顶级节点
    dataSource.value.forEach((topLevelNode) => {
      traverseTree(topLevelNode, newValue)
    })
  }
  resetTree()
})

// 遍利节点
function traverseTree (node, value) {
  const nodeLabel = node.label
  if (nodeLabel.includes(value)) {
    defaultExpandedKeys.value.push(node.id)
  }
  // 如果存在子节点，则递归遍历子节点
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      traverseTree(child, value)
    })
  }
}

// 重置按钮
function cancelBird () {
  defaultExpandedKeys.value = ['0']
  dataSource.value = dataSourceList.datas
  resetTree()
}

// 重置树组件的方法
const resetTree = () => {
  showTree.value = false // 隐藏树组件
  // defaultExpandedKeys.value = [] // 清空所有展开的键
  // 在下一个DOM更新周期后重新显示树组件
  nextTick(() => {
    showTree.value = true
  })
}
// 点击新增图标
const append = (node, data) => {
  exportDialogVisible.value = true
  birdInfo.value.node = node
  birdInfo.value.data = data
}

// 点击提交按钮
function subBird () {
  addBirdData({
    birdInfo: dataSource.value
  })
    .then((res) => {
      if (res.response.value.code === 'SUCCESS') {
        ElMessage({
          showClose: true,
          message: '保存成功',
          center: true,
          type: 'success'
        })
        getBirdMKZFunc()
      } else {
        ElMessage({
          showClose: true,
          message: res.response.value.msg,
          center: true,
          type: 'error'
        })
      }
    })
    .catch((error) => {
      ElMessage({
        showClose: true,
        message: '保存失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 规则校验
const rules = reactive({
  label: [{ required: true, message: '此项必填', trigger: 'blur' }]
})
const addNode = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      addDataNode()
    }
  })
}
let idlable = 100
// 弹出框的确定
function addDataNode () {
  exportDialogVisible.value = false
  const data = birdInfo.value.data
  const node = birdInfo.value.node
  const dataIdLength = data.id
    .trim()
    .replace('root-', '')
    .replace('0-', '')
    .split('-').length
  let leafB = '1'
  if (dataIdLength < 2) {
    leafB = '0'
  }
  // console.log(data)
  // console.log(node)
  idlable = idlable + 1
  const newChild = {
    id: 'root-' + data.id + '-' + String(idlable),
    label: birdInfo.value.label + ' ' + birdInfo.value.nameLatin,
    nameLatin: birdInfo.value.nameLatin,
    leafBool: leafB,
    children: []
  }
  if (!data.children) {
    data.children = []
  }
  data.children.push(newChild)
  dataSource.value = [...dataSource.value]
  defaultExpandedKeys.value = [data.id]
}

// 获取鸟类科目种
function getBirdMKZFunc () {
 const loadingInstance =ElLoading.service(loadingoptions)
  getBirdMKZ({})
    .then((res) => {
      loadingInstance.close()
      const response = res.response.value
      if (response.code === 'SUCCESS') {
        const body = response.body
        dataSource.value = body.datas
        dataSourceList = JSON.parse(JSON.stringify(body))
      } else {
        ElMessage.error('获取鸟类数据失败: ' + response.msg)
      }
    })
    .catch((error) => {
      loadingInstance.close()
      console.error('请求失败:', error)
      ElMessage.error('请求失败: ' + error.message)
    })
}
</script>

<style>
.controls {
  margin-bottom: 10px;
  display: flex;
  width: 100%;
  height: 50px;
}
.elTree {
  max-width: 400px; /* 假设你想让元素占据 50% 的宽度 */
  margin: 0 auto; /* 水平居中 */
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.demo-form {
  padding-left: 150px;
  flex: 1;
  display: flex;
  align-items: center;
}
</style>
