<template>
  <div>
    <!-- 水体变化识别功能 -->
    <div class="feature-container">
      <!-- 自定义步骤条 - 添加动画 -->
      <div class="steps-container animate__animated animate__fadeInDown">
        <div class="custom-steps">
          <div :class="['step-item', { 'active': predictCurrent === 0 }]">
            <div 
              class="step-number animate__animated" 
              :class="{'animate__pulse animate__infinite': predictCurrent === 0}"
            >
              1
            </div>
            <div class="step-title">选择文件和参数</div>
          </div>
          <div :class="['step-item', { 'active': predictCurrent === 1 }]">
            <div 
              class="step-number animate__animated" 
              :class="{'animate__pulse animate__infinite': predictCurrent === 1}"
            >
              2
            </div>
            <div class="step-title">预测结果</div>
          </div>
        </div>
      </div>

      <!-- 选择文件和参数页面 - 添加切换动画 -->
      <transition 
        enter-active-class="animate__animated animate__fadeInRight" 
        leave-active-class="animate__animated animate__fadeOutLeft"
        mode="out-in"
      >
        <!-- 用一个 div 包裹两个页面，通过 v-if/v-else 控制显示哪一个 -->
        <div :key="predictCurrent">
          <!-- 表单页面 -->
          <div class="form-container" v-if="predictCurrent === 0">
            <el-form :model="form" label-width="auto" class="center-form">
              <div class="form-horizontal-group">
                <div class="form-column-full">
                  <!-- 早期文件上传 - 添加动画 -->
                  <el-form-item label="早期文件：" required>
                    <div class="file-input-wrapper animate__animated animate__fadeInUp" :style="{animationDelay: '0.1s'}">
                      <el-input
                        v-model="earlyFilePath"
                        placeholder="请选择早期文件"
                        readonly
                        clearable
                        @clear="handleRemoveFile('early')"
                        @keydown.delete="handleKeydown($event, 'early')"
                        @focus="handleInputFocus('early')"
                      >
                        <template #append>
                          <el-button @click="handleEarlyBrowseClick" class="browse-button">
                            浏览
                          </el-button>
                        </template>
                      </el-input>
                      <input
                        type="file"
                        ref="earlyFileInput"
                        @change="handleEarlyFileSelect"
                        accept=".tif,.zip,.rar"
                        class="file-input-hidden"
                      />
                    </div>
                  </el-form-item>

                  <!-- 后期文件上传 - 添加动画 -->
                  <el-form-item label="后期文件：" required class="center-form">
                    <div class="file-input-wrapper center-content animate__animated animate__fadeInUp" :style="{animationDelay: '0.2s'}">
                      <el-input
                        v-model="lateFilePath"
                        placeholder="请选择后期文件"
                        readonly
                        clearable
                        @clear="handleRemoveFile('late')"
                        @keydown.delete="handleKeydown($event, 'late')"
                        @focus="handleInputFocus('late')"
                      >
                        <template #append>
                          <el-button @click="handleLateBrowseClick" class="browse-button">
                            浏览
                          </el-button>
                        </template>
                      </el-input>
                      <input
                        type="file"
                        ref="lateFileInput"
                        @change="handleLateFileSelect"
                        accept=".tif,.zip,.rar"
                        class="file-input-hidden"
                      />
                    </div>
                  </el-form-item>

                  <!-- 文件状态提示 - 添加动画 -->
                  <el-form-item label="文件状态">
                    <div class="file-status animate__animated animate__fadeInUp" :style="{animationDelay: '0.3s'}">
                      <div v-if="earlyFileObject" class="status-item success">
                        <el-icon color="#67C23A"><Check /></el-icon>
                        <span>早期文件: {{ earlyFilePath }} ({{ (earlyFileObject.size / 1024 / 1024).toFixed(2) }} MB)</span>
                      </div>
                      <div v-else class="status-item error">
                        <el-icon color="#F56C6C"><Close /></el-icon>
                        <span>未选择早期文件</span>
                      </div>
                      <div v-if="lateFileObject" class="status-item success">
                        <el-icon color="#67C23A"><Check /></el-icon>
                        <span>后期文件: {{ lateFilePath }} ({{ (lateFileObject.size / 1024 / 1024).toFixed(2) }} MB)</span>
                      </div>
                      <div v-else class="status-item error">
                        <el-icon color="#F56C6C"><Close /></el-icon>
                        <span>未选择后期文件</span>
                      </div>
                    </div>
                  </el-form-item>

                  <!-- 水体标签值 - 添加动画 -->
                  <el-form-item label="水体标签值：" prop="waterTagValue">
                    <div class="center-content animate__animated animate__fadeInUp" :style="{animationDelay: '0.4s'}">
                      <el-input-number
                        v-model="form.waterTagValue"
                        :min="0"
                        :max="255"
                        step="1"
                        placeholder="请输入水体标签值（0-255）"
                        class="water-tag-input"
                      />
                    </div>
                    <div class="input-hint animate__animated animate__fadeIn" :style="{animationDelay: '0.5s'}">
                      注：代表水体的像素值，通常为0-255之间的整数
                    </div>
                  </el-form-item>

                  <!-- 预测参数选项 - 添加动画 -->
                  <el-form-item label="预测参数">
                    <div class="center-content animate__animated animate__fadeInUp" :style="{animationDelay: '0.6s'}">
                      <el-checkbox-group v-model="predictOptions" class="checkbox-group">
                        <el-checkbox label="change_stats" class="animate__animated animate__fadeIn" :style="{animationDelay: '0.65s'}">变化统计</el-checkbox>
                        <el-checkbox label="change_image" class="animate__animated animate__fadeIn" :style="{animationDelay: '0.7s'}">变化预览</el-checkbox>
                        <el-checkbox label="change_tif" class="animate__animated animate__fadeIn" :style="{animationDelay: '0.75s'}">变化结果下载</el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </el-form-item>

                  <!-- 按钮组 - 添加动画 -->
                  <div class="button-group animate__animated animate__fadeInUp" :style="{animationDelay: '0.8s'}">
                    <el-button
                      @click="handlePredict"
                      class="submit-button"
                      type="primary"
                      :loading="predictLoading"
                      :disabled="!earlyFileObject || !lateFileObject"
                      :class="{'animate__animated animate__pulse animate__infinite': earlyFileObject && lateFileObject && !predictLoading}"
                    >
                      {{ predictLoading ? '上传并预测中...' : '开始预测' }}
                    </el-button>
                  </div>
                </div>
              </div>
            </el-form>
          </div>

          <!-- 预测结果页面 - 添加切换动画 -->
          <div class="result-container" v-else-if="predictCurrent === 1">
            <div class="result-content">
              <!-- 结果内容区域 - 真正的左右布局 -->
              <div class="result-layout">
                <!-- 左边：变化统计 - 添加动画 -->
                <div class="result-panel stats-panel animate__animated animate__fadeInLeft" :style="{animationDelay: '0.1s'}">
                  <h3 class="animate__animated animate__fadeIn">变化统计</h3>
                  <div class="stats-grid">
                    <div 
                      v-for="(value, key, index) in changeStats" 
                      :key="key" 
                      class="stat-card animate__animated animate__fadeInUp"
                      :style="{animationDelay: `${0.2 + index * 0.1}s`}"
                    >
                      <span class="stat-label">{{ key }}：</span>
                      <span class="stat-value">面积: {{ value.area }} ㎡, 比例: {{ (value.ratio * 100).toFixed(2) }}%</span>
                    </div>
                  </div>
                  <div class="download-section" v-if="predictOptions.includes('change_stats')">
                    <h3 class="animate__animated animate__fadeIn">统计文件下载</h3>
                    <el-button 
                      @click="downloadStatsFile" 
                      type="primary" 
                      plain 
                      icon="Download" 
                      class="download-button animate__animated animate__fadeInUp"
                      :style="{animationDelay: '0.5s'}"
                    >
                      下载统计文件
                    </el-button>
                  </div>
                </div>

                <!-- 右边：变化图像 - 添加动画 -->
                <div class="result-panel image-panel animate__animated animate__fadeInRight" :style="{animationDelay: '0.2s'}">
                  <div v-if="previewData && predictOptions.includes('change_image')" class="image-container">
                    <img 
                      :src="previewData" 
                      alt="变化结果预览" 
                      class="preview-image animate__animated animate__fadeIn"
                      @load="onImagePreviewLoad"
                    />
                    <el-button 
                      @click="openImageDialog" 
                      type="primary" 
                      plain 
                      class="view-image-button animate__animated animate__fadeInUp"
                      :style="{animationDelay: '0.3s'}"
                    >
                      <el-icon><ZoomIn /></el-icon>
                      查看大图
                    </el-button>
                  </div>
                  <div v-else class="no-data animate__animated animate__fadeIn">
                    <el-icon><Picture /></el-icon>
                    <div>暂无预览图</div>
                  </div>
                  <div class="download-section" v-if="predictOptions.includes('change_tif')">
                    <h3 class="animate__animated animate__fadeIn">变化地图下载</h3>
                    <el-button 
                      @click="downloadTifFile" 
                      type="primary" 
                      plain 
                      icon="Download" 
                      class="download-button animate__animated animate__fadeInUp"
                      :style="{animationDelay: '0.4s'}"
                    >
                      下载变化地图
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 - 添加动画 -->
              <div class="action-buttons animate__animated animate__fadeInUp" :style="{animationDelay: '0.6s'}">
                <el-button @click="handlePredictPrevious" icon="Back" class="animate__animated animate__fadeIn" :style="{animationDelay: '0.65s'}">
                  上一步
                </el-button>
                <el-button @click="handlePredictContinue" type="primary" icon="Refresh" class="animate__animated animate__fadeIn" :style="{animationDelay: '0.7s'}">
                  继续预测
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 大图预览对话框 - 添加动画 -->
      <el-dialog 
        v-model="imageDialogVisible" 
        title="预览大图" 
        width="90%" 
        :destroy-on-close="true"
        :modal-append-to-body="false"
      >
        <div class="full-image-container">
          <img 
            :src="previewData" 
            alt="完整预览" 
            class="full-size-image animate__animated animate__fadeIn" 
            @load="onImageLoad" 
          />
          <div v-if="isImageLoaded" class="zoom-controls animate__animated animate__fadeInUp">
            <el-button @click="zoomIn" icon="ZoomIn" circle size="small" class="animate__animated animate__pulse animate__infinite" />
            <el-button @click="zoomOut" icon="ZoomOut" circle size="small" class="animate__animated animate__pulse animate__infinite" />
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { Check, Picture, Download, Back, Refresh, ZoomIn, ZoomOut, Close } from '@element-plus/icons-vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElIcon,
  ElCheckbox,
  ElCheckboxGroup,
  ElDialog
  
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

