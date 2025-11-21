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
      <div class="upload-container">
        <el-popover
          placement="top"
          trigger="hover"
          width="400"
        >
          <template #reference>
            <Dragger :multiple="true" 
              accept=".tif,.zip" 
              style="margin-top: 20px" 
              :beforeUpload="beforeUpload"
              :customRequest="handleCustomRequest" 
              :fileList="files" 
              :onRemove="onRemove">
              <p class="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
              <p class="ant-upload-hint">支持扩展名：.tif（多个文件）或 .zip（单个文件）</p>
              <p class="ant-upload-hint">鼠标悬浮查看所需文件列表</p>
            </Dragger>
          </template>
          <div class="file-requirements">
            <h4>{{ uploadType === 'dual' ? '双极化数据' : '全极化数据' }}所需文件：</h4>
            <ul>
              <li v-for="file in requiredFiles" :key="file" 
                  :class="{ 'missing': isFileMissing(file) }">
                {{ file }}
                <span v-if="isFileMissing(file)" class="missing-indicator">❌ 缺失</span>
                <span v-else class="present-indicator">✅ 已上传</span>
              </li>
            </ul>
            <p v-if="hasMissingFiles" class="missing-warning">
              请确保上传所有必需文件！
            </p>
          </div>
        </el-popover>
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

        <!-- 模型名称字段 -->
        <el-form-item label="模型名称：" required>
          <el-select v-model="modelName" placeholder="请选择模型" style="width: 100%" disabled>
            <el-option 
              v-for="model in availableModels" 
              :key="model.value" 
              :label="model.label" 
              :value="model.value"
            ></el-option>
          </el-select>
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
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { message, Upload } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { Check } from '@element-plus/icons-vue'
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
  ElOption,
  ElPopover
} from 'element-plus'
import { plantFilesUpload, getModelByClassName } from '@/api/getData'

const { Dragger } = Upload

// 定义emit事件
const emit = defineEmits(['cancel', 'continue'])

// 上传功能相关状态
const className = ref('plant')
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

// 双极化数据所需文件
const dualPolarizationFiles = [
  'Alpha.tif', 'Entropy.tif', 'HA.tif',
  'C11.tif', 'C12_imag.tif', 'C22.tif',
  'DpRVI.tif'
]

// 全极化数据所需文件
const fullPolarizationFiles = [
  'HV.tif', 'VV.tif',
  'Pauli_b.tif',
  'λ1.tif', 'Span.tif',
  'Alpha.tif', 'Entropy.tif', '1mH1mA.tif',
  'VZ_dbl.tif', 'VZ_vol.tif',
  'Free_vol.tif',
  'Yama_surf.tif', 'Yama_vol.tif'
]

// 可用模型列表
const availableModels = ref([
  { label: 'fanyanV2 (Ada-xgb)', value: 'fanyanV2' },
  { label: 'fanyanRF (随机森林)', value: 'fanyanRF' }
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

// 所需文件列表
const requiredFiles = computed(() => {
  return uploadType.value === 'dual' ? dualPolarizationFiles : fullPolarizationFiles
})

// 检查是否有缺失文件
const hasMissingFiles = computed(() => {
  if (files.value.length === 0) return true
  if (files.value.some(file => file.name.toLowerCase().endsWith('.zip'))) return false
  
  const uploadedFileNames = files.value.map(file => 
    file.name.toLowerCase().replace('.tif', '')
  )
  
  return requiredFiles.value.some(requiredFile => {
    const requiredName = requiredFile.toLowerCase().replace('.tif', '')
    return !uploadedFileNames.includes(requiredName)
  })
})

// 检查单个文件是否缺失
const isFileMissing = (fileName) => {
  if (files.value.length === 0) return true
  if (files.value.some(file => file.name.toLowerCase().endsWith('.zip'))) return false
  
  const uploadedFileNames = files.value.map(file => 
    file.name.toLowerCase().replace('.tif', '')
  )
  const requiredName = fileName.toLowerCase().replace('.tif', '')
  return !uploadedFileNames.includes(requiredName)
}

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
  updateModelName()
})

// 更新模型名称
const updateModelName = () => {
  modelName.value = uploadType.value === 'dual' ? 'fanyanV2' : 'fanyanRF'
}

