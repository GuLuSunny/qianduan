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

    <!-- 填写资料信息页面 -->
    <div v-if="current === 0" class="form-container">
      <!-- 选择监测类型，观测地点，和观测日期在一行 -->
      <el-row :gutter="20" style="margin-bottom: 18px; width: 100%">
        <el-col :span="8">
          <el-form-item label="监测类型：" label-width="120px">
            <el-select v-model="submitType" placeholder="请选择监测类型" style="width: 100%">
              <el-option label="土壤检测指标" value="soil"></el-option>
              <el-option label="土壤植被检测指标" value="plant"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="观测地点：" label-width="120px">
            <el-select v-model="deviceName" placeholder="请选择观测地点" style="width: 100%">
              <el-option v-for="item in locations" :key="item.id" :label="item.deviceName" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="观测日期：" label-width="120px" :required="true">
            <el-date-picker v-model="investigationTime1" type="date" placeholder="选择日期" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD" style="width: 100%">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 土壤监测表单 -->
      <el-form v-if="submitType === 'soil'" :key="submitType" ref="soilFormRef" style="width: 100%; margin: 0"
        :model="soilForm" label-width="120px" class="demo-dynamic-soil">
        <div v-for="(group, index) in soilForm.groups" :key="group.key" style="
            border: 1px solid #ccc;
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
          ">
          <h4>土壤监测指标组别{{ index + 1 }}</h4>

          <!-- 土壤深度和土壤含水量 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item :label="'土壤深度'" :prop="'groups.' + index + '.depthRange'" :required="true" :show-message="false">
                <el-input v-model="group.depthRange" placeholder="请输入土壤深度范围" style="width: 100%"><template #append>cm</template></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="'土壤含水量 '" :prop="'groups.' + index + '.soilMoistureContent'" :required="true" :show-message="false">
                <el-input v-model="group.soilMoistureContent" type="number" placeholder="请输入土壤含水量"
                  style="width: 100%"><template #append>%</template></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="'土壤有机物含量 '" :prop="'groups.' + index + '.soilOrganicMatterContent'"
                :required="true" :show-message="false">
                <el-input v-model="group.soilOrganicMatterContent" type="number" placeholder="请输入土壤有机物含量"
                  style="width: 100%"><template #append>g/100g</template></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 土壤含碳总量和土壤含氮总量 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item :label="'土壤含碳总量 '" :prop="'groups.' + index + '.totalSoilCarbonContent'" :required="true" :show-message="false">
                <el-input v-model="group.totalSoilCarbonContent" type="number" placeholder="请输入土壤含碳总量"
                  style="width: 100%"><template #append>g/100g</template></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="'土壤含氮总量 '" :prop="'groups.' + index + '.totalSoilNitrogenContent'" :required="true" :show-message="false">
                <el-input v-model="group.totalSoilNitrogenContent" type="number" placeholder="请输入土壤含氮总量"
                  style="width: 100%"><template #append>g/100g</template></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="'土壤含磷总量 '" :prop="'groups.' + index + '.totalSoilPhosphorusContent'"
                :required="true" :show-message="false">
                <el-input v-model="group.totalSoilPhosphorusContent" type="number" placeholder="请输入土壤含磷总量"
                  style="width: 100%"><template #append>g/100g</template></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 按钮均匀分布 -->
          <el-row :gutter="20" style="margin-top: 10px; text-align: center">
            <el-col :span="12">
              <el-button style="width: 25%" @click="addSoilGroup">
                增加土壤监测指标组
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button style="width: 25%" @click="removeSoilGroup(group)">
                删除土壤监测指标组
              </el-button>
            </el-col>
            <el-col :span="8">
              <!-- 可加入其他按钮或功能 -->
            </el-col>
          </el-row>
        </div>
      </el-form>
      <!-- 植被相关表单 -->
      <el-form v-if="submitType === 'plant'" :key="submitType" model="form" label-width="120px"
        style="width: 100%; margin: 0">
        <div style="
            border: 1px solid #ccc;
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
          ">
          <!-- 第一行: 植被物种, 叶面积指数, 物候指数 -->
          <el-row :gutter="20" style="margin-bottom: 18px">
            <el-col :span="8">
              <el-form-item label="植被物种：" label-width="120px" :required="true">
                <el-select v-model="vegetationSpecies" @change="clearVegetationForm" placeholder="请选择植被物种"
                  style="width: 98%">
                  <el-option v-for="species in vegetationSpeciesOptions" :key="species" :label="species"
                    :value="species"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="叶面积指数：" label-width="120px" :required="true">
                <el-input v-model="leafAreaIndex" type="number" placeholder="请输入叶面积指数" style="width: 100%"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="物候指数：" label-width="120px" :required="true">
                <el-input v-model="phenologicalIndex" type="number" placeholder="请输入物候指数"
                  style="width: 100%"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第二行: 植被含水量, 叶绿素含量, 生物量 -->
          <el-row :gutter="20" style="margin-bottom: 18px">
            <el-col :span="8">
              <el-form-item label="植被含水量：" label-width="120px" :required="true">
                <el-input v-model="vegetationMoistureContent" type="number" placeholder="请输入植被含水量"
                  style="width: 100%"><template #append>%</template></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="叶绿素含量：" label-width="120px" :required="true">
                <el-input v-model="chlorophyllContent" type="number" placeholder="请输入叶绿素含量"
                  style="width: 100%"><template #append>mg/g</template></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="生物量：" label-width="120px" :required="true">
                <el-input v-model="biomass" type="number" placeholder="请输入生物量" style="width: 100%"><template #append>g/m²</template></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第三行: 碳氮比 -->
          <el-row :gutter="20" style="margin-bottom: 18px">
            <el-col :span="8">
              <el-form-item label="碳氮比：" label-width="120px" :required="true">
                <el-input v-model="carbonNitrogenRatio" type="number" placeholder="请输入碳氮比"
                  style="width: 100%"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <!-- 公共表单 -->
      <!-- <el-form :model="form" label-width="120px" style="width: 40%; margin: 0 auto;">
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
      </el-form> -->
      <div class="button-group">
        <el-button @click="handleCancel" class="cancel-button">取消</el-button>
        <el-button @click="handleSubmit" class="submit-button" type="primary">提交</el-button>
      </div>
    </div>

    <!-- 确认资料信息页面 -->
    <div v-if="current === 1" class="form-container">
      <el-table :data="infoData" style="width: 50%; margin: 0 auto" border="true"
        :header-cell-style="{ backgroundColor: '#f2f2f2' }">
        <el-table-column prop="title" label="信息项" width="150"></el-table-column>
        <el-table-column prop="value" label="内容"></el-table-column>
      </el-table>
      <div class="button-group">
        <el-button @click="handlePrevious" class="cancel-button">上一步</el-button>
        <el-button @click="handleConfirm" class="submit-button" type="primary">确认</el-button>
      </div>
    </div>

    <!-- 完成页面 -->
    <div v-if="current === 2" class="form-container">
      <div class="completion-icon"></div>
      <h1 class="form-title">上传完成</h1>
      <div class="button-group">
        <el-button @click="handleContinue" class="submit-button" type="primary">继续提交</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance, onMounted, reactive } from 'vue'
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
import { message } from 'ant-design-vue'
import {
  getTimesByType,
  queryDeviceByMultiWord,
  wetlandSoilInsert,
  wetlandPlantInsert
} from '@/api/getData'
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

