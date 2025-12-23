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

            <!-- 修改观测日期字段 -->
            <el-form-item label="观测日期" required>
              <el-date-picker v-model="observationDate" type="date" placeholder="选择日期" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" :disabled-date="disabledDate" style="width: 100%"></el-date-picker>
            </el-form-item>

            <!-- 预测参数选项 -->
            <el-form-item label="预测参数">
              <el-checkbox-group v-model="predictOptions">
                <el-checkbox v-for="option in allPredictOptions" :key="option.value" :label="option.value"
                  :disabled="!isOptionAvailable(option.value, 'predict')">
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 添加颜色选择器 -->
            <!-- <el-form-item label="类别颜色"
              v-if="predictOptions.includes('preview_png') && isOptionAvailable('preview_png', 'predict')">
              <div class="color-picker-container">
                <div v-for="(color, classId) in colorMap" :key="classId" class="color-picker-item">
                  <span class="class-label">{{ classNames[classId] }}:</span>
                  <el-color-picker v-model="colorMap[classId]" show-alpha :predefine="predefineColors" />
                </div>
              </div>
            </el-form-item> -->

            <!-- 在预测参数和按钮组之间添加轮询状态 -->
            <div v-if="isPolling" class="polling-status">
              <el-alert title="任务正在执行中，请稍候..." type="info" :closable="false" show-icon>
                <template #default>
                  <div class="polling-progress">
                    <el-progress :percentage="pollingProgress" :status="pollingStatus === 'failed' ? 'exception' : ''"
                      :stroke-width="8" :show-text="false" />
                    <div class="polling-info">
                      <span v-if="pollingStatus === 'executing'">正在处理...</span>
                      <span v-if="pollingStatus === 'success'" style="color: #67c23a">任务完成！</span>
                      <span v-if="pollingStatus === 'failed'" style="color: #f56c6c">任务失败</span>
                      <span class="polling-count">({{ pollingCount }}/{{ maxPollingCount }})</span>
                    </div>
                  </div>
                </template>
              </el-alert>
              <el-button v-if="pollingStatus === 'failed'" @click="stopPolling" type="danger" size="small"
                class="stop-polling-btn">
                停止轮询
              </el-button>
            </div>

            <div class="button-group">
              <el-button @click="handlePredict" class="submit-button" type="primary" :loading="predictLoading"
                :disabled="isPolling">
                {{ isPolling ? '任务执行中...' : '开始预测' }}
              </el-button>
            </div>

            <!-- 结果获取参数选项 -->
            <el-divider />

            <!-- 修改为多选按钮组 -->
            <el-form-item label="结果获取参数">
              <div class="result-options-group">
                <!-- 所有选项放在同一行 -->
                <div class="options-row">
                  <!-- 常驻功能：预览图和TIF格式 -->
                  <el-checkbox v-model="permanentOptions.preview_png"
                    :disabled="!isOptionAvailable('preview_png', 'result')" label="preview_png">
                    预览图
                  </el-checkbox>
                  <el-checkbox v-model="permanentOptions.tif" label="tif" disabled>
                    TIF格式（默认）
                  </el-checkbox>

                  <!-- 可选功能 -->
                  <el-checkbox v-for="option in optionalResultOptions" :key="option.value" :label="option.value"
                    :disabled="!isOptionAvailable(option.value, 'result')" v-model="optionalOptions[option.value]">
                    {{ option.label }}
                  </el-checkbox>
                </div>
              </div>
            </el-form-item>
            <!-- 添加png类型选择 -->
            <el-form-item label="预览图类型"
              v-if="predictOptions.includes('preview_png') && isOptionAvailable('preview_png', 'predict')">
              <el-radio-group v-model="pngType">
                <el-radio label="simple">简单预览</el-radio>
                <el-radio label="spatial">空间分布</el-radio>
                <el-radio label="histogram">直方图</el-radio>
              </el-radio-group>
            </el-form-item>
            <div class="button-group">
              <el-button @click="handleGetResults" type="success" :loading="loadingResults"
                :disabled="!selectedModel || !observationDate">
                获取预测结果
              </el-button>
            </div>

            <!-- 模型文件下载区域 -->
            <el-divider />

            <!-- <el-form-item label="训练模型下载">
              <el-select v-model="selectedTrainModel" placeholder="请选择训练模型" style="width: 100%">
                <el-option v-for="model in trainModels" :key="model.id" :label="model.modelInfo || model.modelName"
                  :value="model.modelName"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="下载步骤" v-if="selectedTrainModel === '1DResnet'">
              <el-radio-group v-model="downloadStep">
                <el-radio :label="0">步骤1</el-radio>
                <el-radio :label="1">步骤2</el-radio>
              </el-radio-group>
              <div class="step-tips">
                <el-text type="info">1DResnet模型需要分两步下载，请依次下载两个文件</el-text>
              </div>
            </el-form-item>

            <div class="button-group">
              <el-button @click="handleDownloadModel" type="warning" :loading="downloadLoading"
                :disabled="!selectedTrainModel">
                {{ selectedTrainModel === '1DResnet' ? `下载步骤${downloadStep + 1}文件` : '下载模型文件' }}
              </el-button> -->

            <!-- 1DResnet模型专用的一键下载按钮 -->
            <!-- <el-button v-if="selectedTrainModel === '1DResnet'" @click="handleBatchDownload" type="warning"
                :loading="batchDownloadLoading">
                一键下载全部文件
              </el-button> 
            </div> -->
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
            <!-- 预览图下载 -->
            <el-button v-if="permanentOptions.preview_png && isOptionAvailable('preview_png', 'result')"
              @click="downloadPreviewImage" type="primary" plain :icon="Download">
              下载预览图
            </el-button>

            <!-- TIF文件下载 -->
            <el-button v-if="permanentOptions.tif" @click="downloadTifFile" type="success" plain :icon="Download">
              下载TIF文件
            </el-button>

            <!-- 可选文件下载 -->
            <!-- <el-button v-if="optionalOptions.confusion_matrix && isOptionAvailable('confusion_matrix', 'result')"
              @click="downloadFile('confusion_matrix')" type="primary" plain icon="Download">
              混淆矩阵
            </el-button> -->
            <el-button v-if="optionalOptions.evaluate && isOptionAvailable('evaluate', 'result')"
              @click="downloadFile('evaluate')" type="primary" plain :icon="Download">
              统计报告
            </el-button>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="button-group">
          <el-button @click="handlePredictPrevious" class="cancel-button" :icon="Back">
            上一步
          </el-button>
          <el-button @click="handlePredictContinue" class="submit-button" type="primary" :icon="Refresh">
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
  ElRadio,
  ElText
} from 'element-plus'
import {
  getModelByClassName,
  plantCoverPredict,
  getPlantResultByType,
  DownloadPlantTrainModelFiles,
  getModelStatusByConditions,
  getTimesByType
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

// 模型下载相关状态
const trainModels = ref([])
const selectedTrainModel = ref('')
const downloadStep = ref(0)
const downloadLoading = ref(false)
const batchDownloadLoading = ref(false)

// 所有可用的选项配置
const allPredictOptions = ref([
  { value: 'preview_png', label: '预览图' },
  // { value: 'confusion_matrix', label: '混淆矩阵' },
  { value: 'evaluate', label: '统计报告' },
  // { value: 'heatmap', label: '热力图' },
])

const optionalResultOptions = ref([
  // { value: 'confusion_matrix', label: '混淆矩阵' },
  { value: 'evaluate', label: '统计报告' }
])

const availableDates = ref([])

// 修改结果选项为多选结构
const permanentOptions = ref({
  preview_png: true,
  tif: true
})

const optionalOptions = ref({
  confusion_matrix: false,
  evaluate: false
})

const predictOptions = ref(['preview_png', 'evaluate'])
const previewData = ref('')
const downloadFiles = ref({})
const predictLoading = ref(false)
const loadingResults = ref(false)
const error = ref('')
const imageDialogVisible = ref(false)

// 轮询相关状态
const isPolling = ref(false)
const pollingTimer = ref(null)
const pollingStatus = ref('')
const pollingCount = ref(0)
const pollingProgress = ref(0)
const maxPollingCount = 300
const pollingInterval = 2000
const taskStartTime = ref(null)

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
  observationDate: observationDate.value,
  resultType: resultType.value,
  pngType: pngType.value
}))

