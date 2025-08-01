<template>
  <div>
    <!-- 进度栏 - 自定义步骤条 -->
    <div class="steps-container">
      <div class="custom-steps">
        <div :class="['step-item', { 'active': current === 0 }]">
          <div class="step-number">1</div>
          <div class="step-title">选择模型和参数</div>
        </div>
        <div :class="['step-item', { 'active': current === 1 }]">
          <div class="step-number">2</div>
          <div class="step-title">预测结果</div>
        </div>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="form-container" v-if="current === 0">
      <el-form :model="form" label-width="140px">
        <div class="form-horizontal-group">
          <!-- 左侧表单列 -->
          <div class="form-column">
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

          <!-- 右侧图片展示区域 -->
          <div class="image-preview">
            <div v-if="previewData" class="image-container">
              <img :src="previewData" alt="预测结果预览" />
            </div>
            <div v-else class="placeholder">
              <el-icon>
                <Picture />
              </el-icon>
              <span>预测结果将显示在这里</span>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 预测结果页面 -->
    <div class="result-container" v-if="current === 1">
      <div class="result-content">
        <!-- 图片展示区域 -->
        <div class="image-section">
          <div v-if="previewData" class="result-image">
            <img :src="previewData" alt="预测结果预览" />
          </div>
          <div v-else class="no-image">
            <el-icon>
              <Picture />
            </el-icon>
            <span>暂无预览图</span>
          </div>
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
          <el-button @click="handlePrevious" class="cancel-button" icon="Back">
            上一步
          </el-button>
          <el-button @click="handleContinue" class="submit-button" type="primary" icon="Refresh">
            继续预测
          </el-button>
        </div>
      </div>
    </div>
  </div>
  <!-- 在结果页面添加查看大图按钮 -->
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

        <!-- 大图预览对话框 -->
        <el-dialog v-model="imageDialogVisible" title="预览大图" width="90%">
          <div class="full-image-container">
            <img :src="previewData" alt="完整预览" class="full-size-image" />
          </div>
        </el-dialog>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElIcon } from 'element-plus'
import { Picture, Download, Back, Refresh, ZoomIn } from '@element-plus/icons-vue'
import {
  getModelByClassName,
  landPredictByCommons,
  getLandResult,
  getLandResultPreview,
  getLandResultConfusionMatrix,
  getLandResultConfusionMatrixClassStats
} from '@/api/getData'

// 添加响应式变量
const imageDialogVisible = ref(false)


// 响应式数据
const current = ref(0)
const models = ref([])
const selectedModel = ref('')
const predictOptions = ref(['preview_png', 'confusion_matrix', 'class_stats', 'heatmap', 'evaluate'])
const resultOptions = ref(['preview_png', 'confusion_matrix', 'class_stats'])
const previewData = ref('')
const downloadFiles = ref({})
const predictLoading = ref(false)
const loadingResults = ref(false)
const error = ref('')

// 计算是否有可下载文件
const hasDownloadableFiles = computed(() => {
  return downloadFiles.value.confusion_matrix || downloadFiles.value.class_stats
})
// 打开大图对话框
const openImageDialog = () => {
  imageDialogVisible.value = true
}
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
          ElMessage.warning('未找到可用模型')
        }
      } else {
        const msg = response?.msg || '获取模型失败'
        ElMessage.error(msg)
      }
    })
    .catch((error) => {
      console.error('请求失败:', error)
      ElMessage.error('请求失败: ' + error.message)
    })
}

// 处理预测请求
const handlePredict = () => {
  if (!selectedModel.value) {
    ElMessage.error('请选择预测模型')
    return
  }

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    ElMessage.error('用户信息未找到，请重新登录')
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
        ElMessage.success('预测请求已提交')
      } else {
        const msg = response?.msg || '预测失败'
        error.value = msg
        ElMessage.error(msg)
      }
    })
    .catch((err) => {
      console.error('请求失败:', err)
      error.value = '请求失败: ' + err.message
      ElMessage.error('请求失败: ' + err.message)
    })
    .finally(() => {
      predictLoading.value = false
    })
}

