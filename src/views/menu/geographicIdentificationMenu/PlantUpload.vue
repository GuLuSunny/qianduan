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
        <el-radio label="data">普通数据上传</el-radio>
        <el-radio label="train">训练数据集上传</el-radio>
      </el-radio-group>
    </div>

    <!-- 表单填写页面 -->
    <div class="form-container" v-if="uploadCurrent === 0">
      <!-- 文件上传部分 -->
      <div class="upload-container">
        <Dragger :multiple="true" 
          :accept="uploadType === 'data' ? '.tif,.zip,.rar' : '.zip,.xls,.xlsx'" 
          style="margin-top: 20px" 
          :beforeUpload="beforeUpload"
          :customRequest="handleCustomRequest" 
          :fileList="files" 
          :onRemove="onRemove">
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
          <p class="ant-upload-hint" v-if="uploadType === 'data'">支持扩展名：.tif, .zip, .rar</p>
          <p class="ant-upload-hint" v-else>支持扩展名：.zip, .xls, .xlsx (训练数据集)</p>
          <p class="download-template">
            <el-link type="primary" :underline="false">下载模板文件</el-link>
          </p>
        </Dragger>
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

        <!-- 训练数据集额外字段 -->
        <el-form-item v-if="uploadType === 'train'" label="模型名称：" required>
          <el-select v-model="trainModelName" placeholder="请选择训练模型" style="width: 100%">
            <el-option 
              v-for="model in availableTrainModels" 
              :key="model.modelName" 
              :label="model.modelInfo || model.modelName" 
              :value="model.modelName"
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
      
      <!-- 训练模型下载区域 -->
      <div v-if="uploadType === 'train' && trainModelName" class="train-download-section">
        <h3>训练模型文件下载</h3>
        <p class="download-tip">训练完成后可在此下载模型文件</p>
        <div class="download-buttons">
          <el-button @click="downloadTrainModel('h5')" type="primary" plain icon="Download">
            下载 .h5 模型文件
          </el-button>
          <el-button @click="downloadTrainModel('pkl')" type="primary" plain icon="Download">
            下载 .pkl 模型文件
          </el-button>
        </div>
      </div>

      <div class="button-group">
        <el-button @click="handleContinue" class="submit-button" type="primary">继续提交</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { message, Upload } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { Check, Download } from '@element-plus/icons-vue'
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
  ElDatePicker,
  ElRadioGroup,
  ElRadio,
  ElSelect,
  ElOption
} from 'element-plus'
import { modelFilesUpload, uploadPlantTrainData, getModelByClassName, DownloadPlantTrainModelFiles } from '@/api/getData'

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
const uploadType = ref('data') // 'data' 或 'train'
const trainModelName = ref('')
const availableTrainModels = ref([])
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
  trainModelName: trainModelName.value
}))

// 生命周期
onMounted(() => {
  if (userinfo) {
    publisher.value = userinfo.username || ''
  }
  fetchTrainModels()
})



// 获取可用训练模型
const fetchTrainModels = () => {
  getModelByClassName({ className: "plant" })
    .then((res) => {
      const response = res?.response?.value || res?.value || res
      if (response?.code === 'SUCCESS') {
        // 过滤出支持训练的模型
        availableTrainModels.value = (response?.body || []).filter(model => 
          model.functions && model.functions.includes('train')
        )
      }
    })
    .catch((error) => {
      console.error('获取训练模型失败:', error)
    })
}

// 处理上传类型变化
const handleUploadTypeChange = () => {
  files.value = []
  trainModelName.value = ''
}

// 方法
function beforeUpload(file) {
  let validTypes = []
  if (uploadType.value === 'data') {
    validTypes = ['.tif', '.zip', '.rar']
  } else {
    validTypes = ['.zip', '.xls', '.xlsx']
  }
  
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
  
  files.value.push(file)
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
  
  if (uploadType.value === 'train' && !trainModelName.value) {
    message.error('请选择训练模型')
    return
  }
  
  if (files.value.length === 0) {
    message.error('请至少上传一个文件')
    return
  }
  
  infoData.value = [
    { title: '数据简介', value: dataDescription.value || '无' },
    { title: '发布人', value: publisher.value },
    { title: '观测日期', value: observationDate.value },
    { title: '上传类型', value: uploadType.value === 'data' ? '普通数据' : '训练数据' }
  ]
  
  if (uploadType.value === 'train') {
    infoData.value.push({ title: '训练模型', value: trainModelName.value })
  }
  
  uploadCurrent.value = 1
}

function handleCancel() {
  publisher.value = userinfo?.username || ''
  dataDescription.value = ''
  observationDate.value = ''
  files.value = []
  uploadType.value = 'data'
  trainModelName.value = ''
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
    let allSuccess = true // 新增：记录所有文件是否都上传成功
    
    for (const file of files.value) {
      const formData = new FormData()
      formData.append('tiffile', file)
      formData.append('createUserId', userinfo?.id || '')
      formData.append('userName', publisher.value)
      formData.append('dataIntroduction', dataDescription.value)
      formData.append('className', className.value)
      formData.append('observationTime', observationDate.value)
      
      let res
      if (uploadType.value === 'data') {
        res = await modelFilesUpload(formData)
      } else {
        formData.append('modelName', trainModelName.value)
        res = await uploadPlantTrainData(formData)
      }
      
      if (res.response.value.code === 'SUCCESS') {
        message.success(`${file.name} 上传成功`)
      } else {
        message.error(`${file.name} 上传失败: ${res.msg}`)
        allSuccess = false // 标记有文件上传失败
      }
    }
    
    // 只有当所有文件都上传成功时才跳转到完成页面
    if (allSuccess) {
      uploadCurrent.value = 2
    } else {
      message.error('部分文件上传失败，请检查后重新提交')
    }
  } catch (error) {
    console.error('上传失败:', error)
    message.error('上传过程中发生错误')
    // catch 块中不跳转页面
  } finally {
    loadingInstance.close()
  }
}

// 下载训练模型文件
const downloadTrainModel = async (fileType) => {
  if (!trainModelName.value || !observationDate.value) {
    message.error('模型名称或观测日期缺失')
    return
  }

  try {
    const params = {
      userName: userinfo?.username || '',
      modelName: trainModelName.value,
      createUserId: userinfo?.id || '',
      observationTime: observationDate.value,
      type: 'train',
      DownloadStep: 0,
      fileType: fileType
    }

    const response = await DownloadPlantTrainModelFiles(params)
    
    // 处理文件下载
    const blob = new Blob([response.data])
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${trainModelName.value}_model.${fileType}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
    
    message.success(`模型文件下载成功`)
  } catch (error) {
    console.error('下载训练模型失败:', error)
    message.error('下载训练模型失败')
  }
}

function handleContinue() {
  files.value = []
  dataDescription.value = ''
  observationDate.value = ''
  uploadType.value = 'data'
  trainModelName.value = ''
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

.download-template {
  margin-top: 15px;
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

.train-download-section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #fafafa;
  text-align: center;
}

.train-download-section h3 {
  margin-bottom: 10px;
  color: #333;
}

.download-tip {
  color: #666;
  margin-bottom: 20px;
}

.download-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
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
  .info-box {
    width: 90%;
  }
  
  .form-container {
    width: 95%;
  }
  
  .download-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>