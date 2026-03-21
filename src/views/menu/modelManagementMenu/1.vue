<template>
  <div class="file-manager">
    <!-- 提示框 -->
    <div class="tips-box" v-if="showTips">
      📌 支持文件上传/下载/删除/查看，仅支持Excel/Word/PDF等格式
      <button class="close-tips" @click="showTips = false">×</button>
    </div>

    <!-- 拖拽上传区域 -->
    <div
      class="drop-upload-area"
      @dragover.prevent
      @dragenter="isDragHover = true"
      @dragleave="isDragHover = false"
      @drop.prevent="handleDrop"
      :class="{ hover: isDragHover }"
    >
      <span v-if="!isDragHover">将文件拖拽到此处上传</span>
      <span v-else>松开鼠标即可上传</span>
    </div>

    <!-- 顶部操作区 -->
    <div class="operate-bar">
      <input v-model="searchWord" placeholder="输入文件名搜索" class="search-input">
      <button class="btn primary-btn" @click="openUploadModal = true">上传文件</button>
      <button class="btn normal-btn" @click="alert('文件列表已刷新！')">刷新列表</button>
      <button class="btn normal-btn" @click="alert('模板文件开始下载！')">下载模板</button>
    </div>

    <!-- 文件列表 -->
    <table class="file-table">
      <thead>
        <tr>
          <th>文件名</th>
          <th>文件类型</th>
          <th>文件大小</th>
          <th>上传时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="file in currentFiles" :key="file.id">
          <td>{{ file.name }}</td>
          <td>{{ file.type }}</td>
          <td>{{ file.sizeText }}</td>
          <td>{{ file.uploadTime }}</td>
          <td class="operate-cell">
            <button class="opt-btn view-btn" @click="viewFile(file)">查看</button>
            <button class="opt-btn download-btn" @click="alert(`开始下载文件：${file.name}`)">下载</button>
            <button class="opt-btn delete-btn" @click="deleteFile(file)">删除</button>
          </td>
        </tr>
        <tr v-if="currentFiles.length === 0">
          <td colspan="5" class="empty-cell">暂无文件数据 📂</td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div class="pagination">
      <span class="total">共 {{ filterFiles.length }} 条</span>
      <select v-model="pageSize" @change="page = 1" class="page-size-select">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
      </select>
      <button class="page-btn" :disabled="page === 1" @click="page--"><</button>
      <button class="page-btn" :class="{active: page === i}" v-for="i in totalPages" :key="i" @click="page = i">{{ i }}</button>
      <button class="page-btn" :disabled="page === totalPages" @click="page++">></button>
      <span class="jump-text">前往</span>
      <input type="number" v-model="jumpPage" @keyup.enter="jump()" min="1" :max="totalPages" class="jump-input">
      <span class="jump-text">页</span>
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

    <!-- 查看弹窗 -->
    <div class="modal-mask" v-if="openViewModal">
      <div class="modal-box view-modal">
        <div class="modal-header">
          <h3 class="modal-title">查看文件：{{ viewFileInfo.name }}</h3>
          <button class="close-modal" @click="openViewModal = false">×</button>
        </div>
        <div class="file-detail">
          <div class="detail-item"><span class="label">文件名称：</span><span class="value">{{ viewFileInfo.name }}</span></div>
          <div class="detail-item"><span class="label">文件类型：</span><span class="value">{{ viewFileInfo.type }}</span></div>
          <div class="detail-item"><span class="label">文件大小：</span><span class="value">{{ viewFileInfo.sizeText }}</span></div>
          <div class="detail-item"><span class="label">上传时间：</span><span class="value">{{ viewFileInfo.uploadTime }}</span></div>
        </div>
        <div class="modal-btn-group">
          <button class="btn primary-btn" @click="alert(`开始下载文件：${viewFileInfo.name}`)">下载文件</button>
          <button class="btn normal-btn" @click="openViewModal = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 基础变量
const showTips = ref(true)
const searchWord = ref('')
const openUploadModal = ref(false)
const openViewModal = ref(false)
const selectedFile = ref({ name: '', file: null })
const viewFileInfo = ref({})
const isDragHover = ref(false)
const fileInput = ref(null)

// 分页变量
const page = ref(1)
const pageSize = ref(10)
const jumpPage = ref(1)

// 模拟数据
const fileList = ref([
  { id: 1, name: '水压监测数据_202601.xlsx', type: 'Excel', sizeText: '256 KB', uploadTime: '2026-01-28 09:25' },
  { id: 2, name: '系统说明.md', type: 'Markdown', sizeText: '8 KB', uploadTime: '2026-01-24 15:30' },
  { id: 3, name: '水质检测报告.xlsx', type: 'Excel', sizeText: '192 KB', uploadTime: '2026-01-23 09:15' },
  { id: 4, name: '地表拓扑图.pdf', type: 'PDF', sizeText: '480 KB', uploadTime: '2026-01-20 11:05' },
  { id: 5, name: '月度数据汇总.xlsx', type: 'Excel', sizeText: '224 KB', uploadTime: '2026-01-18 10:30' },
])

