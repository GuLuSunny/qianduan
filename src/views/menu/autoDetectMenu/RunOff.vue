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
    <div class="info-box" v-if="infoVisible">
      <span class="icon">🔔</span>
      资料上传成功后可在数据查询页面查看
      <el-button class="close-button" @click="hideInfo" type="text">×</el-button>
    </div>

    <!-- 表单填写页面 -->
    <div class="form-container" v-if="current === 0">
      <!-- 选择提交方式 -->
      <el-form-item label="提交方式：" label-width="120px" style="width: 40%; margin: 0 27%; margin-bottom: 18px">
        <el-select v-model="submitType" placeholder="请选择提交方式">
          <el-option label="单条系统录入" value="form"></el-option>
          <el-option label="批量文件导入" value="file"></el-option>
        </el-select>
      </el-form-item>

      <!-- 文件上传部分 -->
      <div class="upload-container" v-if="submitType === 'file'">
        <Dragger :multiple="true" accept=".xls,.xlsx" style="margin-top: 20px" :beforeUpload="beforeUpload"
          :customRequest="handleCustomRequest" :fileList="files" :onRemove="onRemove">
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
          <p class="ant-upload-hint">支持扩展名xlsx,xls</p>
        </Dragger>
        <div class="download-template">
          <a href="/templates/陆浑湖伊河径流数据模板.xlsx" download>点击此处下载Excel模板</a>
        </div>
      </div>

      <!-- 表单填写部分 -->
      <el-form :model="form" label-width="120px" style="width: 40%; margin: 0 27%">
        <el-form v-if="submitType === 'form'" :model="form" label-width="120px" style="width: 100%; margin: 0">
          <el-form-item label="观测站点名称：" required>
            <el-select v-model="deviceName" placeholder="请选择观测站点名称">
              <el-option v-for="item in locations" :key="item.id" :label="item.deviceName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="径流量数据：" required>
            <el-input-number v-model="flow" placeholder="请输入径流量" min="0" controls-position="right"
              style="width: 100%;"><template #suffix><span>m³</span></template></el-input-number>
          </el-form-item>
          <el-form-item label="观测日期：" required>
            <el-date-picker v-model="observationDate" type="date" placeholder="选择日期" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"></el-date-picker>
          </el-form-item>
        </el-form>
      </el-form>

      <!-- 公共表单部分 -->
      <el-form :model="form" label-width="120px" style="width: 40%; margin: 0 27%">
        <el-form-item label="数据简介：" :required="publishStatus === 'public'">
          <el-input type="textarea" v-model="dataDescription" placeholder="请输入数据简介" rows="4"></el-input>
        </el-form-item>
        <el-form-item label="发布人：" :required="publishStatus === 'public'">
          <el-input v-model="publisher" placeholder="请输入发布人姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话：" :required="publishStatus === 'public'">
          <el-input v-model="contactPhone" placeholder="请输入发布人联系电话"></el-input>
        </el-form-item>
        <el-form-item label="联系地址：" :required="publishStatus === 'public'">
          <el-input v-model="contactAddress" placeholder="请输入发布人联系地址"></el-input>
        </el-form-item>
        <el-form-item label="联系邮箱：" :required="publishStatus === 'public'">
          <el-input v-model="contactEmail" placeholder="请输入发布人联系邮箱"></el-input>
        </el-form-item>
        <el-form-item label="制作单位：" :required="publishStatus === 'public'">
          <el-input v-model="productionUnit" placeholder="请输入制作单位"></el-input>
        </el-form-item>
      </el-form>
    </div>

    <!-- 文件确认页面 -->
    <div class="form-container" v-if="current === 1">
      <!-- 资料确认 -->
      <el-table :data="infoData" style="width: 50%; margin: 0 auto" border="true"
        :header-cell-style="{ backgroundColor: '#f2f2f2' }">
        <el-table-column prop="title" label="信息项" width="150"></el-table-column>
        <el-table-column prop="value" label="内容"></el-table-column>
      </el-table>

      <!-- 文件列表 -->
      <el-table :data="files" style="width: 50%; margin: 20px auto" border="true"
        :header-cell-style="{ backgroundColor: '#f2f2f2' }">
        <el-table-column prop="name" label="文件名"></el-table-column>
      </el-table>

      <div class="button-group">
        <el-button @click="handlePrevious" class="cancel-button">上一步</el-button>
        <el-button @click="handleConfirm" class="submit-button" type="primary">确认</el-button>
      </div>
    </div>

    <!-- 上传完成页面 -->
    <div class="form-container" v-if="current === 2">
      <div class="completion-icon"></div>
      <h1 class="form-title">上传完成</h1>
      <div class="button-group">
        <el-button @click="handleContinue" class="submit-button" type="primary">继续提交</el-button>
      </div>
    </div>

    <!-- 按钮组 -->
    <div class="button-group" v-if="current === 0">
      <el-button @click="handleCancel" class="cancel-button">取消</el-button>
      <el-button @click="handleSubmit" class="submit-button" type="primary">提交</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance, onMounted } from 'vue'
