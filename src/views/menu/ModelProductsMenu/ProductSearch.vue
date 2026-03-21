<template>
  <div class="container">
    <!-- 搜索区域整合到一个卡片中 -->
    <div class="search-card" :class="{ 'search-card-hidden': isSearchCardHidden }">
      <div class="search-header">
        <span class="search-title">产品搜索</span>
        <el-button 
          link 
          class="toggle-button"
          @click="toggleSearchCard"
        >
          <el-icon>
            <ArrowUp v-if="!isSearchCardHidden" />
            <ArrowDown v-else />
          </el-icon>
          {{ isSearchCardHidden ? '展开搜索' : '收起搜索' }}
        </el-button>
      </div>
      
      <div class="search-content" v-show="!isSearchCardHidden">
        <el-form :model="searchInfo">
          <!-- 第一行：基本搜索条件 -->
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
            <!-- 观测时间（改为日期选择器） -->
            <el-form-item label="观测时间">
              <div style="display: flex; gap: 10px; align-items: center;">
                <el-select 
                  v-model="searchInfo.observationTimeType" 
                  @change="handleObservationTimeTypeChange"
                  style="width: 70px">
                  <el-option label="年" value="year"></el-option>
                  <el-option label="月" value="month"></el-option>
                  <el-option label="日" value="day"></el-option>
                </el-select>
                <!-- 改为日期选择器 -->
                <el-date-picker
                  v-model="searchInfo.observationTime"
                  :type="getObservationTimePickerType()"
                  :format="getObservationTimeFormat()"
                  :value-format="getObservationTimeFormat()"
                  placeholder="选择观测时间"
                  clearable
                  :disabled-date="disabledDate"
                  @change="handleInputChange"
                  style="width: 180px"
                />
              </div>
            </el-form-item>
            <!-- 开始时间 -->
            <el-form-item label="开始时间" style="margin-left: 80px;">
              <el-input
                v-model="searchInfo.startDate"
                placeholder="格式：yyyy-mm-dd"
                @input="handleInputChange"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <!-- 结束时间 -->
            <el-form-item label="结束时间">
              <el-input
                v-model="searchInfo.endDate"
                placeholder="格式：yyyy-mm-dd"
                @input="handleInputChange"
                clearable
                style="width: 190px"
              />
            </el-form-item>
            <el-form-item class="button-group">
              <el-button @click="searchProducts" class="searchButton" type="primary">
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
    </div>

    <!-- 表格区域 -->
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
        <el-table-column prop="filename" label="文件名称" width="auto" :min-width="150" show-overflow-tooltip   />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import {
  getProductPageData,
  deleteProductsByConditions,
  getFilesByConditions,
  getModelClassName,
  getTimesByType
} from '@/api/getData'

// 搜索卡片状态
const isSearchCardHidden = ref(false)
const lastScrollTop = ref(0)

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
  observationTime: '',  // 改为 observationTime
  observationTimeType: 'day',  // 新增：观测时间类型
  startDate: '',
  endDate: ''
})


const classNames = ref([])
// 修复：正确初始化可用日期数组
const availableDates = ref([])

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const selectedRows = ref([])
const exportDialogVisible = ref(false)
const exportDate = ref('')

// 切换搜索卡片显示状态
const toggleSearchCard = () => {
  isSearchCardHidden.value = !isSearchCardHidden.value
}

// 滚动隐藏功能
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  
  if (scrollTop > lastScrollTop.value && scrollTop > 100) {
    // 向下滚动且超过100px时隐藏搜索卡片
    isSearchCardHidden.value = true
  } else if (scrollTop < lastScrollTop.value) {
    // 向上滚动时显示搜索卡片
    isSearchCardHidden.value = false
  }
  
  lastScrollTop.value = scrollTop <= 0 ? 0 : scrollTop
}

onMounted(() => {
  fetchClassNames()
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
})

// 修复：正确的日期禁用逻辑
function disabledDate(time) {
  if (!availableDates.value || availableDates.value.length === 0) {
    return false
  }
  
  // 根据当前选择的日期类型来检查
  const type = searchInfo.value.observationTimeType
  let dateString
  
  if (type === 'year') {
    dateString = `${time.getFullYear()}`
  } else if (type === 'month') {
    dateString = `${time.getFullYear()}-${(time.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`
  } else {
    // day
    dateString = `${time.getFullYear()}-${(time.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`
  }
  
  return !availableDates.value.includes(dateString)
}