// 计算属性
const filterFiles = computed(() => 
  searchWord.value 
    ? fileList.value.filter(f => f.name.toLowerCase().includes(searchWord.value.toLowerCase()))
    : fileList.value
)

const totalPages = computed(() => Math.ceil(filterFiles.value.length / pageSize.value))

const currentFiles = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filterFiles.value.slice(start, start + pageSize.value)
})

// 方法
const getFileType = (name) => {
  const suffix = name.split('.').pop().toLowerCase()
  const map = { xlsx: 'Excel', xls: 'Excel', docx: 'Word', pdf: 'PDF', md: 'Markdown', json: 'JSON' }
  return map[suffix] || '其他'
}

const getSizeText = (size) => 
  size < 1024 ? `${size} B` : `${(size / 1024).toFixed(0)} KB`

const selectFile = (e) => {
  const f = e.target.files[0]
  if (f) selectedFile.value = { name: f.name, file: f, sizeText: getSizeText(f.size) }
}

const resetUpload = () => {
  selectedFile.value = { name: '', file: null }
  if (fileInput.value) fileInput.value.value = ''
}

const uploadFile = () => {
  if (!selectedFile.value.file) return alert('请先选择要上传的文件！')
  const newFile = {
    id: Date.now(),
    name: selectedFile.value.name,
    type: getFileType(selectedFile.value.name),
    sizeText: selectedFile.value.sizeText,
    uploadTime: new Date().toLocaleString().slice(0, 16)
  }
  fileList.value.unshift(newFile)
  openUploadModal.value = false
  resetUpload()
  alert(`文件「${selectedFile.value.name}」上传成功！`)
}

const deleteFile = (f) => {
  if (!confirm(`确定要删除「${f.name}」吗？删除后无法恢复！`)) return
  fileList.value = fileList.value.filter(item => item.id !== f.id)
  if (currentFiles.value.length === 0 && page.value > 1) page.value--
  if (viewFileInfo.value.id === f.id) openViewModal.value = false
  alert(`文件「${f.name}」已删除！`)
}

const viewFile = (f) => {
  viewFileInfo.value = { ...f }
  openViewModal.value = true
}

const jump = () => {
  jumpPage.value = Math.max(1, Math.min(totalPages.value, jumpPage.value))
  page.value = jumpPage.value
}

const handleDrop = (e) => {
  isDragHover.value = false
  const files = e.dataTransfer.files
  if (files.length === 0) return
  const f = files[0]
  const newFile = {
    id: Date.now(),
    name: f.name,
    type: getFileType(f.name),
    sizeText: getSizeText(f.size),
    uploadTime: new Date().toLocaleString().slice(0, 16)
  }
  fileList.value.unshift(newFile)
  alert(`拖拽上传成功：${f.name}`)
}
</script>

<style scoped>
.file-manager {
  width: 90%;
  margin: 20px auto;
  font-family: "Microsoft YaHei", sans-serif;
}

.tips-box {
  background: #e6f7ff;
  color: #1890ff;
  padding: 10px 15px;
  border-radius: 4px;
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
}

.close-tips:hover { color: red; }

.drop-upload-area {
  width: 100%;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin: 0 0 20px 0;
  color: #999;
  transition: all 0.3s;
}

.drop-upload-area.hover {
  border-color: #1890ff;
  background: #f0f8ff;
  color: #1890ff;
}

.operate-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  padding: 8px 10px;
  width: 250px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary-btn { background: #1890ff; color: white; }
.normal-btn { background: #f5f5f5; color: #333; }
.btn:hover { opacity: 0.9; }

.file-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-bottom: 20px;
}

.file-table th, .file-table td {
  border: 1px solid #ddd;
  padding: 10px;
}

.file-table th { background: #f2f2f2; }
.empty-cell { color: #999; padding: 30px; }

.operate-cell {
  display: flex;
  gap: 5px;
  justify-content: center;
}

.opt-btn {
  padding: 5px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.view-btn { background: #1890ff; color: white; }
.download-btn { background: #52c41a; color: white; }
.delete-btn { background: #ff4d4f; color: white; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.total { color: #666; }

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.page-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover { background: #f5f5f5; }
.page-btn.active { background: #1890ff; color: white; border-color: #1890ff; }
.page-btn:disabled { color: #ccc; cursor: not-allowed; background: #f9f9f9; }

.jump-text { color: #666; }

.jump-input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.view-modal {
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.close-modal {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.close-modal:hover { color: red; }

.modal-title { margin: 0; font-size: 16px; }

.file-detail { margin-bottom: 20px; }

.detail-item {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.5;
}

.label {
  width: 80px;
  color: #666;
  font-weight: bold;
}

.value { flex: 1; color: #333; }

.modal-btn-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>