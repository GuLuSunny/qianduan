<template>
  <div class="container">
    <div class="controls">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="权限名称">
          <el-input
            v-model="searchInfo.rightinfo"
            placeholder="请输入权限名称"
          />
        </el-form-item>
        <el-form-item label="权限标识符">
          <el-input
            v-model="searchInfo.rightEng"
            placeholder="请输入权限标识符"
          />
        </el-form-item>
        <el-form-item label="权限URL">
          <el-input v-model="searchInfo.rightApi" placeholder="请输入权限URL" />
        </el-form-item>
        <el-form-item>
          <el-button @click="findPurviewListByCondition" class="searchButton"
            ><el-icon> <Search /> </el-icon>搜索</el-button
          >
          <el-button @click="addPurviewButton" class="searchButton"
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
        prop="rightinfo"
        label="权限名称"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="rightEng"
        label="权限标识符"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="rightApi"
        label="权限URL"
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
    <!-- 权限修改信息框 -->
    <el-dialog
      v-model="purviewInfoDialogFormVisible"
      title="权限信息修改"
      width="500"
    >
      <el-form
        :model="purviewInfoForm"
        :label-position="right"
        label-width="100"
      >
        <el-form-item label="权限名称" prop="rightinfo">
          <el-input v-model="purviewInfoForm.rightinfo"  />
        </el-form-item>
        <el-form-item label="权限标识符" prop="rightEng">
          <el-input v-model="purviewInfoForm.rightEng"  />
        </el-form-item>
        <el-form-item label="权限URL" prop="rightApi">
          <el-input v-model="purviewInfoForm.rightApi" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="purviewInfoDialogFormVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="updatePurview()"> 提交 </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 权限新增信息框 -->
    <el-dialog
      v-model="purviewInfoAddDialogFormVisible"
      title="权限信息新增"
      width="500"
    >
      <el-form
        ref="ruleFormRef"
        :model="purviewInfoAddForm"
        :label-position="right"
        label-width="100"
        :rules="rules"
      >
        <el-form-item label="权限名称" prop="rightinfo">
          <el-input
            v-model="purviewInfoAddForm.rightinfo"
            placeholder="请输入权限名称"
          />
        </el-form-item>
        <el-form-item label="权限标识符" prop="rightEng">
          <el-input
            v-model="purviewInfoAddForm.rightEng"
            placeholder="请输入字母和下划线"
          />
        </el-form-item>
        <el-form-item label="权限URL" prop="rightApi">
          <el-input
            v-model="purviewInfoAddForm.rightApi"
            placeholder="请输入URL"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="purviewInfoAddDialogFormVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="addPurview(ruleFormRef)">
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
  getPurviewListPage,
  updatePurviewInfo,
  deletePurviewDataById,
  addPurviewInfo
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
  rightEng: '',
  rightinfo: '',
  rightApi: ''
})
const pageData = ref({
  // 分页数据
  currentPage: 1, // 当前页数
  pageSize: 10, // 每页显示条目个数
  total: 0 // 总条目数
})
const purviewInfoForm = ref({
  // 修改框信息
  id: '',
  rightinfo: '',
  rightEng: '',
  rightApi: ''
})

// 定义初始对象
const initialPurviewInfo = {
  id: '',
  rightinfo: '',
  rightEng: '',
  rightApi: ''
}

const purviewInfoAddForm = ref(JSON.parse(JSON.stringify(initialPurviewInfo))) // 新增框信息

const tableData = ref([]) // 表格数据
const purviewInfoDialogFormVisible = ref(false) // 修改权限信息弹出框
const purviewInfoAddDialogFormVisible = ref(false) // 权限信息新增弹出框
const purviewOptions = ref([]) // 权限列表
const ruleFormRef = ref() // 校验
onMounted(() => {
  findPurviewListByCondition()
})

// 分页查询
function findPurviewListByCondition () {
  const loadingInstance = ElLoading.service(loadingoptions)
  getPurviewListPage({
    rightEng: searchInfo.value.rightEng,
    rightinfo: searchInfo.value.rightinfo,
    rightApi: searchInfo.value.rightApi,
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
  purviewInfoForm.value = { ...row }
  purviewInfoDialogFormVisible.value = true
}

// 点击新增按钮
function addPurviewButton (row) {
  purviewInfoAddForm.value = JSON.parse(JSON.stringify(initialPurviewInfo))
  purviewInfoAddDialogFormVisible.value = true
}

// 单行删除
function confirmDeleteRow (row, index) {
  ElMessageBox.confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deletePurviewDataById({
        ids: [row.id]
      })
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            findPurviewListByCondition()
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

// 调用权限更新接口
function updatePurview () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 或者使用展开运算符（更现代且简洁的方式）
  const requestObject = { ...purviewInfoForm.value }
  updatePurviewInfo(requestObject)
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        ElMessage({
          showClose: true,
          message: '更新成功',
          center: true
        })
        purviewInfoDialogFormVisible.value = false
        findPurviewListByCondition()
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
  findPurviewListByCondition()
}
const handleCurrentChange = (number) => {
  // current-page 改变时触发
  pageData.value.currentPage = number
  findPurviewListByCondition()
}

// 规则校验
const rules = reactive({
  rightinfo: [{ required: true, message: '此项必填', trigger: 'blur' }],
  rightEng: [
    { required: true, message: '此项必填', trigger: 'blur' },
    { pattern: /^[A-Za-z_]+$/, message: '格式不正确', trigger: 'blur' }
  ]
})
// 提交
const addPurview = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      addPurviewinfo()
    }
  })
}
// 调用权限新增接口
function addPurviewinfo () {
  const loadingInstance = ElLoading.service(loadingoptions)
  // 或者使用展开运算符（更现代且简洁的方式）
  const requestObject = { ...purviewInfoAddForm.value }
  addPurviewInfo(requestObject)
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        ElMessage({
          showClose: true,
          message: '新增成功',
          center: true
        })
        purviewInfoAddDialogFormVisible.value = false
        findPurviewListByCondition()
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
