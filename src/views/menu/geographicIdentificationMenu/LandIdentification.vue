<template>
  <div>
    <!-- 功能选择选项卡 -->
    <div class="feature-tabs">
      <el-radio-group v-model="activeFeature" size="large">
        <el-radio-button label="upload">数据上传</el-radio-button>
        <el-radio-button label="identification">土地识别</el-radio-button>
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

      <!-- 表单填写页面 -->
      <div class="form-container" v-if="uploadCurrent === 0">
        <!-- 文件上传部分 -->
        <div class="upload-container">
          <Dragger :multiple="true" accept=".tif,.zip,.rar" style="margin-top: 20px" :beforeUpload="beforeUpload"
            :customRequest="handleCustomRequest" :fileList="files" :onRemove="onRemove">
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
            <p class="ant-upload-hint">支持扩展名：.tif, .zip, .rar</p>
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

    <!-- 土地识别功能 -->
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
                  <el-checkbox label="confusion_matrix">混淆矩阵</el-checkbox>
                  <el-checkbox label="class_stats">类别统计</el-checkbox>
                  <el-checkbox label="heatmap">热力图</el-checkbox>
                  <el-checkbox label="evaluate">评估指标</el-checkbox>
                </el-checkbox-group>
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
                  <el-checkbox label="preview_png">预览图</el-checkbox>
                  <el-checkbox label="confusion_matrix">混淆矩阵</el-checkbox>
                  <el-checkbox label="class_stats">类别统计</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <div class="button-group">
                <el-button @click="fetchResultFiles" type="success" :loading="loadingResults" :disabled="!selectedModel">
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
              <el-button v-if="downloadFiles.confusion_matrix" @click="downloadFile('confusion_matrix')" type="primary"
                plain icon="Download">
                混淆矩阵
              </el-button>
              <el-button v-if="downloadFiles.class_stats" @click="downloadFile('class_stats')" type="primary" plain
                icon="Download">
                类别统计
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
  getLandResult, 
  getLandResultPreview, 
  getLandResultConfusionMatrix, 
  getLandResultConfusionMatrixClassStats 
} from '@/api/getData'

const { Dragger } = Upload

// 功能选项卡状态
const activeFeature = ref('upload')

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
const predictOptions = ref(['preview_png', 'confusion_matrix', 'class_stats', 'heatmap', 'evaluate'])
const resultOptions = ref(['preview_png', 'confusion_matrix', 'class_stats'])
const previewData = ref('')
const downloadFiles = ref({})
const predictLoading = ref(false)
const loadingResults = ref(false)
const error = ref('')
const imageDialogVisible = ref(false)

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

function beforeUpload(file) {
  const validTypes = ['.tif', '.zip', '.rar']
  const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  
  if (!validTypes.includes(fileExt)) {
    message.error(`只能上传 ${validTypes.join(', ')} 格式的文件`)
    return false
  }
  
  // 检查文件大小 (最大100MB)
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
    { title: '观测日期', value: observationDate.value } // 添加观测日期显示
  ]
  
  uploadCurrent.value = 1
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
  getModelByClassName({ className: "land" })
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

// 处理预测请求
const handlePredict = () => {
  if (!selectedModel.value) {
    message.error('请选择预测模型')
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
    class_stats: predictOptions.value.includes('class_stats') ? "True" : "False",
    heatmap: predictOptions.value.includes('heatmap') ? "True" : "False",
    evaluate: predictOptions.value.includes('evaluate') ? "True" : "False",
    userName: userinfo.username,
    createUserId: userinfo.id
  }

  predictLoading.value = true
  error.value = ''

  landPredictByCommons(params)
    .then((res) => {
      // 根据第一个接口的处理方式调整
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

  getLandResult(params)
    .then((res) => {
      console.log('getLandResult 完整响应:', res)

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

// 加载预览图片
const loadPreviewImage = () => {
  if (!downloadFiles.value.preview_png || !selectedModel.value) return

  getLandResultPreview({
    modelName: selectedModel.value
  })
    .then((res) => {
      console.log('预览图响应:', res)

      // 提取实际响应数据
      const response = res?.response?.value || res?.value || res

      // 创建Blob对象
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
    confusion_matrix: `${selectedModel.value}_confusion_matrix.png`,
    class_stats: `${selectedModel.value}_class_stats.txt`
  }

  // 根据类型选择API
  const apiCall = type === 'confusion_matrix'
    ? getLandResultConfusionMatrix
    : getLandResultConfusionMatrixClassStats

  apiCall({
    modelName: selectedModel.value
  })
    .then((res) => {
      console.log('下载文件响应:', res)

      // 提取实际响应数据
      const response = res?.response?.value || res?.value || res

      // 创建Blob对象
      const blob = new Blob([response], {
        type: type.includes('matrix') ? 'image/png' : 'text/plain'
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