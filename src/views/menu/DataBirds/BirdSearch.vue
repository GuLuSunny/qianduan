<template>
  <div class="container">
    <div class="controls">
      <el-form :model="searchInfo">
        <div class="row">
          <el-form-item label="所属目名">
            <el-select
              id="order"
              v-model="searchInfo.selectedOrder"
              placeholder="请选择"
              @change="handleInputChange"
              :empty-values="[null, undefined]"
            >
              <el-option
                v-for="order in [{ name: '所有', id: '' }, ...orders]"
                :key="order.id"
                :value="order.id"
                :label="order.name"
                >{{ order.name }}</el-option
              >
            </el-select>
          </el-form-item>
          <el-form-item label="所属科名">
            <el-select
              id="family"
              v-model="searchInfo.selectedFamily"
              placeholder="请选择"
              @change="handleInputChange"
              :empty-values="[null, undefined]"
            >
              <el-option
                v-for="family in [{id: '', name: '所有'}, ...filteredFamilies]"
                :key="family.id"
                :value="family.id"
                :label="family.name"
                >{{ family.name }}</el-option
              >
            </el-select>
          </el-form-item>
          <el-form-item label="水鸟种别">
            <el-select
              id="species"
              v-model="searchInfo.selectedSpecies"
              placeholder="请选择"
              @change="handleInputChange"
              :empty-values="[null, undefined]"
            >
              <el-option
                v-for="species in [{id: '', name: '所有'}, ...filteredSpecies]"
                :key="species.id"
                :value="species.id"
                :label="species.name"
                ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="生境类型">
            <el-select
              id="location"
              v-model="searchInfo.selectedHabitatType"
              placeholder="请选择"
              @change="handleInputChange"
              :empty-values="[null, undefined]"
            >
              <el-option
                v-for="habitatType in ['', ...habitatTypes]"
                :key="habitatType"
                :value="habitatType"
                :label="habitatType === '' ? '所有' : habitatType"
                ></el-option
              >
            </el-select>
          </el-form-item>
          <el-form-item label="组别">
            <el-select
              id="group"
              v-model="searchInfo.selectedGroup"
              placeholder="请选择"
              @change="handleInputChange"
              :empty-values="[null, undefined]"
            >
              <el-option
                v-for="group in [{groupId: '', groupName: '所有'}, ...groups]"
                :key="group.groupId"
                :value="group.groupId"
                :label="group.groupName"
                ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="row">
          <el-form-item label="观测日期">
            <el-date-picker
              v-model="searchInfo.observationDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleInputChange"
              placeholder="选择观测日期"
              :disabled-date="(time) => disabledDate(time)"
            />
          </el-form-item>
          <el-form-item label="观测时间">
            <el-time-picker
              v-model="searchInfo.observationTimeRange"
              is-range
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              @change="handleInputChange"
              :value-on-clear="() => []"
            />
          </el-form-item>
          <el-form-item label="观测地点">
            <el-select
              id="location"
              v-model="searchInfo.selectedLocation"
              placeholder="请选择"
              @change="handleInputChange"
              :empty-values="[null, undefined]"
            >
              <el-option
                v-for="location in ['', ...locations]"
                :key="location"
                :value="location"
                :label="location === '' ? '所有' : location"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="searchBird" class="searchButton">
              <el-icon> <Search /> </el-icon>搜索
            </el-button>
            <el-button
              @click="deleteSelectedRows"
              :disabled="!isButtonDelDisabled"
              >批量删除</el-button
            >
            <el-button @click="showExportDialog">导出数据</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <el-table
      :data="tableData"
      stripe
      style="width: 100%"
      show-overflow-tooltip
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="auto"></el-table-column>
      <el-table-column prop="orderId" label="所属目名" width="auto" />
      <el-table-column prop="familyId" label="所属科名" width="auto" />
      <el-table-column prop="speciesId" label="水鸟种别" width="auto" />
      <el-table-column prop="number" label="水鸟数量" width="auto" />
      <el-table-column prop="habitatType" label="生境类型" width="auto" />
      <el-table-column prop="observationTime" label="观测日期" width="auto" />
      <el-table-column
        prop="observationPeriodBegin"
        label="开始时间"
        width="auto"
      />
      <el-table-column
        prop="observationPeriodEnd"
        label="结束时间"
        width="auto"
      />
      <el-table-column
        prop="observationAddress"
        label="观测地点"
        width="auto"
      />
      <el-table-column prop="watchPiId" label="观测组别" width="auto" />
      <el-table-column prop="weather" label="天气" width="auto" />
      <el-table-column label="操作" width="auto" fixed="right" align="center">
        <template #default="scope">
          <el-button @click="confirmDeleteRow(scope.row, scope.$index)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 15, 30, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalItems"
    >
    </el-pagination>
    <!-- 导出对话框 -->
    <el-dialog title="请选择您要导出哪天的数据" v-model="exportDialogVisible">
      <el-date-picker
        v-model="exportDate"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @visible-change="(visibility) => handleVisibleChange(visibility)"
        :disabled-date="(time) => disabledDate(time)"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="exportData">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import {
  birdPageQuery,
  birdDelByIds,
  getBirdExcelByDate,
  getBirdData,
  getBirdDate,
  queryDeviceByMultiWord
} from '@/api/getData'

