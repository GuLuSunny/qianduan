<template>
  <div class="container">
    <!-- 表单部分 -->
    <div class="row">
      <el-form-item label="水鸟名称:">
        <el-input v-model="input" placeholder="请输入水鸟名称" clearable />
      </el-form-item>
      <el-form-item label="所属目名:">
        <el-select v-model="selectedOrder" placeholder="请选择" :empty-values="[null, undefined]">
          <el-option v-for="order in [{ id: '', name: '所有' }, ...orders]" :key="order.id" :value="order.id"
            :label="order.name">
            {{ order.name }}
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属科名:">
        <el-select v-model="selectedFamily" placeholder="请选择" :empty-values="[null, undefined]">
          <el-option v-for="family in [{id: '', name: '所有'}, ...filteredFamilies]" :key="family.id" :value="family.id" :label="family.name">{{
            family.name }}</el-option>
        </el-select>
      </el-form-item>
      <!-- 搜索按钮 -->
      <el-form-item>
        <el-button @click="searchBird" class="searchButton">
          <el-icon>
            <Search />
          </el-icon>
          搜索
        </el-button>
      </el-form-item>
    </div>
    <!-- 图片展示部分 -->
    <div class="image-grid" v-if="currentImageIndex === null">
      <div class="image-item" v-for="(image, index) in birdDetailsList" :key="index">
        <img :src="image.filepath" alt="图片描述" />
        <p>{{ image.speciesName }}</p>
        <el-button @click="showDetail(index)">详情</el-button>
      </div>
    </div>

    <!-- 分页控件 -->
    <div v-if="currentImageIndex === null" class="pagination">
      <el-pagination :current-page="currentPage" :page-size="itemsPerPage" :total="totalItems" :page-sizes="[8, 16, 32]"
        layout="total, sizes, prev, pager, next, jumper" @current-change="goToPage" @size-change="changePageSize"
        class="pagination" />
    </div>

    <!-- 详情视图 -->
    <div v-if="currentImageIndex !== null" class="detail-view">
      <h2 class="title">{{ birdDetailsClicked.speciesName }}</h2>
      <div class="detail-content">
        <div class="image-container">
          <el-image :key="birdDetailsClicked.filepath"
            :src="birdDetailsClicked.filepath" alt="水鸟图片" class="bird-image" lazy />
        </div>
        <div class="info-section">
          <h3>基本信息</h3>
          <p class="info-text">
            中文名称: {{ birdDetailsClicked.speciesName }}
          </p>
          <p class="info-text">
            拉丁学名: {{ birdDetailsClicked.birdLatin }}
          </p>
          <p class="info-text">
            居留型: {{ birdDetailsClicked.birdType }}
          </p>
          <p class="info-text">
            保护级别: {{ birdDetailsClicked.birdEPI }}
          </p>
          <p class="info-text">
            目名: {{ birdDetailsClicked.orderName }}
          </p>
          <p class="info-text">
            科名: {{ birdDetailsClicked.familyName }}
          </p>
        </div>
        <div class="habitat">
          <h3>形态特征</h3>
          <div v-html="birdDetailsClicked.birdFeature"></div>
          <h3>生活习性</h3>
          <div v-html="birdDetailsClicked.birdLive"></div>
        </div>
      </div>
      <el-button @click="goBack" class="return-button">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { getBirdPageData, getBirdData } from '@/api/getData'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
// 基本数据
const input = ref('')
const selectedOrder = ref('')
const selectedFamily = ref('')
const currentImageIndex = ref(null)

// 目名数据
const orders = ref([]) // 存储从后端获取的目名数据

// 科名数据
const birdFamilies = ref({}) // 存储目名对应的科名数据
const orderIdToName = ref({})
const groups = ref([])
const birdSpeciesMap = ref({})
// 当前页码
const currentPage = ref(1)
// 每页显示的图片数
const itemsPerPage = ref(8)
// 总记录数
const totalItems = ref(0)
// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage.value)
})
// 鸟类详细信息
const birdDetailsList = ref([]) // 存储鸟类的详细信息
const birdDetailsClicked = ref({}) // 存储当前点击的鸟类的详细信息
const loadingoptions = {
  // 加载配置
  target: '.layoutLoading',
  background: 'rgba(0, 0, 0, 0.7)',
  text: '数据加载中...'
}
// 获取所有分页数据
function fetchAllBirds() {
  const loadingInstance = ElLoading.service(loadingoptions)
  getBirdPageData({
    speciesName: input.value,
    orderId: selectedOrder.value === '' ? null : selectedOrder.value,
    familyId: selectedFamily.value === '' ? null : selectedFamily.value,
    currentPage: currentPage.value,
    pageSize: itemsPerPage.value
  })
    .then((res) => {
      loadingInstance.close()
      const response = res.response.value
      if (response.code === 'SUCCESS') {
        const body = response.body
        birdDetailsList.value = body.records
        totalItems.value = body.total
      } else {
        ElMessage({ showClose: true, message: result.msg, center: true })
      }
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage.error('获取水鸟数据失败，请稍后再试')
    })
}

const filteredFamilies = computed(() => {
  if (selectedOrder.value === '') {
    return [...new Set(Object.values(birdFamilies.value).flat())]
  }
  return [
    ...(birdFamilies.value[orderIdToName.value[selectedOrder.value]] || [])
  ]
})

watch(filteredFamilies, (newData) => {
  selectedFamily.value = ''
})

