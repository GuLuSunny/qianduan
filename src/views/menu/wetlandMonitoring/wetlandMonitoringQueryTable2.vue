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
                handleVisibleChange(visibility, 'shidizhibei', 'month')
            "
            :disabled-date="
              (time) => disabledDate(time, 'shidizhibei', 'month')
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
                handleVisibleChange(visibility, 'shidizhibei', 'year')
            "
            :disabled-date="(time) => disabledDate(time, 'shidizhibei', 'year')"
          >
          </el-date-picker>
          <el-button @click="changeWayButton">
            {{ curWay }}
          </el-button>
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
        prop="investigation_time"
        label="日期"
        width="100"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="vegetation_species"
        label="植被物种"
        width="auto"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="leaf_area_index"
        label="叶面积指数"
        width="auto"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="phenological_index"
        label="物候指数(%)"
        width="auto"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="vegetation_moisture_content"
        label="植物含水量(mg/g)"
        width="auto"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="chlorophyll_content"
        label="叶绿素含量(g/m²)"
        width="auto"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="biomass"
        label="生物量(kg)"
        width="auto"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="carbon_nitrogen_ratio"
        label="碳氮比"
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
import { ElMessageBox, ElMessage , ElLoading } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import {
  getPlantPageQuery,
  deletePlantSoilId,
  getTimesByType
} from '@/api/getData'

const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const isButtonDelDisabled = ref(false)
const selectedRows = ref([])
const tableData = ref([])
const curWay = ref('切换月')
const searchInfo = ref({
  observationTime: '',
  type: 1 // 1 为年， 2 为月
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
      searchButton()
    })
  }
})
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
watch(
  () => searchInfo.value.type,
  (newType) => {
    searchInfo.value.observationTime = ''
  }
)

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

function handleInputChange () {
  isButtonDelDisabled.value = false
}

function searchButton () {
  currentPage.value = 1
  getWaterLevelData()
}

function getWaterLevelData () {
  const loadingInstance = ElLoading.service(loadingoptions)
  getPlantPageQuery({
    observationTime: searchInfo.value.observationTime,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  })
    .then((res) => {
      loadingInstance.close()
      const result = res.response.value
      if (result.code === 'SUCCESS') {
        tableData.value = result.body.records.map((item) => ({
          ...item
        }))
        console.log(tableData.value)
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
  getWaterLevelData()
}

function handleCurrentChange (val) {
  currentPage.value = val
  if (totalItems.value === 0) return
  getWaterLevelData()
}

function handleSelectionChange (val) {
  selectedRows.value = val.map((row) => row.id)
}

function confirmDeleteRow (row) {
  ElMessageBox.confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deletePlantSoilId({
        ids: [row.id]
      })
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getWaterLevelData()
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

function deleteSelectedRows () {
  const requestObject = { ...searchInfo.value }
  if (
    selectedRows.value.length === 0 &&
    (requestObject.observationTime === '' ||
      requestObject.observationTime === null)
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
    `此操作将永久删除选中的 ${selectedRows.value.length===0?totalItems.value:selectedRows.value.length}  条数据, 是否继续?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      requestObject.ids = selectedRows.value
      deletePlantSoilId(requestObject)
        .then((res) => {
          if (res.response.value.code === 'SUCCESS') {
            getWaterLevelData()
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