// 获取结果文件
const fetchResultFiles = () => {
  if (!selectedModel.value) {
    ElMessage.error('请选择模型')
    return
  }

  const userData = localStorage.getItem('Userinfo')
  if (!userData) {
    ElMessage.error('用户信息未找到，请重新登录')
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

        ElMessage.success('结果获取成功')
        current.value = 1
      } else {
        const msg = response?.msg || '获取结果文件失败'
        error.value = msg
        ElMessage.error(msg)
      }
    })
    .catch((err) => {
      console.error('获取结果文件失败:', err)
      error.value = '获取结果文件失败: ' + err.message
      ElMessage.error('获取结果文件失败: ' + err.message)
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
      ElMessage.error('加载预览图失败: ' + err.message)
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
      ElMessage.error(`下载失败: ${err.response?.data?.message || err.message}`)
    })
}

// 上一步
const handlePrevious = () => {
  if (current.value > 0) {
    current.value -= 1
  }
}

// 继续预测
const handleContinue = () => {
  current.value = 0
}

// 初始化获取模型数据
onMounted(() => {
  fetchModels()
})
</script>
<style scoped>
/* 样式保持不变，与之前相同 */
.form-container {
  margin: 20px auto;
  max-width: 1200px;
}

.form-horizontal-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.form-column {
  flex: 0 0 55%;
  padding: 0 20px;
}

.image-preview {
  flex: 0 0 40%;
  padding: 0 20px;
  border-left: 1px solid #eee;
  min-height: 400px;
}

.image-container {
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f9f9f9;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder {
  width: 100%;
  height: 400px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
  background-color: #f9f9f9;
}

.placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
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

/* 自定义步骤条样式 */
.steps-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
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

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 15px;
}

.cancel-button,
.submit-button {
  padding: 10px 25px;
  border-radius: 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-button {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #d9d9d9;
}

.cancel-button:hover:not(:disabled) {
  background-color: #e6e6e6;
  border-color: #c0c0c0;
}

.submit-button {
  background-color: #1890ff;
  color: white;
  border: 1px solid #1890ff;
}

.submit-button:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
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

/* 响应式调整 */
@media (max-width: 992px) {
  .form-horizontal-group {
    flex-direction: column;
  }

  .form-column,
  .image-preview {
    flex: 0 0 100%;
    padding: 0;
  }

  .image-preview {
    margin-top: 20px;
    border-left: none;
    border-top: 1px solid #eee;
    padding-top: 20px;
  }

  .custom-steps {
    max-width: 90%;
  }
}

/* 图片容器样式 */
.image-preview {
  flex: 0 0 40%;
  padding: 0 20px;
  border-left: 1px solid #eee;
  min-height: 400px;
  height: 400px;
  /* 固定高度 */
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* 隐藏超出部分 */
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.image-container img {
  max-width: 100%;
  /* 最大宽度为容器宽度 */
  max-height: 100%;
  /* 最大高度为容器高度 */
  width: auto;
  /* 保持宽高比 */
  height: auto;
  /* 保持宽高比 */
  object-fit: contain;
  /* 保持比例并完整显示 */
}

/* 结果页面图片区域 */
.result-container {
  margin: 20px auto;
  max-width: 1200px;
}

.image-section {
  width: 100%;
  height: 500px;
  /* 固定高度 */
  margin-bottom: 30px;
}

.result-image {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
  overflow: hidden;
  /* 隐藏超出部分 */
}

.result-image img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  /* 保持比例并完整显示 */
}

/* 占位符样式 */
.placeholder {
  width: 100%;
  height: 100%;
  border: 1px dashed #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
  background-color: #f9f9f9;
}

.no-image {
  width: 100%;
  height: 100%;
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

/* 响应式调整 */
@media (max-width: 992px) {
  .image-preview {
    height: 400px;
    /* 移动端保持相同高度 */
  }

  .image-section {
    height: 400px;
    /* 移动端稍小的高度 */
  }

  .form-horizontal-group {
    flex-direction: column;
  }

  .form-column,
  .image-preview {
    flex: 0 0 100%;
    padding: 0;
  }

  .image-preview {
    margin-top: 20px;
    border-left: none;
    border-top: 1px solid #eee;
    padding-top: 20px;
  }

  .custom-steps {
    max-width: 90%;
  }
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
</style>