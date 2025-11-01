<template>
  <div class="container">
    <div class="controls">
      <el-form :model="searchInfo">
        <div class="row">
          <el-form-item label="所有者">
            <el-input
              v-model="searchInfo.owner"
              placeholder="请输入所有者"
              @input="handleInputChange"
              clearable
            />
          </el-form-item>
          <el-form-item label="文件名称">
            <el-input
              v-model="searchInfo.filename"
              placeholder="请输入文件名称"
              @input="handleInputChange"
              clearable
            />
          </el-form-item>
          <el-form-item label="产品分类">
            <el-select
              v-model="searchInfo.selectedClass"
              placeholder="请选择"
              @change="handleInputChange"
              clearable
            >
              <el-option
                v-for="classItem in classOptions"
                :key="classItem.value"
                :value="classItem.value"
                :label="classItem.label"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="文件类型">
            <el-select
              v-model="searchInfo.selectedType"
              placeholder="请选择"
              @change="handleInputChange"
              clearable
            >
              <el-option
                v-for="fileType in fileTypeOptions"
                :key="fileType.value"
                :value="fileType.value"
                :label="fileType.label"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="row">
          <el-form-item label="观测日期">
            <el-date-picker
              v-model="searchInfo.observationDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleInputChange"
              placeholder="选择观测日期"
              :disabled-date="disabledDate"
              clearable
            />
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="searchInfo.startDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleInputChange"
              placeholder="选择开始日期"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="searchInfo.endDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleInputChange"
              placeholder="选择结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="searchProducts" class="searchButton">
              <el-icon> <Search /> </el-icon>搜索
            </el-button>
            <el-button
              @click="deleteSelectedRows"
              :disabled="!selectedRows.length"
              >批量删除</el-button
            >
            <el-button @click="showExportDialog">导出数据</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 表格区域增加顶部间距，避免遮盖表单 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        stripe
        style="width: 100%"
        show-overflow-tooltip
        max-height="600px"
        @selection-change="handleSelectionChange"
        v-loading="loading"
        class="custom-table"
      >
        <el-table-column type="selection" width="auto" ></el-table-column>
        <el-table-column prop="owner" label="所有者" width="auto"  />
        <el-table-column prop="filename" label="文件名称" width="auto" show-overflow-tooltip   />
        <el-table-column prop="className" label="产品分类" width="auto"  />
        <el-table-column prop="type" label="文件类型" width="auto"  />
        <el-table-column prop="observationTime" label="观测时间" width="auto"  />
        <el-table-column prop="startTime" label="开始时间" width="auto"  />
        <el-table-column prop="endTime" label="结束时间" width="auto" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <el-button @click="downloadFile(scope.row)" type="primary" size="small"
              >下载</el-button
            >
            <el-button @click="confirmDeleteRow(scope.row)" size="small"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="demo-pagination-block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 15, 30, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
        />
      </div>
    </div>
    
    <!-- 导出对话框 -->
    <el-dialog title="请选择您要导出哪天的数据" v-model="exportDialogVisible" width="400px">
      <el-date-picker
        v-model="exportDate"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :disabled-date="disabledDate"
        style="width: 100%"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="exportData">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import {
  getProductPageData,
  deleteProductsByConditions,
  getFilesByConditions,
  getModelClassName,
  getTimesByType
} from '@/api/getData'

// 修复：正确的选项格式
const classOptions = computed(() => [
  { label: '所有', value: '' },
  ...classNames.value.map(item => ({ label: item, value: item }))
])

const fileTypeOptions = [
  { label: '所有', value: '' },
  { label: 'png', value: 'png' },
  { label: 'jpg', value: 'jpg' },
  { label: 'pdf', value: 'pdf' },
  { label: 'doc', value: 'doc' },
  { label: 'xls', value: 'xls' },
  { label: 'zip', value: 'zip' }
]

const loadingOptions = {
  lock: true,
  text: '数据加载中...',
  background: 'rgba(0, 0, 0, 0.7)'
}