// 表单数据
const soilFormRef = ref(null)

const soilForm = reactive({
  groups: [
    {
      key: Date.now(),
      depthRange: '',
      soilMoistureContent: '',
      soilOrganicMatterContent: '',
      totalSoilCarbonContent: '',
      totalSoilNitrogenContent: '',
      totalSoilPhosphorusContent: ''
    }
  ]
})
const addSoilGroup = () => {
  soilForm.groups.push({
    key: Date.now(),
    depthRange: '',
    soilMoistureContent: '',
    soilOrganicMatterContent: '',
    totalSoilCarbonContent: '',
    totalSoilNitrogenContent: '',
    totalSoilPhosphorusContent: ''
  })
}

const removeSoilGroup = (group) => {
  const index = soilForm.groups.indexOf(group)
  if (index !== -1) {
    soilForm.groups.splice(index, 1)
  }
}

const locations = ref([])
const userinfo = JSON.parse(localStorage.getItem('Userinfo'))
const current = ref(0)
const deviceName = ref('')
const investigationTime1 = ref('')
const submitType = ref('soil')
const infoVisible = ref(true)
const publisher = ref(userinfo.username)
const contactPhone = ref(userinfo.tel)
const contactAddress = ref(userinfo.address)
const contactEmail = ref(userinfo.email)
const productionUnit = ref(userinfo.productionCompany)

const publishStatus = ref('private')
const isRadioDisabled = ref(true)
const dataDescription = ref('')
const vegetationSpeciesOptions = ['芦苇、碎米莎草']
const depthRange = ref('')
const soilMoistureContent = ref('')
const soilOrganicMatterContent = ref('')
const totalSoilCarbonContent = ref('')
const totalSoilNitrogenContent = ref('')
const totalSoilPhosphorusContent = ref('')
const leafAreaIndex = ref('')
const phenologicalIndex = ref('')
const vegetationMoistureContent = ref('')
const chlorophyllContent = ref('')
const biomass = ref('')
const carbonNitrogenRatio = ref('')
const vegetationSpecies = ref('')

