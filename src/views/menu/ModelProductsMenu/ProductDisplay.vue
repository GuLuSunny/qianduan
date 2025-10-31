<template>
  <div class="container">
    <!-- 表单部分 -->
    <div class="row">
      <el-form-item label="产品名称:">
        <el-input v-model="filename" placeholder="请输入产品名称" clearable />
      </el-form-item>
      <el-form-item label="所有者:">
        <el-input v-model="owner" placeholder="请输入所有者" clearable />
      </el-form-item>
      <el-form-item label="产品分类:">
        <el-select v-model="selectedClass" placeholder="请选择" clearable>
          <el-option v-for="classItem in classOptions" :key="classItem.value" 
            :value="classItem.value" :label="classItem.label" />
        </el-select>
      </el-form-item>
      <!-- 日期选择器 -->
      <el-form-item label="观测日期:">
        <el-date-picker
          v-model="observationDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          clearable
        />
      </el-form-item>
      <!-- 搜索按钮 -->
      <el-form-item>
        <el-button @click="searchProducts" class="searchButton" type="primary">
          <el-icon>
            <Search />
          </el-icon>
          搜索
        </el-button>
      </el-form-item>
    </div>
    <!-- 图片展示部分 -->
    <div class="image-grid" v-if="currentImageIndex === null">
      <div class="image-item" v-for="(product, index) in productList" :key="index">
        <!-- 修复：使用缓存的图片URL，避免递归 -->
        <img v-if="isImage(product.type) && imageUrlCache[product.id]" 
             :src="imageUrlCache[product.id]" 
             alt="产品图片" 
             @click="showDetail(index)" />
        <div v-else-if="isImage(product.type)" class="image-placeholder">
          <el-icon size="60"><Picture /></el-icon>
          <p>加载中...</p>
        </div>
        <div v-else class="file-icon" @click="showDetail(index)">
          <el-icon size="80"><Document /></el-icon>
          <p>{{ product.type }} 文件</p>
        </div>
        <p>{{ product.filename }}</p>
        <el-button @click="showDetail(index)">详情</el-button>
        <el-button @click="downloadFile(product)" type="primary">下载</el-button>
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
      <h2 class="title">{{ productDetail.filename }}</h2>
      <div class="detail-content">
        <div class="image-container">
          <!-- 修复：详情页也使用缓存 -->
          <el-image v-if="isImage(productDetail.type) && imageUrlCache[productDetail.id]"
            :src="imageUrlCache[productDetail.id]" 
            alt="产品图片" 
            class="product-image" 
            lazy />
          <div v-else-if="isImage(productDetail.type)" class="image-placeholder-large">
            <el-icon size="120"><Picture /></el-icon>
            <p>加载中...</p>
          </div>
          <div v-else class="file-icon-large">
            <el-icon size="120"><Document /></el-icon>
            <p>{{ productDetail.type }} 文件</p>
          </div>
        </div>
        <div class="info-section">
          <h3>基本信息</h3>
          <p class="info-text">
            文件名称: {{ productDetail.filename }}
          </p>
          <p class="info-text">
            所有者: {{ productDetail.owner }}
          </p>
          <p class="info-text">
            产品分类: {{ productDetail.className }}
          </p>
          <p class="info-text">
            文件类型: {{ productDetail.type }}
          </p>
          <p class="info-text">
            观测时间: {{ productDetail.observationTime }}
          </p>
          <p class="info-text">
            开始时间: {{ productDetail.startTime }}
          </p>
          <p class="info-text">
            结束时间: {{ productDetail.endTime }}
          </p>
        </div>
        <div class="actions">
          <el-button @click="downloadFile(productDetail)" type="primary" size="large">下载文件</el-button>
        </div>
      </div>
      <el-button @click="goBack" class="return-button">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProductPageData, getModelClassName, getFilesByConditions, getTimesByType } from '@/api/getData'
