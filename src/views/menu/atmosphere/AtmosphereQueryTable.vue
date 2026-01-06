<template>
  <div class="container">
    <div class="form-inline">
      <el-form :model="formLabelAlign" inline>
        <!-- 新的日期选择器（按月份或年份），左对齐 -->
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
                handleVisibleChange(visibility, 'qixiang', 'month')
            "
            :disabled-date="(time) => disabledDate(time, 'qixiang', 'month')"
          />
          <el-date-picker
            v-if="searchInfo.type == 1"
            v-model="searchInfo.observationTime"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
            @change="handleInputChange"
            @visible-change="
              (visibility) => handleVisibleChange(visibility, 'qixiang', 'year')
            "
            :disabled-date="(time) => disabledDate(time, 'qixiang', 'year')"
          />
          <el-button @click="changeWayButton">
            {{ curWay }}
          </el-button>
        </el-form-item>

        <!-- 文件名 -->
        <el-form-item label="文件名" style="margin-left: 20px">
          <el-input
            v-model="searchInfo.filepath"
            placeholder="请输入文件名"
            @input="handleInputChange"
          />
        </el-form-item>

        <!-- 地点 -->
        <el-form-item label="地点" style="margin-left: 20px">
          <el-select
            v-model="searchInfo.deviceId"
            placeholder="请选择地点"
            @change="handleInputChange"
            style="width: 150px"
          >
            <el-option label="不限" value="" />
            <el-option
              v-for="device in deviceOptions"
              :key="device.id"
              :label="device.deviceName"
              :value="device.id"
            />
          </el-select>
        </el-form-item>

        <!-- 搜索和批量删除按钮 -->
        <el-form-item style="margin-left: 20px">
          <el-button @click="searchButton" class="searchButton">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button
            @click="deleteSelectedRows"
            :disabled="!isButtonDelDisabled"
            >批量删除</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格部分 - 仅修改列 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      show-overflow-tooltip
      max-height="600px"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        prop="observationTime"
        label="日期"
        width="120"
        align="center"
      />
      <el-table-column
        prop="deviceId"
        label="设备号"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="windSpeed"
        label="风速(m/s)"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="rainfall"
        label="雨量(mm)"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="atmosphereTemperature"
        label="大气温度(℃)"
        width="auto"
        align="center"
      />
      <!-- 移除：土壤温度 -->
      <el-table-column
        prop="digitalPressure"
        label="数字气压(hPa)"
        width="auto"
        align="center"
      />
      <!-- 移除：简易总辐射 -->
      <el-table-column
        prop="windDirection"
        label="风向(°)"
        width="auto"
        align="center"
      />
      <!-- 移除：土壤湿度 -->
      <!-- 移除：大气湿度 -->
      <el-table-column prop="pm25" label="PM2.5(μg/m³)" width="auto" align="center" />
      <!-- 移除：盐分 -->
      <!-- 移除：负氧离子 -->
      <!-- 移除：雨量累计 -->
      <!-- 移除：辐射累计 -->
      <el-table-column prop="pm10" label="PM10(μg/m³)" width="auto" align="center" />
      <!-- 添加新字段 -->
      <el-table-column
        prop="relativeHumidity"
        label="相对湿度(%RH)"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="aqiIndex"
        label="AQI指数"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="primaryPollutant"
        label="首要污染物"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="airQualityLevel"
        label="空气质量等级"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="sulfurDioxide"
        label="二氧化硫(μg/m³)"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="nitrogenDioxide"
        label="二氧化氮(μg/m³)"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="carbonMonoxide"
        label="一氧化碳(mg/m³)"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="ozone"
        label="臭氧(μg/m³)"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="ozone8Hour"
        label="臭氧8小时(μg/m³)"
        width="auto"
        align="center"
      />
      <el-table-column
        prop="filename"
        label="文件名"
        width="auto"
        align="center"
      />
      <el-table-column label="操作" width="auto" fixed="right">
        <template #default="scope">
          <el-button @click="confirmDeleteRow(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="demo-pagination-block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 15, 30, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      />
    </div>
  </div>
</template>

