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
      <el-button class="close-button" @click="hideInfo" type="text"
        >×</el-button
      >
    </div>

    <!-- 表单填写页面 -->
    <div class="form-container" v-if="current === 0">
      <!-- 文件上传 -->
      <div class="upload-container">
        <Dragger
          :multiple="true"
          style="margin-top: 20px"
          :beforeUpload="beforeUpload"
          :customRequest="handleCustomRequest"
          :fileList="files"
          :onRemove="onRemove"
          accept=".jpg,.jpeg,.png,.zip,.rar,.tif,.7z"
        >
          <p class="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p class="ant-upload-text">点击或将文件拖拽到这里上传</p>
          <p class="ant-upload-hint">支持图片和压缩包文件</p>
        </Dragger>
      </div>

      <!-- 表单填写 -->
      <el-form
        :model="form"
        label-width="120px"
        style="width: 40%; margin: 0 27%"
      >
        <el-form-item label="观测日期：" :required="true">
          <el-date-picker
            v-model="observationDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="请选择观测日期"
          />
        </el-form-item>
        <el-form-item label="观测地点：" :required="true">
          <el-input
            v-model="observationLocation"
            placeholder="请输入观测地点"
          ></el-input>
        </el-form-item>
        <el-form-item label="观测类型：" :required="true">
          <el-input
             v-model="observationType"
            placeholder="请输入观测类型"
          ></el-input>
        </el-form-item>
        <el-form-item label="数据简介：" :required="publishStatus === 'public'">
          <el-input
            type="textarea"
            v-model="dataDescription"
            placeholder="请输入数据简介"
            rows="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="发布人：" :required="publishStatus === 'public'">
          <el-input
            v-model="publisher"
            placeholder="请输入发布人姓名"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系电话：" :required="publishStatus === 'public'">
          <el-input
            v-model="contactPhone"
            placeholder="请输入发布人联系电话"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系地址：" :required="publishStatus === 'public'">
          <el-input
            v-model="contactAddress"
            placeholder="请输入发布人联系地址"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系邮箱：" :required="publishStatus === 'public'">
          <el-input
            v-model="contactEmail"
            placeholder="请输入发布人联系邮箱"
          ></el-input>
        </el-form-item>
        <el-form-item label="制作单位：" :required="publishStatus === 'public'">
          <el-input
            v-model="productionUnit"
            placeholder="请输入制作单位"
          ></el-input>
        </el-form-item>
          <!-- 
        <el-form-item label="状态：">
          <el-radio-group v-model="publishStatus">
            <el-radio label="public">公开</el-radio>
            <el-radio label="private">不公开</el-radio>
          </el-radio-group>
        </el-form-item>
        -->
      </el-form>

      <!-- 按钮组 -->
      <div class="button-group" v-if="current === 0">
        <el-button @click="handleCancel" class="cancel-button">取消</el-button>
        <el-button @click="handleSubmit" class="submit-button" type="primary"
          >提交</el-button
        >
      </div>
    </div>

    <!-- 文件确认页面 -->
    <div class="form-container" v-if="current === 1">
      <!-- 资料确认 -->
      <el-table
        :data="infoData"
        style="width: 50%; margin: 0 auto"
        border="true"
        :header-cell-style="{ backgroundColor: '#f2f2f2' }"
      >
        <el-table-column
          prop="title"
          label="信息项"
          width="150"
        ></el-table-column>
        <el-table-column prop="value" label="内容"></el-table-column>
      </el-table>

      <!-- 文件列表 -->
      <el-table
        :data="files"
        style="width: 50%; margin: 20px auto"
        border="true"
        :header-cell-style="{ backgroundColor: '#f2f2f2' }"
      >
        <el-table-column prop="name" label="文件名"></el-table-column>
      </el-table>

      <div class="button-group">
        <el-button @click="handlePrevious" class="cancel-button"
          >上一步</el-button
        >
        <el-button @click="handleConfirm" class="submit-button" type="primary"
          >确认</el-button
        >
      </div>
    </div>

    <!-- 上传完成页面 -->
    <div class="form-container" v-if="current === 2">
      <div class="completion-icon"></div>
      <h1 class="form-title">上传完成</h1>
      <div class="button-group">
        <el-button @click="handleContinue" class="submit-button" type="primary"
          >继续提交</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { message, Upload } from 'ant-design-vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElRadioGroup,
  ElRadio,
  ElTable,
  ElTableColumn,
  ElButton,
  ElLoading
} from 'element-plus'
import { droneImageInsert } from '@/api/getData'
const { Dragger } = Upload
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

