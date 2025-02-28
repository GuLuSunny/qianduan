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

    <!-- 表单内容 -->
    <div class="form-container">
      <!-- 鸟类信息横向排列容器 -->
      <el-form :model="form" label-width="140px" v-if="current === 0">
        <div class="form-horizontal-group">
          <!-- 第一列 -->
          <div class="form-column">
            <el-form-item label="所属目名" :required = "true">
              <el-select v-model="birdorderId" placeholder="请选择水鸟所属目名">
                <el-option
                  v-for="order in birdOrders"
                  :key="order.id"
                  :label="order.name"
                  :value="order.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="所属科名" :required = "true">
              <el-select
                v-model="birdfamilyId"
                placeholder="请选择水鸟所属科名"
              >
                <el-option
                  v-for="family in filteredFamilies"
                  :key="family.id"
                  :label="family.name"
                  :value="family.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="水鸟种类" :required = "true">
              <el-select v-model="birdSpeciesId" placeholder="请选择水鸟种类">
                <el-option
                  v-for="species in filteredSpecies"
                  :key="species.id"
                  :label="species.name"
                  :value="species.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="水鸟数量" :required = "true">
              <el-input-number
                v-model="birdCount"
                placeholder="请输入水鸟数量"
                min="1"
                :precision="0"
                style="width: 100%;"
                controls-position="right"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="观测日期" :required = "true">
              <el-date-picker
                v-model="observationDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择观测日期"
              />
            </el-form-item>
          </div>
          <!-- 第二列 -->
          <div class="form-column">
            <el-form-item label="天气" :required = "true">
              <el-input
                v-model="weather"
                placeholder="请输入天气状况"
              ></el-input>
            </el-form-item>
            <el-form-item label="观察地点" :required = "true">
              <el-select v-model="observingsites" placeholder="请选择观察地点">
                <el-option
                  v-for="site in locations"
                  :key="site"
                  :label="site"
                  :value="site"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="生境类型" :required = "true">
              <el-select v-model="habitattype" placeholder="请选择生境类型">
                <el-option
                  v-for="type in habitatTypes"
                  :key="type"
                  :label="type"
                  :value="type"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="观察人员所属组别" :required = "true">
              <el-select
                v-model="personnelgroup"
                placeholder="请选择人员所属组别"
              >
                <el-option
                  v-for="group in groups"
                  :key="group.id"
                  :label="group.name"
                  :value="group.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="观测时间" :required = "true">
              <el-time-picker
                v-model="observationTimeRange"
                is-range
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                :clearable="false"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
      <!-- 按钮 -->
      <div class="button-group" v-if="current === 0">
        <el-button @click="handleCancel" class="cancel-button">取消</el-button>
        <el-button @click="handleSubmit" class="submit-button" type="primary"
          >提交</el-button
        >
      </div>
    </div>
    <!-- 确认资料信息部分 -->
    <div class="form-container" v-if="current === 1">
      <el-table
        :data="infoData"
        style="width: 50%; margin: 0 auto"
        border
        :header-cell-style="{ backgroundColor: '#f2f2f2' }"
      >
        <el-table-column
          prop="title"
          label="信息项"
          width="150"
        ></el-table-column>
        <el-table-column prop="value" label="内容"></el-table-column>
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
import { ref, computed, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  getBirdData,
  queryDeviceByMultiWord,
  observationBirdInsert
} from '@/api/getData'
import { ElMessage, ElLoading } from 'element-plus'

const birdOrders = ref([])
const birdFamilies = ref({})
const birdSpeciesMap = ref({})
const groups = ref([])