// 新增：水体标签值状态
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

// 预测处理
const handlePredict = async () => {
  if (!earlyFileObject.value || !lateFileObject.value) {
    message.error('请上传早期和后期文件')
    return
  }
  if (!earlyFileObject.value.size || !lateFileObject.value.size) {
    message.error('文件内容为空，请重新选择')
    return
  }

  // 新增：验证水体标签值
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
    
    // 新增：添加水体标签值参数
    formData.append('waterTagValue', form.value.waterTagValue.toString())
    
    predictOptions.value.forEach(option => {
      formData.append(option, 'True')
    })

    const res = await getWaterChangeResult(formData)
    const response = res?.response?.value || res?.value || res

    if (response?.code === 'SUCCESS') {
      message.success('预测完成')
      const body = response.body
      changeStats.value = body.stats
      downloadFiles.value = {
        stats_file: body.stats_file.replace(/\\/g, '/'),
        image_file: body.image_file.replace(/\\/g, '/'),
        tif_file: body.tif_file.replace(/\\/g, '/')
      }
      if (body.image_file) {
        await loadPreviewImage(body.image_file.replace(/\\/g, '/'))
      }
      predictCurrent.value = 1
    } else {
      const msg = response?.msg || '预测失败'
      error.value = msg
      message.error(msg)
    }
  } catch (err) {
    console.error('预测失败:', err)
    error.value = '预测失败: ' + err.message
    message.error('预测失败: ' + err.message)
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
        // 触发重新登录逻辑
        // window.location.href = '/login'
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
    isImageLoaded.value = false // 重置加载状态
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      isImageLoaded.value = true
      console.log('图片成功加载')
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

// 图片预览加载完成后的动画
const onImagePreviewLoad = () => {
  // 图片加载完成后添加一个轻微的脉冲效果
  const img = document.querySelector('.preview-image')
  if (img) {
    img.classList.add('animate__pulse')
    setTimeout(() => {
      img.classList.remove('animate__pulse')
    }, 1000)
  }
}

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
      // 触发重新登录逻辑
      // window.location.href = '/login'
    } else {
      message.error('下载失败: ' + error.message)
    }
  }
}

