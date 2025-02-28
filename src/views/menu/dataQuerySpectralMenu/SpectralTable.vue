<template>
  <div class="container">
    <div class="controls">
      <el-form :inline="true" :model="searchInfo" class="demo-form-inline">
        <el-form-item label="日期">
          <el-date-picker
            v-model="searchInfo.dateSelected"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placement=""
            @change="handleInputChange"
            @visible-change="
              (visibility) => handleVisibleChange(visibility, 'guangpu', 'day')
            "
            :disabled-date="(time) => disabledDate(time, 'guangpu', 'day')"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="文件名">
          <el-input
            v-model="searchInfo.filepath"
            placeholder="请输入文件名"
            @input="handleInputChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="searchButton" class="searchButton"
            ><el-icon> <Search /> </el-icon>搜索</el-button
          >
          <el-button
            @click="deleteSelectedRows()"
            :disabled="!isButtonDelDisabled"
            >批量删除</el-button
          >
        </el-form-item>
      </el-form>

      <!-- <el-button @click="deleteSelectedRows">删除</el-button> -->
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      stripe="true"
      max-height="600px"
    >
      <el-table-column
        type="selection"
        width="auto"
        prop="tableId"
      ></el-table-column>
      <el-table-column
        prop="observationTime"
        label="日期"
        width="100"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="tableWave"
        label="波长 (nm)"
        width="auto"
        align="center"
      ></el-table-column>
      <el-table-column
        v-for="(dl, idx) in tableDeviceName"
        :key="idx"
        :prop="'data-' + dl"
        :label="dl"
        show-overflow-tooltip
        align="center"
      ></el-table-column>
      <el-table-column
        prop="fileName"
        label="文件名"
        width="auto"
        show-overflow-tooltip
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
    >
    </el-pagination>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import {
  findReflectanceByTime,
  deleteSpeDataById,
  getTimesByType
} from '@/api/getData'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const isButtonDelDisabled = ref(false)
const tableData = ref([])
const tableDeviceName = ref([])
const wavaDataList = ref([])

const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const selectedRows = ref([])
const searchInfo = ref({
  // 搜索框
  dateSelected: '',
  filepath: ''
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
      // 在 DOM 更新后执行
      searchButton()
    })
  }
})

const showDateArr = ref([])
// 可用日期
function disabledDate (time, type, searchTimeType) {
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

function handleInputChange () {
  // 搜索框内容变化时执行
  isButtonDelDisabled.value = false
}

function searchButton () {
  currentPage.value = 1
  getReflectance()
}
// 查询
function getReflectance () {
  const loadingInstance = ElLoading.service(loadingoptions)
  findReflectanceByTime({
    time: searchInfo.value.dateSelected,
    filepath: searchInfo.value.filepath,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      //   console.log(result)
      if (result.code === 'SUCCESS') {
        tableData.value = []
        tableDeviceName.value = []
        wavaDataList.value = []
        result.body.records.forEach((item) => {
          const wavelengths = item.wavelength // 波长大小
          const filepath = item.filepath // 文件名
          // 首先，使用 split 方法将字符串按逗号分隔成一个数组
          const idArray = item.id.split(',') // 反射波id数组
          // 然后，使用 join 方法将数组元素用短横线连接起来
          const idStringWithHyphens = idArray.join('-') // id
          const deviceNames = item.deviceId.split(',') // 当前的站点名称数组
          const wavaDataNum = item.data.split(',').map(Number) // 当前的反射波数据数组
          tableDeviceName.value = deviceNames
          const obj = {
            tableWave: wavelengths,
            tableId: idStringWithHyphens,
            fileName: filepath,
            observationTime: item.observationTime
          }
          deviceNames.forEach((deName, idx) => {
            obj['data-' + deName] = wavaDataNum[idx]
          })
          tableData.value.push(obj)
          isButtonDelDisabled.value = true
        })
        // console.log(tableData)
        currentPage.value = result.body.current
        totalItems.value = result.body.total
        pageSize.value = result.body.size
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
  getReflectance()
}

function handleCurrentChange (val) {
  currentPage.value = val
  if (totalItems.value === 0) {
    return
  }
  getReflectance()
}

function handleSelectionChange (val) {
  // 多选框变化时执行
  const list = []
  for (let i = 0; i < val.length; i++) {
    list.push(val[i].tableId)
  }
  selectedRows.value = list
  // console.log(selectedRows.value)
}

// 单行删除
function confirmDeleteRow (row, index) {
  ElMessageBox.confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteSpeDataById({
        ids: [row.tableId]
      })
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getReflectance()
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

// 批量删除
function deleteSelectedRows () {
  // 或者使用展开运算符（更现代且简洁的方式）
  const requestObject = { ...searchInfo.value }
  if (
    selectedRows.value.length === 0 &&
    (requestObject.dateSelected === '' ||
      requestObject.dateSelected === null) &&
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
      // console.log(requestObject)
      // const idsToDelete = selectedRows.value.flatMap((row) => row.ids).join(',')
      // const data = new FormData()
      // data.append('ids', idsToDelete)
      deleteSpeDataById(requestObject)
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getReflectance()
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

.header-container {
  display: flex;
  align-items: center;
}

.searchButton {
  background-color: aliceblue;
}
</style>
