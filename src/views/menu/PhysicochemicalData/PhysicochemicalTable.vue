<template>
  <div class="container">
    <div class="controls">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <!-- Existing form items -->
        <el-form-item label="日期">
          <el-date-picker
            v-if="searchInfo.type == 2"
            v-model="searchInfo.observationTime"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            @change="handleInputChange"
            @visible-change="
              (visibility) =>
                handleVisibleChange(visibility, 'shuitilihua', 'month')
            "
            :disabled-date="
              (time) => disabledDate(time, 'shuitilihua', 'month')
            "
          >
          </el-date-picker>
          <el-date-picker
            v-if="searchInfo.type == 1"
            v-model="searchInfo.observationTime"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
            @change="handleInputChange"
            @visible-change="
              (visibility) =>
                handleVisibleChange(visibility, 'shuitilihua', 'year')
            "
            :disabled-date="(time) => disabledDate(time, 'shuitilihua', 'year')"
          >
          </el-date-picker>
          <el-button @click="changeWayButton">
            {{ curWay }}
          </el-button>
        </el-form-item>
        <el-form-item label="文件名">
          <el-input
            v-model="searchInfo.filepath"
            placeholder="请输入文件名"
            @input="handleInputChange"
          />
        </el-form-item>
        <!-- New device ID dropdown -->
        <el-form-item label="设备号">
          <el-select
            v-model="searchInfo.deviceId"
            placeholder="请选择设备号"
            @change="handleInputChange"
            style="width: 150px"
            :empty-values="[null, undefined]"
          >
            <el-option
              v-for="device in [{id: '', deviceName: '不限'}, ...deviceOptions]"
              :key="device.id"
              :label="device.deviceName"
              :value="device.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="searchButton" class="searchButton">
            <el-icon> <Search /> </el-icon>搜索
          </el-button>
          <el-button
            @click="deleteSelectedRows"
            :disabled="!isButtonDelDisabled"
            >批量删除</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <!-- Existing table and pagination -->
    <el-table
      :data="tableData"
      style="width: 100%"
      c
      @selection-change="handleSelectionChange"
      stripe="true"
      max-height="600px"
    >
      <el-table-column type="selection" width="auto"></el-table-column>
      <el-table-column
        prop="observationTime"
        label="日期"
        width="100"
        align="center"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="deviceId"
        label="设备名"
        width="auto"
        align="center"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="turbidity"
        label="浊度(mg/L)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="chlorophyll"
        label="叶绿素(μg/L)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="waterTemperature"
        label="水温(℃)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="conductivity"
        label="电导率(mg/L)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="tss"
        label="TSS(mg/L)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="transparency"
        label="透明度(m)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="ph"
        label="pH"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="tn"
        label="TN(mg/L)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="dissolvedOxygen"
        label="溶解氧(mg/L)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="tp"
        label="TP(mg/L)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="codmn"
        label="高锰酸盐指数(mg/L)"
        width="auto"
        align="center"
        :formatter="formatNumber"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="filepath"
        label="文件名"
        width="auto"
        align="center"
        show-overflow-tooltip
      ></el-table-column>
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
    ></el-pagination>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, watch } from 'vue'
import {
  getWaterPhyPageQuery,
  delWaterPhyDataByids,
  queryDeviceByMultiWord,
  getTimesByType
} from '@/api/getData'
import { ElMessage, ElMessageBox,
  ElLoading } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const isButtonDelDisabled = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const selectedRows = ref([])
const curWay = ref('切换月')
const searchInfo = ref({
  observationTime: '',
  filepath: '',
  deviceId: '', // New device ID field
  type: '1'
})
const deviceOptions = ref([]) // Device options for the dropdown
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
onMounted(() => {
  const instance = getCurrentInstance()
  if (instance) {
    instance.proxy.$nextTick(() => {
      searchButton()
    })
  }
  fetchDeviceOptions() // Fetch device options on mount
})

