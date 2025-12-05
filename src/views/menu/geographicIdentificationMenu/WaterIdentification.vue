<template>
  <div>
    <!-- 功能选择选项卡 -->
    <div class="feature-tabs">
      <el-radio-group v-model="activeFeature" size="large">
        <el-radio-button label="upload">数据上传</el-radio-button>
        <el-radio-button label="identification">水体识别</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 数据上传功能 -->
    <div v-if="activeFeature === 'upload'" class="feature-container">
      <!-- 进度栏 -->
      <div class="steps-container">
        <a-steps :current="uploadCurrent">
          <a-step title="填写资料信息" />
          <a-step title="确认资料信息" />
          <a-step title="完成" />
        </a-steps>
      </div>

      <!-- 提示框 -->
      <div class="info-box" v-if="infoVisible">
        <span class="icon">🔔</span>
        资料上传成功后可在数据查询页面查看
        <el-button class="close-button" @click="hideInfo" type="text">×</el-button>
      </div>
        <el-form-item 
        label="数据类型：" 
        required 
        style="margin-left: 370px;"
        >
        <el-radio-group v-model="dataType" class="radio-group">
            <el-radio :label="1">SAR单模态</el-radio>
            <el-radio :label="2">光学单模态</el-radio>
            <el-radio :label="3">融合多模态</el-radio>
        </el-radio-group>
        </el-form-item>
      <!-- 表单填写页面 -->
      <div class="form-container" v-if="uploadCurrent === 0">
       <div class="upload-container" style="margin-top: 20px;">
    <!-- SAR单模态文件上传 -->
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
        <span style="font-size: 14px; color: #606266; white-space: nowrap; width: 100px;">SAR单模态：</span>
        <div style="flex: 1; display: flex; align-items: center;">
        <el-input 
            v-model="sarFilePath" 
            placeholder="请选择SAR文件" 
            readonly 
            style="width: 100%;"
            clearable
            @clear="handleRemoveFile('sar')" 
            @keydown.delete="handleKeydown($event, 'sar')"
            @focus="handleInputFocus('sar')"
            :disabled="isSarDisabled" 
        >
            <template #append>
            <el-button @click="handleSarBrowseClick" style="background-color: #409eff; color: white; border: none;" :disabled="isSarDisabled">
                浏览
            </el-button>
            </template>
        </el-input>
        <input 
            type="file" 
            ref="sarFileInput" 
            @change="handleSarFileSelect" 
            accept=".tif,.zip,.rar" 
            style="display: none;"
            :disabled="isSarDisabled"
        />
        </div>
    </div>
    
    <!-- 光学单模态文件上传 -->
    <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 14px; color: #606266; white-space: nowrap; width: 100px;">光学单模态：</span>
        <div style="flex: 1; display: flex; align-items: center;">
        <el-input 
            v-model="opticalFilePath" 
            placeholder="请选择光学文件" 
            readonly 
            style="width: 100%;"
            clearable
            @clear="handleRemoveFile('optical')"
            @keydown.delete="handleKeydown($event, 'optical')"
            @focus="handleInputFocus('optical')"
            :disabled="isOpticalDisabled"
        >
            <template #append>
            <el-button @click="handleOpticalBrowseClick" style="background-color: #409eff; color: white; border: none;" :disabled="isOpticalDisabled">
                浏览
            </el-button>
            </template>
        </el-input>
        <input 
            type="file" 
            ref="opticalFileInput" 
            @change="handleOpticalFileSelect" 
            accept=".tif,.zip,.rar" 
            style="display: none;"
            :disabled="isOpticalDisabled"
        />
        </div>
    </div>
    </div>

        <!-- 公共表单部分 -->
        <el-form :model="form" label-width="120px" style="width: 40%; margin: 0 auto">
          <el-form-item label="数据简介：" required>
            <el-input type="textarea" v-model="dataDescription" placeholder="请输入数据简介" rows="4" clearable></el-input>
          </el-form-item>
          <el-form-item label="发布人：" required>
            <el-input v-model="publisher" placeholder="请输入发布人姓名" clearable></el-input>
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
        </el-form>
        
        <!-- 按钮组 -->
        <div class="button-group">
          <el-button @click="handleCancel" class="cancel-button">取消</el-button>
          <el-button @click="handleSubmit" class="submit-button" type="primary">下一步</el-button>
        </div>
      </div>

      <!-- 文件确认页面 -->
      <div class="form-container" v-if="uploadCurrent === 1">
        <!-- 资料确认 -->
        <el-table :data="infoData" style="width: 60%; margin: 0 auto" border
          :header-cell-style="{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }">
          <el-table-column prop="title" label="信息项" width="150"></el-table-column>
          <el-table-column prop="value" label="内容"></el-table-column>
        </el-table>

        <!-- 文件列表 -->
        <div style="margin: 30px 0 20px; text-align: center">
          <h3>上传文件列表</h3>
          <el-table :data="files" style="width: 60%; margin: 0 auto" border
            :header-cell-style="{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }">
            <el-table-column prop="name" label="文件名"></el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button link type="danger" @click="removeFile(scope.$index)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="button-group">
          <el-button @click="handlePrevious" class="cancel-button">上一步</el-button>
          <el-button @click="handleConfirm" class="submit-button" type="primary">确认提交</el-button>
        </div>
      </div>

      <!-- 上传完成页面 -->
      <div class="form-container" v-if="uploadCurrent === 2">
        <div class="completion-icon">
          <el-icon size="60" color="#fff">
            <Check />
          </el-icon>
        </div>
        <h1 class="form-title">上传完成</h1>
        <p class="completion-tip">已成功上传 {{ files.length }} 个文件</p>
        <div class="button-group">
          <el-button @click="handleContinue" class="submit-button" type="primary">继续提交</el-button>
        </div>
      </div>
    </div>

    <!-- 水体识别功能 -->
    <div v-if="activeFeature === 'identification'" class="feature-container">
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

              <!-- 预测参数选项 -->
              <el-form-item label="预测参数">
                <el-checkbox-group v-model="predictOptions">
                  <el-checkbox label="preview_png">预览图</el-checkbox>
                  <el-checkbox label="confusion_matrix">检测参数</el-checkbox>
                  <el-checkbox label="result_file_download">结果文件下载</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
                   <!-- 修改：文件选择状态提示 -->
                <el-form-item label="文件状态">
                <div class="file-status">
                    <div v-if="sarFileObject" class="status-item">
                    <el-icon color="#67C23A"><Check /></el-icon>
                    <span>SAR文件: {{ sarFilePath }} ({{ (sarFileObject.size / 1024 / 1024).toFixed(2) }} MB)</span>
                    </div>
                    <div v-else class="status-item">
                    <el-icon color="#F56C6C"><Close /></el-icon>
                    <span>未选择SAR文件</span>
                    </div>
                    <div v-if="opticalFileObject" class="status-item">
                    <el-icon color="#67C23A"><Check /></el-icon>
                    <span>光学文件: {{ opticalFilePath }} ({{ (opticalFileObject.size / 1024 / 1024).toFixed(2) }} MB)</span>
                    </div>
                    <div v-else class="status-item">
                    <el-icon color="#F56C6C"><Close /></el-icon>
                    <span>未选择光学文件</span>
                    </div>
                </div>
                </el-form-item>
                <div class="button-group">
                <el-button 
                    @click="handlePredict" 
                    class="submit-button" 
                    type="primary" 
                    :loading="predictLoading"
                    :disabled="!sarFilePath && !opticalFilePath"
                >
                    {{ predictLoading ? '上传并预测中...' : '开始预测' }}
                </el-button>
                </div>
                <!-- 添加颜色选择器
              <el-form-item 
                label="类别颜色" 
                v-if="predictOptions.includes('preview_png')"
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
              </div> -->

              <!-- 结果获取参数选项 -->
              <!-- <el-divider />

              <el-form-item label="结果获取参数">
                <el-checkbox-group v-model="resultOptions">
                  <el-checkbox label="preview_png">预览图</el-checkbox>
                  <el-checkbox label="confusion_matrix">混淆矩阵</el-checkbox>
                  <el-checkbox label="class_stats">类别统计</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <div class="button-group">
                <el-button @click="fetchResultFiles" type="success" :loading="loadingResults" :disabled="!selectedModel">
                  获取预测结果
                </el-button>
              </div> -->
            </div>
          </div>
        </el-form>
      </div>

        <!-- 预测结果页面 -->
    <div class="result-container" v-if="predictCurrent === 1">
      <div class="result-content">
        <!-- 结果内容区域 - 真正的左右布局 -->
        <div style="display: flex; gap: 30px; align-items: flex-start;">
          <!-- 左边：检测参数 -->
          <div style="flex: 1.5; background: #f8f9fa; padding: 25px; border-radius: 10px; min-width: 300px;">
            <h3 style="margin: 0 0 20px 0; color: #303133;">检测参数</h3>
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e4e7ed;">
                <span style="font-weight: bold; color: #606266;">面积：</span>
                <span style="color: #303133;">{{ detectionData.area }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e4e7ed;">
                <span style="font-weight: bold; color: #606266;">周长：</span>
                <span style="color: #303133;">{{ detectionData.perimeter }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e4e7ed;">
                <span style="font-weight: bold; color: #606266;">覆盖率：</span>
                <span style="color: #303133;">{{ detectionData.coverage_rate }}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e4e7ed;">
                <span style="font-weight: bold; color: #606266;">日期：</span>
                <span style="color: #303133;">{{ detectionData.date }}</span>
              </div>
            </div>
            
            <div style="margin-top: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #303133;">结果文件下载</h3>
              <el-button @click="downloadPrediction" type="primary" plain icon="Download" style="width: 100%;">
                下载预测结果
              </el-button>
            </div>
          </div>

          <!-- 右边：预览图 -->
          <div style="flex: 1.5; background: #f8f9fa; padding: 25px; border-radius: 10px; min-width: 300px; text-align: center;">
            <div v-if="previewData">
              <img :src="previewData" alt="预测结果预览" style="max-width: 100%; max-height: 400px; border-radius: 8px;" />
              <el-button @click="openImageDialog" type="primary" plain style="margin-top: 15px; width: 100%;">
                <el-icon><ZoomIn /></el-icon>
                查看大图
              </el-button>
            </div>
            <div v-else style="color: #909399; padding: 40px;">
              <el-icon style="font-size: 48px; margin-bottom: 10px;"><Picture /></el-icon>
              <div>暂无预览图</div>
            </div>
          </div>
        </div>

          <!-- 操作按钮 -->
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 30px;">
          <el-button @click="handlePredictPrevious" icon="Back" >
          上一步
          </el-button>
          <el-button @click="handlePredictContinue" type="primary" icon="Refresh" >
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
  </div>
</template>

<script setup>
import { watch,ref, onMounted, computed } from 'vue'
import { message, Upload } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { Check, Picture, Download, Back, Refresh, ZoomIn } from '@element-plus/icons-vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn,
  ElButton,
  ElLoading,
  ElLink,
  ElIcon,
  ElRadioGroup,
  ElRadioButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElSelect,
  ElOption,
  ElDivider,
  ElDialog
} from 'element-plus'
import { 
  modelFilesUpload, 
  getModelByClassName, 
  landPredictByCommons, 
  getWaterResult, 
  getLandResultPreview, 
  getLandResultConfusionMatrix, 
  getLandResultConfusionMatrixClassStats 
} from '@/api/getData'


// 功能选项卡状态
const activeFeature = ref('upload')
const dataType = ref(1) 
// 计算属性
const isSarDisabled = computed(() => dataType.value === 2)
const isOpticalDisabled = computed(() => dataType.value === 1)

// 上传功能相关状态
const className = ref('land')
const loadingoptions = {
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据上传中...'
}
const userinfo = JSON.parse(localStorage.getItem('Userinfo'))
const uploadCurrent = ref(0)
const infoVisible = ref(true)
const files = ref([])
const publisher = ref(userinfo?.username || '')
const dataDescription = ref('')
const observationDate = ref('')
const infoData = ref([
  { title: '数据简介', value: dataDescription.value },
  { title: '发布人', value: publisher.value }
])

// 识别功能相关状态
const predictCurrent = ref(0)
const models = ref([])
const selectedModel = ref('')
const predictOptions = ref(['preview_png', 'confusion_matrix', 'result_file_download'])
const resultOptions = ref(['preview_png', 'confusion_matrix', 'result_file_download'])
const detectionData = ref(null) // 新增：存储检测参数数据
const previewData = ref('')
const downloadFiles = ref({})
const predictLoading = ref(false)
const loadingResults = ref(false)
const error = ref('')
const imageDialogVisible = ref(false)


// 新增：SAR和光学文件上传相关状态
const sarFilePath = ref('')
const opticalFilePath = ref('')
// 新增：存储文件对象
const sarFileObject = ref(null)
const opticalFileObject = ref(null)
const sarFileInput = ref(null)
const opticalFileInput = ref(null)
// 新增：当前获得焦点的输入框类型
const focusedInput = ref('')
// 新增：输入框获得焦点时记录类型
const handleInputFocus = (type) => {
  focusedInput.value = type
}

// 修复：SAR文件浏览按钮点击事件（添加空值检查）
const handleSarBrowseClick = () => {
  if (isSarDisabled.value) return
  if (sarFileInput.value) {
    sarFileInput.value.click()
  }
}

// 修复：光学文件浏览按钮点击事件（添加空值检查）
const handleOpticalBrowseClick = () => {
    if (isOpticalDisabled.value) return
  if (opticalFileInput.value) {
    opticalFileInput.value.click()
  }
}

// 新增：SAR文件选择处理（关联现有的beforeUpload验证）
const handleSarFileSelect = (event) => {
  if (isSarDisabled.value) return
  const file = event.target.files[0]
  if (file) {
    const isValid = beforeUpload(file)  // 只做验证，不添加
    if (isValid === false) {
      event.target.value = ''
      return
    }
    
    // 只更新显示路径，不添加到files列表
    sarFilePath.value = file.name
    // 注意：这里不执行 files.value.push(file)
    sarFileObject.value = file  // 存储文件对象
    event.target.value = '' // 清空input
  }
}

// 新增：光学文件选择处理（关联现有的beforeUpload验证）
const handleOpticalFileSelect = (event) => {
    if (isOpticalDisabled.value) return
  const file = event.target.files[0]
  if (file) {
    const isValid = beforeUpload(file)  // 只做验证，不添加
    if (isValid === false) {
      event.target.value = ''
      return
    }
    
    // 只更新显示路径，不添加到files列表
    opticalFilePath.value = file.name
    // 注意：这里不执行 files.value.push(file)
    opticalFileObject.value = file  // 存储文件对象
    event.target.value = '' // 清空input
  }
}

// 修改：移除文件函数（不需要操作files列表）
const handleRemoveFile = (type) => {
  if (type === 'sar') {
    sarFilePath.value = ''
    sarFileObject.value = null  // 清除文件对象
    sarFileInput.value && (sarFileInput.value.value = '')
  } else if (type === 'optical') {
    opticalFilePath.value = ''
    opticalFileObject.value = null  // 清除文件对象
    opticalFileInput.value && (opticalFileInput.value.value = '')
  }
}
// 在组件中添加watch来监控文件路径变化
watch([sarFilePath, opticalFilePath], ([newSarPath, newOpticalPath]) => {
  console.log('SAR文件路径变化:', newSarPath)
  console.log('光学文件路径变化:', newOpticalPath)
})
// 修复：使用更可靠的按键检测
const handleKeydown = (event, type) => {
  console.log('按键码:', event.keyCode, '按键:', event.key)
  
  // 同时检测 keyCode 和 key
  const isDelete = event.key === 'Delete' || event.keyCode === 46
  const isBackspace = event.key === 'Backspace' || event.keyCode === 8
  
  if (isDelete || isBackspace) {
    console.log('触发删除')
    event.preventDefault()
    event.stopPropagation()
    handleRemoveFile(type)
  }
}

// 新增颜色映射状态
const colorMap = ref({
  "-1": "#CCCCCC",
  0: '#FFFF00', // 农田 - 黄色
  1: '#008000', // 林地 - 深绿色
  2: '#0000FF', // 水体 - 蓝色
  3: '#FF0000'  // 城市 - 红色
})

// 类别名称映射
const classNames = {
  "-1": "无效/边界区域",
  0: '农田',
  1: '林地', 
  2: '水体',
  3: '城市'
}

// 监听选择的模型变化
watch(selectedModel, (newVal) => {
  if (!newVal) return
  
  // 获取当前选择的模型
  const currentModel = models.value.find(m => m.modelName === newVal)
  if (!currentModel || !currentModel.functions) return
  
  // 将功能字符串转换为数组
  const availableFunctions = currentModel.functions.split(',')
  
  // 过滤预测选项，只保留可用的功能
  predictOptions.value = predictOptions.value.filter(option => 
    availableFunctions.includes(option)
  )
  
  // 过滤结果选项，只保留可用的功能
  resultOptions.value = resultOptions.value.filter(option => 
    availableFunctions.includes(option)
  )
})


// 计算是否有可下载文件
const hasDownloadableFiles = computed(() => {
  return downloadFiles.value.confusion_matrix || downloadFiles.value.class_stats
})

// 打开大图对话框
const openImageDialog = () => {
  imageDialogVisible.value = true
}

// 上传功能方法
onMounted(() => {
  // 初始化用户信息
  if (userinfo) {
    publisher.value = userinfo.username || ''
  }
  
  // 获取模型数据
  fetchModels()
})

// 修改：beforeUpload函数只做验证，不添加文件
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
  
  // 移除 files.value.push(file) 逻辑
  return true  // 验证通过返回true
}


