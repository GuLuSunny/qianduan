<template>
  <div>
    <!-- 进度栏 -->
    <div class="steps-container">
      <a-steps :current="current">
        <a-step title="填写资料信息" />
        <a-step title="确认资料信息" />
        <a-step title="完成" />
      </a-steps>
    </div>

    <!-- 提示框 -->
    <!-- <div class="info-box" v-if="infoVisible">
      <span class="icon">🔔</span>
      资料上传成功后可在数据查询页面查看
      <el-button class="close-button" @click="hideInfo" type="text">×</el-button>
    </div> -->

    <!-- 表单填写页面 -->
    <div class="form-container" v-if="current === 0">
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
    </div>

    <!-- 文件确认页面 -->
    <div class="form-container" v-if="current === 1">
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
    <div class="form-container" v-if="current === 2">
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

    <!-- 按钮组 -->
    <div class="button-group" v-if="current === 0">
      <el-button @click="handleCancel" class="cancel-button">取消</el-button>
      <el-button @click="handleSubmit" class="submit-button" type="primary">下一步</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
  ElLink,
  ElIcon
} from 'element-plus'
import { modelFilesUpload } from '@/api/getData'

const { Dragger } = Upload

const className = ref('water')
const loadingoptions = {
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据上传中...'
}
const userinfo = JSON.parse(localStorage.getItem('Userinfo'))
const current = ref(0)
const infoVisible = ref(true)
const files = ref([])
const publisher = ref(userinfo?.username || '')
const dataDescription = ref('')
// 添加观测日期变量
const observationDate = ref('')
const infoData = ref([
  { title: '数据简介', value: dataDescription.value },
  { title: '发布人', value: publisher.value }
])

onMounted(() => {
  // 初始化用户信息
  if (userinfo) {
    publisher.value = userinfo.username || ''
  }
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
  
  current.value = 1
}

function handleCancel() {
  publisher.value = userinfo?.username || ''
  dataDescription.value = ''
  observationDate.value = '' // 重置观测日期
  files.value = []
}

function handlePrevious() {
  current.value = 0
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
      formData.append('tiffile', file)
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
    
    current.value = 2
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
  current.value = 0
}

function hideInfo() {
  infoVisible.value = false
}
</script>

<style scoped>
/* 原有样式保持不变 */
.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto;
  width: 80%;
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

.el-form-item {
  margin-bottom: 22px;
}

.el-table {
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>