watch(
  () => searchInfo.value.type,
  (newType) => {
    searchInfo.value.observationTime = ''
  }
)
function handleInputChange () {
  // 搜索框内容变化时执行
  isButtonDelDisabled.value = false
}
// 切换年月按钮
function changeWayButton () {
  handleInputChange()
  if (curWay.value === '切换年') {
    curWay.value = '切换月'
    searchInfo.value.type = '1'
  } else {
    curWay.value = '切换年'
    searchInfo.value.type = '2'
  }
}

const showDateArr = ref([])
// 可用日期
function disabledDate (time, type, searchTimeType) {
  if (showDateArr.value == null || showDateArr.value.length === 0) {
    return true
  }
  let customString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`
  if (searchTimeType === 'year') {
    // year
    customString = `${time.getFullYear()}`
  } else if (searchTimeType === 'month') {
    // month
    customString = `${time.getFullYear()}-${(time.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`
  }
  const isTimeInArray = showDateArr.value.includes(customString)
  return !isTimeInArray
}
// 请求日期
function handleVisibleChange (visibility, type, searchTimeType) {
  if (visibility) {
    // 开启时
    const searchType = searchTimeType
    getTimesByType({
      type: type,
      searchTimeType: searchType
    })
      .then((res) => {
        const result = res.response.value
        if (result.code === 'SUCCESS') {
          const type = result.body.type
          const date = result.body.date
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
}

// 点击查询按钮
function searchButton () {
  currentPage.value = 1
  getWaterPhyData()
}

// 分页查询
function getWaterPhyData () {
  const loadingInstance = ElLoading.service(loadingoptions)
  getWaterPhyPageQuery({
    observationTime: searchInfo.value.observationTime,
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    filepath: searchInfo.value.filepath,
    deviceId: searchInfo.value.deviceId // Include device ID in the query
  })
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
    .catch(() => {
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
  if (totalItems.value === 0) return
  getWaterPhyData()
}

function handleCurrentChange (val) {
  currentPage.value = val
  if (totalItems.value === 0) return
  getWaterPhyData()
}

function handleSelectionChange (val) {
  selectedRows.value = val.map((row) => row.id)
}

// 单行删除
function confirmDeleteRow (row) {
  ElMessageBox.confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      delWaterPhyDataByids({
        ids: [row.id]
      })
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getWaterPhyData()
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
        .catch(() => {
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

// 批量删除
function deleteSelectedRows () {
  const requestObject = { 
    ids: selectedRows.value,
    dateSelected: searchInfo.value.observationTime,
    filepath: searchInfo.value.filepath,
    deviceId: searchInfo.value.deviceId
  }
  if (
    selectedRows.value.length === 0 &&
    (requestObject.observationTime === '' ||
      requestObject.observationTime === null) &&
    requestObject.filepath === '' && requestObject.deviceId === ''
  ) {
    ElMessage({
      showClose: true,
      message: '请选择要删除的行',
      center: true,
      type: 'warning'
    })
    return
  }

  console.log(requestObject)

  ElMessageBox.confirm(
    `此操作将永久删除选中的 ${selectedRows.value.length===0?totalItems.value:selectedRows.value.length} 条数据, 是否继续?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      delWaterPhyDataByids(requestObject)
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getWaterPhyData()
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
        .catch(() => {
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

// Fetch device options for the dropdown
function fetchDeviceOptions () {
  queryDeviceByMultiWord({
    id: '',
    deviceName: '',
    type: '01'
  })
    .then((res) => {
      if (res.response.value.code === 'SUCCESS') {
        deviceOptions.value = res.response.value.body
      } else {
        ElMessage({
          showClose: true,
          message: res.response.value.msg,
          center: true,
          type: 'error'
        })
      }
    })
    .catch(() => {
      ElMessage({
        showClose: true,
        message: '获取设备数据失败，请稍后再试',
        center: true,
        type: 'error'
      })
    })
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
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.el-date-picker {
  background-color: white;
}

.el-table {
  margin-top: 20px;
}

.searchButton {
  background-color: aliceblue;
}
</style>