const birdSpeciesId = ref('') // 鸟类种类
const birdfamilyId = ref('') // 鸟类科名
const birdorderId = ref('') // 鸟类目名
const birdCount = ref('') // 鸟类数量
const observationTimeRange = ref(['', '']) // 观察时段
const habitattype = ref('') // 生境类型
const weather = ref('') // 天气
const observingsites = ref('') // 观察地点
const personnelgroup = ref('') // 观察人员所属组别
const current = ref(0) // 当前步骤
const infoVisible = ref(true) // 提示框是否可见
const observationDate = ref('') // 观测日期
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
const infoData = ref([
  {
    title: '所属目名',
    value: computed(
      () =>
        birdOrders.value.find((order) => order.id === birdorderId.value)
          ?.name || ''
    )
  },
  {
    title: '所属科名',
    value: computed(() => {
      const selectedOrder = birdOrders.value.find(
        (order) => order.id === birdorderId.value
      )
      return (
        birdFamilies.value[selectedOrder ? selectedOrder.name : '']?.find(
          (family) => family.id === birdfamilyId.value
        )?.name || ''
      )
    })
  },
  {
    title: '水鸟种类',
    value: computed(() => {
      const selectedFamily = Object.values(birdFamilies.value)
        .flat()
        .find((family) => family.id === birdfamilyId.value)
      return (
        birdSpeciesMap.value[selectedFamily ? selectedFamily.name : '']?.find(
          (species) => species.id === birdSpeciesId.value
        )?.name || ''
      )
    })
  },
  { title: '水鸟数量', value: birdCount },
  {
    title: '观测时段',
    value: observationTimeRange.value[0] + ' - ' + observationTimeRange.value[1]
  },
  { title: '观察地点', value: observingsites },
  { title: '天气', value: weather },
  { title: '生境类型', value: habitattype },
  {
    title: '观察人员所属组别',
    value: computed(
      () =>
        groups.value.find((group) => group.id === personnelgroup.value)?.name ||
        ''
    )
  }
])

const habitatTypes = [
  '水中、空中飞过',
  '水中、空中飞过、岸上',
  '滩涂',
  '水中',
  '空中飞过、岸上',
  '水中、空中飞过、其他',
  '岸上',
  '空中飞过',
  '滩涂、空中飞过',
  '树上',
  '滩涂、空中飞过、其他',
  '水中、岸上',
  '其他',
  '无'
]

const locations = ref([])

// 验证表单是否有效
const isFormValid = computed(() => {
  return (
    birdorderId.value &&
    birdfamilyId.value &&
    birdSpeciesId.value &&
    birdCount.value &&
    observationTimeRange.value[0] &&
    observationTimeRange.value[1] &&
    weather.value &&
    observingsites.value &&
    habitattype.value &&
    personnelgroup.value
  )
})

// 根据所选目名过滤的科目
const filteredFamilies = computed(() => {
  const selectedOrder = birdOrders.value.find(
    (order) => order.id === birdorderId.value
  )
  return birdFamilies.value[selectedOrder ? selectedOrder.name : ''] || []
})
// 根据所选科目过滤的种类
const filteredSpecies = computed(() => {
  const selectedFamily = Object.values(birdFamilies.value)
    .flat()
    .find((family) => family.id === birdfamilyId.value)
  return birdSpeciesMap.value[selectedFamily ? selectedFamily.name : ''] || []
})

// 监听 birdordername 的变化
watch(birdorderId, (newOrderName) => {
  if (filteredFamilies.value.length > 0) {
    birdfamilyId.value = filteredFamilies.value[0].id
  } else {
    birdfamilyId.value = ''
  }
  // 当目名变化时，种类也需要相应变化
  if (filteredSpecies.value.length > 0) {
    birdSpeciesId.value = filteredSpecies.value[0].id
  } else {
    birdSpeciesId.value = ''
  }
})

// 监听 birdfamilyname 的变化
watch(birdfamilyId, (newFamilyName) => {
  if (filteredSpecies.value.length > 0) {
    birdSpeciesId.value = filteredSpecies.value[0].id
  } else {
    birdSpeciesId.value = ''
  }
})

watch(
  () => observationTimeRange.value,
  (newTimeRange) => {
    infoData.value[4].value = newTimeRange[0] + ' 至 ' + newTimeRange[1]
  }
)

function handleCancel () {
  birdorderId.value =
    birdfamilyId.value =
    birdSpeciesId.value =
    birdCount.value =
    observationTimeRange.value =
    weather.value =
    observingsites.value =
    habitattype.value =
    personnelgroup.value =
    observationDate.value =
      ''
}

function handleSubmit () {
  if (!isFormValid.value) {
    message.error('请填写完整表单信息')
    return
  }
  birdCount.value = parseInt(birdCount.value)
  current.value = 1 // 进入确认资料信息步骤
}

