<template>
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
          <div class="step-title">预测结果</div>
        </div>
      </div>
    </div>

    <!-- 选择模型和参数页面 -->
    <div class="form-container" v-if="predictCurrent === 0">
      <el-form :model="form" label-width="140px">
        <div class="form-horizontal-group">
          <!-- 表单列 -->
          <div class="form-column-full">
            <el-form-item label="可用模型" :required="true">
              <el-select v-model="selectedModel" placeholder="请选择预测模型">
                <el-option v-for="model in models" :key="model.id" :label="model.modelInfo || model.modelName"
                  :value="model.modelName"></el-option>
              </el-select>
            </el-form-item>

            <!-- 添加观测日期字段 -->
            <el-form-item label="观测日期：" required>
              <el-date-picker 
                v-model="observationDate" 
                type="date" 
                placeholder="选择日期" 
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              ></el-date-picker>
            </el-form-item>

            <!-- 预测参数选项 -->
            <el-form-item label="预测参数">
              <el-checkbox-group v-model="predictOptions">
                <el-checkbox 
                  v-for="option in allPredictOptions" 
                  :key="option.value"
                  :label="option.value"
                  :disabled="!isOptionAvailable(option.value, 'predict')"
                >
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <!-- 添加颜色选择器 -->
            <el-form-item 
              label="类别颜色" 
              v-if="predictOptions.includes('preview_png') && isOptionAvailable('preview_png', 'predict')"
            >
              <div class="color-picker-container">
                <div v-for="(color, classId) in colorMap" :key="classId" class="color-picker-item">
                  <span class="class-label">{{ classNames[classId] }}:</span>
                  <el-color-picker v-model="colorMap[classId]" show-alpha :predefine="predefineColors" />
                </div>
              </div>
            </el-form-item>

            <div class="button-group">
              <el-button @click="handlePredict" class="submit-button" type="primary" :loading="predictLoading">
                开始预测
              </el-button>
            </div>

            <!-- 结果获取参数选项 -->
            <el-divider />

            <el-form-item label="结果获取参数">
              <el-checkbox-group v-model="resultOptions">
                <el-checkbox 
                  v-for="option in allResultOptions" 
                  :key="option.value"
                  :label="option.value"
                  :disabled="!isOptionAvailable(option.value, 'result')"
                >
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 结果类型选择 -->
            <el-form-item label="结果类型" v-if="resultOptions.length > 0">
              <el-radio-group v-model="resultType">
                <el-radio label="png">PNG格式</el-radio>
                <el-radio label="tif">TIF格式</el-radio>
              </el-radio-group>
            </el-form-item>

            <div class="button-group">
              <el-button @click="fetchResultFiles" type="success" :loading="loadingResults" :disabled="!selectedModel || !observationDate">
                获取预测结果
              </el-button>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 预测结果页面 -->
    <div class="result-container" v-if="predictCurrent === 1">
      <div class="result-content">
        <!-- 图片展示区域 -->
        <div class="image-section" v-if="previewData">
          <div class="result-image">
            <img :src="previewData" alt="预测结果预览" />
          </div>
          <el-button @click="openImageDialog" type="primary" plain class="view-full-button">
            <el-icon>
              <ZoomIn />
            </el-icon>
            查看大图
          </el-button>
        </div>
        <div v-else class="no-image">
          <el-icon>
            <Picture />
          </el-icon>
          <span>暂无预览图</span>
        </div>
        
        <!-- 文件下载区域 -->
        <div class="download-section" v-if="hasDownloadableFiles">
          <h3>结果文件下载</h3>
          <div class="download-buttons">
            <el-button v-if="downloadFiles.confusion_matrix && isOptionAvailable('confusion_matrix', 'result')" 
                      @click="downloadFile('confusion_matrix')" type="primary" plain icon="Download">
              混淆矩阵
            </el-button>
            <el-button v-if="downloadFiles.evaluate && isOptionAvailable('evaluate', 'result')" 
                      @click="downloadFile('evaluate')" type="primary" plain icon="Download">
              评估指标
            </el-button>
            <el-button v-if="downloadFiles.result_file" 
                      @click="downloadResultFile()" type="success" plain icon="Download">
              下载结果文件 ({{ resultType.toUpperCase() }})
            </el-button>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="button-group">
          <el-button @click="handlePredictPrevious" class="cancel-button" icon="Back">
            上一步
          </el-button>
          <el-button @click="handlePredictContinue" class="submit-button" type="primary" icon="Refresh">
            继续预测
          </el-button>
        </div>
      </div>
    </div>

    <!-- 大图预览对话框 -->
    <el-dialog v-model="imageDialogVisible" title="预览大图" width="90%">
      <div class="full-image-container">
        <img :src="previewData" alt="完整预览" class="full-size-image" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { Picture, Download, Back, Refresh, ZoomIn } from '@element-plus/icons-vue'