function removeFile(index) {
  files.value.splice(index, 1)
}

function onRemove(file) {
  const index = files.value.findIndex(f => f.uid === file.uid)
  if (index !== -1) {
    files.value.splice(index, 1)
  }
}

function handleSubmit() {
  // 添加文件确认逻辑
  confirmFiles()
  
  // 添加观测日期校验
  if (!publisher.value || !dataDescription.value || !observationDate.value) {
    message.error('请填写完整表单信息')
    return
  }
  
  if (files.value.length === 0) {
    message.error('请至少上传一个文件')
    return
  }
  
  // 更新确认信息（添加观测日期）
  infoData.value = [
    { title: '数据简介', value: dataDescription.value || '无' },
    { title: '发布人', value: publisher.value },
    { title: '观测日期', value: observationDate.value }
  ]
  
  uploadCurrent.value = 1
}

// 新增：确认最终文件函数
const confirmFiles = () => {
  // 清空现有文件列表
  files.value = []
  
  // 添加SAR文件（如果选择了）
  if (sarFilePath.value) {
    // 从input中获取文件对象
    if (sarFileInput.value && sarFileInput.value.files && sarFileInput.value.files[0]) {
      const sarFile = sarFileInput.value.files[0]
      if (beforeUpload(sarFile) !== false) {  // 使用现有的验证函数
        files.value.push(sarFile)
      }
    } else {
      // 如果无法从input获取文件，创建一个模拟文件对象
      const sarFile = new File([], sarFilePath.value, { type: 'image/tiff' })
      files.value.push(sarFile)
    }
  }
  
  // 添加光学文件（如果选择了）
  if (opticalFilePath.value) {
    if (opticalFileInput.value && opticalFileInput.value.files && opticalFileInput.value.files[0]) {
      const opticalFile = opticalFileInput.value.files[0]
      if (beforeUpload(opticalFile) !== false) {
        files.value.push(opticalFile)
      }
    } else {
      const opticalFile = new File([], opticalFilePath.value, { type: 'image/tiff' })
      files.value.push(opticalFile)
    }
  }
  
  console.log('最终确认的文件列表:', files.value.map(f => f.name))
}