import { message, Upload } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioGroup,
  ElRadio,
  ElTable,
  ElTableColumn,
  ElButton,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElMessage,
  ElLoading
} from 'element-plus'
// import useAxiosApi from '../../../config/useAxiosApi'
import { runoffInsertByExcel, runoffInsertByForm } from '@/api/getData'
import { getTimesByType, queryDeviceByMultiWord } from '@/api/getData'
const { Dragger } = Upload

const locations = ref([])

const userinfo = JSON.parse(localStorage.getItem('Userinfo'))
const current = ref(0)
const deviceName = ref('')
const flow = ref('')
const observationDate = ref('')
const infoVisible = ref(true)
const files = ref([])
const submitType = ref('form')

const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

const publisher = ref(userinfo.username)
const contactPhone = ref(userinfo.tel)
const contactAddress = ref(userinfo.address)
const contactEmail = ref(userinfo.email)
const productionUnit = ref(userinfo.productionCompany)

const publishStatus = ref('private')
const isRadioDisabled = ref(true)
const dataDescription = ref('')
const infoData = ref([
  { title: '数据简介', value: dataDescription.value },
  { title: '发布人', value: publisher.value },
  { title: '联系电话', value: contactPhone.value },
  { title: '联系地址', value: contactAddress.value },
  { title: '联系邮箱', value: contactEmail.value },
  { title: '制作单位', value: productionUnit.value }
])

const form = ref({
  deviceName: '',
  flow: '',
  observationDate: '',
  dataDescription: '',
  publisher: '',
  contactPhone: '',
  contactAddress: '',
  contactEmail: '',
  productionUnit: '',
  publishStatus: 'private'
})

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      const userinfo = JSON.parse(localStorage.getItem('Userinfo'))
      publisher.value = userinfo.username
      contactPhone.value = userinfo.tel
      contactAddress.value = userinfo.address
      contactEmail.value = userinfo.email
      productionUnit.value = userinfo.productionCompany
      getDeviceInfoList('02')
    })
  }
})