const userinfo = JSON.parse(localStorage.getItem('Userinfo'))
const current = ref(0)
const infoVisible = ref(true)
const files = ref([])
const publisher = ref(userinfo.username)
const contactPhone = ref(userinfo.tel)
const contactAddress = ref(userinfo.address)
const contactEmail = ref(userinfo.email)
const productionUnit = ref(userinfo.productionCompany)
const publishStatus = ref('private')
const observationLocation = ref('');
const observationType = ref('');
const dataDescription = ref('')
const observationDate = ref('')
const infoData = ref([
  { title: '观测日期', value: observationDate.value },
  { title: '观测地点', value: observationLocation.value },
  { title: '观测类型', value: observationType.value },
  { title: '数据简介', value: dataDescription.value },
  { title: '发布人', value: publisher.value },
  { title: '联系电话', value: contactPhone.value },
  { title: '联系地址', value: contactAddress.value },
  { title: '联系邮箱', value: contactEmail.value },
  { title: '制作单位', value: productionUnit.value }
]);

const form = ref({
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
    })
  }
})
function beforeUpload (file) {
  const suffix = file.name.split('.').pop()
  if (!['jpg', 'jpeg', 'png', 'zip', 'rar', 'tif', '7z'].includes(suffix)) {
    message.error('文件格式不正确，请上传图片或压缩包文件')
    return false
  }
  files.value.push(file)
  return false
}

function onRemove (file) {
  const index = files.value.indexOf(file)
  files.value.splice(index, 1)
}

function handleCustomRequest ({ file, onSuccess, onError }) {
  files.value.push({ file, onSuccess, onError })
  message.success(`${file.name} 文件已添加到上传队列.`)
}

function handleSubmit () {
  if (observationDate.value === '') {
    message.error('请填写完整表单信息');
    return;
  }
  if (publishStatus.value === 'public') {
    if (
      publisher.value === '' ||
      contactPhone.value === '' ||
      contactAddress.value === '' ||
      contactEmail.value === '' ||
      productionUnit.value === '' ||
      dataDescription.value === '' ||
      observationLocation.value === '' ||
      observationType.value === ''
    ) {
      message.error('请填写完整表单信息');
      return;
    }
  }
  if (files.value.length === 0) {
    message.error('请上传文件');
    return;
  }
  infoData.value = [
    // 此处省略其他已有的信息项设置，保持不变
    { title: '观测地点', value: observationLocation.value },
    { title: '观测类型', value: observationType.value },
    { title: '数据简介', value: dataDescription.value },
    { title: '发布人', value: publisher.value },
    { title: '联系电话', value: contactPhone.value },
    { title: '联系地址', value: contactAddress.value },
    { title: '联系邮箱', value: contactEmail.value },
    { title: '制作单位', value: productionUnit.value }
  ];
  current.value = 1;
}

function handleCancel () {
  files.value = []
  publisher.value =
    contactPhone.value =
    contactAddress.value =
    contactEmail.value =
    productionUnit.value =
    dataDescription.value =
    observationDate.value =
      ''
}

function handlePrevious () {
  if (current.value > 0) {
    current.value -= 1
  }
}

function handleConfirm () {
  const loadingInstance = ElLoading.service(loadingoptions);
  files.value.forEach((file) => {
    const formData = new FormData();
    formData.append('fileMul', file);
    formData.append('createUserId', userinfo.id);
    formData.append('userName', publisher.value);
    formData.append('contactPhone', contactPhone.value);
    formData.append('contactAddress', contactAddress.value);
    formData.append('productionUnit', productionUnit.value);
    formData.append('observationTime', observationDate.value);
    formData.append('contactEmail', contactEmail.value);
    formData.append('dataIntroduction', dataDescription.value);
    formData.append('open', publishStatus.value === 'public'? 1 : 0);
    formData.append('deviceName', observationLocation.value);
    formData.append('typeDetail', observationType.value);

    droneImageInsert(formData)
    .then((res) => {
        loadingInstance.close();
        const result = res.response.value;
        if (result.code === 'SUCCESS') {
          message.success(`${file.name} 文件上传成功.`);
          current.value = 2;
        } else {
          message.error(
            `${file.name} 上传失败，请下载EXCEL模板，按照模板格式提交！`
          );
        }
      })
    .catch((error) => {
        loadingInstance.close();
        message.error(
          `${file.name} 上传失败，请下载EXCEL模板，按照模板格式提交！`
        );
      });
  });
  files.value = [];
}

function handleContinue () {
  files.value = []
  current.value = 0
}

function hideInfo () {
  infoVisible.value = false
}
</script>

<style scoped>
.form-container {
  margin: 20px;
  font-size: 16px;
}

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
</style>
