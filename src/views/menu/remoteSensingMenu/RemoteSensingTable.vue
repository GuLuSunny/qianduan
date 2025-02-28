<template>
  <div class="container">
    <div class="controls">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
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
                handleVisibleChange(visibility, 'weixing', 'month')
            "
            :disabled-date="(time) => disabledDate(time, 'weixing', 'month')"
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
              (visibility) => handleVisibleChange(visibility, 'weixing', 'year')
            "
            :disabled-date="(time) => disabledDate(time, 'weixing', 'year')"
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
        <!-- 地点 -->
        <el-form-item label="地点" style="margin-left: 20px">
          <el-select
            v-model="searchInfo.deviceId"
            placeholder="请选择地点"
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
    <el-table
      :data="tableData"
      style="width: 100%"
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
      ></el-table-column>
      <el-table-column
        prop="type"
        label="来源"
        width="auto"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="userName"
        label="上传用户"
        width="auto"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="filepath"
        label="文件名"
        width="auto"
        show-overflow-tooltip
        align="center"
      ></el-table-column>
      <el-table-column
        prop="dataIntroduction"
        label="数据简介"
        width="auto"
        align="center"
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
  getRemoteSensingPageQuery,
  deleteRemoteSensingById,
  queryDeviceByMultiWord,
  getTimesByType
} from '@/api/getData'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const isButtonDelDisabled = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const deviceOptions = ref([])
const totalItems = ref(0)
const selectedRows = ref([])
const curWay = ref('切换月')
const searchInfo = ref({
  observationTime: '',
  filepath: '',
  deviceId: '',
  type: '1'
})
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
      fetchDeviceOptions()
      searchButton()
    })
  }
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

// Fetch device options
function fetchDeviceOptions () {
  queryDeviceByMultiWord({ type: '04' })
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
  getRemoteSensingData()
}

// 分页查询
function getRemoteSensingData () {
  const loadingInstance = ElLoading.service(loadingoptions)
  getRemoteSensingPageQuery({
    observationTime: searchInfo.value.observationTime,
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    deviceId: searchInfo.value.deviceId,
    filepath: searchInfo.value.filepath
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        tableData.value = result.body.records.map((item) => ({
          ...item,
          type: item.type === 'form' ? '单条系统录入' : '批量文件导入',
          fileName: item.filepath
        }))
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
  getRemoteSensingData()
}

function handleCurrentChange (val) {
  currentPage.value = val
  if (totalItems.value === 0) return
  getRemoteSensingData()
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
      deleteRemoteSensingById({
        ids: [row.id]
      })
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getRemoteSensingData()
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
  // 或者使用展开运算符（更现代且简洁的方式）
  const requestObject = { ...searchInfo.value }
  if (
    selectedRows.value.length === 0 &&
    (requestObject.observationTime === '' ||
      requestObject.observationTime === null) &&
    requestObject.filepath === ''
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
      deleteRemoteSensingById(requestObject)
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getRemoteSensingData()
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