// 根据设备类型，查询设备列表
// 观测设备种类分类；
// 01：光谱和水体监测点；
// 02：径流监测点；
// 03：气象站；
// 04：外业调查点位
function getDeviceInfoList(deviceType) {
  queryDeviceByMultiWord({
    id: '',
    deviceName: '',
    type: deviceType
  })
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        locations.value.push(...result.body)
        deviceName.value = locations.value[0].id
      } else {
        // 处理失败的响应
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

watch(submitType, (newType) => {
  if (newType === 'form') {
    files.value = []
    isRadioDisabled.value = true
    publishStatus.value = 'private'
  } else if (newType === 'file') {
    deviceName.value = ''
    flow.value = ''
    observationDate.value = ''
    isRadioDisabled.value = false
  }
})

function beforeUpload(file) {
  const isExcel =
    file.type === 'application/vnd.ms-excel' ||
    file.type ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (!isExcel) {
    message.error('只能上传Excel文件')
    return false
  }
  files.value.push(file)
  return false
}

function onRemove(file) {
  const index = files.value.indexOf(file)
  files.value.splice(index, 1)
}

function handleCustomRequest({ file, onSuccess, onError }) {
  files.value.push({ file, onSuccess, onError })
  console.log('文件:', file)
  message.success(`${file.name} 文件已添加到上传队列.`)
}

function handleSubmit() {
  if (publishStatus.value === 'public') {
    if (
      publisher.value === '' ||
      contactPhone.value === '' ||
      contactAddress.value === '' ||
      contactEmail.value === '' ||
      productionUnit.value === '' ||
      dataDescription.value === ''
    ) {
      message.error('请填写完整表单信息')
      return
    }
  }
  if (submitType.value === 'form') {
    if (
      deviceName.value === '' ||
      flow.value === '' ||
      observationDate.value === ''
    ) {
      message.error('请填写完整表单信息')
      return
    }
  } else if (submitType.value === 'file') {
    if (files.value.length === 0) {
      message.error('请上传文件')
      return
    }
  }
  infoData.value = [
    { title: '数据简介', value: dataDescription.value },
    { title: '发布人', value: publisher.value },
    { title: '联系电话', value: contactPhone.value },
    { title: '联系地址', value: contactAddress.value },
    { title: '联系邮箱', value: contactEmail.value },
    { title: '制作单位', value: productionUnit.value }
  ]
  current.value = 1
}

function handleCancel() {
  deviceName.value =
    flow.value =
    observationDate.value =
    publisher.value =
    contactPhone.value =
    contactAddress.value =
    contactEmail.value =
    productionUnit.value =
    dataDescription.value =
    ''
  files.value = []
}

function handlePrevious() {
  if (current.value > 0) {
    current.value -= 1
  }
}

function handleConfirm() {
  if (submitType.value === 'file') {
    const loadingInstance = ElLoading.service(loadingoptions)
    files.value.forEach((file) => {
      const formData = new FormData()
      formData.append('fileMul', file)
      formData.append('createUserId', userinfo.id)
      formData.append('userName', publisher.value)
      formData.append('contactPhone', contactPhone.value)
      formData.append('contactAddress', contactAddress.value)
      formData.append('productionUnit', productionUnit.value)
      formData.append('contactEmail', contactEmail.value)
      formData.append('dataIntroduction', dataDescription.value)
      formData.append('open', publishStatus.value === 'public' ? 1 : 0)

      runoffInsertByExcel(formData)
        .then((res) => {
          loadingInstance.close()
          const response = res.response.value
          if (response.code === 'SUCCESS') {
            message.success(`${file.name} 文件上传成功.`)
            current.value = 2
          } else {
            message.error(response.msg)
          }
        })
        .catch((error) => {
          loadingInstance.close()
          message.error(
            `${file.name} 上传失败，请下载EXCEL模板，按照模板格式提交！`
          )
        })
    })
    files.value = []
  } else {
    const loadingInstance = ElLoading.service(loadingoptions)
    const data = {
      deviceId: deviceName.value,
      flow: flow.value,
      observationTime: observationDate.value,
      userName: publisher.value,
      contactPhone: contactPhone.value,
      contactAddress: contactAddress.value,
      createUserid: userinfo.id,
      productionUnit: productionUnit.value,
      dataIntroduction: dataDescription.value,
      contactEmail: contactEmail.value,
      open: publishStatus.value === 'public' ? 1 : 0
    }
    runoffInsertByForm([data])
      .then((res) => {
        loadingInstance.close()
        const response = res.response.value
        if (response.code === 'SUCCESS') {
          message.success('表单提交成功.')
          current.value = 2
        } else {
          message.error(response.msg)
        }
      })
      .catch((error) => {
        loadingInstance.close()
        message.error('表单提交失败！,请稍后提交！')
      })
  }
}

function handleContinue() {
  deviceName.value = ''
  flow.value = ''
  observationDate.value = ''
  files.value = []
  current.value = 0
}

function hideInfo() {
  infoVisible.value = false
}
</script>

<style scoped>
.steps-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  min-height: 30px;
}

.steps-container .ant-steps {
  max-width: 70%;
  width: 70%;
}

.upload-container {
  margin-top: 30px;
  width: 30%;
  margin: 20px auto;
}

.info-box {
  width: 33%;
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px auto;
}

.icon {
  margin-right: 10px;
  font-size: 20px;
}

.close-button {
  background: none;
  border: none;
  color: #1890ff;
  font-size: 20px;
  cursor: pointer;
}

.close-button:hover {
  color: red;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.cancel-button,
.submit-button {
  padding: 10px 15px;
  border: 1px solid #d9d9d9;
  background-color: #f0f0f0;
  color: #000;
  border-radius: 4px;
  margin: 0 10px;
  transition: background-color 0.3s, color 0.3s;
}

.cancel-button:hover,
.submit-button:hover {
  background-color: #1890ff;
  color: white;
  cursor: pointer;
}

.completion-icon {
  width: 100px;
  height: 100px;
  background: rgba(116, 192, 65, 1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
}

.completion-icon::before {
  content: '✔';
  color: white;
  font-size: 50px;
}

.download-template {
  margin-top: 10px;
}
</style>
