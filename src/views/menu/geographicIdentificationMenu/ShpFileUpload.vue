<template>
  <a-card title="SHP文件提交系统" :bordered="false">
    <a-alert 
      message="请上传单个SHP文件(.shp)或完整的SHP文件包（必须包含.shp、.shx、.dbf文件）" 
      type="info" 
      style="margin-bottom: 20px"
    />
    
    <!-- 选择提交类型 -->
    <a-form :model="formState" layout="vertical" style="margin-bottom: 20px">
      <a-form-item label="选择提交类型" required>
        <a-select 
          v-model:value="formState.submitType" 
          placeholder="请选择SHP文件类型"
        >
          <a-select-option value="sluices">水闸数据</a-select-option>
          <a-select-option value="pumpingStation">泵站数据</a-select-option>
          <a-select-option value="lakes">湖泊数据</a-select-option>
          <a-select-option value="channel">渠道数据</a-select-option>
          <a-select-option value="reservoir">水库数据</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>

    <!-- 文件上传区域 -->
    <a-upload-dragger
      v-model:fileList="fileList"
      name="files"
      :multiple="true"
      :before-upload="beforeUpload"
      :customRequest="customRequest"
      accept=".shp,.shx,.dbf,.prj,.sbn,.sbx,.cpg,.xml"
      @change="handleChange"
      :disabled="!formState.submitType"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined />
      </p>
      <p class="ant-upload-text">点击或拖拽SHP文件到此区域上传</p>
      <p class="ant-upload-hint">
        支持两种模式：<br>
        1. 单个.shp文件<br>
        2. 完整的SHP文件包（必须包含.shp, .shx, .dbf文件）<br>
        可选文件: .prj, .sbn, .sbx, .cpg, .xml<br>
        单个文件不超过500MB
      </p>
    </a-upload-dragger>

    <!-- 上传进度和文件列表 -->
    <a-divider />
    
    <a-list
      v-if="fileList.length > 0"
      :data-source="fileList"
      :loading="uploading"
      style="margin-top: 20px"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta
            :description="`大小: ${formatFileSize(item.size)} | 类型: ${getFileType(item.name)} | 状态: ${getStatusText(item.status)}`"
          >
            <template #title>
              <file-text-outlined style="margin-right: 8px" />
              {{ item.name }}
            </template>
          </a-list-item-meta>
          
          <template #actions>
            <a-progress 
              v-if="item.status === 'uploading'" 
              type="circle" 
              :percent="item.percent" 
              :width="40" 
            />
            <a-button 
              v-if="item.status !== 'uploading'" 
              type="link" 
              danger 
              @click="handleRemove(item)"
            >
              删除
            </a-button>
          </template>
        </a-list-item>
      </template>
    </a-list>

    <!-- 提交按钮 -->
    <div class="submit-section" v-if="hasValidFiles && formState.submitType">
      <a-alert 
        :message="`检测到${uploadMode === 'single' ? '单个SHP文件' : '完整的SHP文件包'}，准备提交到: ${getSubmitTypeText()}`" 
        type="success" 
        style="margin-bottom: 16px"
      />
      <a-button 
        type="primary" 
        size="large" 
        :loading="submitting" 
        @click="handleSubmit"
        block
      >
        <template #icon>
          <send-outlined />
        </template>
        提交SHP文件{{ uploadMode === 'single' ? '' : '包' }}
      </a-button>
    </div>

    <!-- 提交结果展示 -->
    <a-modal
      v-model:visible="resultModalVisible"
      title="提交结果"
      width="600px"
      :footer="null"
      @cancel="handleReset"
    >
      <div v-if="submitResult">
        <a-result
          :status="submitResult.success ? 'success' : 'error'"
          :title="submitResult.success ? '提交成功' : '提交失败'"
          :sub-title="submitResult.message"
        >
          <template #extra>
            <a-space>
              <a-button type="primary" @click="handleReset">
                继续上传
              </a-button>
              <a-button @click="resultModalVisible = false">
                关闭
              </a-button>
            </a-space>
          </template>
        </a-result>
        
        <a-divider v-if="submitResult.details" />
        
        <div v-if="submitResult.details" class="result-details">
          <h4>详细信息:</h4>
          <pre>{{ JSON.stringify(submitResult.details, null, 2) }}</pre>
        </div>
      </div>
    </a-modal>
  </a-card>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { 
  InboxOutlined, 
  FileTextOutlined, 
  SendOutlined 
} from '@ant-design/icons-vue'