import { Search, Document, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'

// 基本数据
const filename = ref('')
const owner = ref('')
const selectedClass = ref('')
const observationDate = ref('')
const currentImageIndex = ref(null)

// 分类数据
const classNames = ref([])
const showDateArr = ref([])

// 修复：计算分类选项，正确处理"所有"选项
const classOptions = computed(() => [
  { label: '所有', value: '' },
  ...classNames.value.map(item => ({ label: item, value: item }))
])

// 分页数据
const currentPage = ref(1)
const itemsPerPage = ref(8)
const totalItems = ref(0)

// 产品列表数据
const productList = ref([])
const productDetail = ref({})

// 修复：图片URL缓存 - 使用对象存储，避免递归
const imageUrlCache = ref({})
// 正在加载的图片ID集合，避免重复请求
const loadingImages = ref(new Set())

const loadingOptions = {
  lock: true,
  text: '数据加载中...',
  background: 'rgba(0, 0, 0, 0.7)'
}

// 判断是否为图片文件
const isImage = (fileType) => {
  const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
  return imageTypes.includes(fileType?.toLowerCase())
}

// 修复：预加载图片，避免在模板中递归调用
const preloadImages = (products) => {
  products.forEach(product => {
    if (isImage(product.type) && product.id && !imageUrlCache.value[product.id] && !loadingImages.value.has(product.id)) {
      loadingImages.value.add(product.id)
      fetchImageFromApi(product)
    }
  })
}

// 通过接口获取图片
const fetchImageFromApi = (product) => {
  getFilesByConditions({
    ids: [product.id]
  })
    .then((res) => {
      const blob = new Blob([res])
      const url = window.URL.createObjectURL(blob)
      // 直接更新缓存，不触发响应式更新
      imageUrlCache.value[product.id] = url
      loadingImages.value.delete(product.id)
    })
    .catch((error) => {
      console.error('获取图片失败:', error)
      loadingImages.value.delete(product.id)
    })
}

// 可用日期处理
function disabledDate(time) {
  if (!showDateArr.value || showDateArr.value.length === 0) {
    return false
  }
  const dateString = `${time.getFullYear()}-${(time.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`
  return !showDateArr.value.includes(dateString)
}

// 获取可用日期
function fetchAvailableDates() {
  getTimesByType({
    type: 'modelproducts',
    searchTimeType: 'day'
  })
    .then((res) => {
      const result = res.response?.value || res
      if (result.code === 'SUCCESS') {
        showDateArr.value = result.body?.date || []
      } else {
        ElMessage.warning(result.msg || '获取日期数据失败')
      }
    })
    .catch((error) => {
      console.error('获取日期数据失败:', error)
    })
}

function fetchAllProducts() {
  const loadingInstance = ElLoading.service(loadingOptions)
  
  const params = {
    filename: filename.value,
    owner: owner.value,
    className: selectedClass.value === '' ? null : selectedClass.value,
    observationTime: observationDate.value || null,
    currentPage: currentPage.value,
    pageSize: itemsPerPage.value
  }
  
  getProductPageData(params)
    .then((res) => {
      loadingInstance.close()
      const response = res.response?.value || res
      if (response.code === 'SUCCESS') {
        const body = response.body
        productList.value = body.records || []
        totalItems.value = body.total || 0
        
        // 修复：预加载图片，避免在模板中递归调用
        preloadImages(productList.value)
      } else {
        ElMessage.warning(response.msg || '获取产品数据失败')
      }
    })
    .catch((error) => {
      loadingInstance.close()
      console.error('获取产品数据失败:', error)
      ElMessage.error('获取产品数据失败，请稍后再试')
    })
}

// 显示详情
function showDetail(index) {
  currentImageIndex.value = index
  productDetail.value = productList.value[index]
  
  // 确保详情图片已加载
  if (isImage(productDetail.value.type) && productDetail.value.id && 
      !imageUrlCache.value[productDetail.value.id] && 
      !loadingImages.value.has(productDetail.value.id)) {
    loadingImages.value.add(productDetail.value.id)
    fetchImageFromApi(productDetail.value)
  }
}

// 返回列表
function goBack() {
  currentImageIndex.value = null
}

// 搜索时重置分页但不强制返回
function searchProducts() {
  currentPage.value = 1
  fetchAllProducts()
}

// 分页功能
function goToPage(page) {
  currentPage.value = page
  fetchAllProducts()
}

// 修改每页显示记录数
function changePageSize(newSize) {
  itemsPerPage.value = newSize
  currentPage.value = 1
  fetchAllProducts()
}

// 下载文件
function downloadFile(product) {
  const loadingInstance = ElLoading.service(loadingOptions)
  getFilesByConditions({
    ids: [product.id]
  })
    .then((res) => {
      loadingInstance.close()
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', product.filename)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
      ElMessage({
        showClose: true,
        message: '下载成功',
        center: true,
        type: 'success'
      })
    })
    .catch((error) => {
      loadingInstance.close()
      ElMessage.error('下载失败，请稍后再试')
    })
}

// 获取产品分类数据
function fetchClassNames() {
  getModelClassName()
    .then((res) => {
      const response = res.response?.value || res
      if (response.code === 'SUCCESS') {
        classNames.value = response.body || []
        fetchAvailableDates()
        fetchAllProducts()
      } else {
        ElMessage.error('获取分类数据失败: ' + (response.msg || '未知错误'))
      }
    })
    .catch((error) => {
      console.error('请求失败:', error)
      ElMessage.error('请求失败: ' + error.message)
    })
}

onMounted(() => {
  fetchClassNames()
})
</script>

<style scoped>
/* 优化样式 */
.container {
  position: relative;
  width: 100%;
  min-height: 500px;
  padding: 20px;
  box-sizing: border-box;
}

.row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 20px;
  gap: 16px;
}

.el-form-item {
  margin-bottom: 0;
  width: auto;
  min-width: 200px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 10px;
}

.image-item {
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  text-align: center;
  padding: 10px;
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
}

.file-icon {
  padding: 20px;
  cursor: pointer;
}

.file-icon-large {
  text-align: center;
  padding: 40px;
}

.image-placeholder {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.image-placeholder-large {
  text-align: center;
  padding: 80px 40px;
  color: #999;
}

.detail-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.detail-content {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  width: 100%;
  gap: 40px;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.product-image {
  width: 450px;
  height: auto;
}

.info-text {
  font-size: 16px;
  margin: 10px 0;
}

.info-section {
  flex: 1;
  text-align: left;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title {
  margin: 10px 0;
  font-size: 32px;
  text-align: center;
  width: 100%;
}

.return-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.searchButton {
  background-color: aliceblue;
}
</style>