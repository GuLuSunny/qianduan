<template>
  <div>
    <!-- 水体变化识别功能 -->
    <div class="feature-container">
      <!-- 自定义步骤条 -->
      <div class="steps-container">
        <div class="custom-steps">
          <div :class="['step-item', { 'active': predictCurrent === 0 }]">
            <div class="step-number">1</div>
            <div class="step-title">选择文件和参数</div>
          </div>
          <div :class="['step-item', { 'active': predictCurrent === 1 }]">
            <div class="step-number">2</div>
            <div class="step-title">生产结果</div>
          </div>
        </div>
      </div>

      <!-- 选择文件和参数页面 -->
      <div class="form-container" v-if="predictCurrent === 0">
        <el-form :model="form" label-width="140px">
          <div class="form-horizontal-group">
            <div class="form-column-full">
              <!-- 早期文件上传 -->
              <el-form-item label="早期文件" required>
                <div style="display: flex; align-items: center; gap: 10px; width: 400px;">
                  <el-input
                    v-model="earlyFilePath"
                    placeholder="请选择早期文件"
                    readonly
                    style="width: 100%;"
                    clearable
                    @clear="handleRemoveFile('early')"
                    @keydown.delete="handleKeydown($event, 'early')"
                    @focus="handleInputFocus('early')"
                  >
                    <template #append>
                      <el-button @click="handleEarlyBrowseClick" style="background-color: #409eff; color: white; border: none;">
                        浏览
                      </el-button>
                    </template>
                  </el-input>
                  <input
                    type="file"
                    ref="earlyFileInput"
                    @change="handleEarlyFileSelect"
                    accept=".tif,.zip,.rar"
                    style="display: none;"
                  />
                </div>
              </el-form-item>

              <!-- 后期文件上传 -->
              <el-form-item label="后期文件" required>
                <div style="display: flex; align-items: center; gap: 10px; width: 400px;">
                  <el-input
                    v-model="lateFilePath"
                    placeholder="请选择后期文件"
                    readonly
                    style="width: 100%;"
                    clearable
                    @clear="handleRemoveFile('late')"
                    @keydown.delete="handleKeydown($event, 'late')"
                    @focus="handleInputFocus('late')"
                  >
                    <template #append>
                      <el-button @click="handleLateBrowseClick" style="background-color: #409eff; color: white; border: none;">
                        浏览
                      </el-button>
                    </template>
                  </el-input>
                  <input
                    type="file"
                    ref="lateFileInput"
                    @change="handleLateFileSelect"
                    accept=".tif,.zip,.rar"
                    style="display: none;"
                  />
                </div>
              </el-form-item>

              <!-- 文件状态提示 -->
              <el-form-item label="文件状态">
                <div class="file-status">
                  <div v-if="earlyFileObject" class="status-item">
                    <el-icon color="#67C23A"><Check /></el-icon>
                    <span>早期文件: {{ earlyFilePath }} ({{ (earlyFileObject.size / 1024 / 1024).toFixed(2) }} MB)</span>
                  </div>
                  <div v-else class="status-item">
                    <el-icon color="#F56C6C"><Close /></el-icon>
                    <span>未选择早期文件</span>
                  </div>
                  <div v-if="lateFileObject" class="status-item">
                    <el-icon color="#67C23A"><Check /></el-icon>
                    <span>后期文件: {{ lateFilePath }} ({{ (lateFileObject.size / 1024 / 1024).toFixed(2) }} MB)</span>
                  </div>
                  <div v-else class="status-item">
                    <el-icon color="#F56C6C"><Close /></el-icon>
                    <span>未选择后期文件</span>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="水体标签值" prop="waterTagValue">
                <el-input-number
                  v-model="form.waterTagValue"
                  :min="0"
                  :max="255"
                  step="1"
                  placeholder="请输入水体标签值（0-255）"
                  style="width: 200px;"
                />
                <div style="font-size: 12px; color: #909399; margin-top: 5px;">
                  注：代表水体的像素值，通常为0-255之间的整数
                </div>
              </el-form-item>
              
              <!-- 生产参数选项 -->
              <el-form-item label="生产参数">
                <el-checkbox-group v-model="predictOptions">
                  <el-checkbox label="change_stats">变化统计</el-checkbox>
                  <el-checkbox label="change_image">变化预览</el-checkbox>
                  <el-checkbox label="change_tif">变化结果下载</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <div class="button-group">
                <el-button
                  @click="handlePredict"
                  class="submit-button"
                  type="primary"
                  :loading="predictLoading"
                  :disabled="!earlyFileObject || !lateFileObject"
                >
                  {{ predictLoading ? '上传并生产中...' : '开始生产' }}
                </el-button>
              </div>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 生产结果页面 -->
      <div class="result-container" v-if="predictCurrent === 1">
        <div class="result-content">
          <!-- 结果内容区域 -->
          <div class="result-layout">
            <!-- 左侧：变化统计和下载区域 -->
            <div class="left-panel">
              <!-- 变化统计 -->
              <div class="stats-section" v-if="predictOptions.includes('change_stats') && Object.keys(changeStats).length > 0">
                <h3 class="section-title">变化统计</h3>
                <div class="stats-grid">
                  <div v-for="(value, key) in changeStats" :key="key" class="stats-item">
                    <span class="stats-key">{{ key }}：</span>
                    <span class="stats-value">面积: {{ value.area }} ㎡, 比例: {{ (value.ratio * 100).toFixed(2) }}%</span>
                  </div>
                </div>
              </div>
              
              <!-- 下载区域 -->
              <div class="download-section">
                <!-- 统计文件下载 -->
                <el-button 
                  v-if="predictOptions.includes('change_stats') && downloadFiles.stats_file" 
                  @click="downloadStatsFile" 
                  type="primary" 
                  plain 
                  :icon="Download" 
                  class="download-btn"
                >
                  下载统计文件
                </el-button>
                
                <!-- 变化地图下载 -->
                <el-button 
                  v-if="predictOptions.includes('change_tif') && downloadFiles.tif_file" 
                  @click="downloadTifFile" 
                  type="primary" 
                  plain 
                  :icon="Download" 
                  class="download-btn"
                >
                  下载变化地图
                </el-button>
              </div>
            </div>

            <!-- 右侧：变化图像预览 -->
            <div class="right-panel">
              <div class="preview-section" v-if="predictOptions.includes('change_image')">
                <h3 class="section-title">变化预览图</h3>
                <div v-if="previewData" class="image-preview">
                  <img :src="previewData" alt="变化结果预览" class="preview-image" />
                  <div class="preview-actions">
                    <el-button @click="openImageDialog" type="primary" plain>
                      <el-icon><ZoomIn /></el-icon>
                      查看大图
                    </el-button>
                  </div>
                </div>
                <div v-else class="no-preview">
                  <el-icon class="no-preview-icon"><Picture /></el-icon>
                  <div>暂无预览图</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button @click="handlePredictPrevious" :icon="Back">
              上一步
            </el-button>
            <el-button @click="handlePredictContinue" type="primary" :icon="RefreshRight">
              继续生产
            </el-button>
          </div>
        </div>
      </div>

      <!-- 大图预览对话框 -->
      <el-dialog v-model="imageDialogVisible" title="预览大图" width="90%" :destroy-on-close="true">
        <div class="full-image-container">
          <img :src="previewData" alt="完整预览" class="full-size-image" @load="onImageLoad" />
          <div v-if="isImageLoaded" class="zoom-controls">
            <el-button @click="zoomIn" icon="ZoomIn" circle size="small" />
            <el-button @click="zoomOut" icon="ZoomOut" circle size="small" />
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { Check, Picture, Download, Back,RefreshRight , ZoomIn, ZoomOut, Close } from '@element-plus/icons-vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElIcon,
  ElCheckbox,
  ElCheckboxGroup,
  ElDialog,
  ElInputNumber
} from 'element-plus'
import { getWaterChangeResult } from '@/api/getData'