import {
  ElForm,
  ElFormItem,
  ElButton,
  ElLoading,
  ElIcon,
  ElCheckbox,
  ElCheckboxGroup,
  ElSelect,
  ElOption,
  ElDivider,
  ElDialog,
  ElColorPicker,
  ElDatePicker,
  ElRadioGroup,
  ElRadio
} from 'element-plus'
import { 
  getModelByClassName, 
  plantCoverPredict,
  getPlantResultByType
} from '@/api/getData'

// 定义emit事件
const emit = defineEmits(['back', 'continue-predict'])

// 识别功能相关状态
const predictCurrent = ref(0)
const models = ref([])
const selectedModel = ref('')
const observationDate = ref('')
const currentModelFunctions = ref([])
const resultType = ref('png')
const pngType = ref('simple')

// 所有可用的选项配置
const allPredictOptions = ref([
  { value: 'preview_png', label: '预览图' },
  { value: 'confusion_matrix', label: '混淆矩阵' },
  { value: 'evaluate', label: '评估指标' },
  { value: 'heatmap', label: '热力图' },
])

const allResultOptions = ref([
  { value: 'preview_png', label: '预览图' },
  { value: 'confusion_matrix', label: '混淆矩阵' },
  { value: 'evaluate', label: '评估指标' }
])

const predictOptions = ref(['preview_png', 'confusion_matrix', 'evaluate', 'heatmap'])
const resultOptions = ref(['preview_png', 'confusion_matrix', 'evaluate'])
const previewData = ref('')
const downloadFiles = ref({})
const predictLoading = ref(false)
const loadingResults = ref(false)
const error = ref('')
const imageDialogVisible = ref(false)

// 颜色映射状态
const colorMap = ref({
  "-1": "#CCCCCC",
  0: '#FFFF00',
  1: '#008000',
  2: '#0000FF',
  3: '#FF0000'
})

// 预定义颜色
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577'
])

// 类别名称映射
const classNames = {
  "-1": "无效/边界区域",
  0: '植被类型1',
  1: '植被类型2', 
  2: '植被类型3',
  3: '植被类型4'
}

// 计算属性
const form = computed(() => ({
  selectedModel: selectedModel.value,
  predictOptions: predictOptions.value,
  resultOptions: resultOptions.value,
  observationDate: observationDate.value,
  resultType: resultType.value,
  pngType: pngType.value
}))

const hasDownloadableFiles = computed(() => {
  return downloadFiles.value.confusion_matrix || downloadFiles.value.evaluate || downloadFiles.value.result_file
})

// 检查选项是否可用
const isOptionAvailable = (optionValue, type) => {
  if (!selectedModel.value || currentModelFunctions.value.length === 0) return false
  
  const functionMap = {
    'preview_png': 'preview_png',
    'confusion_matrix': 'confusion_matrix',
    'evaluate': 'class_stats',
    'heatmap': 'heatmaps_summary'
  }
  
  const backendFunction = functionMap[optionValue]
  return currentModelFunctions.value.includes(backendFunction)
}

