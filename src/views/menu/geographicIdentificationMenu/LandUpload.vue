<template>
  <div class="feature-container">
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

    <!-- 上传类型选择 -->
    <div class="upload-type-selector" v-if="uploadCurrent === 0">
      <el-radio-group v-model="uploadType" @change="handleUploadTypeChange">
        <el-radio label="dual">双极化数据提交</el-radio>
        <el-radio label="full">全极化数据提交</el-radio>
      </el-radio-group>
    </div>

    <!-- 表单填写页面 -->
    <div class="form-container" v-if="uploadCurrent === 0">
      <!-- 文件上传部分 -->
      <div class="upload-container" v-if="uploadType === 'full'">
        <Dragger :multiple="false" accept=".tif,.zip" style="margin-top: 20px" :beforeUpload="beforeUpload"
          :customRequest="handleCustomRequest" :fileList="files" :onRemove="onRemove">
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
          <p class="ant-upload-hint">支持扩展名：.tif 或 .zip（单个文件）</p>
        </Dragger>
      </div>

      <!-- 双极化数据文件上传区域 -->
      <div class="dual-upload-container" v-if="uploadType === 'dual'">
        <div class="file-upload-section">
          <h4>时段1 VV数据：</h4>
          <div class="file-input-group">
            <el-input v-model="preVVFilePath" placeholder="请选择时段1 VV文件" readonly style="width: 100%;" clearable
              @clear="handleRemoveFile('preVV')" @keydown.delete="handleKeydown($event, 'preVV')"
              @focus="handleInputFocus('preVV')">
              <template #append>
                <el-button @click="handlePreVVBrowseClick"
                  style="background-color: #409eff; color: white; border: none;">
                  浏览
                </el-button>
              </template>
            </el-input>
            <input type="file" ref="preVVFileInput" @change="handlePreVVFileSelect" accept=".tif"
              style="display: none;" />
          </div>
        </div>

        <div class="file-upload-section">
          <h4>时段1 VH数据：</h4>
          <div class="file-input-group">
            <el-input v-model="preVHFilePath" placeholder="请选择时段1 VH文件" readonly style="width: 100%;" clearable
              @clear="handleRemoveFile('preVH')" @keydown.delete="handleKeydown($event, 'preVH')"
              @focus="handleInputFocus('preVH')">
              <template #append>
                <el-button @click="handlePreVHBrowseClick"
                  style="background-color: #409eff; color: white; border: none;">
                  浏览
                </el-button>
              </template>
            </el-input>
            <input type="file" ref="preVHFileInput" @change="handlePreVHFileSelect" accept=".tif"
              style="display: none;" />
          </div>
        </div>

        <div class="file-upload-section">
          <h4>时段2 VV数据：</h4>
          <div class="file-input-group">
            <el-input v-model="nextVVFilePath" placeholder="请选择时段2 VV文件" readonly style="width: 100%;" clearable
              @clear="handleRemoveFile('nextVV')" @keydown.delete="handleKeydown($event, 'nextVV')"
              @focus="handleInputFocus('nextVV')">
              <template #append>
                <el-button @click="handleNextVVBrowseClick"
                  style="background-color: #409eff; color: white; border: none;">
                  浏览
                </el-button>
              </template>
            </el-input>
            <input type="file" ref="nextVVFileInput" @change="handleNextVVFileSelect" accept=".tif"
              style="display: none;" />
          </div>
        </div>

        <div class="file-upload-section">
          <h4>时段2 VH数据：</h4>
          <div class="file-input-group">
            <el-input v-model="nextVHFilePath" placeholder="请选择时段2 VH文件" readonly style="width: 100%;" clearable
              @clear="handleRemoveFile('nextVH')" @keydown.delete="handleKeydown($event, 'nextVH')"
              @focus="handleInputFocus('nextVH')">
              <template #append>
                <el-button @click="handleNextVHBrowseClick"
                  style="background-color: #409eff; color: white; border: none;">
                  浏览
                </el-button>
              </template>
            </el-input>
            <input type="file" ref="nextVHFileInput" @change="handleNextVHFileSelect" accept=".tif"
              style="display: none;" />
          </div>
        </div>

        <!-- 文件状态显示 -->
        <div class="file-status-section">
          <h4>文件状态：</h4>
          <div class="file-status">
            <div v-for="file in dualFileStatus" :key="file.type" class="status-item">
              <el-icon :color="file.uploaded ? '#67C23A' : '#F56C6C'">
                <Check v-if="file.uploaded" />
                <Close v-else />
              </el-icon>
              <span>{{ file.label }}: {{ file.uploaded ? file.name : '未选择' }}</span>
            </div>
          </div>
          <p v-if="hasMissingDualFiles" class="missing-warning">
            请确保上传所有4个必需的文件！
          </p>
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
          <el-date-picker v-model="observationDate" type="date" placeholder="选择日期" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" style="width: 100%"></el-date-picker>
        </el-form-item>

        <!-- 模型名称字段 -->
        <el-form-item label="模型名称：" required>
          <el-select v-model="modelName" placeholder="请选择模型" style="width: 100%" disabled>
            <el-option v-for="model in availableModels" :key="model.value" :label="model.label"
              :value="model.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 按钮组 -->
      <div class="button-group">
        <el-button @click="handleCancel" class="cancel-button">取消</el-button>
        <el-button @click="handleSubmit" class="submit-button" type="primary" :disabled="!isFormValid">下一步</el-button>
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
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { message, Upload } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { Check, Close } from '@element-plus/icons-vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn,
  ElButton,
  ElLoading,
  ElIcon,
  ElDatePicker,
  ElRadioGroup,
  ElRadio,
  ElSelect,
  ElOption
} from 'element-plus'
import { modelFilesUpload, landFilesUploadMul } from '@/api/getData'