const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}

const searchInfo = ref({
  selectedOrder: '',
  selectedFamily: '',
  selectedSpecies: '',
  selectedHabitatType: '',
  observationTimeRange: ['', ''],
  selectedLocation: '',
  selectedGroup: '',
  observationDate: ''
})

const orders = ref([])
const orderIdToName = ref({})
const locations = ref([])
const groups = ref([])
const birdFamilies = ref({})
const birdSpeciesMap = ref({})

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

const filteredFamilies = computed(() => {
  if (searchInfo.value.selectedOrder === '') {
    return [...new Set(Object.values(birdFamilies.value).flat())]
  }
  return [
    ...(birdFamilies.value[
      orderIdToName.value[searchInfo.value.selectedOrder]
    ] || [])
  ]
})

const filteredSpecies = computed(() => {
  if (searchInfo.value.selectedFamily === '') {
    if (searchInfo.value.selectedOrder === '') {
      return [...new Set(Object.values(birdSpeciesMap.value).flat())]
    } else {
      const families =
        birdFamilies.value[
          orderIdToName.value[searchInfo.value.selectedOrder]
        ] || []
      const species = families.flatMap(
        (family) => birdSpeciesMap.value[family.name] || []
      )
      return [...species]
    }
  } else {
    return [
      ...(birdSpeciesMap.value[
        filteredFamilies.value.find(
          (family) => family.id === searchInfo.value.selectedFamily
        )?.name
      ] || [])
    ]
  }
})

watch(filteredFamilies, (newData) => {
  searchInfo.value.selectedFamily = ''
  searchInfo.value.selectedSpecies = ''
})

watch(filteredSpecies, (newData) => {
  searchInfo.value.selectedSpecies = ''
})

const isButtonDelDisabled = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const selectedRows = ref([])
const exportDialogVisible = ref(false)
const exportDate = ref('')

onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      searchBird()
      fetchDeviceOptions()
      getBirdDataFunc()
      handleVisibleChange()
    })
  }
})

