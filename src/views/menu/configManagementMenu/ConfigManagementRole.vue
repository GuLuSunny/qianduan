<template>
  <div class="container">
    <div class="controls">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="角色名称">
          <el-input
            v-model="searchInfo.roleinfo"
            placeholder="请输入角色名称"
          />
        </el-form-item>
        <el-form-item label="角色标识符">
          <el-input
            v-model="searchInfo.roleEng"
            placeholder="请输入角色标识符"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="findRoleListByCondition" class="searchButton"
            ><el-icon> <Search /> </el-icon>搜索</el-button
          >
          <el-button @click="addRoleButton" class="searchButton"
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
      @selection-change="handleSelectionChange"
    >
      <!-- <el-table-column type="index" width="0" align="center" prop="id" /> -->
      <el-table-column
        fixed
        prop="roleInfo"
        label="角色名称"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="roleEng"
        label="角色标识符"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="rightInfo"
        label="权限列表"
        width="auto"
        align="center"
        show-overflow-tooltip
      />
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
    <!-- 角色修改信息框 -->
    <el-dialog
      v-model="roleInfoDialogFormVisible"
      title="角色信息修改"
      width="500"
    >
      <el-form :model="roleInfoForm" :label-position="right" label-width="100">
        <el-form-item label="角色名称" prop="roleInfo">
          <el-input v-model="roleInfoForm.roleInfo"  />
        </el-form-item>
        <el-form-item label="角色标识符" prop="roleEng">
          <el-input v-model="roleInfoForm.roleEng"  />
        </el-form-item>
        <el-form-item label="权限" prop="rightId">
          <el-select
            v-model="roleInfoForm.rightId"
            placeholder="请选择权限"
            multiple
          >
            <el-option
              v-for="item in rightOptions"
              :key="item.id"
              :label="item.rightinfo"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleInfoDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateRole()"> 提交 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 角色新增信息框 -->
    <el-dialog
      v-model="roleInfoAddDialogFormVisible"
      title="角色信息新增"
      width="500"
    >
      <el-form
        ref="ruleFormRef"
        :model="roleInfoAddForm"
        :label-position="right"
        label-width="100"
        :rules="rules"
      >
        <el-form-item label="角色名称" prop="roleInfo">
          <el-input
            v-model="roleInfoAddForm.roleInfo"
            placeholder="请输入角色名称"
          />
        </el-form-item>
        <el-form-item label="角色标识符" prop="roleEng">
          <el-input
            v-model="roleInfoAddForm.roleEng"
            placeholder="请输入字母和下划线"
          />
        </el-form-item>
        <el-form-item label="权限" prop="rightId">
          <el-select
            v-model="roleInfoAddForm.rightId"
            placeholder="请选择权限"
            multiple
          >
            <el-option
              v-for="item in rightOptions"
              :key="item.id"
              :label="item.rightinfo"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleInfoAddDialogFormVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="addRole(ruleFormRef)">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, reactive } from 'vue'
import {
  getRoleRightListPage,
  getPurviewList,
  deleteRoleDataById,
  updateRoleInfo,
  addRoleInfo
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
  roleEng: '',
  roleinfo: ''
})
const pageData = ref({
  // 分页数据
  currentPage: 1, // 当前页数
  pageSize: 10, // 每页显示条目个数
  total: 0 // 总条目数
})
const roleInfoForm = ref({
  // 修改框信息
  roleId: '',
  roleInfo: '',
  roleEng: '',
  rightId: [],
  rightEng: '',
  rightInfo: '',
  rightApi: ''
})

// 定义初始对象
const initialRoleInfo = {
  roleId: '',
  roleInfo: '',
  roleEng: '',
  rightId: [],
  rightInfo: '',
  rightApi: '',
  rightEng: ''
}

const roleInfoAddForm = ref(JSON.parse(JSON.stringify(initialRoleInfo))) // 新增框信息

const tableData = ref([]) // 表格数据
const roleInfoDialogFormVisible = ref(false) // 修改角色信息弹出框
const roleInfoAddDialogFormVisible = ref(false) // 角色信息新增弹出框
const rightOptions = ref([]) // 权限列表
const ruleFormRef = ref() // 校验
onMounted(() => {
  findRoleListByCondition()
  findPurviewList()
})

// 分页查询
function findRoleListByCondition () {
  const loadingInstance = ElLoading.service(loadingoptions)
  getRoleRightListPage({
    roleEng: searchInfo.value.roleEng,
    roleinfo: searchInfo.value.roleinfo,
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
  roleInfoForm.value = { ...row }
  const t1 = row.rightId
  let idArray = [] // id数组
  if (t1 !== null && t1 !== undefined) {
    idArray = t1.split(',')
  }
  roleInfoForm.value.rightId = idArray.map(Number)
  roleInfoDialogFormVisible.value = true
}

// 点击新增按钮
function addRoleButton (row) {
  roleInfoAddForm.value = JSON.parse(JSON.stringify(initialRoleInfo))
  roleInfoAddDialogFormVisible.value = true
}
// 查询权限列表
function findPurviewList () {
  getPurviewList({})
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        // 成功获取
        rightOptions.value = result.body
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

// 单行删除
function confirmDeleteRow (row, index) {
  ElMessageBox.confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteRoleDataById({
        ids: [row.roleId]
      })
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            findRoleListByCondition()
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

// 调用角色更新接口
function updateRole () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 或者使用展开运算符（更现代且简洁的方式）
  const requestObject = { ...roleInfoForm.value }
  updateRoleInfo(requestObject)
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        ElMessage({
          showClose: true,
          message: '更新成功',
          center: true
        })
        roleInfoDialogFormVisible.value = false
        findRoleListByCondition()
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
const handleSizeChange = (number) => {
  // page-size 改变时触发
  pageData.value.pageSize = number
  findRoleListByCondition()
}
const handleCurrentChange = (number) => {
  // current-page 改变时触发
  pageData.value.currentPage = number
  findRoleListByCondition()
}

// 规则校验
const rules = reactive({
  roleInfo: [{ required: true, message: '此项必填', trigger: 'blur' }],
  roleEng: [
    { required: true, message: '此项必填', trigger: 'blur' },
    { pattern: /^[A-Za-z_]+$/, message: '格式不正确', trigger: 'blur' }
  ]
})
// 提交
const addRole = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      addRoleRightInfo()
    }
  })
}
// 调用信息新增接口
function addRoleRightInfo () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 或者使用展开运算符（更现代且简洁的方式）
  const requestObject = { ...roleInfoAddForm.value }
  addRoleInfo(requestObject)
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        ElMessage({
          showClose: true,
          message: '新增成功',
          center: true
        })
        roleInfoAddDialogFormVisible.value = false
        findRoleListByCondition()
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