const handlePredictPrevious = () => {
  if (predictCurrent.value > 0) predictCurrent.value -= 1
}

const handlePredictContinue = () => {
  predictCurrent.value = 0
  earlyFilePath.value = ''
  lateFilePath.value = ''
  earlyFileObject.value = null
  lateFileObject.value = null
  changeStats.value = {}
  downloadFiles.value = { stats_file: '', image_file: '', tif_file: '' }
  previewData.value = ''
  isImageLoaded.value = false
  zoomLevel.value = 1
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
  zoomLevel.value = Math.min(zoomLevel.value + 0.1, 2) // 最大2倍
  applyZoom()
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.1) // 最小0.1倍
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
/* 导入animate.css - 确保在使用前已安装 */
@import 'animate.css';

/* 基础样式 */
.feature-container {
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
  padding: 0 15px;
  box-sizing: border-box;
}

/* 步骤条样式 */
.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto;
  width: 100%;
}

.custom-steps {
  display: flex;
  width: 100%;
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
  transition: all 0.3s ease;
}

.step-title {
  font-size: 14px;
  color: #999;
  text-align: center;
  transition: all 0.3s ease;
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
  width: 100%;
  margin: 30px 0;
  padding: 0 10px;
  box-sizing: border-box;
}

/* 居中对齐相关样式 */
.center-form {
  display: flex;
  justify-content: center;
}