function handleCancel() {
  publisher.value = userinfo?.username || ''
  dataDescription.value = ''
  observationDate.value = '' // 重置观测日期
  files.value = []
}

function handlePrevious() {
  uploadCurrent.value = 0
}
//确认提交按钮
async function handleConfirm() {
  if (files.value.length === 0) {
    message.error('没有可上传的文件')
    return
  }
  
  const loadingInstance = ElLoading.service(loadingoptions)
  
  try {
    for (const file of files.value) {
      const formData = new FormData()
      formData.append('fileMul', file)
      formData.append('createUserId', userinfo?.id || '')
      formData.append('userName', publisher.value)
      formData.append('dataIntroduction', dataDescription.value)
      formData.append('className', className.value)
      // 添加观测日期到表单数据
      formData.append('observationTime', observationDate.value)
      
      const res = await modelFilesUpload(formData)
      
      if (res.code === 'SUCCESS') {
        message.success(`${file.name} 上传成功`)
      } else {
        message.error(`${file.name} 上传失败: ${res.msg}`)
      }
    }
    
    uploadCurrent.value = 2
  } catch (error) {
    console.error('上传失败:', error)
    message.error('上传过程中发生错误')
  } finally {
    loadingInstance.close()
  }
}

function handleContinue() {
  files.value = []
  dataDescription.value = ''
  observationDate.value = '' // 重置观测日期
  uploadCurrent.value = 0
}