// 状态定义
const predictCurrent = ref(0)
const predictOptions = ref(['change_stats', 'change_image', 'change_tif'])
const predictLoading = ref(false)
const error = ref('')
const imageDialogVisible = ref(false)
const previewData = ref('')
const isImageLoaded = ref(false)
const zoomLevel = ref(1)

// 表单数据
const form = ref({
  waterTagValue: 1
})

// 文件上传相关状态
const earlyFilePath = ref('')
const lateFilePath = ref('')
const earlyFileObject = ref(null)
const lateFileObject = ref(null)
const earlyFileInput = ref(null)
const lateFileInput = ref(null)
const focusedInput = ref('')

// 变化统计数据
const changeStats = ref({})
const downloadFiles = ref({ stats_file: '', image_file: '', tif_file: '' })

// 文件选择和验证
const handleInputFocus = (type) => {
  focusedInput.value = type
}

const handleEarlyBrowseClick = () => {
  if (earlyFileInput.value) earlyFileInput.value.click()
}

const handleLateBrowseClick = () => {
  if (lateFileInput.value) lateFileInput.value.click()
}

const handleEarlyFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && beforeUpload(file)) {
    earlyFilePath.value = file.name
    earlyFileObject.value = file
    event.target.value = ''
  }
}

const handleLateFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && beforeUpload(file)) {
    lateFilePath.value = file.name
    lateFileObject.value = file
    event.target.value = ''
  }
}

