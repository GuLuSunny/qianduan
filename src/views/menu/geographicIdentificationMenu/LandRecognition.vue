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
          <div class="step-title">分类结果</div>
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
              <el-select v-model="selectedModel" placeholder="请选择分类模型">
                <el-option v-for="model in models" :key="model.id" :label="model.modelInfo || model.modelName"
                  :value="model.modelName"></el-option>
              </el-select>
            </el-form-item>

            <!-- 修改观测日期字段 -->
            <el-form-item label="观测日期" required v-if="!isDualModel" class="date-picker-item">
              <el-date-picker v-model="observationDate" type="date" placeholder="选择日期" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" :disabled-date="disabledDate" style="width: 100%"></el-date-picker>
            </el-form-item>
            <!-- 双极化模型的两个日期选择器 -->
            <div v-if="isDualModel" class="dual-date-container">
              <el-form-item label="第一时相" required class="date-picker-item">
                <el-date-picker v-model="firstTime" type="date" placeholder="选择第一时相日期" format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD" style="width: 100%"></el-date-picker>
              </el-form-item>

              <el-form-item label="第二时相" required class="date-picker-item">
                <el-date-picker v-model="secondTime" type="date" placeholder="选择第二时相日期" format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD" style="width: 100%"></el-date-picker>
              </el-form-item>
            </div>

            <!-- 分类参数选项 -->
            <el-form-item label="分类参数">
              <el-checkbox-group v-model="predictOptions">
                <el-checkbox v-for="option in allPredictOptions" :key="option.value" :label="option.value"
                  :disabled="!isOptionAvailable(option.value, 'predict')">
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 添加颜色选择器 -->
            <el-form-item label="类别颜色"
              v-if="predictOptions.includes('preview_png') && isOptionAvailable('preview_png', 'predict')">
              <div class="color-picker-container">
                <div v-for="(color, classId) in colorMap" :key="classId" class="color-picker-item">
                  <span class="class-label">{{ classNames[classId] }}:</span>
                  <el-color-picker v-model="colorMap[classId]" show-alpha :predefine="predefineColors" />
                </div>
              </div>
            </el-form-item>

            <!-- 轮询状态显示 -->
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
                {{ isPolling ? '任务执行中...' : '开始分类' }}
              </el-button>
            </div>

            <!-- 结果获取参数选项 -->
            <el-divider />

            <el-form-item label="结果获取参数">
              <el-checkbox-group v-model="resultOptions">
                <el-checkbox v-for="option in allResultOptions" :key="option.value" :label="option.value"
                  :disabled="!isOptionAvailable(option.value, 'result') && option.value !== 'tif'">
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <div class="button-group">
              <el-button @click="fetchResultFiles" type="success" :loading="loadingResults"
                :disabled="!selectedModel || !observationDate">
                获取分类结果
              </el-button>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 分类结果页面 -->
    <div class="result-container" v-if="predictCurrent === 1">
      <div class="result-content">
        <!-- 图片展示区域 -->
        <div class="image-section" v-if="previewData">
          <div class="result-image">
            <img :src="previewData" alt="分类结果预览" />
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
            <!-- TIF文件下载按钮 - 始终可用 -->
            <el-button @click="downloadFile('tif')" type="success" plain :icon="Download">
              TIF文件
            </el-button>
            <el-button @click="downloadFile('preview_png')" type="success" plain :icon="Download">
              png预览图
            </el-button>
            <!-- <el-button v-if="downloadFiles.confusion_matrix && isOptionAvailable('confusion_matrix', 'result')" 
                      @click="downloadFile('confusion_matrix')" type="primary" plain icon="Download">
              混淆矩阵
            </el-button> -->
            <el-button v-if="downloadFiles.class_stats && isOptionAvailable('class_stats', 'result')"
              @click="downloadFile('class_stats')" type="primary" plain :icon="Download">
              统计报告
            </el-button>

            <!-- 热力图下载按钮 - 仅当模型为xgbv1且heatmaps_summary为true时可用
            <el-button v-if="canDownloadHeatmap" 
                      @click="downloadFile('heatmap')" type="primary" plain icon="Download">
              热力图
            </el-button> -->
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="button-group">
          <el-button @click="handlePredictPrevious" class="cancel-button" :icon="Back">
            上一步
          </el-button>
          <el-button @click="handlePredictContinue" class="submit-button" type="primary" :icon="Refresh">
            继续分类
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
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
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
  ElAlert,
  ElProgress
} from 'element-plus'
import {
  getModelByClassName,
  landPredictByCommons,
  getLandResult,
  getLandResultPreview,
  getLandResultConfusionMatrix,
  getLandResultConfusionMatrixClassStats,
  getLandResultHeatmap,
  getLandResultTif,
  getModelStatusByConditions,  // 导入状态查询接口
  getTimesByType
} from '@/api/getData'

