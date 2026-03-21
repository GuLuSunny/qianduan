<template>
  <div class="water-identification-wrapper">
    <!-- 水体识别功能 -->
    <div class="feature-container">
      <!-- 自定义步骤条 -->
      <div class="steps-container">
        <div class="custom-steps">
          <div :class="['step-item', { 'active': predictCurrent === 0 }]">
            <div class="step-number">1</div>
            <div class="step-title">选择模型和参数</div>
          </div>
          <div :class="['step-item', { 'active': predictCurrent === 1 }]">
            <div class="step-number">2</div>
            <div class="step-title">生产结果</div>
          </div>
        </div>
      </div>

      <!-- 选择模型和参数页面 -->
      <div class="form-container" v-if="predictCurrent === 0">
        <el-form :model="form" label-width="120px">
          <div class="form-content">
            <!-- 数据类型选择 -->
            <el-form-item label="数据类型：" required>
              <el-radio-group v-model="dataType" class="radio-group" @change="handleDataTypeChange">
                <el-radio :label="1">SAR单模态</el-radio>
                <el-radio :label="2">光学单模态</el-radio>
                <el-radio :label="3">融合多模态</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 文件上传区域 -->
            <div class="upload-section">
              <!-- SAR单模态文件上传 -->
              <div class="file-upload-row">
                <span class="file-label">SAR单模态：</span>
                <div class="file-input-wrapper">
                  <el-input 
                    v-model="sarFilePath" 
                    placeholder="请选择SAR文件" 
                    readonly 
                    clearable
                    @clear="handleRemoveFile('sar')" 
                    @keydown.delete="handleKeydown($event, 'sar')"
                    @focus="handleInputFocus('sar')"
                    :disabled="isSarDisabled" 
                  >
                    <template #append>
                      <el-button @click="handleSarBrowseClick" :disabled="isSarDisabled">
                        浏览
                      </el-button>
                    </template>
                  </el-input>
                  <input 
                    type="file" 
                    ref="sarFileInput" 
                    @change="handleSarFileSelect" 
                    accept=".tif,.zip,.rar" 
                    class="file-input-hidden"
                    :disabled="isSarDisabled"
                  />
                </div>
              </div>
              
              <!-- 光学单模态文件上传 -->
              <div class="file-upload-row">
                <span class="file-label">光学单模态：</span>
                <div class="file-input-wrapper">
                  <el-input 
                    v-model="opticalFilePath" 
                    placeholder="请选择光学文件" 
                    readonly 
                    clearable
                    @clear="handleRemoveFile('optical')"
                    @keydown.delete="handleKeydown($event, 'optical')"
                    @focus="handleInputFocus('optical')"
                    :disabled="isOpticalDisabled"
                  >
                    <template #append>
                      <el-button @click="handleOpticalBrowseClick" :disabled="isOpticalDisabled">
                        浏览
                      </el-button>
                    </template>
                  </el-input>
                  <input 
                    type="file" 
                    ref="opticalFileInput" 
                    @change="handleOpticalFileSelect" 
                    accept=".tif,.zip,.rar" 
                    class="file-input-hidden"
                    :disabled="isOpticalDisabled"
                  />
                </div>
              </div>
            </div>

            <el-form-item label="可用模型" :required="true">
              <el-select 
                v-model="selectedModel" 
                placeholder="请选择生产模型" 
                class="model-select"
                @change="handleModelChange"
              >
                <el-option v-for="model in models" :key="model.id" :label="model.modelInfo || model.modelName"
                  :value="model.modelName"></el-option>
              </el-select>
            </el-form-item>

            <!-- 生产参数选项 -->
            <el-form-item label="生产参数">
              <el-checkbox-group v-model="predictOptions" class="checkbox-group">
                <el-checkbox label="preview_png">预览图</el-checkbox>
                <el-checkbox label="class_stats">检测参数</el-checkbox>
                <el-checkbox label="result_file_download">结果文件下载</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <!-- 文件选择状态提示 -->
            <el-form-item label="文件状态">
              <div class="file-status">
                <div v-if="sarFileObject" class="status-item">
                  <el-icon color="#67C23A"><Check /></el-icon>
                  <span class="status-text">SAR文件: {{ sarFilePath }} ({{ (sarFileObject.size / 1024 / 1024).toFixed(2) }} MB)</span>
                </div>
                <div v-else class="status-item">
                  <el-icon color="#F56C6C"><Close /></el-icon>
                  <span class="status-text">未选择SAR文件</span>
                </div>
                <div v-if="opticalFileObject" class="status-item">
                  <el-icon color="#67C23A"><Check /></el-icon>
                  <span class="status-text">光学文件: {{ opticalFilePath }} ({{ (opticalFileObject.size / 1024 / 1024).toFixed(2) }} MB)</span>
                </div>
                <div v-else class="status-item">
                  <el-icon color="#F56C6C"><Close /></el-icon>
                  <span class="status-text">未选择光学文件</span>
                </div>
              </div>
            </el-form-item>
            
            <div class="button-group">
              <el-button 
                @click="handlePredict" 
                class="submit-button" 
                type="primary" 
                :loading="predictLoading"
                :disabled="!selectedModel || !isFileSelectionValid"
              >
                {{ predictLoading ? '上传并生产中...' : '开始生产' }}
              </el-button>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 生产结果页面 -->
      <div class="result-container" v-if="predictCurrent === 1">
        <div class="result-content">
          <!-- 结果内容区域 -->
          <div class="result-grid">
            <!-- 左边：检测参数 -->
            <div class="result-card">
              <h3 class="result-title">检测参数</h3>
              <div class="params-grid">
                <div class="param-item">
                  <span class="param-label">面积：</span>
                  <span class="param-value">{{ detectionData.area }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">周长：</span>
                  <span class="param-value">{{ detectionData.perimeter }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">覆盖率：</span>
                  <span class="param-value">{{ detectionData.coverage_rate }}%</span>
                </div>
                <div class="param-item">
                  <span class="param-label">日期：</span>
                  <span class="param-value">{{ detectionData.date }}</span>
                </div>
              </div>
              
              <div class="download-section">
                <h3 class="result-title">结果文件下载</h3>
                <el-button @click="downloadPrediction" type="primary" plain :icon="Download" class="download-button">
                  下载生产结果
                </el-button>
              </div>
            </div>

            <!-- 右边：预览图 -->
            <div class="result-card">
              <h3 class="result-title">预览图</h3>
              <div class="preview-container">
                <div v-if="previewData" class="preview-image-wrapper">
                  <img :src="previewData" alt="生产结果预览" class="preview-image" />
                  <el-button @click="openImageDialog" type="primary" plain class="view-large-button">
                    <el-icon><ZoomIn /></el-icon>
                    查看大图
                  </el-button>
                </div>
                <div v-else class="no-preview">
                  <el-icon class="no-preview-icon"><Picture /></el-icon>
                  <div>暂无预览图</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="result-actions">
            <el-button @click="handlePredictPrevious" :icon="Back">
              上一步
            </el-button>
            <el-button @click="handlePredictContinue" type="primary" :icon="Refresh">
              继续生产
            </el-button>
          </div>
        </div>
      </div>

      <!-- 大图预览对话框 -->
      <el-dialog v-model="imageDialogVisible" title="预览大图" width="85%">
        <div class="full-image-container">
          <img :src="previewData" alt="完整预览" class="full-size-image" />
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { Check, Picture, Download, Back, Refresh, ZoomIn, Close } from '@element-plus/icons-vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElLoading,
  ElIcon,
  ElRadioGroup,
  ElRadio,
  ElCheckbox,
  ElCheckboxGroup,
  ElSelect,
  ElOption,
  ElDialog
} from 'element-plus'
import { 
  modelFilesUpload, 
  getModelByClassName, 
  getWaterResult
} from '@/api/getData'

// 数据类型选择
const dataType = ref(1) 

// 计算属性：根据数据类型禁用文件选择
const isSarDisabled = computed(() => dataType.value === 2)
const isOpticalDisabled = computed(() => dataType.value === 1)

// 计算属性：检查文件选择是否有效
const isFileSelectionValid = computed(() => {
  if (dataType.value === 1) {
    return !!sarFileObject.value
  } else if (dataType.value === 2) {
    return !!opticalFileObject.value
  } else if (dataType.value === 3) {
    return !!sarFileObject.value && !!opticalFileObject.value
  }
  return false
})

// 文件上传相关状态
const sarFilePath = ref('')
const opticalFilePath = ref('')
const sarFileObject = ref(null)
const opticalFileObject = ref(null)
const sarFileInput = ref(null)
const opticalFileInput = ref(null)
const focusedInput = ref('')

// 识别功能相关状态
const predictCurrent = ref(0)
const models = ref([])
const selectedModel = ref('')
// 默认勾选所有生产参数
const predictOptions = ref(['preview_png', 'class_stats', 'result_file_download'])
const detectionData = ref({
  area: '0 km²',
  perimeter: '0 km',
  coverage_rate: '0',
  date: new Date().toISOString().split('T')[0]
})
const previewData = ref('')
const predictLoading = ref(false)
const imageDialogVisible = ref(false)

// 处理数据类型变化
const handleDataTypeChange = (newDataType) => {
  // 清空不符合当前数据类型的文件
  if (newDataType === 1) {
    // SAR单模态，清空光学文件
    handleRemoveFile('optical')
  } else if (newDataType === 2) {
    // 光学单模态，清空SAR文件
    handleRemoveFile('sar')
  }
  // 多模态不清空任何文件
}

// 处理模型变化
const handleModelChange = (newModel) => {
  if (!newModel) return
  
  // 清空所有已上传的文件
  handleRemoveFile('sar')
  handleRemoveFile('optical')
  
  // 根据新模型的功能更新生产参数
  const currentModel = models.value.find(m => m.modelName === newModel)
  if (currentModel && currentModel.functions) {
    const availableFunctions = currentModel.functions.split(',')
    // 只保留当前模型支持的功能
    predictOptions.value = predictOptions.value.filter(option => 
      availableFunctions.includes(option)
    )
  }
}

// 文件上传方法
const handleInputFocus = (type) => {
  focusedInput.value = type
}

const handleSarBrowseClick = () => {
  if (isSarDisabled.value) return
  if (sarFileInput.value) {
    sarFileInput.value.click()
  }
}

const handleOpticalBrowseClick = () => {
  if (isOpticalDisabled.value) return
  if (opticalFileInput.value) {
    opticalFileInput.value.click()
  }
}

const handleSarFileSelect = (event) => {
  if (isSarDisabled.value) return
  const file = event.target.files[0]
  if (file) {
    const isValid = beforeUpload(file)
    if (isValid === false) {
      event.target.value = ''
      return
    }
    
    sarFilePath.value = file.name
    sarFileObject.value = file
    event.target.value = ''
  }
}

const handleOpticalFileSelect = (event) => {
  if (isOpticalDisabled.value) return
  const file = event.target.files[0]
  if (file) {
    const isValid = beforeUpload(file)
    if (isValid === false) {
      event.target.value = ''
      return
    }
    
    opticalFilePath.value = file.name
    opticalFileObject.value = file
    event.target.value = ''
  }
}

const handleRemoveFile = (type) => {
  if (type === 'sar') {
    sarFilePath.value = ''
    sarFileObject.value = null
    sarFileInput.value && (sarFileInput.value.value = '')
  } else if (type === 'optical') {
    opticalFilePath.value = ''
    opticalFileObject.value = null
    opticalFileInput.value && (opticalFileInput.value.value = '')
  }
}

const handleKeydown = (event, type) => {
  const isDelete = event.key === 'Delete' || event.keyCode === 46
  const isBackspace = event.key === 'Backspace' || event.keyCode === 8
  
  if (isDelete || isBackspace) {
    event.preventDefault()
    event.stopPropagation()
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

// 监听选择的模型变化
watch(selectedModel, (newVal) => {
  if (!newVal) return
  
  const currentModel = models.value.find(m => m.modelName === newVal)
  if (!currentModel || !currentModel.functions) return
  
  const availableFunctions = currentModel.functions.split(',')
  // 默认勾选所有可用的功能
  predictOptions.value = availableFunctions.filter(option => 
    ['preview_png', 'class_stats', 'result_file_download'].includes(option)
  )
})

// 打开大图对话框
const openImageDialog = () => {
  imageDialogVisible.value = true
}

// 初始化
onMounted(() => {
  fetchModels()
})

// 获取模型数据
const fetchModels = () => {
  getModelByClassName({ className: "water" })
    .then((res) => {
      const response = res?.response?.value || res?.value || res

      if (response?.code === 'SUCCESS') {
        models.value = response?.body || []

        if (models.value.length > 0) {
          selectedModel.value = models.value[0].modelName
          
          // 根据第一个模型的功能设置默认生产参数
          const firstModel = models.value[0]
          if (firstModel.functions) {
            const availableFunctions = firstModel.functions.split(',')
            predictOptions.value = availableFunctions.filter(option => 
              ['preview_png', 'class_stats', 'result_file_download'].includes(option)
            )
          }
        } else {
          message.warning('未找到可用模型')
        }
      } else {
        const msg = response?.msg || '获取模型失败'
        message.error(msg)
      }
    })
    .catch((error) => {
      console.error('请求失败:', error)
      message.error('请求失败: ' + error.message)
    })
}

// 处理生产请求
const handlePredict = async () => {
  if (!selectedModel.value) {
    message.error('请选择生产模型')
    return
  }

  // 根据数据类型检查文件
  if (dataType.value === 1 && !sarFileObject.value) {
    message.error('请选择SAR文件')
    return
  }
  
  if (dataType.value === 2 && !opticalFileObject.value) {
    message.error('请选择光学文件')
    return
  }
  
  if (dataType.value === 3 && (!sarFileObject.value || !opticalFileObject.value)) {
    message.error('请选择SAR和光学文件')
    return
  }

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    message.error('用户信息未找到，请重新登录')
    return
  }

  const userinfo = JSON.parse(userData)

  predictLoading.value = true

  try {
    // 创建FormData对象，直接传递文件
    const formData = new FormData()
    formData.append('model', selectedModel.value)
    
    // 根据数据类型添加文件
    if (sarFileObject.value) {
      formData.append('sarFile', sarFileObject.value)
    }
    if (opticalFileObject.value) {
      formData.append('optFile', opticalFileObject.value)
    }
    
    // 添加生产参数
    formData.append('predictOptions', JSON.stringify(predictOptions.value))
    
    formData.append('userName', userinfo.username)
    formData.append('createUserId', userinfo.id)

    const res = await getWaterResult(formData)
    const response = res?.response?.value || res?.value || res

    if (response?.code === 'SUCCESS') {
      message.success('生产完成')
      
      // 保存检测参数数据
      if (response.body && response.body.length > 0) {
        detectionData.value = response.body[0]
        
        // 加载预览图
        if (response.body[0].image_png) {
          await loadPreviewImage(response.body[0].image_png)
        }
      }
      
      predictCurrent.value = 1
    } else {
      const msg = response?.msg || '生产失败'
      message.error(msg)
    }
  } catch (err) {
    console.error('生产失败:', err)
    message.error('生产失败: ' + err.message)
  } finally {
    predictLoading.value = false
  }
}

const loadPreviewImage = async (imagePath) => {
  if (!imagePath) {
    previewData.value = '';
    return;
  }
  
  try {
    const timestamp = Date.now();
    const response = await fetch(`/api/proxy/preview?t=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Accept': 'image/*'
      },
      body: JSON.stringify({ imagePath })
    });
    
    if (!response.ok) {
      previewData.value = '';
      return;
    }

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.startsWith('image/')) {
      previewData.value = '';
      return;
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      previewData.value = '';
      return;
    }

    const imageUrl = URL.createObjectURL(blob);
    previewData.value = imageUrl;
    
    return () => URL.revokeObjectURL(imageUrl);
  } catch (error) {
    console.error('加载预览图失败:', error);
    previewData.value = '';
  }
}

// 下载生产结果文件
const downloadPrediction = async () => {
  if (!detectionData.value || !detectionData.value.prediction) {
    message.error('没有可下载的生产结果文件');
    return;
  }

  const predictionPath = detectionData.value.prediction;
  const fileName = predictionPath.split(/[\\/]/).pop() || 'prediction.tif';
  
  try {
    const timestamp = Date.now();
    const response = await fetch(`/api/proxy/download?t=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({
        filePath: predictionPath,
        fileName: fileName
      })
    });
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }

    const blob = await response.blob();
    
    if (blob.size < 10) {
      throw new Error('文件大小异常');
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    let finalFileName = fileName;
    if (contentDisposition && contentDisposition.includes('filename=')) {
      const matches = contentDisposition.match(/filename="([^"]+)"/);
      if (matches && matches[1]) {
        finalFileName = matches[1];
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message.success(`下载完成，文件大小: ${(blob.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('下载失败:', error);
    message.error('下载失败: ' + error.message);
  }
}

// 上一步
const handlePredictPrevious = () => {
  if (predictCurrent.value > 0) {
    predictCurrent.value -= 1
  }
}

// 继续生产
const handlePredictContinue = () => {
  predictCurrent.value = 0
}
</script>

<style scoped>
.water-identification-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 功能容器 */
.feature-container {
  margin: 0 auto;
  max-width: 900px;
}

/* 步骤容器 */
.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto;
  width: 100%;
  max-width: 600px;
}

/* 自定义步骤条样式 */
.custom-steps {
  display: flex;
  width: 100%;
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
  margin: 30px auto 40px;
  width: 100%;
  max-width: 800px;
}

.form-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.radio-group {
  display: flex;
  gap: 20px;
}

.upload-section {
  margin: 20px 0;
}

.file-upload-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.file-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  width: 100px;
}

.file-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.file-input-hidden {
  display: none;
}

.model-select {
  width: 100%;
}

.checkbox-group {
  display: flex;
  gap: 20px;
}

.file-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 500px;
}

/* 按钮组 */
.button-group {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.submit-button {
  padding: 10px 40px;
  background-color: #1890ff;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  font-size: 16px;
}

.submit-button:hover {
  background-color: #40a9ff;
}

/* 结果容器 */
.result-container {
  margin: 20px auto;
  max-width: 800px;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  margin-bottom: 30px;
}

.result-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  min-width: 0;
}

.result-title {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.params-grid {
  display: grid;
  gap: 12px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.param-label {
  font-weight: 600;
  color: #606266;
}

.param-value {
  color: #303133;
}

.download-section {
  margin-top: 25px;
}

.download-button {
  width: 100%;
}

.preview-container {
  text-align: center;
}

.preview-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
}

.view-large-button {
  width: 100%;
}

.no-preview {
  color: #909399;
  padding: 40px 0;
  text-align: center;
}

.no-preview-icon {
  font-size: 48px;
  margin-bottom: 10px;
  color: #dcdfe6;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.full-image-container {
  width: 100%;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.full-size-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .water-identification-wrapper {
    max-width: 800px;
    padding: 0 15px;
  }
  
  .feature-container {
    max-width: 700px;
  }
  
  .form-container {
    max-width: 650px;
  }
  
  .result-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .file-upload-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .file-label {
    width: auto;
  }
  
  .status-text {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .water-identification-wrapper {
    max-width: 600px;
    padding: 0 10px;
  }
  
  .feature-container {
    max-width: 550px;
  }
  
  .form-container {
    max-width: 500px;
  }
  
  .step-item:not(:last-child):after {
    top: 15px;
  }
  
  .step-number {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
  
  .step-title {
    font-size: 12px;
  }
  
  .form-content {
    padding: 15px;
  }
  
  .status-text {
    max-width: 200px;
  }
  
  .el-dialog {
    width: 95% !important;
  }
}
</style>