const handleRemoveFile = (type) => {
  if (type === 'early') {
    earlyFilePath.value = ''
    earlyFileObject.value = null
    earlyFileInput.value && (earlyFileInput.value.value = '')
  } else if (type === 'late') {
    lateFilePath.value = ''
    lateFileObject.value = null
    lateFileInput.value && (lateFileInput.value.value = '')
  }
}

const handleKeydown = (event, type) => {
  const isDelete = event.key === 'Delete' || event.keyCode === 46
  const isBackspace = event.key === 'Backspace' || event.keyCode === 8
  if (isDelete || isBackspace) {
    event.preventDefault()
    handleRemoveFile(type)
  }
}

function beforeUpload(file) {
  const validTypes = ['.tif', '.zip', '.rar']
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!validTypes.includes(fileExt)) {
    message.error(`只能上传 ${validTypes.join(', ')} 格式的文件`)
    return false
  }
  const isLt100M = file.size / 1024 / 1024 < 1000
  if (!isLt100M) {
    message.error('文件大小不能超过 1000MB')
    return false
  }
  return true
}

// 生产处理
const handlePredict = async () => {
  if (!earlyFileObject.value || !lateFileObject.value) {
    message.error('请上传早期和后期文件')
    return
  }
  if (!earlyFileObject.value.size || !lateFileObject.value.size) {
    message.error('文件内容为空，请重新选择')
    return
  }

  // 验证水体标签值
  if (form.value.waterTagValue === undefined || form.value.waterTagValue === null || form.value.waterTagValue === '') {
    message.error('请输入水体标签值')
    return
  }

  predictLoading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('earlyFile', earlyFileObject.value)
    formData.append('lateFile', lateFileObject.value)
    formData.append('waterTagValue', form.value.waterTagValue.toString())
    
    // 只添加用户选择的参数
    predictOptions.value.forEach(option => {
      formData.append(option, 'True')
    })

    const res = await getWaterChangeResult(formData)
    const response = res?.response?.value || res?.value || res

    if (response?.code === 'SUCCESS') {
      message.success('生产完成')
      const body = response.body
      
      // 根据用户选择的参数显示对应的结果
      if (predictOptions.value.includes('change_stats')) {
        changeStats.value = body.stats || {}
      }
      
      downloadFiles.value = {
        stats_file: body.stats_file ? body.stats_file.replace(/\\/g, '/') : '',
        image_file: body.image_file ? body.image_file.replace(/\\/g, '/') : '',
        tif_file: body.tif_file ? body.tif_file.replace(/\\/g, '/') : ''
      }
      
      if (predictOptions.value.includes('change_image') && body.image_file) {
        await loadPreviewImage(body.image_file.replace(/\\/g, '/'))
      }
      
      predictCurrent.value = 1
    } else {
      const msg = response?.msg || '生产失败'
      error.value = msg
      message.error(msg)
    }
  } catch (err) {
    console.error('生产失败:', err)
    error.value = '生产失败: ' + err.message
    message.error('生产失败: ' + err.message)
  } finally {
    predictLoading.value = false
  }
}