.center-form-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.center-form-item :deep(.el-form-item__label) {
  text-align: center;
  width: 100%;
  margin-bottom: 10px;
  font-weight: bold;
  color: #606266;
}

.center-content {
  display: flex;
  justify-content: center;
  width: 100%;
}

.center-input {
  max-width: 400px;
  width: 100%;
}

.center-water-input {
  max-width: 200px;
  width: 100%;
}

.center-hint {
  text-align: center;
  width: 100%;
  margin-top: 8px;
}

.center-checkbox-group {
  justify-content: center;
}

.status-form-item {
  margin-top: -10px;
  margin-bottom: 20px;
}

.center-status-item {
  justify-content: center;
  text-align: center;
}

/* 文件输入样式 */
.file-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.file-input-hidden {
  display: none;
}

.browse-button {
  background-color: #409eff;
  color: white;
  border: none;
  min-width: 60px;
  transition: all 0.3s ease;
}

.browse-button:hover {
  background-color: #79bbff;
  transform: scale(1.05);
}

/* 文件状态 */
.file-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 5px 10px;
  background: #f5f7fa;
  border-radius: 4px;
  min-width: 300px;
  justify-content: center;
  transition: all 0.3s ease;
}

.status-item.success {
  border-left: 3px solid #67C23A;
}

.status-item.error {
  border-left: 3px solid #F56C6C;
}

.status-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 水体标签值输入 */
.water-tag-input {
  width: 100%;
  max-width: 200px;
}

.input-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

/* 复选框组 */
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.checkbox-group .el-checkbox {
  transition: all 0.3s ease;
}

.checkbox-group .el-checkbox:hover {
  transform: scale(1.05);
  color: #409eff;
}

/* 按钮组 */
.button-group {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  width: 100%;
}

.submit-button {
  padding: 10px 25px;
  background-color: #1890ff;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  width: 100%;
  max-width: 200px;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24,144,255,0.4);
}

.submit-button:active {
  transform: translateY(0);
}

/* 结果容器 */
.result-container {
  margin: 20px auto;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 结果布局 */
.result-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  width: 100%;
  flex-wrap: wrap;
}