const infoData = ref([
  { title: '发布人', value: publisher.value },
  { title: '联系电话', value: contactPhone.value },
  { title: '联系地址', value: contactAddress.value },
  { title: '联系邮箱', value: contactEmail.value },
  { title: '制作单位', value: productionUnit.value }
])

const form = ref({
  deviceName: '',
  depthRange: '',
  soilMoistureContent: '',
  soilOrganicMatterContent: '',
  totalSoilCarbonContent: '',
  totalSoilNitrogenContent: '',
  totalSoilPhosphorusContent: '',
  leafAreaIndex: '',
  phenologicalIndex: '',
  vegetationMoistureContent: '',
  chlorophyllContent: '',
  biomass: '',
  carbonNitrogenRatio: '',
  vegetationSpecies: '',
  investigationTime1: '',
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
      // 获取用户信息
      const userinfo = JSON.parse(localStorage.getItem('Userinfo'))
      if (userinfo) {
        publisher.value = userinfo.username
        contactPhone.value = userinfo.tel
        contactAddress.value = userinfo.address
        contactEmail.value = userinfo.email
        productionUnit.value = userinfo.productionCompany
      }
      // 清空土壤监测组数据并初始化
      soilForm.groups = [
        {
          key: Date.now(),
          depthRange: '',
          soilMoistureContent: '',
          soilOrganicMatterContent: '',
          totalSoilCarbonContent: '',
          totalSoilNitrogenContent: '',
          totalSoilPhosphorusContent: ''
        }
      ]
      // 获取设备信息列表
      getDeviceInfoList('05')
    })
  }
})

// 根据设备类型，查询设备列表
// 观测设备种类分类；
// 01：光谱和水体监测点；
// 02：径流监测点；
// 03：气象站；
// 04：外业调查点位
// 05: 土壤监测点
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
  if (newType === 'soil') {
    // 清空植被相关字段
    vegetationSpecies.value = ''
    leafAreaIndex.value = ''
    phenologicalIndex.value = ''
    vegetationMoistureContent.value = ''
    chlorophyllContent.value = ''
    biomass.value = ''
    carbonNitrogenRatio.value = ''
    // 清空所有土壤监测组数据
    if (soilForm.groups && soilForm.groups.length > 0) {
      soilForm.groups.forEach((group) => {
        group.depthRange = ''
        group.soilMoistureContent = ''
        group.soilOrganicMatterContent = ''
        group.totalSoilCarbonContent = ''
        group.totalSoilNitrogenContent = ''
        group.totalSoilPhosphorusContent = ''
      })
    }

    // 设置默认状态
    isRadioDisabled.value = true
    publishStatus.value = 'private'
  } else if (newType === 'plant') {
    // 清空土壤相关字段
    if (soilForm.groups && soilForm.groups.length > 0) {
      soilForm.groups.forEach((group) => {
        group.depthRange = ''
        group.soilMoistureContent = ''
        group.soilOrganicMatterContent = ''
        group.totalSoilCarbonContent = ''
        group.totalSoilNitrogenContent = ''
        group.totalSoilPhosphorusContent = ''
      })
    }
    investigationTime1.value = ''

    // 清空植被相关字段
    vegetationSpecies.value = ''
    leafAreaIndex.value = ''
    phenologicalIndex.value = ''
    vegetationMoistureContent.value = ''
    chlorophyllContent.value = ''
    biomass.value = ''
    carbonNitrogenRatio.value = ''

    // 设置默认状态
    isRadioDisabled.value = true
    publishStatus.value = 'private'
  }
})

function clearForm() {
  form.value = {
    deviceName: '',
    depthRange: '',
    soilMoistureContent: '',
    soilOrganicMatterContent: '',
    totalSoilCarbonContent: '',
    totalSoilNitrogenContent: '',
    totalSoilPhosphorusContent: '',
    leafAreaIndex: '',
    phenologicalIndex: '',
    vegetationMoistureContent: '',
    chlorophyllContent: '',
    biomass: '',
    carbonNitrogenRatio: '',
    vegetationSpecies: '',
    investigationTime1: '',
    dataDescription: '',
    publisher: '',
    contactPhone: '',
    contactAddress: '',
    contactEmail: '',
    productionUnit: '',
    publishStatus: ''
  }

  // 如果有土壤监测组，清空每个组的指标
  if (soilForm.groups && soilForm.groups.length > 0) {
    soilForm.groups.forEach((group) => {
      group.depthRange = ''
      group.soilMoistureContent = ''
      group.soilOrganicMatterContent = ''
      group.totalSoilCarbonContent = ''
      group.totalSoilNitrogenContent = ''
      group.totalSoilPhosphorusContent = ''
    })
  }
}

