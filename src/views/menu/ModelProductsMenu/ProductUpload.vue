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

    <!-- 表单填写页面 -->
    <div class="form-container" v-if="uploadCurrent === 0">
      <!-- 文件上传部分 -->
      <div class="upload-container">
        <Dragger :multiple="false" accept=".tif,.png,.jpg,.hdr,.img,.dat,.tiff" style="margin-top: 20px"
          :beforeUpload="beforeUpload" :customRequest="handleCustomRequest" :fileList="files" :onRemove="onRemove">
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">点击或将产品文件拖拽到这里上传</p>
          <p class="ant-upload-hint">支持扩展名：.tif,.png,.jpg,.hdr,.img,.dat,.tiff</p>
          <p class="ant-upload-hint">只能上传单个文件</p>
        </Dragger>
      </div>

      <!-- 公共表单部分 -->
      <el-form :model="form" label-width="120px" style="width: 40%; margin: 0 auto">
        <el-form-item label="产品名称：" required>
          <el-input v-model="filename" placeholder="请输入产品名称" clearable></el-input>
        </el-form-item>

        <!-- 产品类型（动态获取） -->
        <el-form-item label="产品类型：" required>
          <el-select v-model="className" placeholder="请选择产品类型" style="width: 100%">
            <el-option v-for="item in classNameOptions" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="发布人：" required>
          <el-input v-model="publisher" placeholder="请输入发布人姓名" clearable></el-input>
        </el-form-item>

        <!-- 观测时间（支持三种格式） -->
        <el-form-item label="观测时间：">
          <el-input v-model="observationTime" placeholder="请输入观测时间" clearable>
          </el-input>
          <!-- <div style="font-size: 12px; color: #666; margin-top: 5px;">
          支持格式：年（yyyy）、年月（yyyy-mm）、年月日（yyyy-mm-dd）
        </div> -->
        </el-form-item>

        <!-- 时间段选择（开始时间和结束时间） -->
        <el-form-item label="时间段：">
          <div style="display: flex; gap: 10px;">
            <el-input v-model="startTime" placeholder="开始时间" style="flex: 1">
            </el-input>
            <span style="line-height: 32px;">至</span>
            <el-input v-model="endTime" placeholder="结束时间" style="flex: 1">
            </el-input>
          </div>

        </el-form-item>
        <div style="font-size: 12px; color: #666; margin-top: 5px;  padding:0 10%;">
          支持格式：年（yyyy）、年月（yyyy-mm）、年月日（yyyy-mm-dd）<br>
          注意：开始时间不能晚于结束时间
        </div>
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
        <h3>上传文件</h3>
        <el-table :data="files" style="width: 60%; margin: 0 auto" border
          :header-cell-style="{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }">
          <el-table-column prop="name" label="文件名"></el-table-column>
          <el-table-column prop="size" label="文件大小" width="120">
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </el-table-column>
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
      <p class="completion-tip">产品文件上传成功</p>

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
  ElSelect,
  ElOption
} from 'element-plus'
import { uploadModelProduct, getModelClassName } from '@/api/getData' // 移除了getTimesByType导入

const { Dragger } = Upload

// 定义emit事件
const emit = defineEmits(['cancel', 'continue'])

// 上传功能相关状态
const loadingoptions = {
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '产品上传中...'
}

const userinfo = JSON.parse(localStorage.getItem('userinfo'))
const uploadCurrent = ref(0)
const files = ref([])
const publisher = ref(userinfo?.username || '')
const filename = ref('')
const className = ref('')  // 清空默认值
const classNameOptions = ref([])  // 分类选项
const observationTime = ref('')  // 观测时间（用户输入）
const startTime = ref('')
const endTime = ref('')

// 计算属性
const infoData = computed(() => [
  { title: '产品名称', value: filename.value || '无' },
  { title: '产品类型', value: className.value || '未选择' },
  { title: '发布人', value: publisher.value },
  { title: '观测时间', value: observationTime.value || '无' },
  { title: '开始时间', value: startTime.value || '无' },
  { title: '结束时间', value: endTime.value || '无' }
])

const form = computed(() => ({
  filename: filename.value,
  className: className.value,
  publisher: publisher.value,
  observationTime: observationTime.value,
  startTime: startTime.value,
  endTime: endTime.value
}))

// 获取产品分类
const fetchClassNames = () => {
  getModelClassName()
    .then((res) => {
      const response = res.response?.value || res
      if (response.code === 'SUCCESS') {
        classNameOptions.value = response.body || []
        // 如果没有选择分类，则默认选择第一个
        if (classNameOptions.value.length > 0 && !className.value) {
          className.value = classNameOptions.value[0]
        }
      } else {
        message.error('获取产品分类失败: ' + (response.msg || '未知错误'))
      }
    })
    .catch((error) => {
      console.error('获取产品分类失败:', error)
      message.error('获取产品分类失败')
    })
}

