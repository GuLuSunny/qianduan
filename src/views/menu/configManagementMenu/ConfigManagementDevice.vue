<template>
  <div class="container">
    <div class="controls">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="设备名称">
          <el-input
            v-model="searchInfo.deviceName"
            placeholder="请输入设备名称"
          />
        </el-form-item>
        <el-form-item label="设备种类">
          <el-input v-model="searchInfo.type" placeholder="请输入设备种类" />
        </el-form-item>
        <el-form-item>
          <el-button @click="findListByCondition" class="searchButton"
            ><el-icon> <Search /> </el-icon>搜索</el-button
          >
          <el-button @click="addButton" class="searchButton"
            ><el-icon> <DocumentAdd /> </el-icon>新增</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      height="100%"
      :row-key="tableData.id"
      highlight-current-row
      class="el-table-class"
      show-overflow-tooltip
      @selection-change="handleSelectionChange"
    >
      <!-- <el-table-column type="index" width="0" align="center" prop="id" /> -->
      <el-table-column
        fixed
        prop="deviceName"
        label="设备名称"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="dmsLongitude"
        label="经度（度分秒）"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="dmsLatitude"
        label="纬度（度分秒）"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="ddLongitude"
        label="经度（度）"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="ddLatitude"
        label="纬度（度）"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="type"
        label="类型编号"
        width="auto"
        align="center"
      />
      <el-table-column prop="memo" label="备注" width="auto" align="center" />
      <el-table-column label="操作" width="auto" align="center" fixed="right">
        <template #default="scope">
          <el-button
            @click="handleModifyButton(scope.row)"
            class-name="center-button"
            >修改</el-button
          >
          <el-button
            @click="confirmDeleteRow(scope.row, scope.$index)"
            class-name="center-button"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageData.currentPage"
      :page-sizes="[10, 30, 50, 100]"
      :page-size="pageData.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageData.total"
      class="el-pagination-pages"
    >
    </el-pagination>
    <!-- 设备修改信息框 -->
    <el-dialog v-model="infoDialogFormVisible" title="设备信息修改" width="500">
      <el-form
        :model="infoForm"
        :label-position="right"
        label-width="150"
        :rules="rules"
        ref="ruleUpdateFormRef"
      >
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="infoForm.deviceName" />
        </el-form-item>
        <el-form-item label="设备经度（度分秒）" prop="dmsLongitude">
          <el-input v-model="infoForm.dmsLongitude" />
        </el-form-item>
        <el-form-item label="设备纬度（度分秒）" prop="dmsLatitude">
          <el-input v-model="infoForm.dmsLatitude" />
        </el-form-item>
        <el-form-item label="设备经度（度）" prop="ddLongitude">
          <el-input v-model="infoForm.ddLongitude" />
        </el-form-item>
        <el-form-item label="设备纬度（度）" prop="ddLatitude">
          <el-input v-model="infoForm.ddLatitude" />
        </el-form-item>
        <el-form-item label="设备类型编号" prop="type">
          <el-input v-model="infoForm.type" />
        </el-form-item>
        <el-form-item label="备注" prop="memo">
          <el-input v-model="infoForm.memo" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="infoDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="update(ruleUpdateFormRef)">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设备新增信息框 -->
    <el-dialog
      v-model="infoAddDialogFormVisible"
      title="设备信息新增"
      width="500"
    >
      <el-form
        ref="ruleFormRef"
        :model="infoAddForm"
        :label-position="right"
        label-width="150"
        :rules="rules"
      >
        <el-form-item label="设备名称" prop="deviceName">
          <el-input
            v-model="infoAddForm.deviceName"
            placeholder="请输入设备名称"
          />
        </el-form-item>
        <el-form-item label="设备经度（度分秒）" prop="dmsLongitude">
          <el-input
            v-model="infoAddForm.dmsLongitude"
            placeholder="请输入设备经度（度分秒）"
          />
        </el-form-item>
        <el-form-item label="设备纬度（度分秒）" prop="dmsLatitude">
          <el-input
            v-model="infoAddForm.dmsLatitude"
            placeholder="请输入设备纬度（度分秒）"
          />
        </el-form-item>
        <el-form-item label="设备经度（度）" prop="ddLongitude">
          <el-input
            v-model="infoAddForm.ddLongitude"
            placeholder="请输入设备经度（度）"
          />
        </el-form-item>
        <el-form-item label="设备纬度（度）" prop="ddLatitude">
          <el-input
            v-model="infoAddForm.ddLatitude"
            placeholder="请输入设备纬度（度）"
          />
        </el-form-item>
        <el-form-item label="设备类型编号" prop="type">
          <el-input
            v-model="infoAddForm.type"
            placeholder="请输入设备类型编号"
          />
        </el-form-item>
        <el-form-item label="备注" prop="memo">
          <el-input v-model="infoAddForm.memo" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="infoAddDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="add(ruleFormRef)"> 提交 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, reactive } from 'vue'
