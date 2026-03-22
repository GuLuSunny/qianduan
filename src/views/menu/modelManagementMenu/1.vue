<template>
  <div class="file-manager">
    <!-- 提示框 -->
    <div class="tips-box" v-if="showTips">
      📌 支持文件上传/批量删除/更新，仅支持 Excel/Word/PDF 等格式
      <button class="close-tips" @click="showTips = false">×</button>
    </div>

    <!-- 拖拽上传区域 -->
    <div
      class="drop-upload-area"
      @dragover.prevent
      @drop.prevent
    >
      <span>将文件拖拽到此处上传</span>
    </div>

    <!-- 顶部操作区 -->
    <div class="operate-bar">
      <input v-model="searchWord" placeholder="请输入关键词进行搜索" class="search-input" @keyup.enter="handleSearch">
      <!-- 文件类名筛选下拉框 -->
      <select v-model="fileType" class="type-select" @change="handleSearch">
        <option value="">全部类别</option>
        <option v-for="className in classNames" :key="className" :value="className">{{ className }}</option>
      </select>

      <input type="date" v-model="startDate" class="date-input" @change="handleSearch">
      <span class="date-separator">至</span>
      <input type="date" v-model="endDate" class="date-input" @change="handleSearch">
      
      <!-- 批量删除按钮 -->
      <button class="btn batch-delete-btn" @click="showCheckboxColumn = true; batchDeleteFiles()">
        批量删除
      </button>
      
      <!-- 取消删除按钮 -->
      <button v-if="showCheckboxColumn" class="btn normal-btn" @click="cancelBatchDelete">
        取消删除
      </button>
      
      <button class="btn primary-btn" @click="openUploadModal = true">上传文件</button>
    </div>

    <!-- 文件列表 -->
    <table class="file-table">
      <thead>
        <tr>
          <!-- 已选中项数 -->
          <th v-if="showCheckboxColumn">
            已选中 {{ selectedFileIds.length }} 项
          </th>
          <th>用户名称</th>
          <th>创建时间</th>
          <th>起始时间</th>
          <th>处理状态</th>
          <th>文件类型</th>
          <th>模型名称</th>
          <th>数据介绍</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(file, index) in currentFiles" :key="file.filepath + '-' + index">
          <!-- 单行选择框 -->
          <td v-if="showCheckboxColumn">
            <input 
              type="checkbox" 
              :value="file.id?.toString() || file.filepath" 
              v-model="selectedFileIds"
              @change="handleSingleSelect"
            >
          </td>
          <!-- 用户名 -->
          <td>{{ file.username }}</td>
          <!-- 创建时间 -->
          <td>{{ file.createtime }}</td>
          <!-- 起始时间 -->
          <td>{{ file.starttime || '' }} - {{ file.endtime || '' }}</td>
          <!-- 处理状态 -->
          <td>{{ file.dealstatus || '未处理' }}</td>
          <!-- 文件类型 -->
          <td>{{ file.type || '' }}</td>
          <!-- 模型名称 -->
          <td>{{ file.modelname || '' }}</td>
          <!-- 数据介绍 -->
          <td>
            <span class="data-intro" :title="file.dataintroduction || ''">
              {{ (file.dataintroduction || '').length > 20 ? (file.dataintroduction || '').substring(0, 20) + '...' : (file.dataintroduction || '') }}
            </span>
          </td>
          <td class="operate-cell">
            <button class="opt-btn update-btn" @click="updateFile(file)">更新</button>
            <button class="opt-btn delete-btn" @click="deleteFile(file)">删除</button>
          </td>
        </tr>
        <tr v-if="currentFiles.length === 0 && !loading">
          <td :colspan="showCheckboxColumn ? 9 : 8" class="empty-cell">暂无文件数据 📂</td>
        </tr>
        <tr v-if="loading">
          <td :colspan="showCheckboxColumn ? 9 : 8" class="empty-cell">加载中... 📤</td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div class="pagination">
      <span class="total">共 {{ total }} 条</span>
      <select v-model="pageSize" @change="handlePageSizeChange(pageSize)" class="page-size-select">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
      </select>
      <button class="page-btn" :disabled="page === 1" @click="handlePageChange(page - 1)"><</button>
      <button class="page-btn" :class="{active: page === i}" v-for="i in totalPages" :key="i" @click="handlePageChange(i)">{{ i }}</button>
      <button class="page-btn" :disabled="page === totalPages" @click="handlePageChange(page + 1)">></button>
      <span class="jump-text">前往</span>
      <input type="number" v-model="jumpPage" @keyup.enter="jump()" min="1" :max="totalPages" class="jump-input">
      <span class="jump-text">页</span>
      <span v-if="loading" class="loading">加载中...</span>
    </div>

    <!-- 上传弹窗 -->
    <div class="modal-mask" v-if="openUploadModal">
      <div class="modal-box">
        <h3 class="modal-title">上传文件</h3>
        <input type="file" ref="fileInput" accept=".xlsx,.xls,.docx,.pdf,.md,.json" @change="selectFile" class="file-input">
        <div class="selected-file" v-if="selectedFile.name">已选择：{{ selectedFile.name }}</div>
        <div class="modal-btn-group">
          <button class="btn normal-btn" @click="openUploadModal = false; resetUpload()">取消</button>
          <button class="btn primary-btn" @click="uploadFile()">确认上传</button>
        </div>
      </div>
    </div>

    <!-- 更新弹窗 -->
    <div class="modal-mask" v-if="openUpdateModal">
      <div class="modal-box">
        <h3 class="modal-title">更新文件信息</h3>
        <div class="update-form">
          <div class="form-item">
            <label class="form-label">文件类型：</label>
            <input v-model="updateFileInfo.type" class="form-input" placeholder="multiple/only">
          </div>
          <div class="form-item">
            <label class="form-label">用户名称：</label>
            <input v-model="updateFileInfo.username" class="form-input">
          </div>
          <div class="form-item">
            <label class="form-label">处理状态：</label>
            <select v-model="updateFileInfo.dealStatus" class="form-input">
              <option value="success">成功</option>
              <option value="failed">失败</option>
              <option value="processing">处理中</option>
              <option value="unprocessed">未处理</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">数据介绍：</label>
            <input v-model="updateFileInfo.dataintroduction" class="form-input">
          </div>
          <div class="form-item">
            <label class="form-label">模型名称：</label>
            <input v-model="updateFileInfo.modelname" class="form-input">
          </div>
          <div class="form-item">
            <label class="form-label">创建人id：</label>
            <input v-model="updateFileInfo.createuserid" class="form-input">
          </div>
        </div>
        <div class="modal-btn-group">
          <button class="btn normal-btn" @click="openUpdateModal = false; resetUpdate()">取消</button>
          <button class="btn primary-btn" @click="confirmUpdate()">确认更新</button>
        </div>
      </div>
    </div>

    <!-- 自定义消息弹窗 -->
    <div class="modal-mask" v-if="showMessageModal">
      <div class="modal-box message-modal">
        <h3 class="modal-title">{{ messageTitle }}</h3>
        <div class="message-content">{{ messageContent }}</div>
        <div class="modal-btn-group">
          <button class="btn primary-btn" @click="showMessageModal = false">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  queryModelFileStatusList, 
  batchDeleteModelFileStatus, 
  updateModelFileStatus,
  getModelClassName
} from '@/api/getData'