import {
  uploadSluicesShpfiles,
  uploadPumpingStationShpfiles,
  uploadlakesByShpfiles,
  uploadChannelByShpfiles,
  uploadreservoirByShpfiles
} from '@/api/getData'

// 响应式数据
const fileList = ref([])
const uploading = ref(false)
const submitting = ref(false)
const resultModalVisible = ref(false)
const submitResult = ref(null)
const uploadMode = ref(null) // 'single' 或 'package'

const formState = reactive({
  submitType: null
})

// 监听文件列表变化
watch(fileList, (newFiles) => {
  const shpFiles = newFiles.filter(file => file.name.toLowerCase().endsWith('.shp'))
  
  if (newFiles.length === 1 && shpFiles.length === 1) {
    // 只有一个文件且是shp文件
    uploadMode.value = 'single'
  } else if (newFiles.length > 1) {
    // 多个文件，检查是否包含必需的shp文件
    uploadMode.value = 'package'
  } else {
    uploadMode.value = null
  }
})

// 获取提交类型文本
const getSubmitTypeText = () => {
  const typeMap = {
    'sluices': '水闸数据',
    'pumpingStation': '泵站数据',
    'lakes': '湖泊数据',
    'channel': '渠道数据',
    'reservoir': '水库数据'
  }
  return typeMap[formState.submitType] || '未知类型'
}

// 检查文件是否有效
const hasValidFiles = computed(() => {
  if (fileList.value.length === 0) return false
  
  const uploadedFiles = fileList.value.map(file => file.name.toLowerCase())
  const hasShp = uploadedFiles.some(name => name.endsWith('.shp'))
  
  // 单个shp文件模式
  if (fileList.value.length === 1) {
    return hasShp
  }
  
  // 文件包模式
  const hasShx = uploadedFiles.some(name => name.endsWith('.shx'))
  const hasDbf = uploadedFiles.some(name => name.endsWith('.dbf'))
  return hasShp && hasShx && hasDbf
})

// 获取文件类型
const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toUpperCase()
  const typeMap = {
    'shp': '主文件',
    'shx': '索引文件',
    'dbf': '属性表',
    'prj': '坐标系统',
    'sbn': '空间索引',
    'sbx': '空间索引',
    'cpg': '编码页',
    'xml': '元数据'
  }
  return typeMap[extension] || extension
}

// 上传前验证
const beforeUpload = (file) => {
  if (!formState.submitType) {
    message.error('请先选择提交类型')
    return false
  }

  const allowedExtensions = ['.shp', '.shx', '.dbf', '.prj', '.sbn', '.sbx', '.cpg', '.xml']
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  
  if (!allowedExtensions.includes(fileExtension)) {
    message.error(`不支持的文件类型: ${fileExtension}`)
    return false
  }

  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    message.error('文件大小不能超过500MB!')
    return false
  }

  // 检查是否已存在同名文件
  const exists = fileList.value.some(f => f.name === file.name)
  if (exists) {
    message.error(`文件 ${file.name} 已存在!`)
    return false
  }

  // 如果已经有一个shp文件，不允许再上传其他文件
  const hasShp = fileList.value.some(f => f.name.toLowerCase().endsWith('.shp'))
  if (hasShp && fileExtension !== '.shp') {
    message.error('已上传SHP文件，无法添加辅助文件')
    return false
  }

  // 如果已经有辅助文件，不允许再上传单个shp文件
  const hasAuxFiles = fileList.value.some(f => !f.name.toLowerCase().endsWith('.shp'))
  if (hasAuxFiles && fileExtension === '.shp') {
    message.error('已上传辅助文件，无法添加单个SHP文件')
    return false
  }

  return true
}

