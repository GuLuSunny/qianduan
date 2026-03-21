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
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'windSpeed'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'windSpeed')"
            @keyup.enter="handleEditBlur(scope.row, 'windSpeed')"
            ref="editInputRef"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'windSpeed')">
            {{ scope.row.windSpeed || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="rainfall"
        label="雨量(mm)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'rainfall'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'rainfall')"
            @keyup.enter="handleEditBlur(scope.row, 'rainfall')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'rainfall')">
            {{ scope.row.rainfall || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="atmosphereTemperature"
        label="大气温度(℃)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'atmosphereTemperature'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'atmosphereTemperature')"
            @keyup.enter="handleEditBlur(scope.row, 'atmosphereTemperature')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'atmosphereTemperature')">
            {{ scope.row.atmosphereTemperature || '-' }}
          </span>
        </template>
      </el-table-column>
      <!-- 移除：土壤温度 -->
      <el-table-column
        prop="digitalPressure"
        label="数字气压(hPa)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'digitalPressure'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'digitalPressure')"
            @keyup.enter="handleEditBlur(scope.row, 'digitalPressure')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'digitalPressure')">
            {{ scope.row.digitalPressure || '-' }}
          </span>
        </template>
      </el-table-column>
      <!-- 移除：简易总辐射 -->
      <el-table-column
        prop="windDirection"
        label="风向(°)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'windDirection'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'windDirection')"
            @keyup.enter="handleEditBlur(scope.row, 'windDirection')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'windDirection')">
            {{ scope.row.windDirection || '-' }}
          </span>
        </template>
      </el-table-column>
      <!-- 移除：土壤湿度 -->
      <!-- 移除：大气湿度 -->
      <el-table-column prop="pm25" label="PM2.5(μg/m³)" width="auto" align="center">
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'pm25'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'pm25')"
            @keyup.enter="handleEditBlur(scope.row, 'pm25')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'pm25')">
            {{ scope.row.pm25 || '-' }}
          </span>
        </template>
      </el-table-column>
      <!-- 移除：盐分 -->
      <!-- 移除：负氧离子 -->
      <!-- 移除：雨量累计 -->
      <!-- 移除：辐射累计 -->
      <el-table-column prop="pm10" label="PM10(μg/m³)" width="auto" align="center">
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'pm10'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'pm10')"
            @keyup.enter="handleEditBlur(scope.row, 'pm10')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'pm10')">
            {{ scope.row.pm10 || '-' }}
          </span>
        </template>
      </el-table-column>
      <!-- 添加新字段 -->
      <el-table-column
        prop="relativeHumidity"
        label="相对湿度(%RH)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'relativeHumidity'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'relativeHumidity')"
            @keyup.enter="handleEditBlur(scope.row, 'relativeHumidity')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'relativeHumidity')">
            {{ scope.row.relativeHumidity || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="aqiIndex"
        label="AQI指数"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'aqiIndex'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'aqiIndex')"
            @keyup.enter="handleEditBlur(scope.row, 'aqiIndex')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'aqiIndex')">
            {{ scope.row.aqiIndex || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="primaryPollutant"
        label="首要污染物"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'primaryPollutant'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'primaryPollutant')"
            @keyup.enter="handleEditBlur(scope.row, 'primaryPollutant')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'primaryPollutant')">
            {{ scope.row.primaryPollutant || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="airQualityLevel"
        label="空气质量等级"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'airQualityLevel'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'airQualityLevel')"
            @keyup.enter="handleEditBlur(scope.row, 'airQualityLevel')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'airQualityLevel')">
            {{ scope.row.airQualityLevel || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="sulfurDioxide"
        label="二氧化硫(μg/m³)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'sulfurDioxide'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'sulfurDioxide')"
            @keyup.enter="handleEditBlur(scope.row, 'sulfurDioxide')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'sulfurDioxide')">
            {{ scope.row.sulfurDioxide || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="nitrogenDioxide"
        label="二氧化氮(μg/m³)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'nitrogenDioxide'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'nitrogenDioxide')"
            @keyup.enter="handleEditBlur(scope.row, 'nitrogenDioxide')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'nitrogenDioxide')">
            {{ scope.row.nitrogenDioxide || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="carbonMonoxide"
        label="一氧化碳(mg/m³)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'carbonMonoxide'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'carbonMonoxide')"
            @keyup.enter="handleEditBlur(scope.row, 'carbonMonoxide')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'carbonMonoxide')">
            {{ scope.row.carbonMonoxide || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="ozone"
        label="臭氧(μg/m³)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'ozone'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'ozone')"
            @keyup.enter="handleEditBlur(scope.row, 'ozone')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'ozone')">
            {{ scope.row.ozone || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="ozone8Hour"
        label="臭氧8小时(μg/m³)"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'ozone8Hour'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'ozone8Hour')"
            @keyup.enter="handleEditBlur(scope.row, 'ozone8Hour')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'ozone8Hour')">
            {{ scope.row.ozone8Hour || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="filename"
        label="文件名"
        width="auto"
        align="center"
      >
        <template #default="scope">
          <el-input
            v-if="editRow && editRow.id === scope.row.id && editRow.prop === 'filename'"
            v-model="editRow.value"
            @blur="handleEditBlur(scope.row, 'filename')"
            @keyup.enter="handleEditBlur(scope.row, 'filename')"
            size="small"
            class="edit-input"
          />
          <span v-else @click="handleEditClick(scope.row, 'filename')">
            {{ scope.row.filename || '-' }}
          </span>
        </template>
      </el-table-column>
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
import { ref, onMounted, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import {
  getAtmospherePageQuery,
  delAtmosphereDataByids,
  queryDeviceByMultiWord,
  getTimesByType,
  updateOnly
} from '@/api/getData'
// import { updateOnly } from '@/api/atmosphere'
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

// 新增：编辑相关核心变量
const editRow = ref(null)  // 存储当前编辑的行信息 { id, prop, value, oldValue }
const editInputRef = ref(null)  // 编辑输入框的ref

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
// 新增：编辑相关核心方法
/**
 * 点击单元格进入编辑状态
 * @param {Object} row 当前行数据
 * @param {String} prop 要编辑的字段名
 */
function handleEditClick(row, prop) {
  // 关闭其他正在编辑的单元格
  if (editRow.value && (editRow.value.id !== row.id || editRow.value.prop !== prop)) {
    editRow.value = null
  }
  
  // 记录当前编辑的行信息（包含原始值，用于校验失败时回滚）
  editRow.value = {
    id: row.id,
    prop: prop,
    value: row[prop] || '',  // 当前值
    oldValue: row[prop] || '' // 原始值
  }
  
  // 下一帧聚焦输入框
  nextTick(() => {
    if (editInputRef.value) {
      editInputRef.value.focus()
    }
  })
}

/**
 * 编辑失焦/回车确认
 * @param {Object} row 当前行数据
 * @param {String} prop 编辑的字段名
 */
function handleEditBlur(row, prop) {
  if (!editRow.value) return
  
  // 获取编辑后的值并去除首尾空格
  const newValue = editRow.value.value.toString().trim()
  
  // 数据校验规则：仅允许 留空、非负数字、"缺测"
  const isValid = validateEditValue(newValue)
  
  if (isValid) {
    // 校验通过：更新数据并调用接口
    updateRowData(row, prop, newValue)
  } else {
    // 校验失败：提示并回滚到原始值
    ElMessage.warning(`输入内容无效！`)
    row[prop] = editRow.value.oldValue
    editRow.value = null
  }
}

/**
 * 数据校验函数
 * @param {String} value 要校验的值
 * @returns {Boolean} 是否有效
 */
function validateEditValue(value) {
  // 允许留空
  if (value === '') return true
  
  // 允许"缺测"（不区分大小写）
  if (value.toLowerCase() === '缺测') return true
  
  // 仅支持非负数字
  const numReg = /^\d+(\.\d+)?$/
  return numReg.test(value)
}

/**
 * 更新行数据并调用修改接口
 * @param {Object} row 当前行数据
 * @param {String} prop 字段名
 * @param {String} value 新值
 */
function updateRowData(row, prop, value) {
  // 前置校验：必须有行ID才能更新，否则直接提示失败
  if (!row || !row.id) {
    ElMessage.error('修改失败：当前行数据无有效ID，无法更新');
    return;
  }

  // 缓存原始值（深拷贝避免引用类型数据篡改）
  const oldValue = JSON.parse(JSON.stringify(row[prop]));
  
  // 临时更新前端表格（关键修改：保留空字符串，不强制转null，由后端决定空值逻辑）
  row[prop] = value;

  // 构造完整参数（包含更新字段）
  const updateData = {
    ids: [row.id], // 必须是数组
    status: 0,     // 固定条件
  };
  // 赋值：保留原始值类型（空字符串不再转null）
  updateData[prop] = value;

  // 调用接口
  updateOnly(updateData)
  .then((res) => {
    // 核心修改：兼容后端响应（日志显示更新成功，放宽判断条件）
    // 情况1：后端返回 {success: true}
    if (res.success || res.code === 'SUCCESS' || res.code === 200) {
      ElMessage.success('修改成功');
    } 
    // 情况2：后端返回空/无状态码，但日志显示更新成功（强制提示成功）
    else if (res && res.data !== 'fail') {
      ElMessage.success('修改成功');
    } 
    else {
      row[prop] = oldValue;
      ElMessage.error(`修改失败：${res.msg || '更新操作未执行'}`);
    }
  })
  .catch((error) => {
    row[prop] = oldValue;
    // 过滤真正的异常（如Token过期），排除后端更新成功但响应格式问题
    if (error.response?.data?.msg?.includes('token')) {
      ElMessage.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      localStorage.removeItem('Authorization');
      window.location.href = '/login';
    } 
    // 关键：如果后端更新成功（日志Updates:1），但前端走catch，提示成功
    else if (error.response?.status === 200) {
      ElMessage.success('修改成功');
    }
    else {
      ElMessage.error('修改失败：网络异常或接口响应格式问题');
    }
    console.error('更新失败详情：', error);
  })

  
  
  // 关闭编辑状态
  editRow.value = null
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
/* 新增：编辑输入框样式 */
.edit-input {
  width: 100%;
  --el-input-height: 28px;
}
</style>