// 基础变量
const showTips = ref(true)
const searchWord = ref('')
const fileType = ref('')
const startDate = ref('')
const endDate = ref('')
const openUploadModal = ref(false)
const openUpdateModal = ref(false)
const showMessageModal = ref(false)
const messageTitle = ref('提示')
const messageContent = ref('')
const selectedFile = ref({ name: '', file: null })
const updateFileInfo = ref({})
const fileInput = ref(null)
const showCheckboxColumn = ref(false)
const classNames = ref([])

// 批量删除相关变量
const selectedFileIds = ref([])

// 加载状态
const loading = ref(false)

// 分页变量
const page = ref(1)
const pageSize = ref(10)
const jumpPage = ref(1)
const total = ref(0)

// 真实数据列表
const fileList = ref([])

// 过滤逻辑：适配后端真实字段
const filterFiles = computed(() => {
  return fileList.value.filter(f => {
    const fileClass = f.classname || '未知'
    const nameMatch = !searchWord.value || fileClass.toLowerCase().includes(searchWord.value.toLowerCase())
    const typeMatch = !fileType.value || fileClass === fileType.value
    const timeMatch = !startDate.value && !endDate.value || (() => {
      if (!f.createtime) return true
      const fileDate = new Date(f.createtime)
      const start = startDate.value ? new Date(startDate.value) : null
      const end = endDate.value ? new Date(endDate.value) : null
      return (!start || fileDate >= start) && (!end || fileDate <= end)
    })()
    return nameMatch && typeMatch && timeMatch
  })
})

// 总页数计算
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 当前页数据
const currentFiles = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filterFiles.value.slice(start, start + pageSize.value)
})