function handlePrevious () {
  if (current.value > 0) {
    current.value -= 1
  }
}

function handleConfirm () {
  const loadingInstance = ElLoading.service(loadingoptions)
  const data = {
    orderId: birdorderId.value,
    familyId: birdfamilyId.value,
    speciesId: birdSpeciesId.value,
    watchPiId: personnelgroup.value,
    observationPeriodBegin: observationTimeRange.value[0],
    observationPeriodEnd: observationTimeRange.value[1],
    observationAddress: observingsites.value,
    habitatType: habitattype.value,
    number: birdCount.value,
    weather: weather.value,
    observationTime: observationDate.value
  }

  observationBirdInsert(data)
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        message.success('表单提交成功.')
        current.value = 2
      } else {
        message.error('表单提交失败: ' + result.message)
      }
    })
    .catch((error) => {
      loadingInstance.close()
      console.error('请求失败:', error)
      message.error('请求失败: ' + error.message)
    })
}

function handleContinue () {
  handleCancel() // 重置表单
  current.value = 0 // 返回填写资料信息步骤
}
function hideInfo () {
  infoVisible.value = false
}

// 获取目、科、种类、组别数据
function getBirdDataFunc () {
  getBirdData()
    .then((res) => {
      const response = res.response.value
      if (response.code === 'SUCCESS') {
        const body = response.body
        birdOrders.value = body.orders.map((order) => ({
          id: order.id,
          name: order.name
        }))
        body.familyToorder.forEach((item) => {
          if (!birdFamilies.value[item.orderName]) {
            birdFamilies.value[item.orderName] = []
          }
          item.familyId.forEach((id, index) => {
            birdFamilies.value[item.orderName].push({
              id,
              name: item.familyName[index]
            })
          })
        })
        body.speciesTofamily.forEach((item) => {
          if (!birdSpeciesMap.value[item.familyName]) {
            birdSpeciesMap.value[item.familyName] = []
          }
          item.speciesId.forEach((id, index) => {
            birdSpeciesMap.value[item.familyName].push({
              id,
              name: item.speciesName[index]
            })
          })
        })
        groups.value = body.groups[0].groupId.map((id, index) => ({
          id,
          name: body.groups[0].groupName[index]
        }))
      } else {
        message.error('获取水鸟数据失败: ' + response.msg)
      }
    })
    .catch((error) => {
      console.error('请求失败:', error)
      message.error('请求失败: ' + error.message)
    })
}

function fetchDeviceOptions () {
  queryDeviceByMultiWord({ type: '09' })
    .then((res) => {
      if (res.response.value.code === 'SUCCESS') {
        locations.value = res.response.value.body.map((item) => item.deviceName)
      } else {
        ElMessage.error(res.response.value.msg)
      }
    })
    .catch(() => {
      ElMessage.error('获取设备数据失败，请稍后再试')
    })
}

// 获取鸟类数据
onMounted(() => {
  fetchDeviceOptions()
  getBirdDataFunc()
})
</script>

<style scoped>
.form-container {
  margin: 20px auto;
  max-width: 1200px;
  /* 设置表单最大宽度 */
}

.form-horizontal-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  /* 水平居中 */
}

.form-column {
  flex: 1;
  padding: 0 20px;
  /* 可选：为列添加内边距 */
}

.el-form-item {
  width: 100%;
  margin-bottom: 50px;
  /* 增加下方间距 */
}

.form-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-wrap: wrap;
  /* 允许换行，但在这个场景下可能不需要 */
  align-items: center;
  /* 垂直居中 */
  margin-bottom: 30px;
  /* 增加底部间距，调整框与框之间的垂直距离 */
  margin-left: 120px;
}

.form-horizontal-group {
  display: flex;
  flex-wrap: wrap;
  /* 允许换行 */
  margin-top: 20px;
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

.ta {
  text-align: left;
  font-size: 14px;
  text-indent: 120px;
  /* 第一行向右缩进，值可以根据需要调整 */
}

select {
  height: 30px;
  /* 设置 select 元素的高度 */
  padding: 5px;
  /* 设置内边距，根据需要调整 */
  font-size: 12px;
  /* 可选，设置字体大小 */
}

option {
  line-height: 20px;
  /* 确保 option 元素的文字也居中 */
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