const { Dragger } = Upload

// 定义emit事件
const emit = defineEmits(['cancel', 'continue'])

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
const uploadType = ref('dual') // 'dual' 或 'full'
const modelName = ref('')

// 双极化数据文件相关状态
const preVVFilePath = ref('')
const preVHFilePath = ref('')
const nextVVFilePath = ref('')
const nextVHFilePath = ref('')
const preVVFileObject = ref(null)
const preVHFileObject = ref(null)
const nextVVFileObject = ref(null)
const nextVHFileObject = ref(null)
const preVVFileInput = ref(null)
const preVHFileInput = ref(null)
const nextVVFileInput = ref(null)
const nextVHFileInput = ref(null)
const focusedInput = ref('')

// 可用模型列表
const availableModels = ref([
  { label: '双极化模型', value: 'dualModel' },
  { label: '全极化模型', value: 'fullModel' }
])

const infoData = ref([
  { title: '数据简介', value: dataDescription.value },
  { title: '发布人', value: publisher.value }
])

// 计算属性
const form = computed(() => ({
  dataDescription: dataDescription.value,
  publisher: publisher.value,
  observationDate: observationDate.value,
  uploadType: uploadType.value,
  modelName: modelName.value
}))

// 双极化文件状态计算
const dualFileStatus = computed(() => [
  { type: 'preVV', label: '时段1 VV', uploaded: !!preVVFilePath.value, name: preVVFilePath.value },
  { type: 'preVH', label: '时段1 VH', uploaded: !!preVHFilePath.value, name: preVHFilePath.value },
  { type: 'nextVV', label: '时段2 VV', uploaded: !!nextVVFilePath.value, name: nextVVFilePath.value },
  { type: 'nextVH', label: '时段2 VH', uploaded: !!nextVHFilePath.value, name: nextVHFilePath.value }
])

// 检查是否有缺失的双极化文件
const hasMissingDualFiles = computed(() => {
  return uploadType.value === 'dual' && (
    !preVVFilePath.value ||
    !preVHFilePath.value ||
    !nextVVFilePath.value ||
    !nextVHFilePath.value
  )
})