function clearSoilForm() {
  if (soilForm.groups && soilForm.groups.length > 0) {
    soilForm.groups.forEach((group) => {
      group.depthRange = ''
      group.soilMoistureContent = ''
      group.soilOrganicMatterContent = ''
      group.totalSoilCarbonContent = ''
      group.totalSoilNitrogenContent = ''
      group.totalSoilPhosphorusContent = ''
    })
  }

  investigationTime1.value = ''
}

function clearVegetationForm() {
  leafAreaIndex.value = ''
  phenologicalIndex.value = ''
  vegetationMoistureContent.value = ''
  chlorophyllContent.value = ''
  biomass.value = ''
  carbonNitrogenRatio.value = ''
}

function handleCancel() {
  if (submitType.value === 'soil') {
    deviceName.value = ''
    investigationTime1.value = ''
    dataDescription.value = ''
    publisher.value = ''
    contactPhone.value = ''
    contactAddress.value = ''
    contactEmail.value = ''
    productionUnit.value = ''

    // 重置所有土壤监测组
    if (soilForm.groups && soilForm.groups.length > 0) {
      soilForm.groups.forEach((group) => {
        group.depthRange = ''
        group.soilMoistureContent = ''
        group.soilOrganicMatterContent = ''
        group.totalSoilCarbonContent = ''
        group.totalSoilNitrogenContent = ''
        group.totalSoilPhosphorusContent = ''
      })
    }
  }

  if (submitType.value === 'plant') {
    clearVegetationForm()
    dataDescription.value = ''
    publisher.value = ''
    contactPhone.value = ''
    contactAddress.value = ''
    contactEmail.value = ''
    productionUnit.value = ''
  }
}

function handleSubmit() {
  if (!investigationTime1.value) {
    message.error('请填写观测日期')
    return
  }
  if (submitType.value === 'soil') {
    // 验证逻辑：检查 depthRange 格式
    const rangeRegex = /^\d+-\d+$/ // 匹配 "数字-数字" 格式
    for (let i = 0; i < soilForm.groups.length; i++) {
      const group = soilForm.groups[i]
      const { depthRange, soilMoistureContent, soilOrganicMatterContent, totalSoilCarbonContent, totalSoilNitrogenContent, totalSoilPhosphorusContent} = group

      if (!depthRange) {
        message.error(`请填写组 ${i + 1} 的土壤深度范围`)
        return
      }

      if (!rangeRegex.test(depthRange)) {
        message.error(
          `组 ${i + 1} 的土壤深度范围格式错误，请输入如 "0-20" 的格式`
        )
        return
      }

      const [start, end] = depthRange.split('-').map(Number)
      if (start >= end) {
        message.error(`组 ${i + 1} 的土壤深度范围起始值必须小于结束值`)
        return
      }

      if (!group.soilMoistureContent) {
        message.error(`请填写组 ${i + 1} 的土壤含水量`)
        return
      }
      if (soilMoistureContent < 0 || soilMoistureContent > 100) {
        message.error(`组 ${i + 1} 的土壤含水量必须在0到100之间`)
        return
      }

      if (!group.soilOrganicMatterContent) {
        message.error(`请填写组 ${i + 1} 的土壤有机物含量`)
        return
      }
      if (soilOrganicMatterContent < 0 ) {
        message.error(`组 ${i + 1} 的土壤有机物含量不能为负数`)
        return
      }

      if (!group.totalSoilCarbonContent) {
        message.error(`请填写组 ${i + 1} 的土壤含碳总量`)
        return
      }
      if (totalSoilCarbonContent < 0 ) {
        message.error(`组 ${i + 1} 的土壤含碳总量不能为负数`)
        return
      }

      if (!group.totalSoilNitrogenContent) {
        message.error(`请填写组 ${i + 1} 的土壤含氮总量`)
        return
      }
      if (totalSoilNitrogenContent < 0 ) {
        message.error(`组 ${i + 1} 的土壤含氮总量不能为负数`)
        return
      }

      if (!group.totalSoilPhosphorusContent) {
        message.error(`请填写组 ${i + 1} 的土壤含磷总量`)
        return
      }
      if (totalSoilPhosphorusContent < 0 ) {
        message.error(`组 ${i + 1} 的土壤含磷总量不能为负数`)
        return
      }
  }
}
if (submitType.value === 'plant') {
    if (!vegetationSpecies.value) {
      message.error('请填写植被物种')
      return
    }
    if (!leafAreaIndex.value) {
      message.error('请填写叶面积指数')
      return
    }
    if (!phenologicalIndex.value) {
      message.error('请填写物候指数')
      return
    }
    if (!vegetationMoistureContent.value) {
      message.error('请填写植被含水量')
      return
    }
    if (vegetationMoistureContent.value < 0 || vegetationMoistureContent.value > 100) {
        message.error('植被含水量含水量必须在0到100之间')
        return
      }
    if (!chlorophyllContent.value) {
      message.error('请填写叶绿素含量')
      return
    }
    if (chlorophyllContent.value < 0 ) {
        message.error('叶绿素含量不能为负数')
        return
      }
    if (!biomass.value) {
      message.error('请填写生物量')
      return
    }
    if (biomass.value < 0 ) {
        message.error('生物量不能为负数')
        return
      }
    if (!carbonNitrogenRatio.value) {
      message.error('请填写碳氮比')
      return
    }
    if (carbonNitrogenRatio.value < 0 ) {
        message.error('碳氮比不能为负数')
        return
      }
    }
  infoData.value = [
    { title: '发布人', value: publisher.value },
    { title: '联系电话', value: contactPhone.value },
    { title: '联系地址', value: contactAddress.value },
    { title: '联系邮箱', value: contactEmail.value },
    { title: '制作单位', value: productionUnit.value }
  ]
  current.value = 1
}