// 点击详情按钮时触发
function showDetail(index) {
  currentImageIndex.value = index
  birdDetailsClicked.value = birdDetailsList.value[index]
}

function searchBird() {
  currentPage.value = 1
  fetchAllBirds()
  goBack();
}

// 返回图片展示部分
function goBack() {
  currentImageIndex.value = null
}

// 分页功能
function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchAllBirds()
}

// 修改每页显示记录数
function changePageSize(newSize) {
  itemsPerPage.value = newSize // 修改 itemsPerPage 的值时使用 `.value`
  currentPage.value = 1 // 重置到第一页
  fetchAllBirds()
}

// 获取鸟类目、科、种数据
function fetchBirdOrders() {
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
        fetchAllBirds()
      } else {
        ElMessage.error('获取水鸟数据失败: ' + response.msg)
      }
    })
    .catch((error) => {
      console.error('请求失败:', error)
      ElMessage.error('请求失败: ' + error.message)
    })
}
onMounted(() => {
  fetchBirdOrders()
})
</script>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
}

.row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  margin-left: 1%;
}

.el-form-item {
  margin-right: 20px;
  width: 250px;
}

.form-group label {
  margin-right: 0px;
}

.form-grid-group {
  display: grid;
  grid-template-columns: repeat(4, auto);
  /* 设置列，每列的宽度自适应 */
  gap: 10px;
  /* 设置元素间距 */
  align-items: center;
  /* 垂直居中对齐 */
  margin-bottom: 20px;
}

.form-group {
  display: grid;
  grid-template-columns: 80px 1fr;
  /* 标签宽度为120px，输入框宽度为剩余空间 */
  gap: 10px;
}

.form-group input,
.form-group select {
  width: 100%;
  /* 调整输入框和选择框的宽度 */
  height: 30px;
  /* 调整高度 */
  padding: 5px;
  box-sizing: border-box;
}

.form-group button {
  height: 30px;
  /* 调整按钮高度 */
  padding: 5px 8px;
  /* 调整按钮内边距 */
  margin-left: 10px;
}

.search-button {
  display: flex;
  align-items: center;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px;
}

.image-item {
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  text-align: center;
}

.image-item img {
  width: 100%;
  height: 250px;
}

.detail-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  transform: translateX(100px);
  /* 向右移动20px */
}

.left-panel {
  flex: 1;
  /* 左侧占据1份 */
  text-align: center;
  /* 中心对齐 */
}

.middle-panel {
  flex: 1;
  /* 中间占据1份 */
  text-align: left;
  /* 左对齐 */
}

.right-panel {
  flex: 1;
  /* 右侧占据1份 */
  text-align: left;
  /* 左对齐 */
}

.detail-content {
  display: flex;
  align-items: center;
  /* 垂直居中对齐 */
  margin-bottom: 20px;
  width: 100%;
  /* 确保内容占满宽度 */
}

.image-container {
  display: flex;
  justify-content: center;
  /* 水平居中对齐 */
  align-items: center;
  /* 垂直居中对齐 */
  margin-right: 20px;
  height: 100%;
  /* 确保容器有高度 */
}

.bird-image {
  width: 450px;
  /* 设置鸟类图片宽度 */
  height: auto;
  /* 保持长宽比 */
}

.description {
  max-width: 300px;
  /* 描述最大宽度 */
  text-align: left;
  /* 左对齐文本 */
}

.info-text {
  font-size: 20px;
  /* 增大基本信息的字体 */
}

.info-section {
  flex: 0 0 20%;
  /* 设置中间部分占 25% 的宽度 */
  text-align: left;
}

.habitat {
  max-width: 400px;
  /* 栖息地部分最大宽度 */
  text-align: left;
  /* 左对齐文本 */
  margin-top: 20px;
  /* 栖息地部分上方间距 */
}

.title {
  margin: 10px 0;
  /* 上下边距 */
  margin-left: -300px;
  /* 向左移动10px */
  font-size: 40px;
  /* 字体大小 */
  text-align: center;
  /* 左对齐 */
}

.detail-content img {
  width: 100%;
  /* 设置图片宽度 */
  max-width: 400px;
  /* 最大宽度 */
  height: auto;
}

.detail-view img {
  width: 100%;
  /* 设置图片宽度 */
  max-width: 400px;
  /* 最大宽度 */
  height: auto;
}

.search-button {
  background-color: #1890ff;
  /* 设置背景色为蓝色 */
  color: white;
  /* 设置文本颜色为白色 */
  border: none;
  /* 去掉边框 */
  padding: 5px 10px;
  /* 调整内边距 */
  cursor: pointer;
  /* 鼠标悬停时显示为指针 */
}

.return-button {
  margin-top: 20px;
  transform: translateX(-160px);
  /* 向左移动 */
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  cursor: pointer;
}

.habitat h3 {
  font-size: 1.5em;
  /* 增加标题的字体大小 */
}

.habitat div {
  font-size: 20px;
  /* 增加内容的字体大小 */
}

.info-section h3 {
  font-size: 25px;
  /* 增加基本信息标题的字体大小 */
}

.pagination {
  display: flex;
  /* 启用 flexbox 布局 */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中（可选） */
  padding: 20px;
  /* 设置内边距 */
}

.searchButton {
  background-color: aliceblue;
}

.searchButton {
  display: inline-block;
  /* 搜索按钮保持在同一行 */
  background-color: aliceblue;
  padding: 5px 10px;
  /* 调整按钮内边距 */
  cursor: pointer;
  /* 鼠标悬停时显示为指针 */
}
</style>