<script setup>
// 脚本部分完全保持不变！！！
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import {
  getAtmospherePageQuery,
  delAtmosphereDataByids,
  queryDeviceByMultiWord,
  getTimesByType
} from '@/api/getData'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
const loadingoptions = {
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const isButtonDelDisabled = ref(false)
const tableData = ref([])
const deviceOptions = ref([])
const selectedRows = ref([])
const searchInfo = ref({
  filepath: '',
  deviceId: '51',
  observationTime: '',
  type: 1
})
const curWay = ref('按年份')

// Fetch data on mount
onMounted(() => {
  fetchDeviceOptions()
  searchButton()
})

// Toggle between year and month selection
function changeWayButton () {
  handleInputChange()
  if (searchInfo.value.type === 1) {
    searchInfo.value.type = 2
    curWay.value = '按月份'
  } else {
    searchInfo.value.type = 1
    curWay.value = '按年份'
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
    customString = `${time.getFullYear()}`
  } else if (searchTimeType === 'month') {
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

// Fetch device options
function fetchDeviceOptions () {
  queryDeviceByMultiWord({ type: '03' })
    .then((res) => {
      if (res.response.value.code === 'SUCCESS') {
        deviceOptions.value = res.response.value.body
      } else {
        ElMessage.error(res.response.value.msg)
      }
    })
    .catch(() => {
      ElMessage.error('获取设备数据失败，请稍后再试')
    })
}

// Fetch table data
function getAtmosphereData () {
  const loadingInstance = ElLoading.service(loadingoptions)
  getAtmospherePageQuery({
    filepath: searchInfo.value.filepath,
    observationTime: searchInfo.value.observationTime,
    deviceId: searchInfo.value.deviceId,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  })
    .then((res) => {
      loadingInstance.close()
      if (res.response.value.code === 'SUCCESS') {
        tableData.value = res.response.value.body.records
        totalItems.value = res.response.value.body.total
        isButtonDelDisabled.value = tableData.value.length > 0
      } else {
        ElMessage.error(res.response.value.msg)
      }
    })
    .catch(() => {
      loadingInstance.close()
      ElMessage.error('获取气象数据失败，请稍后再试')
    })
}

function handleInputChange () {
  isButtonDelDisabled.value = false
}

// Search button action
function searchButton () {
  currentPage.value = 1
  getAtmosphereData()
}

function handleSizeChange (val) {
  pageSize.value = val
  getAtmosphereData()
}

function handleCurrentChange (val) {
  currentPage.value = val
  getAtmosphereData()
}

function handleSelectionChange (val) {
  selectedRows.value = val.map((row) => row.id)
}

// Delete selected rows
function deleteSelectedRows () {
  const requestObject = { ...searchInfo.value }
  if (
    selectedRows.value.length === 0 &&
    (requestObject.observationTime === '' ||
      requestObject.observationTime === null) &&
    requestObject.filepath === '' &&
    (requestObject.deviceId === '' || requestObject.deviceId === null)
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
      requestObject.ids = selectedRows.value
      delAtmosphereDataByids(requestObject)
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getAtmosphereData()
            ElMessage.success('删除成功')
          } else {
            ElMessage.error(res.response.value.msg)
          }
        })
        .catch(() => {
          ElMessage.error('删除失败，请稍后再试')
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

// Delete a single row  
function confirmDeleteRow(row) {  
  ElMessageBox.confirm('此操作将永久删除该行数据, 是否继续?', '提示', {  
    confirmButtonText: '确定',  
    cancelButtonText: '取消',  
    type: 'warning'  
  }).then(() => {  
    delAtmosphereDataByids({ ids: [row.id] })  
      .then((res) => {  
        if (res.response.value.code === 'SUCCESS') {  
          getAtmosphereData()  
          ElMessage.success('删除成功')  
        } else {  
          ElMessage.error(res.response.value.msg)  
        }  
      })  
      .catch(() => {  
        ElMessage.error('删除失败，请稍后再试')  
      })  
  }).catch((error) => {  
      if (error === 'cancel') {  
        ElMessage({  
          showClose: true,  
          message: '已取消删除',  
          center: true,  
          type: 'info'  
        })  
      }  
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

.form-inline {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.demo-pagination-block {
  margin-top: 20px;
}
</style>