// 监听选择的模型变化
watch(selectedModel, (newVal) => {
  if (!newVal) {
    currentModelFunctions.value = []
    return
  }
  
  const currentModel = models.value.find(m => m.modelName === newVal)
  if (!currentModel || !currentModel.functions) {
    currentModelFunctions.value = []
    return
  }
  
  currentModelFunctions.value = currentModel.functions.split(',').map(func => func.trim())
  
  predictOptions.value = predictOptions.value.filter(option => 
    isOptionAvailable(option, 'predict')
  )
  
  resultOptions.value = resultOptions.value.filter(option => 
    isOptionAvailable(option, 'result')
  )
})

// 生命周期
onMounted(() => {
  fetchModels()
  const today = new Date()
  observationDate.value = today.toISOString().split('T')[0]
})

// 方法
// 获取模型数据
const fetchModels = () => {
  getModelByClassName({ className: "plant" })
    .then((res) => {
      const response = res?.response?.value || res?.value || res

      if (response?.code === 'SUCCESS') {
        models.value = response?.body || []

        if (models.value.length > 0) {
          selectedModel.value = models.value[0].modelName
          const currentModel = models.value[0]
          if (currentModel.functions) {
            currentModelFunctions.value = currentModel.functions.split(',').map(func => func.trim())
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

// 处理预测请求
const handlePredict = () => {
  if (!selectedModel.value) {
    message.error('请选择预测模型')
    return
  }

  if (!observationDate.value) {
    message.error('请选择观测日期')
    return
  }

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    message.error('用户信息未找到，请重新登录')
    return
  }

  const userinfo = JSON.parse(userData)

  const params = {
    modelName: selectedModel.value,
    preview_png: predictOptions.value.includes('preview_png') ? "True" : "False",
    confusion_matrix: predictOptions.value.includes('confusion_matrix') ? "True" : "False",
    class_stats: predictOptions.value.includes('evaluate') ? "True" : "False",
    heatmaps_summary: predictOptions.value.includes('heatmap') ? "True" : "False",
    userName: userinfo.username,
    createUserId: userinfo.id,
    observationTime: observationDate.value
  }

  if (predictOptions.value.includes('preview_png') && colorMap.value) {
    params.color_map = JSON.stringify(colorMap.value)
  }

  predictLoading.value = true
  error.value = ''

  plantCoverPredict(params)
    .then((res) => {
      const response = res?.response?.value || res?.value || res

      if (response?.code === 'SUCCESS') {
        message.success('预测请求已提交')
        predictCurrent.value = 1
      } else {
        const msg = response?.msg || '预测失败'
        error.value = msg
        message.error(msg)
      }
    })
    .catch((err) => {
      console.error('请求失败:', err)
      error.value = '请求失败: ' + err.message
      message.error('请求失败: ' + err.message)
    })
    .finally(() => {
      predictLoading.value = false
    })
}

// 获取结果文件 - 直接处理文件流响应
// 获取结果文件 - 直接处理文件流响应
const fetchResultFiles = () => {
  if (!selectedModel.value) {
    message.error('请选择模型')
    return
  }

  if (!observationDate.value) {
    message.error('请选择观测日期')
    return
  }

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    message.error('用户信息未找到，请重新登录')
    return
  }

  const userinfo = JSON.parse(userData)

  loadingResults.value = true
  error.value = ''
  previewData.value = ''
  downloadFiles.value = {}

  const params = {
    modelName: selectedModel.value,
    type: resultType.value,
    userName: userinfo.username,
    createUserId: userinfo.id,
    observationTime: observationDate.value,
    className: "plant",
    pngType: pngType.value
  }

  getPlantResultByType(params)
    .then((res) => {
      console.log('获取文件响应:', res)
      
      // 检查响应状态
        const blob = res.data
        const response = res?.response?.value || res?.value || res
        if (resultType.value === 'png') {
          // 对于PNG格式，创建对象URL用于图片显示
          const blob = new Blob([response], { type: 'image/png' })
          const imageUrl = URL.createObjectURL(blob)
          previewData.value = imageUrl
          downloadFiles.value.result_file = blob
          message.success('PNG图片获取成功')
        } else if (resultType.value === 'tif') {
          // 对于TIF格式，只提供下载，不显示预览
          downloadFiles.value.result_file = blob
          message.success('TIF文件获取成功，请点击下载')
        }
        predictCurrent.value = 1
    })
    .catch((err) => {
      console.error('获取结果文件失败:', err)
      handleErrorResponse(err.response?.data || err.message)
    })
    .finally(() => {
      loadingResults.value = false
    })
}
// 统一的错误处理方法
const handleErrorResponse = (errorData) => {
  if (errorData instanceof Blob) {
    // 如果是Blob类型，使用FileReader读取
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const errorJson = JSON.parse(reader.result)
        message.error(errorJson.msg || '获取结果文件失败')
      } catch (e) {
        message.error('获取结果文件失败')
      }
    }
    reader.readAsText(errorData)
  } else if (typeof errorData === 'string') {
    // 如果是字符串，直接显示
    message.error(errorData)
  } else if (errorData && errorData.msg) {
    // 如果是JSON对象且有msg属性
    message.error(errorData.msg)
  } else {
    // 其他情况显示默认错误消息
    message.error('获取结果文件失败')
  }
}

// 下载结果文件 - 直接使用已获取的blob
const downloadResultFile = () => {
  if (!downloadFiles.value.result_file) {
    message.error('结果文件不存在')
    return
  }

  const blob = downloadFiles.value.result_file
  const fileExtension = resultType.value
  const fileName = `${selectedModel.value}_result.${fileExtension}`

  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 清理URL对象
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
}

// 下载其他文件 - 保持原有实现
const downloadFile = (type) => {
  message.warning('植物识别功能暂不支持此文件下载')
}


// 打开大图对话框
const openImageDialog = () => {
  imageDialogVisible.value = true
}

// 上一步
const handlePredictPrevious = () => {
  if (predictCurrent.value > 0) {
    predictCurrent.value -= 1
  }
}

// 继续预测
const handlePredictContinue = () => {
  predictCurrent.value = 0
  emit('continue-predict')
}

// 返回
const handleBack = () => {
  emit('back')
}
</script>

<style scoped>
.feature-container {
  margin: 0 auto;
  max-width: 1200px;
}

.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto;
  width: 80%;
}

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

.form-container {
  margin: 30px auto 40px;
  width: 80%;
}

.form-horizontal-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.form-column-full {
  flex: 0 0 100%;
  padding: 0 20px;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
}

.cancel-button {
  padding: 10px 25px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  color: #606266;
  border-radius: 4px;
  font-weight: 500;
}

.cancel-button:hover {
  background-color: #f5f7fa;
  color: #409eff;
  border-color: #c6e2ff;
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

.result-container {
  margin: 20px auto;
  max-width: 1200px;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-section {
  width: 100%;
  margin-bottom: 30px;
}

.result-image {
  width: 100%;
  max-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
  overflow: hidden;
}

.result-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-image {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 18px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.no-image .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.download-section {
  width: 100%;
  margin: 20px 0 30px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f8f9fc;
}

.download-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
  font-weight: 500;
  font-size: 16px;
}

.download-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.el-divider {
  margin: 25px 0;
}

.view-full-button {
  margin-top: 10px;
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

.color-picker-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.color-picker-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.class-label {
  min-width: 50px;
}

@media (max-width: 992px) {
  .form-container {
    width: 95%;
  }
  
  .custom-steps {
    max-width: 90%;
  }
  
  .form-column-full {
    padding: 0 10px;
  }
}
</style>