const loadPreviewImage = async (imagePath) => {
  if (!imagePath) {
    previewData.value = ''
    message.error('图片路径为空')
    return
  }
  try {
    const timestamp = Date.now()
    const response = await fetch(`/api/proxy/preview?t=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Accept': 'image/*'
      },
      body: JSON.stringify({ imagePath })
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('预览图请求失败:', response.status, errorText)
      if (errorText.includes('token 已过期')) {
        message.error('token 已过期，请重新登录')
      } else {
        message.error(`加载失败: ${errorText || '未知错误'}`)
      }
      previewData.value = ''
      return
    }
    const contentType = response.headers.get('Content-Type')
    if (!contentType || !contentType.startsWith('image/')) {
      const errorText = await response.text()
      console.error('非图片响应内容:', errorText)
      message.error('返回的内容不是有效图片: ' + (errorText || contentType))
      previewData.value = ''
      return
    }
    const blob = await response.blob()
    if (blob.size === 0) {
      console.error('图片数据为空')
      message.error('图片数据为空')
      previewData.value = ''
      return
    }
    const imageUrl = URL.createObjectURL(blob)
    previewData.value = imageUrl
    isImageLoaded.value = false
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      isImageLoaded.value = true
    }
    img.onerror = () => {
      console.error('图片加载失败')
      previewData.value = ''
      message.error('图片加载失败，无法显示')
      URL.revokeObjectURL(imageUrl)
    }
    return () => URL.revokeObjectURL(imageUrl)
  } catch (error) {
    console.error('加载预览图失败:', error)
    previewData.value = ''
    message.error('无法加载预览图: ' + error.message)
  }
}

// 下载功能
const downloadStatsFile = async () => {
  if (!downloadFiles.value.stats_file) {
    message.error('没有可下载的统计文件')
    return
  }
  await downloadFile(downloadFiles.value.stats_file, 'water_change_stats.txt')
}

const downloadTifFile = async () => {
  if (!downloadFiles.value.tif_file) {
    message.error('没有可下载的变化地图')
    return
  }
  await downloadFile(downloadFiles.value.tif_file, 'water_change_map.tif')
}

const downloadFile = async (filePath, defaultName) => {
  try {
    const timestamp = Date.now()
    const response = await fetch(`/api/proxy/download?t=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ filePath, fileName: filePath.split(/[\\/]/).pop() || defaultName })
    })
    if (!response.ok) throw new Error(`下载失败: ${response.status}`)
    const blob = await response.blob()
    if (blob.size < 10) throw new Error('文件大小异常')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filePath.split(/[\\/]/).pop() || defaultName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    message.success(`下载完成，文件大小: ${(blob.size / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.error('下载失败:', error)
    if (error.message.includes('401')) {
      message.error('token 可能已过期，请重新登录')
    } else {
      message.error('下载失败: ' + error.message)
    }
  }
}

const handlePredictPrevious = () => {
  if (predictCurrent.value > 0) predictCurrent.value -= 1
}

const handlePredictContinue = () => {
  // 清空所有文件和数据
  earlyFilePath.value = ''
  lateFilePath.value = ''
  earlyFileObject.value = null
  lateFileObject.value = null
  earlyFileInput.value && (earlyFileInput.value.value = '')
  lateFileInput.value && (lateFileInput.value.value = '')
  changeStats.value = {}
  downloadFiles.value = { stats_file: '', image_file: '', tif_file: '' }
  previewData.value = ''
  form.value.waterTagValue = 1
  predictCurrent.value = 0
}

const openImageDialog = () => {
  imageDialogVisible.value = true
}

// 图片加载完成回调
const onImageLoad = (event) => {
  const img = event.target
  if (img.naturalWidth > window.innerWidth * 0.9 || img.naturalHeight > window.innerHeight * 0.7) {
    zoomLevel.value = Math.min(window.innerWidth * 0.9 / img.naturalWidth, window.innerHeight * 0.7 / img.naturalHeight)
  }
}

// 缩放控制
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.1, 2)
  applyZoom()
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.1)
  applyZoom()
}

const applyZoom = () => {
  const img = document.querySelector('.full-size-image')
  if (img) {
    img.style.transform = `scale(${zoomLevel.value})`
    img.style.transformOrigin = '0 0'
  }
}
</script>

<style scoped>
.file-status {
  display: flex;
  flex-direction: column;
  gap: 0px;
  margin-left: 0px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 功能容器 */
.feature-container {
  margin: 0 auto;
  max-width: 1200px;
}

/* 步骤容器 */
.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto;
  width: 80%;
}

/* 自定义步骤条样式 */
.custom-steps {
  display: flex;
  width: 70%;
  max-width: 600px;
  justify-content: space-between;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-item:not(:last-child):after {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
  border: 2px solid #e0e0e0;
  color: #999;
}

.step-title {
  font-size: 14px;
  color: #999;
  text-align: center;
}

.step-item.active .step-number {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.step-item.active .step-title {
  color: #1890ff;
  font-weight: 500;
}

/* 表单容器 */
.form-container {
  margin: 50px;
  width: 100%;
  margin-left: 280px;
}

/* 按钮组 */
.button-group {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-right: 550px;
  gap: 20px;
}

.submit-button {
  padding: 10px 25px;
  background-color: #1890ff;
  color: white;
  border-radius: 4px;
  font-weight: 500;
}

.submit-button:hover {
  background-color: #40a9ff;
}

/* 结果容器 */
.result-container {
  margin: 20px auto;
  max-width: 1200px;
  padding: 0 20px;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 结果布局 */
.result-layout {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  width: 100%;
  max-width: 1100px;
}

/* 左侧面板 */
.left-panel {
  flex: 1;
  min-width: 350px;
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  min-width: 350px;
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
}

/* 区域标题 */
.section-title {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

/* 修改统计网格间隔 - 增大gap值 */
.stats-grid {
  display: grid;
  gap: 20px; /* 修改：从15px改为20px，增大间隔 */
}

/* 可选：如果希望统计项本身也有更大间隔，可以增加padding */
.stats-item {
  display: flex;
  justify-content: space-between;
  padding: 18px; /* 修改：从15px改为18px，略微增大内边距 */
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.stats-key {
  font-weight: bold;
  color: #606266;
}

.stats-value {
  color: #303133;
}

.left-panel .el-button + .el-button {
  margin-left: 0 !important;
}

/* 修改下载区域样式 */
.download-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center; /* 新增：水平居中 */
}

.download-btn {
  width: 100%; /* 修改：从100%改为80%，使按钮不占满整个宽度 */
  max-width: 800px; /* 新增：限制最大宽度 */
}

/* 预览区域 */
.preview-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 350px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.preview-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  width: 100%;
}

.preview-actions .el-button {
  flex: 1;
}

.no-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  padding: 60px 20px;
  height: 100%;
}

.no-preview-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  width: 100%;
}

/* 修复操作按钮的相邻外边距 */
.action-buttons .el-button + .el-button {
  margin-left: 10px; /* 保持适当的间距 */
}

/* 如果操作按钮中有隐藏的按钮导致偏移，可以重置 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px; /* 使用gap替代margin-left更可靠 */
  margin-top: 30px;
  width: 100%;
}

/* 移除所有隐藏元素的影响 */
.action-buttons .el-button:empty,
.action-buttons .el-button[style*="display: none"] {
  display: none !important;
}

/* 大图容器优化 */
.full-image-container {
  width: 100%;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  position: relative;
}

.full-size-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s;
}

.zoom-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .form-container {
    width: 95%;
    margin-left: 20px;
  }
  
  .custom-steps {
    max-width: 90%;
  }
  
  .full-image-container {
    height: 50vh;
  }
  
  .result-layout {
    flex-direction: column;
  }
  
  .left-panel,
  .right-panel {
    min-width: 100%;
  }
  
  .button-group {
    margin-right: 0;
  }
}

@media (max-width: 768px) {
  .form-container {
    margin: 20px;
  }
  
  .steps-container {
    width: 95%;
  }
}
</style>