import {
  getDeviceListPage,
  updateDeviceInfo,
  deleteDeviceDataById,
  addDeviceInfo
} from '@/api/getData'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search, DocumentAdd } from '@element-plus/icons-vue'

const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

const searchInfo = ref({
  // 搜索框
  deviceName: '',
  dmsLongitude: '',
  dmsLatitude: '',
  ddLongitude: '',
  ddLatitude: '',
  type: '',
  memo: ''
})
const pageData = ref({
  // 分页数据
  currentPage: 1, // 当前页数
  pageSize: 10, // 每页显示条目个数
  total: 0 // 总条目数
})
const infoForm = ref({
  // 修改框信息
  id: '',
  deviceName: '',
  dmsLongitude: '',
  dmsLatitude: '',
  ddLongitude: '',
  ddLatitude: '',
  type: '',
  memo: ''
})

// 定义初始对象
const initialInfo = {
  id: '',
  deviceName: '',
  dmsLongitude: '',
  dmsLatitude: '',
  ddLongitude: '',
  ddLatitude: '',
  type: '',
  memo: ''
}

const infoAddForm = ref(JSON.parse(JSON.stringify(initialInfo))) // 新增框信息

const tableData = ref([]) // 表格数据
const infoDialogFormVisible = ref(false) // 修改权限信息弹出框
const infoAddDialogFormVisible = ref(false) // 权限信息新增弹出框
const selectOptions = ref([]) // 权限列表
const ruleFormRef = ref() // 校验新增
const ruleUpdateFormRef = ref() // 校验更新
onMounted(() => {
  findListByCondition()
})

// 分页查询
function findListByCondition () {
  const loadingInstance = ElLoading.service(loadingoptions)
  getDeviceListPage({
    deviceName: searchInfo.value.deviceName,
    type: searchInfo.value.type,
    currentPage: pageData.value.currentPage,
    pageSize: pageData.value.pageSize
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        if (result.body.length === 0) {
          ElMessage({
            showClose: true,
            message: '数据不存在',
            center: true
          })
        } else {
          // 成功获取
          tableData.value = result.body.records
          pageData.value.currentPage = result.body.current
          pageData.value.total = result.body.total
        }
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 点击修改按钮
function handleModifyButton (row) {
  infoForm.value = { ...row }
  infoDialogFormVisible.value = true
}

// 点击新增按钮
function addButton (row) {
  infoAddForm.value = JSON.parse(JSON.stringify(initialInfo))
  infoAddDialogFormVisible.value = true
}

// 单行删除
function confirmDeleteRow (row, index) {
  ElMessageBox.confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteDeviceDataById({
        ids: [row.id]
      })
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            findListByCondition()
            ElMessage({
              showClose: true,
              message: '删除成功',
              center: true,
              type: 'success'
            })
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
            message: '删除失败，请稍后再试',
            center: true,
            type: 'error'
          })
        })
    })
    .catch(() => {
      ElMessage({
        showClose: true,
        message: '已取消删除',
        center: true,
        type: 'info'
      })
    })
}

// // 调用更新接口
const update = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      const loadingInstance = ElLoading.service(loadingoptions)
      const requestObject = { ...infoForm.value }
      updateDeviceInfo(requestObject)
        .then((res) => {
          loadingInstance.close()
          const result = res.response.value
          if (result.code === 'SUCCESS') {
            ElMessage({
              showClose: true,
              message: '更新成功',
              center: true
            })
            infoDialogFormVisible.value = false
            findListByCondition()
          } else {
            ElMessage({
              showClose: true,
              message: result.msg,
              center: true
            })
          }
        })
        .catch((error) => {
          loadingInstance.close()
          ElMessage({
            showClose: true,
            message: '获取数据失败，请稍后再试',
            center: true,
            type: 'error'
          })
        })
    }
  })
}

const handleSizeChange = (number) => {
  // page-size 改变时触发
  pageData.value.pageSize = number
  findListByCondition()
}
const handleCurrentChange = (number) => {
  // current-page 改变时触发
  pageData.value.currentPage = number
  findListByCondition()
}

// 规则校验
const rules = reactive({
  ddLongitude: [{ required: true, message: '此项必填', trigger: 'blur' }],
  ddLatitude: [{ required: true, message: '此项必填', trigger: 'blur' }]
})
// 提交
const add = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      addinfo()
    }
  })
}
// 调用设备新增接口
function addinfo () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 或者使用展开运算符（更现代且简洁的方式）
  const requestObject = { ...infoAddForm.value }
  addDeviceInfo(requestObject)
  loadingInstance
    .close()
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        ElMessage({
          showClose: true,
          message: '新增成功',
          center: true
        })
        infoAddDialogFormVisible.value = false
        findListByCondition()
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '新增数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
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
.el-pagination-pages {
  justify-content: center; /* 水平居中 */
}
.el-table-class .el-table__body tr.current-row > td {
  background: #79bbff !important;
}
</style>