// 处理上传类型变化
const handleUploadTypeChange = () => {
  files.value = []
  updateModelName()
}

// 方法
function beforeUpload(file) {
  // 检查文件类型
  const validTypes = ['.tif', '.zip']
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  
  if (!validTypes.includes(fileExt)) {
    message.error(`只能上传 ${validTypes.join(', ')} 格式的文件`)
    return false
  }
  
  // 检查文件大小
  const isLt100M = file.size / 1024 / 1024 < 1000
  if (!isLt100M) {
    message.error('文件大小不能超过 1000MB')
    return false
  }
  
  // 检查zip文件数量
  if (fileExt === '.zip') {
    const existingZip = files.value.find(f => f.name.toLowerCase().endsWith('.zip'))
    if (existingZip) {
      message.error('只能上传一个ZIP文件')
      return false
    }
    
    // 如果有ZIP文件，清空其他文件
    files.value = [file]
  } else {
    // 如果是tif文件，检查是否已存在ZIP文件
    const existingZip = files.value.find(f => f.name.toLowerCase().endsWith('.zip'))
    if (existingZip) {
      message.error('已上传ZIP文件，不能同时上传TIF文件')
      return false
    }
    
    files.value.push(file)
  }
  
  return false
}

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

function handleSubmit() {
  if (!publisher.value || !dataDescription.value || !observationDate.value) {
    message.error('请填写完整表单信息')
    return
  }
  
  if (files.value.length === 0) {
    message.error('请至少上传一个文件')
    return
  }
  
  // 检查文件完整性（仅对多个TIF文件）
  const hasZip = files.value.some(file => file.name.toLowerCase().endsWith('.zip'))
  if (!hasZip && hasMissingFiles.value) {
    message.error('请上传所有必需的文件')
    return
  }
  
  infoData.value = [
    { title: '数据简介', value: dataDescription.value || '无' },
    { title: '发布人', value: publisher.value },
    { title: '观测日期', value: observationDate.value },
    { title: '数据类型', value: uploadType.value === 'dual' ? '双极化数据' : '全极化数据' },
    { title: '模型名称', value: modelName.value }
  ]
  
  uploadCurrent.value = 1
}

function handleCancel() {
  publisher.value = userinfo?.username || ''
  dataDescription.value = ''
  observationDate.value = ''
  files.value = []
  uploadType.value = 'dual'
  modelName.value = 'fanyanV2'
  emit('cancel')
}

function handlePrevious() {
  uploadCurrent.value = 0
}

async function handleConfirm() {
  if (files.value.length === 0) {
    message.error('没有可上传的文件')
    return
  }
  
  const loadingInstance = ElLoading.service(loadingoptions)
  
  try {
    const formData = new FormData()
    
    // 一次性添加所有文件
    files.value.forEach(file => {
      formData.append('files', file) // 注意字段名改为复数形式
    })
    
    // 添加其他表单数据
    formData.append('createUserid', userinfo?.id || '')
    formData.append('userName', publisher.value)
    formData.append('dataIntroduction', dataDescription.value)
    formData.append('className', className.value)
    formData.append('observationTime', observationDate.value)
    formData.append('modelName', modelName.value)
    
    // 一次性提交所有文件
    const res = await plantFilesUpload(formData)
    
    if (res.response.value.code === 'SUCCESS') {
      message.success(`成功上传 ${files.value.length} 个文件`)
      uploadCurrent.value = 2
    } else {
      message.error(`上传失败: ${res.msg}`)
    }
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
  observationDate.value = ''
  uploadType.value = 'dual'
  modelName.value = 'fanyanV2'
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

.file-requirements {
  max-height: 300px;
  overflow-y: auto;
}

.file-requirements h4 {
  margin-bottom: 10px;
  color: #333;
}

.file-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-requirements li {
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-requirements li.missing {
  color: #ff4d4f;
}

.missing-indicator {
  font-size: 12px;
  color: #ff4d4f;
}

.present-indicator {
  font-size: 12px;
  color: #52c41a;
}

.missing-warning {
  margin-top: 10px;
  color: #ff4d4f;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 992px) {
  .upload-container,
  .info-box {
    width: 90%;
  }
  
  .form-container {
    width: 95%;
  }
}
</style>