// 自定义上传请求（实际提交时统一处理）
const customRequest = async (options) => {
  const { file, onProgress, onSuccess, onError } = options
  
  // 这里只是前端验证，实际提交在handleSubmit中统一处理
  onProgress({ percent: 100 })
  onSuccess({}, file)
}

// 处理上传变化
const handleChange = (info) => {
  if (info.file.status === 'done') {
    message.success(`${info.file.name} 文件准备就绪`)
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} 文件准备失败`)
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    uploading: '上传中',
    done: '准备就绪',
    error: '错误',
    removed: '已删除'
  }
  return statusMap[status] || '未知'
}

// 删除文件
const handleRemove = (file) => {
  const index = fileList.value.indexOf(file)
  if (index !== -1) {
    fileList.value.splice(index, 1)
    message.success('文件已移除')
  }
}

// 根据提交类型选择对应的API
const getApiBySubmitType = () => {
  const apiMap = {
    'sluices': uploadSluicesShpfiles,
    'pumpingStation': uploadPumpingStationShpfiles,
    'lakes': uploadlakesByShpfiles,
    'channel': uploadChannelByShpfiles,
    'reservoir': uploadreservoirByShpfiles
  }
  return apiMap[formState.submitType]
}

// 提交SHP文件包
const handleSubmit = async () => {
  if (!formState.submitType) {
    message.error('请选择提交类型')
    return
  }

  if (!hasValidFiles.value) {
    if (fileList.value.length === 1) {
      message.error('请上传有效的SHP文件')
    } else {
      message.error('请确保包含.shp、.shx、.dbf文件')
    }
    return
  }

  submitting.value = true

  try {
    const formData = new FormData()
    
    // 添加所有文件到FormData
    fileList.value.forEach(file => {
      formData.append('files', file.originFileObj || file)
    })

    // 添加用户信息
    const userData = localStorage.getItem('Userinfo')
    if (userData) {
      const userinfo = JSON.parse(userData)
      formData.append('userName', userinfo.username)
      formData.append('userId', userinfo.id)
    }

    // 获取对应的API函数
    const apiFunction = getApiBySubmitType()
    if (!apiFunction) {
      throw new Error('未找到对应的提交接口')
    }

    // 调用API提交
    const response = await apiFunction(formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // 处理响应
    const result = response?.data || response
    
    if (result?.code === 'SUCCESS' || result?.success) {
      submitResult.value = {
        success: true,
        message: `SHP文件${uploadMode.value === 'single' ? '' : '包'}提交到${getSubmitTypeText()}成功`,
        details: result.body || result.data
      }
      message.success('提交成功！')
    } else {
      throw new Error(result?.msg || result?.message || '提交失败')
    }

  } catch (error) {
    console.error('提交失败:', error)
    submitResult.value = {
      success: false,
      message: error.response?.data?.message || error.message || '提交失败',
      details: error.response?.data
    }
    message.error('提交失败：' + (error.response?.data?.message || error.message))
  } finally {
    submitting.value = false
    resultModalVisible.value = true
  }
}

// 重置表单
const handleReset = () => {
  fileList.value = []
  uploadMode.value = null
  submitResult.value = null
  resultModalVisible.value = false
  // 不清空提交类型，方便用户继续上传同类数据
}
</script>

<style scoped>
.submit-section {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
}

.result-details {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.result-details pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
}

.ant-upload-drag-icon {
  margin-bottom: 16px;
}

.ant-upload-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.ant-upload-hint {
  color: #666;
  font-size: 14px;
}

.ant-form-item {
  margin-bottom: 16px;
}
</style>