.result-panel {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  flex: 1;
  min-width: 300px;
  transition: all 0.3s ease;
}

.result-panel:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.stats-panel {
  flex: 1.5;
}

.image-panel {
  flex: 1.5;
  text-align: center;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  gap: 15px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  gap: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #1890ff;
}

.stat-label {
  font-weight: bold;
  color: #606266;
}

.stat-value {
  color: #303133;
}

/* 图片容器 */
.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  object-fit: contain;
  transition: all 0.3s ease;
  cursor: pointer;
}

.preview-image:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.view-image-button,
.download-button {
  width: 100%;
  margin-top: 10px;
  transition: all 0.3s ease;
}

.view-image-button:hover,
.download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64,158,255,0.3);
}

/* 无数据状态 */
.no-data {
  color: #909399;
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.no-data:hover {
  transform: scale(1.02);
  color: #606266;
}

.no-data .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 下载区域 */
.download-section {
  margin-top: 25px;
}

.download-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  text-align: center;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  width: 100%;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  transition: all 0.3s ease;
  min-width: 120px;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 大图预览 */
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

.zoom-controls .el-button {
  transition: all 0.3s ease;
}

.zoom-controls .el-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* 响应式断点 */
@media (max-width: 1200px) {
  .feature-container {
    max-width: 100%;
    padding: 0 20px;
  }
  
  .result-layout {
    gap: 15px;
  }
  
  .result-panel {
    min-width: 280px;
  }
}

@media (max-width: 992px) {
  .form-container {
    margin: 20px 0;
  }
  
  .custom-steps {
    max-width: 90%;
  }
  
  .file-input-wrapper {
    max-width: 100%;
  }
  
  .result-layout {
    flex-direction: column;
  }
  
  .result-panel {
    width: 100%;
    min-width: unset;
  }
  
  .full-image-container {
    height: 60vh;
  }
}

@media (max-width: 768px) {
  .feature-container {
    padding: 0 15px;
  }
  
  .steps-container {
    margin: 20px auto;
  }
  
  .step-number {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
  
  .step-title {
    font-size: 13px;
  }
  
  .step-item:not(:last-child):after {
    top: 17.5px;
  }
  
  .form-container {
    margin: 15px 0;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
    margin-bottom: 5px;
    display: block;
    width: 100%;
  }
  
  :deep(.el-form-item__content) {
    width: 100%;
  }
  
  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-card {
    flex-direction: column;
    gap: 5px;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  .full-image-container {
    height: 50vh;
  }
  
  .button-group {
    margin-top: 20px;
  }
  
  .submit-button {
    max-width: 100%;
  }
  
  .water-tag-input {
    max-width: 100%;
  }
  
  .center-form-item :deep(.el-form-item__label) {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .center-input {
    max-width: 100%;
  }
  
  .center-water-input {
    max-width: 100%;
  }
  
  .status-item {
    min-width: 250px;
    font-size: 13px;
  }
}

@media (max-width: 576px) {
  .feature-container {
    padding: 0 10px;
  }
  
  .step-number {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
  
  .step-title {
    font-size: 12px;
  }
  
  .step-item:not(:last-child):after {
    top: 15px;
  }
  
  .result-panel {
    padding: 15px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .no-data {
    padding: 30px 20px;
  }
  
  .no-data .el-icon {
    font-size: 36px;
  }
  
  .full-image-container {
    height: 40vh;
  }
  
  .status-item {
    min-width: 200px;
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .center-form-item :deep(.el-form-item__label) {
    font-size: 13px;
  }
}

/* 高分辨率适配 */
@media (min-width: 1920px) {
  .feature-container {
    max-width: 1400px;
  }
  
  .result-layout {
    gap: 30px;
  }
  
  .result-panel {
    padding: 30px;
  }
  
  .preview-image {
    max-height: 500px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .browse-button,
  .submit-button,
  .view-image-button,
  .download-button,
  .action-buttons .el-button {
    min-height: 44px;
  }
  
  .step-number {
    width: 44px;
    height: 44px;
  }
  
  .step-item:not(:last-child):after {
    top: 22px;
  }
}
</style>