// 表单验证
const isFormValid = computed(() => {
  if (!publisher.value || !dataDescription.value || !observationDate.value) {
    return false
  }

  if (uploadType.value === 'full') {
    return files.value.length > 0
  } else {
    return !hasMissingDualFiles.value
  }
})

// 生命周期
onMounted(() => {
  if (userinfo) {
    publisher.value = userinfo.username || ''
  }
  // 根据初始上传类型设置模型名称
  updateModelName()
})

// 监听上传类型变化
watch(uploadType, () => {
  files.value = []
  clearDualFiles()
  updateModelName()
})

// 更新模型名称
const updateModelName = () => {
  modelName.value = uploadType.value === 'dual' ? 'dualModel' : 'fullModel'
}

// 处理上传类型变化
const handleUploadTypeChange = () => {
  files.value = []
  clearDualFiles()
  updateModelName()
}

// 清空双极化文件
const clearDualFiles = () => {
  preVVFilePath.value = ''
  preVHFilePath.value = ''
  nextVVFilePath.value = ''
  nextVHFilePath.value = ''
  preVVFileObject.value = null
  preVHFileObject.value = null
  nextVVFileObject.value = null
  nextVHFileObject.value = null
}

// 文件浏览按钮点击事件
const handlePreVVBrowseClick = () => {
  if (preVVFileInput.value) {
    preVVFileInput.value.click()
  }
}

const handlePreVHBrowseClick = () => {
  if (preVHFileInput.value) {
    preVHFileInput.value.click()
  }
}

const handleNextVVBrowseClick = () => {
  if (nextVVFileInput.value) {
    nextVVFileInput.value.click()
  }
}

const handleNextVHBrowseClick = () => {
  if (nextVHFileInput.value) {
    nextVHFileInput.value.click()
  }
}

// 文件选择处理
const handlePreVVFileSelect = (event) => {
  handleDualFileSelect(event, 'preVV')
}

const handlePreVHFileSelect = (event) => {
  handleDualFileSelect(event, 'preVH')
}

const handleNextVVFileSelect = (event) => {
  handleDualFileSelect(event, 'nextVV')
}

const handleNextVHFileSelect = (event) => {
  handleDualFileSelect(event, 'nextVH')
}

// 统一的文件选择处理
const handleDualFileSelect = (event, fileType) => {
  const file = event.target.files[0]
  if (file) {
    const isValid = beforeUpload(file)
    if (isValid === false) {
      event.target.value = ''
      return
    }

    // 更新文件路径和对象
    switch (fileType) {
      case 'preVV':
        preVVFilePath.value = file.name
        preVVFileObject.value = file
        break
      case 'preVH':
        preVHFilePath.value = file.name
        preVHFileObject.value = file
        break
      case 'nextVV':
        nextVVFilePath.value = file.name
        nextVVFileObject.value = file
        break
      case 'nextVH':
        nextVHFilePath.value = file.name
        nextVHFileObject.value = file
        break
    }

    event.target.value = '' // 清空input
  }
}

// 移除文件
const handleRemoveFile = (fileType) => {
  switch (fileType) {
    case 'preVV':
      preVVFilePath.value = ''
      preVVFileObject.value = null
      preVVFileInput.value && (preVVFileInput.value.value = '')
      break
    case 'preVH':
      preVHFilePath.value = ''
      preVHFileObject.value = null
      preVHFileInput.value && (preVHFileInput.value.value = '')
      break
    case 'nextVV':
      nextVVFilePath.value = ''
      nextVVFileObject.value = null
      nextVVFileInput.value && (nextVVFileInput.value.value = '')
      break
    case 'nextVH':
      nextVHFilePath.value = ''
      nextVHFileObject.value = null
      nextVHFileInput.value && (nextVHFileInput.value.value = '')
      break
  }
}