function hideInfo() {
  infoVisible.value = false
}

// 识别功能方法
// 获取模型数据
const fetchModels = () => {
  getModelByClassName({ className: "water" })
    .then((res) => {
      // 根据第一个接口的处理方式调整
      const response = res?.response?.value || res?.value || res

      if (response?.code === 'SUCCESS') {
        models.value = response?.body || []

        if (models.value.length > 0) {
          selectedModel.value = models.value[0].modelName
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


// 新增：专门用于预测的文件上传函数
const uploadFilesForPrediction = async () => {
  const uploadedPaths = { sarFile: '', optFile: '' }
  
  // 上传SAR文件
  if (sarFilePath.value && sarFileInput.value?.files?.[0]) {
    const sarFile = sarFileInput.value.files[0]
    const formData = new FormData()
    formData.append('fileMul', sarFile)
    formData.append('createUserId', userinfo?.id || '')
    formData.append('userName', publisher.value || '预测用户')
    formData.append('dataIntroduction', '水体识别预测文件')
    formData.append('className', 'water')
    formData.append('observationTime', new Date().toISOString().split('T')[0])
    
    const res = await modelFilesUpload(formData)
    if (res.code === 'SUCCESS') {
      uploadedPaths.sarFile = res.body.filePath // 假设后端返回文件路径
      message.success('SAR文件上传成功')
    } else {
      throw new Error(`SAR文件上传失败: ${res.msg}`)
    }
  }
  
  // 上传光学文件
  if (opticalFilePath.value && opticalFileInput.value?.files?.[0]) {
    const opticalFile = opticalFileInput.value.files[0]
    const formData = new FormData()
    formData.append('fileMul', opticalFile)
    formData.append('createUserId', userinfo?.id || '')
    formData.append('userName', publisher.value || '预测用户')
    formData.append('dataIntroduction', '水体识别预测文件')
    formData.append('className', 'water')
    formData.append('observationTime', new Date().toISOString().split('T')[0])
    
    const res = await modelFilesUpload(formData)
    if (res.code === 'SUCCESS') {
      uploadedPaths.optFile = res.body.filePath // 假设后端返回文件路径
      message.success('光学文件上传成功')
    } else {
      throw new Error(`光学文件上传失败: ${res.msg}`)
    }
  }
  return uploadedPaths
}
// 获取结果文件
const fetchResultFiles = () => {
  if (!selectedModel.value) {
    message.error('请选择模型')
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
    createUserId: userinfo.id
  }

  getWaterResult(params)
    .then((res) => {
      console.log('getWaterResult 完整响应:', res)

      // 提取实际响应数据
      const response = res?.response?.value || res?.value || res
      console.log('处理后的响应数据:', response)

      if (response?.code === 'SUCCESS') {
        // 保存文件端点信息
        downloadFiles.value = response.body?.urls || {}
        console.log('下载文件信息:', downloadFiles.value)

        // 如果有预览图，加载预览图
        if (downloadFiles.value.preview_png) {
          loadPreviewImage()
        }

        message.success('结果获取成功')
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
// 修改：处理预测请求 - 直接传递文件对象
const handlePredict = async () => {
  if (!selectedModel.value) {
    message.error('请选择预测模型')
    return
  }

  // 检查是否已选择文件
  if (!sarFileObject.value && !opticalFileObject.value) {
    message.error('请先选择要预测的文件')
    return
  }

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    message.error('用户信息未找到，请重新登录')
    return
  }

  const userinfo = JSON.parse(userData)

  predictLoading.value = true
  error.value = ''

  try {
    // 创建FormData对象，直接传递文件
    const formData = new FormData()
    formData.append('model', selectedModel.value)
    
    // 新增：直接添加文件对象
    if (sarFileObject.value) {
      formData.append('sarFile', sarFileObject.value)
    }
    if (opticalFileObject.value) {
      formData.append('optFile', opticalFileObject.value)
    }
    
    formData.append('userName', userinfo.username)
    formData.append('createUserId', userinfo.id)

    // 修改：传递config参数
    const res = await getWaterResult(formData)
    const response = res?.response?.value || res?.value || res

    if (response?.code === 'SUCCESS') {
      message.success('预测完成')
      // 保存检测参数数据
      if (response.body && response.body.length > 0) {
        detectionData.value = response.body[0]
        // 修改：使用代理接口加载预览图
        await loadPreviewImage(response.body[0].image_png)
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
    previewData.value = '';
    message.error('图片路径为空');
    return;
  }
  
  try {
    console.log('尝试加载预览图，路径:', imagePath);
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
      const errorText = await response.text();
      console.error('预览图请求失败:', response.status, errorText);
      message.error(`加载失败: ${errorText || '未知错误'}`);
      previewData.value = '';
      return;
    }

    const contentType = response.headers.get('Content-Type');
    console.log('响应Content-Type:', contentType);
    if (!contentType || !contentType.startsWith('image/')) {
      const errorText = await response.text();
      console.error('非图片响应内容:', errorText);
      message.error('返回的内容不是有效图片: ' + (errorText || contentType));
      previewData.value = '';
      return;
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      console.error('图片数据为空');
      message.error('图片数据为空');
      previewData.value = '';
      return;
    }

    const imageUrl = URL.createObjectURL(blob);
    previewData.value = imageUrl;
    
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => console.log('图片成功加载');
    img.onerror = () => {
      console.error('图片加载失败');
      previewData.value = '';
      message.error('图片加载失败，无法显示');
      URL.revokeObjectURL(imageUrl);
    };
    
    return () => URL.revokeObjectURL(imageUrl);
  } catch (error) {
    console.error('加载预览图失败:', error);
    previewData.value = '';
    message.error('无法加载预览图: ' + error.message);
  }
}

// 修改：下载预测结果文件
const downloadPrediction = async () => {
  if (!detectionData.value || !detectionData.value.prediction) {
    message.error('没有可下载的预测结果文件');
    return;
  }

  const predictionPath = detectionData.value.prediction;
  const fileName = predictionPath.split(/[\\/]/).pop() || 'prediction.tif';
  
  try {
    // 新增：添加时间戳避免缓存
    const timestamp = Date.now();
    const response = await fetch(`/api/proxy/download?t=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 新增：添加适当的认证头
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
    
    // 修改：添加文件类型和大小检查
    if (blob.size < 10) {
      throw new Error('文件大小异常');
    }

    // 新增：从响应头获取文件名（如果后端提供）
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
    
    // 修改：延迟清理URL以确保下载完成
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

// 继续预测
const handlePredictContinue = () => {
  predictCurrent.value = 0
}
</script>

<style scoped>
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
/* 新增：检测参数样式 */
.detection-params {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.detection-params h3 {
  margin-bottom: 15px;
  color: #303133;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.param-label {
  font-weight: bold;
  color: #606266;
}

.param-value {
  color: #303133;
}
/* 新增：检测参数样式 */
.radio-group {
  display: flex;
  gap: 30px;
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

/* 功能选项卡样式 */
.feature-tabs {
  display: flex;
  justify-content: center;
  margin: 20px 0 30px;
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

/* 信息提示框 */
.info-box {
  width: 50%;
  background-color: #f0f9ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px auto;
  font-size: 14px;
}

.icon {
  margin-right: 12px;
  font-size: 18px;
}

.close-button {
  background: none;
  border: none;
  color: #1890ff;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
}

.close-button:hover {
  color: #ff4d4f;
}

/* 上传容器 */
.upload-container {
  margin: 30px auto;
  width: 50%;
}

.ant-upload-drag-icon {
  margin-bottom: 16px;
}

.ant-upload-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.ant-upload-hint {
  color: #666;
  font-size: 14px;
}

.download-template {
  margin-top: 15px;
}

/* 表单容器 */
.form-container {
  margin: 30px auto 40px;
  width: 80%;
}

/* 按钮组 */
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

/* 完成图标 */
.completion-icon {
  width: 100px;
  height: 100px;
  background: #52c41a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px auto;
}

.form-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.completion-tip {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.el-form-item {
  margin-bottom: 22px;
}

.el-table {
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

/* 表单布局 */
.form-horizontal-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.form-column-full {
  flex: 0 0 100%;
  padding: 0 20px;
}

/* 结果容器 */
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

/* 下载区域样式 */
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

/* 分割线样式 */
.el-divider {
  margin: 25px 0;
}

/* 查看大图按钮 */
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

/* 响应式调整 */
@media (max-width: 992px) {
  .upload-container,
  .info-box {
    width: 90%;
  }
  
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