// 新增方法：观测时间类型变化时重新获取数据
const handleObservationTimeTypeChange = (type) => {
  searchInfo.value.observationTimeType = type
  searchInfo.value.observationTime = ''
}

// 新增：根据观测时间类型获取日期格式
const getObservationTimeFormat = () => {
  switch(searchInfo.value.observationTimeType) {
    case 'year':
      return 'YYYY'
    case 'month':
      return 'YYYY-MM'
    case 'day':
      return 'YYYY-MM-DD'
    default:
      return 'YYYY-MM-DD'
  }
}

// 新增：根据观测时间类型获取日期选择器类型
const getObservationTimePickerType = () => {
  switch(searchInfo.value.observationTimeType) {
    case 'year':
      return 'year'
    case 'month':
      return 'month'
    case 'day':
      return 'date'
    default:
      return 'date'
  }
}

// 修复：正确处理接口返回的数据结构
function fetchAvailableDates() {
  // 获取所有三种格式的时间
  Promise.all([
    getTimesByType({ type: 'modelproducts', searchTimeType: 'year' }),
    getTimesByType({ type: 'modelproducts', searchTimeType: 'month' }),
    getTimesByType({ type: 'modelproducts', searchTimeType: 'day' })
  ])
    .then(([yearRes, monthRes, dayRes]) => {
      const yearResult = yearRes?.response?.value || yearRes?.value || yearRes
      const monthResult = monthRes?.response?.value || monthRes?.value || monthRes
      const dayResult = dayRes?.response?.value || dayRes?.value || dayRes
      
      const dates = []
      
      if (yearResult.code === 'SUCCESS') {
        dates.push(...(yearResult.body?.date || []))
      }
      if (monthResult.code === 'SUCCESS') {
        dates.push(...(monthResult.body?.date || []))
      }
      if (dayResult.code === 'SUCCESS') {
        dates.push(...(dayResult.body?.date || []))
      }
      
      availableDates.value = [...new Set(dates)]  // 去重
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
      const response = res?.response?.value || res?.value || res
      if (response.code === 'SUCCESS') {
        classNames.value = response.body || []
        fetchAvailableDates()  // 获取可用日期
        searchProducts()
      } else {
        ElMessage.warning(response.msg || '获取分类数据失败')
      }
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
    observationTime: searchInfo.value.observationTime,  // 改为 observationTime
    startTime: searchInfo.value.startDate,
    endTime: searchInfo.value.endDate
  }
  
  // 清理空值参数
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === undefined || params[key] === '') {
      delete params[key]
    }
  })
  
  loading.value = true
  getProductPageData(params)
    .then((res) => {
      const result = res?.response?.value || res?.value || res
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
      const response = res.response?.value || res

      // 创建 Blob 对象
      const blob = new Blob([response], { 
        type: getMimeType(row.type) 
      })
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 设置下载文件名 - 兼容 Linux 和 Windows
            // 设置下载文件名 - 兼容 Linux 和 Windows
      let fileName = row.filename || `download_${row.id}`

      // 如果文件名没有扩展名，尝试从type字段添加
      if (!fileName.includes('.') && row.type) {
        fileName = `${fileName}.${row.type.toLowerCase()}`
      }

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
function getMimeType(type) {
  const ext = type
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
          const result = res?.response?.value || res?.value || res
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
          const result = res?.response?.value || res?.value || res
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

/* 搜索卡片样式 */
.search-card {
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-card-hidden {
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.search-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.toggle-button {
  color: #409eff;
  font-size: 14px;
}

.search-content {
  padding: 20px;
}

/* 修复：调整行间距，避免观测时间覆盖开始时间 */
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;  /* 调整间隙，避免重叠 */
  margin-bottom: 16px;
}

.row:last-child {
  margin-bottom: 0;
}

.el-form-item {
  margin-bottom: 0;
  min-width: 220px;
  flex: 1;
  margin-right: 70px;
}

/* 修复：观测时间表单项宽度调整，确保不重叠 */
:deep(.el-form-item[data-v-][data-v-]:nth-child(5) .el-form-item__content) {
  min-width: 320px; /* 观测时间类型选择器+日期选择器的总宽度 */
}

/* 修复：按钮组样式调整 */
.button-group {
  flex: none;
  min-width: auto;
  display: flex;
  gap: 8px;
}

.searchButton {
  background-color: #409eff;
  color: white;
  border: none;
}

.searchButton:hover {
  background-color: #66b1ff;
}

/* 表格容器 */
.table-container {
  width: 100%;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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