// 定义emit事件
const emit = defineEmits(['back', 'continue-predict'])

// 识别功能相关状态
const predictCurrent = ref(0)
const models = ref([])
const selectedModel = ref('')
const observationDate = ref('') // 全极化模型使用的观测日期
const firstTime = ref('') // 双极化模型第一时相
const secondTime = ref('') // 双极化模型第二时相
const selectedModelType = ref('') // 存储选中模型的类型
const currentModelFunctions = ref([]) // 存储当前选中模型的功能列表

// 计算属性：判断是否为双极化模型
const isDualModel = computed(() => {
  return selectedModelType.value === 'dual'
})

// 轮询相关状态
const isPolling = ref(false)
const pollingTimer = ref(null)
const pollingStatus = ref('') // 'executing', 'success', 'failed'
const pollingCount = ref(0)
const pollingProgress = ref(0)
const maxPollingCount = 300 // 最大轮询次数（10分钟，每2秒一次）
const pollingInterval = 2000 // 轮询间隔2秒
const taskStartTime = ref(null)

// 所有可用的选项配置
const allPredictOptions = ref([
  { value: 'preview_png', label: '预览图' },
  // { value: 'confusion_matrix', label: '混淆矩阵' },
  { value: 'class_stats', label: '统计报告' }, // class_stats对应统计报告
  // { value: 'heatmap', label: '热力图' }, // heatmaps_summary对应热力图
])

const allResultOptions = ref([
  { value: 'preview_png', label: '预览图' },
  // { value: 'confusion_matrix', label: '混淆矩阵' },
  { value: 'class_stats', label: '统计报告' }, // class_stats对应统计报告
  // { value: 'heatmap', label: '热力图' },
  { value: 'tif', label: 'TIF文件' }  // 添加TIF选项
])

const predictOptions = ref(['preview_png', 'confusion_matrix', 'class_stats', 'heatmap'])
const resultOptions = ref(['preview_png', 'confusion_matrix', 'class_stats', 'tif']) // 默认包含tif
const previewData = ref('')
const downloadFiles = ref({})
const predictLoading = ref(false)
const loadingResults = ref(false)
const error = ref('')
const imageDialogVisible = ref(false)

const availableDates = ref([])