const hasDownloadableFiles = computed(() => {
  return permanentOptions.value.preview_png || permanentOptions.value.tif ||
    optionalOptions.value.confusion_matrix || optionalOptions.value.evaluate
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
})

// 新增方法：获取植物类别的可用日期
const fetchAvailableDates = () => {
  getTimesByType({
    type: 'modelfiles',
    searchTimeType: 'day',
    className: 'plant'  // 固定为 plant
  })
    .then((res) => {
      const response = res?.response?.value || res?.value || res
      if (response?.code === 'SUCCESS') {
        // 过滤掉可能的 null 值
        availableDates.value = (response.body?.date || []).filter(date => date !== null && date !== undefined)

        // 如果有可用日期，将默认日期设置为最后一个日期
        if (availableDates.value.length > 0) {
          observationDate.value = availableDates.value[availableDates.value.length - 1]
        }
      } else {
        message.warning(response?.msg || '获取可用日期失败')
      }
    })
    .catch((error) => {
      console.error('获取日期数据失败:', error)
      message.error('获取日期数据失败，请稍后再试')
    })
}

// 新增方法：禁用不可用日期
const disabledDate = (time) => {
  if (!availableDates.value || availableDates.value.length === 0) {
    return false
  }

  const dateString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`

  return !availableDates.value.includes(dateString)
}


// 生命周期
onMounted(() => {
  fetchModels()
  fetchAvailableDates()
})

// 轮询相关方法
const startPolling = () => {
  stopPolling()

  isPolling.value = true
  pollingCount.value = 0
  pollingProgress.value = 0
  pollingStatus.value = 'executing'
  taskStartTime.value = new Date()

  pollingTimer.value = setInterval(() => {
    checkTaskStatus()
  }, pollingInterval)
}

const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
  isPolling.value = false
}

const checkTaskStatus = async () => {
  if (pollingCount.value >= maxPollingCount) {
    message.error('任务执行超时，请稍后手动获取结果')
    stopPolling()
    return
  }

  pollingCount.value++

  const elapsedTime = new Date() - taskStartTime.value
  const estimatedMaxTime = maxPollingCount * pollingInterval
  pollingProgress.value = Math.min(90, Math.round((elapsedTime / estimatedMaxTime) * 100))

  try {
    const userData = localStorage.getItem('Userinfo')
    if (!userData) {
      throw new Error('用户信息未找到')
    }

    const userinfo = JSON.parse(userData)

    const params = {
      userName: userinfo.username,
      createUserid: userinfo.id,
      modelName: selectedModel.value,
      observationTime: observationDate.value,
      className: "plant"
    }

    // 假设有查询植物任务状态的接口
    const res = await getModelStatusByConditions(params)
    const response = res?.response?.value || res?.value || res

    if (response?.code === 'SUCCESS') {
      const taskData = response.body?.[0]

      if (taskData) {
        const status = taskData.usageStatus?.toLowerCase()

        if (status === 'success') {
          pollingStatus.value = 'success'
          pollingProgress.value = 100
          message.success('任务执行成功！')

          stopPolling()

          setTimeout(() => {
            predictCurrent.value = 1
            if (permanentOptions.value.preview_png && isOptionAvailable('preview_png', 'result')) {
              fetchPreviewImage()
            }
          }, 500)

        } else if (status === 'failed') {
          pollingStatus.value = 'failed'
          pollingProgress.value = 100
          message.error('任务执行失败，请检查参数或联系管理员')
          stopPolling()

        } else if (status === 'executing') {
          pollingStatus.value = 'executing'
        }
      }
    }

  } catch (err) {
    console.error('查询任务状态失败:', err)
    if (pollingCount.value > 10) {
      message.error('任务状态查询失败，请稍后手动检查')
      stopPolling()
    }
  }
}

// 方法
// 获取模型数据
// 获取模型数据
const fetchModels = () => {
  getModelByClassName({ className: "plant" })
    .then((res) => {
      const response = res?.response?.value || res?.value || res

      if (response?.code === 'SUCCESS') {
        const allModels = response?.body || []

        // 过滤预测模型
        models.value = allModels.filter(model => {
          if (!model.functions) return false
          const functionList = model.functions.split(',').map(func => func.trim())
          // 排除纯训练模型，只保留包含预测功能的模型
          return !functionList.includes('train') &&
            functionList.some(func =>
              ['preview_png', 'confusion_matrix', 'class_stats', 'heatmaps_summary'].includes(func)
            )
        })

        // 过滤训练模型 - 包含原有训练模型和指定的预测模型
        trainModels.value = allModels.filter(model => {
          if (!model.functions) return false
          // 包括训练模型和指定的预测模型
          return model.functions === 'train' ||
            model.modelName === 'fanyanV2' ||
            model.modelName === 'fanyanRF'
        })

        if (models.value.length > 0) {
          selectedModel.value = models.value[0].modelName
          const currentModel = models.value[0]
          if (currentModel.functions) {
            currentModelFunctions.value = currentModel.functions.split(',').map(func => func.trim())
          }
        } else {
          message.warning('未找到可用预测模型')
        }

        if (trainModels.value.length > 0) {
          selectedTrainModel.value = trainModels.value[0].modelName
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
    observationTime: observationDate.value,
    pngType: pngType.value
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
        message.success('预测任务已提交，正在等待执行结果...')
        // 不立即跳转，开始轮询任务状态
        startPolling()
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

// 获取预览图
const fetchPreviewImage = () => {
  if (!selectedModel.value || !observationDate.value) {
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
    type: 'png',
    userName: userinfo.username,
    createUserId: userinfo.id,
    observationTime: observationDate.value,
    className: "plant",
    pngType: pngType.value
  }

  getPlantResultByType(params)
    .then((res) => {
      console.log('获取预览图响应:', res)

      const blob = res.data
      const response = res?.response?.value || res?.value || res

      if (response instanceof Blob && response.type === 'application/json') {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const errorJson = JSON.parse(reader.result)
            message.error(errorJson.msg || '获取预览图失败')
          } catch (e) {
            message.error('获取预览图失败')
          }
        }
        reader.readAsText(response)
        return
      }

      if (response) {
        const blob = new Blob([response], { type: 'image/png' })
        const imageUrl = URL.createObjectURL(blob)
        previewData.value = imageUrl
        downloadFiles.value.preview_png = blob
        message.success('预览图获取成功')
      }
    })
    .catch((err) => {
      console.error('获取预览图失败:', err)
      handleErrorResponse(err.response?.data || err.message)
    })
}

// 获取TIF文件
const fetchTifFile = () => {
  if (!selectedModel.value || !observationDate.value) {
    message.error('请选择模型和观测日期')
    return
  }

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    message.error('用户信息未找到，请重新登录')
    return
  }

  const userinfo = JSON.parse(userData)

  loadingResults.value = true

  const params = {
    modelName: selectedModel.value,
    type: 'tif',
    userName: userinfo.username,
    createUserId: userinfo.id,
    observationTime: observationDate.value,
    className: "plant"
  }

  getPlantResultByType(params)
    .then((res) => {
      console.log('获取TIF文件响应:', res)

      const blob = res.data
      const response = res?.response?.value || res?.value || res

      if (response instanceof Blob && response.type === 'application/json') {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const errorJson = JSON.parse(reader.result)
            message.error(errorJson.msg || '获取TIF文件失败')
          } catch (e) {
            message.error('获取TIF文件失败')
          }
        }
        reader.readAsText(response)
        return
      }

      if (response) {
        downloadFiles.value.tif = response
        message.success('TIF文件获取成功，请再次点击下载')
      }
    })
    .catch((err) => {
      console.error('获取TIF文件失败:', err)
      handleErrorResponse(err.response?.data || err.message)
    })
    .finally(() => {
      loadingResults.value = false
    })
}

// 处理获取预测结果 - 只跳转不调用接口
const handleGetResults = () => {
  if (!selectedModel.value) {
    message.error('请选择模型')
    return
  }

  if (!observationDate.value) {
    message.error('请选择观测日期')
    return
  }

  // 直接跳转到结果页面
  predictCurrent.value = 1

  // 跳转后自动获取预览图
  if (permanentOptions.value.preview_png && isOptionAvailable('preview_png', 'result')) {
    fetchPreviewImage()
  }
}

// 统一的错误处理方法
const handleErrorResponse = (errorData) => {
  if (errorData instanceof Blob) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const errorJson = JSON.parse(reader.result)
        message.error(errorJson.msg || '获取文件失败')
      } catch (e) {
        message.error('获取文件失败')
      }
    }
    reader.readAsText(errorData)
  } else if (typeof errorData === 'string') {
    message.error(errorData)
  } else if (errorData && errorData.msg) {
    message.error(errorData.msg)
  } else {
    message.error('获取文件失败')
  }
}

// 下载预览图
const downloadPreviewImage = () => {
  if (!downloadFiles.value.preview_png) {
    // 如果还没有获取预览图，先获取再下载
    fetchPreviewImage()
    return
  }

  const blob = downloadFiles.value.preview_png
  const fileName = `${observationDate.value}-${selectedModel.value}_preview.png`

  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
}

// 下载TIF文件
const downloadTifFile = () => {
  if (!downloadFiles.value.tif) {
    // 如果还没有获取TIF文件，先获取再下载
    fetchTifFile()
    return
  }

  const blob = downloadFiles.value.tif
  const fileName = `${observationDate.value}-${selectedModel.value}_result.tif`

  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
}

// 下载模型文件 - 修复版本
const handleDownloadModel = () => {
  if (!selectedTrainModel.value) {
    message.error('请选择训练模型')
    return
  }

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    message.error('用户信息未找到，请重新登录')
    return
  }

  const userinfo = JSON.parse(userData)

  downloadLoading.value = true

  const params = {
    userName: userinfo.username,
    modelName: selectedTrainModel.value,
    createUserId: userinfo.id,
    observationTime: observationDate.value,
    type: 'train',
    DownloadStep: downloadStep.value
  }

  DownloadPlantTrainModelFiles(params)
    .then((response) => {
      console.log('下载文件响应:', response)

      const res = response?.data || response?.response?.value || response?.value || response

      if (res instanceof Blob && res.type === 'application/json') {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const errorJson = JSON.parse(reader.result)
            message.error(errorJson.msg || '下载模型文件失败')
          } catch (e) {
            message.error('下载模型文件失败')
          }
        }
        reader.readAsText(res)
        return
      }

      let fileExtension = '.pkl'
      if (selectedTrainModel.value === '1DResnet') {
        fileExtension = downloadStep.value === 0 ? '.h5' : '.pkl'
      }

      const fileName = `${selectedTrainModel.value}_step${downloadStep.value + 1}${fileExtension}`

      let blob
      if (res instanceof Blob) {
        blob = res
      } else {
        blob = new Blob([res], { type: 'application/octet-stream' })
      }

      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)

      message.success(`模型文件 ${fileName} 下载成功`)

      if (selectedTrainModel.value === '1DResnet' && downloadStep.value === 0) {
        message.info('请继续下载步骤2的文件以获取完整模型')
        downloadStep.value = 1
      }
    })
    .catch((err) => {
      console.error('下载模型文件失败:', err)
      if (err.response?.data) {
        handleErrorResponse(err.response.data)
      } else if (err.message) {
        message.error('下载失败: ' + err.message)
      } else {
        message.error('下载模型文件失败')
      }
    })
    .finally(() => {
      downloadLoading.value = false
    })
}

// 批量下载1DResnet模型的所有文件 - 修复版本
const handleBatchDownload = () => {
  if (selectedTrainModel.value !== '1DResnet') {
    message.error('批量下载仅适用于1DResnet模型')
    return
  }

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    message.error('用户信息未找到，请重新登录')
    return
  }

  const userinfo = JSON.parse(userData)
  batchDownloadLoading.value = true

  const downloadStepFile = (step) => {
    const params = {
      userName: userinfo.username,
      modelName: selectedTrainModel.value,
      createUserId: userinfo.id,
      observationTime: observationDate.value,
      type: 'train',
      DownloadStep: step
    }

    return DownloadPlantTrainModelFiles(params)
      .then((response) => {
        const res = response?.data || response?.response?.value || response?.value || response

        if (res instanceof Blob && res.type === 'application/json') {
          const reader = new FileReader()
          return new Promise((resolve, reject) => {
            reader.onload = () => {
              try {
                const errorJson = JSON.parse(reader.result)
                reject(new Error(errorJson.msg || `下载步骤${step + 1}文件失败`))
              } catch (e) {
                reject(new Error(`下载步骤${step + 1}文件失败`))
              }
            }
            reader.readAsText(res)
          })
        }

        const fileExtension = step === 0 ? '.h5' : '.pkl'
        const fileName = `${selectedTrainModel.value}_step${step + 1}${fileExtension}`

        let blob
        if (res instanceof Blob) {
          blob = res
        } else {
          blob = new Blob([res], { type: 'application/octet-stream' })
        }

        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)

        return fileName
      })
  }

  downloadStepFile(0)
    .then((fileName1) => {
      message.success(`文件 ${fileName1} 下载成功，开始下载步骤2文件...`)
      return downloadStepFile(1)
    })
    .then((fileName2) => {
      message.success(`文件 ${fileName2} 下载成功`)
      message.success('1DResnet模型所有文件下载完成！')
    })
    .catch((err) => {
      console.error('批量下载失败:', err)
      message.error(err.message || '批量下载失败')
    })
    .finally(() => {
      batchDownloadLoading.value = false
    })
}

// 下载其他文件
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
/* 调整日期选择器的垂直对齐 */
:deep(.el-form-item__label) {
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 1;
}

/* 确保日期选择器与标签垂直对齐 */
.el-form-item :deep(.el-date-editor) {
  line-height: 32px;
}

/* 调整日期选择器容器内的垂直对齐 */
.el-form-item :deep(.el-input__wrapper) {
  display: flex;
  align-items: center;
}

/* 针对日期选择器的特定调整 */
.date-picker-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

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


/* 修改预览图容器为固定大小 */
.image-section {
  width: 100%;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-image {
  width: 512px;
  height: 512px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
  overflow: hidden;
  box-sizing: border-box;
}

/* 修改预览图图片样式 - 完全自适应 */
.result-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}

/* 响应式调整 - 小屏幕下适当缩小容器 */
@media (max-width: 768px) {
  .result-image {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 480px) {
  .result-image {
    width: 300px;
    height: 300px;
  }
}

/* 调整无图片时的显示容器 */
.no-image {
  width: 512px;
  height: 512px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 18px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
  margin: 0 auto;
}

/* 响应式调整无图片容器 */
@media (max-width: 768px) {
  .no-image {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 480px) {
  .no-image {
    width: 300px;
    height: 300px;
  }
}

/* 查看大图按钮居中 */
.view-full-button {
  margin-top: 10px;
  display: block;
  margin-left: auto;
  margin-right: auto;
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

.step-tips {
  margin-top: 8px;
}

/* 修改结果选项分组样式 */
.result-options-group {
  display: flex;
}

.options-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}

@media (max-width: 768px) {
  .options-row {
    gap: 12px;
  }

  .options-row .el-checkbox {
    margin-bottom: 8px;
  }
}

.permanent-options {
  display: flex;
  gap: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.optional-options {
  display: flex;
  gap: 20px;
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

  .permanent-options,
  .optional-options {
    flex-direction: column;
    gap: 12px;
  }
}
</style>