// 输入框焦点处理
const handleInputFocus = (type) => {
  focusedInput.value = type
}

// 按键处理
const handleKeydown = (event, type) => {
  const isDelete = event.key === 'Delete' || event.keyCode === 46
  const isBackspace = event.key === 'Backspace' || event.keyCode === 8

  if (isDelete || isBackspace) {
    event.preventDefault()
    event.stopPropagation()
    handleRemoveFile(type)
  }
}

// 文件验证
function beforeUpload(file) {
  const validTypes = ['.tif', '.zip']
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

// 全极化文件处理方法
function onRemove(file) {
  const index = files.value.findIndex(f => f.uid === file.uid)
  if (index !== -1) {
    files.value.splice(index, 1)
  }
}

function removeFile(index) {
  files.value.splice(index, 1)
}

function handleCustomRequest({ file, onSuccess, onError }) {
  files.value.push(file)
  message.success(`${file.name} 已添加到上传列表`)
  onSuccess()
}

// 提交处理
function handleSubmit() {
  if (!isFormValid.value) {
    message.error('请填写完整表单信息')
    return
  }

  // 确认文件
  confirmFiles()

  infoData.value = [
    { title: '数据简介', value: dataDescription.value || '无' },
    { title: '发布人', value: publisher.value },
    { title: '观测日期', value: observationDate.value },
    { title: '数据类型', value: uploadType.value === 'dual' ? '双极化数据' : '全极化数据' },
    { title: '模型名称', value: modelName.value }
  ]

  uploadCurrent.value = 1
}

// 确认文件函数
const confirmFiles = () => {
  // 只在双极化模式下重新组装文件列表
  if (uploadType.value === 'dual') {
    files.value = []

    // 双极化数据：添加4个文件
    const dualFiles = [
      { file: preVVFileObject.value, type: 'preVV' },
      { file: preVHFileObject.value, type: 'preVH' },
      { file: nextVVFileObject.value, type: 'nextVV' },
      { file: nextVHFileObject.value, type: 'nextVH' }
    ]

    dualFiles.forEach(item => {
      if (item.file && beforeUpload(item.file) !== false) {
        files.value.push(item.file)
      }
    })
  }
  // 全极化数据：保持原有文件列表，不进行任何操作
}
function handleCancel() {
  publisher.value = userinfo?.username || ''
  dataDescription.value = ''
  observationDate.value = ''
  files.value = []
  clearDualFiles()
  uploadType.value = 'dual'
  modelName.value = 'dualModel'
  emit('cancel')
}

function handlePrevious() {
  uploadCurrent.value = 0
}

// 确认提交
async function handleConfirm() {
  if (files.value.length === 0) {
    message.error('没有可上传的文件')
    return
  }

  const loadingInstance = ElLoading.service(loadingoptions)

  if (uploadType.value === 'full') {
    // 全极化数据 - 使用原来的单文件上传接口
    let allSuccess = true

    const formData = new FormData()
    formData.append('tiffile', files.value[0])
    formData.append('createUserId', userinfo?.id || '')
    formData.append('userName', publisher.value)
    formData.append('dataIntroduction', dataDescription.value)
    formData.append('className', className.value)
    formData.append('observationTime', observationDate.value)
    formData.append('modelName', modelName.value)
    modelFilesUpload(formData)
      .then((res) => {
        const response = res.response.value
        console.log(response)
        // 检查是否为Blob类型且可能是JSON错误响应
        if (response instanceof Blob && response.type === 'application/json') {
          // 读取Blob内容并解析
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result)
              if (!errorData.success) {
                message.error(`上传失败: ${errorData.msg}`)
              } else {
                // 如果success为true，说明是成功响应
                message.success(`成功上传 ${files.value.length} 个文件`)
                uploadCurrent.value = 2
              }
            } catch (e) {
              console.error('解析响应失败:', e)
              message.error('上传过程中发生错误')
            }
          }
          reader.readAsText(response)
        } else {
          // 正常成功响应
          console.log(response)
          message.success(`成功上传 ${files.value.length} 个文件`)
          uploadCurrent.value = 2
        }
      })
      .catch((error) => {
        console.error('上传失败:', error)
        message.error('上传过程中发生错误')
        allSuccess = false
      })

    if (allSuccess) {
      uploadCurrent.value = 2
    } else {
      message.error('部分文件上传失败，请检查后重新提交')
    }
  } else {
    // 双极化数据 - 使用新的多文件上传接口
    const formData = new FormData()

    // 为每个文件添加后缀并添加到FormData
    files.value.forEach(file => {
      let newFileName = file.name

      // 根据文件对象确定类型并添加后缀
      if (file === preVVFileObject.value) {
        newFileName = file.name.replace('.tif', '_pre_VV.tif')
      } else if (file === preVHFileObject.value) {
        newFileName = file.name.replace('.tif', '_pre_VH.tif')
      } else if (file === nextVVFileObject.value) {
        newFileName = file.name.replace('.tif', '_next_VV.tif')
      } else if (file === nextVHFileObject.value) {
        newFileName = file.name.replace('.tif', '_next_VH.tif')
      }

      // 创建新文件对象（带新文件名）
      const newFile = new File([file], newFileName, { type: file.type })
      formData.append('tiffiles', newFile)
    })

    // 添加其他表单数据
    formData.append('createUserId', userinfo?.id || '')
    formData.append('userName', publisher.value)
    formData.append('dataIntroduction', dataDescription.value)
    formData.append('className', className.value)
    formData.append('observationTime', observationDate.value)
    formData.append('modelName', modelName.value)
    // 使用多文件上传接口
    landFilesUploadMul(formData)
      .then((res) => {
        const response = res.response.value

        // 检查是否为Blob类型且可能是JSON错误响应
        if (response instanceof Blob && response.type === 'application/json') {
          // 读取Blob内容并解析
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result)
              if (!errorData.success) {
                message.error(`上传失败: ${errorData.msg}`)
              } else {
                // 如果success为true，说明是成功响应
                message.success(`成功上传 ${files.value.length} 个文件`)
                uploadCurrent.value = 2
              }
            } catch (e) {
              console.error('解析响应失败:', e)
              message.error('上传过程中发生错误')
            }
          }
          reader.readAsText(response)
        } else {
          // 正常成功响应
          console.log(response)
          message.success(`成功上传 ${files.value.length} 个文件`)
          uploadCurrent.value = 2
        }
      })
      .catch((error) => {
        console.error('上传失败:', error)
        message.error('上传过程中发生错误')
      })

  }
  loadingInstance.close()
}

function handleContinue() {
  files.value = []
  dataDescription.value = ''
  observationDate.value = ''
  clearDualFiles()
  uploadType.value = 'dual'
  modelName.value = 'dualModel'
  uploadCurrent.value = 0
  emit('continue')
}

function hideInfo() {
  infoVisible.value = false
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

.upload-type-selector {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

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

.upload-container {
  margin: 30px auto;
  width: 50%;
}

.dual-upload-container {
  margin: 30px auto;
  width: 60%;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.file-upload-section {
  margin-bottom: 20px;
}

.file-upload-section h4 {
  margin-bottom: 8px;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.file-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-status-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.file-status-section h4 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.file-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 6px 0;
}

.missing-warning {
  color: #f56c6c;
  font-size: 14px;
  text-align: center;
  font-weight: 500;
  margin: 0;
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

.form-container {
  margin: 30px auto 40px;
  width: 80%;
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

.submit-button:disabled {
  background-color: #c0c4cc;
  border-color: #c0c4cc;
  color: #fff;
  cursor: not-allowed;
}

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

@media (max-width: 992px) {

  .upload-container,
  .dual-upload-container,
  .info-box {
    width: 90%;
  }

  .form-container {
    width: 95%;
  }
}
</style>