// 生命周期
onMounted(() => {
  if (userinfo) {
    publisher.value = userinfo.username || ''
  }
  fetchClassNames()
})

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 验证时间格式（支持三种格式：yyyy、yyyy-mm、yyyy-mm-dd）
const validateTimeFormat = (time) => {
  if (!time) return false

  // 三种格式：yyyy、yyyy-mm、yyyy-mm-dd
  const yearPattern = /^\d{4}$/
  const monthPattern = /^\d{4}-\d{2}$/
  const dayPattern = /^\d{4}-\d{2}-\d{2}$/

  return yearPattern.test(time) || monthPattern.test(time) || dayPattern.test(time)
}

// 方法
function beforeUpload(file) {
  // 检查文件类型
  const validTypes = ['.tif', '.png', '.jpg', '.tiff', '.hdr', '.img', '.dat']
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

  // 只能上传一个文件
  if (files.value.length > 0) {
    message.error('只能上传一个文件，请先移除已上传的文件')
    return false
  }

  files.value = [file]
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

// 验证表单
function handleSubmit() {
  // 验证必填字段
  if (!filename.value || !publisher.value || !className.value) {
    message.error('请填写产品名称、发布人和产品类型')
    return
  }

  // 验证文件
  if (files.value.length === 0) {
    message.error('请上传文件')
    return
  }

  // 验证时间：观测时间和开始/结束时间至少填写一个
  const hasObservationTime = observationTime.value.trim() !== ''
  const hasStartTime = startTime.value.trim() !== ''
  const hasEndTime = endTime.value.trim() !== ''

  if (!hasObservationTime && (!hasStartTime || !hasEndTime)) {
    message.error('请填写观测时间或开始时间和结束时间')
    return
  }

  // 如果填写了观测时间，验证格式
  if (hasObservationTime && !validateTimeFormat(observationTime.value)) {
    message.error('观测时间格式不正确，请使用：年（yyyy）、年月（yyyy-mm）、年月日（yyyy-mm-dd）格式')
    return
  }

  // 如果填写了开始时间或结束时间，需要两个都填写
  if (hasStartTime !== hasEndTime) {
    message.error('开始时间和结束时间需要同时填写')
    return
  }

  // 如果填写了开始时间和结束时间，验证格式
  if (hasStartTime && hasEndTime) {
    if (!validateTimeFormat(startTime.value)) {
      message.error('开始时间格式不正确，请使用：年（yyyy）、年月（yyyy-mm）、年月日（yyyy-mm-dd）格式')
      return
    }
    if (!validateTimeFormat(endTime.value)) {
      message.error('结束时间格式不正确，请使用：年（yyyy）、年月（yyyy-mm）、年月日（yyyy-mm-dd）格式')
      return
    }

    // 验证开始时间不晚于结束时间（根据字符串比较，需要格式一致）
    if (startTime.value > endTime.value) {
      message.error('开始时间不能晚于结束时间')
      return
    }
  }

  uploadCurrent.value = 1
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

    // 添加文件
    formData.append('productFile', files.value[0])

    // 添加其他表单数据
    formData.append('className', className.value)
    formData.append('filename', filename.value)
    formData.append('userName', publisher.value)

    // 添加时间数据

    formData.append('observationTime', observationTime.value)

    formData.append('startTime', startTime.value)
    formData.append('endTime', endTime.value)

    // 调用上传接口
    uploadModelProduct(formData)
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
                message.success('产品上传成功')
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
          console.log('上传成功:', response)
          message.success('产品上传成功')
          uploadCurrent.value = 2
        }
      })
      .catch((error) => {
        console.error('上传失败:', error)
        message.error('上传过程中发生错误')
      })

  } catch (error) {
    console.error('上传失败:', error)
    message.error('上传过程中发生错误')
  } finally {
    loadingInstance.close()
  }
}

function handleCancel() {
  publisher.value = userinfo?.username || ''
  filename.value = ''
  className.value = classNameOptions.value.length > 0 ? classNameOptions.value[0] : ''
  observationTime.value = ''
  startTime.value = ''
  endTime.value = ''
  files.value = []
  uploadCurrent.value = 0
  emit('cancel')
}

function handleContinue() {
  files.value = []
  filename.value = ''
  className.value = classNameOptions.value.length > 0 ? classNameOptions.value[0] : ''
  observationTime.value = ''
  startTime.value = ''
  endTime.value = ''
  uploadCurrent.value = 0
  emit('continue')
}
</script>

<style scoped>
.feature-container {
  margin: 0 auto;
  max-width: 1200px;
  min-height: calc(100vh - 100px);
  padding: 20px;
}

.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto;
  width: 80%;
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

@media (max-width: 992px) {
  .upload-container {
    width: 90%;
  }

  .form-container {
    width: 95%;
  }
}
</style>