// 监听当前页数据变化，重置选择
watch(currentFiles, () => {
  selectedFileIds.value = []
})

// 单行选择
const handleSingleSelect = () => {}

// 获取后端真实数据
const fetchFiles = async () => {
  try {
    loading.value = true
    const res = await queryModelFileStatusList({
      current: page.value,
      size: pageSize.value,
      startDate: startDate.value || '',
      endDate: endDate.value || ''
    })
    
    const result = res.response.value

    if (result.code === 'SUCCESS' && result.success) {
      fileList.value = result.body?.records || []
      total.value = result.body?.total || 0
    } else {
      showMessage(result.msg || '获取数据失败', '错误')
      fileList.value = []
      total.value = 0
    }
  } catch (error) {
    showMessage('网络异常，获取数据失败', '错误')
    fileList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 批量删除（调用真实后端接口）
const batchDeleteFiles = async () => {
  if (!selectedFileIds.value.length) {
    return showMessage('请选择要删除的文件', '提示')
  }
  
  if (!confirm(`确定要删除选中的 ${selectedFileIds.value.length} 个文件吗？`)) {
    return
  }

  try {
    loading.value = true
    const res = await batchDeleteModelFileStatus({
      deleteType: "ids",
      ids: selectedFileIds.value
    })
    
    const result = res.response.value
    if (result.code === 'SUCCESS' && result.success) {
      showMessage('批量删除成功！', '成功')
      selectedFileIds.value = []
      showCheckboxColumn.value = false
      await fetchFiles()
    } else {
      showMessage(result.msg || '批量删除失败', '错误')
    }
  } catch (error) {
    showMessage('网络异常，批量删除失败', '错误')
  } finally {
    loading.value = false
  }
}

// 单行删除（基于批量删除接口实现）
const deleteFile = (f) => {
  if (!confirm(`确定删除该文件吗？`)) return
  
  selectedFileIds.value = [f.id?.toString() || f.filepath]
  batchDeleteFiles()
}

// 选择文件
const selectFile = (e) => {
  const f = e.target.files[0]
  if (f) selectedFile.value = { name: f.name, file: f }
}

// 重置上传
const resetUpload = () => {
  selectedFile.value = { name: '', file: null }
  if (fileInput.value) fileInput.value.value = ''
}

// 上传文件（模拟）
const uploadFile = () => {
  if (!selectedFile.value.file) return showMessage('请选择文件', '提示')
  const newFile = {
    filepath: `D:\\recognition\\fileTemp\\\\未分类\\${selectedFile.value.name}`,
    userName: '当前用户',
    createTime: new Date().toLocaleDateString(),
    dealStatus: '未处理'
  }
  fileList.value.unshift(newFile)
  openUploadModal.value = false
  resetUpload()
  showMessage('上传成功（模拟）', '提示')
}

// 准备更新
const updateFile = (f) => {
  updateFileInfo.value = {
    ...f,
    type: f.type || '',
    dealStatus: f.dealstatus || 'unprocessed',
    dataintroduction: f.dataintroduction || '',
    modelname: f.modelname || '',
    createuserid: f.createuserid || ''
  }
  openUpdateModal.value = true
}

// 重置更新
const resetUpdate = () => {
  updateFileInfo.value = {}
}

// 确认更新（调用真实后端接口）
const confirmUpdate = async () => {
  if (!updateFileInfo.value.type) {
    return showMessage('请输入文件类型', '提示')
  }

  try {
    loading.value = true
    
    const updateData = {
      updateType: "id",
      id: updateFileInfo.value.id,
      updateEntity: {
        dealStatus: updateFileInfo.value.dealStatus,
        dataIntroduction: updateFileInfo.value.dataintroduction || '',
        modelName: updateFileInfo.value.modelname || '',
        type: updateFileInfo.value.type,
        createUserid: updateFileInfo.value.createuserid || '',
        createTime: new Date().toISOString().split('T')[0]
      }
    }

    const res = await updateModelFileStatus(updateData)
    const result = res.response.value

    if (result.code === 'SUCCESS' && result.success) {
      showMessage('文件信息更新成功！', '成功')
      openUpdateModal.value = false
      resetUpdate()
      await fetchFiles()
    } else {
      showMessage(result.msg || '更新失败', '错误')
    }
  } catch (error) {
    showMessage('网络异常，更新失败', '错误')
  } finally {
    loading.value = false
  }
}

// 页码跳转
const jump = () => {
  jumpPage.value = Math.max(1, Math.min(totalPages.value, jumpPage.value))
  page.value = jumpPage.value
  fetchFiles()
}

// 取消批量删除
const cancelBatchDelete = () => {
  showCheckboxColumn.value = false
  selectedFileIds.value = []
}

// 显示消息弹窗
const showMessage = (content, title = '提示') => {
  messageTitle.value = title
  messageContent.value = content
  showMessageModal.value = true
}

// 页码切换
const handlePageChange = (newPage) => {
  page.value = newPage
  fetchFiles()
}

// 页大小切换
const handlePageSizeChange = (newSize) => {
  pageSize.value = newSize
  page.value = 1
  fetchFiles()
}

// 搜索
const handleSearch = () => {
  page.value = 1
  fetchFiles()
}

// 获取类别列表
const fetchClassNames = async () => {
  try {
    const res = await getModelClassName({})
    const result = res.response.value
    if (result.code === 'SUCCESS' && result.success) {
      classNames.value = result.body || []
    }
  } catch (error) {
    console.error('获取类别列表失败:', error)
  }
}

// 初始化加载真实数据
fetchFiles()
fetchClassNames()
</script>

<style scoped>
/* 全局样式 */
.file-manager {
  width: 95%;
  margin: 20px auto;
  font-family: "Microsoft YaHei", Arial, sans-serif;
  background: #f8f9fa;
  padding: 20px;
}

/* 提示框样式 */
.tips-box {
  background: #e6f7ff;
  color: #1890ff;
  padding: 10px 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-tips {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #1890ff;
  padding: 0;
}

/* 拖拽上传区域 */
.drop-upload-area {
  width: 100%;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border: 2px dashed #ddd;
  margin: 0 0 20px 0;
  color: #999;
  background: white;
}

/* 操作栏样式 */
.operate-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  background: white;
  padding: 10px;
}

.search-input {
  padding: 8px 10px;
  width: 200px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.type-select {
  padding: 8px 10px;
  border: 1px solid #ddd;
  width: 120px;
  font-size: 14px;
}

.date-input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  width: 120px;
  font-size: 14px;
}

.date-separator {
  color: #666;
  margin: 0 5px;
  font-size: 14px;
}

/* 按钮样式 */
.btn {
  padding: 8px 15px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.primary-btn {
  background: #1890ff;
  color: white;
}

.normal-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.batch-delete-btn {
  background: #ff4d4f;
  color: white;
}

.batch-delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 表格样式 */
.file-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-bottom: 20px;
  background: white;
}

.file-table th, .file-table td {
  border: 1px solid #ddd;
  padding: 8px;
  white-space: nowrap;
}

.file-table th {
  background: #f2f2f2;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.empty-cell {
  color: #999;
  padding: 20px;
  font-size: 14px;
  background: #f9f9f9;
}

/* 操作单元格 */
.operate-cell {
  display: flex;
  gap: 5px;
  justify-content: center;
}

.opt-btn {
  padding: 5px 8px;
  border: none;
  cursor: pointer;
  font-size: 12px;
}

.update-btn {
  background: #52c41a;
  color: white;
}

.delete-btn {
  background: #ff4d4f;
  color: white;
}

/* 数据介绍 */
.data-intro {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.total {
  color: #666;
  font-size: 14px;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.page-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.page-btn.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
  background: #f9f9f9;
  border-color: #f0f0f0;
}

.jump-text {
  color: #666;
  font-size: 14px;
}

.jump-input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 14px;
}

/* 模态框样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  padding: 20px;
  width: 400px;
}

.modal-title {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.update-form {
  margin: 15px 0;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.form-label {
  width: 100px;
  text-align: right;
  margin-right: 15px;
  color: #666;
  font-size: 14px;
}

.form-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #d9d9d9;
  font-size: 14px;
}

.modal-btn-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.message-modal {
  width: 400px;
  text-align: center;
}

.message-content {
  margin: 20px 0;
  line-height: 1.6;
  color: #333;
  font-size: 14px;
}

/* 加载状态 */
.loading {
  color: #1890ff;
  margin-left: 10px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .file-manager {
    width: 98%;
    padding: 15px;
  }
  
  .operate-bar {
    gap: 8px;
    padding: 10px;
  }
  
  .search-input {
    width: 180px;
  }
  
  .type-select {
    width: 120px;
  }
  
  .file-table th, .file-table td {
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .operate-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .type-select,
  .date-input {
    width: 100%;
  }
  
  .modal-box {
    width: 90%;
    padding: 15px;
  }
  
  .form-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-label {
    width: 100%;
    text-align: left;
    margin-bottom: 5px;
  }
}
</style>