const showDateArr = ref([])
// 可用日期
function disabledDate (time) {
  if (showDateArr.value == null || showDateArr.value.length === 0) {
    return true
  }
  const customString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`
  const isTimeInArray = showDateArr.value.includes(customString)
  return !isTimeInArray
}
// 请求日期
function handleVisibleChange () {
  getBirdDate({})
    .then((res) => {
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        const date = result.body.observationTime
        showDateArr.value = date
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

function handleInputChange () {
  // 搜索框内容变化时执行
  isButtonDelDisabled.value = false
}

function getBirdDataFunc () {
  getBirdData()
    .then((res) => {
      const response = res.response.value
      if (response.code === 'SUCCESS') {
        const body = response.body
        orders.value = body.orders.map((order) => ({
          name: order.name,
          id: order.id
        }))
        body.orders.forEach((order) => {
          orderIdToName.value[order.id] = order.name
        })
        body.familyToorder.forEach((item) => {
          item.familyName.forEach((family, index) => {
            if (!birdFamilies.value[item.orderName]) {
              birdFamilies.value[item.orderName] = []
            }
            birdFamilies.value[item.orderName].push({
              name: family,
              id: item.familyId[index]
            })
          })
        })
        body.speciesTofamily.forEach((item) => {
          item.speciesName.forEach((speciesName, index) => {
            if (!birdSpeciesMap.value[item.familyName]) {
              birdSpeciesMap.value[item.familyName] = []
            }
            birdSpeciesMap.value[item.familyName].push({
              name: speciesName,
              id: item.speciesId[index]
            })
          })
        })
        groups.value = body.groups[0].groupName.map((name, index) => ({
          groupName: name,
          groupId: body.groups[0].groupId[index]
        }))
      } else {
        ElMessage({ showClose: true, message: result.msg, center: true })
      }
    })
    .catch((error) => {
      ElMessage.error('获取水鸟数据失败，请稍后再试')
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

function searchBird () {
  currentPage.value = 1
  getBirdDataPage()
}

function getBirdDataPage () {
  const params = {
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    orderId: searchInfo.value.selectedOrder,
    familyId: searchInfo.value.selectedFamily,
    speciesId: searchInfo.value.selectedSpecies,
    watchPiId: searchInfo.value.selectedGroup,
    observationTime: searchInfo.value.observationDate,
    observationPeriodBegin: searchInfo.value.observationTimeRange[0],
    observationPeriodEnd: searchInfo.value.observationTimeRange[1],
    observationAddress: searchInfo.value.selectedLocation,
    habitatType: searchInfo.value.selectedHabitatType
  }
  const loadingInstance = ElLoading.service(loadingoptions)
  birdPageQuery(params)
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        tableData.value = result.body.records
        currentPage.value = result.body.current
        totalItems.value = result.body.total
        pageSize.value = result.body.size
        isButtonDelDisabled.value = true
      } else {
        ElMessage({
          showClose: true,
          message: result.msg,
          center: true
        })
      }
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage({
        showClose: true,
        message: '获取数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
}

function handleSizeChange (val) {
  pageSize.value = val
  if (totalItems.value === 0) {
    return
  }
  getBirdDataPage()
}

function handleCurrentChange (val) {
  currentPage.value = val
  if (totalItems.value === 0) {
    return
  }
  getBirdDataPage()
}

function handleSelectionChange (val) {
  const list = []
  for (let i = 0; i < val.length; i++) {
    list.push(val[i].id)
  }
  selectedRows.value = list
}

function confirmDeleteRow (row, index) {
  ElMessageBox.confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      birdDelByIds({ ids: [row.id] })
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getBirdDataPage()
            ElMessage({
              showClose: true,
              message: '删除成功',
              center: true,
              type: 'success'
            })
          } else {
            ElMessage({
              showClose: true,
              message: res.response.value.msg,
              center: true,
              type: 'error'
            })
          }
        })
        .catch((error) => {
          ElMessage({
            showClose: true,
            message: '删除失败，请稍后再试',
            center: true,
            type: 'error'
          })
        })
    })
    .catch(() => {
      ElMessage({
        showClose: true,
        message: '已取消删除',
        center: true,
        type: 'info'
      })
    })
}

function deleteSelectedRows () {
  const requestObject = {
    ids: selectedRows.value,
    orderId: searchInfo.value.selectedOrder,
    familyId: searchInfo.value.selectedFamily,
    speciesId: searchInfo.value.selectedSpecies,
    watchPiId: searchInfo.value.selectedGroup,
    observationPeriodBegin: searchInfo.value.observationTimeRange[0],
    observationPeriodEnd: searchInfo.value.observationTimeRange[1],
    observationAddress: searchInfo.value.selectedLocation,
    habitatType: searchInfo.value.selectedHabitatType
  }

  if (
    selectedRows.value.length === 0 &&
    !requestObject.orderId &&
    !requestObject.familyId &&
    !requestObject.speciesId &&
    !requestObject.habitatType &&
    !requestObject.observationPeriodBegin &&
    !requestObject.observationPeriodEnd &&
    !requestObject.observationAddress &&
    !requestObject.watchPiId
  ) {
    ElMessage({
      showClose: true,
      message: '请选择要删除的行',
      center: true,
      type: 'warning'
    })
    return
  }

  ElMessageBox.confirm(
    `此操作将永久删除选中的 ${
      selectedRows.value.length === 0
        ? totalItems.value
        : selectedRows.value.length
    } 条数据, 是否继续?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      birdDelByIds(requestObject)
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getBirdDataPage()
            ElMessage({
              showClose: true,
              message: '删除成功',
              center: true,
              type: 'success'
            })
          } else {
            ElMessage({
              showClose: true,
              message: res.response.value.msg,
              center: true,
              type: 'error'
            })
          }
        })
        .catch((error) => {
          ElMessage({
            showClose: true,
            message: '删除失败，请稍后再试',
            center: true,
            type: 'error'
          })
        })
      selectedRows.value = []
    })
    .catch(() => {
      ElMessage({
        showClose: true,
        message: '已取消删除',
        center: true,
        type: 'info'
      })
    })
}

function showExportDialog () {
  exportDialogVisible.value = true
}

function exportData () {
  if (!exportDate.value) {
    ElMessage({
      showClose: true,
      message: '请选择导出日期',
      center: true,
      type: 'warning'
    })
    return
  }

  getBirdExcelByDate({ observationTime: exportDate.value })
    .then((res) => {
      // 处理下载文件逻辑
      const url = window.URL.createObjectURL(new Blob([res.response.value]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', exportDate.value + '鸟类数据.xls')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
      ElMessage({
        showClose: true,
        message: '导出成功',
        center: true,
        type: 'success'
      })
    })
    .catch((error) => {
      ElMessage({
        showClose: true,
        message: '导出失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })

  exportDialogVisible.value = false
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.controls {
  margin-left: 1%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 50px;
}

.row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.el-form-item {
  margin-right: 20px;
}

.el-select {
  width: 150px;
}

.el-date-picker {
  background-color: white;
}

.searchButton {
  background-color: aliceblue;
}
</style>