const searchInfo = ref({
  owner: '',
  filename: '',
  selectedClass: '',
  selectedType: '',
  observationDate: '',
  startDate: '',
  endDate: ''
})

const classNames = ref([])
const showDateArr = ref([])

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const selectedRows = ref([])
const exportDialogVisible = ref(false)
const exportDate = ref('')

onMounted(() => {
  fetchClassNames()
  fetchAvailableDates()
})

// 可用日期
function disabledDate(time) {
  if (!showDateArr.value || showDateArr.value.length === 0) {
    return false
  }
  const dateString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`
  return !showDateArr.value.includes(dateString)
}

// 请求日期
function fetchAvailableDates() {
  getTimesByType({
    type: 'modelproducts',
    searchTimeType: 'day'
  })
    .then((res) => {
      const result = res.response?.value || res
      if (result.code === 'SUCCESS') {
        showDateArr.value = result.body?.date || []
      } else {
        ElMessage({
          message: result.msg || '获取日期数据失败',
          type: 'warning'
        })
      }
    })
    .catch((error) => {
      console.error('获取日期数据失败:', error)
      ElMessage.error('获取日期数据失败，请稍后再试')
    })
}

function handleInputChange() {
  // 移除可能导致循环更新的逻辑
}

function fetchClassNames() {
  getModelClassName()
    .then((res) => {
      const response = res.response?.value || res
      if (response.code === 'SUCCESS') {
        classNames.value = response.body || []
        searchProducts()
      } else {
        ElMessage.warning(response.msg || '获取分类数据失败')
      }
    })
    .catch((error) => {
      console.error('获取分类数据失败:', error)
      ElMessage.error('获取分类数据失败，请稍后再试')
    })
}

// 修复：避免循环调用的搜索函数
function searchProducts() {
  currentPage.value = 1
  getProductDataPage()
}

function getProductDataPage() {
  const params = {
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    owner: searchInfo.value.owner,
    filename: searchInfo.value.filename,
    className: searchInfo.value.selectedClass || null,
    type: searchInfo.value.selectedType || null,
    observationTime: searchInfo.value.observationDate,
    startTime: searchInfo.value.startDate,
    endTime: searchInfo.value.endDate
  }
  
  loading.value = true
  getProductPageData(params)
    .then((res) => {
      const result = res.response?.value || res
      if (result.code === 'SUCCESS') {
        tableData.value = result.body?.records || []
        currentPage.value = result.body?.current || 1
        totalItems.value = result.body?.total || 0
        pageSize.value = result.body?.size || 10
      } else {
        ElMessage.warning(result.msg || '获取数据失败')
      }
    })
    .catch((error) => {
      console.error('获取数据失败:', error)
      ElMessage.error('获取数据失败，请稍后再试')
    })
    .finally(() => {
      loading.value = false
    })
}

function handleSizeChange(val) {
  pageSize.value = val
  currentPage.value = 1
  getProductDataPage()
}

function handleCurrentChange(val) {
  currentPage.value = val
  getProductDataPage()
}

function handleSelectionChange(val) {
  selectedRows.value = val.map(item => item.id)
}

// 修复下载功能 - 跨平台兼容
function downloadFile(row) {
  const loadingInstance = ElLoading.service(loadingOptions)
  
  getFilesByConditions({
    ids: [row.id]
  })
    .then((res) => {
      loadingInstance.close()
      
      // 创建 Blob 对象
      const blob = new Blob([res], { 
        type: getMimeType(row.filename) 
      })
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 设置下载文件名 - 兼容 Linux 和 Windows
      const fileName = row.filename || `download_${row.id}`
      link.setAttribute('download', fileName)
      
      // 兼容不同平台的下载方式
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 释放 URL 对象
      window.URL.revokeObjectURL(url)
      ElMessage.success('下载成功')
    })
    .catch((error) => {
      loadingInstance.close()
      console.error('下载失败:', error)
      ElMessage.error('下载失败，请稍后再试')
    })
}

// 根据文件名获取 MIME 类型
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const mimeTypes = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'zip': 'application/zip'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

function confirmDeleteRow(row) {
  ElMessageBox.confirm('此操作将永久删除该产品数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteProductsByConditions({ ids: [row.id] })
        .then((res) => {
          const result = res.response?.value || res
          if (result.code === 'SUCCESS') {
            getProductDataPage()
            ElMessage.success('删除成功')
          } else {
            ElMessage.error(result.msg || '删除失败')
          }
        })
        .catch((error) => {
          console.error('删除失败:', error)
          ElMessage.error('删除失败，请稍后再试')
        })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

function deleteSelectedRows() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的产品')
    return
  }

  ElMessageBox.confirm(
    `此操作将永久删除选中的 ${selectedRows.value.length} 条产品数据, 是否继续?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      deleteProductsByConditions({ ids: selectedRows.value })
        .then((res) => {
          const result = res.response?.value || res
          if (result.code === 'SUCCESS') {
            getProductDataPage()
            selectedRows.value = []
            ElMessage.success('删除成功')
          } else {
            ElMessage.error(result.msg || '删除失败')
          }
        })
        .catch((error) => {
          console.error('删除失败:', error)
          ElMessage.error('删除失败，请稍后再试')
        })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

function showExportDialog() {
  exportDialogVisible.value = true
}

// 修复导出功能 - 跨平台兼容
function exportData() {
  if (!exportDate.value) {
    ElMessage.warning('请选择导出日期')
    return
  }

  const loadingInstance = ElLoading.service(loadingOptions)
  
  getFilesByConditions({ observationTime: exportDate.value })
    .then((res) => {
      loadingInstance.close()
      
      // 创建 Blob 对象
      const blob = new Blob([res], { 
        type: 'application/vnd.ms-excel' 
      })
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 设置下载文件名
      link.setAttribute('download', `${exportDate.value}产品数据.xls`)
      
      // 兼容不同平台的下载方式
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 释放 URL 对象
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    })
    .catch((error) => {
      loadingInstance.close()
      console.error('导出失败:', error)
      ElMessage.error('导出失败，请稍后再试')
    })

  exportDialogVisible.value = false
  exportDate.value = ''
}
</script>

<style scoped>
/* 优化样式 */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.controls {
  width: 100%;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 表格容器 - 增加顶部间距避免遮盖表单 */
.table-container {
  width: 100%;
  margin-top: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.el-form-item {
  margin-bottom: 0;
  min-width: 180px;
  flex: 1;
}

.el-form-item:last-child {
  flex: none;
  min-width: auto;
}

.searchButton {
  background-color: #409eff;
  color: white;
  border: none;
}

.searchButton:hover {
  background-color: #66b1ff;
}

.demo-pagination-block {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
}

/* 简化表格样式 */
:deep(.custom-table) {
  border-radius: 8px;
  overflow: hidden;
}

/* 表格头居中对齐 */
:deep(.custom-table .el-table__header-wrapper th) {
  text-align: center;
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

:deep(.custom-table .el-table__header-wrapper th .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* 表格内容居中对齐 */
:deep(.custom-table .el-table__body-wrapper td) {
  text-align: center;
}

:deep(.custom-table .el-table__body-wrapper td .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* 表格滚动条样式优化 */
:deep(.custom-table .el-table__body-wrapper) {
  max-height: 600px;
  overflow: auto;
}

/* 斑马纹样式优化 */
:deep(.custom-table .el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

/* 鼠标悬停效果 */
:deep(.custom-table .el-table__body tr:hover > td) {
  background-color: #f5f7fa !important;
}

/* 分页样式优化 */
:deep(.el-pagination) {
  padding: 16px 0;
}

:deep(.el-pagination .number.active) {
  background-color: #409eff;
  color: white;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #e4e7ed;
}

/* 表单标签样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* 加载状态优化 */
:deep(.el-loading-mask) {
  border-radius: 8px;
}
</style>