function handlePrevious() {
  if (current.value > 0) {
    current.value -= 1
  }
}

function handleConfirm() {
  if (submitType.value === 'soil') {
    const loadingInstance = ElLoading.service(loadingoptions)
    // 验证通过，处理提交数据
    const soilData = soilForm.groups.map((group) => ({
      deviceId: deviceName.value,
      depthRange: group.depthRange,
      soilMoistureContent: group.soilMoistureContent,
      soilOrganicMatterContent: group.soilOrganicMatterContent,
      totalSoilCarbonContent: group.totalSoilCarbonContent,
      totalSoilNitrogenContent: group.totalSoilNitrogenContent,
      totalSoilPhosphorusContent: group.totalSoilPhosphorusContent,
      investigationTime: investigationTime1.value,
      userName: publisher.value,
      contactPhone: contactPhone.value,
      contactAddress: contactAddress.value,
      createUserid: userinfo.id,
      productionUnit: productionUnit.value,
      dataIntroduction: dataDescription.value,
      contactEmail: contactEmail.value,
      open: publishStatus.value === 'public' ? 1 : 0
    }))

    wetlandSoilInsert(soilData)
      .then((res) => {
        loadingInstance.close()
        const response = res.response.value
        if (response.code === 'SUCCESS') {
          message.success('表单提交成功.')
          current.value = 2
        } else {
          message.error('表单提交失败.')
        }
      })
      .catch((error) => {
        loadingInstance.close()
        console.error('请求失败:', error)
        message.error('请求失败: ' + error.message)
      })
    }
  

    if (submitType.value === 'plant') {
      const loadingInstance = ElLoading.service(loadingoptions)
      const data2 = {
      deviceId: deviceName.value,
      leafAreaIndex: leafAreaIndex.value,
      phenologicalIndex: phenologicalIndex.value,
      vegetationMoistureContent: vegetationMoistureContent.value,
      chlorophyllContent: chlorophyllContent.value,
      biomass: biomass.value,
      carbonNitrogenRatio: carbonNitrogenRatio.value,
      vegetationSpecies: vegetationSpecies.value,
      investigationTime: investigationTime1.value,
      userName: publisher.value,
      contactPhone: contactPhone.value,
      contactAddress: contactAddress.value,
      createUserid: userinfo.id,
      productionUnit: productionUnit.value,
      dataIntroduction: dataDescription.value,
      contactEmail: contactEmail.value,
      open: publishStatus.value === 'public' ? 1 : 0
    }
    wetlandPlantInsert([data2])
      .then((res) => {
        loadingInstance.close()
        const response = res.response.value
        if (response.code === 'SUCCESS') {
          message.success('表单提交成功.')
          current.value = 2
        } else {
          message.error('表单提交失败.')
        }
      })
      .catch((error) => {
        loadingInstance.close()
        console.error('请求失败:', error)
        message.error('请求失败: ' + error.message)
      })
    }
  }


function handleContinue() {
  clearForm()
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

.close-button:hover {
  color: red;
}

.form-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
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