// 颜色映射状态
const colorMap = ref({
  "-1": "#CCCCCC",
  0: '#FFFF00',
  1: '#00B050',
  2: '#4472C4',
  3: '#FF0000',
  4: '#C5A27A',
  5: '#808080'
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
  0: '农田',
  1: '林地',
  2: '水体',
  3: '城市',
  4: '裸地',
  5: '道路'
}



// 监听选择的模型变化
watch(selectedModel, (newVal) => {
  if (!newVal) {
    currentModelFunctions.value = []
    selectedModelType.value = ''
    return
  }

  const currentModel = models.value.find(m => m.modelName === newVal)
  if (!currentModel || !currentModel.functions) {
    currentModelFunctions.value = []
    selectedModelType.value = ''
    return
  }

  // 解析功能字符串为数组
  currentModelFunctions.value = currentModel.functions.split(',').map(func => func.trim())

  // 设置模型类型
  selectedModelType.value = currentModel.type || ''

  // 根据模型类型重置日期
  if (selectedModelType.value === 'dual') {
    // 双极化模型：设置默认日期（今天和7天前）
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    firstTime.value = sevenDaysAgo.toISOString().split('T')[0]
    secondTime.value = today.toISOString().split('T')[0]
  } else {
    // 全极化模型：设置默认日期为今天
    const today = new Date()
    observationDate.value = today.toISOString().split('T')[0]
  }

  // 过滤不可用的选项（除了tif）
  predictOptions.value = predictOptions.value.filter(option =>
    isOptionAvailable(option, 'predict')
  )

  resultOptions.value = resultOptions.value.filter(option =>
    isOptionAvailable(option, 'result') || option === 'tif'
  )
})

// 计算属性
const form = computed(() => ({
  selectedModel: selectedModel.value,
  predictOptions: predictOptions.value,
  resultOptions: resultOptions.value,
  observationDate: observationDate.value
}))

const hasDownloadableFiles = computed(() => {
  return downloadFiles.value.confusion_matrix || downloadFiles.value.class_stats || downloadFiles.value.heatmap
})

// 检查是否可以下载热力图（模型为xgbv1且heatmaps_summary为true）
const canDownloadHeatmap = computed(() => {
  return selectedModel.value === 'xgbv1' &&
    predictOptions.value.includes('heatmap') &&
    isOptionAvailable('heatmap', 'predict')
})

// 检查选项是否可用
const isOptionAvailable = (optionValue, type) => {
  if (!selectedModel.value || currentModelFunctions.value.length === 0) return false

  // TIF文件始终可用
  if (optionValue === 'tif') return true

  // 功能映射：将前端选项值映射到后端功能名称
  const functionMap = {
    'preview_png': 'preview_png',
    'confusion_matrix': 'confusion_matrix',
    'class_stats': 'class_stats', // 前端统计报告对应后端class_stats
    'heatmap': 'heatmaps_summary' // 前端热力图对应后端heatmaps_summary
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

  // 解析功能字符串为数组
  currentModelFunctions.value = currentModel.functions.split(',').map(func => func.trim())

  // 过滤不可用的选项（除了tif）
  predictOptions.value = predictOptions.value.filter(option =>
    isOptionAvailable(option, 'predict')
  )

  resultOptions.value = resultOptions.value.filter(option =>
    isOptionAvailable(option, 'result') || option === 'tif'
  )
})

// 新增方法：获取土地类别的可用日期
const fetchAvailableDates = () => {
  getTimesByType({
    type: 'modelfiles',
    searchTimeType: 'day',
    className: 'land'  // 固定为 land
  })
    .then((res) => {
      const response = res?.response?.value || res?.value || res
      if (response?.code === 'SUCCESS') {
        // 过滤掉 null 值
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

// 组件卸载时停止轮询
onUnmounted(() => {
  stopPolling()
})

// 方法
// 获取模型数据
const fetchModels = () => {
  getModelByClassName({ className: "land" })
    .then((res) => {
      const response = res?.response?.value || res?.value || res

      if (response?.code === 'SUCCESS') {
        models.value = response?.body || []

        if (models.value.length > 0) {
          selectedModel.value = models.value[0].modelName
          // 初始化当前模型功能
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

// 开始轮询任务状态
const startPolling = () => {
  stopPolling() // 先停止之前的轮询

  isPolling.value = true
  pollingCount.value = 0
  pollingProgress.value = 0
  pollingStatus.value = 'executing'
  taskStartTime.value = new Date()

  // 开始轮询
  pollingTimer.value = setInterval(() => {
    checkTaskStatus()
  }, pollingInterval)
}

// 停止轮询
const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
  isPolling.value = false
}

// 检查任务状态
const checkTaskStatus = async () => {
  if (pollingCount.value >= maxPollingCount) {
    message.error('任务执行超时，请稍后手动获取结果')
    stopPolling()
    return
  }

  pollingCount.value++

  // 更新进度条（基于时间估算，0-90%）
  const elapsedTime = new Date() - taskStartTime.value
  const estimatedMaxTime = maxPollingCount * pollingInterval // 最大预估时间
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
    }

    // 根据模型类型添加日期参数
    if (isDualModel.value) {
      params.startTime = firstTime.value
      params.endTime = secondTime.value
    } else {
      params.observationTime = observationDate.value
    }

    const res = await getModelStatusByConditions(params)
    const response = res?.response?.value || res?.value || res

    console.log('任务状态查询结果:', response)

    if (response?.code === 'SUCCESS') {
      const taskData = response.body?.[0] // 获取第一个任务数据

      if (taskData) {
        const status = taskData.usageStatus?.toLowerCase()

        if (status === 'success') {
          // 任务成功完成
          pollingStatus.value = 'success'
          pollingProgress.value = 100
          message.success('任务执行成功！')

          // 停止轮询
          stopPolling()

          // 延迟500ms后跳转到结果页面并获取结果
          setTimeout(() => {
            predictCurrent.value = 1
            fetchResultFiles()
          }, 500)

        } else if (status === 'failed') {
          // 任务失败
          pollingStatus.value = 'failed'
          pollingProgress.value = 100
          message.error('任务执行失败，请检查参数或联系管理员')

          // 停止轮询
          stopPolling()

        } else if (status === 'executing') {
          // 任务仍在执行中，继续轮询
          pollingStatus.value = 'executing'

        } else {
          // 未知状态
          console.warn('未知的任务状态:', status)
        }
      } else {
        // 没有找到任务数据，可能是任务还未开始记录
        console.log('未找到任务数据，任务可能正在启动...')
      }
    } else {
      // 接口返回错误
      const msg = response?.msg || '查询任务状态失败'
      console.error(msg)
    }

  } catch (err) {
    console.error('查询任务状态失败:', err)
    // 网络错误时不立即停止轮询，继续尝试
    if (pollingCount.value > 10) { // 连续失败10次后停止
      message.error('任务状态查询失败，请稍后手动检查')
      stopPolling()
    }
  }
}

// 处理分类请求
const handlePredict = () => {
  if (!selectedModel.value) {
    message.error('请选择分类模型')
    return
  }

  if (!observationDate.value) {
    message.error('请选择观测日期')
    return
  }

  if (isDualModel.value && (!firstTime.value || !secondTime.value)) {
    message.error('请选择双时相日期')
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
    class_stats: predictOptions.value.includes('class_stats') ? "True" : "False", // class_stats对应class_stats
    heatmaps_summary: predictOptions.value.includes('heatmap') ? "True" : "False", // heatmap对应heatmaps_summary
    userName: userinfo.username,
    createUserId: userinfo.id
  }

  // 根据模型类型添加日期参数
  if (isDualModel.value) {
    params.firstTime = firstTime.value
    params.secondTime = secondTime.value
  } else {
    params.observationTime = observationDate.value
  }

  if (predictOptions.value.includes('preview_png') && colorMap.value) {
    params.color_map = JSON.stringify(colorMap.value)
  }



  predictLoading.value = true
  error.value = ''

  landPredictByCommons(params)
    .then((res) => {
      const response = res?.response?.value || res?.value || res

      if (response?.code === 'SUCCESS') {
        message.success('分类任务已提交，正在等待执行结果...')
        // 不立即跳转，开始轮询任务状态
        startPolling()
      } else {
        const msg = response?.msg || '分类任务提交失败'
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

// 获取结果文件
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
    preview_png: resultOptions.value.includes('preview_png') ? "True" : "False",
    confusion_matrix: resultOptions.value.includes('confusion_matrix') ? "True" : "False",
    class_stats: resultOptions.value.includes('class_stats') ? "True" : "False",
    userName: userinfo.username,
    createUserId: userinfo.id,
    className: "land"
  }

  // 根据模型类型添加日期参数
  if (isDualModel.value) {
    // 对于双极化模型，使用 firstTime 作为 observationTime 传递给结果接口
    params.observationTime = firstTime.value
    // 如果需要，可以同时传递双时相参数
    params.firstTime = firstTime.value
    params.secondTime = secondTime.value
  } else {
    params.observationTime = observationDate.value
  }

  getLandResult(params)
    .then((res) => {
      console.log('getLandResult 完整响应:', res)

      const response = res?.response?.value || res?.value || res
      console.log('处理后的响应数据:', response)

      if (response?.code === 'SUCCESS') {
        downloadFiles.value = response.body?.urls || {}
        console.log('下载文件信息:', downloadFiles.value)

        if (downloadFiles.value.preview_png) {
          loadPreviewImage()
        }

        message.success('结果获取成功')

        // 新增：跳转到结果页面
        predictCurrent.value = 1
      } else {
        const msg = response?.msg || '获取结果文件失败'
        error.value = msg
        message.error(msg)
      }
    })
    .catch((err) => {
      console.error('获取结果文件失败:', err)
      error.value = '获取结果文件失败: ' + err.message
      message.error('获取结果文件失败: ' + err.message)
    })
    .finally(() => {
      loadingResults.value = false
    })
}

// 加载预览图片
const loadPreviewImage = () => {
  if (!downloadFiles.value.preview_png || !selectedModel.value) return

  const userData = localStorage.getItem('Userinfo')
  if (!userData) return

  const userinfo = JSON.parse(userData)

  getLandResultPreview({
    modelName: selectedModel.value,
    createUserId: userinfo.id,
    userName: userinfo.username,
    observationTime: observationDate.value, // 使用自选的观测日期
    firstTime: firstTime.value,
    secondTime: secondTime.value,
    className: "land"
  })
    .then((res) => {
      console.log('预览图响应:', res)

      const response = res?.response?.value || res?.value || res

      const blob = new Blob([response], { type: 'image/png' })
      previewData.value = URL.createObjectURL(blob)
    })
    .catch((err) => {
      console.error('加载预览图失败:', err)
      error.value = '加载预览图失败: ' + err.message
      message.error('加载预览图失败: ' + err.message)
    })
}

// 下载文件
const downloadFile = (type) => {
  const fileNameMap = {
    preview_png: `${selectedModel.value}_preview.png`,
    tif: `${selectedModel.value}_result.tif`,
    confusion_matrix: `${selectedModel.value}_confusion_matrix.png`,
    class_stats: `${selectedModel.value}_class_stats.txt`, // class_stats对应统计报告文件
    heatmap: `class_heatmaps_summary.png`
  }

  const apiCallMap = {
    preview_png: getLandResultPreview,
    tif: getLandResultTif, // 添加TIF下载接口
    confusion_matrix: getLandResultConfusionMatrix,
    class_stats: getLandResultConfusionMatrixClassStats, // class_stats对应class_stats接口  
    heatmap: getLandResultHeatmap
  }

  const apiCall = apiCallMap[type]

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    message.error('用户信息未找到，请重新登录')
    return
  }

  const userinfo = JSON.parse(userData)

  apiCall({
    modelName: selectedModel.value,
    createUserId: userinfo.id,
    userName: userinfo.username,
    observationTime: observationDate.value, // 使用自选的观测日期
    firstTime: firstTime.value,
    secondTime: secondTime.value,
    className: "land"
  })
    .then((res) => {
      console.log('下载文件响应:', res)

      const response = res?.response?.value || res?.value || res

      const contentType = type === 'tif' ? 'image/tiff' :
        type === 'class_stats' ? 'text/plain' : 'image/png'

      const blob = new Blob([response], {
        type: contentType
      })

      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileNameMap[type]
      link.click()

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
    })
    .catch((err) => {
      console.error('文件下载失败:', err)
      error.value = `下载失败: ${err.response?.data?.message || err.message}`
      message.error(`下载失败: ${err.response?.data?.message || err.message}`)
    })
}

// 打开大图对话框
const openImageDialog = () => {
  imageDialogVisible.value = true
}

// 上一步（同时停止轮询）
const handlePredictPrevious = () => {
  stopPolling()
  if (predictCurrent.value > 0) {
    predictCurrent.value -= 1
  }
}

// 继续分类（同时停止轮询）
const handlePredictContinue = () => {
  stopPolling()
  predictCurrent.value = 0
  emit('continue-predict')
}

// 返回
const handleBack = () => {
  stopPolling()
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

/* 针对双极化模型日期选择器的垂直对齐 */
.dual-date-container .date-picker-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

/* 确保双极化模型的标签与选择器对齐 */
.dual-date-container .el-form-item__label {
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 1;
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

/* 大图预览的自适应调整 */
.full-size-image {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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

/* 轮询状态样式 */
.polling-status {
  margin: 20px 0;
}

.polling-progress {
  margin-top: 10px;
}

.polling-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.polling-count {
  color: #909399;
}

.stop-polling-btn {
  margin-top: 10px;
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

/* 双极化模型日期选择器样式 */
.dual-date-container {
  display: flex;
  gap: 20px;
  width: 100%;
}

.dual-date-container .date-picker-item {
  flex: 1;
  margin-bottom: 0;
}

/* 调整日期选择器表单项的标签对齐 */
.dual-date-container .el-form-item {
  margin-bottom: 22px;
}

.dual-date-container .el-form-item__label {
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dual-date-container {
    flex-direction: column;
    gap: 15px;
  }

  .dual-date-container .date-picker-item {
    width: 100%;
  }
}

/* 确保所有表单项对齐 */
.form-container :deep(.el-form-item) {
  margin-bottom: 22px;
}

.form-container :deep(.el-form-item__label) {
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
}
</style>